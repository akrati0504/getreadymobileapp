/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import '@react-native-firebase/app';
import messaging from '@react-native-firebase/messaging';
import { name as appName } from './app.json';

try {
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Message handled in the background!', remoteMessage);
  });
} catch (e) {
  console.log("Failed to set background message handler:", e);
}

AppRegistry.registerComponent(appName, () => App);
