import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice.js';
import postsReducer from '../features/posts/postsSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postsReducer,
  },
});
