import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ThemeColors } from '../theme/palettes';
import { useTheme } from '../theme/ThemeContext';

type Props = {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
  subtitle?: string;
};

export function ClinicalHeader({ title, onBack, right, subtitle }: Props) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={[styles.bar, { paddingTop: insets.top + 8 }]}>
      <View style={styles.left}>
        {onBack ? (
          <Pressable onPress={onBack} hitSlop={12} style={styles.iconBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.primary} />
          </Pressable>
        ) : (
          <View style={styles.iconPlaceholder} />
        )}
        <View>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          <Text style={styles.title}>{title}</Text>
        </View>
      </View>
      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    bar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingBottom: 12,
      backgroundColor: colors.headerBar,
    },
    left: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
    iconBtn: { padding: 4 },
    iconPlaceholder: { width: 32 },
    subtitle: {
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 1,
      color: colors.onSurfaceVariant,
      textTransform: 'uppercase',
    },
    title: { fontSize: 18, fontWeight: '800', color: colors.primary },
    right: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  });
}
