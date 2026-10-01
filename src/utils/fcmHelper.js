import messaging from '@react-native-firebase/messaging';
import { Alert, PermissionsAndroid, Platform } from 'react-native';
// import axios from 'axios'; // Un-comment to use axios for backend sync

export const requestUserPermission = async () => {
  try {
    // For Android 13+
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Notification permission denied');
        return false;
      }
    }

    // Request permissions for iOS (and general Firebase init)
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Authorization status:', authStatus);
      return true;
    }
    return false;
  } catch (error) {
    console.log('Error requesting permission:', error);
    return false;
  }
};

export const getFCMToken = async () => {
  try {
    const fcmToken = await messaging().getToken();
    if (fcmToken) {
      console.log('Your Firebase Token is:', fcmToken);
      // NOTE: Call updateTokenOnBackend(fcmToken) here when user is logged in
      return fcmToken;
    } else {
      console.log('Failed to get FCM token');
    }
  } catch (error) {
    console.log('Error getting FCM token:', error);
  }
};

// Example function to sync token with your backend (users table)
export const updateTokenOnBackend = async (token, userId) => {
  try {
    /* 
    await axios.post(`https://your-backend-api.com/update-fcm`, {
      userId: userId,
      fcm_token: token,
    });
    */
    console.log('FCM token sent to backend');
  } catch (error) {
    console.log('Error updating FCM token on backend', error);
  }
};

export const notificationListener = () => {
  try {
    // 1. Foreground State
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('A new FCM message arrived in the foreground!', JSON.stringify(remoteMessage));
      if (remoteMessage.notification) {
        Alert.alert(remoteMessage.notification.title, remoteMessage.notification.body);
      }
    });

    // 2. Background State (Tapped by user)
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('Notification caused app to open from background state:', remoteMessage.notification);
    });

    // 3. Quit State (Tapped by user)
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('Notification caused app to open from quit state:', remoteMessage.notification);
        }
      });

    return unsubscribe;
  } catch (error) {
    console.log('Firebase notification listener error:', error);
    return () => {};
  }
};

