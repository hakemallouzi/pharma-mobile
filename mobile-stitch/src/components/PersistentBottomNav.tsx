import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import React, { useMemo } from 'react';
import { Alert, Linking, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NavigationContainerRefWithCurrent, NavigationState } from '@react-navigation/native';
import { useLocale } from '../context/LocaleContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import type { RootStackParamList, MainTabParamList } from '../navigation/navigationTypes';
import type { ThemeColors } from '../theme/palettes';
import { useTheme } from '../theme/ThemeContext';

type NavItem = keyof MainTabParamList | 'Menu';
const ITEMS: NavItem[] = ['Home', 'Search', 'Chat', 'Cart', 'Menu'];

const ICONS: Record<NavItem, keyof typeof MaterialCommunityIcons.glyphMap> = {
  Home: 'home',
  Search: 'magnify',
  Chat: 'chat-processing-outline',
  Cart: 'cart',
  Profile: 'account',
  Menu: 'menu',
};

function getActiveMainTab(rootState: NavigationState | undefined): keyof MainTabParamList {
  const mainRoute = rootState?.routes.find((r) => r.name === 'Main') as
    | { state?: NavigationState }
    | undefined;
  const mainState = mainRoute?.state;
  if (!mainState?.routes?.length) return 'Home';
  const active = mainState.routes[mainState.index ?? 0]?.name as keyof MainTabParamList | undefined;
  return active && ITEMS.includes(active) ? (active as keyof MainTabParamList) : 'Home';
}

type Props = {
  navRef: NavigationContainerRefWithCurrent<RootStackParamList>;
  navState?: NavigationState;
};

