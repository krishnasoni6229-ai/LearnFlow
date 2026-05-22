import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { memo, useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useResponsive } from '../hooks/useResponsive';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { toggleBookmark } from '../store/slices/courseSlice';
import { CourseItem } from '../types/course';
import { getCourseImage } from '../utils/image';
import { scheduleBookmarkMilestoneNotification } from '../utils/notifications';

interface CourseCardProps {
  course: CourseItem;
}

const STAR_COLOR = '#FFB800';
const BOOKMARK_COLOR_ACTIVE = '#4F46E5';
const BOOKMARK_COLOR_INACTIVE = '#94A3B8';

function CourseCardComponent({ course }: CourseCardProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isTablet } = useResponsive();
  const bookmarks = useAppSelector((s) => s.courses.bookmarks);
  const isBookmarked = bookmarks.some((b) => b.id === course.id);

  const handleBookmark = useCallback(async () => {
    dispatch(toggleBookmark(course));
    const newCount = isBookmarked ? bookmarks.length - 1 : bookmarks.length + 1;
    await scheduleBookmarkMilestoneNotification(newCount);
  }, [dispatch, course, isBookmarked, bookmarks.length]);

  const handlePress = useCallback(() => {
    router.push(`/(app)/course/${course.id}` as any);
  }, [router, course.id]);

  const discountPct = Math.round(
    ((course.originalPrice - course.price) / course.originalPrice) * 100
  );

  const imageHeight = isTablet ? 240 : 195;
  const cardMarginBottom = isTablet ? 28 : 20;

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.92}
      style={[
        styles.cardContainer,
        { marginBottom: cardMarginBottom }
      ]}
      className="mx-5 bg-white dark:bg-slate-900 border border-slate-100/50 dark:border-slate-800/80 rounded-[32px] overflow-hidden"
    >
      {/* Thumbnail Wrapper */}
      <View style={{ height: imageHeight }} className="relative w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <Image
          source={{ uri: getCourseImage(course) }}
          style={styles.image}
          contentFit="cover"
          transition={300}
        />
        {/* Soft shadow overlay */}
        <View className="absolute inset-0 bg-black/5 dark:bg-black/20" />

        {/* Level Tag and Discount Badge */}
        <View className="absolute top-4 left-4 flex-row gap-2">
          <View className="bg-white/95 dark:bg-slate-950/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm">
            <Text className="font-outfit-black text-indigo-600 dark:text-indigo-400 text-[10px] uppercase tracking-wider">
              {course.level}
            </Text>
          </View>
          {discountPct > 0 && (
            <View className="bg-rose-500/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm">
              <Text className="font-outfit-black text-white text-[10px] uppercase tracking-wider">
                -{discountPct}%
              </Text>
            </View>
          )}
        </View>

        {/* Interactive Bookmark Button */}
        <TouchableOpacity
          onPress={handleBookmark}
          className="absolute top-4 right-4 bg-white/95 dark:bg-slate-900/95 w-10 h-10 rounded-full items-center justify-center shadow-lg border border-slate-100/30 dark:border-slate-800/30"
          activeOpacity={0.8}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons
            name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
            size={18}
            color={isBookmarked ? BOOKMARK_COLOR_ACTIVE : BOOKMARK_COLOR_INACTIVE}
          />
        </TouchableOpacity>
      </View>

      {/* Course Details Block */}
      <View className="p-5">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="font-outfit-black text-[10px] text-indigo-600 dark:text-indigo-400 tracking-widest uppercase">
            {course.category}
          </Text>
          <View className="flex-row items-center gap-1.5 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-100/30 dark:border-transparent">
            <Ionicons name="star" size={12} color={STAR_COLOR} />
            <Text className="font-inter-extrabold text-[12px] text-amber-600 dark:text-amber-400">
              {course.rating.toFixed(1)}
            </Text>
          </View>
        </View>

        <Text className="font-outfit-extrabold text-[18px] text-slate-800 dark:text-white mb-2 leading-snug" numberOfLines={2}>
          {course.title}
        </Text>

        <Text className="font-inter-medium text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed mb-4" numberOfLines={2}>
          {course.description}
        </Text>

        {/* Instructor Row */}
        <View className="flex-row items-center mb-4">
          <View className="w-8 h-8 rounded-full border-2 border-indigo-50 dark:border-slate-800 overflow-hidden mr-3">
            <Image
              source={{ uri: course.instructor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(course.instructor.name)}&size=100&background=6366f1&color=fff&bold=true` }}
              style={styles.image}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
          </View>
          <View className="flex-1">
            <Text className="font-inter-bold text-[13px] text-slate-700 dark:text-slate-200" numberOfLines={1}>
              {course.instructor.name}
            </Text>
            <Text className="font-inter-semibold text-[10px] text-slate-400 dark:text-slate-550" numberOfLines={1}>
              {course.instructor.country}
            </Text>
          </View>
        </View>

        {/* Border separator */}
        <View className="h-px bg-slate-100 dark:bg-slate-800/80 mb-4" />

        {/* Price & Stats Row */}
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center gap-3">
            <View className="flex-row items-center gap-1.5">
              <Ionicons name="time-outline" size={14} color="#94A3B8" />
              <Text className="font-inter-semibold text-[12px] text-slate-500 dark:text-slate-400">{course.duration}</Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <Ionicons name="people-outline" size={14} color="#94A3B8" />
              <Text className="font-inter-semibold text-[12px] text-slate-500 dark:text-slate-400">{(course.studentsCount / 1000).toFixed(1)}k</Text>
            </View>
          </View>

          <View className="flex-row items-baseline gap-1.5">
            {discountPct > 0 && (
              <Text className="font-inter-bold text-[11px] text-slate-400 dark:text-slate-550 line-through">${course.originalPrice}</Text>
            )}
            <Text className="font-outfit-black text-[20px] text-indigo-600 dark:text-indigo-400">${course.price}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export const CourseCard = memo(CourseCardComponent);

const styles = StyleSheet.create({
  cardContainer: {
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.05,
    shadowRadius: 24,
    elevation: 8,
  },
  image: {
    width: '100%',
    height: '100%',
  }
});
