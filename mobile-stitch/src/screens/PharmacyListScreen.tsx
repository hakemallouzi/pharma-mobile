import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useLocale } from '../context/LocaleContext';
import type { ThemeColors } from '../theme/palettes';
import { useTheme } from '../theme/ThemeContext';
import type { RootStackParamList } from '../navigation/navigationTypes';
import { PharmacyListArScreen } from './PharmacyListArScreen';
import { PharmacyListEnScreen } from './PharmacyListEnScreen';

type Props = NativeStackScreenProps<RootStackParamList, 'PharmacyList'>;

export function PharmacyListScreen({ route }: Props) {
  const { isRTL } = useLocale();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createWrapStyles(colors, isDark), [colors, isDark]);

  return (
    <View style={[styles.wrap, { direction: isRTL ? 'rtl' : 'ltr' }]}>
      <View style={styles.foreground}>
        {isRTL ? <PharmacyListArScreen mapParams={route.params} /> : <PharmacyListEnScreen mapParams={route.params} />}
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
