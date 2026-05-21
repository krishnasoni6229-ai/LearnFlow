import { Ionicons } from '@expo/vector-icons';
import { LegendList, LegendListRef } from '@legendapp/list';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Platform, RefreshControl, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CourseCard } from '../../../components/CourseCard';
import { DiscoverHeader } from '../../../components/DiscoverHeader';
import { OfflineBanner } from '../../../components/OfflineBanner';
import { useCourses } from '../../../hooks/useCourses';
import { useDiscoverAI } from '../../../hooks/useDiscoverAI';
import { useAppDispatch, useAppSelector } from '../../../hooks/useRedux';
import { loadPersistedCourseData } from '../../../store/slices/courseSlice';
import { CourseItem } from '../../../types/course';
import {
  recordAppOpen,
  requestNotificationPermissions,
  scheduleDailyReminderNotification,
} from '../../../utils/notifications';

// ─── Memoized list item (prevents re-renders on sibling changes) ───────────────
const MemoizedCourseCard = React.memo(
  ({ item }: { item: CourseItem }) => <CourseCard course={item} />,
  (prev, next) => prev.item.id === next.item.id
);
MemoizedCourseCard.displayName = 'MemoizedCourseCard';

// ─── Empty state ──────────────────────────────────────────────────────────────
const EmptyState = React.memo(() => (
  <View className="items-center pt-20 px-8">
    <View className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full items-center justify-center mb-6">
      <Ionicons name="search" size={40} color="#94A3B8" />
    </View>
    <Text className="font-outfit-black text-[20px] text-slate-900 dark:text-white mb-2 text-center">
      No matches found
    </Text>
    <Text className="font-inter-medium text-[15px] text-slate-500 dark:text-slate-400 text-center leading-relaxed">
      Try different keywords or browse all categories.
    </Text>
  </View>
));
EmptyState.displayName = 'EmptyState';

export default function CoursesScreen() {
  const dispatch = useAppDispatch();
  const listRef = useRef<LegendListRef>(null);
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  const { courses, isLoading, isError, error, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useCourses();
  const { bookmarksLoaded, bookmarks, enrolled } = useAppSelector((s) => s.courses);

  const bookmarkIds = useMemo(() => bookmarks.map((b) => b.id), [bookmarks]);

  const { debouncedSearch, isSearchingAI, aiMatchingIds, aiRecommendations } =
    useDiscoverAI(search, courses, bookmarkIds, enrolled);

  // Boot
  useEffect(() => {
    if (!bookmarksLoaded) dispatch(loadPersistedCourseData());
    recordAppOpen();
    requestNotificationPermissions().then((ok) => { if (ok) scheduleDailyReminderNotification(); });
  }, [dispatch, bookmarksLoaded]);

  // Filtered list
  const filtered = useMemo<CourseItem[]>(() => {
    let list = activeCategory !== 'All'
      ? courses.filter((c) => c.category === activeCategory)
      : courses;
    if (debouncedSearch.trim() && aiMatchingIds !== null) {
      list = list.filter((c) => aiMatchingIds.includes(c.id));
    }
    return list;
  }, [courses, activeCategory, debouncedSearch, aiMatchingIds]);

  // Scroll to top on filter change.
  // Double-RAF ensures LegendList has committed its new layout (new data + new header)
  // before we scroll, preventing the "jumped to center" bug when switching to 'All'.
  useEffect(() => {
    let raf1: ReturnType<typeof requestAnimationFrame>;
    let raf2: ReturnType<typeof requestAnimationFrame>;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        listRef.current?.scrollToOffset({ offset: 0, animated: false });
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [search, activeCategory]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const keyExtractor = useCallback((item: CourseItem) => `course-${item.id}`, []);
  const renderItem = useCallback(({ item }: { item: CourseItem }) => <MemoizedCourseCard item={item} />, []);

  const listHeader = useMemo(() => (
    <DiscoverHeader
      courseCount={courses.length}
      search={search}
      onSearchChange={setSearch}
      activeCategory={activeCategory}
      onCategoryChange={setActiveCategory}
      filteredCount={filtered.length}
      debouncedSearch={debouncedSearch}
      isSearchingAI={isSearchingAI}
      aiMatchingIds={aiMatchingIds}
      aiRecommendations={aiRecommendations}
    />
  ), [
    courses.length, search, activeCategory, filtered.length,
    debouncedSearch, isSearchingAI, aiMatchingIds, aiRecommendations,
  ]);

  const listFooter = useMemo(() => (
    isFetchingNextPage
      ? <View className="py-8 items-center"><ActivityIndicator size="small" color="#4F46E5" /></View>
      : <View style={{ height: Platform.OS === 'ios' ? 120 : 100 }} />
  ), [isFetchingNextPage]);

  // ── Loading state ─────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50 dark:bg-slate-950">
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
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="font-inter-semibold mt-4 text-[16px] text-slate-550 dark:text-slate-400">
          Curating courses…
        </Text>
      </View>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────
  if (isError) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50 dark:bg-slate-950 p-8">
        <View className="w-24 h-24 bg-rose-50 dark:bg-rose-500/10 rounded-full items-center justify-center mb-6">
          <Ionicons name="cloud-offline" size={40} color="#F43F5E" />
        </View>
        <Text className="font-outfit-black text-[22px] text-slate-900 dark:text-white mb-2">
          Connection Lost
        </Text>
        <Text className="font-inter-medium text-[15px] text-slate-550 dark:text-slate-400 text-center leading-relaxed mb-8">
          {(error as any)?.message ?? "Check your internet connection and try again."}
        </Text>
        <TouchableOpacity
          style={styles.retryBtn}
          className="bg-indigo-600 px-8 py-4 rounded-2xl flex-row items-center gap-2"
          onPress={() => refetch()}
        >
          <Ionicons name="refresh" size={20} color="#fff" />
          <Text className="font-inter-extrabold text-white text-[16px]">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Main list ─────────────────────────────────────────────────────────────
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
      <OfflineBanner />
      <SafeAreaView edges={['top']} className="flex-1">
        <LegendList
          ref={listRef}
          data={filtered}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          estimatedItemSize={420}
          ListHeaderComponent={listHeader}
          ListFooterComponent={listFooter}
          ListEmptyComponent={<EmptyState />}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#4F46E5"
              colors={['#4F46E5']}
            />
          }
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  retryBtn: {
    shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 16, elevation: 8,
  },
});
