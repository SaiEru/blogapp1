import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api.js';

const savedUser = JSON.parse(localStorage.getItem('user') || 'null');
const savedToken = localStorage.getItem('token');

export const login = createAsyncThunk('auth/login', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', payload);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data || { message: 'Login failed' });
  }
});

export const register = createAsyncThunk('auth/register', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/register', payload);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data || { message: 'Registration failed' });
  }
});

// Firebase login removed

const slice = createSlice({
  name: 'auth',
  initialState: { user: savedUser, token: savedToken, status: 'idle', error: null },
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },
    setCredentials(state, action) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      localStorage.setItem('token', action.payload.token);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (s) => {
        s.status = 'loading';
        s.error = null;
      })
      .addCase(login.fulfilled, (s, { payload }) => {
        s.status = 'succeeded';
        s.user = payload.user;
        s.token = payload.token;
        localStorage.setItem('user', JSON.stringify(payload.user));
        localStorage.setItem('token', payload.token);
      })
      .addCase(login.rejected, (s, { payload }) => {
        s.status = 'failed';
        s.error = payload?.message || 'Login failed';
      })
      .addCase(register.pending, (s) => {
        s.status = 'loading';
        s.error = null;
      })
      .addCase(register.fulfilled, (s, { payload }) => {
        s.status = 'succeeded';
        s.user = payload.user;
        s.token = payload.token;
        localStorage.setItem('user', JSON.stringify(payload.user));
        localStorage.setItem('token', payload.token);
      })
      .addCase(register.rejected, (s, { payload }) => {
        s.status = 'failed';
        s.error = payload?.message || 'Registration failed';
      });
  },
});

export const { logout, setCredentials } = slice.actions;
export default slice.reducer;
