import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, { useMemo } from 'react';
import { CartScreen } from '../screens/CartScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { ProfileHubScreen } from '../screens/ProfileHubScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { SpecialistChatTabScreen } from '../screens/SpecialistChatTabScreen';
import { GlassTabBar } from '../components/GlassTabBar';
import type { MainTabParamList } from './navigationTypes';
import { useTheme } from '../theme/ThemeContext';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabs() {
  const { colors } = useTheme();
  const sceneStyle = useMemo(
    // Opaque tab scenes prevent overlap artifacts while switching tabs.
    () => ({ backgroundColor: colors.background }),
    [colors.background]
  );
  return (
    <Tab.Navigator
      tabBar={(props) => <GlassTabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Chat" component={SpecialistChatTabScreen} />
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="Profile" component={ProfileHubScreen} />
    </Tab.Navigator>
  );
}
