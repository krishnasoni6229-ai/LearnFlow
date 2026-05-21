import { Ionicons } from '@expo/vector-icons';
import { LegendList } from '@legendapp/list';
import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { Platform, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CourseCard } from '../../../components/CourseCard';
import { Header } from '../../../components/ui/Header';
import { useAppDispatch, useAppSelector } from '../../../hooks/useRedux';
import { CourseItem } from '../../../types/course';

export default function BookmarksScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const bookmarks = useAppSelector((s) => s.courses.bookmarks);
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();

  const renderItem = useCallback(
    ({ item }: { item: CourseItem }) => <CourseCard course={item} />,
    []
  );

  const keyExtractor = useCallback(
    (item: CourseItem) => `bookmark-${item.id}`,
    []
  );

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      {/* Premium Gradient Background Elements */}
      <View
        style={{
          width: screenWidth * 0.9,
          height: screenWidth * 0.9,
          borderRadius: (screenWidth * 0.9) / 2,
          top: -screenHeight * 0.1,
          right: -screenWidth * 0.2,
        }}
        className="absolute bg-indigo-500/10 dark:bg-indigo-600/15 blur-[80px]"
      />
      <View
        style={{
          width: screenWidth * 0.7,
          height: screenWidth * 0.7,
          borderRadius: (screenWidth * 0.7) / 2,
          bottom: screenHeight * 0.05,
          left: -screenWidth * 0.1,
        }}
        className="absolute bg-violet-400/10 dark:bg-violet-500/10 blur-[80px]"
      />
      <SafeAreaView edges={['top']} className="flex-1">
        {/* Universal Reusable Header Component */}
        <Header
          title="Saved"
          subtitle={`${bookmarks.length} skill${bookmarks.length !== 1 ? 's' : ''} bookmarked`}
          showThemeToggle={true}
          rightElement={
            <View className="bg-indigo-50 dark:bg-indigo-500/10 rounded-full px-4 py-2 flex-row items-center gap-1.5 border border-indigo-100/30">
              <Ionicons name="bookmark" size={15} color="#4F46E5" />
              <Text className="font-outfit-black text-[13px] text-indigo-600 dark:text-indigo-400">
                {bookmarks.length}
              </Text>
            </View>
          }
        />

        {/* Saved Courses List or Clean Empty Card */}
        {bookmarks.length === 0 ? (
          <View className="flex-grow justify-center px-6">
            <View 
              style={{
                shadowColor: '#4F46E5',
                shadowOffset: { width: 0, height: 16 },
                shadowOpacity: 0.03,
                shadowRadius: 28,
                elevation: 4,
              }}
              className="bg-white dark:bg-slate-900/60 border border-slate-100/50 dark:border-slate-800/80 rounded-[36px] p-8 items-center justify-center mb-24"
            >
              <View className="w-20 h-20 rounded-[22px] bg-slate-50 dark:bg-slate-800/50 border border-slate-100/50 dark:border-slate-800 items-center justify-center mb-6">
                <Ionicons name="bookmark" size={32} color="#94A3B8" />
              </View>
              <Text className="font-outfit-black text-[22px] text-slate-800 dark:text-white mb-2">
                Your shelf is empty
              </Text>
              <Text className="font-inter-semibold text-[14px] text-slate-400 dark:text-slate-450 text-center leading-relaxed mb-8 px-2">
                Explore our catalog to find premium courses, master skills, and save them for instant reference.
              </Text>
              <TouchableOpacity
                className="bg-indigo-600 dark:bg-indigo-500 flex-row items-center gap-2 px-8 py-4 rounded-2xl shadow-lg shadow-indigo-600/30 dark:shadow-none"
                onPress={() => router.push('/(app)' as any)}
                activeOpacity={0.9}
              >
                <Ionicons name="compass" size={18} color="#fff" />
                <Text className="font-inter-extrabold text-white text-[15px]">Find Courses</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <LegendList
            data={bookmarks}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            estimatedItemSize={420}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={<View style={{ height: Platform.OS === 'ios' ? 120 : 100 }} />}
          />
        )}
      </SafeAreaView>
    </View>
  );
}
