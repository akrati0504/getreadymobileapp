import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api";

export const fetchDropdowns = createAsyncThunk(
    'dropdown/fetchDropdowns',
    async (_, { rejectWithValue }) => {
        try {
            const [
                fabricTypesRes,
                colorsRes,
                sizesRes,
                bodyFitsRes,
                garmentConditionsRes
            ] = await Promise.all([
                api.get('/fabric-types'),
                api.get('/colors'),
                api.get('/sizes'),
                api.get('/body-fits'),
                api.get('/garment-conditions')
            ]);
            
            return {
                fabricTypes: fabricTypesRes.data.data,
                colors: colorsRes.data.data,
                sizes: sizesRes.data.data,
                bodyFits: bodyFitsRes.data.data,
                garmentConditions: garmentConditionsRes.data.data
            };
        } catch (error) {
            return rejectWithValue(error?.response?.data || error.message);
        }
    }
);

const dropdownSlice = createSlice({
    name: 'dropdown',
    initialState: {
        fabricTypes: [],
        colors: [],
        sizes: [],
        bodyFits: [],
        garmentConditions: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchDropdowns.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDropdowns.fulfilled, (state, action) => {
                state.loading = false;
                state.fabricTypes = action.payload.fabricTypes;
                state.colors = action.payload.colors;
                state.sizes = action.payload.sizes;
                state.bodyFits = action.payload.bodyFits;
                state.garmentConditions = action.payload.garmentConditions;
            })
            .addCase(fetchDropdowns.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export default dropdownSlice.reducer;
