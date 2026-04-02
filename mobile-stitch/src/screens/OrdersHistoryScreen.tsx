import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppNavigation } from '../navigation/useAppNavigation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ClinicalHeader } from '../components/ClinicalHeader';
import { SCREEN_CONTENT_GUTTER } from '../components/ScreenScroll';
import { useLocale } from '../context/LocaleContext';
import type { ThemeColors } from '../theme/palettes';
import { screenRootBg } from '../theme/screenBackground';
import { useTheme } from '../theme/ThemeContext';

const filters = ['All Orders', 'Processing', 'Delivered', 'Pending'] as const;

export function OrdersHistoryScreen() {
  const insets = useSafeAreaInsets();
  const { locale } = useLocale();
  const navigation = useAppNavigation();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createOrdersHistoryStyles(colors, isDark), [colors, isDark]);
  const [active, setActive] = useState<(typeof filters)[number]>('All Orders');

  return (
    <View style={styles.root}>
      <ClinicalHeader
        title={locale === 'ar' ? 'سجل الطلبات' : 'Order History'}
      />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 + insets.bottom, paddingHorizontal: 24 }}
      >
        <Text style={styles.pageTitle}>Orders History</Text>
        <Text style={styles.pageSub}>
          Track your medical prescriptions and apothecary essentials from our laboratory to your door.
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={[styles.filterScroll, styles.filterScrollBleed]}
          contentContainerStyle={styles.filterScrollBleedContent}
        >
          {filters.map((f) => (
            <Pressable
              key={f}
              onPress={() => setActive(f)}
              style={[styles.filterChip, active === f && styles.filterChipOn]}
            >
              <Text style={[styles.filterTxt, active === f && styles.filterTxtOn]}>{f}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.card}>
          <View style={styles.strip} />
          <Text style={styles.kicker}>Current Order</Text>
          <Text style={styles.orderId}>Order #VT-88291</Text>
          <Text style={styles.meta}>Placed on Oct 24, 2023</Text>
          <View style={styles.statusPill}>
            <Text style={styles.statusTxt}>Processing</Text>
          </View>
          <View style={styles.itemRow}>
            <View style={styles.itemIcon}>
              <MaterialCommunityIcons name="microscope" size={32} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.itemTitle}>Custom Serology Kit x1</Text>
              <Text style={styles.itemSub}>Plus 2 additional prescriptions</Text>
            </View>
          </View>
          <View style={styles.footer}>
            <View>
              <Text style={styles.tiny}>Total Amount</Text>
              <Text style={styles.price}>$284.50</Text>
            </View>
            <Pressable
              style={styles.trackBtn}
              onPress={() => navigation.navigate('OrderDetail', { orderId: 'VT-88291' })}
            >
              <Text style={styles.trackTxt}>Track Order</Text>
            </Pressable>
          </View>
        </View>

        <PastCard
          st={styles}
          colors={colors}
          id="Order #VT-87110"
          date="Delivered Oct 12, 2023"
          status="Delivered"
          lines={[
            { name: 'Vitality Core Multi-Vitamin', price: '$42.00' },
            { name: 'Sleep Hygiene Complex', price: '$38.00' },
          ]}
          total="$80.00"
          onReorder={() => navigation.navigate('Main', { screen: 'Cart' })}
        />
        <PastCard
          st={styles}
          colors={colors}
          id="Order #VT-86554"
          date="Delivered Sep 28, 2023"
          status="Delivered"
          total="$156.20"
          icons
          onReorder={() => navigation.navigate('Main', { screen: 'Cart' })}
        />

        <View style={styles.hint}>
          <MaterialCommunityIcons name="receipt" size={36} color={colors.onSurfaceVariant} />
          <Text style={styles.hintTxt}>Looking for a specific prescription?</Text>
          <Pressable onPress={() => navigation.navigate('OrderDetail', { orderId: 'LAB-ACCESS' })}>
            <Text style={styles.hintLink}>Access Lab Results</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function PastCard({
  st,
  colors,
  id,
  date,
  status,
  lines,
  total,
  icons,
  onReorder,
}: {
  st: ReturnType<typeof createOrdersHistoryStyles>;
  colors: ThemeColors;
  id: string;
  date: string;
  status: string;
  lines?: { name: string; price: string }[];
  total: string;
  icons?: boolean;
  onReorder?: () => void;
}) {
  return (
    <View style={st.past}>
      <View style={st.pastHead}>
        <View>
          <Text style={st.pastId}>{id}</Text>
          <Text style={st.meta}>{date}</Text>
        </View>
        <View style={st.deliveredPill}>
          <Text style={st.deliveredTxt}>{status}</Text>
        </View>
      </View>
      {lines?.map((l) => (
        <View key={l.name} style={st.line}>
          <Text style={st.lineName}>{l.name}</Text>
          <Text style={st.linePrice}>{l.price}</Text>
        </View>
      ))}
      {icons ? (
        <View style={st.iconStack}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={[st.mini, { marginLeft: i > 1 ? -10 : 0 }]}>
              <MaterialCommunityIcons name="pill" size={14} color={colors.primary} />
            </View>
          ))}
        </View>
      ) : null}
      <View style={st.pastFoot}>
        <View>
          <Text style={st.tiny}>Total Paid</Text>
          <Text style={st.price}>{total}</Text>
        </View>
        <Pressable style={st.reorder} onPress={onReorder}>
          <MaterialCommunityIcons name="refresh" size={18} color={colors.primary} />
          <Text style={st.reorderTxt}>Reorder</Text>
        </Pressable>
      </View>
    </View>
  );
}

