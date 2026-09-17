import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api";

export const fetchClothes = createAsyncThunk(
    'clothes/fetchClothes',
    async (_, { getState, rejectWithValue }) => {
        try {
            // Get current filters from state
            const filters = getState().clothes.filters;

            // Build query string manually to ensure PHP/Laravel compatibility for arrays
            const queryParams = [];
            Object.keys(filters).forEach(key => {
                const value = filters[key];
                if (Array.isArray(value)) {
                    value.forEach(val => {
                        queryParams.push(`${encodeURIComponent(key)}[]=${encodeURIComponent(val)}`);
                    });
                } else if (value !== '' && value !== null && value !== undefined && value !== 'any' && value !== 'all' && value !== 'default') {
                    queryParams.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
                }
            });

            const queryString = queryParams.join('&');
            const endpoint = queryString ? `/home-feed?${queryString}` : '/home-feed';

            const response = await api.get(endpoint);
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.response?.data || { message: error.message });
        }
    }
);

export const fetchClothDetails = createAsyncThunk(
    'clothes/fetchClothDetails',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.get(`/clothes/${id}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.response?.data || { message: error.message });
        }
    }
);

const initialState = {
    data: [],
    loading: false,
    error: null,
    filters: {
        categories: [],
        genders: [],
        conditions: [],
        brands: [],
        fabrics: [],
        colors: [],
        sizes: [],
        fits: [],
        bottoms: [],
        status: 'any',
        seller_rating: '',
        product_rating: '',
        mrp_min: '',
        mrp_max: '',
        price_min: '',
        price_max: '',
        deal_type: 'all',
        rdm_priority: '',
        sort_by: 'default',
        search: '',
        from_date: '',
        to_date: '',
        is_cleaned: ''
    }
};

const clothesSlice = createSlice({
    name: 'clothes',
    initialState,
    reducers: {
        setFilter: (state, action) => {
            const { key, value } = action.payload;
            state.filters[key] = value;
        },
        toggleArrayFilter: (state, action) => {
            const { key, value } = action.payload;
            const currentArray = state.filters[key];
            if (currentArray.includes(value)) {
                state.filters[key] = currentArray.filter(item => item !== value);
            } else {
                state.filters[key] = [...currentArray, value];
            }
        },
        clearFilters: (state) => {
            state.filters = initialState.filters;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchClothes.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchClothes.fulfilled, (state, action) => {
                state.loading = false;

                const formattedData = (action.payload.data || []).map(item => {
                    let imageUrl = item.image;
                    // Fix for Laravel asset() returning localhost instead of local IP
                    if (imageUrl && (imageUrl.includes('localhost') || imageUrl.includes('127.0.0.1'))) {
                        imageUrl = imageUrl.replace(/localhost(:\d+)?/, '192.168.1.6:8000').replace(/127\.0\.0\.1(:\d+)?/, '192.168.1.6:8000');
                    }
                    
                    return {
                        id: item.id?.toString(),
                        title: item.title,
                        brand: item.brand,
                        rent: item.rent || '₹--',
                        security_deposit: item.security_deposit || 0,
                        image: imageUrl ? { uri: imageUrl } : require('../../assets/images/logo.png')
                    };
                });

                state.data = formattedData;
            })
            .addCase(fetchClothes.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch Cloth Details
            .addCase(fetchClothDetails.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchClothDetails.fulfilled, (state) => {
                state.loading = false;
                // Currently returning data directly to component, no state mutation required 
                // unless we want to cache it in a `selectedCloth` property in the future.
            })
            .addCase(fetchClothDetails.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { setFilter, toggleArrayFilter, clearFilters } = clothesSlice.actions;
export default clothesSlice.reducer;
