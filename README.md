# 🦀 Clawd PWA

## 파일 구조
```
clawd-pwa2/
├── index.html      ← 메인 (HTML만)
├── style.css       ← 스타일
├── app.js          ← 게임 로직 + SW 등록
├── sw.js           ← Service Worker
├── manifest.json   ← PWA 설정
└── icons/
    ├── icon-192.png
    └── icon-512.png
```

## 배포 (HTTPS 필요)

### Netlify — 가장 쉬움
1. https://netlify.com → "Deploy manually"
2. 이 폴더 통째로 드래그 앤 드롭 → 완료!

### GitHub Pages
1. 새 레포 생성 후 파일 업로드
2. Settings → Pages → Branch: main → Save
3. `https://유저명.github.io/레포명` 접속

### 로컬 테스트 (HTTPS 없이)
```bash
npx serve .
# 또는
python3 -m http.server 8080
```
> localhost는 SW가 작동합니다.
