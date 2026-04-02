import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useState } from 'react';
import { Alert, Linking, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getCountries, getCountryCallingCode } from 'libphonenumber-js';
import type { CountryCode } from 'libphonenumber-js';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { imagesB2 } from '../../assets/imagesBatch2';
import { useLocale } from '../../context/LocaleContext';
import type { RootStackParamList } from '../../navigation/navigationTypes';
import type { ThemeColors } from '../../theme/palettes';
import { screenRootBg } from '../../theme/screenBackground';
import { useTheme } from '../../theme/ThemeContext';
import { ClinicalHeader } from '../../components/ClinicalHeader';

type Props = NativeStackScreenProps<RootStackParamList, 'SendOtp'>;

type CountryOption = {
  iso2: CountryCode;
  dialCode: string;
  placeholder: string;
};

export function SendOtpScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { locale } = useLocale();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createSendOtpStyles(colors, isDark), [colors, isDark]);
  const [phone, setPhone] = useState('');
  const allCountries = useMemo(() => {
    // Returns ISO2 region codes (e.g. 'JO', 'US', 'AE') that libphonenumber understands.
    const iso2List = getCountries();
    return iso2List
      .map((iso2) => {
        const code = getCountryCallingCode(iso2);
        if (!code) return null;
        return {
          iso2,
          dialCode: `+${code}`,
          placeholder: '000-000-0000',
        } as CountryOption;
      })
      .filter((x): x is CountryOption => x !== null)
      .sort((a, b) => a.iso2.localeCompare(b.iso2));
  }, []);

  const [selectedCountry, setSelectedCountry] = useState<CountryOption>(() => ({
    iso2: 'JO' as CountryCode,
    dialCode: `+${getCountryCallingCode('JO') ?? '962'}`,
    placeholder: '000-000-0000',
  }));
  const [countryPickerOpen, setCountryPickerOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');

  const filteredCountries = useMemo(() => {
    const q = countrySearch.trim().toLowerCase();
    if (!q) return allCountries;
    return allCountries.filter((c) => c.iso2.toLowerCase().includes(q) || c.dialCode.includes(q));
  }, [allCountries, countrySearch]);

  return (
    <View style={styles.root}>
      <ClinicalHeader
        title={locale === 'ar' ? 'ذا كلينيكال أتيليه' : 'The Clinical Atelier'}
        onBack={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 32, paddingHorizontal: 24 }}>
        <View style={styles.badge}>
          <MaterialCommunityIcons name="shield-lock" size={16} color={colors.primary} />
          <Text style={styles.badgeText}>Identity Protocol</Text>
        </View>
        <Text style={styles.h2}>
          Digital{'\n'}
          <Text style={styles.grad}>Verification.</Text>
        </Text>
        <Text style={styles.lead}>
          Enter your secure mobile line to receive a one-time gateway access code.
        </Text>

        <Text style={styles.label}>Phone Registry</Text>
        <View style={styles.phoneRow}>
          <Pressable
            style={styles.country}
            onPress={() => setCountryPickerOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="Select country code"
          >
            <Text style={styles.countryText}>
              {selectedCountry.iso2} {selectedCountry.dialCode}
            </Text>
            <MaterialCommunityIcons name="chevron-down" size={20} color={colors.onSurfaceVariant} />
          </Pressable>
          <TextInput
            style={styles.phoneInput}
            placeholder={selectedCountry.placeholder}
            placeholderTextColor={colors.outline}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
        </View>

        <View style={styles.info}>
          <MaterialCommunityIcons name="information" size={22} color={colors.tertiary} />
          <Text style={styles.infoText}>
            Standard carrier message and data rates may apply. Vitalis Health uses end-to-end encrypted
            SMS protocols for secure delivery.
          </Text>
        </View>

        <Pressable onPress={() => navigation.navigate('VerifyOtp')}>
          <LinearGradient colors={[colors.primary, colors.primaryContainer]} style={styles.sendBtn}>
            <Text style={styles.sendText}>Send Access Code</Text>
            <MaterialCommunityIcons name="arrow-right" size={22} color={colors.onPrimaryContainer} />
          </LinearGradient>
        </Pressable>

        <View style={styles.faces}>
          <View style={styles.faceRow}>
            <Image source={{ uri: imagesB2.sendOtpAvatar1 }} style={styles.face} contentFit="cover" />
            <Image source={{ uri: imagesB2.sendOtpAvatar2 }} style={[styles.face, { marginLeft: -10 }]} contentFit="cover" />
            <View style={[styles.face, styles.faceMore, { marginLeft: -10 }]}>
              <Text style={styles.faceMoreText}>+2k</Text>
            </View>
          </View>
          <View>
            <Text style={styles.statusLabel}>Clinic Status</Text>
            <View style={styles.dotRow}>
              <View style={styles.dot} />
              <Text style={styles.statusTxt}>Systems Operational</Text>
            </View>
          </View>
        </View>

        <Text style={styles.help}>Trouble signing in?</Text>
        <Pressable onPress={() => Linking.openURL('mailto:support@vitalis.health').catch(() => {})}>
          <Text style={styles.helpLink}>Contact Clinical Support</Text>
        </Pressable>

        <Modal
          visible={countryPickerOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setCountryPickerOpen(false)}
        >
          <Pressable style={styles.countryBackdrop} onPress={() => setCountryPickerOpen(false)} />
          <View style={[styles.countrySheet, { top: insets.top + 12, bottom: insets.bottom + 24 }]}>
            <View style={styles.countrySheetHead}>
              <Text style={styles.countrySheetTitle}>{locale === 'ar' ? 'اختر الدولة' : 'Select country'}</Text>
              <Pressable
                style={styles.countryCloseBtn}
                onPress={() => setCountryPickerOpen(false)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Close country picker"
              >
                <MaterialCommunityIcons name="close" size={18} color={colors.primary} />
              </Pressable>
            </View>
            <View style={styles.countrySearchRow}>
              <MaterialCommunityIcons name="magnify" size={18} color={colors.onSurfaceVariant} />
              <TextInput
                style={styles.countrySearchInput}
                placeholder={locale === 'ar' ? 'ابحث (مثل: jo أو +962)' : 'Search (e.g. JO or +962)'}
                placeholderTextColor={colors.outline}
                value={countrySearch}
                onChangeText={setCountrySearch}
                autoCapitalize="characters"
              />
            </View>
            <ScrollView style={styles.countryOptionsWrap} showsVerticalScrollIndicator={false}>
              {filteredCountries.map((c) => {
                const isOn = c.iso2 === selectedCountry.iso2;
              return (
                <Pressable
                  key={c.iso2}
                  style={[styles.countryOption, isOn && { borderColor: colors.primary }]}
                  onPress={() => {
                    setSelectedCountry(c);
                    setCountryPickerOpen(false);
                    setPhone('');
                  }}
                  accessibilityRole="button"
                >
                  <Text style={[styles.countryOptionTxt, isOn && { color: colors.primary }]}>
                    {`${c.iso2} ${c.dialCode}`}
                  </Text>
                  {isOn ? (
                    <MaterialCommunityIcons name="check" size={18} color={colors.primary} />
                  ) : (
                    <View style={{ width: 18 }} />
                  )}
                </Pressable>
              );
              })}
            </ScrollView>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
}

function createSendOtpStyles(c: ThemeColors, isDark: boolean) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: screenRootBg(isDark, c.surface) },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      alignSelf: 'flex-start',
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: c.surfaceContainerHigh,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      marginTop: 16,
    },
    badgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 2, color: c.onSurfaceVariant },
    h2: { fontSize: 38, fontWeight: '900', color: c.onSurface, marginTop: 20, lineHeight: 42 },
    grad: { color: c.primary },
    lead: { fontSize: 16, color: c.onSurfaceVariant, marginTop: 12, lineHeight: 24, marginBottom: 28 },
    label: { fontSize: 11, fontWeight: '800', letterSpacing: 2, color: c.onSurfaceVariant, marginBottom: 12 },
    phoneRow: { flexDirection: 'row', gap: 10 },
    country: {
      width: 100,
      height: 52,
      borderRadius: 14,
      backgroundColor: c.surfaceContainerHigh,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
    },
    countryText: { color: c.onSurface, fontWeight: '600', fontSize: 13 },
    phoneInput: {
      flex: 1,
      height: 52,
      borderRadius: 14,
      backgroundColor: c.surfaceContainerHigh,
      paddingHorizontal: 16,
      fontSize: 17,
      letterSpacing: 1,
      color: c.onSurface,
    },
    info: {
      flexDirection: 'row',
      gap: 12,
      padding: 18,
      borderRadius: 18,
      backgroundColor: c.surfaceContainerLow,
      marginTop: 20,
      borderWidth: 1,
      borderColor: c.outlineVariant,
    },
    infoText: { flex: 1, fontSize: 12, color: c.onSurfaceVariant, lineHeight: 18 },
    countryBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
    countrySheet: {
      position: 'absolute',
      left: 24,
      right: 24,
      backgroundColor: c.surface,
      borderRadius: 22,
      paddingHorizontal: 16,
      paddingBottom: 18,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      overflow: 'hidden',
    },
    countrySheetTitle: {
      fontSize: 14,
      fontWeight: '900',
      color: c.primary,
      marginBottom: 0,
    },
    countrySheetHead: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 8,
      marginBottom: 10,
    },
    countryCloseBtn: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#fff',
      borderWidth: 1,
      borderColor: c.primary,
    },
    countrySearchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 14,
      backgroundColor: c.surfaceContainerHigh,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      marginBottom: 12,
    },
    countrySearchInput: {
      flex: 1,
      fontSize: 14,
      fontWeight: '700',
      color: c.onSurface,
      paddingVertical: 0,
    },
    countryOption: {
      minHeight: 46,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      backgroundColor: c.surfaceContainerLow,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 12,
      marginBottom: 10,
    },
    countryOptionTxt: { fontSize: 13, fontWeight: '800', color: c.onSurfaceVariant },
    countryOptionsWrap: { flex: 1 },
    sendBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      paddingVertical: 18,
      borderRadius: 22,
      marginTop: 20,
    },
    sendText: { color: c.onPrimaryContainer, fontSize: 17, fontWeight: '800' },
    faces: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 36,
    },
    faceRow: { flexDirection: 'row', alignItems: 'center' },
    face: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: c.surface },
    faceMore: {
      backgroundColor: c.surfaceContainerHigh,
      alignItems: 'center',
      justifyContent: 'center',
    },
    faceMoreText: { fontSize: 11, fontWeight: '800', color: c.primary },
    statusLabel: { fontSize: 10, fontWeight: '800', color: c.onSurfaceVariant, textTransform: 'uppercase' },
    dotRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: c.primary },
    statusTxt: { fontSize: 12, fontWeight: '600', color: c.onSurface },
    help: { textAlign: 'center', marginTop: 32, color: c.onSurfaceVariant },
    helpLink: { textAlign: 'center', color: c.primary, fontWeight: '800', marginTop: 8 },
  });
}
