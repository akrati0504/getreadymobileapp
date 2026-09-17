import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api";


export const fetchBrands = createAsyncThunk(
    'brand/fetchBrands',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/brands');
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.response?.data || error.message);
        }
    }
)


const brandSlice = createSlice({
    name: 'brand',
    initialState: {
        data: [],
        loading: false,
        error: null,
    },
    reducers: {

    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchBrands.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBrands.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload.data;
            })
            .addCase(fetchBrands.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

    }
})
export default brandSlice.reducer;