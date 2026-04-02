import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  LayoutAnimation,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  UIManager,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ClinicalHeader } from '../components/ClinicalHeader';
import { useLocale } from '../context/LocaleContext';
import type { ThemeColors } from '../theme/palettes';
import { screenRootBg } from '../theme/screenBackground';
import { useTheme } from '../theme/ThemeContext';

type ChatMsg = { id: string; from: 'specialist' | 'user'; text?: string; imageUri?: string };

export function SpecialistChatTabScreen() {
  const TAB_BAR_CLEARANCE = 66;
  const INPUT_HEIGHT_MIN = 40;
  const INPUT_HEIGHT_MAX = 140;
  const insets = useSafeAreaInsets();
  const { locale } = useLocale();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const [input, setInput] = useState('');
  const [inputHeight, setInputHeight] = useState(INPUT_HEIGHT_MIN);
  const scrollRef = useRef<ScrollView>(null);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [msgs, setMsgs] = useState<ChatMsg[]>([
    {
      id: 'welcome',
      from: 'specialist',
      text:
        locale === 'ar'
          ? 'مرحبا، أنا الصيدلي المختص. كيف يمكنني مساعدتك اليوم؟'
          : 'Hi, I am your specialist pharmacist. How can I help you today?',
    },
  ]);

  const addMessage = (msg: ChatMsg) => setMsgs((prev) => [...prev, msg]);

  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }

    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setKeyboardOpen(true);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setKeyboardOpen(false);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    // When text is cleared, collapse the textarea back to the minimum height.
    if (!input.trim()) setInputHeight(INPUT_HEIGHT_MIN);
  }, [input]);

  const sendText = () => {
    if (!input.trim()) return;
    addMessage({ id: `${Date.now()}`, from: 'user', text: input.trim() });
    setInput('');
  };

  const uploadImage = async () => {
    Alert.alert(locale === 'ar' ? 'رفع صورة' : 'Upload image', locale === 'ar' ? 'اختر مصدر الصورة' : 'Choose image source', [
      {
        text: locale === 'ar' ? 'التقاط صورة' : 'Take Photo',
        onPress: async () => {
          const perm = await ImagePicker.requestCameraPermissionsAsync();
          if (!perm.granted) return;
          const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.9 });
          if (result.canceled || !result.assets.length) return;
          addMessage({ id: `${Date.now()}-img`, from: 'user', imageUri: result.assets[0].uri });
        },
      },
      {
        text: locale === 'ar' ? 'اختيار من المعرض' : 'Choose from Gallery',
        onPress: async () => {
          const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!perm.granted) return;
          const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.9 });
          if (result.canceled || !result.assets.length) return;
          addMessage({ id: `${Date.now()}-img`, from: 'user', imageUri: result.assets[0].uri });
        },
      },
      { text: locale === 'ar' ? 'إلغاء' : 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
    >
      <ClinicalHeader
        title={locale === 'ar' ? 'الصيدلي المختص' : 'Specialist Pharmacist'}
        showGlobalControls={false}
        right={
          <Pressable
            hitSlop={8}
            onPress={() => Linking.openURL('tel:+966110000000').catch(() => {})}
            style={styles.callBtn}
          >
            <MaterialCommunityIcons name="phone-outline" size={20} color={colors.primary} />
          </Pressable>
        }
      />
      <ScrollView
        ref={scrollRef}
        style={styles.chatScroll}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 16 + insets.bottom + TAB_BAR_CLEARANCE + (inputHeight - INPUT_HEIGHT_MIN),
        }}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {msgs.map((m) => (
          <View key={m.id} style={[styles.msgWrap, m.from === 'user' ? styles.msgRight : styles.msgLeft]}>
            {m.text ? <Text style={[styles.msgTxt, m.from === 'user' && styles.msgTxtUser]}>{m.text}</Text> : null}
            {m.imageUri ? <Image source={{ uri: m.imageUri }} style={styles.msgImg} contentFit="cover" /> : null}
          </View>
        ))}
      </ScrollView>
      <View
        style={[
          styles.composer,
          { paddingBottom: keyboardOpen ? 6 : insets.bottom + 10 + TAB_BAR_CLEARANCE },
        ]}
      >
        <Pressable style={styles.iconBtn} onPress={uploadImage}>
          <MaterialCommunityIcons name="image-plus" size={22} color={colors.primary} />
        </Pressable>
        <TextInput
          style={[styles.input, { height: inputHeight }]}
          value={input}
          onChangeText={setInput}
          placeholder={locale === 'ar' ? 'اكتب رسالة...' : 'Type a message...'}
          placeholderTextColor={colors.outline}
          onFocus={() => scrollRef.current?.scrollToEnd({ animated: true })}
          multiline
          textAlignVertical="top"
          onContentSizeChange={(e) => {
            const next = Math.max(INPUT_HEIGHT_MIN, Math.min(INPUT_HEIGHT_MAX, e.nativeEvent.contentSize.height));
            setInputHeight(next);
          }}
        />
        <Pressable style={styles.sendBtn} onPress={sendText}>
          <MaterialCommunityIcons name="send" size={18} color={colors.onPrimaryContainer} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function createStyles(c: ThemeColors, isDark: boolean) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: screenRootBg(isDark, c.background) },
    chatScroll: { flex: 1 },
    msgWrap: {
      maxWidth: '82%',
      borderRadius: 14,
      padding: 10,
      marginTop: 10,
    },
    msgLeft: { alignSelf: 'flex-start', backgroundColor: c.surfaceContainerLow },
    msgRight: { alignSelf: 'flex-end', backgroundColor: c.primaryContainer },
    msgTxt: { color: c.onSurface, fontSize: 14, lineHeight: 20 },
    msgTxtUser: { color: c.onPrimaryContainer },
    msgImg: { width: 190, height: 190, borderRadius: 10, marginTop: 6, backgroundColor: c.surfaceContainerHigh },
    composer: {
      borderTopWidth: 1,
      borderColor: c.outlineVariant,
      backgroundColor: c.background,
      paddingHorizontal: 12,
      paddingTop: 10,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
    },
    iconBtn: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.surfaceContainerLow,
    },
    input: {
      flex: 1,
      minHeight: 40,
      borderRadius: 12,
      backgroundColor: c.surfaceContainerLow,
      paddingHorizontal: 12,
      paddingTop: 10,
      color: c.onSurface,
    },
    sendBtn: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.primaryContainer,
    },
    callBtn: {
      width: 34,
      height: 34,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.surfaceContainerLow,
      borderWidth: 1,
      borderColor: c.outlineVariant,
    },
  });
}