export function PersistentBottomNav({ navRef, navState }: Props) {
  const insets = useSafeAreaInsets();
  const { t, locale, isRTL } = useLocale();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const activeTab = getActiveMainTab(navState);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const { profileImageUri, signOut } = useAuth();
  const { cartCount } = useCart();

  const labels: Record<NavItem, string> = {
    Home: t.tabHome,
    Search: t.tabSearch,
    Chat: t.tabChat,
    Cart: t.tabCart,
    Profile: t.tabProfile,
    Menu: locale === 'ar' ? 'القائمة' : 'Menu',
  };

  return (
    <View pointerEvents="box-none" style={[styles.wrapper, { direction: isRTL ? 'rtl' : 'ltr' }]}>
      {Platform.OS === 'ios' ? (
        <BlurView intensity={isDark ? 92 : 100} tint={isDark ? 'dark' : 'light'} style={styles.blur}>
          <View style={[styles.row, { paddingBottom: Math.max(insets.bottom, 10) }]}>
            {ITEMS.map((tab) => {
              const focused = tab !== 'Menu' && activeTab === tab;
              return (
                <Pressable
                  key={tab}
                  style={[styles.tab, focused && { backgroundColor: colors.tabPillActive }]}
                  onPress={() => {
                    if (tab === 'Menu') setMenuOpen(true);
                    else navRef.navigate('Main', { screen: tab });
                  }}
                >
                  <View style={styles.tabIconWrap}>
                    <MaterialCommunityIcons
                      name={ICONS[tab]}
                      size={24}
                      color={focused ? colors.primary : colors.tabInactive}
                    />
                    {tab === 'Cart' && cartCount > 0 ? (
                      <View style={styles.tabBadge}>
                        <Text style={styles.tabBadgeTxt}>{cartCount > 99 ? '99+' : String(cartCount)}</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={[styles.label, focused && { color: colors.primary }]}>{labels[tab]}</Text>
                </Pressable>
              );
            })}
          </View>
        </BlurView>
      ) : (
        <View style={[styles.blur, { backgroundColor: colors.glassBar }]}>
          <View style={[styles.row, { paddingBottom: Math.max(insets.bottom, 10) }]}>
            {ITEMS.map((tab) => {
              const focused = tab !== 'Menu' && activeTab === tab;
              return (
                <Pressable
                  key={tab}
                  style={[styles.tab, focused && { backgroundColor: colors.tabPillActive }]}
                  onPress={() => {
                    if (tab === 'Menu') setMenuOpen(true);
                    else navRef.navigate('Main', { screen: tab });
                  }}
                >
                  <View style={styles.tabIconWrap}>
                    <MaterialCommunityIcons
                      name={ICONS[tab]}
                      size={24}
                      color={focused ? colors.primary : colors.tabInactive}
                    />
                    {tab === 'Cart' && cartCount > 0 ? (
                      <View style={styles.tabBadge}>
                        <Text style={styles.tabBadgeTxt}>{cartCount > 99 ? '99+' : String(cartCount)}</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={[styles.label, focused && { color: colors.primary }]}>{labels[tab]}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}
      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <Pressable style={styles.drawerBackdrop} onPress={() => setMenuOpen(false)} />
        <View style={[styles.drawerSheet, isRTL ? styles.drawerSheetRtl : styles.drawerSheetLtr, { paddingTop: insets.top + 10 }]}>
          <View style={styles.drawerHead}>
            <Text style={styles.drawerTitle}>{labels.Menu}</Text>
            <Pressable hitSlop={8} onPress={() => setMenuOpen(false)}>
              <MaterialCommunityIcons name="close" size={22} color={colors.onSurface} />
            </Pressable>
          </View>
          <ScrollView
            style={styles.drawerScroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.drawerContent}
          >
            <Pressable style={styles.drawerProfileRow} onPress={() => { setMenuOpen(false); navRef.navigate('Main', { screen: 'Profile' }); }}>
              {profileImageUri ? (
                <Image source={{ uri: profileImageUri }} style={styles.drawerAvatar} contentFit="cover" />
              ) : (
                <View style={styles.drawerAvatarPlaceholder}>
                  <MaterialCommunityIcons name="account" size={20} color={colors.primary} />
                </View>
              )}
              <View style={styles.drawerProfileMeta}>
                <Text style={styles.drawerProfileName}>{locale === 'ar' ? 'مستخدم فيتاليس' : 'Vitalis User'}</Text>
                <Text style={styles.drawerProfileSub}>care@vitalis.atelier</Text>
              </View>
            </Pressable>
            <NavItemRow label={t.profileAddresses} isRTL={isRTL} onPress={() => { setMenuOpen(false); navRef.navigate('Addresses'); }} />
            <NavItemRow
              label={t.profileUpdatePaymentMethod}
              isRTL={isRTL}
              onPress={() => {
                setMenuOpen(false);
                navRef.navigate('Checkout', { openVisaModal: true, visaModalStep: 'form' });
              }}
            />
            <NavItemRow label={t.profilePharmacies} isRTL={isRTL} onPress={() => { setMenuOpen(false); navRef.navigate('PharmacyList'); }} />
            <NavItemRow label={t.profileOrders} isRTL={isRTL} onPress={() => { setMenuOpen(false); navRef.navigate('OrdersHistory'); }} />
            <NavItemRow label={t.profileNotifications} isRTL={isRTL} onPress={() => { setMenuOpen(false); Alert.alert(t.profileNotifications); }} />
          </ScrollView>
          <View style={styles.drawerBottomAction}>
            <NavItemRow
              label={t.profileHelp}
              isRTL={isRTL}
              onPress={() => {
                setMenuOpen(false);
                const SUPPORT_PHONE_TEL = 'tel:+18005550199';
                const SUPPORT_EMAIL_MAILTO = 'mailto:support@vitalis.health';
                Alert.alert(
                  t.profileHelp,
                  locale === 'ar' ? 'اختر طريقة التواصل' : 'Choose a contact method',
                  [
                    {
                      text: locale === 'ar' ? 'اتصال' : 'Call support',
                      onPress: () => {
                        Linking.openURL(SUPPORT_PHONE_TEL).catch(() => {});
                      },
                    },
                    {
                      text: locale === 'ar' ? 'إرسال بريد' : 'Email support',
                      onPress: () => {
                        Linking.openURL(SUPPORT_EMAIL_MAILTO).catch(() => {});
                      },
                    },
                    { text: locale === 'ar' ? 'إلغاء' : 'Cancel', style: 'cancel' },
                  ],
                  { cancelable: true }
                );
              }}
            />
            <NavItemRow
              label={t.profileLogout}
              isRTL={isRTL}
              danger
              onPress={() => {
                setMenuOpen(false);
                signOut();
                navRef.navigate('AuthGate');
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

function NavItemRow({ label, onPress, isRTL, danger }: { label: string; onPress: () => void; isRTL?: boolean; danger?: boolean }) {
  const { colors } = useTheme();
  return (
    <Pressable style={[stylesMenu.row, { backgroundColor: colors.surfaceContainerLow, borderColor: colors.outlineVariant }]} onPress={onPress}>
      <Text style={[stylesMenu.txt, { color: danger ? colors.error : colors.onSurface }]}>{label}</Text>
      <MaterialCommunityIcons name={isRTL ? 'chevron-left' : 'chevron-right'} size={20} color={colors.chevronMuted} />
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

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    wrapper: { position: 'absolute', left: 0, right: 0, bottom: 0 },
    blur: {
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      overflow: 'hidden',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.16,
          shadowRadius: 20,
        },
        android: { elevation: 16 },
      }),
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingTop: 12,
    },
    tab: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 16,
      minWidth: 72,
    },
    tabIconWrap: { position: 'relative' },
    tabBadge: {
      position: 'absolute',
      top: -6,
      right: -10,
      minWidth: 16,
      height: 16,
      borderRadius: 8,
      paddingHorizontal: 3,
      backgroundColor: colors.primary,
      borderWidth: 1,
      borderColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tabBadgeTxt: {
      fontSize: 9,
      fontWeight: '900',
      color: colors.onPrimary,
      lineHeight: 10,
    },
    label: {
      marginTop: 4,
      fontSize: 11,
      fontWeight: '600',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
      color: colors.tabInactive,
    },
    drawerBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.34)' },
    drawerSheet: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      width: '84%',
      maxWidth: 360,
      backgroundColor: colors.surface,
      paddingHorizontal: 16,
    },
    drawerSheetLtr: {
      right: 0,
      borderLeftWidth: StyleSheet.hairlineWidth,
      borderLeftColor: colors.outlineVariant,
    },
    drawerSheetRtl: {
      left: 0,
      borderRightWidth: StyleSheet.hairlineWidth,
      borderRightColor: colors.outlineVariant,
    },
    drawerHead: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingBottom: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.outlineVariant,
    },
    drawerTitle: { fontSize: 18, fontWeight: '800', color: colors.onSurface },
    drawerScroll: { flex: 1 },
    drawerContent: { paddingVertical: 10, gap: 6, paddingBottom: 42 },
    drawerBottomAction: {
      paddingTop: 8,
      paddingBottom: 16,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.outlineVariant,
    },
    drawerProfileRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingVertical: 14,
      marginBottom: 8,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.outlineVariant,
    },
    drawerAvatar: { width: 50, height: 50, borderRadius: 25 },
    drawerAvatarPlaceholder: {
      width: 50,
      height: 50,
      borderRadius: 25,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surfaceContainerLow,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
    },
    drawerProfileMeta: { flex: 1 },
    drawerProfileName: { fontSize: 15, fontWeight: '700', color: colors.onSurface },
    drawerProfileSub: { marginTop: 2, fontSize: 12, color: colors.onSurfaceVariant },
  });
}
