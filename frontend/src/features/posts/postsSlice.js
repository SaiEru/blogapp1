import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api.js';

export const fetchPosts = createAsyncThunk('posts/fetch', async (params = {}, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/posts', { params });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data || { message: 'Failed to load posts' });
  }
});

export const fetchPost = createAsyncThunk('posts/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/posts/${id}`);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data || { message: 'Failed to load post' });
  }
});

export const createOrUpdatePost = createAsyncThunk('posts/save', async ({ id, payload }, { rejectWithValue }) => {
  try {
    if (id) {
      const { data } = await api.put(`/posts/${id}`, payload);
      return data;
    }
    const { data } = await api.post('/posts', payload);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data || { message: 'Failed to save post' });
  }
});

export const deletePost = createAsyncThunk('posts/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/posts/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data || { message: 'Failed to delete post' });
  }
});

export const addComment = createAsyncThunk('posts/addComment', async ({ postId, text }, { rejectWithValue }) => {
  try {
    const { data } = await api.post(`/posts/${postId}/comments`, { text });
    return { postId, comment: data };
  } catch (err) {
    return rejectWithValue(err.response?.data || { message: 'Failed to add comment' });
  }
});

export const updateComment = createAsyncThunk('posts/updateComment', async ({ postId, commentId, text }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/posts/${postId}/comments/${commentId}`, { text });
    return { postId, comment: data };
  } catch (err) {
    return rejectWithValue(err.response?.data || { message: 'Failed to update comment' });
  }
});

export const deleteComment = createAsyncThunk('posts/deleteComment', async ({ postId, commentId }, { rejectWithValue }) => {
  try {
    await api.delete(`/posts/${postId}/comments/${commentId}`);
    return { postId, commentId };
  } catch (err) {
    return rejectWithValue(err.response?.data || { message: 'Failed to delete comment' });
  }
});

export const reactToPost = createAsyncThunk('posts/react', async ({ postId, emoji }, { rejectWithValue }) => {
  try {
    const { data } = await api.post(`/posts/${postId}/react`, { emoji });
    return { postId, reactions: data.reactions };
  } catch (err) {
    return rejectWithValue(err.response?.data || { message: 'Failed to react' });
  }
});

export const repost = createAsyncThunk('posts/repost', async (postId, { rejectWithValue }) => {
  try {
    const { data } = await api.post(`/posts/${postId}/repost`);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data || { message: 'Failed to repost' });
  }
});

const slice = createSlice({
  name: 'posts',
  initialState: { items: [], total: 0, current: null, status: 'idle', error: null },
  reducers: {},
  extraReducers: (b) => {
    b
      .addCase(fetchPosts.pending, (s) => { s.status = 'loading'; s.error = null; })
      .addCase(fetchPosts.fulfilled, (s, { payload }) => { s.status = 'succeeded'; s.items = payload.items; s.total = payload.total; })
      .addCase(fetchPosts.rejected, (s, { payload }) => { s.status = 'failed'; s.error = payload?.message; })
      .addCase(fetchPost.fulfilled, (s, { payload }) => { s.current = payload; })
      .addCase(createOrUpdatePost.fulfilled, (s, { payload }) => {
        const idx = s.items.findIndex(p => p._id === payload._id);
        if (idx >= 0) s.items[idx] = payload; else s.items.unshift(payload);
        s.current = payload;
      })
      .addCase(deletePost.fulfilled, (s, { payload: id }) => {
        s.items = s.items.filter(p => p._id !== id);
        if (s.current?._id === id) s.current = null;
      })
      .addCase(addComment.fulfilled, (s, { payload }) => {
        if (s.current && s.current._id === payload.postId) {
          s.current.comments = s.current.comments || [];
          s.current.comments.push(payload.comment);
        }
      })
      .addCase(updateComment.fulfilled, (s, { payload }) => {
        if (s.current && s.current._id === payload.postId) {
          const idx = s.current.comments?.findIndex(c => c._id === payload.comment._id);
          if (idx >= 0) s.current.comments[idx] = payload.comment;
        }
      })
      .addCase(deleteComment.fulfilled, (s, { payload }) => {
        if (s.current && s.current._id === payload.postId) {
          s.current.comments = (s.current.comments || []).filter(c => c._id !== payload.commentId);
        }
      })
      .addCase(reactToPost.fulfilled, (s, { payload }) => {
        if (s.current && s.current._id === payload.postId) {
          s.current.reactions = payload.reactions;
        }
      })
      .addCase(repost.fulfilled, (s, { payload }) => {
        // Insert reposted item at top of feed
        s.items.unshift(payload);
      });
  }
});

export default slice.reducer;