function createOrdersHistoryStyles(c: ThemeColors, isDark: boolean) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: screenRootBg(isDark, c.surface) },
    pageTitle: { fontSize: 32, fontWeight: '900', color: c.onSurface, marginTop: 8 },
    pageSub: { color: c.onSurfaceVariant, marginTop: 8, lineHeight: 22 },
    filterScroll: { marginVertical: 20 },
    filterScrollBleed: { marginHorizontal: -SCREEN_CONTENT_GUTTER },
    filterScrollBleedContent: {
      paddingHorizontal: SCREEN_CONTENT_GUTTER,
    },
    filterChip: {
      paddingHorizontal: 18,
      paddingVertical: 10,
      borderRadius: 999,
      backgroundColor: c.surfaceContainerHigh,
      marginRight: 10,
    },
    filterChipOn: { backgroundColor: c.primaryContainer },
    filterTxt: { fontWeight: '600', color: c.onSurfaceVariant, fontSize: 13 },
    filterTxtOn: { color: c.onPrimaryContainer },
    card: {
      backgroundColor: c.surfaceContainerLow,
      borderRadius: 26,
      padding: 22,
      marginBottom: 16,
      position: 'relative',
      overflow: 'hidden',
    },
    strip: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: 4,
      backgroundColor: c.primary,
    },
    kicker: {
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 2,
      color: c.primary,
      marginBottom: 6,
    },
    orderId: { fontSize: 20, fontWeight: '800', color: c.onSurface },
    meta: { fontSize: 12, color: c.onSurfaceVariant, marginTop: 4 },
    statusPill: {
      alignSelf: 'flex-start',
      marginTop: 10,
      backgroundColor: c.secondaryContainer,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 999,
    },
    statusTxt: { fontSize: 11, fontWeight: '800', color: c.secondary, textTransform: 'uppercase' },
    itemRow: { flexDirection: 'row', gap: 14, marginVertical: 18 },
    itemIcon: {
      width: 64,
      height: 64,
      borderRadius: 18,
      backgroundColor: c.surfaceContainerHigh,
      alignItems: 'center',
      justifyContent: 'center',
    },
    itemTitle: { fontSize: 14, fontWeight: '800', color: c.onSurface },
    itemSub: { fontSize: 12, color: c.onSurfaceVariant, marginTop: 4 },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.outlineVariant,
      paddingTop: 16,
      marginTop: 8,
    },
    tiny: { fontSize: 10, fontWeight: '800', letterSpacing: 1, color: c.onSurfaceVariant },
    price: { fontSize: 18, fontWeight: '800', color: c.onSurface, marginTop: 2 },
    trackBtn: {
      backgroundColor: c.primary,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 14,
    },
    trackTxt: { color: c.onPrimary, fontWeight: '800', fontSize: 13 },
    past: {
      backgroundColor: c.surfaceContainerLow,
      borderRadius: 26,
      padding: 22,
      marginBottom: 16,
    },
    pastHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    pastId: { fontSize: 17, fontWeight: '800', color: c.onSurface },
    deliveredPill: {
      backgroundColor: c.surfaceContainerHighest,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
    },
    deliveredTxt: { fontSize: 11, fontWeight: '800', color: c.onSurfaceVariant, textTransform: 'uppercase' },
    line: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    lineName: { fontSize: 14, color: c.onSurfaceVariant },
    linePrice: { fontWeight: '700', color: c.onSurface },
    iconStack: { flexDirection: 'row', marginBottom: 12 },
    mini: {
      width: 36,
      height: 36,
      borderRadius: 18,
      borderWidth: 2,
      borderColor: c.surfaceContainerLow,
      backgroundColor: c.surfaceContainerHigh,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pastFoot: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.outlineVariant,
      paddingTop: 14,
      marginTop: 8,
    },
    reorder: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 10, borderRadius: 14 },
    reorderTxt: { color: c.primary, fontWeight: '800', fontSize: 13 },
    hint: {
      alignItems: 'center',
      padding: 28,
      backgroundColor: c.hintPanel,
      borderRadius: 26,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      marginTop: 8,
    },
    hintTxt: { marginTop: 8, color: c.onSurfaceVariant, fontWeight: '600' },
    hintLink: { marginTop: 12, color: c.primary, fontWeight: '800' },
  });
}
