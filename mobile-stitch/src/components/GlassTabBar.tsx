import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import type { ThemeColors } from '../theme/palettes';
import { useLocale } from '../context/LocaleContext';
import { useTheme } from '../theme/ThemeContext';

const icons: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
  Home: 'home',
  Search: 'magnify',
  Chat: 'chat-processing-outline',
  Cart: 'cart',
  Profile: 'account',
};

export function GlassTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { t, isRTL } = useLocale();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const labels: Record<string, string> = {
    Home: t.tabHome,
    Search: t.tabSearch,
    Chat: t.tabChat,
    Cart: t.tabCart,
    Profile: t.tabProfile,
  };

  const iosBlurIntensity = isDark ? 92 : 100;
  const blurTint = isDark ? 'dark' : 'light';
  const tabChromeBottom = Math.max(insets.bottom, 10);

  /** White rim light (not brand green) — reads on both blur tints. */
  const tabTopGlowColors = useMemo(
    () =>
      isDark
        ? (['rgba(255,255,255,0.5)', 'rgba(255,255,255,0.12)', 'transparent'] as const)
        : (['rgba(255,255,255,0.72)', 'rgba(255,255,255,0.22)', 'transparent'] as const),
    [isDark]
  );

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrapper, { direction: isRTL ? 'rtl' : 'ltr' }]}
    >
      {Platform.OS === 'ios' ? (
        <BlurView intensity={iosBlurIntensity} tint={blurTint} style={styles.blur}>
          <LinearGradient
            pointerEvents="none"
            colors={[...tabTopGlowColors]}
            locations={[0, 0.35, 1]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.tabTopGlow}
          />
          <View style={[styles.tabChrome, { paddingBottom: tabChromeBottom }]}>
            <TabRow
              state={state}
              navigation={navigation}
              labels={labels}
              colors={colors}
              styles={styles}
            />
          </View>
        </BlurView>
      ) : (
        <View style={[styles.blur, { backgroundColor: colors.glassBar }]}>
          <LinearGradient
            pointerEvents="none"
            colors={[...tabTopGlowColors]}
            locations={[0, 0.35, 1]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.tabTopGlow}
          />
          <View style={[styles.tabChrome, { paddingBottom: tabChromeBottom }]}>
            <TabRow
              state={state}
              navigation={navigation}
              labels={labels}
              colors={colors}
              styles={styles}
            />
          </View>
        </View>
      )}
    </View>
  );
}

function TabRow({
  state,
  navigation,
  labels,
  colors,
  styles,
}: Pick<BottomTabBarProps, 'state' | 'navigation'> & {
  labels: Record<string, string>;
  colors: ThemeColors;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.row}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const name = route.name;
        const iconName = icons[name] ?? 'circle';

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityLabel={labels[name] ?? name}
            accessibilityState={isFocused ? { selected: true } : {}}
            onPress={onPress}
            style={[styles.tab, isFocused && { backgroundColor: colors.tabPillActive }]}
          >
            <MaterialCommunityIcons
              name={iconName}
              size={24}
              color={isFocused ? colors.primary : colors.tabInactive}
            />
            <Text style={[styles.label, isFocused && { color: colors.primary }]}>
              {labels[name] ?? name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    wrapper: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
    },
    blur: {
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      overflow: 'hidden',
      borderWidth: 0,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.16,
          shadowRadius: 20,
        },
        android: { elevation: 16 },
      }),
    },
    tabTopGlow: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 28,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
    },
    /** Safe-area + top padding; blur fills to the physical bottom edge. */
    tabChrome: {
      paddingTop: 12,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingBottom: 4,
    },
    tab: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 16,
      minWidth: 72,
    } as ViewStyle,
    label: {
      marginTop: 4,
      fontSize: 11,
      fontWeight: '600',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
      color: colors.tabInactive,
    },
  });
}
