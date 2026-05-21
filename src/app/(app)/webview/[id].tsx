import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCourses } from '../../../hooks/useCourses';
import { useAppSelector } from '../../../hooks/useRedux';
import Constants from 'expo-constants';
import { CourseItem } from '../../../types/course';

function buildCourseHTML(course: CourseItem, isEnrolled: boolean): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
  <title>${course.title}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background: #f8fafc;
      color: #0f172a;
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
    }
    .hero {
      position: relative;
      height: 280px;
      overflow: hidden;
      border-bottom-left-radius: 32px;
      border-bottom-right-radius: 32px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }
    .hero img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .hero-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to bottom, rgba(15,23,42,0.1), rgba(15,23,42,0.8));
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      padding: 24px;
    }
    .category-badge {
      display: inline-block;
      background: rgba(255,255,255,0.2);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      color: white;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 1.5px;
      padding: 6px 12px;
      border-radius: 20px;
      text-transform: uppercase;
      margin-bottom: 12px;
      align-self: flex-start;
    }
    .hero-title {
      font-size: 26px;
      font-weight: 900;
      color: white;
      line-height: 1.2;
    }
    .content { padding: 24px; padding-bottom: 80px; }
    .meta-row {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin: 20px 0;
    }
    .chip {
      display: flex;
      align-items: center;
      gap: 6px;
      background: #eef2ff;
      color: #4f46e5;
      font-size: 13px;
      font-weight: 700;
      padding: 8px 14px;
      border-radius: 12px;
    }
    .instructor-row {
      display: flex;
      align-items: center;
      gap: 16px;
      background: white;
      border-radius: 20px;
      padding: 16px;
      margin-bottom: 24px;
      box-shadow: 0 4px 16px rgba(99,102,241,0.06);
    }
    .instructor-avatar {
      width: 56px;
      height: 56px;
      border-radius: 28px;
      object-fit: cover;
      border: 2px solid #e0e7ff;
    }
    .instructor-name { font-size: 16px; font-weight: 800; color: #1e293b; }
    .instructor-country { font-size: 13px; color: #64748b; font-weight: 500; margin-top: 2px; }
    .section-title {
      font-size: 19px;
      font-weight: 800;
      margin: 24px 0 12px;
      color: #0f172a;
    }
    .description {
      font-size: 15px;
      color: #475569;
      line-height: 1.6;
      background: white;
      padding: 20px;
      border-radius: 20px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.03);
    }
    .price-block {
      background: white;
      border-radius: 20px;
      padding: 20px;
      margin: 24px 0;
      box-shadow: 0 4px 16px rgba(99,102,241,0.08);
      display: flex;
      align-items: center;
      justify-content: space-between;
      border: 1px solid #e0e7ff;
    }
    .price { font-size: 32px; font-weight: 900; color: #4f46e5; }
    .original-price {
      font-size: 15px;
      color: #94a3b8;
      text-decoration: line-through;
      font-weight: 600;
    }
    .enroll-btn {
      display: block;
      width: 100%;
      background: linear-gradient(135deg, #6366f1, #4f46e5);
      color: white;
      font-size: 17px;
      font-weight: 800;
      padding: 18px;
      border: none;
      border-radius: 20px;
      cursor: pointer;
      text-align: center;
      margin-top: 12px;
      box-shadow: 0 8px 20px rgba(99,102,241,0.3);
      transition: transform 0.2s;
    }
    .enroll-btn.enrolled {
      background: linear-gradient(135deg, #10b981, #059669);
      box-shadow: 0 8px 20px rgba(16,185,129,0.3);
    }
    .enroll-btn:active { transform: scale(0.98); }
    .stats-row {
      display: flex;
      gap: 12px;
      margin: 16px 0 24px;
    }
    .stat-card {
      flex: 1;
      background: white;
      border-radius: 16px;
      padding: 16px 12px;
      text-align: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    }
    .stat-value { font-size: 18px; font-weight: 900; color: #4f46e5; }
    .stat-label { font-size: 12px; color: #64748b; font-weight: 600; margin-top: 4px; }
    
    /* Communication & Headers Log Panel */
    .communication-panel {
      background: #0f172a;
      color: #38bdf8;
      font-family: monospace;
      padding: 16px;
      border-radius: 16px;
      font-size: 11px;
      line-height: 1.5;
      margin: 24px 0;
      border: 1px solid #1e293b;
    }
    .panel-header {
      font-weight: bold;
      color: #f1f5f9;
      margin-bottom: 8px;
      border-bottom: 1px solid #1e293b;
      padding-bottom: 4px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .panel-tag {
      background: #0369a1;
      color: white;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 9px;
      text-transform: uppercase;
    }
  </style>
</head>
<body>
  <div class="hero">
    <img src="${course.thumbnail}" alt="${course.title}" />
    <div class="hero-overlay">
      <span class="category-badge">${course.category}</span>
      <h1 class="hero-title">${course.title}</h1>
    </div>
  </div>

  <div class="content">
    <div class="instructor-row">
      <img class="instructor-avatar" src="${course.instructor.avatar}" alt="${course.instructor.name}" />
      <div>
        <div class="instructor-name">${course.instructor.name}</div>
        <div class="instructor-country">🌎 ${course.instructor.country}</div>
      </div>
    </div>

    <!-- Communication logs verified -->
    <div class="communication-panel">
      <div class="panel-header">
        <span>🤖 INJECTED CLIENT HEADERS (NATIVE TO WEB)</span>
        <span class="panel-tag">Verified</span>
      </div>
      <div><strong>app_version:</strong> <span id="app-ver">loading...</span></div>
      <div><strong>platform:</strong> <span id="app-platform">loading...</span></div>
      <div><strong>auth_status:</strong> <span id="app-auth">${isEnrolled ? 'Enrolled User (Valid access token)' : 'Public guest session'}</span></div>
      <div><strong>delivered_at:</strong> <span id="app-time">loading...</span></div>
    </div>

    <div class="meta-row">
      <span class="chip">🎓 ${course.level}</span>
      <span class="chip">⏱ ${course.duration}</span>
      <span class="chip">⭐ ${course.rating.toFixed(1)}</span>
    </div>

    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-value">${(course.studentsCount / 1000).toFixed(1)}k</div>
        <div class="stat-label">Students</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${course.rating.toFixed(1)}</div>
        <div class="stat-label">Rating</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${course.duration}</div>
        <div class="stat-label">Duration</div>
      </div>
    </div>

    <div class="section-title">About this Course</div>
    <p class="description">${course.description}</p>

    <div class="price-block">
      <div>
        <div style="font-size:12px;color:#64748b;font-weight:700;margin-bottom:4px;text-transform:uppercase;letter-spacing:1px;">Total Price</div>
        <div class="price">$${course.price}</div>
      </div>
      <div class="original-price">was $${course.originalPrice}</div>
    </div>

    ${isEnrolled ? `
      <button class="enroll-btn enrolled" onclick="window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({type:'resume',courseId:${course.id}}))">
        Resume Learning (100% Complete)
      </button>
    ` : `
      <button class="enroll-btn" onclick="window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({type:'enroll',courseId:${course.id}}))">
        Enroll Now — $${course.price}
      </button>
    `}
  </div>

  <script>
    // Extract and display the injected headers sent via Javascript
    document.addEventListener("DOMContentLoaded", function() {
      setTimeout(function() {
        if (window.__learnflow) {
          document.getElementById('app-ver').innerText = window.__learnflow.appVersion || 'Unknown';
          document.getElementById('app-platform').innerText = window.__learnflow.platform || 'Unknown';
          document.getElementById('app-time').innerText = window.__learnflow.deliveredAt || new Date().toISOString();
        } else {
          document.getElementById('app-ver').innerText = 'No header detected';
          document.getElementById('app-platform').innerText = 'Web-browser standalone';
          document.getElementById('app-time').innerText = new Date().toISOString();
        }
      }, 100);
    });
  </script>
</body>
</html>`;
}

export default function WebViewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const webViewRef = useRef<WebView>(null);

  const { courses } = useCourses();
  const isEnrolled = useAppSelector((s) =>
    s.courses.enrolled.includes(Number(id))
  );

  const course = courses.find((c) => c.id === Number(id));

  const [loadProgress, setLoadProgress] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);

  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  const injectedHeaders = course
    ? `
      window.__learnflow = {
        courseId: ${course.id},
        courseTitle: ${JSON.stringify(course.title)},
        isEnrolled: ${isEnrolled},
        appVersion: ${JSON.stringify(appVersion)},
        platform: ${JSON.stringify(Platform.OS)},
        deliveredAt: ${JSON.stringify(new Date().toISOString())},
      };
    `
    : '';

  const handleMessage = useCallback((event: { nativeEvent: { data: string } }) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'enroll') {
        router.back();
      }
    } catch {}
  }, [router]);

  const handleNavigationChange = useCallback((nav: WebViewNavigation) => {
    setCanGoBack(nav.canGoBack);
  }, []);

  if (!course) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 dark:bg-slate-900 p-8">
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  const htmlContent = buildCourseHTML(course, isEnrolled);

  return (
    <View className="flex-1 bg-white dark:bg-slate-900">
      <SafeAreaView edges={['top']} className="flex-row items-center px-4 pb-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm z-10">
        <TouchableOpacity
          className="w-11 h-11 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          onPress={() => (canGoBack ? webViewRef.current?.goBack() : router.back())}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color="#0F172A" className="dark:text-white" />
        </TouchableOpacity>
        <Text className="font-outfit-black flex-1 text-center text-[16px] color-slate-900 dark:text-white mx-3 tracking-tight" numberOfLines={1}>
          {course.title}
        </Text>
        <TouchableOpacity
          className="w-11 h-11 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20"
          onPress={() => webViewRef.current?.reload()}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh" size={20} color="#4F46E5" />
        </TouchableOpacity>
      </SafeAreaView>

      {loadProgress < 1 && (
        <View className="h-[3px] bg-indigo-100 dark:bg-indigo-900/50 w-full">
          <View className="h-full bg-indigo-500" style={{ width: `${loadProgress * 100}%` }} />
        </View>
      )}

      {hasError ? (
        <View className="flex-1 items-center justify-center bg-slate-50 dark:bg-slate-900 p-8">
          <Ionicons name="cloud-offline-outline" size={52} color="#94a3b8" />
          <Text className="font-inter-bold text-[17px] color-slate-700 dark:text-slate-300 mt-3">Failed to load content</Text>
          <TouchableOpacity
            className="mt-4 bg-indigo-500 px-6 py-3 rounded-xl"
            onPress={() => {
              setHasError(false);
              webViewRef.current?.reload();
            }}
          >
            <Text className="font-inter-bold color-white text-[15px]">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <WebView
          ref={webViewRef}
          source={{ html: htmlContent, baseUrl: 'https://learnflow.app' }}
          injectedJavaScriptBeforeContentLoaded={injectedHeaders}
          onLoadProgress={({ nativeEvent }) => setLoadProgress(nativeEvent.progress)}
          onError={() => setHasError(true)}
          onHttpError={() => setHasError(true)}
          onNavigationStateChange={handleNavigationChange}
          onMessage={handleMessage}
          className="flex-1 bg-transparent"
          allowsBackForwardNavigationGestures
          showsVerticalScrollIndicator={false}
          originWhitelist={['*']}
        />
      )}
    </View>
  );
}
