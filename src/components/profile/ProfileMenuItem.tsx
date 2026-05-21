import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { MenuItemProps } from '../../types/profile';

export function ProfileMenuItem({ icon, label, iconColor, iconBg, onPress, showBorder = true }: MenuItemProps) {
  return (
    <TouchableOpacity
      className={`flex-row items-center px-5 py-4 ${showBorder ? 'border-b border-slate-100 dark:border-slate-700/50' : ''}`}
      onPress={onPress}
      activeOpacity={0.65}
    >
      <View className={`w-10 h-10 rounded-2xl items-center justify-center mr-4 ${iconBg}`}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <Text className="font-inter-semibold flex-1 text-base text-slate-800 dark:text-slate-100">
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
    </TouchableOpacity>
  );
}
