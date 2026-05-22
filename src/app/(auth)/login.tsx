import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import React from 'react';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useLogin } from '../../hooks/useAuth';
import { useResponsive } from '../../hooks/useResponsive';
import { LoginForm, loginSchema } from '../../schemas/auth.schema';

const LOGO = require('../../../assets/images/logo.png');

export default function LoginScreen() {
  const loginMutation = useLogin();
  const {
    screenWidth,
    screenHeight,
    isSmallScreen,
    containerPadding,
    logoSize,
    logoBorderRadius,
  } = useResponsive();

  const { control, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    }
  });

  const onSubmit = (data: LoginForm) => {
    loginMutation.mutate(data);
  };

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
                    width: logoSize,
                    height: logoSize,
                    borderRadius: logoBorderRadius,
                  }}
                  contentFit="cover"
                  transition={200}
                />
                <Text className="text-4xl font-outfit-black text-slate-900 dark:text-white tracking-tighter mt-4">
                  Learn<Text className="text-indigo-600 dark:text-indigo-400">Flow</Text>
                </Text>
                <Text className="font-inter-semibold text-slate-400 dark:text-slate-400 text-sm mt-1.5 text-center">
                  Unlock your future, one lesson at a time
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
                  Sign In
                </Text>

                <View className="space-y-4">
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
                    placeholder="Enter your password"
                    secureTextEntry
                    error={errors.password?.message}
                  />

                  <TouchableOpacity className="self-end mt-1 mb-6">
                    <Text className="font-inter-bold text-xs text-indigo-600 dark:text-indigo-400 tracking-wide">
                      Forgot Password?
                    </Text>
                  </TouchableOpacity>

                  <Button
                    label="Sign In"
                    onPress={handleSubmit(onSubmit)}
                    isLoading={loginMutation.isPending}
                    className="shadow-lg shadow-indigo-600/30 dark:shadow-none"
                  />
                </View>

                {/* Switch to Register */}
                <View className="flex-row justify-center mt-8">
                  <Text className="font-inter-semibold text-sm text-slate-500 dark:text-slate-400">
                    New to LearnFlow?
                  </Text>
                  <Link href="/(auth)/register" asChild>
                    <TouchableOpacity>
                      <Text className="font-inter-bold text-sm text-indigo-600 dark:text-indigo-400 ml-1.5">
                        Create Account
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
