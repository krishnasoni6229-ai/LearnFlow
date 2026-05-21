import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useColorScheme } from 'nativewind';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { OfflineBanner } from '../../../components/OfflineBanner';
import { Header } from '../../../components/ui/Header';
import { Input } from '../../../components/ui/Input';
import { useAppDispatch, useAppSelector } from '../../../hooks/useRedux';
import { logout, updateProfile } from '../../../store/slices/authSlice';
import { setTheme, toggleNotifications } from '../../../store/slices/preferencesSlice';

export default function ProfileScreen() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const { bookmarks, enrolled } = useAppSelector((s) => s.courses);
  const { colorScheme, setColorScheme } = useColorScheme();
  const preferences = useAppSelector((s) => s.preferences);
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // States for editing profile
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');

  const handleOpenEditModal = () => {
    if (user) {
      setEditUsername(user.username);
      setEditEmail(user.email);
      setIsEditModalOpen(true);
    }
  };

  const handleSaveProfile = () => {
    if (!editUsername.trim() || !editEmail.trim()) {
      Toast.show({ type: 'error', text1: 'Validation Error', text2: 'Fields cannot be empty.' });
      return;
    }
    dispatch(updateProfile({ username: editUsername, email: editEmail }));
    setIsEditModalOpen(false);
    Toast.show({ type: 'success', text1: 'Profile Updated', text2: 'Your details have been saved.' });
  };

  const handleToggleTheme = () => {
    const next = colorScheme === 'dark' ? 'light' : 'dark';
    setColorScheme(next);
    dispatch(setTheme(next));
    Toast.show({ type: 'success', text1: 'Appearance', text2: `Switched to ${next === 'dark' ? 'Dark Mode 🌙' : 'Light Mode ☀️'}` });
  };

  const handleToggleNotifications = () => {
    dispatch(toggleNotifications());
    const next = !preferences.notificationsEnabled;
    Toast.show({ type: 'info', text1: 'Notifications', text2: next ? 'Milestone alerts enabled' : 'Notifications muted' });
  };

  const handleLogout = () =>
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => dispatch(logout()) },
    ]);

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]?.uri) {
        dispatch(updateProfile({ avatar: { url: result.assets[0].uri } }));
        Toast.show({ type: 'success', text1: 'Avatar Updated', text2: 'Profile picture saved.' });
      }
    } catch {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  if (!user) return null;

  const avatarUri =
    user.avatar?.url && !user.avatar.url.includes('localhost')
      ? user.avatar.url
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&size=200&background=6366f1&color=fff&bold=true`;

  // Tab bar is position:'absolute' with height = 60 + bottomPadding.
  // ScrollView must pad by the full tab bar height so logout is never hidden behind it.
  const tabBarBottomPad = insets.bottom > 0 ? insets.bottom : (Platform.OS === 'ios' ? 40 : 12);
  const bottomPad = 60 + tabBarBottomPad + 24;

  const stats = [
    { icon: 'library-outline' as const, value: enrolled.length, label: 'Enrolled', color: '#6366f1', bg: 'bg-indigo-500/15' },
    { icon: 'bookmark-outline' as const, value: bookmarks.length, label: 'Saved', color: '#10b981', bg: 'bg-emerald-500/15' },
    { icon: 'ribbon-outline' as const, value: Math.floor(enrolled.length / 2), label: 'Completed', color: '#f59e0b', bg: 'bg-amber-500/15' },
  ];

  type IoniconName = keyof typeof Ionicons.glyphMap;
  const themeIcon: IoniconName = colorScheme === 'dark' ? 'moon-outline' : 'sunny-outline';

  const menuItems = [
    {
      icon: 'person-circle-outline' as const,
      label: 'Edit Profile',
      sub: 'Update your info & photo',
      color: '#6366f1',
      bg: 'bg-indigo-500/10',
      onPress: handleOpenEditModal,
    },
    {
      icon: 'notifications-outline' as const,
      label: 'Notifications',
      sub: preferences.notificationsEnabled ? 'Milestone alerts on' : 'All muted',
      color: '#8b5cf6',
      bg: 'bg-violet-500/10',
      onPress: handleToggleNotifications,
    },
    {
      icon: themeIcon,
      label: 'Appearance',
      sub: colorScheme === 'dark' ? 'Dark mode active' : 'Light mode active',
      color: '#10b981',
      bg: 'bg-emerald-500/10',
      onPress: handleToggleTheme,
    },
    {
      icon: 'shield-checkmark-outline' as const,
      label: 'Privacy & Security',
      sub: 'Manage your data',
      color: '#3b82f6',
      bg: 'bg-blue-500/10',
      onPress: () => Toast.show({ type: 'info', text1: 'Privacy', text2: 'Privacy settings coming soon.' }),
    },
    {
      icon: 'help-buoy-outline' as const,
      label: 'Help & Support',
      sub: 'helpdesk@learnflow.edu',
      color: '#f59e0b',
      bg: 'bg-amber-500/10',
      onPress: () => Toast.show({ type: 'info', text1: 'Support', text2: 'helpdesk@learnflow.edu' }),
    },
  ];

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <OfflineBanner />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomPad }}
      >
        {/* ── Hero Section (Now Relative, content-driven and responsive!) ────── */}
        <View style={[styles.hero, { paddingTop: insets.top + 16, paddingBottom: 48 }]}>
          {/* Decorative blobs - set pointerEvents="none" so they never intercept taps! */}
          <View
            pointerEvents="none"
            style={[styles.blob, { width: screenWidth * 0.7, height: screenWidth * 0.7, top: -screenWidth * 0.2, right: -screenWidth * 0.2 }]}
          />
          <View
            pointerEvents="none"
            style={[styles.blob2, { width: screenWidth * 0.5, height: screenWidth * 0.5, bottom: -screenWidth * 0.12, left: -screenWidth * 0.1 }]}
          />

          {/* Reusable Universal Header */}
          <Header
            title="My Profile"
            titleColor="text-white"
            showThemeToggle={false}
            containerClassName="flex-row justify-between items-end px-6 pb-3 w-full"
            rightElement={
              <TouchableOpacity
                className="w-10 h-10 rounded-full bg-white/20 items-center justify-center border border-white/10"
                activeOpacity={0.8}
              >
                <Ionicons name="settings-outline" size={18} color="white" />
              </TouchableOpacity>
            }
          />

          {/* Avatar block */}
          <View className="items-center">
            <View style={{ position: 'relative' }}>
              <View style={styles.avatarRing}>
                <Image source={{ uri: avatarUri }} style={{ width: '100%', height: '100%' }} contentFit="cover" transition={300} />
              </View>
              <TouchableOpacity style={styles.cameraBadge} onPress={handlePickImage} activeOpacity={0.9}>
                <Ionicons name="camera" size={13} color="white" />
              </TouchableOpacity>
            </View>
            <Text className="font-outfit-extrabold text-[22px] text-white mt-3 tracking-tight">
              {user.username}
            </Text>
            <Text className="font-inter-medium text-sm text-white/60 mt-0.5">{user.email}</Text>
            <View className="mt-2.5 px-4 py-1.5 bg-white/15 rounded-full border border-white/20">
              <Text className="font-inter-bold text-[10px] text-white uppercase tracking-widest">
                {user.role ?? 'STUDENT'}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Stat Cards (overlap hero) ─────────────────────────── */}
        <View className="flex-row mx-5 gap-3" style={{ marginTop: -28 }}>
          {stats.map((s) => (
            <View key={s.label} style={styles.statCard} className="flex-1 bg-white dark:bg-slate-900 items-center py-4 rounded-[24px]">
              <View className={`w-10 h-10 rounded-2xl ${s.bg} items-center justify-center mb-2`}>
                <Ionicons name={s.icon} size={18} color={s.color} />
              </View>
              <Text className="font-outfit-black text-xl text-slate-900 dark:text-white">{s.value}</Text>
              <Text className="font-inter-semibold text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">{s.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Menu ─────────────────────────────────────────────── */}
        <Text className="font-inter-bold text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-8 mb-3 ml-7">
          Account
        </Text>

        <View style={styles.menuCard} className="mx-5 bg-white dark:bg-slate-900 rounded-[28px] overflow-hidden border border-slate-100/50 dark:border-slate-800">
          {menuItems.map((item, idx) => (
            <TouchableOpacity
              key={item.label}
              className={`flex-row items-center px-5 py-4 ${idx < menuItems.length - 1 ? 'border-b border-slate-100 dark:border-slate-800/70' : ''}`}
              onPress={item.onPress}
              activeOpacity={0.65}
            >
              <View className={`w-10 h-10 rounded-2xl ${item.bg} items-center justify-center mr-3.5`}>
                <Ionicons name={item.icon} size={19} color={item.color} />
              </View>
              <View className="flex-1">
                <Text className="font-inter-semibold text-[15px] text-slate-800 dark:text-slate-100">{item.label}</Text>
                <Text className="font-inter-medium text-[12px] text-slate-400 dark:text-slate-500 mt-0.5">{item.sub}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />
            </TouchableOpacity>
          ))}
        </View>

        {/* ── App Version ───────────────────────────────────────── */}
        <Text className="font-inter-medium text-[11px] text-slate-300 dark:text-slate-700 text-center mt-6 mb-1">
          LearnFlow v1.0.0
        </Text>

        {/* ── Logout ───────────────────────────────────────────── */}
        <TouchableOpacity
          style={styles.logoutBtn}
          className="mx-5 mt-3 flex-row items-center justify-center bg-red-50 dark:bg-red-500/10 py-4 rounded-[20px] border border-red-100/20 dark:border-red-500/15"
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text className="font-inter-bold text-base text-red-500 ml-2">Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={isEditModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditModalOpen(false)}
      >
        <View className="flex-1 justify-end bg-black/60">
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            className="w-full"
          >
            <View className="bg-white dark:bg-slate-900 rounded-t-[40px] px-6 pt-8 pb-10 border-t border-slate-100 dark:border-slate-800 shadow-2xl">
              {/* Header inside modal */}
              <View className="flex-row justify-between items-center mb-6">
                <Text className="font-outfit-extrabold text-[24px] text-slate-900 dark:text-white">
                  Edit Profile
                </Text>
                <TouchableOpacity
                  onPress={() => setIsEditModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center"
                >
                  <Ionicons name="close" size={18} color={colorScheme === 'dark' ? '#94a3b8' : '#475569'} />
                </TouchableOpacity>
              </View>

              {/* Input Form with scroll to prevent keyboard blocking */}
              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: Platform.OS === 'ios' ? 40 : 20 }}
              >
                <View className="space-y-5">
                  <Input
                    label="Username"
                    icon="person-outline"
                    value={editUsername}
                    onChangeText={setEditUsername}
                    placeholder="Enter username"
                    autoCapitalize="none"
                  />

                  <Input
                    label="Email"
                    icon="mail-outline"
                    value={editEmail}
                    onChangeText={setEditEmail}
                    placeholder="Enter email address"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />

                  {/* Actions */}
                  <View className="flex-row gap-3 pt-4">
                    <TouchableOpacity
                      onPress={() => setIsEditModalOpen(false)}
                      className="flex-1 bg-slate-100 dark:bg-slate-800 py-4 rounded-2xl items-center"
                    >
                      <Text className="font-inter-bold text-[15px] text-slate-700 dark:text-slate-300">
                        Cancel
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleSaveProfile}
                      className="flex-1 bg-indigo-600 py-4 rounded-2xl items-center shadow-lg shadow-indigo-600/30"
                    >
                      <Text className="font-inter-bold text-[15px] text-white">
                        Save Changes
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: '#4338CA',
    position: 'relative',
    overflow: 'hidden',
  },
  blob: {
    position: 'absolute',
    borderRadius: 9999,
    backgroundColor: 'rgba(139,92,246,0.3)',
  },
  blob2: {
    position: 'absolute',
    borderRadius: 9999,
    backgroundColor: 'rgba(99,102,241,0.22)',
  },
  avatarRing: {
    width: 104,
    height: 104,
    borderRadius: 52,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  statCard: {
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  menuCard: {
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  logoutBtn: {
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
});
