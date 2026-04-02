import { Image } from 'expo-image';
import React, { useMemo } from 'react';
import { Alert, Linking, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { imagesB2 } from '../assets/imagesBatch2';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';
import { useAppNavigation } from '../navigation/useAppNavigation';
import type { ThemeColors } from '../theme/palettes';
import { useTheme } from '../theme/ThemeContext';

const APP_LOGO = require('../assets/logo.png');

type Props = {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
  subtitle?: string;
  showGlobalControls?: boolean;
  showLogo?: boolean;
};

export function ClinicalHeader({ title, onBack, right, subtitle, showGlobalControls = true, showLogo = false }: Props) {
  const insets = useSafeAreaInsets();
  const { colors, isDark, toggleScheme } = useTheme();
  const { t, locale, setLocale, isRTL } = useLocale();
  const { signOut, profileImageUri } = useAuth();
  const navigation = useAppNavigation();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [menuOpen, setMenuOpen] = React.useState(false);

  const closeMenu = () => setMenuOpen(false);
  const go = (action: () => void) => {
    closeMenu();
    action();
  };
  const onBackPress = () => {
    if (onBack) {
      onBack();
      return;
    }
    navigation.navigate('Main', { screen: 'Home' });
  };

  return (
    <View style={[styles.bar, { paddingTop: insets.top + 8, direction: isRTL ? 'rtl' : 'ltr' }]}>
      <View style={styles.topRow}>
        <View style={styles.left}>
          {showLogo ? (
            <Pressable
              onPress={() => navigation.navigate('Main', { screen: 'Home' })}
              hitSlop={10}
              style={styles.homeLogoBtn}
            >
              <Image source={APP_LOGO} style={[styles.homeLogo, isRTL ? styles.homeLogoAr : styles.homeLogoEn]} contentFit="contain" />
            </Pressable>
          ) : null}
          <Pressable onPress={onBackPress} hitSlop={12} style={styles.iconBtn}>
            <MaterialCommunityIcons name={isRTL ? 'arrow-right' : 'arrow-left'} size={24} color={colors.primary} />
          </Pressable>
        </View>
        <View style={styles.right}>
          {right}
          {showGlobalControls ? (
            <>
              <Pressable
                onPress={() => setLocale(locale === 'en' ? 'ar' : 'en')}
                style={styles.langSwitch}
                hitSlop={8}
              >
                <Text style={styles.langTxt}>{locale === 'en' ? 'AR' : 'EN'}</Text>
              </Pressable>
              <Pressable onPress={toggleScheme} style={styles.themeBtn} hitSlop={8}>
                <MaterialCommunityIcons
                  name={isDark ? 'weather-night' : 'white-balance-sunny'}
                  size={18}
                  color={colors.primary}
                />
              </Pressable>
            </>
          ) : null}
        </View>
      </View>
      <View style={styles.titleWrap}>
        {subtitle ? <Text style={[styles.subtitle, isRTL && styles.txtRtl]}>{subtitle}</Text> : null}
        <Text style={[styles.title, isRTL && styles.txtRtl]} numberOfLines={1}>
          {title}
        </Text>
      </View>
      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={closeMenu}>
        <Pressable style={styles.drawerBackdrop} onPress={closeMenu} />
        <View style={[styles.drawerSheet, isRTL ? styles.drawerSheetRtl : styles.drawerSheetLtr, { paddingTop: insets.top + 10 }]}>
          <View style={styles.drawerHead}>
            <Text style={[styles.drawerTitle, isRTL && styles.txtRtl]}>{locale === 'ar' ? 'القائمة' : 'Menu'}</Text>
            <Pressable hitSlop={8} onPress={closeMenu}>
              <MaterialCommunityIcons name="close" size={22} color={colors.onSurface} />
            </Pressable>
          </View>
          <ScrollView
            style={styles.drawerScroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.drawerContent}
          >
            <Pressable style={styles.drawerProfileRow} onPress={() => go(() => navigation.navigate('Main', { screen: 'Profile' }))}>
              <Image source={{ uri: profileImageUri ?? imagesB2.profileAvatar }} style={styles.drawerAvatar} contentFit="cover" />
              <View style={styles.drawerProfileMeta}>
                <Text style={[styles.drawerProfileName, isRTL && styles.txtRtl]}>
                  {locale === 'ar' ? 'مستخدم فيتاليس' : 'Vitalis User'}
                </Text>
                <Text style={[styles.drawerProfileSub, isRTL && styles.txtRtl]}>care@vitalis.atelier</Text>
              </View>
            </Pressable>
            <Text style={styles.drawerSection}>{t.profileSectionClinical}</Text>
            <MenuItem label={t.profilePrescriptions} isRTL={isRTL} onPress={() => go(() => navigation.navigate('ProductList', { category: 'Medicines' }))} />
            <MenuItem label={t.profileLabResults} isRTL={isRTL} onPress={() => go(() => navigation.navigate('OrderDetail', { orderId: 'LAB-RESULTS' }))} />
            <MenuItem label={t.profileCareReminders} isRTL={isRTL} onPress={() => go(() => navigation.navigate('Main', { screen: 'Home' }))} />

            <Text style={styles.drawerSection}>{t.profileSectionOrders}</Text>
            <MenuItem label={t.profileOrders} isRTL={isRTL} onPress={() => go(() => navigation.navigate('OrdersHistory'))} />
            <MenuItem label={t.profileCart} isRTL={isRTL} onPress={() => go(() => navigation.navigate('Main', { screen: 'Cart' }))} />
            <MenuItem label={t.profileAddresses} isRTL={isRTL} onPress={() => go(() => navigation.navigate('Addresses'))} />
            <MenuItem
              label={t.profileUpdatePaymentMethod}
              isRTL={isRTL}
              onPress={() => go(() => navigation.navigate('Checkout', { openVisaModal: true, visaModalStep: 'form' }))}
            />
            <MenuItem label={t.profilePharmacies} isRTL={isRTL} onPress={() => go(() => navigation.navigate('PharmacyList'))} />

            <Text style={styles.drawerSection}>{t.profileSectionSupport}</Text>
            <MenuItem label={t.profileNotifications} isRTL={isRTL} onPress={() => go(() => Alert.alert(t.profileNotifications, 'Notification preferences would be managed here.'))} />
            <MenuItem label={t.profilePrivacy} isRTL={isRTL} onPress={() => go(() => Linking.openURL('https://vitalis.health/privacy').catch(() => {}))} />
            <MenuItem label={t.profileTerms} isRTL={isRTL} onPress={() => go(() => Linking.openURL('https://vitalis.health/terms').catch(() => {}))} />

            <Text style={styles.drawerSection}>{t.profileSectionPreferences}</Text>
            <MenuItem label={t.profileSettings} isRTL={isRTL} onPress={() => go(() => Alert.alert(t.profileSettings, `${t.language}: use controls on profile page.`))} />
            <MenuItem label={t.profileSecurity} isRTL={isRTL} onPress={() => go(() => Alert.alert(t.profileSecurity, 'Security settings would be managed here.'))} />
          </ScrollView>
          <View style={styles.drawerBottomAction}>
            <MenuItem
              label={t.profileHelp}
              isRTL={isRTL}
              onPress={() =>
                go(() => {
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
                })
              }
            />
            <MenuItem
              label={t.profileLogout}
              isRTL={isRTL}
              danger
              onPress={() =>
                go(() => {
                  signOut();
                  navigation.navigate('AuthGate');
                })
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

function MenuItem({ label, onPress, danger, isRTL }: { label: string; onPress: () => void; danger?: boolean; isRTL?: boolean }) {
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
    bar: {
      flexDirection: 'column',
      paddingHorizontal: 20,
      paddingBottom: 12,
      backgroundColor: colors.headerBar,
    },
    topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    left: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1, minWidth: 0 },
    titleWrap: { flexShrink: 1, minWidth: 0, marginTop: 8 },
    iconBtn: { padding: 4 },
    homeLogoBtn: {
      width: 34,
      height: 34,
      alignItems: 'center',
      justifyContent: 'center',
    },
    homeLogo: { width: 64, height: 100 },
    homeLogoAr: { transform: [{ rotate: '-15deg' }] },
    homeLogoEn: { transform: [{ scaleX: -1 }, { rotate: '-15deg' }] },
    subtitle: {
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 1,
      color: colors.onSurfaceVariant,
      textTransform: 'uppercase',
    },
    txtRtl: { textAlign: 'right' },
    title: { fontSize: 26, fontWeight: '900', color: colors.primary },
    right: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    langSwitch: {
      minWidth: 44,
      height: 38,
      borderRadius: 12,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
      borderColor: colors.outlineVariant,
      backgroundColor: colors.surfaceContainerLow,
      padding: 2,
    },
    langTxt: { fontSize: 11, fontWeight: '800', color: colors.primary, letterSpacing: 0.4 },
    themeBtn: {
      width: 38,
      height: 38,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      backgroundColor: colors.surfaceContainerLow,
      alignItems: 'center',
      justifyContent: 'center',
    },
    menuBtn: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: colors.tabPillActive,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      alignItems: 'center',
      justifyContent: 'center',
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
    drawerProfileMeta: { flex: 1 },
    drawerProfileName: { fontSize: 15, fontWeight: '700', color: colors.onSurface },
    drawerProfileSub: { marginTop: 2, fontSize: 12, color: colors.onSurfaceVariant },
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
    drawerSection: {
      marginTop: 12,
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 1.3,
      color: colors.mutedIcon,
      textTransform: 'uppercase',
    },
  });
}
