import { Image } from 'expo-image';
import React, { useMemo } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { imagesB2 } from '../assets/imagesBatch2';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';
import { useAppNavigation } from '../navigation/useAppNavigation';
import { ClinicalHeader } from '../components/ClinicalHeader';
import type { ThemeColors } from '../theme/palettes';
import { screenRootBg } from '../theme/screenBackground';
import { useTheme } from '../theme/ThemeContext';

/** Demo profile — replace with API / user store when backend exists */
const DEMO_USER = {
  name: 'Vitalis User',
  email: 'care@vitalis.atelier',
  phone: '+1 (555) 012-3456',
  memberId: 'VH-884291',
  dateOfBirth: 'Jan 15, 1990',
  dateOfBirthAr: '١٥ يناير ١٩٩٠',
  memberSince: 'Jan 2023',
  memberSinceAr: 'يناير ٢٠٢٣',
  healthScore: '92',
  activePrescriptions: 3,
  openOrders: 1,
  healthIdDisplay: 'VH-ID-7X9K-2M4P',
};

export function ProfileHubScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useAppNavigation();
  const { signOut, isAuthenticated } = useAuth();
  const { t, locale, setLocale, isRTL } = useLocale();
  const { colors, toggleScheme, isDark, scheme } = useTheme();
  const styles = useMemo(() => createProfileHubStyles(colors, isDark), [colors, isDark]);
  const themeLabel = scheme === 'light' ? 'Light' : 'Dark';

  const chevron = (isRTL ? 'chevron-left' : 'chevron-right') as keyof typeof MaterialCommunityIcons.glyphMap;
  const dob = locale === 'ar' ? DEMO_USER.dateOfBirthAr : DEMO_USER.dateOfBirth;
  const memberSince = locale === 'ar' ? DEMO_USER.memberSinceAr : DEMO_USER.memberSince;

  return (
    <View style={[styles.root, { direction: isRTL ? 'rtl' : 'ltr' }]}>
      <ClinicalHeader
        title={t.profileHubTitle}
        right={
          <View style={styles.headerIcons}>
            <Pressable hitSlop={8} onPress={() => setLocale(locale === 'en' ? 'ar' : 'en')}>
              <MaterialCommunityIcons name="translate" size={22} color={colors.mutedIcon} />
            </Pressable>
            <Pressable hitSlop={8} onPress={toggleScheme} accessibilityRole="button" accessibilityLabel="Toggle theme">
              <MaterialCommunityIcons
                name={isDark ? 'white-balance-sunny' : 'weather-night'}
                size={22}
                color={colors.mutedIcon}
              />
            </Pressable>
            <Pressable hitSlop={8} onPress={() => Alert.alert('Menu', 'More account options coming soon.')}>
              <MaterialCommunityIcons name="dots-vertical" size={24} color={colors.primary} />
            </Pressable>
          </View>
        }
      />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 + insets.bottom, paddingHorizontal: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Identity */}
        <View style={styles.heroCard}>
          <View style={styles.blur} />
          <View style={styles.profileRow}>
            <View style={styles.avatarRing}>
              <Image source={{ uri: imagesB2.profileAvatar }} style={styles.avatar} contentFit="cover" />
            </View>
            <View style={styles.identityText}>
              <Text style={styles.name}>{DEMO_USER.name}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeTxt}>{t.profilePremiumBadge}</Text>
              </View>
              <Text style={styles.signedInHint}>
                {t.profileSignedInAs} {DEMO_USER.email}
              </Text>
            </View>
          </View>

          <Pressable
            style={styles.editRow}
            onPress={() => Alert.alert(t.profileEditProfile, 'Profile editor would open here.')}
          >
            <MaterialCommunityIcons name="pencil-outline" size={18} color={colors.primary} />
            <Text style={styles.editRowTxt}>{t.profileEditProfile}</Text>
          </Pressable>

          <View style={styles.contactBlock}>
            <Text style={styles.contactHeading}>{t.profileContact}</Text>
            <ContactLine st={styles} icon="email-outline" value={DEMO_USER.email} />
            <ContactLine st={styles} icon="phone-outline" value={DEMO_USER.phone} />
            <ContactLine st={styles} icon="card-account-details-outline" label={t.profileMemberId} value={DEMO_USER.memberId} />
            <ContactLine st={styles} icon="cake-variant-outline" label={t.profileDateOfBirth} value={dob} />
          </View>

          <View style={styles.statsGrid}>
            <StatTile st={styles} label={t.profileMemberSince} value={memberSince} />
            <StatTile st={styles} label={t.profileHealthScore} value={`${DEMO_USER.healthScore}/100`} highlight />
            <StatTile
              st={styles}
              label={t.profileActiveRx}
              value={String(DEMO_USER.activePrescriptions)}
              onPress={() => navigation.navigate('ProductList', { category: 'Medicines' })}
            />
            <StatTile
              st={styles}
              label={t.profileOpenOrders}
              value={String(DEMO_USER.openOrders)}
              onPress={() => navigation.navigate('Main', { screen: 'Orders' })}
            />
          </View>
        </View>

        {/* Health ID */}
        <Pressable
          style={styles.qrCard}
          onPress={() =>
            Alert.alert(
              t.profileHealthId,
              `${DEMO_USER.healthIdDisplay}\n\nShow this code at labs and prescription pickup.`
            )
          }
        >
          <View style={styles.qrTop}>
            <MaterialCommunityIcons name="qrcode" size={44} color={colors.onPrimaryContainer} />
            <View style={{ flex: 1 }}>
              <Text style={styles.qrTitle}>{t.profileHealthId}</Text>
              <Text style={styles.qrSub}>{t.profileHealthIdHint}</Text>
              <Text style={styles.qrCode}>{DEMO_USER.healthIdDisplay}</Text>
            </View>
            <MaterialCommunityIcons name={chevron} size={22} color={colors.onPrimaryContainer} />
          </View>
        </Pressable>

        <Section st={styles} title={t.profileSectionClinical} isRTL={isRTL}>
          <Row
            st={styles}
            icon="file-document-outline"
            label={t.profilePrescriptions}
            chevron={chevron}
            onPress={() => navigation.navigate('ProductList', { category: 'Medicines' })}
          />
          <Row
            st={styles}
            icon="microscope"
            label={t.profileLabResults}
            chevron={chevron}
            onPress={() => navigation.navigate('OrderDetail', { orderId: 'LAB-RESULTS' })}
          />
          <Row
            st={styles}
            icon="bell-ring-outline"
            label={t.profileCareReminders}
            chevron={chevron}
            onPress={() => navigation.navigate('Main', { screen: 'Home' })}
          />
        </Section>

        <Section st={styles} title={t.profileSectionOrders} isRTL={isRTL}>
          <Row
            st={styles}
            icon="receipt"
            label={t.profileOrders}
            chevron={chevron}
            onPress={() => navigation.navigate('Main', { screen: 'Orders' })}
          />
          <Row
            st={styles}
            icon="cart-outline"
            label={t.profileCart}
            chevron={chevron}
            onPress={() => navigation.navigate('Main', { screen: 'Cart' })}
          />
          <Row
            st={styles}
            icon="map-marker"
            label={t.profileAddresses}
            chevron={chevron}
            onPress={() => navigation.navigate('Addresses')}
          />
          <Row
            st={styles}
            icon="credit-card-outline"
            label={t.profilePayment}
            chevron={chevron}
            onPress={() => navigation.navigate('Checkout')}
          />
          <Row
            st={styles}
            icon="storefront-outline"
            label={t.profilePharmacies}
            chevron={chevron}
            onPress={() => navigation.navigate('PharmacyList')}
          />
        </Section>

        <Section st={styles} title={t.profileSectionSupport} isRTL={isRTL}>
          <Row
            st={styles}
            icon="bell-outline"
            label={t.profileNotifications}
            sub={locale === 'ar' ? 'البريد والطلبات' : 'Orders & refills'}
            chevron={chevron}
            onPress={() => Alert.alert(t.profileNotifications, 'Notification preferences would be managed here.')}
          />
          <Row
            st={styles}
            icon="lifebuoy"
            label={t.profileHelp}
            chevron={chevron}
            onPress={() => Linking.openURL('mailto:support@vitalis.health').catch(() => {})}
          />
          <Row
            st={styles}
            icon="shield-lock-outline"
            label={t.profilePrivacy}
            chevron={chevron}
            onPress={() => Linking.openURL('https://vitalis.health/privacy').catch(() => {})}
          />
          <Row
            st={styles}
            icon="file-document-outline"
            label={t.profileTerms}
            chevron={chevron}
            onPress={() => Linking.openURL('https://vitalis.health/terms').catch(() => {})}
          />
        </Section>

        <Section st={styles} title={t.profileSectionPreferences} isRTL={isRTL}>
          <Row
            st={styles}
            icon="cog-outline"
            label={t.profileSettings}
            sub={`${t.language}: ${locale.toUpperCase()} · ${themeLabel}`}
            chevron={chevron}
            onPress={() =>
              Alert.alert(t.profileSettings, `${t.language}: use the options below to switch EN/AR.`)
            }
          />
          <Text style={[styles.langHint, isRTL && { marginLeft: 0, marginRight: 8 }]}>{t.language}</Text>
          <Pressable
            style={[styles.langRow, locale === 'en' && styles.langOn]}
            onPress={() => setLocale('en')}
          >
            <Text style={styles.langLabel}>{t.english}</Text>
            {locale === 'en' ? <MaterialCommunityIcons name="check" size={20} color={colors.primary} /> : null}
          </Pressable>
          <Pressable
            style={[styles.langRow, locale === 'ar' && styles.langOn]}
            onPress={() => setLocale('ar')}
          >
            <Text style={styles.langLabel}>{t.arabic}</Text>
            {locale === 'ar' ? <MaterialCommunityIcons name="check" size={20} color={colors.primary} /> : null}
          </Pressable>
          <Row
            st={styles}
            icon="key-variant"
            label={t.profileSecurity}
            chevron={chevron}
            onPress={() =>
              Alert.alert(t.profileSecurity, 'Password, two-factor authentication, and devices would be managed here.')
            }
          />
          <Row
            st={styles}
            icon="logout"
            label={t.profileLogout}
            danger
            chevron={chevron}
            onPress={() => {
              signOut();
              navigation.navigate('AuthGate');
            }}
          />
        </Section>

        {!isAuthenticated ? (
          <Pressable onPress={() => navigation.navigate('Login')} style={styles.linkWrap}>
            <Text style={styles.link}>{locale === 'ar' ? 'تسجيل الدخول' : 'Sign in'}</Text>
          </Pressable>
        ) : null}

        <View style={styles.footerMeta}>
          <Text style={styles.footerBrand}>{t.profileAppTagline}</Text>
          <Text style={styles.ver}>
            {t.profileVersion} 2.4.0 · {locale.toUpperCase()}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function ContactLine({
  st,
  icon,
  label,
  value,
}: {
  st: ReturnType<typeof createProfileHubStyles>;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label?: string;
  value: string;
}) {
  const { colors } = useTheme();
  return (
    <View style={st.contactLine}>
      <MaterialCommunityIcons name={icon} size={18} color={colors.outline} style={st.contactIcon} />
      <View style={{ flex: 1 }}>
        {label ? <Text style={st.contactLabel}>{label}</Text> : null}
        <Text style={st.contactValue}>{value}</Text>
      </View>
    </View>
  );
}

