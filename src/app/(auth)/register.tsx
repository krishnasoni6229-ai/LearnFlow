import { zodResolver } from '@hookform/resolvers/zod';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import React from 'react';
import { useForm } from 'react-hook-form';
import { Dimensions, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useRegister } from '../../hooks/useAuth';
import { RegisterForm, registerSchema } from '../../schemas/auth.schema';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const LOGO = require('../../../assets/images/logo.png');

export default function RegisterScreen() {
  const registerMutation = useRegister();
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();

  const { control, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
    }
  });

  const onSubmit = (data: RegisterForm) => {
    registerMutation.mutate(data);
  };

  const isSmallScreen = screenHeight < 720;
  const logoIconSize = isSmallScreen ? 24 : 32;
  const containerPadding = screenWidth > 480 ? 'px-16' : 'px-6';

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

      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
          className="flex-grow"
        >
          <ScrollView 
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingBottom: Platform.OS === 'ios' ? 140 : 100 }} 
            keyboardShouldPersistTaps="handled" 
            showsVerticalScrollIndicator={false}
          >
            <View className={`flex-1 ${containerPadding} py-8 justify-center`}>
              {/* Brand Header */}
              <View className="items-center mb-10">
                <Image
                  source={LOGO}
                  style={{
                    width: isSmallScreen ? 72 : 90,
                    height: isSmallScreen ? 72 : 90,
                    borderRadius: isSmallScreen ? 20 : 24,
                  }}
                  contentFit="cover"
                  transition={200}
                />
                <Text className="text-4xl font-outfit-black text-slate-900 dark:text-white tracking-tighter mt-4">
                  Learn<Text className="text-indigo-600 dark:text-indigo-400">Flow</Text>
                </Text>
                <Text className="font-inter-semibold text-slate-400 dark:text-slate-400 text-sm mt-1.5 text-center">
                  Start your learning adventure today
                </Text>
              </View>

              {/* Glassmorphic Form Card */}
              <View 
                style={{
                  shadowColor: '#6366f1',
                  shadowOffset: { width: 0, height: 12 },
                  shadowOpacity: 0.04,
                  shadowRadius: 24,
                  elevation: 6,
                }}
                className="bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 rounded-[36px] p-6 shadow-xl"
              >
                <Text className="font-outfit-bold text-[22px] text-slate-800 dark:text-white mb-6">
                  Create Account
                </Text>

                <View className="space-y-4">
                  <Input
                    name="username"
                    control={control as any}
                    label="Username"
                    icon="person-outline"
                    placeholder="Choose a username"
                    autoCapitalize="none"
                    error={errors.username?.message}
                  />

                  <Input
                    name="email"
                    control={control as any}
                    label="Email"
                    icon="mail-outline"
                    placeholder="Enter your email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    error={errors.email?.message}
                  />

                  <Input
                    name="password"
                    control={control as any}
                    label="Password"
                    icon="lock-closed-outline"
                    placeholder="Create a password"
                    secureTextEntry
                    error={errors.password?.message}
                  />

                  <Button
                    label="Sign Up"
                    onPress={handleSubmit(onSubmit)}
                    isLoading={registerMutation.isPending}
                    className="mt-6 shadow-lg shadow-indigo-600/30 dark:shadow-none"
                  />
                </View>

                {/* Switch to Login */}
                <View className="flex-row justify-center mt-8">
                  <Text className="font-inter-semibold text-sm text-slate-500 dark:text-slate-400">
                    Already have an account?
                  </Text>
                  <Link href="/(auth)/login" asChild>
                    <TouchableOpacity>
                      <Text className="font-inter-bold text-sm text-indigo-600 dark:text-indigo-400 ml-1.5">
                        Sign In
                      </Text>
                    </TouchableOpacity>
                  </Link>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
