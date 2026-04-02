import { Image } from 'expo-image';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { images } from '../assets/images';
import type { RootStackParamList } from '../navigation/navigationTypes';
import type { ThemeColors } from '../theme/palettes';
import { screenRootBg } from '../theme/screenBackground';
import { useTheme } from '../theme/ThemeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'PharmacyDetail'>;
const OTHER_BRANCHES = [
  {
    name: 'Evergreen Care - North',
    info: '1.4 km · Open now',
    address: 'King Fahd Rd, Riyadh',
    hours: 'Open daily · 8:00 AM - 1:00 AM',
    delivery: '12-25 mins · Free over SAR 120',
    services: 'Prescription refill · Consultations',
    contact: '+966 11 111 1101',
  },
  {
    name: 'Evergreen Care - East',
    info: '2.1 km · Open now',
    address: 'Al Olaya St, Riyadh',
    hours: 'Open daily · 9:00 AM - 12:00 AM',
    delivery: '15-30 mins · Free over SAR 100',
    services: 'Vaccination · Consultation room',
    contact: '+966 11 111 1102',
  },
  {
    name: 'Evergreen Care - West',
    info: '3.0 km · Open until 1:00 AM',
    address: 'Prince Turki Rd, Riyadh',
    hours: 'Open daily · 10:00 AM - 1:00 AM',
    delivery: '20-35 mins · Free over SAR 150',
    services: 'Compounding · Home delivery',
    contact: '+966 11 111 1103',
  },
];

export function PharmacyDetailScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const { pharmacyName, pharmacyInfo = 'Open now · Fast delivery available' } = route.params;
  const {
    pharmacyImage,
    address = 'Olaya District, Riyadh',
    hours = 'Open daily · 8:00 AM - 1:00 AM',
    delivery = '15-30 mins · Free over SAR 100',
    services = 'Prescription refill · Consultations',
    contact = '+966 11 000 0000',
  } = route.params;
  const [selectedBranch, setSelectedBranch] = useState(() => ({
    name: pharmacyName,
    info: pharmacyInfo,
    address,
    hours,
    delivery,
    services,
    contact,
  }));
  const detailImage = pharmacyImage ?? images.heroPharmacyEn;
  // PersistentBottomNav is absolutely positioned at the bottom,
  // so reserve space for it to avoid overlaying lower content.
  const bottomNavInset = Math.max(insets.bottom, 10);
  const bottomNavOverlayHeight = 67 + bottomNavInset;

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={{ paddingBottom: bottomNavOverlayHeight + 24 }}
      >
        <View style={styles.imageWrap}>
          <Image source={{ uri: detailImage }} style={styles.image} contentFit="cover" contentPosition="center" />
          <LinearGradient
            colors={['rgba(0,0,0,0.08)', 'rgba(0,0,0,0.68)']}
            locations={[0.35, 1]}
            style={styles.imageGradient}
          />
          <View style={styles.imageBadge}>
            <MaterialCommunityIcons name="star" size={14} color={colors.primary} />
            <Text style={styles.imageBadgeTxt}>4.8</Text>
          </View>
          <View style={styles.imageOverlay}>
            <Text style={styles.overlayName}>{selectedBranch.name}</Text>
            <Text style={styles.overlayInfo}>{selectedBranch.info}</Text>
            <Pressable style={styles.overlayBtn} onPress={() => navigation.navigate('ProductList', { category: 'All' })}>
              <MaterialCommunityIcons name="storefront-outline" size={16} color={colors.onPrimaryContainer} />
              <Text style={styles.overlayBtnTxt}>Browse products</Text>
            </Pressable>
          </View>
        </View>
        <View style={styles.body}>
          <View style={styles.detailsCard}>
            <Row icon="map-marker-outline" label="Address" value={selectedBranch.address} />
            <Row icon="clock-outline" label="Hours" value={selectedBranch.hours} />
            <Row icon="truck-delivery-outline" label="Delivery" value={selectedBranch.delivery} />
            <Row icon="shield-check-outline" label="Services" value={selectedBranch.services} />
            <Row icon="phone-outline" label="Contact" value={selectedBranch.contact} />
          </View>
          <Text style={styles.branchTitle}>Other branches</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.branchSliderWrap}
            contentContainerStyle={styles.branchSlider}
          >
            {OTHER_BRANCHES.map((b) => (
              <Pressable
                key={b.name}
                style={[styles.branchCard, selectedBranch.name === b.name && styles.branchCardActive]}
                onPress={() => setSelectedBranch(b)}
              >
                <Text style={styles.branchName}>{b.name}</Text>
                <Text style={styles.branchInfo}>{b.info}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
      <View style={[styles.headerOverlay, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#f3f7f3" />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {selectedBranch.name}
        </Text>
      </View>
    </View>
  );
}

function Row({
  icon,
  label,
  value,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value: string;
}) {
  const { colors } = useTheme();
  return (
    <View style={stylesRow.row}>
      <MaterialCommunityIcons name={icon} size={18} color={colors.primary} />
      <View style={{ flex: 1 }}>
        <Text style={[stylesRow.label, { color: colors.onSurfaceVariant }]}>{label}</Text>
        <Text style={[stylesRow.value, { color: colors.onSurface }]}>{value}</Text>
      </View>
    </View>
  );
}

const stylesRow = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  label: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 },
  value: { marginTop: 2, fontSize: 13, fontWeight: '600' },
});

