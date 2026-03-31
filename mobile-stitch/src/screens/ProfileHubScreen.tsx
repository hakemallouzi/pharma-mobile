import { Image } from 'expo-image';
import React, { useMemo } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
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
  const [profile, setProfile] = React.useState(DEMO_USER);
  const [editMode, setEditMode] = React.useState(false);
  const [draftProfile, setDraftProfile] = React.useState(DEMO_USER);
  const themeLabel = scheme === 'light' ? 'Light' : 'Dark';

  const chevron = (isRTL ? 'chevron-left' : 'chevron-right') as keyof typeof MaterialCommunityIcons.glyphMap;
  const dob = locale === 'ar' ? profile.dateOfBirthAr : profile.dateOfBirth;
  const memberSince = locale === 'ar' ? profile.memberSinceAr : profile.memberSince;

  const openEdit = () => {
    setDraftProfile(profile);
    setEditMode(true);
  };

  const cancelEdit = () => {
    setDraftProfile(profile);
    setEditMode(false);
  };

  const setDraftField = (key: keyof typeof DEMO_USER, value: string) => {
    setDraftProfile((prev) => ({ ...prev, [key]: value }));
  };

  const saveEdit = () => {
    const normalize = (value: string, fallback: string) => value.trim() || fallback;
    setProfile((prev) => ({
      ...prev,
      name: normalize(draftProfile.name, prev.name),
      email: normalize(draftProfile.email, prev.email),
      phone: normalize(draftProfile.phone, prev.phone),
      memberId: normalize(draftProfile.memberId, prev.memberId),
      dateOfBirth: normalize(draftProfile.dateOfBirth, prev.dateOfBirth),
      dateOfBirthAr: normalize(draftProfile.dateOfBirthAr, prev.dateOfBirthAr),
      healthIdDisplay: normalize(draftProfile.healthIdDisplay, prev.healthIdDisplay),
    }));
    setEditMode(false);
  };

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
              {editMode ? (
                <View style={styles.inlineFieldWrap}>
                  <Text style={styles.inlineFieldLabel}>Name</Text>
                  <TextInput
                    style={styles.inlineNameInput}
                    value={draftProfile.name}
                    onChangeText={(v) => setDraftField('name', v)}
                    placeholder="Name"
                    placeholderTextColor={colors.outline}
                  />
                </View>
              ) : (
                <Text style={styles.name}>{profile.name}</Text>
              )}
              <View style={styles.badge}>
                <Text style={styles.badgeTxt}>{t.profilePremiumBadge}</Text>
              </View>
              {editMode ? (
                <View style={styles.inlineFieldWrap}>
                  <Text style={styles.inlineFieldLabel}>Email</Text>
                  <TextInput
                    style={styles.inlineHintInput}
                    value={draftProfile.email}
                    onChangeText={(v) => setDraftField('email', v)}
                    placeholder="Email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor={colors.outline}
                  />
                </View>
              ) : (
                <Text style={styles.signedInHint}>
                  {t.profileSignedInAs} {profile.email}
                </Text>
              )}
            </View>
          </View>

          {editMode ? (
            <View style={styles.editActionsRow}>
              <Pressable style={styles.editActionGhost} onPress={cancelEdit}>
                <Text style={styles.editActionGhostTxt}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.editAction} onPress={saveEdit}>
                <Text style={styles.editActionTxt}>Save</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable style={styles.editRow} onPress={openEdit}>
              <MaterialCommunityIcons name="pencil-outline" size={18} color={colors.primary} />
              <Text style={styles.editRowTxt}>{t.profileEditProfile}</Text>
            </Pressable>
          )}

          <View style={styles.contactBlock}>
            <Text style={styles.contactHeading}>{t.profileContact}</Text>
            {editMode ? (
              <View style={styles.inlineEditGroup}>
                <View style={styles.inlineFieldWrap}>
                  <Text style={styles.inlineFieldLabel}>Email</Text>
                  <TextInput
                    style={styles.inlineFieldInput}
                    value={draftProfile.email}
                    onChangeText={(v) => setDraftField('email', v)}
                    placeholder="Email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor={colors.outline}
                  />
                </View>
                <View style={styles.inlineFieldWrap}>
                  <Text style={styles.inlineFieldLabel}>Phone</Text>
                  <TextInput
                    style={styles.inlineFieldInput}
                    value={draftProfile.phone}
                    onChangeText={(v) => setDraftField('phone', v)}
                    placeholder="Phone"
                    keyboardType="phone-pad"
                    placeholderTextColor={colors.outline}
                  />
                </View>
                <View style={styles.inlineFieldWrap}>
                  <Text style={styles.inlineFieldLabel}>{t.profileMemberId}</Text>
                  <TextInput
                    style={styles.inlineFieldInput}
                    value={draftProfile.memberId}
                    onChangeText={(v) => setDraftField('memberId', v)}
                    placeholder={t.profileMemberId}
                    placeholderTextColor={colors.outline}
                  />
                </View>
                <View style={styles.inlineFieldWrap}>
                  <Text style={styles.inlineFieldLabel}>{t.profileDateOfBirth}</Text>
                  <TextInput
                    style={styles.inlineFieldInput}
                    value={locale === 'ar' ? draftProfile.dateOfBirthAr : draftProfile.dateOfBirth}
                    onChangeText={(v) => {
                      if (locale === 'ar') setDraftField('dateOfBirthAr', v);
                      else setDraftField('dateOfBirth', v);
                    }}
                    placeholder={t.profileDateOfBirth}
                    placeholderTextColor={colors.outline}
                  />
                </View>
              </View>
            ) : (
              <>
                <ContactLine st={styles} icon="email-outline" value={profile.email} />
                <ContactLine st={styles} icon="phone-outline" value={profile.phone} />
                <ContactLine st={styles} icon="card-account-details-outline" label={t.profileMemberId} value={profile.memberId} />
                <ContactLine st={styles} icon="cake-variant-outline" label={t.profileDateOfBirth} value={dob} />
              </>
            )}
          </View>

          {!editMode ? (
            <View style={styles.statsGrid}>
              <>
                <StatTile st={styles} label={t.profileMemberSince} value={memberSince} />
                <StatTile st={styles} label={t.profileHealthScore} value={`${profile.healthScore}/100`} highlight />
                <StatTile
                  st={styles}
                  label={t.profileActiveRx}
                  value={String(profile.activePrescriptions)}
                  onPress={() => navigation.navigate('ProductList', { category: 'Medicines' })}
                />
                <StatTile
                  st={styles}
                  label={t.profileOpenOrders}
                  value={String(profile.openOrders)}
                  onPress={() => navigation.navigate('Main', { screen: 'Chat' })}
                />
              </>
            </View>
          ) : null}
        </View>

        {/* Health ID */}
        <Pressable
          style={styles.qrCard}
          onPress={() =>
            Alert.alert(
              t.profileHealthId,
              `${profile.healthIdDisplay}\n\nShow this code at labs and prescription pickup.`
            )
          }
        >
          <View style={styles.qrTop}>
            <MaterialCommunityIcons name="qrcode" size={44} color={colors.onPrimaryContainer} />
            <View style={{ flex: 1 }}>
              <Text style={styles.qrTitle}>{t.profileHealthId}</Text>
              <Text style={styles.qrSub}>{t.profileHealthIdHint}</Text>
              {editMode ? (
                <View style={styles.inlineFieldWrap}>
                  <Text style={styles.inlineFieldLabelLight}>{t.profileHealthId}</Text>
                  <TextInput
                    style={styles.inlineQrInput}
                    value={draftProfile.healthIdDisplay}
                    onChangeText={(v) => setDraftField('healthIdDisplay', v)}
                    placeholder="Health ID"
                    autoCapitalize="characters"
                    placeholderTextColor={colors.onPrimaryContainer}
                  />
                </View>
              ) : (
                <Text style={styles.qrCode}>{profile.healthIdDisplay}</Text>
              )}
            </View>
            <MaterialCommunityIcons name={chevron} size={22} color={colors.onPrimaryContainer} />
          </View>
        </Pressable>

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
    editActionsRow: { flexDirection: 'row', gap: 10, alignSelf: 'flex-end', marginTop: 14 },
    editActionGhost: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 10,
      backgroundColor: c.surfaceContainerHigh,
    },
    editActionGhostTxt: { color: c.onSurface, fontWeight: '700' },
    editAction: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 10,
      backgroundColor: c.primaryContainer,
    },
    editActionTxt: { color: c.onPrimaryContainer, fontWeight: '800' },
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
    inlineEditGroup: { gap: 8 },
    inlineFieldWrap: { gap: 6 },
    inlineFieldLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: c.mutedIcon,
      letterSpacing: 0.3,
      textTransform: 'uppercase',
    },
    inlineFieldLabelLight: {
      fontSize: 11,
      fontWeight: '800',
      color: c.onPrimaryContainer,
      opacity: 0.9,
      letterSpacing: 0.4,
      textTransform: 'uppercase',
    },
    inlineFieldInput: {
      height: 42,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      backgroundColor: c.surfaceContainerHigh,
      paddingHorizontal: 12,
      color: c.onSurface,
      fontSize: 14,
      fontWeight: '600',
    },
    inlineNameInput: {
      height: 40,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      backgroundColor: c.surfaceContainerHigh,
      color: c.onSurface,
      fontSize: 18,
      fontWeight: '800',
      paddingHorizontal: 12,
      minWidth: 180,
    },
    inlineHintInput: {
      height: 38,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      backgroundColor: c.surfaceContainerHigh,
      color: c.onSurfaceVariant,
      fontSize: 12,
      paddingHorizontal: 10,
    },
    inlineStatsEdit: { width: '100%', gap: 8 },
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
    inlineQrInput: {
      marginTop: 8,
      height: 34,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.45)',
      backgroundColor: 'rgba(255,255,255,0.14)',
      color: c.onPrimaryContainer,
      paddingHorizontal: 10,
      fontSize: 13,
      fontWeight: '800',
      letterSpacing: 1,
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
