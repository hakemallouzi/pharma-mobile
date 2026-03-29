import { Image } from 'expo-image';
import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { imagesB2 } from '../assets/imagesBatch2';
import type { RootStackParamList } from '../navigation/navigationTypes';
import { ClinicalHeader } from '../components/ClinicalHeader';
import type { ThemeColors } from '../theme/palettes';
import { screenRootBg } from '../theme/screenBackground';
import { useTheme } from '../theme/ThemeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Addresses'>;

export function AddressesScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createAddressesStyles(colors, isDark), [colors, isDark]);
  const [q, setQ] = useState('');

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
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 24, paddingHorizontal: 24 }}>
        <Text style={styles.pageTitle}>Addresses</Text>
        <Text style={styles.pageSub}>
          Manage your delivery points for seamless prescription fulfillment.
        </Text>

        <View style={styles.search}>
          <MaterialCommunityIcons name="magnify" size={20} color={colors.outline} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search addresses..."
            placeholderTextColor={colors.outline}
            value={q}
            onChangeText={setQ}
          />
        </View>

        <Pressable
          style={styles.addBtn}
          onPress={() => Alert.alert('New address', 'Address form would open here in production.')}
        >
          <MaterialCommunityIcons name="plus" size={22} color={colors.onPrimaryContainer} />
          <Text style={styles.addTxt}>Add New Address</Text>
        </Pressable>

        <AddressCard
          st={styles}
          colors={colors}
          icon="home"
          title="Home"
          badge="Default"
          name="Elysium Heights Residence"
          lines="742 Evergreen Terrace, Floor 4, Suite 12\nSan Francisco, CA 94103"
          phone="+1 (555) 012-3456"
          accent
        />
        <AddressCard
          st={styles}
          colors={colors}
          icon="briefcase"
          title="Work"
          name="The Innovation Hub"
          lines="303 Silicon Way, Tower B, Level 18\nPalo Alto, CA 94304"
          phone="+1 (555) 987-6543"
        />
        <AddressCard
          st={styles}
          colors={colors}
          icon="office-building"
          title="Other"
          name="Grandmother's House"
          lines="12 Willow Creek Lane\nSausalito, CA 94965"
          phone="+1 (555) 234-5678"
        />

        <View style={styles.secure}>
          <View style={{ flex: 1 }}>
            <Text style={styles.secureTitle}>Delivery Security</Text>
            <Text style={styles.secureBody}>
              All medical shipments are verified against these addresses. Ensure your primary address is
              up-to-date for automated prescription refills.
            </Text>
          </View>
          <Image source={{ uri: imagesB2.addressesFooter }} style={styles.secureImg} contentFit="cover" />
        </View>
      </ScrollView>
    </View>
  );
}

function AddressCard({
  st,
  colors,
  icon,
  title,
  badge,
  name,
  lines,
  phone,
  accent,
}: {
  st: ReturnType<typeof createAddressesStyles>;
  colors: ThemeColors;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  badge?: string;
  name: string;
  lines: string;
  phone: string;
  accent?: boolean;
}) {
  return (
    <View style={[st.card, accent && st.cardAccent]}>
      {accent ? <View style={st.leftStrip} /> : null}
      <View style={st.cardInner}>
        <View style={st.cardLeft}>
          <View style={[st.iconBox, accent && st.iconBoxOn]}>
            <MaterialCommunityIcons
              name={icon}
              size={24}
              color={accent ? colors.primary : colors.onSurfaceVariant}
            />
          </View>
          <View style={{ flex: 1 }}>
            <View style={st.titleRow}>
              <Text style={st.tag}>{title}</Text>
              {badge ? (
                <View style={st.badge}>
                  <Text style={st.badgeTxt}>{badge}</Text>
                </View>
              ) : null}
            </View>
            <Text style={st.name}>{name}</Text>
            <Text style={st.lines}>{lines}</Text>
            <View style={st.phoneRow}>
              <MaterialCommunityIcons name="phone" size={14} color={colors.onSurfaceVariant} />
              <Text style={st.phone}>{phone}</Text>
            </View>
          </View>
        </View>
        <View style={st.actions}>
          <Pressable
            style={st.iconAct}
            onPress={() => Alert.alert('Edit address', 'Editor would open for this saved address.')}
          >
            <MaterialCommunityIcons name="pencil" size={20} color={colors.onSurfaceVariant} />
          </Pressable>
          <Pressable
            style={st.iconAct}
            onPress={() => Alert.alert('Remove address', 'This address would be removed after confirmation.')}
          >
            <MaterialCommunityIcons name="delete-outline" size={20} color={colors.onSurfaceVariant} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function createAddressesStyles(c: ThemeColors, isDark: boolean) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: screenRootBg(isDark, c.background) },
    pageTitle: { fontSize: 34, fontWeight: '900', color: c.onSurface, marginTop: 8 },
    pageSub: { color: c.onSurfaceVariant, fontWeight: '600', marginTop: 8, marginBottom: 20 },
    search: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.surfaceContainerHigh,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 10,
      gap: 10,
      marginBottom: 16,
    },
    searchInput: { flex: 1, color: c.onSurface, fontSize: 14 },
    addBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      backgroundColor: c.primaryContainer,
      paddingVertical: 16,
      borderRadius: 14,
      marginBottom: 24,
    },
    addTxt: { color: c.onPrimaryContainer, fontWeight: '800', fontSize: 15 },
    card: {
      backgroundColor: c.surfaceContainerLow,
      borderRadius: 16,
      padding: 18,
      marginBottom: 14,
      overflow: 'hidden',
    },
    cardAccent: { paddingLeft: 14 },
    leftStrip: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: 4,
      backgroundColor: c.primary,
    },
    cardInner: { flexDirection: 'row', justifyContent: 'space-between' },
    cardLeft: { flexDirection: 'row', gap: 14, flex: 1 },
    iconBox: {
      width: 48,
      height: 48,
      borderRadius: 14,
      backgroundColor: c.surfaceContainerHigh,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconBoxOn: { backgroundColor: c.secondaryContainer },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
    tag: { fontSize: 11, fontWeight: '800', letterSpacing: 1, color: c.primary, textTransform: 'uppercase' },
    badge: {
      backgroundColor: c.tabPillActive,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 999,
    },
    badgeTxt: { fontSize: 10, fontWeight: '800', color: c.primary },
    name: { fontSize: 18, fontWeight: '800', color: c.onSurface, marginBottom: 6 },
    lines: { fontSize: 14, color: c.onSurfaceVariant, lineHeight: 20, marginBottom: 8 },
    phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    phone: { fontSize: 13, color: c.onSurfaceVariant },
    actions: { flexDirection: 'row', gap: 4 },
    iconAct: { padding: 8, borderRadius: 10 },
    secure: {
      marginTop: 28,
      padding: 24,
      borderRadius: 28,
      backgroundColor: c.tabPillActive,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      flexDirection: 'row',
      gap: 16,
      alignItems: 'center',
    },
    secureTitle: { fontSize: 22, fontWeight: '800', color: c.primary, marginBottom: 8 },
    secureBody: { fontSize: 13, color: c.onSurfaceVariant, lineHeight: 20 },
    secureImg: { width: 100, height: 80, borderRadius: 14, opacity: 0.6 },
  });
}
