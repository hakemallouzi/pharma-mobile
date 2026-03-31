import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ClinicalHeader } from '../components/ClinicalHeader';
import { useCart } from '../context/CartContext';
import type { RootStackParamList } from '../navigation/navigationTypes';
import type { ThemeColors } from '../theme/palettes';
import { screenRootBg } from '../theme/screenBackground';
import { useTheme } from '../theme/ThemeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductDetail'>;

export function ProductDetailScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const { addItem, cartCount, lines } = useCart();
  const { item } = route.params;
  const [qty, setQty] = useState(1);
  const itemId = `${item.category}-${item.title}`;
  const added = lines.some((l) => l.id === itemId);

  return (
    <View style={styles.root}>
      <ClinicalHeader
        title={item.title}
        onBack={() => navigation.goBack()}
        right={
          <Pressable style={styles.cartIconWrap} hitSlop={8} onPress={() => navigation.navigate('Main', { screen: 'Cart' })}>
            <MaterialCommunityIcons name="cart-outline" size={22} color={colors.primary} />
            {cartCount > 0 ? (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeTxt}>{cartCount > 99 ? '99+' : String(cartCount)}</Text>
              </View>
            ) : null}
          </Pressable>
        }
      />
      <ScrollView contentContainerStyle={{ paddingBottom: 120 + insets.bottom, paddingHorizontal: 24 }}>
        <View style={styles.imageWrap}>
          <Image source={{ uri: item.image }} style={styles.image} contentFit="cover" />
          {item.badge ? (
            <View style={[styles.badge, item.tertiary && styles.badgeTer]}>
              <Text style={[styles.badgeTxt, item.tertiary && { color: colors.tertiary }]}>{item.badge}</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.cat}>{item.category}</Text>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.price}>{item.price}</Text>
        <Text style={styles.sub}>{item.sub}</Text>
      </ScrollView>
      <View style={[styles.ctaWrap, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.qtyRow}>
          <Text style={styles.qtyLabel}>Quantity</Text>
          <View style={styles.stepper}>
            <Pressable
              onPress={() => {
                setQty((v) => Math.max(1, v - 1));
              }}
              style={styles.stepBtn}
            >
              <MaterialCommunityIcons name="minus" size={18} color={colors.primary} />
            </Pressable>
            <Text style={styles.qty}>{qty}</Text>
            <Pressable
              onPress={() => {
                setQty((v) => v + 1);
              }}
              style={styles.stepBtn}
            >
              <MaterialCommunityIcons name="plus" size={18} color={colors.primary} />
            </Pressable>
          </View>
        </View>
        <Pressable
          onPress={() => {
            addItem({
              id: itemId,
              title: item.title,
              sub: item.sub,
              price: item.priceValue.toFixed(2),
              image: item.image,
              qty,
            });
          }}
        >
          <LinearGradient
            colors={added ? [colors.secondary, colors.secondaryContainer] : [colors.primary, colors.primaryContainer]}
            style={styles.cta}
          >
            <MaterialCommunityIcons
              name={added ? 'check-circle-outline' : 'cart-plus'}
              size={20}
              color={added ? colors.onSecondaryContainer : colors.onPrimaryContainer}
            />
            <Text style={[styles.ctaTxt, added && { color: colors.onSecondaryContainer }]}>
              {added ? 'Added to Cart' : 'Add to Cart'}
            </Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

function createStyles(c: ThemeColors, isDark: boolean) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: screenRootBg(isDark, c.background) },
    imageWrap: {
      borderRadius: 20,
      overflow: 'hidden',
      backgroundColor: c.surfaceContainerHigh,
      marginTop: 10,
    },
    image: { width: '100%', aspectRatio: 1 },
    badge: {
      position: 'absolute',
      top: 12,
      left: 12,
      backgroundColor: c.tabPillActive,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 8,
    },
    badgeTer: { backgroundColor: `${c.tertiary}40` },
    badgeTxt: { fontSize: 10, fontWeight: '900', letterSpacing: 1, color: c.primary, textTransform: 'uppercase' },
    cartIconWrap: {
      position: 'relative',
    },
    cartBadge: {
      position: 'absolute',
      right: -8,
      top: -8,
      minWidth: 16,
      height: 16,
      borderRadius: 8,
      paddingHorizontal: 3,
      backgroundColor: c.primary,
      borderWidth: 1,
      borderColor: c.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cartBadgeTxt: {
      fontSize: 9,
      fontWeight: '900',
      color: c.onPrimary,
      lineHeight: 11,
    },
    cat: { marginTop: 20, fontSize: 11, fontWeight: '800', letterSpacing: 1, color: c.primary, textTransform: 'uppercase' },
    title: { marginTop: 8, fontSize: 30, fontWeight: '900', color: c.onSurface },
    price: { marginTop: 10, fontSize: 28, fontWeight: '900', color: c.onSurface },
    sub: { marginTop: 14, fontSize: 15, lineHeight: 24, color: c.onSurfaceVariant },
    ctaWrap: {
      paddingHorizontal: 24,
      borderTopWidth: 1,
      borderColor: c.outlineVariant,
      backgroundColor: c.background,
    },
    qtyRow: {
      marginTop: 10,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    qtyLabel: { fontSize: 13, fontWeight: '700', color: c.onSurfaceVariant },
    stepper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.surfaceContainerHigh,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: c.outlineVariant,
    },
    stepBtn: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
    qty: { minWidth: 24, textAlign: 'center', fontWeight: '800', color: c.onSurface },
    cta: {
      borderRadius: 16,
      paddingVertical: 14,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
    },
    ctaTxt: { color: c.onPrimaryContainer, fontSize: 16, fontWeight: '800' },
  });
}
