import React, { useEffect } from 'react';
import { ScrollView, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styles from '../css/HomeStyles';
import TopHeader from '../components/TopHeader';
import Carousel from '../components/Carousel';
import Categories from '../components/Categories';
import TopBrands from '../components/TopBrands';
import StylesForOccasion from '../components/StylesForOccasion';
import { fetchBrands } from '../redux/slices/brandSlice';
import { fetchCategories } from '../redux/slices/categorySlice';

const carouselData = [
  { id: '1', image: require('../assets/images/1.jpg') },
  { id: '2', image: require('../assets/images/2.jpg') },
  { id: '3', image: require('../assets/images/3.jpg') },
];

const Home = () => {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    dispatch(fetchBrands());
    dispatch(fetchCategories());
  }, [dispatch])

  return (
    <View style={styles.container}>
      <TopHeader />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 + insets.bottom }}>

        {/* Hero Carousel Section */}
        <Carousel data={carouselData} />

        {/* Categories Section */}
        <Categories />

        {/* Premium Brands Section */}
        <TopBrands />

        {/* Styles For Every Occasion Section */}
        <StylesForOccasion />

      </ScrollView>
    </View>
  );
};

export default Home;
