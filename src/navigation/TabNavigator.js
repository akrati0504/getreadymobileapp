import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import Home from '../screens/Home';
import Listings from '../screens/Listings';
import Sell from '../screens/Sell';
import Cart from '../screens/Cart';
import Profile from '../screens/Profile';
import Shop from '../screens/Shop';
import Analytics from '../screens/Analytics';
import Browse from '../screens/Browse';
import EditCloth from '../screens/EditCloth';
import MyInvoices from '../screens/MyInvoices';
import BottomNav from '../components/BottomNav';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={props => <BottomNav {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="HomeTab" component={Home} />
      <Tab.Screen name="Listings" component={Listings} />
      <Tab.Screen name="Shop" component={Shop} />
      <Tab.Screen name="Sell" component={Sell} />
      <Tab.Screen name="Analytics" component={Analytics} />
      <Tab.Screen name="Cart" component={Cart} />
      <Tab.Screen name="Profile" component={Profile} />
      <Tab.Screen
        name="Browse"
        component={Browse}
        options={{
          tabBarItemStyle: { display: 'none' }
        }}
      />
      <Tab.Screen
        name="EditCloth"
        component={EditCloth}
        options={{
          tabBarItemStyle: { display: 'none' }
        }}
      />
      <Tab.Screen
        name="MyInvoices"
        component={MyInvoices}
        options={{
          tabBarItemStyle: { display: 'none' }
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
