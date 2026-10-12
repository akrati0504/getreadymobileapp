/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import '@react-native-firebase/app';
import messaging from '@react-native-firebase/messaging';
import { name as appName } from './app.json';

try {
  const messagingModule = require('@react-native-firebase/messaging');
  let m = null;
  if (typeof messagingModule === 'function') m = messagingModule;
  else if (messagingModule && typeof messagingModule.default === 'function') m = messagingModule.default;
  
  if (m) {
    m().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Message handled in the background!', remoteMessage);
    });
  } else if (messagingModule && typeof messagingModule.setBackgroundMessageHandler === 'function') {
    messagingModule.setBackgroundMessageHandler(async remoteMessage => {
      console.log('Message handled in the background!', remoteMessage);
    });
  }
} catch (e) {
  console.log("Failed to set background message handler:", e);
}

AppRegistry.registerComponent(appName, () => App);
