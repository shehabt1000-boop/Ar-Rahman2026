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

// ✅ استقبال الإشعارات في الخلفية (والمتصفح مغلق)
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] تم استلام إشعار في الخلفية', payload);
  
  const notificationTitle = payload.notification?.title || payload.data?.title || 'مسجد الرحمن';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || 'لديك إشعار جديد',
    icon: 'https://res.cloudinary.com/db9h7zm1h/image/upload/w_500,q_auto,f_auto/v1774918203/hi5hebyjkpi3gkdgrdef.jpg',
    badge: 'https://res.cloudinary.com/db9h7zm1h/image/upload/w_500,q_auto,f_auto/v1774918203/hi5hebyjkpi3gkdgrdef.jpg',
    vibrate: [200, 100, 200, 100, 200],
    data: {
      url: payload.data?.click_action || '/'
    }
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// ✅ فتح الموقع عند النقر على الإشعار
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