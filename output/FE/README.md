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

# 주요 파일 상세
1. index.html
    - 저축 현황바, 금액 입력창, 버블 컨테이너, 그리고 각종 설정 모달(위시리스트, 커스텀 단위)이 정의되어 있습니다.
2. script.js
    - Matter.js를 초기화하여 버블 물리 연산을 수행하고, 입력된 금액에 따른 유닛 계산(debounce 적용) 및 UI 업데이트를 담당합니다.
3. api.js
    - ApiService 객체를 통해 로그인, 위시리스트 CRUD, 단위(Unit) 정보 조회 등 서버와의 모든 통신을 캡슐화합니다.
4. style.css
    - mode-basic, goal-has 등 바디 클래스에 따른 레이아웃 전환과 가상 요소 등을 활용한 디자인 시스템을 포함합니다.

# 버블 시각화 구현 (Bubble Physics Implementation)
- 사용자가 입력한 금액의 가치를 시각적으로 체감할 수 있도록 물리 엔진(Matter.js)을 활용해 역동적인 애니메이션을 구현한 핵심 부분입니다.

### [1] 물리 엔진 초기화 및 환경 설정
- initBubbleEngine 함수를 통해 물리 세계(World)를 생성하고, 중력 및 실행 루프를 설정합니다.

~~~JavaScript
function initBubbleEngine() {
    const { Engine, Runner, Events, Body } = Matter;
    bubbleEngine = Engine.create();
    bubbleWorld = bubbleEngine.world;
    bubbleWorld.gravity.y = 0.5; // 중력 설정

    bubbleRunner = Runner.create();
    Runner.run(bubbleRunner, bubbleEngine);
    
    // 엔진 업데이트 후 DOM 요소의 위치를 동기화하는 이벤트 리스너
    Events.on(bubbleEngine, "afterUpdate", () => {
        matterBubbles.forEach((body, idx) => {
            const div = domBubbles[idx];
            if (!div) return;
            const r = body.circleRadius;
            const { x, y } = body.position;
            const angleDeg = (body.angle * 180) / Math.PI;
            // 물리 바디의 좌표를 CSS transform으로 치환
            div.style.transform = `translate(${x - r}px, ${y - r}px) rotate(${angleDeg}deg)`;
        });
    });
}
~~~

### [2] 버블 크기 및 개수 산출 알고리즘
- 입력 금액에 따라 생성될 버블의 개수를 정하고, 컨테이너 면적에 맞춰 버블이 겹치지 않도록 적절한 반지름($r$)을 계산합니다.
- 버블 개수($N$) : $N = \lfloor \text{입력 금액} / \text{단위 가격} \rfloor$ (최대 80개 제한).
- 반지름 계산 공식: 컨테이너 면적의 일정 비율($0.7$)을 점유하도록 계산합니다.
    - $$r = \sqrt{\frac{A_{container} \times 0.7}{N \times \pi}}$$

~~~JavaScript
function getBubbleRadius(count) {
    const containerArea = width * height;
    const totalBubbleArea = containerArea * BUBBLE_FILL_RATIO;
    const perBubbleArea = totalBubbleArea / count;
    let radius = Math.sqrt(perBubbleArea / Math.PI);
    // 최소/최대 반지름 임계값 적용 (12px ~ 60px)
    return Math.max(BUBBLE_MIN_RADIUS, Math.min(radius, BUBBLE_MAX_RADIUS));
}
~~~

### [3] 물리 바디와 DOM 요소의 생성 및 바인딩
- updateBubbles 함수는 기존의 버블을 모두 제거한 후, 새로운 설정값에 맞춰 Matter.Bodies.circle과 HTML div 요소를 동시에 생성합니다.

