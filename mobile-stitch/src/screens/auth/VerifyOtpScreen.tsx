import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useRef, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInput as TextInputType,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { imagesB2 } from '../../assets/imagesBatch2';
import { useAuth } from '../../context/AuthContext';
import type { ThemeColors } from '../../theme/palettes';
import { screenRootBg } from '../../theme/screenBackground';
import { useTheme } from '../../theme/ThemeContext';
import type { RootStackParamList } from '../../navigation/navigationTypes';
import { resetToMain } from '../../navigation/navigationReset';
import { ClinicalHeader } from '../../components/ClinicalHeader';

type Props = NativeStackScreenProps<RootStackParamList, 'VerifyOtp'>;

export function VerifyOtpScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { signIn } = useAuth();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createVerifyOtpStyles(colors, isDark), [colors, isDark]);
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const refs = useRef<(TextInputType | null)[]>([]);

  const setAt = (i: number, v: string) => {
    const d = v.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[i] = d;
    setDigits(next);
    if (d && i < 5) refs.current[i + 1]?.focus();
  };

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
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 32, paddingHorizontal: 24 }}>
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name="shield-check" size={40} color={colors.primary} />
        </View>
        <Text style={styles.h2}>Confirm Access</Text>
        <Text style={styles.body}>
          Secure authentication required. Please enter the 6-digit code sent to your registered mobile
          device ending in <Text style={styles.em}>**82</Text>.
        </Text>

        <View style={styles.otpRow}>
          {digits.map((d, i) => (
            <TextInput
              key={i}
              ref={(r) => {
                refs.current[i] = r;
              }}
              style={styles.otpCell}
              keyboardType="number-pad"
              maxLength={1}
              value={d}
              onChangeText={(t) => setAt(i, t)}
              placeholder="•"
              placeholderTextColor={colors.outline}
            />
          ))}
        </View>

        <View style={styles.timerRow}>
          <MaterialCommunityIcons name="clock-outline" size={16} color={colors.onSurfaceVariant} />
          <Text style={styles.timer}>Code expires in 01:54</Text>
        </View>
        <Pressable onPress={() => Alert.alert('Code sent', 'A new verification code would be sent to your phone.')}>
          <Text style={styles.resend}>Resend Code</Text>
        </Pressable>

        <Pressable
          onPress={() => {
            signIn();
            resetToMain(navigation);
          }}
          style={{ marginTop: 20 }}
        >
          <LinearGradient colors={[colors.primary, colors.primaryContainer]} style={styles.verifyBtn}>
            <Text style={styles.verifyText}>Verify & Continue</Text>
            <MaterialCommunityIcons name="arrow-right" size={20} color={colors.onPrimary} />
          </LinearGradient>
        </Pressable>

        <View style={styles.helpCard}>
          <MaterialCommunityIcons name="face-agent" size={28} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.helpTitle}>Need assistance?</Text>
            <Text style={styles.helpBody}>
              If you&apos;re having trouble receiving the code, contact Clinical Support or check your
              network connectivity.
            </Text>
          </View>
        </View>
        <Image source={{ uri: imagesB2.verifyOtpHelp }} style={styles.helpImg} contentFit="cover" />
      </ScrollView>
    </View>
  );
}

function createVerifyOtpStyles(c: ThemeColors, isDark: boolean) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: screenRootBg(isDark, c.background) },
    iconCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: c.surfaceContainerHigh,
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      marginTop: 16,
      borderWidth: 1,
      borderColor: c.outlineVariant,
    },
    h2: { fontSize: 26, fontWeight: '800', color: c.onSurface, textAlign: 'center', marginTop: 20 },
    body: {
      textAlign: 'center',
      color: c.onSurfaceVariant,
      marginTop: 12,
      lineHeight: 22,
      marginBottom: 28,
    },
    em: { color: c.primary, fontWeight: '700' },
    otpRow: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginBottom: 24 },
    otpCell: {
      width: 48,
      height: 52,
      borderRadius: 14,
      backgroundColor: c.surfaceContainerHighest,
      textAlign: 'center',
      fontSize: 22,
      fontWeight: '800',
      color: c.primary,
    },
    timerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
    timer: { fontSize: 12, letterSpacing: 1, color: c.onSurfaceVariant, fontWeight: '700' },
    resend: { textAlign: 'center', color: c.primary, marginTop: 12, fontWeight: '700', opacity: 0.85 },
    verifyBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 16,
      borderRadius: 14,
    },
    verifyText: { color: c.onPrimary, fontSize: 16, fontWeight: '800' },
    helpCard: {
      flexDirection: 'row',
      gap: 14,
      padding: 20,
      borderRadius: 22,
      backgroundColor: c.surfaceContainerLow,
      marginTop: 28,
    },
    helpTitle: { fontWeight: '800', color: c.onSurface, marginBottom: 6 },
    helpBody: { fontSize: 12, color: c.onSurfaceVariant, lineHeight: 18 },
    helpImg: { width: '100%', height: 120, borderRadius: 16, marginTop: 12, opacity: 0.85 },
  });
}
