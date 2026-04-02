import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RootStackParamList } from '../navigation/navigationTypes';
import { ClinicalHeader } from '../components/ClinicalHeader';
import { useLocale } from '../context/LocaleContext';
import { SCREEN_CONTENT_GUTTER } from '../components/ScreenScroll';
import type { ThemeColors } from '../theme/palettes';
import { screenRootBg } from '../theme/screenBackground';
import { useTheme } from '../theme/ThemeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Checkout'>;

const TAX_RATE = 0.08;

type SavedLocation = {
  id: string;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  detail: string;
  isPrimary?: boolean;
};

function cardDigitsOnly(s: string) {
  return s.replace(/\D/g, '');
}

function formatCardNumberInput(raw: string) {
  const d = cardDigitsOnly(raw).slice(0, 19);
  return d.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

function formatExpiryInput(raw: string) {
  const d = cardDigitsOnly(raw).slice(0, 4);
  if (d.length <= 2) return d;
  return `${d.slice(0, 2)}/${d.slice(2)}`;
}

const SAVED_LOCATIONS: SavedLocation[] = [
  {
    id: 'home',
    label: 'Home',
    icon: 'home',
    title: 'Home Sanctuary',
    detail: '742 Evergreen Terrace, Clinical District · San Francisco, CA 94105',
    isPrimary: true,
  },
  {
    id: 'work',
    label: 'Work',
    icon: 'briefcase',
    title: 'Office Lab',
    detail: '101 Innovation Way, Tech Plaza, Floor 12, Wellness Wing',
  },
  {
    id: 'other',
    label: 'Family',
    icon: 'map-marker',
    title: "Grandmother's House",
    detail: '12 Willow Creek Lane · Sausalito, CA 94965',
  },
];

export function CheckoutScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { locale, isRTL } = useLocale();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createCheckoutStyles(colors, isDark), [colors, isDark]);
  // PersistentBottomNav is absolutely positioned; reserve its space to prevent overlay.
  const bottomNavInset = Math.max(insets.bottom, 10);
  const bottomNavOverlayHeight = 67 + bottomNavInset;
  const [pay, setPay] = useState<'apple' | 'card' | 'cash'>('apple');
  const [deliveryId, setDeliveryId] = useState(SAVED_LOCATIONS[0]?.id ?? '');
  const [hasCardDetails, setHasCardDetails] = useState(false);
  const [showVisaChangeModal, setShowVisaChangeModal] = useState(false);
  const [visaModalStep, setVisaModalStep] = useState<'menu' | 'form'>('menu');
  const [visaFormNumber, setVisaFormNumber] = useState('');
  const [visaFormExpiry, setVisaFormExpiry] = useState('');
  const [visaFormCvv, setVisaFormCvv] = useState('');
  const [visaFormError, setVisaFormError] = useState('');
  const [visaLast4, setVisaLast4] = useState('4482');
  const [visaExpiry, setVisaExpiry] = useState('10/29');
  const [placeHoldSecondsLeft, setPlaceHoldSecondsLeft] = useState<number | null>(null);
  const placeHoldIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const openVisaModal = route.params?.openVisaModal;
  const visaModalStepParam = route.params?.visaModalStep;

  const cancelPlaceOrderHold = () => {
    if (placeHoldIntervalRef.current) {
      clearInterval(placeHoldIntervalRef.current);
      placeHoldIntervalRef.current = null;
    }
    setPlaceHoldSecondsLeft(null);
  };

  useEffect(
    () => () => {
      if (placeHoldIntervalRef.current) {
        clearInterval(placeHoldIntervalRef.current);
        placeHoldIntervalRef.current = null;
      }
    },
    [],
  );

  const closeVisaModal = () => {
    setShowVisaChangeModal(false);
    setVisaModalStep('menu');
    setVisaFormNumber('');
    setVisaFormExpiry('');
    setVisaFormCvv('');
    setVisaFormError('');
  };

  const saveVisaFromForm = () => {
    setVisaFormError('');
    const num = cardDigitsOnly(visaFormNumber);
    const exp = cardDigitsOnly(visaFormExpiry);
    const cvv = cardDigitsOnly(visaFormCvv);

    if (!num.startsWith('4')) {
      setVisaFormError('Enter a valid Visa number (starts with 4).');
      return;
    }
    if (num.length < 13 || num.length > 19) {
      setVisaFormError('Card number should be 13–19 digits.');
      return;
    }
    if (exp.length !== 4) {
      setVisaFormError('Enter expiry as MM/YY.');
      return;
    }
    const mm = parseInt(exp.slice(0, 2), 10);
    if (mm < 1 || mm > 12) {
      setVisaFormError('Month must be between 01 and 12.');
      return;
    }
    if (cvv.length < 3 || cvv.length > 4) {
      setVisaFormError('Security code should be 3 or 4 digits.');
      return;
    }

    setVisaLast4(num.slice(-4));
    setVisaExpiry(`${exp.slice(0, 2)}/${exp.slice(2)}`);
    setHasCardDetails(true);
    closeVisaModal();
  };

  useEffect(() => {
    if (!openVisaModal) return;
    setPay('card');
    setVisaModalStep(visaModalStepParam ?? 'form');
    setShowVisaChangeModal(true);
    // Start from a clean slate each time we open from the menu.
    setVisaFormError('');
    setVisaFormNumber('');
    setVisaFormExpiry('');
    setVisaFormCvv('');
  }, [openVisaModal, visaModalStepParam]);

  const lines = route.params?.lines ?? [];
  const promoCode = route.params?.promoCode;

  const { subtotal, tax, total, itemCount } = useMemo(() => {
    const sub = lines.reduce((sum, l) => sum + parseFloat(l.price) * l.qty, 0);
    const tx = sub * TAX_RATE;
    return {
      subtotal: sub,
      tax: tx,
      total: sub + tx,
      itemCount: lines.reduce((sum, l) => sum + l.qty, 0),
    };
  }, [lines]);

  const canPlaceOrder = lines.length > 0 && itemCount > 0;

  return (
    <View style={styles.root}>
      <ClinicalHeader
        title={locale === 'ar' ? 'الدفع' : 'Checkout'}
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        contentContainerStyle={{ paddingBottom: bottomNavOverlayHeight + 40, paddingHorizontal: 24 }}
      >
        <CheckoutSectionTitle st={styles}>Delivery Address</CheckoutSectionTitle>
        <Pressable
          style={[styles.addrAddTop, isRTL && styles.rowReverse]}
          onPress={() => navigation.navigate('Addresses')}
          accessibilityRole="button"
          accessibilityLabel="Add new delivery address"
        >
          <View style={styles.addrAddTopCircle}>
            <MaterialCommunityIcons name="plus-circle-outline" size={26} color={colors.primary} />
          </View>
          <View style={styles.addrAddTopText}>
            <Text style={styles.addrAddTopTitle}>Add new address</Text>
            <Text style={styles.addrAddTopSub}>Save another delivery location</Text>
          </View>
          <MaterialCommunityIcons name={isRTL ? 'chevron-left' : 'chevron-right'} size={22} color={colors.primary} />
        </Pressable>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.addrCarousel}
          contentContainerStyle={styles.addrCarouselContent}
        >
          {SAVED_LOCATIONS.map((loc) => {
            const on = loc.id === deliveryId;
            return (
              <Pressable
                key={loc.id}
                onPress={() => setDeliveryId(loc.id)}
                style={[styles.addrSlide, on && styles.addrSlideOn]}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
              >
                <View style={styles.addrSlideRow}>
                  <Text style={[styles.addrSlideTitle, on && styles.addrSlideTitleOn]} numberOfLines={1}>
                    {loc.title}
                  </Text>
                  {on ? <MaterialCommunityIcons name="check-circle" size={18} color={colors.primary} /> : null}
                </View>
              </Pressable>
            );
          })}
        </ScrollView>

        <CheckoutSectionTitle st={styles}>Payment Method</CheckoutSectionTitle>
        <View style={styles.payGrid}>
          {(
            [
              { k: 'apple' as const, label: 'Apple Pay', icon: 'apple' },
              { k: 'card' as const, label: 'Card', icon: 'credit-card' },
              { k: 'cash' as const, label: 'Cash', icon: 'cash' },
            ] as const
          ).map((p) => (
            <Pressable
              key={p.k}
              onPress={() => setPay(p.k)}
              style={[styles.payCell, pay === p.k && styles.payCellOn]}
            >
              <MaterialCommunityIcons name={p.icon} size={28} color={pay === p.k ? colors.primary : colors.onSurfaceVariant} />
              <Text style={styles.payLabel}>{p.label}</Text>
            </Pressable>
          ))}
        </View>
        {pay === 'card' ? (
          hasCardDetails ? (
            <View style={styles.cardPreview}>
              <MaterialCommunityIcons name="credit-card-outline" size={28} color={colors.onSurfaceVariant} />
              <View style={{ flex: 1 }}>
                <Text style={styles.previewTitle}>{`Visa •••• ${visaLast4}`}</Text>
                <Text style={styles.previewSub}>{`Expires ${visaExpiry}`}</Text>
              </View>
              <Pressable
                onPress={() => {
                  setVisaModalStep('menu');
                  setShowVisaChangeModal(true);
                }}
                accessibilityRole="button"
              >
                <Text style={styles.change}>Change</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              style={styles.cardAddPrompt}
              onPress={() => setHasCardDetails(true)}
              accessibilityRole="button"
              accessibilityLabel="Add card payment details"
            >
              <MaterialCommunityIcons name="credit-card-plus-outline" size={24} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.cardAddPromptTitle}>Add payment details</Text>
                <Text style={styles.cardAddPromptSub}>Card number, expiry date, and security code</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={22} color={colors.primary} />
            </Pressable>
          )
        ) : null}
        <Modal
          visible={showVisaChangeModal}
          transparent
          animationType="fade"
          onRequestClose={closeVisaModal}
        >
          <KeyboardAvoidingView
            style={styles.payModalKb}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <Pressable style={styles.payModalBackdrop} onPress={closeVisaModal}>
              <Pressable style={styles.payModalCard} onPress={() => {}}>
                {visaModalStep === 'menu' ? (
                  <>
                    <Text style={styles.payModalTitle}>Change Visa card</Text>
                    <Text style={styles.payModalSub}>
                      Update the Visa used for this order, or remove it and add a new one from checkout.
                    </Text>
                    <View style={styles.payModalCurrent}>
                      <MaterialCommunityIcons name="credit-card-outline" size={22} color={colors.onSurfaceVariant} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.payModalCurrentLabel}>Current card</Text>
                        <Text style={styles.payModalCurrentVal}>{`Visa •••• ${visaLast4} · Exp ${visaExpiry}`}</Text>
                      </View>
                    </View>
                    <Pressable
                      style={styles.payModalOption}
                      onPress={() => {
                        setVisaFormError('');
                        setVisaFormNumber('');
                        setVisaFormExpiry('');
                        setVisaFormCvv('');
                        setVisaModalStep('form');
                      }}
                      accessibilityRole="button"
                    >
                      <MaterialCommunityIcons name="card-account-details-outline" size={20} color={colors.primary} />
                      <Text style={styles.payModalOptionTxt}>Enter another Visa</Text>
                      <MaterialCommunityIcons name="chevron-right" size={20} color={colors.onSurfaceVariant} />
                    </Pressable>
                    <Pressable
                      style={styles.payModalAction}
                      onPress={() => {
                        setHasCardDetails(false);
                        setVisaLast4('4482');
                        setVisaExpiry('10/29');
                        closeVisaModal();
                      }}
                      accessibilityRole="button"
                    >
                      <MaterialCommunityIcons name="credit-card-remove-outline" size={18} color={colors.error} />
                      <Text style={[styles.payModalActionTxt, { color: colors.error }]}>
                        Remove card and enter new details
                      </Text>
                    </Pressable>
                    <Pressable style={styles.payModalCloseBtn} onPress={closeVisaModal} accessibilityRole="button">
                      <Text style={styles.payModalCloseTxt}>Done</Text>
                    </Pressable>
                  </>
                ) : (
                  <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                    <Text style={styles.payModalTitle}>Enter Visa details</Text>
                    <Text style={styles.payModalSub}>We only store the last four digits for display. Full numbers are processed securely.</Text>
                    <Text style={styles.cardFieldLabel}>Card number</Text>
                    <TextInput
                      value={visaFormNumber}
                      onChangeText={(t) => setVisaFormNumber(formatCardNumberInput(t))}
                      placeholder="4242 4242 4242 4242"
                      placeholderTextColor={colors.onSurfaceVariant}
                      style={[styles.cardFieldInput, { color: colors.onSurface, borderColor: colors.outlineVariant }]}
                      keyboardType="number-pad"
                      maxLength={23}
                      autoComplete="cc-number"
                      textContentType="creditCardNumber"
                    />
                    <View style={styles.cardFieldRow}>
                      <View style={styles.cardFieldHalf}>
                        <Text style={styles.cardFieldLabel}>Expiry</Text>
                        <TextInput
                          value={visaFormExpiry}
                          onChangeText={(t) => setVisaFormExpiry(formatExpiryInput(t))}
                          placeholder="MM/YY"
                          placeholderTextColor={colors.onSurfaceVariant}
                          style={[styles.cardFieldInput, { color: colors.onSurface, borderColor: colors.outlineVariant }]}
                          keyboardType="number-pad"
                          maxLength={5}
                          autoComplete="cc-exp"
                          textContentType="creditCardExpiration"
                        />
                      </View>
                      <View style={styles.cardFieldHalf}>
                        <Text style={styles.cardFieldLabel}>Security code</Text>
                        <TextInput
                          value={visaFormCvv}
                          onChangeText={(t) => setVisaFormCvv(cardDigitsOnly(t).slice(0, 4))}
                          placeholder="CVV"
                          placeholderTextColor={colors.onSurfaceVariant}
                          style={[styles.cardFieldInput, { color: colors.onSurface, borderColor: colors.outlineVariant }]}
                          keyboardType="number-pad"
                          maxLength={4}
                          secureTextEntry
                          autoComplete="cc-csc"
                          textContentType="none"
                        />
                      </View>
                    </View>
                    {visaFormError ? <Text style={[styles.cardFieldError, { color: colors.error }]}>{visaFormError}</Text> : null}
                    <View style={styles.payModalFormActions}>
                      <Pressable
                        style={styles.payModalSecondaryBtn}
                        onPress={() => {
                          setVisaFormError('');
                          setVisaModalStep('menu');
                        }}
                        accessibilityRole="button"
                      >
                        <Text style={[styles.payModalSecondaryBtnTxt, { color: colors.primary }]}>Back</Text>
                      </Pressable>
                      <Pressable
                        style={[styles.payModalSaveBtn, { backgroundColor: colors.primary }]}
                        onPress={saveVisaFromForm}
                        accessibilityRole="button"
                      >
                        <Text style={[styles.payModalSaveBtnTxt, { color: colors.onPrimaryContainer }]}>Save card</Text>
                      </Pressable>
                    </View>
                  </ScrollView>
                )}
              </Pressable>
            </Pressable>
          </KeyboardAvoidingView>
        </Modal>

        <CheckoutSectionTitle st={styles}>Review Items</CheckoutSectionTitle>
        {lines.length === 0 ? (
          <View style={styles.emptyReview}>
            <MaterialCommunityIcons name="cart-outline" size={36} color={colors.outline} />
            <Text style={styles.emptyReviewTitle}>No cart items on this checkout</Text>
            <Text style={styles.emptyReviewSub}>
              Open your cart from the tab bar and tap Proceed to checkout, or add items to your basket first.
            </Text>
          </View>
        ) : (
          lines.map((l) => {
            const lineTotal = (parseFloat(l.price) * l.qty).toFixed(2);
            return (
              <CheckoutReviewRow
                key={l.id}
                st={styles}
                image={l.image}
                title={l.title}
                sub={`${l.sub} · Qty ${l.qty}`}
                price={`$${lineTotal}`}
                badge="From your cart"
              />
            );
          })
        )}

        <View style={styles.summary}>
          <Text style={styles.sumTitle}>Order Summary</Text>
          {promoCode ? (
            <CheckoutSummaryRow st={styles} label="Promo code" value={promoCode} />
          ) : null}
          <CheckoutSummaryRow
            st={styles}
            label={`Subtotal (${itemCount} ${itemCount === 1 ? 'item' : 'items'})`}
            value={itemCount === 0 ? '$0.00' : `$${subtotal.toFixed(2)}`}
          />
          <CheckoutSummaryRow st={styles} label="Clinical Courier Delivery" value="FREE" highlight />
          <CheckoutSummaryRow
            st={styles}
            label="Tax / VAT"
            value={itemCount === 0 ? '$0.00' : `$${tax.toFixed(2)}`}
          />
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <View>
              <Text style={styles.totalVal}>{itemCount === 0 ? '$0.00' : `$${total.toFixed(2)}`}</Text>
              <Text style={styles.co}>Includes Insurance Co-pay</Text>
            </View>
          </View>
          <View style={styles.lockNote}>
            <MaterialCommunityIcons name="lock" size={20} color={colors.primary} />
            <Text style={styles.lockTxt}>
              Your clinical data and payment details are encrypted with bank-level security. By placing this
              order, you agree to our Terms of Care.
            </Text>
          </View>
          <Pressable
            disabled={!canPlaceOrder || placeHoldSecondsLeft !== null}
            onPress={() => {
              if (!canPlaceOrder || placeHoldSecondsLeft !== null) return;
              let ticks = 0;
              setPlaceHoldSecondsLeft(5);
              placeHoldIntervalRef.current = setInterval(() => {
                ticks += 1;
                if (ticks >= 5) {
                  if (placeHoldIntervalRef.current) {
                    clearInterval(placeHoldIntervalRef.current);
                    placeHoldIntervalRef.current = null;
                  }
                  setPlaceHoldSecondsLeft(null);
                  navigation.navigate('OrderDetail', { orderId: 'VH-98210' });
                } else {
                  setPlaceHoldSecondsLeft(5 - ticks);
                }
              }, 1000);
            }}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryContainer]}
              style={[styles.place, !canPlaceOrder && styles.placeDisabled]}
            >
              <Text style={styles.placeTxt}>
                {placeHoldSecondsLeft !== null
                  ? `Continuing in ${placeHoldSecondsLeft}s…`
                  : 'Place Secure Order'}
              </Text>
              {placeHoldSecondsLeft !== null ? (
                <MaterialCommunityIcons name="timer-sand" size={22} color={colors.onPrimaryContainer} />
              ) : (
                <MaterialCommunityIcons name="arrow-right" size={22} color={colors.onPrimaryContainer} />
              )}
            </LinearGradient>
          </Pressable>
          {placeHoldSecondsLeft !== null ? (
            <Pressable
              style={styles.placeCancel}
              onPress={cancelPlaceOrderHold}
              accessibilityRole="button"
              accessibilityLabel="Cancel placing order"
            >
              <Text style={[styles.placeCancelTxt, { color: colors.primary }]}>Cancel</Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

function CheckoutSectionTitle({
  st,
  children,
  right,
  onRight,
}: {
  st: ReturnType<typeof createCheckoutStyles>;
  children: React.ReactNode;
  right?: string;
  onRight?: () => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={st.secHead}>
      <Text style={st.secTitle}>{children}</Text>
      {right ? (
        <Pressable onPress={onRight} style={st.addLink}>
          <MaterialCommunityIcons name="plus" size={16} color={colors.primary} />
          <Text style={st.addLinkTxt}>{right}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function CheckoutSummaryRow({
  st,
  label,
  value,
  highlight,
}: {
  st: ReturnType<typeof createCheckoutStyles>;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <View style={st.srow}>
      <Text style={st.slabel}>{label}</Text>
      <Text style={[st.sval, highlight && { color: colors.primary, fontWeight: '900' }]}>{value}</Text>
    </View>
  );
}

function CheckoutReviewRow({
  st,
  image,
  title,
  sub,
  price,
  badge,
  spa,
}: {
  st: ReturnType<typeof createCheckoutStyles>;
  image: string;
  title: string;
  sub: string;
  price: string;
  badge: string;
  spa?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <View style={st.review}>
      <Image source={{ uri: image }} style={st.rimg} contentFit="cover" />
      <View style={{ flex: 1 }}>
        <View style={st.rhead}>
          <Text style={st.rtitle}>{title}</Text>
          <Text style={st.rprice}>{price}</Text>
        </View>
        <Text style={st.rsub}>{sub}</Text>
        <View style={st.rbadge}>
          <MaterialCommunityIcons
            name={spa ? 'spa' : 'check-decagram'}
            size={14}
            color={colors.primary}
          />
          <Text style={st.rbadgeTxt}>{badge}</Text>
        </View>
      </View>
    </View>
  );
}

function createCheckoutStyles(c: ThemeColors, isDark: boolean) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: screenRootBg(isDark, c.background) },
    rowReverse: { flexDirection: 'row-reverse' },
    brandRight: { color: c.primary, fontWeight: '800', maxWidth: 140, textAlign: 'right', fontSize: 13 },
    secHead: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 20,
      marginBottom: 14,
    },
    secTitle: { fontSize: 20, fontWeight: '800', color: c.onBackground },
    addLink: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    addLinkTxt: { color: c.primary, fontWeight: '700', fontSize: 13 },
    addrAddTop: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 12,
      marginBottom: 14,
    },
    addrAddTopCircle: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: c.outlineVariant,
      backgroundColor: c.surfaceContainerHigh,
    },
    addrAddTopText: { flex: 1 },
    addrAddTopTitle: { fontSize: 16, fontWeight: '800', color: c.onSurface },
    addrAddTopSub: { fontSize: 12, color: c.onSurfaceVariant, marginTop: 2 },
    addrCarousel: { marginHorizontal: -SCREEN_CONTENT_GUTTER, marginBottom: 20 },
    addrCarouselContent: {
      paddingHorizontal: SCREEN_CONTENT_GUTTER,
      gap: 12,
      paddingVertical: 4,
    },
    addrSlide: {
      borderRadius: 999,
      backgroundColor: c.surfaceContainerLow,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      paddingHorizontal: 14,
      paddingVertical: 8,
      minHeight: 38,
      justifyContent: 'center',
    },
    addrSlideOn: {
      backgroundColor: c.tabPillActive,
      borderColor: c.primary,
    },
    addrSlideRow: { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center' },
    addrSlideTitle: { fontSize: 12, fontWeight: '700', color: c.onSurfaceVariant },
    addrSlideTitleOn: { color: c.primary },
    payGrid: { flexDirection: 'row', gap: 10, marginBottom: 16 },
    payCell: {
      flex: 1,
      backgroundColor: c.surfaceContainerLow,
      borderRadius: 14,
      paddingVertical: 18,
      alignItems: 'center',
      gap: 8,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    payCellOn: { borderColor: c.primary, backgroundColor: c.surfaceContainerHigh },
    payLabel: { fontSize: 12, fontWeight: '700', color: c.onSurfaceVariant },
    cardPreview: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: c.surfaceContainerLowest,
      padding: 16,
      borderRadius: 14,
      marginBottom: 24,
    },
    cardAddPrompt: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: c.surfaceContainerLowest,
      padding: 16,
      borderRadius: 14,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: c.outlineVariant,
    },
    cardAddPromptTitle: { fontSize: 14, fontWeight: '800', color: c.onSurface },
    cardAddPromptSub: { fontSize: 11, color: c.onSurfaceVariant, marginTop: 2 },
    previewTitle: { fontSize: 14, fontWeight: '800', color: c.onSurface },
    previewSub: { fontSize: 11, color: c.onSurfaceVariant, marginTop: 2 },
    change: { fontSize: 11, fontWeight: '800', letterSpacing: 1, color: c.primary },
    payModalKb: { flex: 1 },
    payModalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.45)',
      justifyContent: 'center',
      paddingHorizontal: 24,
      paddingVertical: 24,
    },
    payModalCard: {
      backgroundColor: c.surfaceContainerLow,
      borderRadius: 18,
      padding: 18,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      gap: 10,
    },
    payModalTitle: { fontSize: 18, fontWeight: '800', color: c.onSurface },
    payModalSub: { fontSize: 12, color: c.onSurfaceVariant, marginBottom: 6 },
    payModalCurrent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderRadius: 12,
      backgroundColor: c.surfaceContainerLowest,
      borderWidth: 1,
      borderColor: c.outlineVariant,
    },
    payModalCurrentLabel: { fontSize: 11, fontWeight: '700', color: c.onSurfaceVariant, textTransform: 'uppercase' },
    payModalCurrentVal: { fontSize: 14, fontWeight: '800', color: c.onSurface, marginTop: 4 },
    payModalOption: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      paddingVertical: 12,
      paddingHorizontal: 12,
      backgroundColor: c.surfaceContainerLowest,
    },
    payModalOptionTxt: { flex: 1, fontSize: 14, fontWeight: '700', color: c.onSurface },
    payModalAction: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 10,
      paddingHorizontal: 8,
      borderRadius: 10,
    },
    payModalActionTxt: { fontSize: 13, fontWeight: '700', color: c.primary },
    payModalCloseBtn: {
      marginTop: 4,
      alignSelf: 'flex-end',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 10,
      backgroundColor: c.primary,
    },
    payModalCloseTxt: { color: c.onPrimaryContainer, fontWeight: '800', fontSize: 12 },
    cardFieldLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: c.onSurfaceVariant,
      marginBottom: 6,
      marginTop: 12,
    },
    cardFieldInput: {
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 16,
      backgroundColor: c.surfaceContainerLowest,
    },
    cardFieldRow: { flexDirection: 'row', gap: 12, marginTop: 0 },
    cardFieldHalf: { flex: 1 },
    cardFieldError: { fontSize: 12, fontWeight: '600', marginTop: 10 },
    payModalFormActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      gap: 12,
      marginTop: 20,
      marginBottom: 4,
    },
    payModalSecondaryBtn: {
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 10,
    },
    payModalSecondaryBtnTxt: { fontWeight: '800', fontSize: 14 },
    payModalSaveBtn: {
      paddingVertical: 12,
      paddingHorizontal: 18,
      borderRadius: 10,
    },
    payModalSaveBtnTxt: { fontWeight: '800', fontSize: 14 },
    emptyReview: {
      backgroundColor: c.surfaceContainerLow,
      borderRadius: 14,
      padding: 24,
      marginBottom: 10,
      alignItems: 'center',
      gap: 10,
      borderWidth: 1,
      borderColor: c.outlineVariant,
    },
    emptyReviewTitle: { fontSize: 16, fontWeight: '800', color: c.onSurface, textAlign: 'center' },
    emptyReviewSub: {
      fontSize: 13,
      color: c.onSurfaceVariant,
      textAlign: 'center',
      lineHeight: 20,
    },
    review: {
      flexDirection: 'row',
      gap: 14,
      backgroundColor: c.surfaceContainerLow,
      borderRadius: 14,
      padding: 12,
      marginBottom: 10,
    },
    rimg: { width: 72, height: 72, borderRadius: 10, backgroundColor: c.surfaceContainerHigh },
    rhead: { flexDirection: 'row', justifyContent: 'space-between' },
    rtitle: { flex: 1, fontWeight: '800', color: c.onSurface, fontSize: 14 },
    rprice: { fontWeight: '800', color: c.primary },
    rsub: { fontSize: 11, color: c.onSurfaceVariant, marginTop: 4 },
    rbadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
    rbadgeTxt: { fontSize: 10, letterSpacing: 0.5, color: c.onSurfaceVariant, textTransform: 'uppercase' },
    summary: {
      backgroundColor: c.surfaceContainerLow,
      borderRadius: 26,
      padding: 22,
      marginTop: 16,
      borderWidth: 1,
      borderColor: c.outlineVariant,
    },
    sumTitle: { fontSize: 20, fontWeight: '800', marginBottom: 16, color: c.onSurface },
    srow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    slabel: { color: c.onSurfaceVariant, fontSize: 14 },
    sval: { fontWeight: '700', color: c.onSurface },
    divider: { height: StyleSheet.hairlineWidth, backgroundColor: c.outlineVariant, marginVertical: 12 },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 },
    totalLabel: { fontSize: 17, fontWeight: '800', color: c.onSurface },
    totalVal: { fontSize: 28, fontWeight: '900', color: c.primary, textAlign: 'right' },
    co: { fontSize: 10, color: c.onSurfaceVariant, textAlign: 'right', marginTop: 4 },
    lockNote: { flexDirection: 'row', gap: 10, marginBottom: 18 },
    lockTxt: { flex: 1, fontSize: 11, color: c.onSurfaceVariant, lineHeight: 16 },
    place: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      paddingVertical: 18,
      borderRadius: 18,
    },
    placeDisabled: { opacity: 0.45 },
    placeTxt: { color: c.onPrimaryContainer, fontSize: 17, fontWeight: '800' },
    placeCancel: {
      alignSelf: 'center',
      marginTop: 12,
      paddingVertical: 10,
      paddingHorizontal: 16,
    },
    placeCancelTxt: { fontSize: 15, fontWeight: '800' },
  });
}
