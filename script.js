document.addEventListener("DOMContentLoaded", () => {
  /* ============== 모달 (목표 달성/안내) ============== */
  const celebrateModal = document.querySelector(".goal-modal-celebrate");
  const savingModal = document.querySelector(".goal-modal-saving");
  const closes = document.querySelectorAll(".goal-modal-close");

  window.openCelebrate = () => {
    if (celebrateModal) celebrateModal.classList.add("is-open");
  };
  window.openSaving = () => {
    if (savingModal) savingModal.classList.add("is-open");
  };

  closes.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (celebrateModal) celebrateModal.classList.remove("is-open");
      if (savingModal) savingModal.classList.remove("is-open");
    });
  });

  /* ============== 위시리스트 수정 모달 & 목표 진행바 ============== */

  const wishlistEditBtn = document.querySelector(".wishlist-edit");
  const wishlistModal = document.querySelector(".wishlist-modal");
  const wishlistCloseBtn = wishlistModal
    ? wishlistModal.querySelector(".wishlist-modal-close")
    : null;
  const wishlistForm = wishlistModal
    ? wishlistModal.querySelector(".wishlist-form")
    : null;
  const wishNameInput = wishlistModal
    ? wishlistModal.querySelector("#wish-name")
    : null;
  const wishPriceInput = wishlistModal
    ? wishlistModal.querySelector("#wish-price")
    : null;
  const wishUrlInput = wishlistModal
    ? wishlistModal.querySelector("#wish-url")
    : null;
  const wishSaveBtn = wishlistModal
    ? wishlistModal.querySelector(".wishlist-submit")
    : null;
  const wishNameErrorEl = wishlistModal
    ? wishlistModal.querySelector(".wishlist-error-name")
    : null;

  const goalLabelEl = document.querySelector(".goal-progress-label");
  const goalTargetEl = document.querySelector(".goal-progress-target");
  const goalFillEl = document.querySelector(".goal-progress-fill");

  // 위시리스트/누적금액 상태 (추후 실제 데이터와 연결하면 됨)
  let wishlist = null;
  let savedAmount = 0;

  function setWishlistButtonLabel() {
    if (!wishlistEditBtn) return;
    wishlistEditBtn.textContent = wishlist
      ? "위시리스트 수정하기"
      : "위시리스트 입력하기";
  }

  function openWishlistModal() {
    if (!wishlistModal) return;
    wishlistModal.classList.add("is-open");

    // 기존 값 있으면 폼에 채워주기
    if (wishlist && wishNameInput && wishPriceInput && wishUrlInput) {
      wishNameInput.value = wishlist.name;
      wishPriceInput.value = wishlist.price
        ? `${formatNumber(wishlist.price)}원`
        : "";
      wishUrlInput.value = wishlist.url || "";
    }
    validateWishlistForm(false);
  }

  function closeWishlistModal() {
    if (!wishlistModal) return;
    wishlistModal.classList.remove("is-open");
  }

  function updateGoalProgress() {
    if (!wishlist) return;
    const targetPrice = wishlist.price;
    const ratio =
      targetPrice && targetPrice > 0
        ? Math.min(savedAmount / targetPrice, 1)
        : 0;
    const percent = Math.round(ratio * 100);

    if (goalLabelEl) goalLabelEl.textContent = `${percent}% 달성`;
    if (goalTargetEl) goalTargetEl.textContent = wishlist.name;
    if (goalFillEl) goalFillEl.style.width = `${percent}%`;

    // 목표형 화면 노출
    document.body.classList.add("mode-goal");
  }

  // 위시리스트 폼 유효성 검사 (상품명 10자 이하 + 세 필드 모두 입력)
  function validateWishlistForm(showMessage = true) {
    if (!wishNameInput || !wishPriceInput || !wishSaveBtn) return false;

    const name = wishNameInput.value.trim();
    const priceStr = wishPriceInput.value.replace(/[^0-9]/g, "");
    const urlFilled = !!(wishUrlInput && wishUrlInput.value.trim());

    let valid = true;

    // 에러 상태 초기화
    const nameField = wishNameInput.closest(".wishlist-field");
    if (nameField) nameField.classList.remove("is-error");
    if (wishNameErrorEl) wishNameErrorEl.textContent = "";

    if (!name) {
      valid = false;
    } else if (name.length > 10) {
      valid = false;
      if (showMessage && wishNameErrorEl) {
        wishNameErrorEl.textContent = "상품명은 10자 이하여야 합니다.";
      }
      if (nameField) nameField.classList.add("is-error");
    }

    if (!priceStr) valid = false;
    if (!urlFilled) valid = false;

    const canSubmit = valid;
    wishSaveBtn.disabled = !canSubmit;
    wishSaveBtn.classList.toggle("is-active", canSubmit);

    return canSubmit;
  }

  // 버튼 클릭 → 모달 오픈
  if (wishlistEditBtn && wishlistModal) {
    setWishlistButtonLabel();
    wishlistEditBtn.addEventListener("click", openWishlistModal);
  }

  // X 버튼 / 오버레이 클릭 → 모달 닫기
  if (wishlistCloseBtn) {
    wishlistCloseBtn.addEventListener("click", closeWishlistModal);
  }
  if (wishlistModal) {
    wishlistModal.addEventListener("click", (e) => {
      if (e.target === wishlistModal) closeWishlistModal();
    });
  }

  // 인풋 입력 시 버튼 활성 상태 갱신
  [wishNameInput, wishPriceInput, wishUrlInput].forEach((input) => {
    if (!input) return;
    input.addEventListener("input", () => {
      if (input === wishPriceInput) {
        const raw = wishPriceInput.value.replace(/[^0-9]/g, "");
        wishPriceInput.value = raw;
      }
      validateWishlistForm(false);
    });
  });

  // 가격 인풋 blur 시 529,000원 형식으로 포맷
  if (wishPriceInput) {
    wishPriceInput.addEventListener("blur", () => {
      const num = parseInt(
        wishPriceInput.value.replace(/[^0-9]/g, ""),
        10
      );
      if (!Number.isNaN(num) && num > 0) {
        wishPriceInput.value = `${formatNumber(num)}원`;
      } else {
        wishPriceInput.value = "";
      }
      validateWishlistForm(false);
    });
  }

  // 폼 submit → 위시리스트 저장 + 진행바 갱신
  if (wishlistForm) {
    wishlistForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const ok = validateWishlistForm(true);
      if (!ok) return;

      const name = wishNameInput.value.trim();
      const price = parseInt(
        wishPriceInput.value.replace(/[^0-9]/g, ""),
        10
      );
      const url = wishUrlInput ? wishUrlInput.value.trim() : "";

      wishlist = { name, price, url };
      setWishlistButtonLabel();
      updateGoalProgress();
      closeWishlistModal();
    });
  }

  /* ============== 카테고리 / 요약 / 입력 로직 ============== */

  const BASE_CATEGORIES = [
    { id: "coffee", label: "커피", price: 4500, icon: "☕️", unit: "잔" },
    { id: "taxi", label: "택시", price: 4800, icon: "🚕", unit: "번" },
    { id: "burger", label: "햄버거", price: 5500, icon: "🍔", unit: "개" },
    { id: "gukbab", label: "국밥", price: 10000, icon: "🍲", unit: "그릇" },
    { id: "heart", label: "하트", price: null, icon: "❤️", unit: "" }, // no limit
  ];

  let customCategories = []; // 최대 3개
  let currentCategoryId = "coffee";

  const track = document.getElementById("category-track");
  const btnLeft = document.querySelector(".carousel-arrow-left");
  const btnRight = document.querySelector(".carousel-arrow-right");

  const amountInput = document.querySelector(".amount-input");
  const equalBtn = document.querySelector(".amount-equal-btn");
  const summaryLabelEl = document.querySelector(".summary-label");
  const summaryAmountLinkEl = document.querySelector(".summary-amount-link");
  const summaryRightEl = document.querySelector(".summary-right");
  const summaryIconEmojiEl = document.querySelector(".summary-icon-emoji");

  const SCROLL_AMOUNT = 140;

  function getAllCategories() {
    return [...BASE_CATEGORIES, ...customCategories];
  }

  function getCategoryById(id) {
    return getAllCategories().find((c) => c.id === id);
  }

  function renderCategories() {
    if (!track) return;
    track.innerHTML = "";

    const cats = getAllCategories();

    cats.forEach((cat) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className =
        "chip" +
        (cat.id === currentCategoryId ? " chip-active" : "") +
        (cat.id.startsWith("custom-") ? " chip-custom" : "");
      btn.textContent = cat.label;
      btn.dataset.categoryId = cat.id;
      track.appendChild(btn);
    });

    // (+) custom button : 최대 3개
    const addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.className = "chip chip-add";
    addBtn.dataset.role = "add-category";
    addBtn.textContent = "+";
    track.appendChild(addBtn);

    updateScrollButtons();
  }

  function getCurrentAmount() {
    if (!amountInput) return 0;
    const num = parseInt(amountInput.value.replace(/[^0-9]/g, ""), 10);
    return Number.isNaN(num) ? 0 : num;
  }

  function formatNumber(num) {
    return num.toLocaleString("ko-KR");
  }

  function updateSummaryCard() {
    const cat = getCategoryById(currentCategoryId);
    if (!cat || !summaryLabelEl || !summaryAmountLinkEl || !summaryRightEl)
      return;

    const amount = getCurrentAmount();

    summaryLabelEl.textContent = `${cat.label} 기준`;

    if (summaryIconEmojiEl) {
      summaryIconEmojiEl.textContent = cat.icon || "☕️";
    }

    if (cat.price && amount > 0) {
      const n = amount / cat.price;
      const unit = cat.unit || "개";
      summaryAmountLinkEl.textContent = `${n.toFixed(1)}${unit}`;
      summaryRightEl.textContent = `기준가: ${formatNumber(cat.price)}원`;
    } else if (cat.price && amount === 0) {
      const unit = cat.unit || "개";
      summaryAmountLinkEl.textContent = `0${unit}`;
      summaryRightEl.textContent = `기준가: ${formatNumber(cat.price)}원`;
    } else {
      // no limit
      summaryAmountLinkEl.textContent = "-";
      summaryRightEl.textContent = "기준가 없음";
    }
  }

  // = 버튼 활성/비활성
  function updateEqualState() {
    if (!amountInput || !equalBtn) return;
    const hasValue = amountInput.value.replace(/[^0-9]/g, "").length > 0;

    equalBtn.disabled = !hasValue;
    equalBtn.classList.toggle("is-disabled", !hasValue);
  }

  /* ===== 캐러셀 좌우 스크롤 ===== */

  function updateScrollButtons() {
    if (!track || !btnLeft || !btnRight) return;

    btnLeft.disabled = track.scrollLeft <= 0;

    const maxScroll = track.scrollWidth - track.clientWidth - 2;
    btnRight.disabled = track.scrollLeft >= maxScroll;
  }

  if (btnLeft && btnRight && track) {
    btnLeft.addEventListener("click", () => {
      track.scrollBy({ left: -SCROLL_AMOUNT, behavior: "smooth" });
      setTimeout(updateScrollButtons, 250);
    });

    btnRight.addEventListener("click", () => {
      track.scrollBy({ left: SCROLL_AMOUNT, behavior: "smooth" });
      setTimeout(updateScrollButtons, 250);
    });

    track.addEventListener("scroll", () => {
      updateScrollButtons();
    });
  }

  /* ===== 버블 섹션 (Matter.js) ===== */

  const bubbleContainer = document.getElementById("bubble-container");
  let bubbleEngine = null;
  let bubbleWorld = null;
  let bubbleRunner = null;
  let matterBubbles = [];
  let domBubbles = [];

  // 카테고리별 이미지 (원하면 경로 바꿔)
  const bubblePresets = {
    coffee: { img: "images/coffee.png" },
    taxi: { img: "images/taxi.png" },
    burger: { img: "images/hamburger.png" },
    gukbab: { img: "images/gukbab.png" },
    heart: { img: "images/heart.png" },
  };

  const BUBBLE_MIN_RADIUS = 16; // 가장 싼 카테고리
  const BUBBLE_MAX_RADIUS = 40; // 가장 비싼 카테고리
  const BUBBLE_DENSITY = 0.8; // 컨테이너 내에서 버블이 차지할 비율

  function initBubbleEngine() {
    if (!bubbleContainer || typeof Matter === "undefined") return;
    if (bubbleEngine) return;

    const { Engine, Runner, Bodies, World, Events, Body } = Matter;

    const width = bubbleContainer.clientWidth || 340;
    const height = bubbleContainer.clientHeight || 260;

    bubbleEngine = Engine.create();
    bubbleWorld = bubbleEngine.world;
    bubbleWorld.gravity.y = 0.3; // 0.25, 0.3

    const wallOptions = {
      isStatic: true,
      render: { visible: false },
      restitution: 0.9,
      friction: 0,
    };
    const wallThickness = 40;

    const ground = Bodies.rectangle(
      width / 2,
      height + wallThickness / 2,
      width,
      wallThickness,
      wallOptions
    );
    const leftWall = Bodies.rectangle(
      -wallThickness / 2,
      height / 2,
      wallThickness,
      height,
      wallOptions
    );
    const rightWall = Bodies.rectangle(
      width + wallThickness / 2,
      height / 2,
      wallThickness,
      height,
      wallOptions
    );

    World.add(bubbleWorld, [ground, leftWall, rightWall]);

    bubbleRunner = Runner.create();
    Runner.run(bubbleRunner, bubbleEngine);

    Events.on(bubbleEngine, "afterUpdate", () => {
      matterBubbles.forEach((body, idx) => {
        const div = domBubbles[idx];
        if (!div) return;
        const r = body.circleRadius;
        const { x, y } = body.position;

        const angleDeg = (body.angle * 180) / Math.PI;
        div.style.transform =
          `translate(${x - r}px, ${y - r}px) rotate(${angleDeg}deg)`;
      });
    });
  }

  function clearBubbles() {
    if (!bubbleWorld) return;
    const { World } = Matter;
    matterBubbles.forEach((b) => World.remove(bubbleWorld, b));
    matterBubbles = [];
    domBubbles.forEach((d) => d.remove());
    domBubbles = [];
  }

  // 가격 -> (radius, count)
  function priceToRadiusAndCount(price) {
    const priced = BASE_CATEGORIES.filter((c) => c.price);
    const prices = priced.map((c) => c.price);
    const minP = Math.min(...prices);
    const maxP = Math.max(...prices);

    const width = bubbleContainer?.clientWidth || 340;
    const height = bubbleContainer?.clientHeight || 260;
    const containerArea = width * height;

    let t;
    if (!price || maxP === minP) {
      t = 0.5;
    } else {
      t = (price - minP) / (maxP - minP); // 싼 것 0, 비싼 것 1
    }

    const radius =
      BUBBLE_MIN_RADIUS + t * (BUBBLE_MAX_RADIUS - BUBBLE_MIN_RADIUS);

    const totalBubbleArea = containerArea * BUBBLE_DENSITY;
    const perBubbleArea = Math.PI * radius * radius;
    let count = Math.floor(totalBubbleArea / perBubbleArea);
    count = Math.max(8, Math.min(count, 120)); // 최소/최대 갯수 클램프

    return { radius, count };
  }

  function updateBubbles() {
    if (!bubbleContainer || typeof Matter === "undefined") return;

    initBubbleEngine();

    const cat = getCategoryById(currentCategoryId);
    if (!cat) return;

    clearBubbles();

    const { Bodies, World, Body } = Matter;
    const width = bubbleContainer.clientWidth || 340;
    const height = bubbleContainer.clientHeight || 260;

    const preset = bubblePresets[cat.id] || bubblePresets["coffee"];
    const imgPath = preset.img;

    const { radius, count: N } = priceToRadiusAndCount(cat.price);

    for (let i = 0; i < N; i++) {
      const x = Math.random() * (width * 0.8) + width * 0.1;
      const y = -Math.random() * 260;

      const body = Bodies.circle(x, y, radius, {
        restitution: 0.7,
        friction: 0.05,
        frictionAir: 0.0,
      });

      Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.4);

      matterBubbles.push(body);

      const div = document.createElement("div");
      div.className = "bubble";
      div.style.width = `${radius * 2}px`;
      div.style.height = `${radius * 2}px`;
      if (imgPath) {
        div.style.backgroundImage = `url(${imgPath})`;
      }
      bubbleContainer.appendChild(div);
      domBubbles.push(div);
    }

    World.add(bubbleWorld, matterBubbles);
  }

  /* ===== 금액 인풋 이벤트 ===== */

  if (amountInput) {
    amountInput.addEventListener("input", () => {
      updateEqualState();
      updateSummaryCard();
    });

    amountInput.addEventListener("blur", () => {
      const v = getCurrentAmount();
      if (!v) {
        amountInput.value = "";
        updateEqualState();
        updateSummaryCard();
        return;
      }
      amountInput.value = `${formatNumber(v)} 원`;
    });
  }

  /* ===== 칩 클릭 / 커스텀 추가 ===== */

  if (track) {
    track.addEventListener("click", (e) => {
      const chip = e.target.closest(".chip");
      if (!chip) return;

      // 커스텀 추가
      if (chip.dataset.role === "add-category") {
        if (customCategories.length >= 3) {
          alert("커스텀 단위는 최대 3개까지 추가할 수 있어요.");
          return;
        }

        const name = prompt("커스텀 단위 이름을 입력하세요.");
        if (!name) return;

        const priceStr = prompt("기준 단가(원)를 입력하세요.");
        let price = null;
        if (priceStr && priceStr.trim() !== "") {
          const parsed = parseInt(priceStr.replace(/[^0-9]/g, ""), 10);
          if (!Number.isNaN(parsed)) {
            price = parsed;
          }
        }

        const id = "custom-" + Date.now();
        customCategories.push({
          id,
          label: name,
          price,
          icon: "⭐️",
          unit: "개",
        });

        currentCategoryId = id;
        renderCategories();
        updateSummaryCard();
        updateEqualState();
        updateBubbles();
        return;
      }

      // 일반 카테고리 선택
      const catId = chip.dataset.categoryId;
      if (!catId) return;

      currentCategoryId = catId;
      renderCategories();
      updateSummaryCard();
      updateEqualState();
      updateBubbles();
    });
  }

  /* ===== 초기 렌더 ===== */

  renderCategories();
  updateSummaryCard();
  updateEqualState();
  updateBubbles();
});
