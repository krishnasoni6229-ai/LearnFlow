import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect, useRef } from 'react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { Text, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';

interface InputProps<T extends FieldValues = any> extends TextInputProps {
  name?: Path<T>;
  control?: Control<T, any>;
  label?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  error?: string;
  onClear?: () => void;
  showClearButton?: boolean;
  debounceDelay?: number;
}

export function Input<T extends FieldValues = any>({
  name,
  control,
  label,
  icon,
  error,
  secureTextEntry,
  onClear,
  showClearButton,
  debounceDelay,
  value = '',
  onChangeText,
  className = '',
  ...textInputProps
}: InputProps<T>) {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(secureTextEntry);
  const [localValue, setLocalValue] = useState(value);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync external value changes with local state
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleTextChange = (text: string) => {
    setLocalValue(text);
    
    if (debounceDelay && onChangeText) {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        onChangeText(text);
      }, debounceDelay);
    } else {
      onChangeText?.(text);
    }
  };

  const handleClear = () => {
    setLocalValue('');
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    onChangeText?.('');
    onClear?.();
  };

  const renderTextInput = (
    val: string,
    onValChange: (text: string) => void,
    onBlurCallback?: () => void
  ) => {
    return (
      <View
        className={`flex-row items-center bg-slate-55 dark:bg-slate-900 border-2 rounded-2xl px-4 py-1.5 transition-colors duration-200
          ${isFocused ? 'border-indigo-500 bg-white dark:bg-slate-800' : error ? 'border-red-500 bg-red-50/10' : 'border-slate-200 dark:border-slate-800'}`}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={isFocused ? '#6366f1' : '#94a3b8'}
            style={{ marginRight: 8 }}
          />
        )}
        <TextInput
          className="flex-1 py-3 text-base text-slate-900 dark:text-white font-inter-semibold"
          placeholderTextColor="#94a3b8"
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            onBlurCallback?.();
            setIsFocused(false);
          }}
          onChangeText={onValChange}
          value={val}
          secureTextEntry={isSecure}
          {...textInputProps}
        />
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setIsSecure(!isSecure)}
            activeOpacity={0.7}
            className="p-1"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isSecure ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={isFocused ? '#6366f1' : '#94a3b8'}
            />
          </TouchableOpacity>
        )}
        {showClearButton && val.length > 0 && (
          <TouchableOpacity
            onPress={handleClear}
            activeOpacity={0.7}
            className="bg-slate-200 dark:bg-slate-700 rounded-full p-1 ml-2"
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="close" size={12} color="#64748B" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View className={`mb-4 w-full ${className}`}>
      {label && (
        <Text className="font-inter-semibold text-sm text-slate-700 dark:text-slate-350 mb-2 ml-1">
          {label}
        </Text>
      )}
      {control && name ? (
        <Controller
          control={control}
          name={name}
          render={({ field: { onChange, onBlur, value: ctrlValue } }) => {
            // Keep react-hook-form value synchronized but support debounced state if needed
            return renderTextInput(ctrlValue || '', onChange, onBlur);
          }}
        />
      ) : (
        renderTextInput(localValue, handleTextChange)
      )}
      {error && (
        <Text className="font-inter-medium text-red-500 text-xs mt-1.5 ml-2">{error}</Text>
      )}
    </View>
  );
}