~~~JavaScript
for (let i = 0; i < N; i++) {
    const x = Math.random() * width;
    const y = -Math.random() * 400; // 화면 상단 밖에서 생성
    
    // 1. Matter.js 물리 바디 생성
    const body = Bodies.circle(x, y, radius, {
        restitution: 0.7, // 탄성
        friction: 0.05    // 마찰
    });
    
    // 2. 시각적 표현을 위한 DOM 요소 생성
    const div = document.createElement("div");
    div.className = "bubble";
    div.style.width = `${radius * 2}px`;
    div.style.height = `${radius * 2}px`;
    div.style.backgroundImage = `url(${imgPath})`;
    
    bubbleContainer.appendChild(div);
    matterBubbles.push(body);
    domBubbles.push(div);
}
World.add(bubbleWorld, matterBubbles);
~~~

4. 특수 테마 처리
- 하트 모드 : '하트' 카테고리 선택 시 일반적인 물리 법칙과 다른 시각 효과를 부여합니다.
    - 무한 루프 : 하트 버블이 바닥으로 떨어지면 다시 상단으로 재배치(Body.setPosition)하여 끊임없이 쏟아지는 효과를 연출합니다.
    - 배경 효과 : setInterval을 이용해 배경에 floating-heart 애니메이션 요소를 주기적으로 생성합니다.

# UI 상태 관리 및 라우팅 (Core State Management)
- 본 프로젝트는 복잡한 UI 분기 처리를 위해 단일 진입점(Single Entry Point) 패턴을 적용했습니다.
- initValueCalculator 함수 하나가 사용자의 로그인 여부와 데이터 상태를 분석하여 앱의 전체적인 모드를 결정합니다.

### [1] 핵심 라우터 함수 : initValueCalculator
- 앱 초기 진입 시 실행되며, 조건에 따라 3가지 화면 모드 중 하나로 라우팅합니다.

~~~JavaScript
window.initValueCalculator = function ({ loggedIn = false, wishlist = null, savedAmount = 0 } = {}) {
    // 상태 1: 로그인 + 위시리스트 존재 (목표 달성 모드)
    if (loggedIn && wishlist) {
        updateGoalProgress(); // 프로그레스 바 업데이트
        setGoalHasMode();     // UI 클래스 전환
    } 
    // 상태 2: 로그인 + 위시리스트 없음 (목표 설정 유도 모드)
    else if (loggedIn && !wishlist) {
        setGoalEmptyMode();
    } 
    // 상태 3: 비로그인 (단순 체험 모드)
    else {
        setExperienceMode();
    }
};
~~~

### [2] 선언적 UI 제어 (Declarative UI Control)
- 자바스크립트 내부에서 DOM의 스타일(style.display)을 직접 조작하는 명령형 방식을 지양하였습니다.
- Body 태그의 클래스를 교체하는 선언적 방식을 채택하여 유지보수성을 높였습니다.
    - DX(Developer Experience) : JS는 '상태'만 변경하고, 실제 요소의 노출/숨김 처리는 CSS(style.css)가 전담하여 역할이 명확히 분리됩니다.

~~~JavaScript
function setGoalEmptyMode() {
    document.body.classList.add("mode-goal", "goal-empty");
    document.body.classList.remove("mode-basic", "goal-has");
}

function setGoalHasMode() {
    document.body.classList.add("mode-goal", "goal-has");
    document.body.classList.remove("mode-basic", "goal-empty");
}

function setExperienceMode() {
    document.body.classList.add("mode-basic");
    document.body.classList.remove("mode-goal", "goal-empty", "goal-has");
}
~~~

~~~CSS
body.mode-basic .goal-progress { display: none; }
body.mode-goal.goal-has .goal-progress { display: block; }
~~~

### [3] State Flow
- 앱이 실행될 때 initValueCalculator가 작동하는 흐름은 다음과 같습니다.
    1. 초기 진입 : 로컬 스토리지의 토큰 확인.
    2. 데이터 페칭 : 토큰이 있다면 API를 통해 사용자 데이터 조회.
    3. 라우팅 : 조회 결과에 따라 initValueCalculator 호출 및 모드 결정.