function StatTile({
  st,
  label,
  value,
  highlight,
  onPress,
}: {
  st: ReturnType<typeof createProfileHubStyles>;
  label: string;
  value: string;
  highlight?: boolean;
  onPress?: () => void;
}) {
  const { colors } = useTheme();
  const C = onPress ? Pressable : View;
  return (
    <C
      {...(onPress ? { onPress } : {})}
      style={[st.statTile, onPress && st.statTilePress]}
    >
      <Text style={st.statTileLabel}>{label}</Text>
      <Text style={[st.statTileVal, highlight && { color: colors.primary }]}>{value}</Text>
    </C>
  );
}

function Section({
  st,
  title,
  children,
  isRTL,
}: {
  st: ReturnType<typeof createProfileHubStyles>;
  title: string;
  children: React.ReactNode;
  isRTL: boolean;
}) {
  return (
    <View style={st.section}>
      <Text style={[st.sectionTitle, isRTL && { marginLeft: 0, marginRight: 8 }]}>{title}</Text>
      {children}
    </View>
  );
}

function Row({
  st,
  icon,
  label,
  sub,
  danger,
  chevron,
  onPress,
}: {
  st: ReturnType<typeof createProfileHubStyles>;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  sub?: string;
  danger?: boolean;
  chevron: keyof typeof MaterialCommunityIcons.glyphMap;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable style={st.row} onPress={onPress}>
      <View style={[st.rowIcon, danger && st.rowIconDanger]}>
        <MaterialCommunityIcons name={icon} size={22} color={danger ? colors.error : colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[st.rowLabel, danger && { color: colors.error }]}>{label}</Text>
        {sub ? <Text style={st.rowSub}>{sub}</Text> : null}
      </View>
      <MaterialCommunityIcons name={chevron} size={22} color={colors.chevronMuted} />
    </Pressable>
  );
}

