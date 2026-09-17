import React, { useEffect } from 'react';
import { ScrollView, SafeAreaView } from 'react-native';
import { useDispatch } from 'react-redux';
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

  useEffect(() => {
    dispatch(fetchBrands());
    dispatch(fetchCategories());
  }, [dispatch])

  return (
    <SafeAreaView style={styles.container}>
      <TopHeader />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>

        {/* Hero Carousel Section */}
        <Carousel data={carouselData} />

        {/* Categories Section */}
        <Categories />

        {/* Premium Brands Section */}
        <TopBrands />

        {/* Styles For Every Occasion Section */}
        <StylesForOccasion />

      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;
