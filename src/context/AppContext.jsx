import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import * as api from '../lib/api';

const AppContext = createContext(null);

// Helper: format a post row from Supabase into our UI shape
function formatPost(row) {
  const author = row.author || {};
  const initials = (author.display_name || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const signalLabels = { breaking: { label: 'BREAKING', status: 'live' }, sitrep: { label: 'SITREP', status: 'pending' }, confirmed: { label: 'CONFIRMED', status: 'verified' }, osint: { label: 'OSINT', status: 'info' }, analysis: { label: 'ANALYSIS', status: 'info' } };
  const ageMs = Date.now() - new Date(row.created_at);
  const ageMins = Math.floor(ageMs / 60000);
  const time = ageMins < 1 ? 'just now' : ageMins < 60 ? `${ageMins}m` : ageMins < 1440 ? `${Math.floor(ageMins / 60)}h` : `${Math.floor(ageMins / 1440)}d`;
  return {
    id: row.id,
    author: { id: author.id, name: author.display_name || 'Anonymous', handle: `@${author.handle || 'unknown'}`, ci_score: author.ci_score || 0, initials, is_sector_analyst: author.is_sector_analyst || false },
    body: row.body,
    signal_type: row.signal_type,
    tag: signalLabels[row.signal_type] || { label: row.signal_type?.toUpperCase(), status: 'info' },
    time,
    mark_count: row.mark_count || 0,
    amplify_count: row.amplify_count || 0,
    reply_count: row.reply_count || 0,
    is_marked: false,
    is_amplified: false,
    replies: [],
    image: (row.media_urls || [])[0] || null,
  };
}

export function AppProvider({ children }) {
  // ---- Auth state ----
  const [session, setSession] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // ---- App state ----
  const [hasOnboarded, setHasOnboarded] = useState(() => localStorage.getItem('qila_onboarded') === 'true');
  const [posts, setPosts] = useState([]);
  const [channels, setChannels] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [bunkers, setBunkers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showCompose, setShowCompose] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [crisisMode] = useState(true);
  const [newToastCount, setNewToastCount] = useState(0);
  const realtimeRef = useRef(null);

  // ---- Bootstrap auth ----
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) loadProfile(session.user.id);
      else setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) loadProfile(session.user.id);
      else { setCurrentUser(null); setAuthLoading(false); setPosts([]); setChannels([]); setNotifications([]); }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function loadProfile(userId) {
    try {
      const basic = await api.getProfile(userId);
      const full = await api.fetchFullProfile(basic.handle, session.access_token);
      
      const userObj = { 
        ...basic, 
        ...full,
        initials: (full.display_name || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() 
      };
      setCurrentUser(userObj);
      // Load real data 
      loadWirePosts(userObj);
      loadChannels();
      loadBunkers();
      loadNotifications(userId);
      subscribeRealtime(userId);
    } catch (err) {
      console.error('Profile load failed:', err.message);
    } finally {
      setAuthLoading(false);
    }
  }

  async function loadWirePosts(profile) {
    try {
      const rows = await api.fetchWirePosts({ limit: 30 });
      const formatted = rows.map(formatPost);
      // Enrich with marks
      if (profile?.id && formatted.length > 0) {
        const markedSet = await api.getMarkedPostIds(profile.id, formatted.map(p => p.id));
        formatted.forEach(p => { p.is_marked = markedSet.has(p.id); });
      }
      setPosts(formatted);
    } catch (err) {
      console.error('Wire posts load failed:', err.message);
    }
  }

  async function loadChannels() {
    try {
      const rows = await api.fetchChannels();
      setChannels(rows.map(ch => ({
        id: ch.id, name: ch.name, slug: ch.slug, sector: ch.name,
        unread: 0, time: '', last_message: '', is_crisis: ch.is_crisis || false, messages: [],
      })));
    } catch (err) {
      console.error('Channels load failed:', err.message);
    }
  }

  async function loadBunkers() {
    try {
      // Direct call to our backend
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/bunkers`, {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      const data = await response.json();
      setBunkers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Bunkers load failed:', err.message);
    }
  }

  async function loadNotifications(userId) {
    try {
      const rows = await api.fetchNotifications(userId);
      setNotifications(rows.map(n => ({
        id: n.id, type: n.type, is_read: n.is_read,
        actor: n.actor ? { name: n.actor.display_name, initials: (n.actor.display_name || 'U')[0].toUpperCase(), ci_score: n.actor.ci_score } : null,
        body: n.body || '', excerpt: '', time: formatTime(n.created_at),
      })));
    } catch (err) {
      console.error('Notifications load failed:', err.message);
    }
  }

  function subscribeRealtime(userId) {
    if (realtimeRef.current) api.unsubscribe(realtimeRef.current);

    realtimeRef.current = api.subscribeToWire((event, payload) => {
      if (event === 'new_post') {
        const post = formatPost(payload);
        setPosts(prev => [{ ...post, isNew: true }, ...prev]);
        setNewToastCount(prev => prev + 1);
        setTimeout(() => setPosts(prev => prev.map(p => p.id === post.id ? { ...p, isNew: false } : p)), 1000);
      } else if (event === 'post_updated') {
        setPosts(prev => prev.map(p => p.id === payload.id ? { ...p, mark_count: payload.mark_count, amplify_count: payload.amplify_count, reply_count: payload.reply_count } : p));
      }
    });

    api.subscribeToNotifications(userId, (notif) => {
      setNotifications(prev => [{ 
        id: notif.id, type: notif.type, is_read: false, 
        actor: null, body: notif.body || '', excerpt: '', time: 'just now' 
      }, ...prev]);
    });
  }

  function formatTime(ts) {
    const ageMs = Date.now() - new Date(ts);
    const ageMins = Math.floor(ageMs / 60000);
    return ageMins < 1 ? 'just now' : ageMins < 60 ? `${ageMins}m` : ageMins < 1440 ? `${Math.floor(ageMins / 60)}h` : `${Math.floor(ageMins / 1440)}d`;
  }

  const completeOnboarding = useCallback(() => {
    localStorage.setItem('qila_onboarded', 'true');
    setHasOnboarded(true);
  }, []);

  // ---- ACTIONS ----

  const addPost = useCallback(async (newPost) => {
    const signalLabels = { breaking: { label: 'BREAKING', status: 'live' }, sitrep: { label: 'SITREP', status: 'pending' }, confirmed: { label: 'CONFIRMED', status: 'verified' }, osint: { label: 'OSINT', status: 'info' }, analysis: { label: 'ANALYSIS', status: 'info' } };

    // Optimistic UI
    const optimistic = {
      id: `optimistic-${Date.now()}`,
      author: currentUser ? { 
        id: currentUser.id, name: currentUser.display_name, handle: `@${currentUser.handle}`, 
        ci_score: currentUser.ci_score, initials: currentUser.initials, is_sector_analyst: currentUser.is_sector_analyst 
      } : { name: 'You', handle: '@you', ci_score: 0, initials: 'Y' },
      body: newPost.body, signal_type: newPost.signal_type,
      tag: signalLabels[newPost.signal_type] || { label: newPost.signal_type.toUpperCase(), status: 'info' },
      time: 'just now', mark_count: 0, amplify_count: 0, reply_count: 0,
      is_marked: false, is_amplified: false, replies: [], isNew: true,
    };
    setPosts(prev => [optimistic, ...prev]);
    setTimeout(() => setPosts(prev => prev.map(p => p.id === optimistic.id ? { ...p, isNew: false } : p)), 1000);

    if (session?.user) {
      try {
        const saved = await api.createPost({ body: newPost.body, signalType: newPost.signal_type, authorId: session.user.id });
        setPosts(prev => prev.map(p => p.id === optimistic.id ? { ...formatPost(saved), isNew: false } : p));
      } catch (err) {
        console.error('Post save failed:', err.message);
      }
    }
  }, [session, currentUser]);

  const toggleMark = useCallback(async (postId) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      return { ...p, is_marked: !p.is_marked, mark_count: p.is_marked ? p.mark_count - 1 : p.mark_count + 1 };
    }));
    if (session?.user) {
      const post = posts.find(p => p.id === postId);
      try {
        if (post?.is_marked) await api.unmarkPost(session.user.id, postId);
        else await api.markPost(session.user.id, postId);
      } catch (err) { console.error('Mark failed:', err.message); }
    }
  }, [session, posts]);

  const toggleAmplify = useCallback(async (postId) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      return { ...p, is_amplified: !p.is_amplified, amplify_count: p.is_amplified ? p.amplify_count - 1 : p.amplify_count + 1 };
    }));
    // TODO: persist amplify via backend
  }, []);

  const addReply = useCallback(async (postId, body) => {
    const reply = {
      id: `reply-${Date.now()}`,
      author: currentUser ? { 
        id: currentUser.id, name: currentUser.display_name, handle: `@${currentUser.handle}`, 
        ci_score: currentUser.ci_score, initials: currentUser.initials 
      } : { name: 'You', handle: '@you', ci_score: 0, initials: 'Y' },
      body, time: 'just now', mark_count: 0, is_marked: false,
    };
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, reply_count: p.reply_count + 1, replies: [...(p.replies || []), reply] } : p));
    if (session?.user) {
      try {
        await api.createPost({ body, signalType: 'analysis', replyToId: postId, authorId: session.user.id });
      } catch (err) { console.error('Reply save failed:', err.message); }
    }
  }, [session, currentUser]);

  const sendMessage = useCallback(async (channelId, body) => {
    const message = {
      id: `m-${Date.now()}`,
      author: currentUser ? { 
        id: currentUser.id, name: currentUser.display_name, handle: `@${currentUser.handle}`, 
        ci_score: currentUser.ci_score, initials: currentUser.initials 
      } : { name: 'You', initials: 'Y', ci_score: 0 },
      body, message_type: 'text',
      time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      is_pinned: false, is_mine: true,
    };
    setChannels(prev => prev.map(ch => ch.id === channelId ? { ...ch, messages: [...(ch.messages || []), message], unread: 0 } : ch));

    if (session?.user) {
      try {
        await api.sendMessage({ channelId, authorId: session.user.id, body });
      } catch (err) { console.error('Message save failed:', err.message); }
    }
  }, [session, currentUser]);

  const loadChannelMessages = useCallback(async (channelId) => {
    try {
      const msgs = await api.fetchMessages(channelId);
      const formatted = msgs.map(m => ({
        id: m.id, body: m.body, message_type: m.message_type, is_pinned: m.is_pinned, pin_status: m.pin_status,
        is_mine: m.author_id === session?.user?.id,
        time: new Date(m.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        author: { 
          id: m.author?.id, name: m.author?.display_name || 'Unknown', 
          handle: `@${m.author?.handle || 'unknown'}`, ci_score: m.author?.ci_score || 0, 
          initials: (m.author?.display_name || 'U')[0].toUpperCase() 
        },
      }));
      setChannels(prev => prev.map(ch => ch.id === channelId ? { ...ch, messages: formatted } : ch));
    } catch (err) { console.error('Messages load failed:', err.message); }
  }, [session]);

  const toggleFollowSector = useCallback(async (slug) => {
    setSectors(prev => prev.map(s => s.slug === slug ? { ...s, is_following: !s.is_following } : s));
    if (session?.user) {
      const sector = sectors.find(s => s.slug === slug);
      try {
        if (sector?.is_following) await api.unfollowSector(session.user.id, slug);
        else await api.followSector(session.user.id, slug);
      } catch (err) { console.error('Follow sector failed:', err.message); }
    }
  }, [session, sectors]);

  const markAllNotificationsRead = useCallback(async () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    if (session?.user) {
      try { await api.markAllNotificationsRead(session.user.id); } catch {}
    }
  }, [session]);

  const signIn = useCallback(async (email, password) => {
    return api.signIn({ email, password });
  }, []);

  const signOut = useCallback(async () => {
    await api.signOut();
    setCurrentUser(null);
    setSession(null);
    setPosts([]);
    setChannels([]);
    setNotifications([]);
  }, []);

  const unreadNotifCount = notifications.filter(n => !n.is_read).length;

  return (
    <AppContext.Provider value={{
      // Auth
      session, currentUser, authLoading, 
      signIn, signOut,
      // App state
      hasOnboarded, completeOnboarding,
      posts, setPosts,
      channels, setChannels,
      sectors, setSectors,
      bunkers,
      notifications,
      showCompose, setShowCompose,
      showNotifications, setShowNotifications,
      crisisMode,
      newToastCount, setNewToastCount,
      unreadNotifCount,
      // Actions
      addPost, toggleMark, toggleAmplify, addReply,
      sendMessage, loadChannelMessages,
      toggleFollowSector,
      markAllNotificationsRead,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
