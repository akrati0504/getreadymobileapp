import React, { useState } from 'react';
import { View, Image, TouchableOpacity, TextInput, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import styles from '../css/TopHeaderStyles';
import AccountMenuModal from './AccountMenuModal';
import NotificationsModal from './NotificationsModal';
import { fetchUnreadCount } from '../redux/slices/notificationSlice';

const TopHeader = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const { unreadCount } = useSelector(state => state.notifications);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isNotificationsVisible, setIsNotificationsVisible] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      dispatch(fetchUnreadCount());
    }, [dispatch])
  );

  const handleLogoPress = () => {
    // If not already on HomeTab, go there. Otherwise, just do nothing or go top.
    if (route.name !== 'HomeTab' && route.name !== 'Home') {
      navigation.navigate('Home', { screen: 'HomeTab' });
    }
  };

  return (
    <>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={handleLogoPress}>
          <Image source={require('../assets/images/logo.png')} style={styles.logoImage} resizeMode="contain" />
        </TouchableOpacity>

        <View style={styles.headerSearchContainer}>
          <Icon name="search-outline" size={18} color="#888" style={{ marginRight: 5 }} />
          <TextInput
            style={styles.headerSearchInput}
            placeholder="Search for Luxury Outfits..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton} onPress={() => setIsNotificationsVisible(true)}>
            <Icon name="notifications-outline" size={24} color="#282c3f" />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton} onPress={() => setIsMenuVisible(true)}>
            <Icon name="menu-outline" size={26} color="#282c3f" />
          </TouchableOpacity>
        </View>
      </View>

      <AccountMenuModal
        visible={isMenuVisible}
        onClose={() => setIsMenuVisible(false)}
      />

      <NotificationsModal
        visible={isNotificationsVisible}
        onClose={() => setIsNotificationsVisible(false)}
      />
    </>
  );
};

export default TopHeader;
