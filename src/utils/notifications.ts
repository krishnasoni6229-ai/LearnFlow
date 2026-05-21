import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { storage } from '../utils/storage';

const LAST_OPEN_KEY = 'lf_last_open';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleBookmarkMilestoneNotification(bookmarkCount: number): Promise<void> {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return;

  if (bookmarkCount === 5) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🎯 5 Courses Saved!',
        body: "You've bookmarked 5 courses. Time to start learning — your journey awaits!",
        data: { type: 'bookmark_milestone', count: bookmarkCount },
      },
      trigger: null,
    });
  }
}

export async function scheduleDailyReminderNotification(): Promise<void> {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return;

  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '📚 Keep Learning!',
      body: "You haven't opened LearnFlow today. Your courses are waiting for you!",
      data: { type: 'daily_reminder' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      // ⚠️ TESTING ONLY — iOS requires >= 60s for repeats:true
      // Revert to: seconds: 24 * 60 * 60, repeats: true
      seconds: 24 * 60 * 60,
      repeats: true,
    },
  });
}

export async function recordAppOpen(): Promise<void> {
  const now = Date.now().toString();
  await storage.setData(LAST_OPEN_KEY, now);
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
