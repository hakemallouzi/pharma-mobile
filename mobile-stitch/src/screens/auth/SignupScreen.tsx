import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import type { ThemeColors } from '../../theme/palettes';
import { screenRootBg } from '../../theme/screenBackground';
import { useTheme } from '../../theme/ThemeContext';
import type { RootStackParamList } from '../../navigation/navigationTypes';
import { resetToMain } from '../../navigation/navigationReset';
import { ClinicalHeader } from '../../components/ClinicalHeader';

type Props = NativeStackScreenProps<RootStackParamList, 'Signup'>;

export function SignupScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { signIn } = useAuth();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createSignupStyles(colors, isDark), [colors, isDark]);
  const [terms, setTerms] = useState(false);

  return (
    <View style={styles.root}>
      <ClinicalHeader
        title="The Clinical Atelier"
        onBack={() => navigation.goBack()}
        right={
          <Pressable hitSlop={8}>
            <MaterialCommunityIcons name="dots-vertical" size={24} color={colors.primary} />
          </Pressable>
        }
      />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
        <View style={styles.hero}>
          <View style={styles.iconBox}>
            <MaterialCommunityIcons name="shield-check" size={40} color={colors.primary} />
          </View>
          <Text style={styles.kicker}>Registration</Text>
          <Text style={styles.title}>
            Begin Your <Text style={styles.accent}>Curated Care.</Text>
          </Text>
          <Text style={styles.sub}>
            Join a sanctuary of precision medicine and holistic wellness.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Create New Account</Text>
          <Field st={styles} label="Full Name" placeholder="Vitalis User" icon="account" />
          <Field st={styles} label="Email Address" placeholder="care@vitalis.atelier" icon="email" keyboard="email-address" />
          <View style={styles.row2}>
            <View style={{ flex: 1 }}>
              <Field st={styles} label="Password" placeholder="••••••••" icon="lock" secure />
            </View>
            <View style={{ flex: 1 }}>
              <Field st={styles} label="Confirm" placeholder="••••••••" icon="lock-check" secure />
            </View>
          </View>

          <Pressable style={styles.termsRow} onPress={() => setTerms(!terms)}>
            <MaterialCommunityIcons
              name={terms ? 'checkbox-marked' : 'checkbox-blank-outline'}
              size={24}
              color={terms ? colors.primary : colors.outline}
            />
            <Text style={styles.terms}>
              I acknowledge the <Text style={styles.link}>Terms of Service</Text> and consent to digital
              data processing.
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              if (!terms) {
                Alert.alert('Terms', 'Please accept the Terms of Service to continue.');
                return;
              }
              signIn();
              resetToMain(navigation);
            }}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryContainer]}
              style={styles.createBtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.createText}>Create Account</Text>
              <MaterialCommunityIcons name="arrow-right" size={20} color={colors.onPrimary} />
            </LinearGradient>
          </Pressable>

          <View style={styles.divider}>
            <View style={styles.divLine} />
            <Text style={styles.divMid}>or register with</Text>
            <View style={styles.divLine} />
          </View>
          <View style={styles.socialRow}>
            <Pressable
              style={styles.socialBtn}
              onPress={() => Alert.alert('Google', 'OAuth will connect to your Google account in production.')}
            >
              <MaterialCommunityIcons name="google" size={22} color={colors.onSurface} />
              <Text style={styles.socialTxt}>Google</Text>
            </Pressable>
            <Pressable
              style={styles.socialBtn}
              onPress={() => Alert.alert('Apple', 'Sign in with Apple will be enabled in production.')}
            >
              <MaterialCommunityIcons name="apple" size={22} color={colors.onSurface} />
              <Text style={styles.socialTxt}>Apple</Text>
            </Pressable>
          </View>
        </View>

        <Text style={styles.footer}>
          Already a member?{' '}
          <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
            Sign In
          </Text>
        </Text>
      </ScrollView>
    </View>
  );
}

function Field({
  st,
  label,
  placeholder,
  icon,
  secure,
  keyboard,
}: {
  st: ReturnType<typeof createSignupStyles>;
  label: string;
  placeholder: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  secure?: boolean;
  keyboard?: 'email-address';
}) {
  const { colors } = useTheme();
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={st.fieldLabel}>{label}</Text>
      <View style={st.fieldWrap}>
        <MaterialCommunityIcons name={icon} size={20} color={colors.outline} style={st.fieldIcon} />
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={colors.outline}
          style={st.fieldInput}
          secureTextEntry={secure}
          keyboardType={keyboard}
        />
      </View>
    </View>
  );
}

function createSignupStyles(c: ThemeColors, isDark: boolean) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: screenRootBg(isDark, c.surfaceDim) },
    hero: { alignItems: 'center', paddingHorizontal: 24, paddingTop: 16 },
    iconBox: {
      width: 64,
      height: 64,
      borderRadius: 16,
      backgroundColor: c.surfaceContainerHigh,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    kicker: { fontSize: 11, fontWeight: '800', letterSpacing: 2, color: c.primary, marginBottom: 8 },
    title: { fontSize: 28, fontWeight: '800', textAlign: 'center', color: c.onSurface, lineHeight: 34 },
    accent: { color: c.primary },
    sub: { textAlign: 'center', color: c.onSurfaceVariant, marginTop: 12, maxWidth: 320, lineHeight: 22 },
    card: {
      margin: 24,
      padding: 28,
      borderRadius: 28,
      backgroundColor: c.surfaceContainerLow,
      borderWidth: 1,
      borderColor: c.outlineVariant,
    },
    cardTitle: { fontSize: 18, fontWeight: '800', color: c.primary, marginBottom: 20 },
    fieldLabel: { fontSize: 13, fontWeight: '600', color: c.onSurfaceVariant, marginBottom: 8, marginLeft: 4 },
    fieldWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.surfaceContainerHighest,
      borderRadius: 14,
      paddingHorizontal: 14,
    },
    fieldIcon: { marginRight: 8 },
    fieldInput: { flex: 1, paddingVertical: 14, color: c.onSurface, fontSize: 14 },
    row2: { flexDirection: 'row', gap: 12 },
    termsRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', marginVertical: 8 },
    terms: { flex: 1, fontSize: 13, color: c.onSurfaceVariant, lineHeight: 20 },
    link: { color: c.primary, fontWeight: '700' },
    createBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 16,
      borderRadius: 16,
      marginTop: 8,
    },
    createText: { color: c.onPrimary, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
    divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
    divLine: { flex: 1, height: 1, backgroundColor: c.outlineVariant },
    divMid: { paddingHorizontal: 12, fontSize: 13, color: c.outline },
    socialRow: { flexDirection: 'row', gap: 12 },
    socialBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: c.surfaceContainerHigh,
      paddingVertical: 12,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.outlineVariant,
    },
    socialTxt: { fontWeight: '600', color: c.onSurface },
    footer: { textAlign: 'center', color: c.onSurfaceVariant, marginBottom: 24 },
  });
}
