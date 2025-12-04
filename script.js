document.addEventListener("DOMContentLoaded", () => {
  /* ============== 모달 ============== */
  const celebrateModal = document.querySelector(".goal-modal-celebrate");
  const savingModal = document.querySelector(".goal-modal-saving");
  const closes = document.querySelectorAll(".goal-modal-close");

  window.openCelebrate = () => {
    celebrateModal.classList.add("is-open");
  };
  window.openSaving = () => {
    savingModal.classList.add("is-open");
  };

  closes.forEach((btn) => {
    btn.addEventListener("click", () => {
      celebrateModal.classList.remove("is-open");
      savingModal.classList.remove("is-open");
    });
  });

  // preset
  const BASE_CATEGORIES = [
    { id: "coffee", label: "커피",   price: 4500,  icon: "☕️", unit: "잔" },
    { id: "taxi",   label: "택시",   price: 4800,  icon: "🚕", unit: "번" },
    { id: "burger", label: "햄버거", price: 5500,  icon: "🍔", unit: "개" },
    { id: "gukbap", label: "국밥",   price: 10000, icon: "🍲", unit: "그릇" },
    { id: "heart",  label: "하트",   price: null,  icon: "❤️", unit: "" }, // no limit
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

  // "29,050 원" 같은 문자열에서 숫자만 추출
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
    if (!cat || !summaryLabelEl || !summaryAmountLinkEl || !summaryRightEl) return;

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

  /* ===== 금액 인풋 이벤트 ===== */

  if (amountInput) {
    // 입력하는 동안: 버튼 활성 상태 + 요약카드 갱신
    amountInput.addEventListener("input", () => {
      updateEqualState();
      updateSummaryCard();
    });

    // 포커스를 잃으면 숫자 형식 + '원' 붙이기
    amountInput.addEventListener("blur", () => {
      const v = getCurrentAmount();
      if (!v) {
        amountInput.value = ""; // 값 없으면 다시 placeholder 보이게
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
        return;
      }

      const catId = chip.dataset.categoryId;
      if (!catId) return;

      currentCategoryId = catId;
      renderCategories();
      updateSummaryCard();
      updateEqualState();
    });
  }

  /* ===== 초기 렌더 ===== */

  renderCategories();
  updateSummaryCard();
  updateEqualState(); // 처음에는 버튼 비활성 + placeholder만 보이게
});
