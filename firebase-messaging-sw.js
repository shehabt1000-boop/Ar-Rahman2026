importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

// تهيئة فايربيس
firebase.initializeApp({
  apiKey: "AIzaSyDLOQ3i-cyhZV-A1oN5Jhy_OQj_KdqClzk",
  authDomain: "al-rahman-d0529.firebaseapp.com",
  projectId: "al-rahman-d0529",
  storageBucket: "al-rahman-d0529.firebasestorage.app",
  messagingSenderId: "1081097400036",
  appId: "1:1081097400036:web:a5b9ada478c9bdb7ae06f1",
  measurementId: "G-8TYFZP4XTJ"
});

const messaging = firebase.messaging();

// استقبال الإشعارات في الخلفية
messaging.setBackgroundMessageHandler(function(payload) {
  const notificationTitle = payload.notification?.title || 'مسجد الرحمن';
  const notificationOptions = {
    body: payload.notification?.body || 'لديك إشعار جديد',
    icon: 'https://res.cloudinary.com/db9h7zm1h/image/upload/w_100/v1774918203/hi5hebyjkpi3gkdgrdef.jpg',
    badge: 'https://res.cloudinary.com/db9h7zm1h/image/upload/w_100/v1774918203/hi5hebyjkpi3gkdgrdef.jpg',
    vibrate:[200, 100, 200]
  };
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// إعدادات التخزين المؤقت (PWA)
const CACHE_NAME = 'arrahman-v2';
const ASSETS =[
  '/',
  '/index.html',
  '/manifest.json',
  '/prayers.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cairo:wght@400;600;800&display=swap'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => key !== CACHE_NAME ? caches.delete(key) : null))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // استثناء طلبات قاعدة البيانات ورفع الصور من الكاش لمنع اللاج
  if (event.request.url.includes('firestore') || 
      event.request.url.includes('google') || 
      event.request.url.includes('cloudinary')) {
      return;
  }
  event.respondWith(caches.match(event.request).then(res => res || fetch(event.request)));
});