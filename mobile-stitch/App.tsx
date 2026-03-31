import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import { LocaleProvider } from './src/context/LocaleContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import {
  AnimatedDarkBackdrop,
  BubbleHitOverlay,
  useBubbleHitRegistry,
} from './src/components/AnimatedDarkBackdrop';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';

function ThemedRoot() {
  const { isDark } = useTheme();
  const [hits, bubbleDispatch] = useBubbleHitRegistry();
  return (
    <View style={styles.root}>
      <AnimatedDarkBackdrop dispatch={bubbleDispatch} />
      <View style={styles.foreground} pointerEvents="box-none">
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <RootNavigator />
      </View>
      <BubbleHitOverlay hits={hits} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  foreground: { flex: 1, zIndex: 1 },
});

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LocaleProvider>
          <AuthProvider>
            <CartProvider>
              <NavigationContainer>
                <ThemedRoot />
              </NavigationContainer>
            </CartProvider>
          </AuthProvider>
        </LocaleProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
