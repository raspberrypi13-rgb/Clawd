const CACHE = 'clawd-v3';
const ASSETS = ['./', './index.html', './style.css', './app.js',
                './manifest.json', './icons/icon-192.png', './icons/icon-512.png'];

/* ── 설치 & 캐시 ── */
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(hit => {
      if (hit) return hit;
      return fetch(e.request).then(res => {
        if (!res || res.status !== 200 || res.type === 'opaque') return res;
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      });
    }).catch(() => caches.match('./index.html'))
  );
});

/* ════════════════════════════════════════
   알림 스케줄러
   - setTimeout은 SW가 잠들면 동작 안 함
   - 대신 매 1분마다 현재 시각을 체크하는
     "폴링" 방식 사용 (가장 확실)
════════════════════════════════════════ */

// 밥시간: [시작hour, 끝hour] — 이 범위 안에서 5분마다 반복
const MEAL_WINDOWS = [
  { start: 7,  end: 9,  title: '🍳 아침 밥 시간!',  body: 'Clawd가 배고파하고 있어요 🦞', tag: 'meal-morning' },
  { start: 12, end: 14, title: '🍱 점심 밥 시간!',  body: '냠냠 먹으러 와요! 🦀',          tag: 'meal-lunch'   },
  { start: 18, end: 20, title: '🍚 저녁 밥 시간!',  body: 'Clawd가 기다리고 있어요 💕',    tag: 'meal-dinner'  },
];
const SLEEP_NOTIF = { hour: 22, title: '💤 잠잘 시간!', body: 'Clawd랑 같이 자러 가요 🌙', tag: 'sleep' };

// 마지막 알림 전송 기록 (tag → "YYYY-MM-DD HH:MM")
const _sent = {};

function _notify(title, body, tag) {
  self.registration.showNotification(title, {
    body,
    tag,
    icon: './icons/icon-192.png',
    badge: './icons/icon-192.png',
    vibrate: [200, 100, 200, 100, 200],
    requireInteraction: false,
    data: { url: './' }
  });
}

function _checkAndNotify() {
  const now   = new Date();
  const h     = now.getHours();
  const m     = now.getMinutes();
  const dateKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;

  /* 밥시간: 범위 내에서 5분 단위마다 */
  MEAL_WINDOWS.forEach(({ start, end, title, body, tag }) => {
    if (h >= start && h < end && m % 5 === 0) {
      const key = `${tag}-${dateKey}-${h}-${m}`;
      if (!_sent[key]) {
        _sent[key] = true;
        _notify(title, body, tag);
        console.log(`[SW] 밥 알림: ${title}`);
      }
    }
  });

  /* 잠자리: 22:00 정각, 하루 1회 */
  if (h === SLEEP_NOTIF.hour && m === 0) {
    const key = `sleep-${dateKey}`;
    if (!_sent[key]) {
      _sent[key] = true;
      _notify(SLEEP_NOTIF.title, SLEEP_NOTIF.body, SLEEP_NOTIF.tag);
      console.log('[SW] 잠자리 알림');
    }
  }
}

/* 1분마다 체크 — SW가 살아있는 한 계속 동작 */
let _pollInterval = null;

function _startPolling() {
  if (_pollInterval) return;
  // 즉시 1회 체크
  _checkAndNotify();
  // 이후 매 60초마다
  _pollInterval = setInterval(_checkAndNotify, 60 * 1000);
  console.log('[SW] 알림 폴링 시작');
}

/* 앱에서 메시지 오면 폴링 시작 */
self.addEventListener('message', e => {
  if (e.data?.type === 'START_NOTIFICATIONS') {
    _startPolling();
  }
});

/* SW 활성화되면 자동으로도 시작 */
self.addEventListener('activate', () => {
  _startPolling();
});

/* 알림 클릭 → 앱 열기 */
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      const existing = list.find(c => c.url.includes('index.html') || c.url.endsWith('/'));
      if (existing) return existing.focus();
      return clients.openWindow('./');
    })
  );
});

/* ── Periodic Background Sync (지원되는 브라우저에서 추가 보장) ── */
self.addEventListener('periodicsync', e => {
  if (e.tag === 'clawd-notify') {
    e.waitUntil(Promise.resolve(_checkAndNotify()));
  }
});
