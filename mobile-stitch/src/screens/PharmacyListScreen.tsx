import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocale } from '../context/LocaleContext';
import type { ThemeColors } from '../theme/palettes';
import { useTheme } from '../theme/ThemeContext';
import { PharmacyListArScreen } from './PharmacyListArScreen';
import { PharmacyListEnScreen } from './PharmacyListEnScreen';

export function PharmacyListScreen() {
  const { isRTL } = useLocale();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createWrapStyles(colors, isDark), [colors, isDark]);

  return (
    <View style={[styles.wrap, { direction: isRTL ? 'rtl' : 'ltr' }]}>
      <View style={styles.foreground}>
        {isRTL ? <PharmacyListArScreen /> : <PharmacyListEnScreen />}
      </View>
    </View>
  );
}

function createWrapStyles(c: ThemeColors, isDark: boolean) {
  return StyleSheet.create({
    wrap: { flex: 1, backgroundColor: isDark ? 'transparent' : c.background },
    foreground: { flex: 1 },
  });
}
