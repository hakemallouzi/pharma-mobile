import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useState } from 'react';
import { Alert, Linking, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { images } from '../assets/images';
import { ScreenScroll, SCREEN_CONTENT_GUTTER } from '../components/ScreenScroll';
import { useLocale } from '../context/LocaleContext';
import { useAppNavigation } from '../navigation/useAppNavigation';
import type { ThemeColors } from '../theme/palettes';
import { screenRootBg } from '../theme/screenBackground';
import { useTheme } from '../theme/ThemeContext';

const categories = [
  { icon: 'view-grid-plus-outline' as const, label: 'كل الأقسام', category: 'All', greenBg: true },
  { icon: 'needle' as const, label: 'اللقاحات' },
  { icon: 'heart-pulse' as const, label: 'القلب' },
  { icon: 'brain' as const, label: 'النفسية' },
  { icon: 'tooth-outline' as const, label: 'الأسنان' },
  { icon: 'eye-outline' as const, label: 'العيون' },
  { icon: 'allergy' as const, label: 'الجلدية' },
  { icon: 'baby-bottle-outline' as const, label: 'العناية بالطفل' },
  { icon: 'pill' as const, label: 'الفيتامينات' },
  { icon: 'bandage' as const, label: 'الإسعافات' },
  { icon: 'stethoscope' as const, label: 'الأجهزة الطبية' },
];

export function HomeArScreen() {
  const insets = useSafeAreaInsets();
  const nav = useAppNavigation();
  const { t } = useLocale();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createHomeArStyles(colors, isDark), [colors, isDark]);
  const [showAllCategories, setShowAllCategories] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerLeft}>
          <Image source={{ uri: images.homeEnAvatar }} style={styles.avatar} contentFit="cover" />
          <View>
            <Text style={styles.welcome}>مرحباً بك</Text>
            <Text style={styles.name}>أحمد السعدي</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <Pressable style={styles.locRow} onPress={() => nav.navigate('Addresses')}>
            <MaterialCommunityIcons name="map-marker" size={16} color={colors.primary} />
            <Text style={styles.locText}>الرياض، العليا</Text>
          </Pressable>
          <Pressable style={styles.notifBtn}>
            <MaterialCommunityIcons name="bell-outline" size={22} color={colors.primary} />
          </Pressable>
          <Pressable style={styles.notifBtn} onPress={() => setMenuOpen(true)}>
            <MaterialCommunityIcons name="menu" size={22} color={colors.primary} />
          </Pressable>
        </View>
      </View>

      <ScreenScroll bottomInset={120}>
        <View style={styles.bentoRow}>
          <LinearGradient
            colors={[colors.primaryContainer, colors.surfaceContainerLow]}
            style={styles.heroCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.heroTitle}>استشارة فورية مع طبيبك</Text>
            <Text style={styles.heroSub}>
              تواصل مع نخبة من الأطباء المتخصصين في أقل من 5 دقائق عبر مكالمة فيديو.
            </Text>
            <Pressable style={styles.heroBtn} onPress={() => nav.navigate('PharmacyList')}>
              <Text style={styles.heroBtnText}>احجز الآن</Text>
              <MaterialCommunityIcons name="arrow-right" size={18} color={colors.onPrimary} />
            </Pressable>
            <MaterialCommunityIcons
              name="medical-bag"
              size={120}
              color={colors.inverseOnSurface}
              style={[styles.heroWatermark, { opacity: 0.12 }]}
            />
          </LinearGradient>

          <View style={styles.reminderCard}>
            <View style={styles.reminderTop}>
              <View style={styles.reminderIcon}>
                <MaterialCommunityIcons name="pill" size={28} color={colors.primary} />
              </View>
              <Text style={styles.reminderLabel}>التذكير القادم</Text>
            </View>
            <Text style={styles.reminderTitle}>موعد الدواء</Text>
            <Text style={styles.reminderSub}>فيتامين د3 - ٥٠٠٠ وحدة</Text>
            <Text style={styles.reminderTime}>09:00 ص</Text>
          </View>
        </View>

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>الأقسام</Text>
          <Pressable onPress={() => setShowAllCategories((v) => !v)}>
            <View style={styles.linkRow}>
              <Text style={styles.link}>{showAllCategories ? 'عرض أقل' : 'عرض الكل'}</Text>
              <MaterialCommunityIcons
                name={showAllCategories ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={colors.primary}
              />
            </View>
          </Pressable>
        </View>
        {showAllCategories ? (
          <View style={styles.catGrid}>
            {categories.map((item) => (
              <Pressable
                key={item.label}
                style={styles.catGridItem}
                onPress={() => nav.navigate('ProductList', { category: item.category ?? item.label })}
              >
                <View style={[styles.catIcon, item.greenBg && { backgroundColor: `${colors.secondary}30` }]}>
                  <MaterialCommunityIcons name={item.icon} size={28} color={colors.primary} />
                </View>
                <Text style={styles.catLabel}>{item.label}</Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={[styles.hScroll, styles.hScrollBleed]}
            contentContainerStyle={styles.hScrollBleedContent}
          >
            {categories.map((item) => (
              <Pressable
                key={item.label}
                style={styles.catItem}
                onPress={() => nav.navigate('ProductList', { category: item.category ?? item.label })}
              >
                <View style={[styles.catIcon, item.greenBg && { backgroundColor: `${colors.secondary}30` }]}>
                  <MaterialCommunityIcons name={item.icon} size={28} color={colors.primary} />
                </View>
                <Text style={styles.catLabel}>{item.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        )}

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>الصيدلية المختارة</Text>
          <Text style={styles.badge}>الأكثر طلباً</Text>
        </View>

        <FeaturedRow
          styles={styles}
          colors={colors}
          title="مجموعة فيتامينات متكاملة"
          sub="60 كبسولة | تعزيز المناعة"
          price="١٤٩.٠٠ ر.س"
          rating="4.9"
          image={images.arFeatured1}
          onOpen={() => nav.navigate('ProductList', { category: 'Vitamins' })}
          onCart={() => nav.navigate('Main', { screen: 'Cart' })}
        />
        <FeaturedRow
          styles={styles}
          colors={colors}
          title="سيروم العناية بالبشرة"
          sub="30 مل | مستخلص عضوي"
          price="٨٥.٠٠ ر.س"
          rating="4.7"
          image={images.arFeatured2}
          onOpen={() => nav.navigate('ProductList', { category: 'Skincare' })}
          onCart={() => nav.navigate('Main', { screen: 'Cart' })}
        />

        <View style={styles.tracker}>
          <View style={styles.trackerHead}>
            <View>
              <Text style={styles.trackerTitle}>خطة العلاج اليومية</Text>
              <Text style={styles.trackerSub}>لقد أكملت 75% من جرعات اليوم</Text>
            </View>
            <View style={styles.ring}>
              <Text style={styles.ringText}>3/4</Text>
            </View>
          </View>
          <View style={styles.dots}>
            <View style={[styles.dot, styles.dotOn]} />
            <View style={[styles.dot, styles.dotOn]} />
            <View style={[styles.dot, styles.dotOn]} />
            <View style={styles.dot} />
          </View>
        </View>
      </ScreenScroll>

      <Pressable
        style={[styles.fab, { bottom: insets.bottom + 100 }]}
        onPress={() => nav.navigate('Main', { screen: 'Cart' })}
      >
        <MaterialCommunityIcons name="plus" size={32} color={colors.onPrimary} />
      </Pressable>
      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <Pressable style={styles.drawerBackdrop} onPress={() => setMenuOpen(false)} />
        <View style={[styles.drawerSheet, { paddingTop: insets.top + 10 }]}>
          <View style={styles.drawerHead}>
            <Text style={styles.drawerTitle}>القائمة</Text>
            <Pressable hitSlop={8} onPress={() => setMenuOpen(false)}>
              <MaterialCommunityIcons name="close" size={22} color={colors.onSurface} />
            </Pressable>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.drawerContent}>
            <Text style={styles.drawerSection}>{t.profileSectionClinical}</Text>
            <MenuItem label={t.profilePrescriptions} onPress={() => { setMenuOpen(false); nav.navigate('ProductList', { category: 'Medicines' }); }} />
            <MenuItem label={t.profileLabResults} onPress={() => { setMenuOpen(false); nav.navigate('OrderDetail', { orderId: 'LAB-RESULTS' }); }} />
            <MenuItem label={t.profileCareReminders} onPress={() => { setMenuOpen(false); nav.navigate('Main', { screen: 'Home' }); }} />

            <Text style={styles.drawerSection}>{t.profileSectionOrders}</Text>
            <MenuItem label={t.profileOrders} onPress={() => { setMenuOpen(false); nav.navigate('Main', { screen: 'Chat' }); }} />
            <MenuItem label={t.profileCart} onPress={() => { setMenuOpen(false); nav.navigate('Main', { screen: 'Cart' }); }} />
            <MenuItem label={t.profileAddresses} onPress={() => { setMenuOpen(false); nav.navigate('Addresses'); }} />
            <MenuItem label={t.profilePayment} onPress={() => { setMenuOpen(false); nav.navigate('Checkout'); }} />
            <MenuItem label={t.profilePharmacies} onPress={() => { setMenuOpen(false); nav.navigate('PharmacyList'); }} />

            <Text style={styles.drawerSection}>{t.profileSectionSupport}</Text>
            <MenuItem label={t.profileNotifications} onPress={() => { setMenuOpen(false); Alert.alert(t.profileNotifications, 'Notification preferences would be managed here.'); }} />
            <MenuItem label={t.profileHelp} onPress={() => { setMenuOpen(false); Linking.openURL('mailto:support@vitalis.health').catch(() => {}); }} />
            <MenuItem label={t.profilePrivacy} onPress={() => { setMenuOpen(false); Linking.openURL('https://vitalis.health/privacy').catch(() => {}); }} />
            <MenuItem label={t.profileTerms} onPress={() => { setMenuOpen(false); Linking.openURL('https://vitalis.health/terms').catch(() => {}); }} />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

function MenuItem({ label, onPress }: { label: string; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable style={[stylesMenu.row, { backgroundColor: colors.surfaceContainerLow, borderColor: colors.outlineVariant }]} onPress={onPress}>
      <Text style={[stylesMenu.txt, { color: colors.onSurface }]}>{label}</Text>
      <MaterialCommunityIcons name="chevron-left" size={20} color={colors.chevronMuted} />
    </Pressable>
  );
}

const stylesMenu = StyleSheet.create({
  row: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  txt: { fontSize: 15, fontWeight: '600' },
});

function FeaturedRow({
  styles,
  colors,
  title,
  sub,
  price,
  rating,
  image,
  onOpen,
  onCart,
}: {
  styles: ReturnType<typeof createHomeArStyles>;
  colors: ThemeColors;
  title: string;
  sub: string;
  price: string;
  rating: string;
  image: string;
  onOpen?: () => void;
  onCart?: () => void;
}) {
  return (
    <Pressable style={styles.featured} onPress={onOpen}>
      <View style={styles.strip} />
      <Image source={{ uri: image }} style={styles.featuredImg} contentFit="cover" />
      <View style={styles.featuredBody}>
        <View style={styles.featuredTop}>
          <Text style={styles.featuredTitle}>{title}</Text>
          <View style={styles.ratingRow}>
            <MaterialCommunityIcons name="star" size={14} color={colors.primary} />
            <Text style={styles.ratingText}>{rating}</Text>
          </View>
        </View>
        <Text style={styles.featuredSub}>{sub}</Text>
        <View style={styles.featuredBottom}>
          <Text style={styles.price}>{price}</Text>
          <Pressable style={styles.cartBtn} onPress={() => onCart?.()}>
            <MaterialCommunityIcons name="cart-plus" size={22} color={colors.onPrimaryContainer} />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

function createHomeArStyles(c: ThemeColors, isDark: boolean) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: screenRootBg(isDark, c.background) },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingBottom: 12,
      backgroundColor: c.headerBar,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: c.outlineVariant,
    },
    welcome: { fontSize: 10, color: c.mutedIcon, letterSpacing: 1 },
    name: { fontSize: 14, fontWeight: '700', color: c.onSurface },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    locRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    locText: { fontSize: 12, fontWeight: '700', color: c.primary },
    notifBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: c.surfaceContainerHigh,
      alignItems: 'center',
      justifyContent: 'center',
    },
    drawerBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.34)' },
    drawerSheet: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      width: '84%',
      maxWidth: 360,
      backgroundColor: c.surface,
      borderRightWidth: StyleSheet.hairlineWidth,
      borderRightColor: c.outlineVariant,
      paddingHorizontal: 16,
    },
    drawerHead: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingBottom: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.outlineVariant,
    },
    drawerTitle: { fontSize: 18, fontWeight: '800', color: c.onSurface },
    drawerContent: { paddingVertical: 10, gap: 6, paddingBottom: 42 },
    drawerSection: {
      marginTop: 12,
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 1.3,
      color: c.mutedIcon,
      textTransform: 'uppercase',
    },
    bentoRow: { gap: 16, marginBottom: 24 },
    heroCard: {
      borderRadius: 32,
      padding: 28,
      minHeight: 220,
      overflow: 'hidden',
    },
    heroTitle: {
      fontSize: 26,
      fontWeight: '800',
      color: c.onPrimaryContainer,
      lineHeight: 32,
      maxWidth: '85%',
    },
    heroSub: {
      marginTop: 8,
      fontSize: 13,
      color: c.onPrimaryContainer,
      opacity: 0.85,
      maxWidth: '92%',
    },
    heroBtn: {
      marginTop: 20,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      alignSelf: 'flex-start',
      backgroundColor: c.primary,
      paddingHorizontal: 22,
      paddingVertical: 10,
      borderRadius: 12,
    },
    heroBtnText: { color: c.onPrimary, fontWeight: '700', fontSize: 14 },
    heroWatermark: {
      position: 'absolute',
      left: -24,
      bottom: -32,
    },
    reminderCard: {
      backgroundColor: c.surfaceContainerHigh,
      borderRadius: 32,
      padding: 24,
      borderRightWidth: 4,
      borderRightColor: c.primary,
    },
    reminderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    reminderIcon: {
      padding: 12,
      backgroundColor: c.tabPillActive,
      borderRadius: 16,
    },
    reminderLabel: { fontSize: 10, color: c.mutedIcon },
    reminderTitle: { fontSize: 20, fontWeight: '800', color: c.onSurface, marginTop: 12 },
    reminderSub: { fontSize: 13, color: c.mutedIcon, marginTop: 4 },
    reminderTime: { fontSize: 26, fontWeight: '800', color: c.primary, marginTop: 16 },
    sectionHead: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    sectionTitle: { fontSize: 20, fontWeight: '800', color: c.onSurface },
    link: { fontSize: 12, fontWeight: '800', color: c.primary },
    linkRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
    badge: {
      fontSize: 10,
      fontWeight: '800',
      color: c.secondary,
      backgroundColor: c.secondaryContainer,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
    },
    hScroll: { marginBottom: 24 },
    hScrollBleed: { marginHorizontal: -SCREEN_CONTENT_GUTTER },
    hScrollBleedContent: {
      paddingLeft: SCREEN_CONTENT_GUTTER,
      paddingRight: SCREEN_CONTENT_GUTTER,
    },
    catItem: { alignItems: 'center', marginLeft: 16, width: 72 },
    catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
    catGridItem: { alignItems: 'center', width: '22%' },
    catIcon: {
      width: 64,
      height: 64,
      borderRadius: 16,
      backgroundColor: c.surfaceContainerLow,
      alignItems: 'center',
      justifyContent: 'center',
    },
    catLabel: {
      marginTop: 8,
      fontSize: 11,
      fontWeight: '600',
      color: c.mutedIcon,
      textAlign: 'center',
    },
    featured: {
      flexDirection: 'row',
      backgroundColor: c.surfaceContainerLow,
      borderRadius: 24,
      padding: 16,
      marginBottom: 12,
      overflow: 'hidden',
      position: 'relative',
    },
    strip: {
      position: 'absolute',
      right: 0,
      top: 0,
      bottom: 0,
      width: 4,
      backgroundColor: c.primary,
    },
    featuredImg: { width: 96, height: 96, borderRadius: 16 },
    featuredBody: { flex: 1, marginRight: 12 },
    featuredTop: { flexDirection: 'row', justifyContent: 'space-between' },
    featuredTitle: { flex: 1, fontSize: 17, fontWeight: '800', color: c.onSurface },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    ratingText: { fontSize: 12, fontWeight: '800', color: c.primary },
    featuredSub: { fontSize: 13, color: c.mutedIcon, marginTop: 6 },
    featuredBottom: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 12,
    },
    price: { fontSize: 20, fontWeight: '800', color: c.primary },
    cartBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: c.primaryContainer,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tracker: {
      backgroundColor: c.surfaceContainerHigh,
      borderRadius: 32,
      padding: 28,
      marginTop: 8,
      borderWidth: 1,
      borderColor: c.outlineVariant,
    },
    trackerHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    trackerTitle: { fontSize: 22, fontWeight: '800', color: c.onSurface },
    trackerSub: { fontSize: 13, color: c.mutedIcon, marginTop: 4 },
    ring: {
      width: 72,
      height: 72,
      borderRadius: 36,
      borderWidth: 6,
      borderColor: c.surfaceContainerLow,
      alignItems: 'center',
      justifyContent: 'center',
    },
    ringText: { fontSize: 14, fontWeight: '800', color: c.onSurface },
    dots: { flexDirection: 'row', gap: 8 },
    dot: { flex: 1, height: 6, borderRadius: 4, backgroundColor: c.surfaceContainerLow },
    dotOn: { backgroundColor: c.primary },
    fab: {
      position: 'absolute',
      left: 24,
      width: 56,
      height: 56,
      borderRadius: 16,
      backgroundColor: c.primary,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
  });
}
