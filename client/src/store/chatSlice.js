import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Async thunks
export const createChat = createAsyncThunk(
  'chat/createChat',
  async (personaId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/chat`,
        { personaId },
        { headers: { 'x-auth-token': token } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getChats = createAsyncThunk(
  'chat/getChats',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/chat`, {
        headers: { 'x-auth-token': token }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getChat = createAsyncThunk(
  'chat/getChat',
  async (chatId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/chat/${chatId}`, {
        headers: { 'x-auth-token': token }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ chatId, content, file }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/chat/${chatId}/messages`,
        { content, file },
        { headers: { 'x-auth-token': token } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteChat = createAsyncThunk(
  'chat/deleteChat',
  async (chatId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/chat/${chatId}`, {
        headers: { 'x-auth-token': token }
      });
      return chatId;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const toggleBookmark = createAsyncThunk(
  'chat/toggleBookmark',
  async (chatId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `${API_URL}/chat/${chatId}/bookmark`,
        {},
        { headers: { 'x-auth-token': token } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  chats: [],
  currentChat: null,
  loading: false,
  error: null
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    clearCurrentChat: (state) => {
      state.currentChat = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create Chat
      .addCase(createChat.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createChat.fulfilled, (state, action) => {
        state.loading = false;
        state.chats.unshift(action.payload);
        state.currentChat = action.payload;
      })
      .addCase(createChat.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create chat';
      })
      // Get Chats
      .addCase(getChats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getChats.fulfilled, (state, action) => {
        state.loading = false;
        state.chats = action.payload;
      })
      .addCase(getChats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to get chats';
      })
      // Get Chat
      .addCase(getChat.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getChat.fulfilled, (state, action) => {
        state.loading = false;
        state.currentChat = action.payload;
      })
      .addCase(getChat.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to get chat';
      })
      // Send Message
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false;
        state.currentChat = action.payload;
        const index = state.chats.findIndex(chat => chat._id === action.payload._id);
        if (index !== -1) {
          state.chats[index] = action.payload;
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to send message';
      })
      // Delete Chat
      .addCase(deleteChat.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteChat.fulfilled, (state, action) => {
        state.loading = false;
        state.chats = state.chats.filter(chat => chat._id !== action.payload);
        if (state.currentChat?._id === action.payload) {
          state.currentChat = null;
        }
      })
      .addCase(deleteChat.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to delete chat';
      })
      // Toggle Bookmark
      .addCase(toggleBookmark.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleBookmark.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.chats.findIndex(chat => chat._id === action.payload._id);
        if (index !== -1) {
          state.chats[index] = action.payload;
        }
        if (state.currentChat?._id === action.payload._id) {
          state.currentChat = action.payload;
        }
      })
      .addCase(toggleBookmark.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to toggle bookmark';
      });
  }
});

export const { clearCurrentChat, clearError } = chatSlice.actions;
export default chatSlice.reducer; 