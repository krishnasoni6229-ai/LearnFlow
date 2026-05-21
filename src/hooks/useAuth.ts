import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth';
import { useAppDispatch } from './useRedux';
import { setAuth } from '../store/slices/authSlice';
import Toast from 'react-native-toast-message';
import { useRouter } from 'expo-router';

export function useLogin() {
  const dispatch = useAppDispatch();
  
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (response) => {
      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'Login Successful',
          text2: 'Welcome back!',
        });
        dispatch(setAuth({
          user: response.data.user,
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
        }));
      }
    },
    onError: (error: any) => {
      let message = error.response?.data?.message || 'Login failed. Please check your credentials.';
      if (error.response?.data?.errors?.length) {
        message = error.response.data.errors[0]?.message || message;
      }
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: message,
      });
    }
  });
}

export function useRegister() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: (data: Parameters<typeof authApi.register>[0]) => authApi.register({ ...data, role: "USER" }),
    onSuccess: async (response, variables) => {
      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'Account Created',
          text2: 'Logging you in automatically...',
        });
        
        try {
          // Perform automatic background login using the registered credentials
          const loginRes = await authApi.login({
            email: variables.email,
            password: variables.password,
          });

          if (loginRes.success) {
            dispatch(setAuth({
              user: loginRes.data.user,
              accessToken: loginRes.data.accessToken,
              refreshToken: loginRes.data.refreshToken,
            }));
            // Navigation to (app) is automatically handled by the AuthGuard in _layout.tsx
          } else {
            router.replace('/(auth)/login');
          }
        } catch (loginError) {
          console.warn('Auto-login failed after registration, falling back to manual login:', loginError);
          router.replace('/(auth)/login');
        }
      }
    },
    onError: (error: any) => {
      let message = error.response?.data?.message || 'Registration failed.';
      if (error.response?.data?.errors?.length) {
        const firstError = error.response.data.errors[0];
        message = firstError?.msg || firstError?.message || JSON.stringify(firstError);
      }
      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: message,
      });
    }
  });
}
