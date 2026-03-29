import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { imagesB2 } from '../assets/imagesBatch2';
import { useAppNavigation } from '../navigation/useAppNavigation';
import type { CheckoutCartLine } from '../navigation/navigationTypes';
import { ClinicalHeader } from '../components/ClinicalHeader';
import type { ThemeColors } from '../theme/palettes';
import { screenRootBg } from '../theme/screenBackground';
import { useTheme } from '../theme/ThemeContext';

const initial: CheckoutCartLine[] = [
  {
    id: '1',
    title: 'Vitalis Multivitamin Complex',
    sub: '60 Capsules',
    price: '42.00',
    qty: 1,
    image: imagesB2.cartItem1,
  },
  {
    id: '2',
    title: 'Sleep Support Tincture',
    sub: '30ml | Organic',
    price: '56.00',
    qty: 2,
    image: imagesB2.cartItem2,
  },
  {
    id: '3',
    title: 'Advanced Glucose Sensor',
    sub: 'Pack of 2',
    price: '125.00',
    qty: 1,
    image: imagesB2.cartItem3,
  },
];

export function CartScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useAppNavigation();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createCartStyles(colors, isDark), [colors, isDark]);
  const [lines, setLines] = useState(initial);
  const [promo, setPromo] = useState('');

  const subtotal = lines.reduce((sum, l) => sum + parseFloat(l.price) * l.qty, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const setQty = (id: string, delta: number) => {
    setLines((prev) =>
      prev.map((l) => (l.id === id ? { ...l, qty: Math.max(1, l.qty + delta) } : l))
    );
  };

  return (
    <View style={styles.root}>
      <ClinicalHeader
        title="Your Cart"
        right={
          <Pressable hitSlop={8}>
            <MaterialCommunityIcons name="dots-vertical" size={24} color={colors.primary} />
          </Pressable>
        }
      />
      <ScrollView contentContainerStyle={{ paddingBottom: 120 + insets.bottom, paddingHorizontal: 24 }}>
        <Text style={styles.pageTitle}>Review Your Items</Text>
        <Text style={styles.pageSub}>{lines.length} items in your medical sanctuary basket.</Text>

        {lines.map((l) => (
          <View key={l.id} style={styles.line}>
            <View style={styles.strip} />
            <Image source={{ uri: l.image }} style={styles.thumb} contentFit="cover" />
            <View style={styles.lineBody}>
              <View style={styles.lineTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.lineTitle}>{l.title}</Text>
                  <Text style={styles.lineSub}>{l.sub}</Text>
                </View>
                <Pressable onPress={() => setLines((p) => p.filter((x) => x.id !== l.id))}>
                  <MaterialCommunityIcons name="delete-outline" size={22} color={colors.onSurfaceVariant} />
                </Pressable>
              </View>
              <View style={styles.lineFoot}>
                <View style={styles.stepper}>
                  <Pressable onPress={() => setQty(l.id, -1)} style={styles.stepBtn}>
                    <MaterialCommunityIcons name="minus" size={18} color={colors.primary} />
                  </Pressable>
                  <Text style={styles.qty}>{l.qty}</Text>
                  <Pressable onPress={() => setQty(l.id, 1)} style={styles.stepBtn}>
                    <MaterialCommunityIcons name="plus" size={18} color={colors.primary} />
                  </Pressable>
                </View>
                <Text style={styles.linePrice}>
                  ${(parseFloat(l.price) * l.qty).toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        ))}

        <View style={styles.promoBox}>
          <Text style={styles.promoLabel}>Promo Code</Text>
          <View style={styles.promoRow}>
            <TextInput
              style={styles.promoInput}
              placeholder="VITALIS25"
              placeholderTextColor={colors.outline}
              value={promo}
              onChangeText={setPromo}
              autoCapitalize="characters"
            />
            <Pressable style={styles.apply}>
              <Text style={styles.applyTxt}>Apply</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.sum}>
          <CartRow st={styles} label="Subtotal" value={`$${subtotal.toFixed(2)}`} />
          <CartRow st={styles} label="Eco-Shipping" value="FREE" highlight />
          <CartRow st={styles} label="Estimated Tax" value={`$${tax.toFixed(2)}`} />
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalVal}>${total.toFixed(2)}</Text>
          </View>
          <Pressable
            onPress={() =>
              navigation.navigate('Checkout', {
                lines: lines.map(({ id, title, sub, price, qty, image }) => ({
                  id,
                  title,
                  sub,
                  price,
                  qty,
                  image,
                })),
                promoCode: promo.trim() || undefined,
              })
            }
          >
            <LinearGradient colors={[colors.primary, colors.primaryContainer]} style={styles.checkout}>
              <Text style={styles.checkoutTxt}>Proceed to Checkout</Text>
              <MaterialCommunityIcons name="arrow-right" size={22} color={colors.onPrimaryContainer} />
            </LinearGradient>
          </Pressable>
        </View>

        <View style={styles.secure}>
          <MaterialCommunityIcons name="shield-account" size={24} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.secureTitle}>Secure Care</Text>
            <Text style={styles.secureBody}>
              Your transaction is protected by end-to-end medical grade encryption and privacy standards.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function CartRow({
  st,
  label,
  value,
  highlight,
}: {
  st: ReturnType<typeof createCartStyles>;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <View style={st.row}>
      <Text style={st.rowLabel}>{label}</Text>
      <Text style={[st.rowVal, highlight && { color: colors.primary, fontWeight: '800' }]}>{value}</Text>
    </View>
  );
}

