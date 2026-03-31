importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js');

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
    icon: 'https://res.cloudinary.com/db9h7zm1h/image/upload/w_500,q_auto,f_auto/v1774918203/hi5hebyjkpi3gkdgrdef.jpg'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});