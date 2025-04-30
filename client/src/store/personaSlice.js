import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Async thunks
export const getPublicPersonas = createAsyncThunk(
  'persona/getPublicPersonas',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/personas/public`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getSavedPersonas = createAsyncThunk(
  'persona/getSavedPersonas',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/personas/saved`, {
        headers: { 'x-auth-token': token }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createPersona = createAsyncThunk(
  'persona/createPersona',
  async (personaData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/personas`,
        personaData,
        { headers: { 'x-auth-token': token } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updatePersona = createAsyncThunk(
  'persona/updatePersona',
  async ({ id, personaData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/personas/${id}`,
        personaData,
        { headers: { 'x-auth-token': token } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deletePersona = createAsyncThunk(
  'persona/deletePersona',
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/personas/${id}`, {
        headers: { 'x-auth-token': token }
      });
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const savePersona = createAsyncThunk(
  'persona/savePersona',
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/personas/${id}/save`,
        {},
        { headers: { 'x-auth-token': token } }
      );
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const removeSavedPersona = createAsyncThunk(
  'persona/removeSavedPersona',
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/personas/${id}/save`, {
        headers: { 'x-auth-token': token }
      });
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  publicPersonas: [],
  savedPersonas: [],
  loading: false,
  error: null
};

const personaSlice = createSlice({
  name: 'persona',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get Public Personas
      .addCase(getPublicPersonas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPublicPersonas.fulfilled, (state, action) => {
        state.loading = false;
        state.publicPersonas = action.payload;
      })
      .addCase(getPublicPersonas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to get public personas';
      })
      // Get Saved Personas
      .addCase(getSavedPersonas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSavedPersonas.fulfilled, (state, action) => {
        state.loading = false;
        state.savedPersonas = action.payload;
      })
      .addCase(getSavedPersonas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to get saved personas';
      })
      // Create Persona
      .addCase(createPersona.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPersona.fulfilled, (state, action) => {
        state.loading = false;
        state.savedPersonas.push(action.payload);
      })
      .addCase(createPersona.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create persona';
      })
      // Update Persona
      .addCase(updatePersona.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePersona.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.savedPersonas.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.savedPersonas[index] = action.payload;
        }
      })
      .addCase(updatePersona.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update persona';
      })
      // Delete Persona
      .addCase(deletePersona.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePersona.fulfilled, (state, action) => {
        state.loading = false;
        state.savedPersonas = state.savedPersonas.filter(p => p._id !== action.payload);
      })
      .addCase(deletePersona.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to delete persona';
      })
      // Save Persona
      .addCase(savePersona.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(savePersona.fulfilled, (state, action) => {
        state.loading = false;
        const persona = state.publicPersonas.find(p => p._id === action.payload);
        if (persona) {
          state.savedPersonas.push(persona);
        }
      })
      .addCase(savePersona.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to save persona';
      })
      // Remove Saved Persona
      .addCase(removeSavedPersona.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeSavedPersona.fulfilled, (state, action) => {
        state.loading = false;
        state.savedPersonas = state.savedPersonas.filter(p => p._id !== action.payload);
      })
      .addCase(removeSavedPersona.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to remove saved persona';
      });
  }
});

export const { clearError } = personaSlice.actions;
export default personaSlice.reducer; 