function createProfileHubStyles(c: ThemeColors, isDark: boolean) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: screenRootBg(isDark, c.background) },
    headerIcons: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    heroCard: {
      backgroundColor: c.surfaceContainerLow,
      borderRadius: 28,
      padding: 22,
      overflow: 'hidden',
      marginTop: 8,
    },
    blur: {
      position: 'absolute',
      top: -40,
      right: -40,
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: c.tabPillActive,
    },
    profileRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
    identityText: { flex: 1, minWidth: 0 },
    avatarRing: {
      padding: 3,
      borderRadius: 999,
      borderWidth: 2,
      borderColor: c.primary,
    },
    avatar: { width: 84, height: 84, borderRadius: 42 },
    name: { fontSize: 22, fontWeight: '800', color: c.onSurface },
    badge: {
      alignSelf: 'flex-start',
      marginTop: 8,
      backgroundColor: c.tabPillActive,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
    },
    badgeTxt: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5, color: c.primary },
    signedInHint: {
      marginTop: 10,
      fontSize: 12,
      color: c.onSurfaceVariant,
      lineHeight: 18,
    },
    editRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      alignSelf: 'flex-start',
      marginTop: 14,
      paddingVertical: 8,
      paddingHorizontal: 4,
    },
    editRowTxt: { fontSize: 14, fontWeight: '700', color: c.primary },
    contactBlock: {
      marginTop: 18,
      paddingTop: 18,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.outlineVariant,
    },
    contactHeading: {
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 1.5,
      color: c.mutedIcon,
      textTransform: 'uppercase',
      marginBottom: 12,
    },
    contactLine: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
    contactIcon: { marginTop: 2 },
    contactLabel: { fontSize: 11, color: c.outline, marginBottom: 2 },
    contactValue: { fontSize: 14, fontWeight: '600', color: c.onSurface },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      marginTop: 18,
    },
    statTile: {
      width: '48%',
      flexGrow: 1,
      minWidth: '47%',
      backgroundColor: c.surfaceContainerHigh,
      borderRadius: 16,
      padding: 14,
    },
    statTilePress: { opacity: 0.92 },
    statTileLabel: {
      fontSize: 10,
      fontWeight: '800',
      color: c.mutedIcon,
      letterSpacing: 0.3,
      textTransform: 'uppercase',
    },
    statTileVal: { fontSize: 18, fontWeight: '800', color: c.onSurface, marginTop: 6 },
    qrCard: {
      backgroundColor: c.primaryContainer,
      borderRadius: 26,
      padding: 20,
      marginTop: 14,
    },
    qrTop: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    qrTitle: { fontSize: 17, fontWeight: '800', color: c.onPrimaryContainer },
    qrSub: { fontSize: 12, color: c.onPrimaryContainer, opacity: 0.9, marginTop: 4 },
    qrCode: {
      fontSize: 13,
      fontWeight: '800',
      letterSpacing: 1,
      color: c.onPrimaryContainer,
      marginTop: 8,
      opacity: 0.95,
    },
    section: { marginTop: 26 },
    sectionTitle: {
      fontSize: 10,
      color: c.mutedIcon,
      fontWeight: '800',
      letterSpacing: 2,
      marginBottom: 12,
      marginLeft: 8,
      textTransform: 'uppercase',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.surfaceContainerHigh,
      borderRadius: 18,
      padding: 16,
      marginBottom: 10,
      gap: 14,
    },
    rowIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: c.tabPillActive,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rowIconDanger: { backgroundColor: c.errorContainer },
    rowLabel: { fontSize: 15, fontWeight: '700', color: c.onSurface },
    rowSub: { fontSize: 11, color: c.mutedIcon, marginTop: 3 },
    langHint: {
      fontSize: 10,
      color: c.mutedIcon,
      fontWeight: '800',
      letterSpacing: 1,
      marginBottom: 8,
      marginLeft: 8,
      textTransform: 'uppercase',
    },
    langRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderRadius: 14,
      backgroundColor: c.surfaceContainerLow,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: 'transparent',
    },
    langOn: { borderColor: c.primary },
    langLabel: { fontSize: 16, fontWeight: '600', color: c.onSurface },
    linkWrap: { alignItems: 'center', marginTop: 16 },
    link: { color: c.primary, fontWeight: '800', fontSize: 15 },
    footerMeta: { alignItems: 'center', marginTop: 28, paddingHorizontal: 16 },
    footerBrand: { fontSize: 12, fontWeight: '800', color: c.onSurfaceVariant, letterSpacing: 1 },
    ver: { marginTop: 8, fontSize: 10, letterSpacing: 2, color: c.chevronMuted, textTransform: 'uppercase' },
  });
}
