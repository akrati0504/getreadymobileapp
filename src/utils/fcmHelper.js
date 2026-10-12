import { Alert, PermissionsAndroid, Platform } from 'react-native';
import api from '../api/api';

export const requestUserPermission = async () => {
  try {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Notification permission denied by Android');
        return false;
      }
    }
    return true;
  } catch (error) {
    console.log('Error requesting permission:', error);
    return false;
  }
};

export const getFCMToken = async () => {
  try {
    await requestUserPermission();
    
    // 1. Check if Firebase App is initialized
    try {
        const appModule = require('@react-native-firebase/app');
        const firebase = appModule.default || appModule;
        if (!firebase.apps || firebase.apps.length === 0) {
            console.log('Firebase App is NOT initialized natively!');
            // We will bypass Firebase completely to allow login
            return "dummy_token_bypassing_firebase_error";
        }
    } catch(e) {
        console.log("Firebase app check failed:", e);
    }

    const messagingModule = require('@react-native-firebase/messaging');
    
    if (!messagingModule) {
        return "dummy_token_bypassing_firebase_error";
    }

    let messagingInstance;
    if (typeof messagingModule === 'function') {
        messagingInstance = messagingModule();
    } else if (typeof messagingModule.default === 'function') {
        messagingInstance = messagingModule.default();
    } else {
        messagingInstance = messagingModule;
    }

    if (!messagingInstance) {
        return "dummy_token_bypassing_firebase_error";
    }

    // Wrap the getToken call in an inner try-catch because the Proxy throws here
    try {
        const fcmToken = await messagingInstance.getToken();
        if (fcmToken) {
            console.log('Your Firebase Token is:', fcmToken);
            return fcmToken;
        }
    } catch (innerError) {
        console.log("Firebase Proxy threw an error natively:", innerError);
        Alert.alert("Native Firebase Error", "The Firebase native module is failing internally. A dummy token will be generated so you can log in.");
        return "dummy_token_from_proxy_error";
    }

    return "dummy_token_bypassing_firebase_error";

  } catch (error) {
    console.log('Error getting FCM token:', error);
    return "dummy_token_bypassing_firebase_error";
  }
};

// Sync token with Laravel Backend
export const updateTokenOnBackend = async (token, userToken) => {
  if (!userToken) return;

  try {
    const response = await api.post(
      '/profile/update-fcm',
      { fcm_token: token },
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );
    console.log('FCM token sent to backend successfully');
  } catch (error) {
    console.log('Error updating FCM token on backend');
  }
};

export const notificationListener = () => {
  try {
    const messagingModule = require('@react-native-firebase/messaging');
    let m = null;
    if (typeof messagingModule === 'function') m = messagingModule;
    else if (messagingModule && typeof messagingModule.default === 'function') m = messagingModule.default;
    
    const instance = m ? m() : messagingModule;

    if (!instance || typeof instance.onMessage !== 'function') return () => {};

    // 1. Foreground State
    const unsubscribe = instance.onMessage(async remoteMessage => {
      console.log('Foreground message:', JSON.stringify(remoteMessage));
      if (remoteMessage.notification) {
        Alert.alert(remoteMessage.notification.title, remoteMessage.notification.body);
      }
    });

    // 2. Background State
    if (typeof instance.onNotificationOpenedApp === 'function') {
      instance.onNotificationOpenedApp(remoteMessage => {
        console.log('App opened from background:', remoteMessage?.notification);
      });
    }

    // 3. Quit State
    if (typeof instance.getInitialNotification === 'function') {
      instance.getInitialNotification().then(remoteMessage => {
        if (remoteMessage) {
          console.log('App opened from quit state:', remoteMessage.notification);
        }
      }).catch(() => {});
    }

    return unsubscribe;
  } catch (error) {
    console.log('Notification listener error:', error);
    return () => {};
  }
};

