import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories } from '../redux/slices/categorySlice';
import { fetchBrands } from '../redux/slices/brandSlice';
import { fetchDropdowns } from '../redux/slices/dropdownSlice';

export const useDropdownData = () => {
  const dispatch = useDispatch();

  const { data: categories } = useSelector((state) => state.category);
  const { data: brands } = useSelector((state) => state.brand);
  const {
    fabricTypes,
    colors,
    sizes,
    bodyFits,
    garmentConditions,
  } = useSelector((state) => state.dropdown);

  useEffect(() => {
    if (categories.length === 0) dispatch(fetchCategories());
    if (brands.length === 0) dispatch(fetchBrands());
    if (
      fabricTypes.length === 0 ||
      colors.length === 0 ||
      sizes.length === 0 ||
      bodyFits.length === 0 ||
      garmentConditions.length === 0
    ) {
      dispatch(fetchDropdowns());
    }
  }, [dispatch, categories.length, brands.length, fabricTypes.length, colors.length, sizes.length, bodyFits.length, garmentConditions.length]);

  return {
    categories,
    brands,
    fabricTypes,
    colors,
    sizes,
    bodyFits,
    garmentConditions,
  };
};