function createStyles(c: ThemeColors, isDark: boolean) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: screenRootBg(isDark, c.background) },
    scroll: { flex: 1 },
    headerOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 16,
      paddingBottom: 10,
      backgroundColor: 'rgba(0,0,0,0.16)',
    },
    backBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.2)',
    },
    headerTitle: {
      flex: 1,
      fontSize: 18,
      fontWeight: '800',
      color: '#f3f7f3',
      textShadowColor: 'rgba(0,0,0,0.4)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 8,
    },
    imageWrap: {
      width: '100%',
      alignSelf: 'stretch',
      marginHorizontal: 0,
      marginTop: 0,
      borderRadius: 0,
      overflow: 'hidden',
      height: 460,
      backgroundColor: 'transparent',
    },
    image: {
      ...StyleSheet.absoluteFillObject,
      width: '100%',
      left: 0,
    },
    imageGradient: {
      ...StyleSheet.absoluteFillObject,
    },
    imageBadge: {
      position: 'absolute',
      top: 12,
      left: 12,
      backgroundColor: c.tabPillActive,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 5,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    imageBadgeTxt: { color: c.primary, fontWeight: '900', fontSize: 12 },
    imageOverlay: {
      position: 'absolute',
      left: 20,
      right: 20,
      bottom: 18,
    },
    overlayName: {
      fontSize: 28,
      fontWeight: '900',
      color: '#f3f7f3',
      textShadowColor: 'rgba(0,0,0,0.35)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 10,
    },
    overlayInfo: {
      marginTop: 6,
      fontSize: 13,
      color: 'rgba(243,247,243,0.9)',
      textShadowColor: 'rgba(0,0,0,0.35)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 8,
    },
    overlayBtn: {
      marginTop: 12,
      alignSelf: 'flex-start',
      backgroundColor: c.primaryContainer,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    overlayBtnTxt: { fontSize: 12, fontWeight: '800', color: c.onPrimaryContainer },
    body: { paddingHorizontal: 24, paddingTop: 16 },
    detailsCard: {
      marginTop: 14,
      padding: 14,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      backgroundColor: c.surfaceContainerLow,
      gap: 12,
    },
    branchTitle: { marginTop: 18, fontSize: 16, fontWeight: '800', color: c.onSurface },
    branchSliderWrap: { marginHorizontal: -24 },
    branchSlider: { gap: 10, paddingTop: 10, paddingHorizontal: 24, paddingRight: 30 },
    branchCard: {
      width: 220,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      backgroundColor: c.surfaceContainerLow,
      padding: 12,
    },
    branchCardActive: {
      borderColor: c.primary,
      backgroundColor: c.tabPillActive,
    },
    branchName: { fontSize: 13, fontWeight: '800', color: c.onSurface },
    branchInfo: { marginTop: 6, fontSize: 12, color: c.onSurfaceVariant },
  });
}
