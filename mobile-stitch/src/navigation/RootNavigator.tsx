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
import { PharmacyDetailScreen } from '../screens/PharmacyDetailScreen';
import { SpecialistChatScreen } from '../screens/SpecialistChatScreen';
import { ProductDetailScreen } from '../screens/ProductDetailScreen';
import { ProductListScreen } from '../screens/ProductListScreen';
import { OrdersHistoryScreen } from '../screens/OrdersHistoryScreen';
import type { RootStackParamList } from './navigationTypes';
import { MainTabs } from './MainTabs';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { colors } = useTheme();
  const screenOptions = useMemo(
    () => ({
      headerShown: false as const,
      // Keep scene opaque to avoid previous/next screens showing through during transitions.
      contentStyle: { backgroundColor: colors.background },
      animation: 'slide_from_right' as const,
    }),
    [colors.background]
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
      <Stack.Screen name="OrdersHistory" component={OrdersHistoryScreen} />
      <Stack.Screen name="ProductList" component={ProductListScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="PharmacyList" component={PharmacyListScreen} />
      <Stack.Screen name="PharmacyDetail" component={PharmacyDetailScreen} />
      <Stack.Screen name="SpecialistChat" component={SpecialistChatScreen} />
      <Stack.Screen
        name="BarcodeScan"
        component={BarcodeScanScreen}
        options={{ animation: 'slide_from_bottom', presentation: 'fullScreenModal' }}
      />
    </Stack.Navigator>
  );
}
