import { Image } from 'expo-image';
import React, { useMemo, useRef } from 'react';
import { Alert, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { imagesB2 } from '../assets/imagesBatch2';
import { useLocale } from '../context/LocaleContext';
import type { RootStackParamList } from '../navigation/navigationTypes';
import { ClinicalHeader } from '../components/ClinicalHeader';
import type { ThemeColors } from '../theme/palettes';
import { screenRootBg } from '../theme/screenBackground';
import { useTheme } from '../theme/ThemeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderDetail'>;

/** Springfield, OR–area demo route for live courier tracking (Google Maps). */
const ORDER_ROUTE = [
  { latitude: 44.0542, longitude: -123.035 },
  { latitude: 44.051, longitude: -123.029 },
  { latitude: 44.048, longitude: -123.025 },
  { latitude: 44.0462, longitude: -123.022 },
] as const;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function courierAlongRoute(progress: number) {
  const pts = ORDER_ROUTE;
  const n = pts.length;
  if (n < 2) return { latitude: pts[0].latitude, longitude: pts[0].longitude };
  const t = Math.min(1, Math.max(0, progress));
  const scaled = t * (n - 1);
  const i = Math.min(Math.floor(scaled), n - 2);
  const u = scaled - i;
  return {
    latitude: lerp(pts[i].latitude, pts[i + 1].latitude, u),
    longitude: lerp(pts[i].longitude, pts[i + 1].longitude, u),
  };
}

const SUPPORT_PHONE_DISPLAY = '(800) 555-0199';
const SUPPORT_PHONE_TEL = 'tel:+18005550199';
const SUPPORT_EMAIL = 'support@vitalis.health';

function presentContactSupport(orderId: string) {
  Alert.alert('Contact support', 'Choose how you would like to reach The Clinical Atelier.', [
    { text: 'Cancel', style: 'cancel' },
    {
      text: 'Call us',
      onPress: () =>
        Alert.alert(
          'Clinical support line',
          `${SUPPORT_PHONE_DISPLAY}\n\nCare coordinators are available 7am–9pm (local time).`,
          [
            { text: 'Close', style: 'cancel' },
            {
              text: 'Call now',
              onPress: () => {
                Linking.openURL(SUPPORT_PHONE_TEL).catch(() =>
                  Alert.alert('Unable to call', `Dial ${SUPPORT_PHONE_DISPLAY} from your phone.`),
                );
              },
            },
          ],
        ),
    },
    {
      text: 'Write a ticket',
      onPress: () =>
        Alert.alert(
          'Email support ticket',
          'We will open your email app with a draft to our team. Add details or screenshots and send when ready.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open email',
              onPress: () => {
                const subject = encodeURIComponent(`Support ticket — Order ${orderId}`);
                const body = encodeURIComponent(
                  `Order reference: ${orderId}\n\nDescribe your question or issue:\n\n`,
                );
                const mailto = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
                Linking.openURL(mailto).catch(() =>
                  Alert.alert(
                    'Email unavailable',
                    `Send a message to ${SUPPORT_EMAIL} and include your order reference: ${orderId}.`,
                  ),
                );
              },
            },
          ],
        ),
    },
  ]);
}

