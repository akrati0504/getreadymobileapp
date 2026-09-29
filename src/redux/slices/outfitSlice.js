import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api";

export const fetchPublicOutfits = createAsyncThunk(
    'outfit/fetchPublicOutfits',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/home-feed');
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.response?.data || { message: error.message });
        }
    }
);

export const submitOutfit = createAsyncThunk(
    'outfit/submitOutfit',
    async (formData, { getState, rejectWithValue }) => {
        try {
            const state = getState();
            const token = state.auth?.user?.token || state.auth?.token;
            
            // Fix: Append user_id to the payload so backend knows who owns the outfit
            const userId = state.auth?.user?.id || state.auth?.user?.user?.id;
            if (userId) {
                formData.append('user_id', userId);
            }

            const response = await api.post('/outfits', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Accept': 'application/json',
                    ...(token && { Authorization: `Bearer ${token}` })
                }
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.response?.data || { message: error.message });
        }
    }
);

export const fetchMyListings = createAsyncThunk(
    'outfit/fetchMyListings',
    async (_, { getState, rejectWithValue }) => {
        try {
            const state = getState();
            const token = state.auth?.user?.token || state.auth?.token;
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            
            const response = await api.get('/my-clothes', config);
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.response?.data || { message: error.message });
        }
    }
);

const outfitSlice = createSlice({
    name: 'outfit',
    initialState: {
        publicOutfits: [],
        myListings: [],
        myListingsLoading: false,
        homeFeedLoading: false,
        loading: false,
        error: null,
        success: false,
    },
    reducers: {
        resetOutfitState: (state) => {
            state.loading = false;
            state.error = null;
            state.success = false;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Public Outfits (Home Feed)
            .addCase(fetchPublicOutfits.pending, (state) => {
                state.homeFeedLoading = true;
                state.error = null;
            })
            .addCase(fetchPublicOutfits.fulfilled, (state, action) => {
                state.homeFeedLoading = false;
                state.publicOutfits = action.payload.data || [];
            })
            .addCase(fetchPublicOutfits.rejected, (state, action) => {
                state.homeFeedLoading = false;
                state.error = action.payload;
            })
            // Submit Outfit
            .addCase(submitOutfit.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(submitOutfit.fulfilled, (state) => {
                state.loading = false;
                state.success = true;
            })
            .addCase(submitOutfit.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch My Listings
            .addCase(fetchMyListings.pending, (state) => {
                state.myListingsLoading = true;
                state.error = null;
            })
            .addCase(fetchMyListings.fulfilled, (state, action) => {
                state.myListingsLoading = false;
                state.myListings = action.payload.clothes || [];
            })
            .addCase(fetchMyListings.rejected, (state, action) => {
                state.myListingsLoading = false;
                state.error = action.payload;
            });
    }
});

export const { resetOutfitState } = outfitSlice.actions;
export default outfitSlice.reducer;
