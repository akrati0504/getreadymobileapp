import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from '../screens/Login';
import TabNavigator from './TabNavigator';
import ProductDetails from '../screens/ProductDetails';
import Splash from '../screens/Splash';
import RejectedItems from '../screens/RejectedItems';
import Browse from '../screens/Browse';
import FixRejection from '../screens/FixRejection';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={Splash} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Home" component={TabNavigator} />
      <Stack.Screen name="ProductDetails" component={ProductDetails} />
      <Stack.Screen name="RejectedItems" component={RejectedItems} />
      <Stack.Screen name="FixRejection" component={FixRejection} />
      <Stack.Screen name="Browse" component={Browse} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
