import { NavigationContainer, createNavigationContainerRef, type NavigationState } from '@react-navigation/native';
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
import { PersistentBottomNav } from './src/components/PersistentBottomNav';
import type { RootStackParamList } from './src/navigation/navigationTypes';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';

const navRef = createNavigationContainerRef<RootStackParamList>();

function ThemedRoot({ navState }: { navState?: NavigationState }) {
  const { isDark } = useTheme();
  const [hits, bubbleDispatch] = useBubbleHitRegistry();
  return (
    <View style={styles.root}>
      <AnimatedDarkBackdrop dispatch={bubbleDispatch} />
      <View style={styles.foreground} pointerEvents="box-none">
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <RootNavigator />
        <PersistentBottomNav navRef={navRef} navState={navState} />
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
  const [navState, setNavState] = React.useState<NavigationState | undefined>(undefined);
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LocaleProvider>
          <AuthProvider>
            <CartProvider>
              <NavigationContainer
                ref={navRef}
                onReady={() => setNavState(navRef.getRootState())}
                onStateChange={() => setNavState(navRef.getRootState())}
              >
                <ThemedRoot navState={navState} />
              </NavigationContainer>
            </CartProvider>
          </AuthProvider>
        </LocaleProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
