import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocale } from '../context/LocaleContext';
import type { ThemeColors } from '../theme/palettes';
import { screenRootBg } from '../theme/screenBackground';
import { useTheme } from '../theme/ThemeContext';
import { HomeArScreen } from './HomeArScreen';
import { HomeEnScreen } from './HomeEnScreen';

export function HomeScreen() {
  const { isRTL } = useLocale();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createWrapStyles(colors, isDark), [colors, isDark]);

  return (
    <View style={[styles.wrap, { direction: isRTL ? 'rtl' : 'ltr' }]}>
      {isRTL ? <HomeArScreen /> : <HomeEnScreen />}
    </View>
  );
}

function createWrapStyles(c: ThemeColors, isDark: boolean) {
  return StyleSheet.create({
    wrap: { flex: 1, backgroundColor: screenRootBg(isDark, c.background) },
  });
}
