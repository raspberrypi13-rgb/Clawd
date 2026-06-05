# 🦀 Clawd.exe 만드는 법

## 순서

### 1. 저장소 만들기
https://github.com → 우상단 **+** → **New repository**  
이름: `clawd` / Public → **Create repository**

---

### 2. clawd.py 업로드
저장소 첫 페이지 → **"uploading an existing file"** 클릭  
→ `clawd.py` 드래그앤드롭 → **Commit changes**

---

### 3. build.yml 만들기 ← 핵심!

저장소 첫 페이지 → **"creating a new file"** 클릭

**파일 이름 입력칸**에 아래를 그대로 입력:

    .github/workflows/build.yml

> `/` 입력할 때마다 폴더가 자동 생성됩니다

**내용 입력칸**에 `build.yml.txt` 파일 내용을 복붙 → **Commit changes**

---

### 4. 빌드 대기 (5~8분)
저장소 상단 **Actions 탭** → 초록 체크 뜰 때까지 대기

---

### 5. 다운로드
저장소 우측 **Releases** → `Clawd.exe` 다운로드 → 더블클릭! 🎉

---

> Windows 10/11 기본 내장 Edge WebView2 사용.  
> Python, Node.js 설치 불필요.
