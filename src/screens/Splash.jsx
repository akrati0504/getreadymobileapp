import React, { useEffect } from 'react';
import { View, Image, StyleSheet, Dimensions, Animated, Text } from 'react-native';
import { useNavigation, StackActions } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get('window');

const Splash = () => {
  const navigation = useNavigation();
  const fadeAnim = new Animated.Value(0);
  const slideUpAnim = new Animated.Value(50); // Start 50px below

  useEffect(() => {
    // Parallel animation for fade and slide up
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 1200,
        useNativeDriver: true,
      })
    ]).start();

    // Navigate to Home after 3 seconds
    const timer = setTimeout(() => {
      navigation.dispatch(StackActions.replace('Home'));
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigation, fadeAnim, slideUpAnim]);

  return (
    <View style={styles.container}>
      
      {/* Background Decorative Circles */}
      <View style={[styles.bgCircle, styles.circleTopLeft]} />
      <View style={[styles.bgCircle, styles.circleTopRight]} />
      <View style={[styles.bgCircle, styles.circleBottomRight]} />
      <View style={[styles.bgCircle, styles.circleBottomLeft]} />

      {/* Top Floating Icons (like the eco/footprint ones in the reference) */}
      <View style={[styles.floatingIconBox, styles.iconTopLeft]}>
        <Icon name="leaf-outline" size={30} color="rgba(218, 165, 32, 0.4)" />
      </View>
      <View style={[styles.floatingIconBox, styles.iconTopCenter]}>
        <MaterialIcon name="recycle" size={34} color="rgba(218, 165, 32, 0.4)" />
      </View>
      <View style={[styles.floatingIconBox, styles.iconTopRight]}>
        <MaterialIcon name="hanger" size={30} color="rgba(218, 165, 32, 0.4)" />
      </View>

      {/* Center Logo Area */}
      <Animated.View style={[
        styles.centerContainer, 
        { opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] }
      ]}>
        <Image 
          source={require('../assets/images/logo.png')} 
          style={styles.logo} 
          resizeMode="contain" 
        />
        <Text style={styles.brandText}>GetReady</Text>
      </Animated.View>

      {/* Bottom Clothing Illustrations (using icons as a substitute for vectors) */}
      <Animated.View style={[styles.bottomGraphics, { opacity: fadeAnim }]}>
        <MaterialIcon name="tshirt-crew" size={100} color="rgba(218, 165, 32, 0.2)" style={styles.bottomIconLeft} />
        <MaterialIcon name="shopping-outline" size={130} color="rgba(218, 165, 32, 0.2)" style={styles.bottomIconCenter} />
        <MaterialIcon name="shoe-heel" size={90} color="rgba(218, 165, 32, 0.2)" style={styles.bottomIconRight} />
      </Animated.View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', // Clean white background
    overflow: 'hidden',
    position: 'relative',
  },
  // Background circles for the subtle pattern
  bgCircle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(218, 165, 32, 0.1)', // Very faint gold against white
  },
  circleTopLeft: {
    width: 250,
    height: 250,
    top: -50,
    left: -100,
  },
  circleTopRight: {
    width: 150,
    height: 150,
    top: 50,
    right: -50,
  },
  circleBottomRight: {
    width: 300,
    height: 300,
    bottom: -100,
    right: -100,
  },
  circleBottomLeft: {
    width: 200,
    height: 200,
    bottom: 50,
    left: -80,
  },

  // Floating top icons in circles
  floatingIconBox: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(218, 165, 32, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconTopLeft: {
    top: 100,
    left: 40,
  },
  iconTopCenter: {
    top: 60,
    left: width / 2 - 20,
  },
  iconTopRight: {
    top: 120,
    right: 40,
  },

  // Center logo
  centerContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 15,
  },
  brandText: {
    fontSize: 34,
    fontFamily: 'OpenSans-Regular',
    fontWeight: 'bold',
    color: '#282c3f', // Dark text for light theme
    fontStyle: 'italic', // Mimicking the stylized text
  },

  // Bottom graphics
  bottomGraphics: {
    position: 'absolute',
    bottom: -20,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
  },
  bottomIconLeft: {
    transform: [{ rotate: '-15deg' }],
    marginBottom: 20,
  },
  bottomIconCenter: {
    marginBottom: 0,
  },
  bottomIconRight: {
    transform: [{ rotate: '15deg' }],
    marginBottom: 30,
  },
});

export default Splash;
