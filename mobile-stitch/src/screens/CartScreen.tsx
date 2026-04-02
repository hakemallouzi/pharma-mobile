import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCart } from '../context/CartContext';
import { useLocale } from '../context/LocaleContext';
import { useAppNavigation } from '../navigation/useAppNavigation';
import { ClinicalHeader } from '../components/ClinicalHeader';
import type { ThemeColors } from '../theme/palettes';
import { screenRootBg } from '../theme/screenBackground';
import { useTheme } from '../theme/ThemeContext';

export function CartScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useAppNavigation();
  const { t, locale, isRTL } = useLocale();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createCartStyles(colors, isDark), [colors, isDark]);
  const { lines, removeItem, setQty } = useCart();
  const [promo, setPromo] = useState('');

  const subtotal = lines.reduce((sum, l) => sum + parseFloat(l.price) * l.qty, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  return (
    <View style={[styles.root, { direction: isRTL ? 'rtl' : 'ltr' }]}>
      <ClinicalHeader
        title={t.cartTitle}
      />
      <ScrollView contentContainerStyle={{ paddingBottom: 120 + insets.bottom, paddingHorizontal: 24 }}>
        <Text style={[styles.pageTitle, isRTL && styles.txtRight]}>{locale === 'ar' ? 'راجع مشترياتك' : 'Review Your Items'}</Text>
        <Text style={[styles.pageSub, isRTL && styles.txtRight]}>
          {locale === 'ar'
            ? `${lines.length} عنصر في سلتك`
            : `${lines.length} items in your medical sanctuary basket.`}
        </Text>

        {lines.length === 0 ? (
          <View style={styles.emptyBox}>
            <MaterialCommunityIcons name="cart-outline" size={34} color={colors.outline} />
            <Text style={styles.emptyTitle}>{t.cartEmpty}</Text>
            <Text style={styles.emptySub}>
              {locale === 'ar'
                ? 'أضف منتجات من الأقسام وستظهر هنا.'
                : 'Add products from categories and they will appear here.'}
            </Text>
          </View>
        ) : null}

        {lines.map((l) => (
          <View key={l.id} style={[styles.line, isRTL && styles.rowReverse]}>
            <View style={[styles.strip, isRTL && styles.stripRtl]} />
            <Image source={{ uri: l.image }} style={styles.thumb} contentFit="cover" />
            <View style={styles.lineBody}>
              <View style={[styles.lineTop, isRTL && styles.rowReverse]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.lineTitle, isRTL && styles.txtRight]}>{l.title}</Text>
                  <Text style={[styles.lineSub, isRTL && styles.txtRight]}>{l.sub}</Text>
                </View>
                <Pressable onPress={() => removeItem(l.id)}>
                  <MaterialCommunityIcons name="delete-outline" size={22} color={colors.onSurfaceVariant} />
                </Pressable>
              </View>
              <View style={[styles.lineFoot, isRTL && styles.rowReverse]}>
                <View style={[styles.stepper, isRTL && styles.rowReverse]}>
                  <Pressable onPress={() => setQty(l.id, -1)} style={styles.stepBtn}>
                    <MaterialCommunityIcons name="minus" size={18} color={colors.primary} />
                  </Pressable>
                  <Text style={styles.qty}>{l.qty}</Text>
                  <Pressable onPress={() => setQty(l.id, 1)} style={styles.stepBtn}>
                    <MaterialCommunityIcons name="plus" size={18} color={colors.primary} />
                  </Pressable>
                </View>
                <Text style={[styles.linePrice, isRTL && styles.txtRight]}>
                  ${(parseFloat(l.price) * l.qty).toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        ))}

        <View style={[styles.promoBox, { direction: isRTL ? 'rtl' : 'ltr' }]}>
          <Text style={[styles.promoLabel, isRTL && styles.txtRight]}>{locale === 'ar' ? 'رمز الخصم' : 'Promo Code'}</Text>
          <View style={[styles.promoRow, isRTL && styles.rowReverse]}>
            <TextInput
              style={[styles.promoInput, isRTL && styles.txtRight]}
              placeholder={locale === 'ar' ? 'مثال: VITALIS25' : 'VITALIS25'}
              placeholderTextColor={colors.outline}
              value={promo}
              onChangeText={setPromo}
              autoCapitalize="characters"
            />
            <Pressable style={styles.apply}>
              <Text style={[styles.applyTxt, isRTL && styles.txtRight]}>{locale === 'ar' ? 'تطبيق' : 'Apply'}</Text>
            </Pressable>
          </View>
        </View>

        <View style={[styles.sum, { direction: isRTL ? 'rtl' : 'ltr' }]}>
          <CartRow st={styles} isRTL={isRTL} label={locale === 'ar' ? 'الإجمالي الفرعي' : 'Subtotal'} value={`$${subtotal.toFixed(2)}`} />
          <CartRow st={styles} isRTL={isRTL} label={locale === 'ar' ? 'الشحن' : 'Eco-Shipping'} value={locale === 'ar' ? 'مجاني' : 'FREE'} highlight />
          <CartRow st={styles} isRTL={isRTL} label={locale === 'ar' ? 'الضريبة المتوقعة' : 'Estimated Tax'} value={`$${tax.toFixed(2)}`} />
          <View style={styles.divider} />
          <View style={[styles.totalRow, isRTL && styles.rowReverse]}>
            <Text style={[styles.totalLabel, isRTL && styles.txtRight]}>{locale === 'ar' ? 'المبلغ الإجمالي' : 'Total Amount'}</Text>
            <Text style={[styles.totalVal, isRTL && styles.txtRight]}>${total.toFixed(2)}</Text>
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
            <LinearGradient colors={[colors.primary, colors.primaryContainer]} style={[styles.checkout, isRTL && styles.rowReverse]}>
              <Text style={[styles.checkoutTxt, isRTL && styles.txtRight]}>{locale === 'ar' ? 'المتابعة للدفع' : 'Proceed to Checkout'}</Text>
              <MaterialCommunityIcons name={isRTL ? 'arrow-left' : 'arrow-right'} size={22} color={colors.onPrimaryContainer} />
            </LinearGradient>
          </Pressable>
        </View>

        <View style={[styles.secure, isRTL && styles.rowReverse, { direction: isRTL ? 'rtl' : 'ltr' }]}>
          <MaterialCommunityIcons name="shield-account" size={24} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.secureTitle, isRTL && styles.txtRight]}>{locale === 'ar' ? 'دفع آمن' : 'Secure Care'}</Text>
            <Text style={[styles.secureBody, isRTL && styles.txtRight]}>
              {locale === 'ar'
                ? 'عملية الدفع محمية بتشفير ومعايير خصوصية عالية.'
                : 'Your transaction is protected by end-to-end medical grade encryption and privacy standards.'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function CartRow({
  st,
  isRTL,
  label,
  value,
  highlight,
}: {
  st: ReturnType<typeof createCartStyles>;
  isRTL?: boolean;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <View style={[st.row, isRTL && st.rowReverse]}>
      <Text style={[st.rowLabel, isRTL && st.txtRight]}>{label}</Text>
      <Text style={[st.rowVal, isRTL && st.txtRight, highlight && { color: colors.primary, fontWeight: '800' }]}>{value}</Text>
    </View>
  );
}

function createCartStyles(c: ThemeColors, isDark: boolean) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: screenRootBg(isDark, c.background) },
    rowReverse: { flexDirection: 'row-reverse' },
    txtRight: { textAlign: 'right' },
    pageTitle: { fontSize: 32, fontWeight: '900', color: c.onSurface, marginTop: 8 },
    pageSub: { color: c.onSurfaceVariant, fontWeight: '600', marginBottom: 20 },
    emptyBox: {
      backgroundColor: c.surfaceContainerLow,
      borderRadius: 16,
      padding: 18,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      alignItems: 'center',
      marginBottom: 14,
      gap: 6,
    },
    emptyTitle: { fontSize: 16, fontWeight: '800', color: c.onSurface },
    emptySub: { fontSize: 12, color: c.onSurfaceVariant, textAlign: 'center', maxWidth: 280 },
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
    stripRtl: {
      left: undefined,
      right: 0,
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
