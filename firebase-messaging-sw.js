importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js');

// --- 1. إعدادات Firebase للإشعارات ---
const firebaseConfig = {
    apiKey: "AIzaSyDLOQ3i-cyhZV-A1oN5Jhy_OQj_KdqClzk",
    authDomain: "al-rahman-d0529.firebaseapp.com",
    projectId: "al-rahman-d0529",
    storageBucket: "al-rahman-d0529.firebasestorage.app",
    messagingSenderId: "1081097400036",
    appId: "1:1081097400036:web:a5b9ada478c9bdb7ae06f1"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon-192.png' // تم تعديل المسار ليكون محلياً وأسرع
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// --- 2. إعدادات الكاش وتثبيت التطبيق (PWA) ---
const CACHE_NAME = 'arrahman-v2';

// قللنا الملفات للأساسيات فقط لتجنب فشل التثبيت
const ASSETS =[
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting(); // إجبار المتصفح على تفعيل النسخة الجديدة فوراً
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // نستخدم add بدلاً من addAll لتجنب فشل التثبيت إذا نقص ملف
      return Promise.all(
        ASSETS.map(url => {
          return cache.add(url).catch(err => console.log('Cache failed for:', url));
        })
      );
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

// الحدث الإجباري الذي تطلبه جوجل لإنشاء الـ APK
self.addEventListener('fetch', (event) => {
  // لا نتدخل في طلبات Firebase و APIs الخارجية
  if (event.request.url.includes('firestore') || event.request.url.includes('google')) return;
  
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    }).catch(() => {
      return caches.match('/');
    })
  );
});