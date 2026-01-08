# API 서비스 구조 및 연동 원리 (api.js)
### [1] 인증 및 공통 헤더 관리 (Auth & Headers)
서버와의 보안 통신을 위해 모든 요청에 공통적으로 적용되는 로직입니다.

~~~JavaScript
getHeaders: () => {
    const token = localStorage.getItem("accessToken");
    const headers = { "Content-Type": "application/json" };
    // 토큰이 유효한 경우만 Authorization 헤더 부착
    if (token && token !== "null" && token !== "undefined") {
        headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
},

handleAuthError: (status) => {
    // 401(미인증) 또는 403(권한없음) 발생 시 세션 초기화
    if (status === 401 || status === 403) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        return true; 
    }
    return false;
}
~~~
- JWT 인증
    - localStorage에 저장된 토큰을 Bearer 스키마 형식으로 헤더에 포함하여 매 요청마다 사용자를 인증합니다.
- 보안 대응
    - 서버 응답 코드(401, 403)를 감시하여 토큰이 만료되거나 유효하지 않을 경우 즉시 로컬 세션을 삭제하고 보호된 기능에 대한 접근을 차단합니다.

### [2] 카카오 OAuth 2.0 로그인 (Social Login)
카카오 인증 시스템을 통해 안전하게 사용자 신원을 확인하는 연동 과정입니다.

~~~JavaScript
getKakaoLoginUrl: async () => {
    const response = await fetch(`${CONFIG.API_BASE_URL}/api/auth/kakao/login`);
    if (response.ok) return await response.text(); // 로그인 페이지 URL 반환
},

loginWithCode: async (code) => {
    const response = await fetch(`${CONFIG.API_BASE_URL}/api/auth/kakao/callback?code=${code}`, {
        method: "GET"
    });
    const data = await response.json();
    // 발급받은 토큰을 로컬에 저장하여 세션 유지
    if (data.accessToken) localStorage.setItem("accessToken", data.accessToken);
    return data;
}
~~~
- 2단계 인증
    - 클라이언트는 서버로부터 로그인 URL을 받아 리다이렉트 시킨 후, 카카오로부터 전달받은 인가 코드(code)를 다시 백엔드로 전송하여 최종 토큰을 발급받습니다.

### [3] 도메인 데이터 관리 (Wishlist & Units)
위시리스트와 가치 단위(Unit)를 처리하는 API 입니다.

~~~JavaScript
createWishlist: async (itemName, targetPrice, itemUrl) => {
    const response = await fetch(`${CONFIG.API_BASE_URL}/api/wishlists`, {
        method: "POST", // 자원 생성
        headers: ApiService.getHeaders(),
        body: JSON.stringify({ itemName, targetPrice, itemUrl })
    });
    if (ApiService.handleAuthError(response.status)) throw new Error("인증 실패");
    return await response.json();
}
~~~
- HTTP 메서드 활용
    - 데이터의 성격에 따라 GET(조회), POST(생성), PUT(수정), DELETE(삭제) 메서드를 엄격히 구분하여 사용합니다.
- 비동기 처리
    - async/await를 사용하여 데이터가 서버로부터 도착할 때까지 대기하며, 성공 시 UI 업데이트 로직으로 데이터를 전달합니다.

### [4] API 연동 테이블
|기능 분류|HTTP 메서드|엔드포인트|설명|
|-|-|-|-|
|인증|GET|/api/auth/kakao/*|카카오 로그인 및 콜백 처리|
|위시리스트|GET/POST/PUT/DELETE|/api/wishlists/*|사용자 목표 설정 및 관리|
|단위/아이콘|GET/POST/PUT/DELETE|/api/units/*|가치 환산 단위 및 커스텀 아이콘 관리|
|저축|POST|/api/savings|입력 금액을 위시리스트에 누적 기록|

### [5] 연동 핵심 기술 요약
- Centralized Config
    - CONFIG.API_BASE_URL을 통해 모든 API 주소를 중앙 관리하여 환경 변화에 유연하게 대응합니다.
- Error Handling
    - try-catch 및 응답 상태 체크를 통해 통신 실패 시에도 앱이 중단되지 않고 사용자에게 피드백을 주도록 설계되었습니다.
- Token Persistence
    - 로그인 성공 시 localStorage를 활용해 페이지 새로고침 후에도 인증 상태를 유지합니다.