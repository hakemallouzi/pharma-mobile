import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useMemo } from 'react';
import { useTheme } from '../theme/ThemeContext';
import { AddressesScreen } from '../screens/AddressesScreen';
import { AuthGateScreen } from '../screens/auth/AuthGateScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { SendOtpScreen } from '../screens/auth/SendOtpScreen';
import { SignupScreen } from '../screens/auth/SignupScreen';
import { VerifyOtpScreen } from '../screens/auth/VerifyOtpScreen';
import { CheckoutScreen } from '../screens/CheckoutScreen';
import { OrderDetailScreen } from '../screens/OrderDetailScreen';
import { BarcodeScanScreen } from '../screens/BarcodeScanScreen';
import { PharmacyListScreen } from '../screens/PharmacyListScreen';
import { ProductListScreen } from '../screens/ProductListScreen';
import type { RootStackParamList } from './navigationTypes';
import { MainTabs } from './MainTabs';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { colors, isDark } = useTheme();
  const screenOptions = useMemo(
    () => ({
      headerShown: false as const,
      contentStyle: { backgroundColor: isDark ? 'transparent' : colors.background },
      animation: 'slide_from_right' as const,
    }),
    [colors.background, isDark]
  );

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="AuthGate" component={AuthGateScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="SendOtp" component={SendOtpScreen} />
      <Stack.Screen name="VerifyOtp" component={VerifyOtpScreen} />
      <Stack.Screen name="Addresses" component={AddressesScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
      <Stack.Screen name="ProductList" component={ProductListScreen} />
      <Stack.Screen name="PharmacyList" component={PharmacyListScreen} />
      <Stack.Screen
        name="BarcodeScan"
        component={BarcodeScanScreen}
        options={{ animation: 'slide_from_bottom', presentation: 'fullScreenModal' }}
      />
    </Stack.Navigator>
  );
}
