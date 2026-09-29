import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styles from '../css/BottomNavStyles';
import { useSelector } from 'react-redux';

const BottomNav = ({ state, descriptors, navigation }) => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const cartCount = useSelector((state) => state.cart?.cartCount || 0);
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.tabBarContainer, { paddingBottom: insets.bottom, height: 60 + insets.bottom }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        
        // Hide tabs that have display: 'none'
        if (options.tabBarItemStyle?.display === 'none') {
          return null;
        }

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          // Check protection manually (simulating the listeners from TabNavigator)
          const protectedRoutes = ['Sell', 'Cart', 'Profile'];
          if (protectedRoutes.includes(route.name) && !isAuthenticated) {
            navigation.navigate('Login');
            return;
          }

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate({ name: route.name, merge: true });
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        // Render custom center button
        if (route.name === 'Sell') {
          return (
            <View key={index} style={{ flex: 1, alignItems: 'center' }}>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={options.tabBarTestID}
                onPress={onPress}
                onLongPress={onLongPress}
                style={styles.sellButtonContainer}
              >
                <View style={styles.sellButton}>
                  <Icon name="add" color="#fff" size={32} />
                </View>
              </TouchableOpacity>
            </View>
          );
        }

        // Render normal tabs based on name
        let iconName = 'home-outline';
        if (route.name === 'HomeTab') iconName = 'home-outline';
        else if (route.name === 'Listings') iconName = 'list-outline';
        else if (route.name === 'Shop') iconName = 'bag-handle-outline';
        else if (route.name === 'Analytics') iconName = 'trending-up-outline';
        else if (route.name === 'Cart') iconName = 'bag-check-outline';
        else if (route.name === 'Profile') iconName = 'person-circle-outline';

        const color = isFocused ? '#FFA500' : '#8e8e93';

        return (
          <TouchableOpacity
            key={index}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabItem}
            activeOpacity={0.7}
          >
            <View>
              <Icon name={iconName} size={24} color={color} />
              {route.name === 'Shop' && cartCount > 0 && (
                <View style={styles.badgeContainer}>
                  <Text style={styles.badgeText}>{cartCount}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default BottomNav;
