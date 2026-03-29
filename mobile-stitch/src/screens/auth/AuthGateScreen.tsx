import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { imagesB2 } from '../../assets/imagesBatch2';
import { useLocale } from '../../context/LocaleContext';
import type { RootStackParamList } from '../../navigation/navigationTypes';
import type { ThemeColors } from '../../theme/palettes';
import { screenRootBg } from '../../theme/screenBackground';
import { useTheme } from '../../theme/ThemeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'AuthGate'>;

export function AuthGateScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { locale, setLocale } = useLocale();
  const { colors, toggleScheme, isDark } = useTheme();
  const styles = useMemo(() => createAuthGateStyles(colors, isDark), [colors, isDark]);

  return (
    <View style={styles.root}>
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.brand}>The Clinical Atelier</Text>
        <View style={styles.topActions}>
          <Pressable style={styles.pill} onPress={() => setLocale(locale === 'en' ? 'ar' : 'en')}>
            <MaterialCommunityIcons name="translate" size={16} color={colors.primary} />
            <Text style={styles.pillText}>{locale === 'en' ? 'EN / AR' : 'AR / EN'}</Text>
          </Pressable>
          <Pressable style={styles.iconRound} onPress={toggleScheme} accessibilityLabel="Toggle theme">
            <MaterialCommunityIcons
              name={isDark ? 'white-balance-sunny' : 'weather-night'}
              size={22}
              color={colors.onSurface}
            />
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.logoWrap}>
            <LinearGradient
              colors={[colors.tabPillActive, 'transparent']}
              style={StyleSheet.absoluteFill}
            />
            <MaterialCommunityIcons name="medical-bag" size={56} color={colors.primary} />
          </View>
          <Text style={styles.h1}>
            Vitalis <Text style={styles.h1Accent}>Health</Text>
          </Text>
          <Text style={styles.sub}>
            Elevated care through clinical precision and modern sanctuary.
          </Text>

          <LinearGradient
            colors={[colors.primary, colors.primaryContainer]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.primaryCta}
          >
            <Pressable
              style={styles.primaryCtaInner}
              onPress={() => navigation.navigate('SendOtp')}
            >
              <MaterialCommunityIcons name="phone" size={22} color={colors.onPrimary} />
              <Text style={styles.primaryCtaText}>Continue with Phone</Text>
            </Pressable>
          </LinearGradient>

          <Pressable
            style={styles.secondaryCta}
            onPress={() => navigation.navigate('Signup')}
          >
            <Text style={styles.secondaryCtaText}>Get Started</Text>
          </Pressable>

          <Text style={styles.memberHint}>Existing health member?</Text>
          <Pressable onPress={() => navigation.navigate('Login')}>
            <Text style={styles.link}>Login for existing members</Text>
          </Pressable>
        </View>

        <View style={styles.bento}>
          <View style={styles.cardLarge}>
            <View style={styles.accentBar} />
            <Text style={styles.cardTitle}>Digital Prescription Sanctuary</Text>
            <Text style={styles.cardBody}>
              Securely manage your medical records and refills with an editorial interface designed
              for clarity.
            </Text>
            <Image source={{ uri: imagesB2.authBentoPills }} style={styles.cardImg} contentFit="cover" />
          </View>

          <View style={styles.cardMedium}>
            <MaterialCommunityIcons name="microscope" size={36} color={colors.primary} />
            <Text style={styles.cardTitleSm}>Lab-Grade Precision</Text>
            <Text style={styles.cardBodySm}>
              Real-time tracking of your vitals and laboratory results with professional
              visualization.
            </Text>
            <View style={styles.avatars}>
              {[0, 1, 2].map((i) => (
                <View key={i} style={[styles.avatar, { marginLeft: i > 0 ? -12 : 0 }]} />
              ))}
            </View>
            <Text style={styles.joined}>Joined by 12k+ members</Text>
          </View>

          <View style={styles.cardImage}>
            <Image source={{ uri: imagesB2.authArchitecture }} style={styles.fullImg} contentFit="cover" />
            <LinearGradient
              colors={['transparent', colors.surface]}
              style={styles.imgGrad}
            />
            <View style={styles.imgCaption}>
              <Text style={styles.imgLabel}>Architecture</Text>
              <Text style={styles.imgTitle}>Designed for Calm</Text>
            </View>
          </View>

          <View style={styles.cardWide}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Premium Care Membership</Text>
              <View style={styles.checkRow}>
                <MaterialCommunityIcons name="check-circle" size={18} color={colors.primary} />
                <Text style={styles.checkText}>24/7 Specialist Access</Text>
              </View>
              <View style={styles.checkRow}>
                <MaterialCommunityIcons name="check-circle" size={18} color={colors.primary} />
                <Text style={styles.checkText}>Priority Pharmacy Fulfillment</Text>
              </View>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>15m</Text>
              <Text style={styles.statLabel}>Average response time</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerCopy}>© 2024 The Clinical Atelier • Vitalis Health</Text>
          <View style={styles.footerLinks}>
            <Pressable onPress={() => Linking.openURL('https://vitalis.health/privacy').catch(() => {})}>
              <Text style={styles.footerLink}>Privacy</Text>
            </Pressable>
            <Pressable onPress={() => Linking.openURL('https://vitalis.health/terms').catch(() => {})}>
              <Text style={styles.footerLink}>Terms</Text>
            </Pressable>
            <Pressable onPress={() => Linking.openURL('mailto:support@vitalis.health').catch(() => {})}>
              <Text style={styles.footerLink}>Support</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function createAuthGateStyles(c: ThemeColors, isDark: boolean) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: screenRootBg(isDark, c.background) },
    topBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingBottom: 12,
      backgroundColor: c.headerBar,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.outlineVariant,
    },
    brand: { color: c.primary, fontWeight: '800', fontSize: 18, letterSpacing: -0.5 },
    topActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    pill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: c.surfaceContainerHigh,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
    },
    pillText: { fontSize: 11, fontWeight: '600', color: c.onSurface, letterSpacing: 0.5 },
    iconRound: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: c.surfaceContainerHigh,
      alignItems: 'center',
      justifyContent: 'center',
    },
    scroll: { paddingHorizontal: 24 },
    hero: { alignItems: 'center', paddingTop: 24 },
    logoWrap: {
      width: 96,
      height: 96,
      borderRadius: 24,
      backgroundColor: c.surfaceContainerLow,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 40,
      overflow: 'hidden',
    },
    h1: {
      fontSize: 36,
      fontWeight: '800',
      color: c.onBackground,
      textAlign: 'center',
      marginBottom: 12,
    },
    h1Accent: { color: c.primary },
    sub: {
      fontSize: 17,
      color: c.onSurfaceVariant,
      textAlign: 'center',
      maxWidth: 300,
      marginBottom: 36,
    },
    primaryCta: {
      width: '100%',
      borderRadius: 14,
      marginBottom: 12,
      overflow: 'hidden',
      shadowColor: c.primaryContainer,
      shadowOpacity: 0.35,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 0 },
    },
    primaryCtaInner: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      paddingVertical: 18,
    },
    primaryCtaText: { color: c.onPrimary, fontSize: 17, fontWeight: '800' },
    secondaryCta: {
      width: '100%',
      backgroundColor: c.surfaceContainerHigh,
      borderRadius: 14,
      paddingVertical: 18,
      alignItems: 'center',
      marginBottom: 28,
    },
    secondaryCtaText: { color: c.onSurface, fontSize: 17, fontWeight: '700' },
    memberHint: { color: c.onSurfaceVariant, fontSize: 14, fontWeight: '600', marginBottom: 8 },
    link: {
      color: c.primary,
      fontWeight: '800',
      textDecorationLine: 'underline',
      marginBottom: 40,
    },
    bento: { gap: 20, marginTop: 8 },
    cardLarge: {
      backgroundColor: c.surfaceContainerLow,
      borderRadius: 28,
      padding: 28,
      overflow: 'hidden',
    },
    accentBar: { width: 40, height: 3, backgroundColor: c.primary, marginBottom: 16 },
    cardTitle: { fontSize: 22, fontWeight: '800', color: c.onSurface, marginBottom: 12 },
    cardBody: { fontSize: 14, color: c.onSurfaceVariant, marginBottom: 16, maxWidth: 320 },
    cardImg: { width: '100%', height: 140, borderTopLeftRadius: 24, opacity: 0.85 },
    cardMedium: {
      backgroundColor: c.surfaceContainerHigh,
      borderRadius: 28,
      padding: 28,
      borderLeftWidth: 4,
      borderLeftColor: c.outlineVariant,
    },
    cardTitleSm: { fontSize: 18, fontWeight: '800', color: c.onSurface, marginTop: 8, marginBottom: 8 },
    cardBodySm: { fontSize: 13, color: c.onSurfaceVariant, marginBottom: 20 },
    avatars: { flexDirection: 'row', marginBottom: 8 },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: c.surfaceContainerHighest,
      borderWidth: 2,
      borderColor: c.surface,
    },
    joined: { fontSize: 11, fontWeight: '700', letterSpacing: 1, color: c.primary },
    cardImage: {
      height: 220,
      borderRadius: 28,
      overflow: 'hidden',
      backgroundColor: c.surfaceContainerLow,
    },
    fullImg: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
    imgGrad: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '60%' },
    imgCaption: { position: 'absolute', bottom: 20, left: 20 },
    imgLabel: {
      fontSize: 10,
      letterSpacing: 2,
      color: c.primary,
      textTransform: 'uppercase',
      marginBottom: 4,
    },
    imgTitle: { fontSize: 18, fontWeight: '800', color: c.onSurface },
    cardWide: {
      backgroundColor: c.surfaceContainerLow,
      borderRadius: 28,
      padding: 28,
      flexDirection: 'row',
      gap: 16,
      alignItems: 'center',
    },
    checkRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
    checkText: { fontSize: 14, color: c.onSurfaceVariant },
    statBox: {
      width: 120,
      aspectRatio: 1,
      backgroundColor: c.surfaceContainerHigh,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 12,
    },
    statNum: { fontSize: 28, fontWeight: '800', color: c.primary },
    statLabel: {
      fontSize: 10,
      textAlign: 'center',
      color: c.onSurfaceVariant,
      textTransform: 'uppercase',
      marginTop: 4,
    },
    footer: {
      marginTop: 36,
      paddingTop: 24,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.outlineVariant,
      gap: 16,
    },
    footerCopy: {
      fontSize: 11,
      letterSpacing: 1,
      color: c.onSurfaceVariant,
      textAlign: 'center',
      textTransform: 'uppercase',
    },
    footerLinks: { flexDirection: 'row', justifyContent: 'center', gap: 28 },
    footerLink: { fontSize: 11, letterSpacing: 1, color: c.onSurfaceVariant, fontWeight: '700' },
  });
}
