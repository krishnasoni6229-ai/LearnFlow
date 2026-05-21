import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import React from 'react';
import { Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { useAppDispatch } from '../../hooks/useRedux';
import { setTheme } from '../../store/slices/preferencesSlice';

interface HeaderProps {
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
  showThemeToggle?: boolean;
  titleColor?: string;
  subtitleColor?: string;
  containerClassName?: string;
}

export function Header({
  title,
  subtitle,
  rightElement,
  showThemeToggle = true,
  titleColor = 'text-slate-900 dark:text-white',
  subtitleColor = 'text-slate-500 dark:text-slate-400',
  containerClassName = 'flex-row justify-between items-end px-5 pt-4 pb-3 w-full',
}: HeaderProps) {
  const { width } = useWindowDimensions();
  const dispatch = useAppDispatch();
  const { colorScheme, setColorScheme } = useColorScheme();

  const handleToggleTheme = () => {
    const nextTheme = colorScheme === 'dark' ? 'light' : 'dark';
    setColorScheme(nextTheme);
    dispatch(setTheme(nextTheme));
    Toast.show({
      type: 'success',
      text1: 'Theme Changed',
      text2: `Aesthetic switched to ${nextTheme === 'dark' ? 'Dark Mode 🌙' : 'Light Mode ☀️'}`,
    });
  };

  // Responsive styling based on screen width
  const isSmallScreen = width < 375;
  const titleSize = isSmallScreen ? 'text-[28px]' : 'text-[32px]';

  return (
    <View className={containerClassName}>
      <View className="flex-grow mr-3">
        <Text 
          className={`font-outfit-extrabold ${titleSize} ${titleColor} tracking-tight leading-[1.1]`}
        >
          {title}
        </Text>
        {subtitle && (
          <Text className={`font-inter-medium text-[13px] ${subtitleColor} mt-1.5 leading-relaxed`}>
            {subtitle}
          </Text>
        )}
      </View>
      
      <View className="flex-row items-center gap-2.5 mb-0.5">
        {showThemeToggle && (
          <TouchableOpacity
            onPress={handleToggleTheme}
            className="w-10 h-10 rounded-full bg-white/90 dark:bg-slate-900/80 items-center justify-center border border-slate-100/50 dark:border-slate-800/80 shadow-sm"
            activeOpacity={0.7}
          >
            <Ionicons
              name={colorScheme === 'dark' ? 'sunny-sharp' : 'moon-sharp'}
              size={18}
              color={colorScheme === 'dark' ? '#fbbf24' : '#6366f1'}
            />
          </TouchableOpacity>
        )}

        {rightElement}
      </View>
    </View>
  );
}
