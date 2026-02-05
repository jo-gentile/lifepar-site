importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyDOwn0QlyqdU3fDBEsPFuvPMzs4ylqMuQ8",
    authDomain: "web-lifepar.firebaseapp.com",
    databaseURL: "https://web-lifepar-default-rtdb.firebaseio.com",
    projectId: "web-lifepar",
    storageBucket: "web-lifepar.firebasestorage.app",
    messagingSenderId: "140850288146",
    appId: "1:140850288146:web:fe1d35bac4c30c39b3aacb"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Handler de segundo plano (cuando la app está cerrada)
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Notificación en background:', payload);
  
  const notificationTitle = payload.notification.title || payload.data.title;
  const notificationOptions = {
    body: payload.notification.body || payload.data.body,
    icon: './img/logo.png',
    badge: './img/badge-icon.png',
    tag: 'lifepar-push',
    data: payload.data // Guardamos data extra para el clic
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// CACHE Y PWA (Mantenemos tu lógica existente abajo)
const CACHE_NAME = 'lifepar-cache-v1';
const assets = [
  './',
  './index.html',
  './admin.css',
  './img/192x192.png',
  './img/512x512.png'
  // Agregá acá tus fotos de fondo si querés que carguen offline
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(assets);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
}); 