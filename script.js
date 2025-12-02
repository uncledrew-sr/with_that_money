document.addEventListener("DOMContentLoaded", () => {
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
  { id: "americano", label: "아메리카노", price: 4500, icon: "☕️", unit: "잔" },
  { id: "taxi", label: "택시", price: 4800, icon: "🚕", unit: "번" },
  { id: "burger", label: "햄버거", price: 5500, icon: "🍔", unit: "개" },
  { id: "gukbap", label: "국밥", price: 10000, icon: "🍲", unit: "그릇" },
  { id: "heart",  label: "하트", price: null, icon: "💜", unit: "" }, // no limit
];

  let customCategories = []; // 최대 3개
  let currentCategoryId = "coffee";
  
  const track = document.getElementById("category-track");
  const btnLeft = document.querySelector(".carousel-arrow-left");
  const btnRight = document.querySelector(".carousel-arrow-right");

  const amountEl = document.querySelector(".amount-value");
  const summaryLabelEl = document.querySelector(".summary-label");
  const summaryAmountLinkEl = document.querySelector(".summary-amount-link");
  const summaryRightEl = document.querySelector(".summary-right");

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

  /* ================= 수치/요약 업데이트 ================= */

  // "29,050 원" 같은 문자열에서 숫자만 추출
  function getCurrentAmount() {
    if (!amountEl) return 0;
    const num = parseInt(amountEl.textContent.replace(/[^0-9]/g, ""), 10);
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

    if (cat.price && amount > 0) {
      const n = amount / cat.price;
      summaryAmountLinkEl.textContent = `${n.toFixed(1)}잔`;
      summaryRightEl.textContent = `기준가: ${formatNumber(cat.price)}원`;
    } else if (cat.price && amount === 0) {
      summaryAmountLinkEl.textContent = "0잔";
      summaryRightEl.textContent = `기준가: ${formatNumber(cat.price)}원`;
    } else {
      // 하트처럼 no limit
      summaryAmountLinkEl.textContent = "-";
      summaryRightEl.textContent = "기준가 없음";
    }
  }

  /* ================= 캐러셀 좌우 스크롤 ================= */

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

  /* ================= 칩 클릭 / 커스텀 추가 ================= */

  if (track) {
    track.addEventListener("click", (e) => {
      const chip = e.target.closest(".chip");
      if (!chip) return;

      // 커스텀 추가 버튼
      if (chip.dataset.role === "add-category") {
        if (customCategories.length >= 3) {
          alert("커스텀 카테고리는 최대 3개까지 추가할 수 있어요.");
          return;
        }

        const name = prompt("커스텀 카테고리 이름을 입력하세요.");
        if (!name) return;

        const priceStr = prompt(
          "기준 단가(원)를 입력하세요.\n단위 제한이 없는 경우 비워두면 됩니다."
        );

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
        });

        currentCategoryId = id;
        renderCategories();
        updateSummaryCard();
        return;
      }

      // 일반 카테고리 선택
      const catId = chip.dataset.categoryId;
      if (!catId) return;

      currentCategoryId = catId;
      renderCategories();
      updateSummaryCard();
    });
  }

  /* ================= 초기 렌더 ================= */

  renderCategories();
  updateSummaryCard();
});
