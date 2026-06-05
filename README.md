# 🦀 Clawd.exe — 진짜 단독 실행파일

Python, Node.js, 아무것도 설치 안 해도 됩니다.  
GitHub에 파일 올리면 자동으로 `.exe` 만들어줍니다.

---

## 📦 Clawd.exe 받는 법 (딱 4단계)

### 1. GitHub 저장소 만들기
https://github.com → 우상단 **+** → **New repository**  
이름: `clawd` / **Public** 선택 / **Create repository**

### 2. 파일 업로드
저장소 페이지에서 **"uploading an existing file"** 클릭  
→ 이 zip 압축 풀고 **안의 파일 전부** 드래그앤드롭  
→ **Commit changes**

> ⚠️ `.github/workflows/build.yml` 파일 포함 필수!

### 3. 빌드 기다리기 (약 5~8분)
저장소 상단 **Actions 탭** → 초록 체크 뜰 때까지 대기

### 4. 다운로드
저장소 우측 **Releases** → **Clawd.exe** 클릭 → 더블클릭! 🎉

---

## 📁 파일 구조
```
clawd/
├── .github/workflows/build.yml   ← 자동 빌드 설정
├── clawd.py                      ← HTML 내장된 Python 앱
└── README.md
```

## ✅ 요구사항
- Windows 10 / 11 (64-bit)
- GitHub 계정 (무료)
