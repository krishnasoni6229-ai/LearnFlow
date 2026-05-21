import { Ionicons } from '@expo/vector-icons';
import React, { memo } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CourseItem } from '../types/course';
import { CourseCard } from './CourseCard';
import { Header } from './ui/Header';
import { Input } from './ui/Input';

const CATEGORIES = ['All', 'smartphones', 'laptops', 'fragrances', 'skincare', 'groceries'];

interface Props {
  courseCount: number;
  search: string;
  onSearchChange: (v: string) => void;
  activeCategory: string;
  onCategoryChange: (c: string) => void;
  filteredCount: number;
  debouncedSearch: string;
  isSearchingAI: boolean;
  aiMatchingIds: number[] | null;
  aiRecommendations: CourseItem[];
}

function DiscoverHeaderComponent({
  courseCount, search, onSearchChange, activeCategory, onCategoryChange,
  filteredCount, debouncedSearch, isSearchingAI, aiMatchingIds, aiRecommendations,
}: Props) {
  const showRecs = !debouncedSearch.trim() && activeCategory === 'All' && aiRecommendations.length > 0;

  return (
    <View className="pt-2 pb-2">
      {/* Premium Universal Header */}
      <Header
        title="Discover"
        subtitle="Find your next digital superpower"
        showThemeToggle={true}
        rightElement={
          <View className="bg-indigo-50 dark:bg-indigo-500/10 rounded-full px-4 py-2 flex-row items-center gap-1.5 border border-indigo-100/30">
            <Ionicons name="layers" size={15} color="#4F46E5" />
            <Text className="font-outfit-black text-[13px] text-indigo-600 dark:text-indigo-400">
              {courseCount}
            </Text>
          </View>
        }
      />

      {/* Reusable Input used as a Search Bar (with built-in 350ms debounce) */}
      <View className="px-5 py-2">
        <Input
          value={search}
          onChangeText={onSearchChange}
          placeholder="Search for anything..."
          icon="search"
          showClearButton={true}
          debounceDelay={350}
        />
      </View>

      {/* Dynamic Category Chips */}
      <View className="pb-5 mt-1">
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
        >
          {CATEGORIES.map((cat) => {
            const active = activeCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => onCategoryChange(cat)}
                style={active ? styles.activeChip : styles.inactiveChip}
                className={`px-5 py-3 rounded-full border ${active
                    ? 'bg-indigo-600 border-indigo-600 dark:bg-indigo-500 dark:border-indigo-500'
                    : 'bg-white border-slate-100 dark:bg-slate-900 dark:border-slate-800'
                  }`}
                activeOpacity={0.8}
              >
                <Text className={`text-[13px] font-inter-bold tracking-wide ${active ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                  {cat === 'All' ? 'All Skills' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* AI Smart Recommendations Panel */}
      {showRecs && (
        <View className="mb-6 mt-1">
          <View className="flex-row items-center px-6 mb-3 gap-2">
            <View className="w-6 h-6 rounded-lg bg-violet-100 dark:bg-violet-500/20 items-center justify-center">
              <Ionicons name="sparkles" size={13} color="#8b5cf6" />
            </View>
            <Text className="font-outfit-black text-[18px] text-slate-900 dark:text-white">
              AI Smart Picks
            </Text>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 15 }}
          >
            {aiRecommendations.map((course) => (
              <View key={`rec-${course.id}`} style={{ width: 290 }}>
                <CourseCard course={course} />
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Dynamic Results Status Banner */}
      <View className="flex-row items-center px-6 mb-3 gap-2">
        {isSearchingAI ? (
          <ActivityIndicator size="small" color="#6366f1" className="mr-1" />
        ) : debouncedSearch.trim() && aiMatchingIds !== null ? (
          <View className="w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-500/20 items-center justify-center">
            <Ionicons name="sparkles" size={10} color="#6366f1" />
          </View>
        ) : (
          <View className="w-2 h-2 rounded-full bg-indigo-500" />
        )}
        <Text className="font-inter-extrabold text-[11px] text-slate-400 dark:text-slate-500 tracking-widest uppercase">
          {isSearchingAI ? 'AI CURATING MATCHES...' : `${filteredCount} SKILLS AVAILABLE`}
        </Text>
      </View>
    </View>
  );
}

export const DiscoverHeader = memo(DiscoverHeaderComponent);

const styles = StyleSheet.create({
  activeChip: {
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  inactiveChip: {
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
});
