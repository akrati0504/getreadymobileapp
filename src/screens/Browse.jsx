import React, { useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Image, ScrollView, FlatList, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories } from '../redux/slices/categorySlice';
import { fetchBrands } from '../redux/slices/brandSlice';
import { fetchDropdowns } from '../redux/slices/dropdownSlice';
import { fetchClothes, clearFilters, toggleArrayFilter } from '../redux/slices/clothesSlice';
import styles from '../css/BrowseStyles';
import TopHeader from '../components/TopHeader';
import BrowseFilters from '../components/BrowseFilters';

const Browse = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();

  const { data: clothesData, loading: clothesLoading, error: clothesError, filters } = useSelector(state => state.clothes);

  useEffect(() => {
    dispatch(clearFilters()); // Reset filters on app reopen / refresh
    dispatch(fetchCategories());
    dispatch(fetchBrands());
    dispatch(fetchDropdowns());
  }, [dispatch]);

  useFocusEffect(
    React.useCallback(() => {
      if (route.params?.initialFilter) {
        dispatch(clearFilters());
        dispatch(toggleArrayFilter({ key: route.params.initialFilter.key, value: route.params.initialFilter.value }));
        navigation.setParams({ initialFilter: null });
      }
    }, [route.params?.initialFilter, dispatch, navigation])
  );

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      dispatch(fetchClothes());
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [filters, dispatch]);

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.itemCard} activeOpacity={0.9} onPress={() => navigation.navigate('ProductDetails', { productId: item.id })}>
      <View style={styles.itemImageWrapper}>
        <Image source={item.image} style={styles.itemImage} resizeMode="cover" />
        <TouchableOpacity style={styles.itemBagButton}>
          <Icon name="bag-handle-outline" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
      <View style={styles.itemDetails}>
        <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.itemBrand}>{item.brand}</Text>
        <View style={styles.itemPriceRow}>
          <View style={styles.rentLabelBox}>
            <Icon name="calendar-outline" size={14} color="#64748b" />
            <Text style={styles.rentLabel}>RENT:</Text>
          </View>
          <Text style={styles.itemPrice}>{item.rent}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <TopHeader />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* Isolated Filters Component */}
        <BrowseFilters />

        {/* Grid Section */}
        <View style={styles.gridContainer}>
          {clothesLoading ? (
            <ActivityIndicator size="large" color="#FFA500" style={{ marginTop: 50 }} />
          ) : clothesError ? (
            <Text style={{ textAlign: 'center', marginTop: 50, color: 'red', paddingHorizontal: 20 }}>
              Error loading clothes: {typeof clothesError === 'string' ? clothesError : JSON.stringify(clothesError)}
            </Text>
          ) : clothesData?.length === 0 ? (
             <Text style={{ textAlign: 'center', marginTop: 50, color: '#888', fontSize: 16 }}>No clothes found matching your filters.</Text>
          ) : (
            <FlatList
              data={clothesData}
              renderItem={renderItem}
              keyExtractor={item => item.id?.toString()}
              numColumns={2}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Browse;
