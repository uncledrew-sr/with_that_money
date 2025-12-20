# 개발팀 소개
<table align="center">
  <tr>
    <td align="center" width="230px">
      <a href="https://github.com/Hwangyerin">
        <img src="https://github.com/Hwangyerin.png" width="100px;" alt="황예린 프로필"/><br />
        <sub><b>황예린</b></sub>
      </a>
      <br />
      <img src="https://img.shields.io/badge/Planning-FF69B4?style=flat-square&logo=Notion&logoColor=white" />
      <img src="https://img.shields.io/badge/UI%2FUX-F24E1E?style=flat-square&logo=Figma&logoColor=white" />
      <br />
      <p align="left" style="font-size: 12px; margin-top: 10px;">
        🎨 <b>기획 및 디자인</b><br/>
        - 서비스 기획 및 와이어프레임<br/>
        - UI/UX 레이아웃 및 컬러 시스템<br/>
        - 사용자 시나리오 설계
      </p>
      <a href="YOUR_FIGMA_URL_HERE">
        <img src="https://img.shields.io/badge/Figma_Design-F24E1E?style=for-the-badge&logo=figma&logoColor=white" height="25px" />
      </a>
    </td>
    <td align="center" width="230px">
      <a href="https://github.com/uncledrew-sr">
        <img src="https://github.com/uncledrew-sr.png" width="100px;" alt="최범규 프로필"/><br />
        <sub><b>최범규</b></sub>
      </a>
      <br />
      <img src="https://img.shields.io/badge/Frontend-5F7AFF?style=flat-square&logo=JavaScript&logoColor=white" />
      <img src="https://img.shields.io/badge/Matter.js-2C3E50?style=flat-square&logo=physics&logoColor=white" />
      <br />
      <p align="left" style="font-size: 12px; margin-top: 10px;">
        💻 <b>프론트엔드 개발</b><br/>
        - Matter.js 물리 엔진 최적화<br/>
        - Canvas 애니메이션 구현
      </p>
      <a href="https://github.com/uncledrew-sr/with_that_money">
        <img src="https://img.shields.io/badge/FE_Repo-181717?style=for-the-badge&logo=github&logoColor=white" height="25px" />
      </a>
    </td>
    <td align="center" width="230px">
      <a href="https://github.com/str-leshs">
        <img src="https://github.com/str-leshs.png" width="100px;" alt="이은서 프로필"/><br />
        <sub><b>이은서</b></sub>
      </a>
      <br />
      <img src="https://img.shields.io/badge/Backend-3178C6?style=flat-square&logo=Java&logoColor=white" />
      <img src="https://img.shields.io/badge/Database-4479A1?style=flat-square&logo=MySQL&logoColor=white" />
      <br />
      <p align="left" style="font-size: 12px; margin-top: 10px;">
        💾 <b>백엔드 개발</b><br/>
        - API 아키텍처 설계 및 구축<br/>
        - 카카오 OAuth 2.0 인증 구현<br/>
        - 위시리스트 CRUD 데이터 모델링
      </p>
      <a href="https://github.com/str-leshs/value-calculator">
        <img src="https://img.shields.io/badge/BE_Repo-181717?style=for-the-badge&logo=github&logoColor=white" height="25px" />
      </a>
    </td>
  </tr>
</table>

# 프로젝트 개요

# 설치 방법
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

# 실행 방법
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

# Repo 구조
~~~Bash
.
├── index.html        # 메인 UI 구조 및 외부 라이브러리 로드
├── style.css         # 앱 전반의 디자인 및 모달, 애니메이션 스타일
├── script.js         # 메인 로직 : Matter.js 제어, UI 이벤트 처리, 데이터 바인딩
├── api.js            # 서비스 계층 : 백엔드 API 통신(Fetch) 및 JWT 인증 관리
├── config.js         # 전역 환경 설정 : API 베이스 URL 관리
└── images/           # 서비스에 사용되는 아이콘 및 이미지 에셋
~~~

# Tech Stack
- 프론트엔드
    - 언어 : JavaScript (ES6+), HTML5, CSS3
    - 물리 엔진 : Matter.js (버블 애니메이션 구현)
    - 외부 라이브러리 : Canvas Confetti (목표 달성 효과)