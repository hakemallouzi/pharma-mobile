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
import { imagesB2 } from '../../assets/imagesBatch2';
import { useAuth } from '../../context/AuthContext';
import { useLocale } from '../../context/LocaleContext';
import { Image } from 'expo-image';
import type { RootStackParamList } from '../../navigation/navigationTypes';
import type { ThemeColors } from '../../theme/palettes';
import { screenRootBg } from '../../theme/screenBackground';
import { useTheme } from '../../theme/ThemeContext';
import { resetToMain } from '../../navigation/navigationReset';
import { ClinicalHeader } from '../../components/ClinicalHeader';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { signIn } = useAuth();
  const { locale, isRTL } = useLocale();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createLoginStyles(colors, isDark), [colors, isDark]);
  const [showPass, setShowPass] = useState(false);

  // PersistentBottomNav is absolutely positioned; reserve its space to prevent overlay.
  const bottomNavInset = Math.max(insets.bottom, 10);
  const bottomNavOverlayHeight = 67 + bottomNavInset;

  return (
    <View style={styles.root}>
      <ClinicalHeader
        title={locale === 'ar' ? 'ذا كلينيكال أتيليه' : 'The Clinical Atelier'}
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        contentContainerStyle={{ paddingBottom: bottomNavOverlayHeight + 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroImg}>
          <Image source={{ uri: imagesB2.loginHero }} style={StyleSheet.absoluteFill} contentFit="cover" />
          <LinearGradient colors={['transparent', colors.surface]} style={StyleSheet.absoluteFill} />
          <View style={styles.heroText}>
            <Text style={styles.heroTitle}>
              Your Digital Sanctuary for <Text style={styles.italic}>Curated Care.</Text>
            </Text>
            <Text style={styles.heroSub}>
              Precision meets peace. Access your clinical workspace and wellness dashboard.
            </Text>
          </View>
        </View>

        <View style={styles.form}>
          <Text style={styles.welcome}>Welcome Back</Text>
          <Text style={styles.welcomeSub}>Enter your credentials to access your atelier.</Text>

          <Text style={styles.label}>Email or Phone</Text>
          <TextInput
            placeholder="atelier@vitalis.health"
            placeholderTextColor={colors.outline}
            style={styles.input}
            autoCapitalize="none"
          />

          <View style={styles.rowBetween}>
            <Text style={styles.label}>Password</Text>
            <Pressable onPress={() => Alert.alert('Reset password', 'A reset link would be sent to your email.')}>
              <Text style={styles.forgot}>Forgot Password?</Text>
            </Pressable>
          </View>
          <View>
            <View style={{ position: 'relative' }}>
              <TextInput
                placeholder="••••••••"
                placeholderTextColor={colors.outline}
                style={[
                  styles.input,
                  isRTL ? { paddingLeft: 48 } : { paddingRight: 48 },
                ]}
                secureTextEntry={!showPass}
              />
              <Pressable
                style={[styles.eye, isRTL ? { left: 14, right: undefined } : { right: 14 }]}
                onPress={() => setShowPass((s) => !s)}
              >
                <MaterialCommunityIcons name={showPass ? 'eye-off' : 'eye'} size={20} color={colors.onSurfaceVariant} />
              </Pressable>
            </View>
          </View>

          <Pressable
            onPress={() => {
              signIn();
              resetToMain(navigation);
            }}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryContainer]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.loginBtn}
            >
              <Text style={styles.loginBtnText}>Login</Text>
            </LinearGradient>
          </Pressable>

          <View style={styles.divider}>
            <View style={styles.divLine} />
            <Text style={styles.divText}>Or continue with</Text>
            <View style={styles.divLine} />
          </View>

          <View style={styles.socialRow}>
            <Pressable
              style={styles.socialBtn}
              onPress={() => Alert.alert('Google', 'Continue with Google in production.')}
            >
              <Text style={styles.socialTxt}>Google</Text>
            </Pressable>
            <Pressable
              style={styles.socialBtn}
              onPress={() => Alert.alert('Apple', 'Continue with Apple in production.')}
            >
              <Text style={styles.socialTxt}>Apple</Text>
            </Pressable>
          </View>

          <Text style={styles.footer}>
            New to the atelier?{' '}
            <Text style={styles.link} onPress={() => navigation.navigate('Signup')}>
              Create Account
            </Text>
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function createLoginStyles(c: ThemeColors, isDark: boolean) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: screenRootBg(isDark, c.surface) },
    heroImg: { height: 220, justifyContent: 'flex-end' },
    heroText: { padding: 24 },
    heroTitle: { fontSize: 24, fontWeight: '800', color: c.onSurface, lineHeight: 30 },
    italic: { color: c.primary, fontStyle: 'italic' },
    heroSub: { marginTop: 8, color: c.onSurfaceVariant, fontSize: 14, lineHeight: 20 },
    form: { padding: 24 },
    welcome: { fontSize: 24, fontWeight: '800', color: c.onSurface },
    welcomeSub: { marginTop: 6, color: c.onSurfaceVariant, marginBottom: 24 },
    label: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 1,
      color: c.primary,
      marginBottom: 8,
      textTransform: 'uppercase',
    },
    input: {
      backgroundColor: '#fff',
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      paddingVertical: 12,
      paddingHorizontal: 14,
      marginBottom: 20,
      color: c.onSurface,
      fontSize: 16,
    },
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    forgot: { fontSize: 11, color: c.onSurfaceVariant, fontWeight: '600' },
    eye: {
      position: 'absolute',
      top: '35%',
      transform: [{ translateY: -10 }],
    },
    loginBtn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
    loginBtnText: { color: c.onPrimary, fontSize: 18, fontWeight: '800' },
    divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 24, gap: 12 },
    divLine: { flex: 1, height: 1, backgroundColor: c.outlineVariant },
    divText: { fontSize: 10, letterSpacing: 2, color: c.onSurfaceVariant },
    socialRow: { flexDirection: 'row', gap: 12 },
    socialBtn: {
      flex: 1,
      backgroundColor: c.surfaceContainerHigh,
      paddingVertical: 14,
      borderRadius: 14,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: c.outlineVariant,
    },
    socialTxt: { fontWeight: '600', color: c.onSurface },
    footer: { textAlign: 'center', marginTop: 24, color: c.onSurfaceVariant },
    link: { color: c.primary, fontWeight: '800' },
  });
}
