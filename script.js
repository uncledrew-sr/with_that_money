document.addEventListener("DOMContentLoaded", () => {
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

    const BUBBLE_PRESETS = {
        coffee: {
            label: "커피",
            price: 4500,
            unit: "잔",
            img: "images/coffee.png"
        },
        taxi: {
            label: "택시",
            price: 4800,
            unit: "번",
            img: "images/taxi.png"
        },
        burger: {
            label: "햄버거",
            price: 5500,
            unit: "개",
            img: "images/hamburger.png"
        },
        gukbab: {
            label: "국밥",
            price: 10000,
            unit: "그릇",
            img: "images/gukbab.png"
        },
        heart: {
            label: "하트",
            price: null,
            unit: "",
            img: "images/heart.png"
        }
    };

    function getPreset(id) {
        return BUBBLE_PRESETS[id] || BUBBLE_PRESETS.coffee;
    }


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

    const hintGoalEl = document.querySelector(".hint-goal");

    if (hintGoalEl) {
        hintGoalEl.addEventListener("click", () => {
            openWishlistModal();
        });
    }

    const goalLabelEl = document.querySelector(".goal-progress-label");
    const goalTargetEl = document.querySelector(".goal-progress-target");
    const goalFillEl = document.querySelector(".goal-progress-fill");

    let wishlist = null;
    let savedAmount = 0;

    function setMode(isGoal) {
        if (isGoal) {
            document.body.classList.add("mode-goal");
            document.body.classList.remove("mode-basic");
        } else {
            document.body.classList.add("mode-basic");
            document.body.classList.remove("mode-goal");
        }
    }
    function setExperienceMode() {
        document.body.classList.add("mode-basic");
        document.body.classList.remove("mode-goal", "goal-empty", "goal-has");
        }

    function setGoalEmptyMode() {
        document.body.classList.add("mode-goal", "goal-empty");
        document.body.classList.remove("mode-basic", "goal-has");
    }

    function setGoalHasMode() {
        document.body.classList.add("mode-goal", "goal-has");
        document.body.classList.remove("mode-basic", "goal-empty");
    }


    function setWishlistButtonLabel() {
        if (!wishlistEditBtn) return;
        wishlistEditBtn.textContent = wishlist
            ? "위시리스트 수정하기"
            : "위시리스트 입력하기";
    }

    function openWishlistModal() {
        if (!wishlistModal) return;
        wishlistModal.classList.add("is-open");

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

        setGoalHasMode();
    }

    function validateWishlistForm(showMessage = true) {
        if (!wishNameInput || !wishPriceInput || !wishSaveBtn) return false;

        const name = wishNameInput.value.trim();
        const priceStr = wishPriceInput.value.replace(/[^0-9]/g, "");
        const urlFilled = !!(wishUrlInput && wishUrlInput.value.trim());

        let valid = true;

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

    if (wishlistEditBtn && wishlistModal) {
        setWishlistButtonLabel();
        wishlistEditBtn.addEventListener("click", openWishlistModal);
    }

    if (wishlistCloseBtn) {
        wishlistCloseBtn.addEventListener("click", closeWishlistModal);
    }

    if (wishlistModal) {
        wishlistModal.addEventListener("click", (e) => {
            if (e.target === wishlistModal) {
                e.preventDefault();
                e.stopPropagation();
            }
        });
    }

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

    const BASE_CATEGORIES = Object.entries(BUBBLE_PRESETS).map(([id, p]) => ({
        id,
        label: p.label,
        price: p.price,
        unit: p.unit
    }));


    let customCategories = [];
    let currentCategoryId = "coffee";

    const track = document.getElementById("category-track");
    const btnLeft = document.querySelector(".carousel-arrow-left");
    const btnRight = document.querySelector(".carousel-arrow-right");

    const amountInput = document.querySelector(".amount-input");
    const equalBtn = document.querySelector(".amount-equal-btn");
    const summaryLabelEl = document.querySelector(".summary-label");
    const summaryAmountLinkEl = document.querySelector(".summary-amount-link");
    const summaryRightEl = document.querySelector(".summary-right");
    const summaryIconImgEl = document.querySelector(".summary-icon-img");

    const SCROLL_AMOUNT = 140;
    const DEFAULT_AMOUNT = 100000;

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

        const addBtn = document.createElement("button");
        addBtn.type = "button";
        addBtn.className = "chip chip-add";
        addBtn.dataset.role = "add-category";
        addBtn.textContent = "+";
        track.appendChild(addBtn);

        updateScrollButtons();
    }

    function getCurrentAmount() {
        if (!amountInput) return DEFAULT_AMOUNT;

        const digits = amountInput.value.replace(/[^0-9]/g, "");

        if (digits.length === 0) {
            return DEFAULT_AMOUNT;
        }

        const num = parseInt(digits, 10);
        return Number.isNaN(num) ? DEFAULT_AMOUNT : num;
    }

    function getBubbleCount(cat) {
        const amount = getCurrentAmount();

        if (!cat.price || amount <= 0) return 0;

        let n = Math.floor(amount / cat.price);

        if (n < 1) n = 1;
        if (n > 80) n = 80;

        return n;
    }

    function getBubbleRadius(count) {
        if (!bubbleContainer || count <= 0) return BUBBLE_MIN_RADIUS;

        const width = bubbleContainer.clientWidth || 340;
        const height = bubbleContainer.clientHeight || 260;
        const containerArea = width * height;

        const totalBubbleArea = containerArea * BUBBLE_FILL_RATIO;
        const perBubbleArea = totalBubbleArea / count;

        let radius = Math.sqrt(perBubbleArea / Math.PI);

        radius = Math.max(BUBBLE_MIN_RADIUS, Math.min(radius, BUBBLE_MAX_RADIUS));

        return radius;
    }

    function formatNumber(num) {
        return num.toLocaleString("ko-KR");
    }

    function updateSummaryCard() {
        const cat = getCategoryById(currentCategoryId);
        if (!cat || !summaryLabelEl || !summaryAmountLinkEl || !summaryRightEl) return;

        const amount = getCurrentAmount();
        const preset = getPreset(cat.id);

        summaryLabelEl.textContent = preset.label;

        if (summaryIconImgEl) {
            summaryIconImgEl.src = preset.img;
            summaryIconImgEl.alt = preset.label;
        }

        if (preset.price && amount > 0) {
            const n = amount / preset.price;
            const unit = preset.unit || "개";
            summaryAmountLinkEl.textContent = `${n.toFixed(1)}${unit}`;
            summaryRightEl.textContent = `기준가: ${formatNumber(preset.price)}원`;
        } else if (preset.price && amount === 0) {
            const unit = preset.unit || "개";
            summaryAmountLinkEl.textContent = `0${unit}`;
            summaryRightEl.textContent = `기준가: ${formatNumber(preset.price)}원`;
        } else {
            summaryAmountLinkEl.textContent = "-";
            summaryRightEl.textContent = "기준가 없음";
        }
    }


    function updateEqualState() {
        if (!amountInput || !equalBtn) return;
        const hasValue = amountInput.value.replace(/[^0-9]/g, "").length > 0;

        equalBtn.disabled = !hasValue;
        equalBtn.classList.toggle("is-disabled", !hasValue);
    }

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

    const bubbleContainer = document.getElementById("bubble-container");
    let bubbleEngine = null;
    let bubbleWorld = null;
    let bubbleRunner = null;
    let matterBubbles = [];
    let domBubbles = [];

    const BUBBLE_MIN_RADIUS = 5;
    const BUBBLE_MAX_RADIUS = 60;
    const BUBBLE_FILL_RATIO = 1.0;

    function initBubbleEngine() {
        if (!bubbleContainer || typeof Matter === "undefined") return;
        if (bubbleEngine) return;

        const { Engine, Runner, Bodies, World, Events, Body } = Matter;

        const width = bubbleContainer.clientWidth || 340;
        const height = bubbleContainer.clientHeight || 260;

        bubbleEngine = Engine.create();
        bubbleWorld = bubbleEngine.world;
        bubbleWorld.gravity.y = 0.3;

        const wallOptions = {
            isStatic: true,
            render: { visible: false },
            restitution: 0.9,
            friction: 0
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
                div.style.transform = `translate(${x - r}px, ${y - r}px) rotate(${angleDeg}deg)`;
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

    function priceToRadiusAndCount(cat) {
        const N = getBubbleCount(cat);
        if (N === 0) {
            return { radius: BUBBLE_MIN_RADIUS, count: 0 };
        }

        const radius = getBubbleRadius(N);

        console.log(
            "[BUBBLE]",
            cat.id,
            "amount =", getCurrentAmount(),
            "N =", N,
            "radius =", radius.toFixed(2)
        );

        return {
            radius,
            count: N
        };
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

        const preset = getPreset(cat.id);
        const imgPath = preset.img;

        const { radius, count: N } = priceToRadiusAndCount(cat);

        for (let i = 0; i < N; i++) {
            const x = Math.random() * (width * 0.8) + width * 0.1;
            const y = -Math.random() * 260;

            const body = Bodies.circle(x, y, radius, {
                restitution: 0.7,
                friction: 0.05,
                frictionAir: 0.0
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


    if (amountInput) {
        amountInput.addEventListener("input", () => {
            updateEqualState();
            updateSummaryCard();
            updateBubbles();
        });

        amountInput.addEventListener("blur", () => {
            const v = getCurrentAmount();
            if (!v) {
                amountInput.value = "";
                updateEqualState();
                updateSummaryCard();
                updateBubbles();
                return;
            }
            amountInput.value = `${formatNumber(v)} 원`;
            updateBubbles();
        });
    }

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
                    const parsed = parseInt(
                        priceStr.replace(/[^0-9]/g, ""),
                        10
                    );
                    if (!Number.isNaN(parsed)) {
                        price = parsed;
                    }
                }

                const id = `custom-${Date.now()}`;
                customCategories.push({
                    id,
                    label: name,
                    price,
                    icon: "⭐️",
                    unit: "개"
                });

                currentCategoryId = id;
                renderCategories();
                updateSummaryCard();
                updateEqualState();
                updateBubbles();
                return;
            }

            const catId = chip.dataset.categoryId;
            if (!catId) return;

            currentCategoryId = catId;
            renderCategories();
            updateSummaryCard();
            updateEqualState();
            updateBubbles();
        });
    }

    renderCategories();
    updateSummaryCard();
    updateEqualState();
    updateBubbles();

    window.initValueCalculator = function ({
            loggedIn = false,
            wishlist: initialWishlist = null,
            savedAmount: initialSaved = 0
    } = {}) {
        savedAmount = initialSaved;

        if (loggedIn && initialWishlist) {
            wishlist = initialWishlist;          
            setWishlistButtonLabel();
            updateGoalProgress();                 
        } else if (loggedIn && !initialWishlist) {
            wishlist = null;
            savedAmount = 0;
            setGoalEmptyMode();
            setWishlistButtonLabel();
        } else {
            wishlist = null;
            savedAmount = 0;
            setExperienceMode();
            setWishlistButtonLabel();
        }
    };

    const MOCK_MODE = "goal-empty"; // "experience" | "goal-empty" | "goal-has"

    if (MOCK_MODE === "experience") {
        initValueCalculator({ loggedIn: false });
    } else if (MOCK_MODE === "goal-empty") {
        initValueCalculator({ loggedIn: true, wishlist: null });
    } else if (MOCK_MODE === "goal-has") {
        initValueCalculator({
            loggedIn: true,
            wishlist: { name: "에어팟 프로2", price: 359000, url: "#" },
            savedAmount: 140000
        });
    }
});
