// ✅ تم الترقية إلى الإصدار 10.8.1 ليتطابق مع ملف HTML ويمنع تعارض الـ Tokens
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js');

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

// ✅ استخدام onBackgroundMessage بدلاً من الدالة القديمة التي توقف دعمها
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification?.title || payload.data?.title || 'مسجد الرحمن';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || 'لديك إشعار جديد',
    icon: 'https://res.cloudinary.com/db9h7zm1h/image/upload/w_500,q_auto,f_auto/v1774918203/hi5hebyjkpi3gkdgrdef.jpg',
    badge: 'https://res.cloudinary.com/db9h7zm1h/image/upload/w_500,q_auto,f_auto/v1774918203/hi5hebyjkpi3gkdgrdef.jpg',
    vibrate: [200, 100, 200, 100, 200],
    data: {
      url: payload.data?.click_action || '/' // لحفظ الرابط الذي سيفتح عند النقر
    }
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// ✅ إضافة حدث النقر على الإشعار لفتح الموقع إذا كان مغلقاً
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(windowClients) {
      for (let i = 0; i < windowClients.length; i++) {
        let client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// ✅ تغيير اسم الكاش لإجبار المتصفح على تحميل التحديث الجديد
const CACHE_NAME = 'arrahman-v3';

const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/prayers.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cairo:wght@400;600;800&display=swap'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const asset of ASSETS) {
        try {
          await cache.add(asset);
        } catch (err) {
          console.warn('Cache failed for:', asset, err);
        }
      }
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => key !== CACHE_NAME ? caches.delete(key) : null)
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  // استثناء الطلبات الخارجية لمنع تعطل الإشعارات
  if (
    event.request.method !== 'GET' ||
    url.includes('firestore') ||
    url.includes('google') ||
    url.includes('cloudinary') ||
    url.includes('/api/')
  ) {
    return;
  }
  event.respondWith(
    caches.match(event.request).then(res => res || fetch(event.request))
  );
});