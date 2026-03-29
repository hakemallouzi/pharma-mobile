import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, { useMemo } from 'react';
import { CartScreen } from '../screens/CartScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { OrdersHistoryScreen } from '../screens/OrdersHistoryScreen';
import { ProfileHubScreen } from '../screens/ProfileHubScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { GlassTabBar } from '../components/GlassTabBar';
import type { MainTabParamList } from './navigationTypes';
import { useTheme } from '../theme/ThemeContext';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabs() {
  const { colors, isDark } = useTheme();
  const sceneStyle = useMemo(
    () => ({ backgroundColor: isDark ? 'transparent' : colors.background }),
    [colors.background, isDark]
  );
  return (
    <Tab.Navigator
      tabBar={(props) => <GlassTabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Orders" component={OrdersHistoryScreen} />
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="Profile" component={ProfileHubScreen} />
    </Tab.Navigator>
  );
}
