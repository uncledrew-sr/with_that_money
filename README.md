# value-calculator
### 설치 방법
이 프로젝트는 별도의 빌드 도구(Webpack, Vite 등)가 필요 없는 Vanilla JS 기반 프로젝트입니다.

1. 저장소 클론 (Repository Clone)
~~~Bash
git clone https://github.com/your-repo/value-calculator.git
cd value-calculator
~~~

2. 환경 설정 (Configuration)
프로젝트 루트 디렉토리에 config.js 파일을 생성하거나 기존 파일을 수정하여 백엔드 API 주소를 설정합니다.
~~~Javascript
const CONFIG = {
    API_BASE_URL: "https://your-api-server.com" // 실제 백엔드 서버 주소 입력
};
~~~

### 실행 방법
브라우저의 보안 정책(CORS 및 ES 모듈 제한)으로 인해 index.html 파일을 단순히 더블 클릭하여 실행하면 API 통신이나 일부 기능이 작동하지 않을 수 있습니다. 따라서 로컬 웹 서버 환경에서 실행하는 것을 권장합니다.

1. 방법 A : VS Code Live Server 사용
    - Visual Studio Code에서 프로젝트 폴더를 엽니다.
    - index.html 파일을 선택합니다.
    - 편집기 우측 하단의 'Go Live' 버튼을 클릭하거나, 마우스 우클릭 후 **'Open with Live Server'**를 선택합니다.
    - 자동으로 열리는 http://127.0.0.1:5500 주소에서 앱을 확인합니다.

2. 방법 B : Python을 이용한 간이 서버 실행
터미널에서 프로젝트 경로로 이동한 후 아래 명령어를 입력합니다.

~~~Bash
python -m http.server 8000
~~~
브라우저 주소창에 http://localhost:8000을 입력하여 접속합니다.

### 프로젝트 구조
~~~Bash
.
├── index.html        # 메인 UI 구조 및 외부 라이브러리 로드
├── style.css         # 앱 전반의 디자인 및 모달, 애니메이션 스타일
├── script.js         # 메인 로직: Matter.js 제어, UI 이벤트 처리, 데이터 바인딩
├── api.js            # 서비스 계층: 백엔드 API 통신(Fetch) 및 JWT 인증 관리
├── config.js         # 전역 환경 설정: API 베이스 URL 관리
└── images/           # 서비스에 사용되는 아이콘 및 이미지 에셋
~~~

- 주요 파일 상세
    - index.html : 저축 현황바, 금액 입력창, 버블 컨테이너, 그리고 각종 설정 모달(위시리스트, 커스텀 단위)이 정의되어 있습니다.
    - script.js : Matter.js를 초기화하여 버블 물리 연산을 수행하고, 입력된 금액에 따른 유닛 계산(debounce 적용) 및 UI 업데이트를 담당합니다.
    - api.js : ApiService 객체를 통해 로그인, 위시리스트 CRUD, 단위(Unit) 정보 조회 등 서버와의 모든 통신을 캡슐화합니다.
    - style.css : mode-basic, goal-has 등 바디 클래스에 따른 레이아웃 전환과 가상 요소 등을 활용한 디자인 시스템을 포함합니다.

### Front-end Tech Stack
- 언어 : JavaScript (ES6+), HTML5, CSS3
- 물리 엔진 : Matter.js (버블 애니메이션 구현)
- 외부 라이브러리 : Canvas Confetti (목표 달성 효과)