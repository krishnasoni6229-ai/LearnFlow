import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import {
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useCourses } from '../../../hooks/useCourses';
import { useAppDispatch, useAppSelector } from '../../../hooks/useRedux';
import { enrollCourse, toggleBookmark } from '../../../store/slices/courseSlice';
import { getCourseImage } from '../../../utils/image';
import { scheduleBookmarkMilestoneNotification } from '../../../utils/notifications';

const STAR_COLOR = '#FFB800';

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <View className="flex-row items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/5">
      <Ionicons name="star" size={14} color={STAR_COLOR} />
      <Text className="font-outfit-black text-[13px] text-white">{rating.toFixed(1)}</Text>
      <Text className="font-inter-medium text-[11px] text-white/70">({count.toLocaleString()})</Text>
    </View>
  );
}

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const { courses } = useCourses();
  const bookmarks = useAppSelector((s) => s.courses.bookmarks);
  const enrolled = useAppSelector((s) => s.courses.enrolled);

  const course = courses.find((c) => c.id === Number(id));
  const isBookmarked = bookmarks.some((b) => b.id === Number(id));
  const isEnrolled = enrolled.includes(Number(id));

  const handleBookmark = useCallback(async () => {
    if (!course) return;
    dispatch(toggleBookmark(course));
    const newCount = isBookmarked ? bookmarks.length - 1 : bookmarks.length + 1;
    await scheduleBookmarkMilestoneNotification(newCount);
  }, [course, dispatch, isBookmarked, bookmarks.length]);

  const handleEnroll = useCallback(() => {
    if (!course) return;
    if (isEnrolled) {
      Toast.show({
        type: 'info',
        text1: 'Already Enrolled',
        text2: 'You are already enrolled in this course.',
      });
      return;
    }
    Alert.alert(
      'Enroll in Course',
      `Enroll in "${course.title}" for $${course.price}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Enroll Now',
          style: 'default',
          onPress: () => {
            dispatch(enrollCourse(course.id));
            Toast.show({
              type: 'success',
              text1: '🎉 Enrolled!',
              text2: 'You have successfully enrolled in this course.',
            });
          },
        },
      ]
    );
  }, [course, dispatch, isEnrolled]);

  const handleViewContent = useCallback(() => {
    if (!course) return;
    router.push(`/(app)/webview/${course.id}` as any);
  }, [course, router]);

  if (!course) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-slate-905 p-8">
        <Ionicons name="alert-circle-outline" size={64} color="#CBD5E1" />
        <Text className="font-outfit-black text-[20px] text-slate-800 dark:text-white mt-4 mb-2">Course missing</Text>
        <Text className="font-inter-medium text-[15px] text-slate-505 text-center mb-8">{"We couldn't find the course you're looking for."}</Text>
        <TouchableOpacity className="bg-indigo-600 px-8 py-3.5 rounded-2xl shadow-lg shadow-indigo-600/30" onPress={() => router.back()}>
          <Text className="font-inter-bold text-white text-[16px]">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const discountPct = Math.round(
    ((course.originalPrice - course.price) / course.originalPrice) * 100
  );

  // Dynamic values based on screen width
  const isSmallScreen = screenWidth < 375;
  const titleSizeClass = isSmallScreen ? 'text-2xl mb-4' : 'text-[30px] leading-tight mb-5';

  return (
    <View className="flex-1 bg-[#F8FAFC] dark:bg-slate-900">
      {/* Scrollable Main Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
        bounces={false}
      >
        {/* Relative content-driven Hero container */}
        <View className="relative bg-slate-900 overflow-hidden w-full">
          {/* Absolute Background Image */}
          <Image
            source={{ uri: getCourseImage(course) }}
            style={styles.absoluteFill}
            contentFit="cover"
            transition={500}
          />
          {/* Dark Overlay for premium look & readability */}
          <View style={styles.absoluteFill} className="bg-black/35" />
          <View style={styles.absoluteFill}>
            <View className="flex-1 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/50 to-transparent" />
          </View>

          {/* Top Absolute Navigation Bar */}
          <View
            style={{ paddingTop: insets.top + 12 }}
            className="absolute top-0 left-0 right-0 flex-row justify-between px-6 z-10"
          >
            <TouchableOpacity
              className="w-11 h-11 rounded-full bg-black/30 border border-white/10 items-center justify-center"
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <Ionicons name="chevron-back" size={22} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              className="w-11 h-11 rounded-full bg-black/30 border border-white/10 items-center justify-center"
              onPress={handleBookmark}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                size={20}
                color={isBookmarked ? '#818CF8' : '#fff'}
              />
            </TouchableOpacity>
          </View>

          {/* Natural Hero Content Block (Flows Relative to let content size dynamically!) */}
          <View style={{ paddingTop: insets.top + 76, paddingBottom: 48 }} className="px-6">
            <View className="flex-row items-center gap-3 mb-4">
              <View className="bg-indigo-500/90 px-3.5 py-1.5 rounded-full border border-indigo-400/20">
                <Text className="font-outfit-black text-white text-[10px] tracking-[1.5px] uppercase">
                  {course.category}
                </Text>
              </View>
              <StarRating rating={course.rating} count={course.reviewCount} />
            </View>

            <Text className={`font-outfit-black text-white tracking-tight shadow-sm ${titleSizeClass}`}>
              {course.title}
            </Text>

            {/* Instructor row */}
            <View className="flex-row items-center gap-4 bg-white/10 backdrop-blur-md self-start px-4 py-2.5 rounded-2xl border border-white/10">
              <Image
                source={{ uri: course.instructor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(course.instructor.name)}&size=120&background=6366f1&color=fff&bold=true` }}
                style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: '#4F46E5' }}
                contentFit="cover"
              />
              <View>
                <Text className="font-inter-black text-[14px] text-white">{course.instructor.name}</Text>
                <Text className="font-inter-bold text-[11px] text-indigo-300 tracking-wide">Course Instructor</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Content Section (overlaps hero slightly with -mt-8 and dynamic curves) */}
        <View className="bg-[#F8FAFC] dark:bg-slate-900 rounded-t-[40px] -mt-8 pt-8 px-6">
          {/* Quick Stats Chips */}
          <View className="flex-row gap-3 mb-8">
            <View className="flex-1 bg-white dark:bg-slate-800 p-4 rounded-3xl items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700/50">
              <Ionicons name="ribbon" size={22} color="#6366F1" className="mb-2" />
              <Text className="font-inter-bold text-[13px] text-slate-800 dark:text-slate-200">{course.level}</Text>
              <Text className="font-inter-medium text-[10px] text-slate-400 mt-1 uppercase tracking-wider">Level</Text>
            </View>
            <View className="flex-1 bg-white dark:bg-slate-800 p-4 rounded-3xl items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700/50">
              <Ionicons name="time" size={22} color="#6366F1" className="mb-2" />
              <Text className="font-inter-bold text-[13px] text-slate-800 dark:text-slate-200">{course.duration}</Text>
              <Text className="font-inter-medium text-[10px] text-slate-400 mt-1 uppercase tracking-wider">Time</Text>
            </View>
            <View className="flex-1 bg-white dark:bg-slate-800 p-4 rounded-3xl items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700/50">
              <Ionicons name="people" size={22} color="#6366F1" className="mb-2" />
              <Text className="font-inter-bold text-[13px] text-slate-800 dark:text-slate-200">{(course.studentsCount / 1000).toFixed(1)}k</Text>
              <Text className="font-inter-medium text-[10px] text-slate-400 mt-1 uppercase tracking-wider">Students</Text>
            </View>
          </View>

          {/* Description */}
          <Text className="font-outfit-black text-[22px] text-slate-900 dark:text-white mb-3 tracking-tight">Overview</Text>
          <Text className="font-inter-medium text-[15px] text-slate-600 dark:text-slate-400 leading-[24px] mb-8">
            {course.description}
          </Text>

          {/* What you'll learn */}
          <Text className="font-outfit-black text-[22px] text-slate-900 dark:text-white mb-3 tracking-tight">{"What You'll Learn"}</Text>
          <View className="bg-white dark:bg-slate-800 p-6 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-700/50 mb-4">
            {[
              'Master core concepts and fundamentals',
              'Build hands-on practical projects',
              'Learn industry best practices',
              'Develop real-world problem solving',
            ].map((item, i) => (
              <View key={i} className="flex-row items-center gap-4 mb-4 last:mb-0">
                <View className="w-9 h-9 rounded-full bg-indigo-50 dark:bg-indigo-500/20 items-center justify-center">
                  <Ionicons name="checkmark-done" size={18} color="#4F46E5" />
                </View>
                <Text className="font-inter-bold text-[14px] text-slate-700 dark:text-slate-300 flex-1 leading-snug">
                  {item}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Bar (Responsive bottom layout!) */}
      <View 
        style={{ bottom: insets.bottom > 0 ? insets.bottom + 8 : 16 }} 
        className="absolute left-6 right-6 z-20"
      >
        <View 
          style={styles.floatingBarShadow} 
          className="bg-white dark:bg-slate-800 rounded-[28px] p-3 flex-row items-center justify-between border border-slate-100 dark:border-slate-700"
        >
          <View className="px-4">
            <Text className="font-inter-bold text-[10px] text-slate-400 uppercase tracking-widest mb-0.5">Total Price</Text>
            <View className="flex-row items-baseline gap-1.5">
              <Text className="font-outfit-black text-[26px] text-slate-900 dark:text-white tracking-tight">${course.price}</Text>
              {discountPct > 0 && (
                <Text className="font-inter-bold text-[12px] text-slate-400 line-through">${course.originalPrice}</Text>
              )}
            </View>
          </View>

          {isEnrolled ? (
            <TouchableOpacity
              className="flex-1 ml-4 bg-emerald-500 flex-row items-center justify-center py-3.5 rounded-2xl gap-2 h-[52px]"
              onPress={handleViewContent}
              activeOpacity={0.9}
            >
              <Ionicons name="play" size={20} color="#fff" />
              <Text className="font-inter-black text-white text-[15px] tracking-wide">Resume</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              className="flex-1 ml-4 bg-indigo-600 flex-row items-center justify-center py-3.5 rounded-2xl gap-2 h-[52px]"
              onPress={handleEnroll}
              activeOpacity={0.9}
            >
              <Text className="font-inter-black text-white text-[15px] tracking-wide">Enroll Now</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  absoluteFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  floatingBarShadow: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 16,
  }
});
