# Repo 구조
~~~Bash
.
├── index.html        # 메인 UI 구조 및 외부 라이브러리 로드
├── style.css         # 앱 전반의 디자인 및 모달, 애니메이션 스타일
├── script.js         # 메인 로직: Matter.js 제어, UI 이벤트 처리, 데이터 바인딩
├── api.js            # 서비스 계층: 백엔드 API 통신(Fetch) 및 JWT 인증 관리
├── config.js         # 전역 환경 설정: API 베이스 URL 관리
└── images/           # 서비스에 사용되는 아이콘 및 이미지 에셋
~~~

### 주요 파일 상세
1. index.html
    - 저축 현황바, 금액 입력창, 버블 컨테이너, 그리고 각종 설정 모달(위시리스트, 커스텀 단위)이 정의되어 있습니다.
2. script.js
    - Matter.js를 초기화하여 버블 물리 연산을 수행하고, 입력된 금액에 따른 유닛 계산(debounce 적용) 및 UI 업데이트를 담당합니다.
3. api.js
    - ApiService 객체를 통해 로그인, 위시리스트 CRUD, 단위(Unit) 정보 조회 등 서버와의 모든 통신을 캡슐화합니다.
4. style.css
    - mode-basic, goal-has 등 바디 클래스에 따른 레이아웃 전환과 가상 요소 등을 활용한 디자인 시스템을 포함합니다.

### 버블 섹션
