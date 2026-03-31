import React, { useMemo } from 'react';
import { Alert, Linking, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';
import { useAppNavigation } from '../navigation/useAppNavigation';
import type { ThemeColors } from '../theme/palettes';
import { useTheme } from '../theme/ThemeContext';

type Props = {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
  subtitle?: string;
};

export function ClinicalHeader({ title, onBack, right, subtitle }: Props) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useLocale();
  const { signOut } = useAuth();
  const navigation = useAppNavigation();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [menuOpen, setMenuOpen] = React.useState(false);

  const closeMenu = () => setMenuOpen(false);
  const go = (action: () => void) => {
    closeMenu();
    action();
  };

  return (
    <View style={[styles.bar, { paddingTop: insets.top + 8 }]}>
      <View style={styles.left}>
        {onBack ? (
          <Pressable onPress={onBack} hitSlop={12} style={styles.iconBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.primary} />
          </Pressable>
        ) : (
          <View style={styles.iconPlaceholder} />
        )}
        <View>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          <Text style={styles.title}>{title}</Text>
        </View>
      </View>
      <View style={styles.right}>
        {right}
        <Pressable hitSlop={10} onPress={() => setMenuOpen(true)} style={styles.menuBtn}>
          <MaterialCommunityIcons name="menu" size={24} color={colors.primary} />
        </Pressable>
      </View>
      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={closeMenu}>
        <Pressable style={styles.drawerBackdrop} onPress={closeMenu} />
        <View style={[styles.drawerSheet, { paddingTop: insets.top + 10 }]}>
          <View style={styles.drawerHead}>
            <Text style={styles.drawerTitle}>Menu</Text>
            <Pressable hitSlop={8} onPress={closeMenu}>
              <MaterialCommunityIcons name="close" size={22} color={colors.onSurface} />
            </Pressable>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.drawerContent}>
            <Text style={styles.drawerSection}>{t.profileSectionClinical}</Text>
            <MenuItem label={t.profilePrescriptions} onPress={() => go(() => navigation.navigate('ProductList', { category: 'Medicines' }))} />
            <MenuItem label={t.profileLabResults} onPress={() => go(() => navigation.navigate('OrderDetail', { orderId: 'LAB-RESULTS' }))} />
            <MenuItem label={t.profileCareReminders} onPress={() => go(() => navigation.navigate('Main', { screen: 'Home' }))} />

            <Text style={styles.drawerSection}>{t.profileSectionOrders}</Text>
            <MenuItem label={t.profileOrders} onPress={() => go(() => navigation.navigate('Main', { screen: 'Chat' }))} />
            <MenuItem label={t.profileCart} onPress={() => go(() => navigation.navigate('Main', { screen: 'Cart' }))} />
            <MenuItem label={t.profileAddresses} onPress={() => go(() => navigation.navigate('Addresses'))} />
            <MenuItem label={t.profilePayment} onPress={() => go(() => navigation.navigate('Checkout'))} />
            <MenuItem label={t.profilePharmacies} onPress={() => go(() => navigation.navigate('PharmacyList'))} />

            <Text style={styles.drawerSection}>{t.profileSectionSupport}</Text>
            <MenuItem label={t.profileNotifications} onPress={() => go(() => Alert.alert(t.profileNotifications, 'Notification preferences would be managed here.'))} />
            <MenuItem label={t.profileHelp} onPress={() => go(() => Linking.openURL('mailto:support@vitalis.health').catch(() => {}))} />
            <MenuItem label={t.profilePrivacy} onPress={() => go(() => Linking.openURL('https://vitalis.health/privacy').catch(() => {}))} />
            <MenuItem label={t.profileTerms} onPress={() => go(() => Linking.openURL('https://vitalis.health/terms').catch(() => {}))} />

            <Text style={styles.drawerSection}>{t.profileSectionPreferences}</Text>
            <MenuItem label={t.profileSettings} onPress={() => go(() => Alert.alert(t.profileSettings, `${t.language}: use controls on profile page.`))} />
            <MenuItem label={t.profileSecurity} onPress={() => go(() => Alert.alert(t.profileSecurity, 'Security settings would be managed here.'))} />
            <MenuItem
              label={t.profileLogout}
              danger
              onPress={() =>
                go(() => {
                  signOut();
                  navigation.navigate('AuthGate');
                })
              }
            />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

function MenuItem({ label, onPress, danger }: { label: string; onPress: () => void; danger?: boolean }) {
  const { colors } = useTheme();
  return (
    <Pressable style={[stylesMenu.row, { backgroundColor: colors.surfaceContainerLow, borderColor: colors.outlineVariant }]} onPress={onPress}>
      <Text style={[stylesMenu.txt, { color: danger ? colors.error : colors.onSurface }]}>{label}</Text>
      <MaterialCommunityIcons name="chevron-right" size={20} color={colors.chevronMuted} />
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
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingBottom: 12,
      backgroundColor: colors.headerBar,
    },
    left: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
    iconBtn: { padding: 4 },
    iconPlaceholder: { width: 32 },
    subtitle: {
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 1,
      color: colors.onSurfaceVariant,
      textTransform: 'uppercase',
    },
    title: { fontSize: 18, fontWeight: '800', color: colors.primary },
    right: { flexDirection: 'row', alignItems: 'center', gap: 8 },
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
    drawerBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.34)' },
    drawerSheet: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      right: 0,
      width: '84%',
      maxWidth: 360,
      backgroundColor: colors.surface,
      borderLeftWidth: StyleSheet.hairlineWidth,
      borderLeftColor: colors.outlineVariant,
      paddingHorizontal: 16,
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
    drawerContent: { paddingVertical: 10, gap: 6, paddingBottom: 42 },
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