export function OrderDetailScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { locale } = useLocale();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createOrderDetailStyles(colors, isDark), [colors, isDark]);
  const id = route.params?.orderId ?? '#VH-98210-XC';
  const mapRef = useRef<MapView>(null);
  /** Courier stays at route origin while order is still at “Placed”. */
  const courierCoord = useMemo(() => courierAlongRoute(0), []);

  const useGoogleMaps =
    Platform.OS === 'android' ||
    (Platform.OS === 'ios' && Boolean(process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY));
  const mapProvider = useGoogleMaps ? PROVIDER_GOOGLE : undefined;
  const useNativeMap = Platform.OS !== 'web';

  // PersistentBottomNav is absolutely positioned at the bottom.
  // Reserve space so content isn't covered.
  const bottomNavInset = Math.max(insets.bottom, 10);
  const bottomNavOverlayHeight = 67 + bottomNavInset;

  const focusCourier = () => {
    mapRef.current?.animateToRegion(
      {
        ...courierCoord,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      },
      450,
    );
  };

  return (
    <View style={styles.root}>
      <ClinicalHeader
        title={locale === 'ar' ? 'تفاصيل الطلب' : 'Order Details'}
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        contentContainerStyle={{
          paddingBottom: bottomNavOverlayHeight + 32,
          paddingHorizontal: 20,
        }}
      >
        <View style={styles.mapCard}>
          {useNativeMap ? (
            <MapView
              ref={mapRef}
              style={styles.mapView}
              provider={mapProvider}
              initialRegion={{
                latitude: (ORDER_ROUTE[0].latitude + ORDER_ROUTE[ORDER_ROUTE.length - 1].latitude) / 2,
                longitude: (ORDER_ROUTE[0].longitude + ORDER_ROUTE[ORDER_ROUTE.length - 1].longitude) / 2,
                latitudeDelta: 0.045,
                longitudeDelta: 0.045,
              }}
              showsUserLocation={false}
              showsCompass={false}
              toolbarEnabled={false}
            >
              <Polyline
                coordinates={[...ORDER_ROUTE]}
                strokeColor={colors.primary}
                strokeWidth={4}
              />
              <Marker coordinate={ORDER_ROUTE[ORDER_ROUTE.length - 1]} title="Delivery" tracksViewChanges={false}>
                <View style={[styles.mapPin, { backgroundColor: colors.surfaceContainerLow, borderColor: colors.primary }]}>
                  <MaterialCommunityIcons name="home-map-marker" size={22} color={colors.primary} />
                </View>
              </Marker>
              <Marker coordinate={courierCoord} title="Courier" tracksViewChanges={false}>
                <View style={[styles.courierMarker, { backgroundColor: colors.primaryContainer }]}>
                  <MaterialCommunityIcons name="truck-delivery" size={20} color={colors.onPrimaryContainer} />
                </View>
              </Marker>
            </MapView>
          ) : (
            <Image source={{ uri: imagesB2.orderMap }} style={styles.mapImg} contentFit="cover" />
          )}
          <View style={styles.mapOverlay}>
            <View style={styles.mapLeft}>
              <View style={styles.delIcon}>
                <MaterialCommunityIcons name="truck-delivery" size={24} color={colors.onPrimaryContainer} />
              </View>
              <View>
                <Text style={styles.estLabel}>Estimated Arrival</Text>
                <Text style={styles.estTime}>12:45 PM</Text>
              </View>
            </View>
            <Pressable
              style={styles.track}
              onPress={() => {
                if (useNativeMap) focusCourier();
                else Alert.alert('Live map', 'Open this screen on iOS or Android for Google Maps tracking.');
              }}
            >
              <Text style={styles.trackTxt}>Track Live</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.refCard}>
          <View style={styles.refHeadBlock}>
            <Text style={styles.refHint}>Order Reference</Text>
            <Text style={styles.refId}>{id}</Text>
          </View>
          <View style={styles.refStatusRow}>
            <View style={styles.pill}>
              <Text style={styles.pillTxt}>Placed</Text>
            </View>
          </View>
          <View style={styles.refGrid}>
            <View style={styles.refRow}>
              <Text style={styles.refMuted}>Date Placed</Text>
              <Text style={styles.refStrong}>Oct 24, 2023</Text>
            </View>
            <View style={styles.refRow}>
              <Text style={styles.refMuted}>Total Items</Text>
              <Text style={styles.refStrong}>3 Products</Text>
            </View>
            <View style={styles.refRow}>
              <Text style={styles.refMuted}>Courier</Text>
              <Text style={styles.refStrong}>Vitalis Express</Text>
            </View>
          </View>
        </View>

        <View style={styles.timeline}>
          <Text style={styles.tlTitle}>Delivery Progress</Text>
          <View style={styles.tlBar}>
            <View style={[styles.tlFill, { width: '25%' }]} />
          </View>
          <View style={styles.tlSteps}>
            {[
              { l: 'Placed', t: '09:12 AM', done: true, active: true },
              { l: 'Preparing', t: 'Pending', done: false, active: false },
              { l: 'On the Way', t: 'Pending', done: false, active: false },
              { l: 'Delivered', t: 'TBD', done: false, active: false },
            ].map((s) => {
              const stepIcon =
                s.active && s.l === 'Placed'
                  ? 'check'
                  : s.active
                    ? 'truck'
                    : s.done
                      ? 'check'
                      : 'circle-outline';
              return (
                <View key={s.l} style={styles.step}>
                  <View
                    style={[
                      styles.stepDot,
                      s.active && styles.stepDotActive,
                      !s.done && !s.active && styles.stepDotOff,
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={stepIcon}
                      size={16}
                      color={s.done || s.active ? colors.onPrimary : colors.chevronMuted}
                    />
                  </View>
                  <Text style={[styles.stepL, s.active && { color: colors.primary }]}>{s.l}</Text>
                  <Text style={styles.stepT}>{s.t}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <Text style={styles.blockTitle}>Order Contents</Text>
        <OrderProductRow st={styles} image={imagesB2.orderProduct1} name="Vitalis A-Z Multivitamins" sub="60 Capsules • Pack of 1" price="$34.00" />
        <OrderProductRow st={styles} image={imagesB2.orderProduct2} name="Seretide Accuhaler" sub="Prescription Required • Verified" price="$12.50" accent />
        <OrderProductRow st={styles} image={imagesB2.orderProduct3} name="Midnight Ritual Tea" sub="Organic Blend • 20 bags" price="$8.90" qty={2} />

        <Text style={styles.blockTitle}>Shipping Information</Text>
        <View style={styles.ship}>
          <MaterialCommunityIcons name="map-marker" size={22} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.shipLabel}>Delivery Address</Text>
            <Text style={styles.shipTxt}>
              742 Evergreen Terrace{'\n'}
              Apt 4B, Springfield{'\n'}
              OR 97403, USA
            </Text>
          </View>
        </View>

        <Text style={styles.blockTitle}>Payment Details</Text>
        <View style={styles.pay}>
          <View style={styles.payTop}>
            <View style={styles.visa}>
              <Text style={styles.visaTxt}>VISA</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.payTitle}>Visa ending in 4242</Text>
              <Text style={styles.paySub}>Transaction ID: 09182375-AA</Text>
            </View>
            <MaterialCommunityIcons name="check-decagram" size={22} color={colors.chevronMuted} />
          </View>
          <View style={styles.payRows}>
            <View style={styles.prow}>
              <Text style={styles.pmuted}>Subtotal</Text>
              <Text style={styles.pstrong}>$64.30</Text>
            </View>
            <View style={styles.prow}>
              <Text style={styles.pmuted}>Shipping</Text>
              <Text style={styles.pstrong}>FREE</Text>
            </View>
            <View style={[styles.prow, { marginTop: 8 }]}>
              <Text style={styles.totalPaid}>Total Amount Paid</Text>
              <Text style={styles.totalPaidVal}>$64.30</Text>
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable
            style={styles.actBtn}
            onPress={() => presentContactSupport(id)}
          >
            <MaterialCommunityIcons name="face-agent" size={20} color={colors.onSurface} />
            <Text style={styles.actTxt}>Contact Support</Text>
          </Pressable>
          <Pressable
            style={styles.actBtn}
            onPress={() => navigation.navigate('Main', { screen: 'Home' })}
          >
            <MaterialCommunityIcons name="home-outline" size={20} color={colors.onSurface} />
            <Text style={styles.actTxt}>Back to home</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function OrderProductRow({
  st,
  image,
  name,
  sub,
  price,
  qty,
  accent,
}: {
  st: ReturnType<typeof createOrderDetailStyles>;
  image: string;
  name: string;
  sub: string;
  price: string;
  qty?: number;
  accent?: boolean;
}) {
  return (
    <View style={[st.prowCard, accent && st.prowCardAccent]}>
      <Image source={{ uri: image }} style={st.pimg} contentFit="cover" />
      <View style={{ flex: 1 }}>
        <Text style={st.pname}>{name}</Text>
        <Text style={st.psub}>{sub}</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={st.pprice}>{price}</Text>
        <Text style={st.pqty}>Qty: {qty ?? 1}</Text>
      </View>
    </View>
  );
}

function createOrderDetailStyles(c: ThemeColors, isDark: boolean) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: screenRootBg(isDark, c.background) },
    brand: { color: c.primary, fontWeight: '800', fontSize: 12, maxWidth: 140, textAlign: 'right' },
    mapCard: {
      height: 230,
      borderRadius: 22,
      overflow: 'hidden',
      backgroundColor: c.primaryContainer,
      marginBottom: 16,
    },
    mapView: { width: '100%', height: '100%' },
    mapPin: {
      borderRadius: 999,
      padding: 6,
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    courierMarker: {
      borderRadius: 999,
      padding: 8,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: c.primary,
    },
    mapImg: { width: '100%', height: '100%', opacity: 0.55 },
    mapOverlay: {
      position: 'absolute',
      bottom: 14,
      left: 14,
      right: 14,
      backgroundColor: c.primaryContainer,
      borderRadius: 16,
      padding: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: c.outlineVariant,
    },
    mapLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    delIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: c.primaryContainer,
      alignItems: 'center',
      justifyContent: 'center',
    },
    estLabel: { fontSize: 10, letterSpacing: 1, color: c.onSurfaceVariant, fontWeight: '800' },
    estTime: { fontSize: 20, fontWeight: '900', color: c.primary },
    track: { backgroundColor: c.primaryContainer, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
    trackTxt: { color: c.onPrimaryContainer, fontWeight: '800', fontSize: 13 },
    refCard: {
      backgroundColor: c.surfaceContainerLow,
      borderRadius: 26,
      padding: 20,
      marginBottom: 16,
    },
    refHeadBlock: { alignItems: 'center', marginBottom: 12 },
    refHint: { fontSize: 11, color: c.mutedIcon, fontWeight: '800', textAlign: 'center' },
    refId: { fontSize: 24, fontWeight: '900', color: c.onSurface, textAlign: 'center', marginTop: 4 },
    refStatusRow: { alignItems: 'center', marginBottom: 16 },
    pill: {
      backgroundColor: c.tabPillActive,
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 999,
      alignSelf: 'center',
    },
    pillTxt: { fontSize: 10, fontWeight: '900', color: c.primary, letterSpacing: 1, textAlign: 'center' },
    refGrid: { gap: 10 },
    refRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    refMuted: { fontSize: 13, color: c.mutedIcon },
    refStrong: { fontSize: 13, fontWeight: '700', color: c.onSurface },
    timeline: {
      backgroundColor: c.surfaceContainerLow,
      borderRadius: 26,
      padding: 22,
      marginBottom: 20,
    },
    tlTitle: { fontSize: 11, fontWeight: '900', letterSpacing: 2, color: c.mutedIcon, marginBottom: 20 },
    tlBar: { height: 2, backgroundColor: c.surfaceContainerHighest, borderRadius: 1, marginBottom: 20 },
    tlFill: { height: '100%', backgroundColor: c.primary },
    tlSteps: { flexDirection: 'row', justifyContent: 'space-between' },
    step: { alignItems: 'center', width: '22%' },
    stepDot: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: c.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },
    stepDotActive: { shadowColor: c.primary, shadowOpacity: 0.5, shadowRadius: 12 },
    stepDotOff: { backgroundColor: c.surfaceContainerHighest },
    stepL: { fontSize: 11, fontWeight: '800', color: c.onSurface, textAlign: 'center' },
    stepT: { fontSize: 10, color: c.mutedIcon, textAlign: 'center', marginTop: 2 },
    blockTitle: {
      fontSize: 11,
      fontWeight: '900',
      letterSpacing: 2,
      color: c.mutedIcon,
      marginBottom: 12,
      marginLeft: 4,
    },
    prowCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: c.surfaceContainerLow,
      borderRadius: 18,
      padding: 12,
      marginBottom: 10,
    },
    prowCardAccent: { borderLeftWidth: 4, borderLeftColor: c.primary },
    pimg: { width: 64, height: 64, borderRadius: 12 },
    pname: { fontSize: 14, fontWeight: '800', color: c.onSurface },
    psub: { fontSize: 11, color: c.mutedIcon, marginTop: 4 },
    pprice: { fontSize: 14, fontWeight: '800', color: c.primary },
    pqty: { fontSize: 10, color: c.mutedIcon, marginTop: 4 },
    ship: {
      flexDirection: 'row',
      gap: 12,
      backgroundColor: c.surfaceContainerLow,
      borderRadius: 26,
      padding: 20,
      marginBottom: 20,
    },
    shipLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 1, color: c.mutedIcon, marginBottom: 6 },
    shipTxt: { fontSize: 14, fontWeight: '700', color: c.onSurface, lineHeight: 22 },
    pay: { backgroundColor: c.surfaceContainerLow, borderRadius: 26, padding: 20, marginBottom: 20 },
    payTop: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
    visa: {
      width: 48,
      height: 32,
      borderRadius: 6,
      backgroundColor: '#1a1a1a',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: c.outlineVariant,
    },
    visaTxt: { color: '#fff', fontSize: 10, fontWeight: '900', fontStyle: 'italic' },
    payTitle: { fontSize: 14, fontWeight: '800', color: c.onSurface },
    paySub: { fontSize: 10, color: c.mutedIcon, marginTop: 2 },
    payRows: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.outlineVariant, paddingTop: 12, gap: 6 },
    prow: { flexDirection: 'row', justifyContent: 'space-between' },
    pmuted: { fontSize: 12, color: c.mutedIcon },
    pstrong: { fontSize: 12, fontWeight: '700', color: c.onSurface },
    totalPaid: { fontSize: 14, fontWeight: '900', color: c.primary },
    totalPaidVal: { fontSize: 14, fontWeight: '900', color: c.primary },
    actions: { flexDirection: 'row', gap: 12, marginTop: 8 },
    actBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 14,
      borderRadius: 18,
      backgroundColor: c.surfaceContainerHigh,
      borderWidth: 1,
      borderColor: c.outlineVariant,
    },
    actTxt: { fontWeight: '800', fontSize: 13, color: c.onSurface },
  });
}
