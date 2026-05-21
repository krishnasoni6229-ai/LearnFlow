import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import { StatCardProps } from '../../types/profile';

interface ProfileStatsProps {
  enrolledCount: number;
  bookmarksCount: number;
}

export function ProfileStats({ enrolledCount, bookmarksCount }: ProfileStatsProps) {
  return (
    <View className="flex-row px-4 py-4">
      <StatCard
        icon="library-outline"
        value={enrolledCount}
        label="Enrolled"
        iconColor="#6366f1"
        iconBg="bg-indigo-50 dark:bg-indigo-500/10"
      />
      <View className="w-px bg-slate-100 dark:bg-slate-700/50 my-2" />
      <StatCard
        icon="bookmark-outline"
        value={bookmarksCount}
        label="Saved"
        iconColor="#10b981"
        iconBg="bg-emerald-50 dark:bg-emerald-500/10"
      />
      <View className="w-px bg-slate-100 dark:bg-slate-700/50 my-2" />
      <StatCard
        icon="ribbon-outline"
        value={Math.floor(enrolledCount / 2)}
        label="Completed"
        iconColor="#f59e0b"
        iconBg="bg-amber-50 dark:bg-amber-500/10"
      />
    </View>
  );
}

function StatCard({ icon, value, label, iconColor, iconBg }: StatCardProps) {
  return (
    <View className="flex-1 items-center py-2">
      <View className={`w-11 h-11 rounded-2xl items-center justify-center mb-2 ${iconBg}`}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <Text className="font-outfit-extrabold text-xl text-slate-900 dark:text-white">{value}</Text>
      <Text className="font-inter-semibold text-xs text-slate-400 uppercase tracking-widest mt-0.5">
        {label}
      </Text>
    </View>
  );
}
