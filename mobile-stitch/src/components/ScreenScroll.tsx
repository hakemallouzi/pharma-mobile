import React, { useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ThemeColors } from '../theme/palettes';
import { screenRootBg } from '../theme/screenBackground';
import { useLocale } from '../context/LocaleContext';
import { useTheme } from '../theme/ThemeContext';

/** Horizontal inset for `ScreenScroll` and most stacked screens. For horizontal carousels inside padded content, use `marginHorizontal: -SCREEN_CONTENT_GUTTER` on the scroll and matching horizontal padding in `contentContainerStyle`. */
export const SCREEN_CONTENT_GUTTER = 24;

type Props = ScrollViewProps & {
  children: React.ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** Extra bottom padding for tab bar */
  bottomInset?: number;
};

export function ScreenScroll({
  children,
  contentContainerStyle,
  bottomInset = 100,
  ...rest
}: Props) {
  const insets = useSafeAreaInsets();
  const { isRTL } = useLocale();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  return (
    <ScrollView
      {...rest}
      style={[styles.scroll, { direction: isRTL ? 'rtl' : 'ltr' }]}
      contentContainerStyle={[
        {
          paddingBottom: insets.bottom + bottomInset,
          paddingHorizontal: SCREEN_CONTENT_GUTTER,
          paddingTop: 8,
        },
        contentContainerStyle,
      ]}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}

function createStyles(colors: ThemeColors, isDark: boolean) {
  return StyleSheet.create({
    scroll: {
      flex: 1,
      backgroundColor: screenRootBg(isDark, colors.background),
    },
  });
}
