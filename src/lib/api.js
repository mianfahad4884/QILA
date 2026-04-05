import { supabase } from './supabase';

// =============================================
// AUTH
// =============================================

export async function signUp({ email, password, username, displayName, handle }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        display_name: displayName,
        handle: handle.toLowerCase(),
      },
    },
  });
  if (error) throw error;
  return data;
}

export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// =============================================
// PROFILE
// =============================================

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}

export async function fetchFullProfile(handle, token) {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${handle}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error);
  return data;
}

export async function getProfileByHandle(handle) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .ilike('handle', handle)
    .single();
  if (error) throw error;
  return data;
}

export async function updateProfile(userId, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function uploadAvatar(userId, file) {
  const ext = file.name.split('.').pop();
  const path = `avatars/${userId}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from('qila-media')
    .upload(path, file, { upsert: true });
  if (uploadError) throw uploadError;
  const { data } = supabase.storage.from('qila-media').getPublicUrl(path);
  await updateProfile(userId, { avatar_url: data.publicUrl });
  return data.publicUrl;
}

// =============================================
// WIRE POSTS
// =============================================

export async function fetchWirePosts({ filter = 'all', limit = 20, cursor = null } = {}) {
  let query = supabase
    .from('posts')
    .select(`
      *,
      author:profiles(id, handle, display_name, ci_score, ci_tier, avatar_url, is_sector_analyst, is_verified_operator)
    `)
    .eq('moderation_status', 'active')
    .is('reply_to_id', null)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (filter !== 'all') {
    query = query.eq('signal_type', filter);
  }
  if (cursor) {
    query = query.lt('created_at', cursor);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function createPost({ body, signalType, sectorTag, regionTag, replyToId, authorId }) {
  const { data, error } = await supabase
    .from('posts')
    .insert({
      body,
      signal_type: signalType,
      sector_tag: sectorTag || null,
      region_tag: regionTag || null,
      reply_to_id: replyToId || null,
      author_id: authorId,
    })
    .select(`*, author:profiles(id, handle, display_name, ci_score, ci_tier, avatar_url, is_sector_analyst)`)
    .single();
  if (error) throw error;

  // If it's a reply, increment reply count on parent
  if (replyToId) {
    await supabase.rpc('increment_counter', { table_name: 'posts', row_id: replyToId, col: 'reply_count' });
  }

  return data;
}

export async function markPost(userId, postId) {
  const { error } = await supabase
    .from('marks')
    .insert({ user_id: userId, post_id: postId });
  if (error && error.code !== '23505') throw error; // ignore duplicate
}

export async function unmarkPost(userId, postId) {
  const { error } = await supabase
    .from('marks')
    .delete()
    .eq('user_id', userId)
    .eq('post_id', postId);
  if (error) throw error;
}

export async function getMarkedPostIds(userId, postIds) {
  if (!postIds.length) return new Set();
  const { data } = await supabase
    .from('marks')
    .select('post_id')
    .eq('user_id', userId)
    .in('post_id', postIds);
  return new Set((data || []).map(m => m.post_id));
}

export async function fetchPostReplies(postId) {
  const { data, error } = await supabase
    .from('posts')
    .select(`*, author:profiles(id, handle, display_name, ci_score, ci_tier, avatar_url, is_sector_analyst)`)
    .eq('reply_to_id', postId)
    .eq('moderation_status', 'active')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function deletePost(postId, userId) {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId)
    .eq('author_id', userId);
  if (error) throw error;
}

// =============================================
// SECTORS
// =============================================

export async function fetchSectors() {
  const { data, error } = await supabase
    .from('sectors')
    .select('*')
    .order('name');
  if (error) throw error;
  return data || [];
}

export async function followSector(userId, sectorSlug) {
  const { error } = await supabase
    .from('profiles')
    .update({
      followed_sectors: supabase.rpc('array_append_unique', { arr: 'followed_sectors', val: sectorSlug })
    })
    .eq('id', userId);
  // Use direct SQL approach instead
  await supabase.rpc('follow_sector', { p_user_id: userId, p_slug: sectorSlug });
}

export async function unfollowSector(userId, sectorSlug) {
  await supabase.rpc('unfollow_sector', { p_user_id: userId, p_slug: sectorSlug });
}

// =============================================
// SECTOR POSTS
// =============================================

export async function fetchSectorPosts(sectorId, { sort = 'new', limit = 20 } = {}) {
  let query = supabase
    .from('sector_posts')
    .select(`*, author:profiles(id, handle, display_name, ci_score, ci_tier, avatar_url, is_sector_analyst)`)
    .eq('sector_id', sectorId)
    .eq('moderation_status', 'active')
    .limit(limit);

  if (sort === 'hot' || sort === 'top') {
    query = query.order('upvote_count', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function createSectorPost({ sectorId, authorId, title, body, povType, thumbnailUrl }) {
  const words = body.split(/\s+/).length;
  const readTimeMins = Math.max(1, Math.ceil(words / 200));

  const { data, error } = await supabase
    .from('sector_posts')
    .insert({ sector_id: sectorId, author_id: authorId, title, body, pov_type: povType, thumbnail_url: thumbnailUrl, read_time_mins: readTimeMins })
    .select(`*, author:profiles(id, handle, display_name, ci_score, ci_tier, avatar_url)`)
    .single();
  if (error) throw error;
  return data;
}

export async function voteSectorPost(userId, postId, direction) {
  const { data: existing } = await supabase
    .from('votes')
    .select('direction')
    .eq('user_id', userId)
    .eq('target_id', postId)
    .single();

  if (existing) {
    if (existing.direction === direction) {
      // Remove vote
      await supabase.from('votes').delete().eq('user_id', userId).eq('target_id', postId);
      const col = direction === 1 ? 'upvote_count' : 'downvote_count';
      await supabase.from('sector_posts').update({ [col]: supabase.rpc('decrement', { x: postId }) }).eq('id', postId);
      return null;
    } else {
      await supabase.from('votes').update({ direction }).eq('user_id', userId).eq('target_id', postId);
      return direction;
    }
  } else {
    await supabase.from('votes').insert({ user_id: userId, target_id: postId, target_type: 'sector_post', direction });
    return direction;
  }
}

export async function getUserVotes(userId, postIds) {
  if (!postIds.length) return {};
  const { data } = await supabase
    .from('votes')
    .select('target_id, direction')
    .eq('user_id', userId)
    .in('target_id', postIds);
  return Object.fromEntries((data || []).map(v => [v.target_id, v.direction]));
}

// =============================================
// COMMENTS
// =============================================

export async function fetchComments(postId) {
  const { data, error } = await supabase
    .from('comments')
    .select(`*, author:profiles(id, handle, display_name, ci_score, ci_tier, avatar_url)`)
    .eq('post_id', postId)
    .eq('moderation_status', 'active')
    .order('created_at', { ascending: true });
  if (error) throw error;

  // Build tree
  const flat = data || [];
  const top = flat.filter(c => !c.parent_id);
  const buildTree = (parent) => ({
    ...parent,
    replies: flat.filter(c => c.parent_id === parent.id).map(buildTree),
  });
  return top.map(buildTree);
}

export async function createComment({ postId, authorId, body, parentId }) {
  const { data, error } = await supabase
    .from('comments')
    .insert({ post_id: postId, author_id: authorId, body, parent_id: parentId || null })
    .select(`*, author:profiles(id, handle, display_name, ci_score, ci_tier, avatar_url)`)
    .single();
  if (error) throw error;
  await supabase.from('sector_posts').update({ comment_count: supabase.rpc('coalesce_incr') }).eq('id', postId);
  return data;
}

// =============================================
// INTEL CHANNELS
// =============================================

export async function fetchChannels() {
  const { data, error } = await supabase
    .from('intel_channels')
    .select('*')
    .order('last_message_at', { ascending: false, nullsFirst: false });
  if (error) throw error;
  return data || [];
}

export async function fetchMessages(channelId, limit = 60) {
  const { data, error } = await supabase
    .from('channel_messages')
    .select(`*, author:profiles(id, handle, display_name, ci_score, ci_tier, avatar_url)`)
    .eq('channel_id', channelId)
    .eq('moderation_status', 'active')
    .order('created_at', { ascending: true })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

export async function sendMessage({ channelId, authorId, body, messageType = 'text', replyToId }) {
  const { data, error } = await supabase
    .from('channel_messages')
    .insert({ channel_id: channelId, author_id: authorId, body, message_type: messageType, reply_to_id: replyToId || null })
    .select(`*, author:profiles(id, handle, display_name, ci_score, ci_tier, avatar_url)`)
    .single();
  if (error) throw error;
  // Update channel last_message_at
  await supabase.from('intel_channels').update({ last_message_at: new Date().toISOString() }).eq('id', channelId);
  return data;
}

export async function pinMessage(messageId, pinStatus = 'pending') {
  const { error } = await supabase
    .from('channel_messages')
    .update({ is_pinned: true, pin_status: pinStatus })
    .eq('id', messageId);
  if (error) throw error;
}

// =============================================
// NOTIFICATIONS
// =============================================

export async function fetchNotifications(userId, limit = 40) {
  const { data, error } = await supabase
    .from('notifications')
    .select(`*, actor:profiles(id, handle, display_name, ci_score, avatar_url)`)
    .eq('recipient_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

export async function markAllNotificationsRead(userId) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('recipient_id', userId)
    .eq('is_read', false);
  if (error) throw error;
}

export async function createNotification({ recipientId, type, actorId, referenceId, referenceType, body }) {
  if (recipientId === actorId) return;
  const { error } = await supabase.from('notifications').insert({
    recipient_id: recipientId, type, actor_id: actorId, reference_id: referenceId, reference_type: referenceType, body,
  });
  if (error) throw error;
}

// =============================================
// DISCOVER
// =============================================

export async function fetchDiscover() {
  const [analystsRes, sectorsRes, featuredRes] = await Promise.all([
    supabase.from('profiles').select('id, handle, display_name, avatar_url, ci_score, ci_tier, primary_sector, is_sector_analyst, is_verified_operator').gt('ci_score', 200).order('ci_score', { ascending: false }).limit(8),
    supabase.from('sectors').select('*').order('weekly_posts', { ascending: false }).limit(6),
    supabase.from('sector_posts').select(`*, author:profiles(id, handle, display_name, ci_score), sector:sectors(name, slug)`).eq('moderation_status', 'active').order('upvote_count', { ascending: false }).limit(5),
  ]);
  return {
    notableAnalysts: analystsRes.data || [],
    trendingSectors: sectorsRes.data || [],
    featuredPosts: featuredRes.data || [],
  };
}

// =============================================
// FOLLOWS
// =============================================

export async function followUser(followerId, followingId) {
  const { error } = await supabase.from('follows').insert({ follower_id: followerId, following_id: followingId });
  if (error && error.code !== '23505') throw error;
}

export async function unfollowUser(followerId, followingId) {
  const { error } = await supabase.from('follows').delete().eq('follower_id', followerId).eq('following_id', followingId);
  if (error) throw error;
}

// =============================================
// REALTIME SUBSCRIPTIONS
// =============================================

export function subscribeToWire(callback) {
  return supabase
    .channel('wire:global')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts', filter: 'reply_to_id=is.null' }, (payload) => {
      callback('new_post', payload.new);
    })
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'posts' }, (payload) => {
      callback('post_updated', payload.new);
    })
    .subscribe();
}

export function subscribeToChannel(channelId, callback) {
  return supabase
    .channel(`channel:${channelId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'channel_messages', filter: `channel_id=eq.${channelId}` }, (payload) => {
      callback('new_message', payload.new);
    })
    .subscribe();
}

export function subscribeToNotifications(userId, callback) {
  return supabase
    .channel(`notifications:${userId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `recipient_id=eq.${userId}` }, (payload) => {
      callback(payload.new);
    })
    .subscribe();
}

export function unsubscribe(channel) {
  if (channel) supabase.removeChannel(channel);
}
