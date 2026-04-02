import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ClinicalHeader } from '../components/ClinicalHeader';
import { useCart } from '../context/CartContext';
import { useLocale } from '../context/LocaleContext';
import type { RootStackParamList } from '../navigation/navigationTypes';
import type { ThemeColors } from '../theme/palettes';
import { screenRootBg } from '../theme/screenBackground';
import { useTheme } from '../theme/ThemeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductDetail'>;

export function ProductDetailScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { locale, isRTL } = useLocale();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const { addItem, lines } = useCart();
  const { item } = route.params;
  const [qty, setQty] = useState(1);
  const doseOptions = item.doses?.length ? item.doses : undefined;
  const [selectedDoseIndex, setSelectedDoseIndex] = useState(0);
  // `PersistentBottomNav` is absolutely positioned and overlays the bottom of the screen.
  // Add extra bottom padding so the CTA remains tappable.
  const bottomNavInset = Math.max(insets.bottom, 10);
  const bottomNavOverlayHeight = 67 + bottomNavInset;
  const categoryLabel =
    locale === 'ar'
      ? item.category === 'Medicines'
        ? 'الأدوية'
        : item.category === 'Vitamins'
          ? 'الفيتامينات'
          : item.category === 'Baby Care'
            ? 'العناية بالطفل'
            : item.category === 'Skincare'
              ? 'العناية بالبشرة'
              : item.category
      : item.category;
  const badgeLabel =
    locale === 'ar'
      ? item.badge === 'Pure Grade'
        ? 'درجة نقاء'
        : item.badge === 'Bestseller'
          ? 'الأكثر مبيعا'
          : item.badge
      : item.badge;
  const itemTitle = locale === 'ar' ? item.titleAr ?? item.title : item.title;
  const itemSub = locale === 'ar' ? item.subAr ?? item.sub : item.sub;
  const selectedDose = doseOptions ? doseOptions[Math.min(selectedDoseIndex, doseOptions.length - 1)] : undefined;
  const selectedDoseLabel = selectedDose?.label;
  const dosePriceValue = selectedDose?.priceValue ?? item.priceValue;
  const dosePriceDisplay = selectedDose?.price ?? item.price;
  const cartItemId = selectedDoseLabel ? `${item.category}-${item.title}-${selectedDoseLabel}` : `${item.category}-${item.title}`;
  const added = lines.some((l) => l.id === cartItemId);
  const shareMessage =
    locale === 'ar'
      ? `مرحبًا، لدي سؤال عن "${itemTitle}${selectedDoseLabel ? ` ${selectedDoseLabel}` : ''}" فقط`
      : `Hi, I have a question about "${itemTitle}${selectedDoseLabel ? ` ${selectedDoseLabel}` : ''}" only`;

  useEffect(() => {
    // Reset selection when the user navigates to a new product.
    setQty(1);
    setSelectedDoseIndex(0);
  }, [item.category, item.title]);

  return (
    <View style={[styles.root, { direction: isRTL ? 'rtl' : 'ltr' }]}>
      <ClinicalHeader
        title={locale === 'ar' ? 'تفاصيل المنتج' : 'Item Details'}
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: bottomNavOverlayHeight + 24, paddingHorizontal: 24 }}
      >
        <View style={styles.imageWrap}>
          <Image source={{ uri: item.image }} style={styles.image} contentFit="cover" />
          {item.badge ? (
            <View style={[styles.badge, isRTL && styles.badgeRtl, item.tertiary && styles.badgeTer]}>
              <Text style={[styles.badgeTxt, item.tertiary && { color: colors.tertiary }]}>{badgeLabel}</Text>
            </View>
          ) : null}
        </View>
        <Text style={[styles.cat, isRTL && styles.textRight]}>{categoryLabel}</Text>
        <Text style={[styles.title, isRTL && styles.textRight]}>{itemTitle}</Text>
        <Pressable
          onPress={() =>
            navigation.navigate('SpecialistChat', {
              topic: 'general',
              initialMessage: shareMessage,
              initialImageUri: item.image,
            })
          }
          style={[styles.askRow, isRTL && styles.rowReverse]}
          accessibilityRole="button"
          accessibilityLabel={locale === 'ar' ? 'اسأل الصيدلي المختص' : 'Ask your specialist'}
        >
          <MaterialCommunityIcons name="share-variant" size={20} color={colors.primary} />
          <Text style={[styles.askTxt, isRTL && styles.textRight]}>
            {locale === 'ar' ? 'اسأل صيدليك المختص' : 'Ask your specialist'}
          </Text>
        </Pressable>
        {doseOptions ? (
          <View style={styles.doseWrap}>
            <Text style={[styles.doseLabel, isRTL && styles.textRight]}>{locale === 'ar' ? 'العبوة' : 'Dose'}</Text>
            <View style={[styles.doseRow, isRTL && { flexDirection: 'row-reverse' }]}>
              {doseOptions.map((d, idx) => {
                const active = idx === selectedDoseIndex;
                return (
                  <Pressable
                    key={`${d.label}-${idx}`}
                    onPress={() => setSelectedDoseIndex(idx)}
                    style={[styles.doseChip, active && styles.doseChipActive]}
                  >
                    <Text style={[styles.doseChipTxt, active && { color: colors.onPrimaryContainer }]}>{d.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}
        <Text style={[styles.price, isRTL && styles.textRight]}>{dosePriceDisplay}</Text>
        <Text style={[styles.sub, isRTL && styles.textRight]}>{itemSub}</Text>
      </ScrollView>
      <View style={[styles.ctaWrap, { paddingBottom: bottomNavOverlayHeight + 12 }]}>
        <View style={[styles.qtyRow, isRTL && styles.rowReverse]}>
          <Text style={styles.qtyLabel}>{locale === 'ar' ? 'الكمية' : 'Quantity'}</Text>
          <View style={[styles.stepper, isRTL && styles.rowReverse]}>
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
              id: cartItemId,
              title: `${itemTitle}${selectedDoseLabel ? ` ${selectedDoseLabel}` : ''}`,
              sub: itemSub,
              price: dosePriceValue.toFixed(2),
              image: item.image,
              qty,
            });
          }}
        >
          <LinearGradient
            colors={added ? [colors.secondary, colors.secondaryContainer] : [colors.primary, colors.primaryContainer]}
            style={[styles.cta, isRTL && styles.rowReverse]}
          >
            <MaterialCommunityIcons
              name={added ? 'check-circle-outline' : 'cart-plus'}
              size={20}
              color={added ? colors.onSecondaryContainer : colors.onPrimaryContainer}
            />
            <Text style={[styles.ctaTxt, added && { color: colors.onSecondaryContainer }]}>
              {added
                ? locale === 'ar'
                  ? 'تمت الإضافة للسلة'
                  : 'Added to Cart'
                : locale === 'ar'
                  ? 'أضف إلى السلة'
                  : 'Add to Cart'}
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
    rowReverse: { flexDirection: 'row-reverse' },
    textRight: { textAlign: 'right' },
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
    badgeRtl: {
      left: undefined,
      right: 12,
    },
    badgeTer: { backgroundColor: `${c.tertiary}40` },
    badgeTxt: { fontSize: 10, fontWeight: '900', letterSpacing: 1, color: c.primary, textTransform: 'uppercase' },
    cat: { marginTop: 20, fontSize: 11, fontWeight: '800', letterSpacing: 1, color: c.primary, textTransform: 'uppercase' },
    title: { marginTop: 8, fontSize: 30, fontWeight: '900', color: c.onSurface },
    price: { marginTop: 10, fontSize: 28, fontWeight: '900', color: c.onSurface },
    sub: { marginTop: 14, fontSize: 15, lineHeight: 24, color: c.onSurfaceVariant },
    askRow: {
      marginTop: 12,
      borderRadius: 14,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      backgroundColor: c.surfaceContainerLow,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    askTxt: { fontSize: 13, fontWeight: '900', color: c.onSurfaceVariant },
    doseWrap: { marginTop: 16 },
    doseLabel: { fontSize: 12, fontWeight: '800', letterSpacing: 1, color: c.primary, textTransform: 'uppercase' },
    doseRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 },
    doseChip: {
      borderWidth: 1,
      borderColor: c.outlineVariant,
      backgroundColor: c.surfaceContainerLow,
      borderRadius: 999,
      paddingHorizontal: 14,
      paddingVertical: 8,
    },
    doseChipActive: {
      borderColor: c.primary,
      backgroundColor: c.tabPillActive,
    },
    doseChipTxt: { fontSize: 13, fontWeight: '900', color: c.onSurface },
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