function createCartStyles(c: ThemeColors, isDark: boolean) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: screenRootBg(isDark, c.background) },
    pageTitle: { fontSize: 32, fontWeight: '900', color: c.onSurface, marginTop: 8 },
    pageSub: { color: c.onSurfaceVariant, fontWeight: '600', marginBottom: 20 },
    line: {
      flexDirection: 'row',
      backgroundColor: c.surfaceContainerLow,
      borderRadius: 16,
      padding: 14,
      gap: 14,
      marginBottom: 12,
      position: 'relative',
      overflow: 'hidden',
    },
    strip: {
      position: 'absolute',
      left: 0,
      top: '25%',
      bottom: '25%',
      width: 3,
      backgroundColor: c.primary,
      borderRadius: 2,
    },
    thumb: { width: 96, height: 96, borderRadius: 12, backgroundColor: c.surfaceContainerHigh },
    lineBody: { flex: 1, justifyContent: 'space-between' },
    lineTop: { flexDirection: 'row', gap: 8 },
    lineTitle: { fontSize: 16, fontWeight: '800', color: c.onSurface },
    lineSub: { fontSize: 11, fontWeight: '800', letterSpacing: 1, color: c.primary, marginTop: 4 },
    lineFoot: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 8 },
    stepper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.surfaceContainerHigh,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: c.outlineVariant,
    },
    stepBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
    qty: { paddingHorizontal: 12, fontWeight: '800', color: c.onSurface },
    linePrice: { fontSize: 20, fontWeight: '900', color: c.onSurface },
    promoBox: {
      backgroundColor: c.surfaceContainerLow,
      borderRadius: 18,
      padding: 20,
      marginTop: 8,
    },
    promoLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 2, color: c.primary, marginBottom: 12 },
    promoRow: { flexDirection: 'row', gap: 10 },
    promoInput: {
      flex: 1,
      backgroundColor: c.surfaceContainerHighest,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 10,
      color: c.onSurface,
      fontWeight: '800',
      letterSpacing: 1,
    },
    apply: {
      backgroundColor: c.primaryContainer,
      paddingHorizontal: 18,
      borderRadius: 12,
      justifyContent: 'center',
    },
    applyTxt: { color: c.onPrimaryContainer, fontWeight: '800', fontSize: 11, letterSpacing: 1 },
    sum: {
      backgroundColor: c.surfaceContainerLow,
      borderRadius: 18,
      padding: 22,
      marginTop: 16,
      gap: 12,
    },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    rowLabel: { color: c.onSurfaceVariant, fontSize: 14, fontWeight: '600' },
    rowVal: { color: c.onSurface, fontWeight: '800' },
    divider: { height: StyleSheet.hairlineWidth, backgroundColor: c.outlineVariant, marginVertical: 4 },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 },
    totalLabel: { fontSize: 18, fontWeight: '800', color: c.onSurface },
    totalVal: { fontSize: 30, fontWeight: '900', color: c.onSurface },
    checkout: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      paddingVertical: 16,
      borderRadius: 18,
      marginTop: 8,
    },
    checkoutTxt: { color: c.onPrimaryContainer, fontSize: 17, fontWeight: '800' },
    secure: {
      flexDirection: 'row',
      gap: 12,
      padding: 20,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      marginTop: 16,
    },
    secureTitle: { fontSize: 11, fontWeight: '800', letterSpacing: 1, color: c.onSurface },
    secureBody: { fontSize: 11, color: c.onSurfaceVariant, marginTop: 6, lineHeight: 16 },
  });
}
