document.addEventListener("DOMContentLoaded", () => {
    if (typeof Kakao !== 'undefined' && !Kakao.isInitialized()) {
    }

    const loginBtn = document.getElementById("btn-kakao-login");

    if (loginBtn) {
        loginBtn.addEventListener("click", () => {
            if (typeof Kakao === 'undefined' || !Kakao.isInitialized()) {
                alert("카카오 SDK가 초기화되지 않았습니다.");
                return;
            }

            Kakao.Auth.login({
                success: function(authObj) {
                    console.log("카카오 로그인 성공:", authObj);
                    alert("로그인 되었습니다! 위시리스트를 작성해보세요.");
                    
                    initValueCalculator({ 
                        loggedIn: true, 
                        wishlist: null 
                    });
                },
                fail: function(err) {
                    console.error("로그인 실패:", err);
                    alert("로그인에 실패했습니다.");
                },
            });
        });
    }

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
        coffee: { id: "coffee", label: "커피", price: 4500, unit: "잔", img: "images/coffee.png" },
        taxi: { id: "taxi", label: "택시", price: 4800, unit: "번", img: "images/taxi.png" },
        burger: { id: "burger", label: "햄버거", price: 5500, unit: "개", img: "images/hamburger.png" },
        gukbab: { id: "gukbab", label: "국밥", price: 10000, unit: "그릇", img: "images/gukbab.png" },
        heart: { id: "heart", label: "하트", price: null, unit: "", img: "images/heart.png" }
    };

    let customCategories = [];
    let currentCategoryId = "coffee";

    function getPreset(id) {
        if (BUBBLE_PRESETS[id]) return BUBBLE_PRESETS[id];
        const custom = customCategories.find(c => c.id === id);
        if (custom) return custom;
        return BUBBLE_PRESETS.coffee;
    }

    function getAllCategories() {
        const base = Object.values(BUBBLE_PRESETS);
        return [...base, ...customCategories];
    }

    const wishlistEditBtn = document.querySelector(".wishlist-edit");
    const wishlistModal = document.querySelector(".wishlist-modal");
    const wishlistCloseBtn = wishlistModal ? wishlistModal.querySelector(".wishlist-modal-close") : null;
    const wishlistForm = wishlistModal ? wishlistModal.querySelector(".wishlist-form") : null;
    
    const wishNameInput = wishlistModal ? wishlistModal.querySelector("#wish-name") : null;
    const wishPriceInput = wishlistModal ? wishlistModal.querySelector("#wish-price") : null;
    const wishUrlInput = wishlistModal ? wishlistModal.querySelector("#wish-url") : null;
    const wishSaveBtn = wishlistModal ? wishlistModal.querySelector(".wishlist-submit") : null;
    const wishNameErrorEl = wishlistModal ? wishlistModal.querySelector(".wishlist-error-name") : null;

    const goalLabelEl = document.querySelector(".goal-progress-label");
    const goalTargetEl = document.querySelector(".goal-progress-target");
    const goalFillEl = document.querySelector(".goal-progress-fill");
    const hintGoalEl = document.querySelector(".hint-goal");

    const amountErrorMsg = document.querySelector(".amount-error-msg");

    let wishlist = null;
    let savedAmount = 0;

    if (hintGoalEl) {
        hintGoalEl.addEventListener("click", () => openWishlistModal());
    }

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

    function setWishlistButtonLabel() {
        if (!wishlistEditBtn) return;
        wishlistEditBtn.textContent = wishlist ? "위시리스트 수정하기" : "위시리스트 입력하기";
    }

    function updateGoalProgress() {
        if (!wishlist) return;
        const targetPrice = wishlist.price;
        const ratio = (targetPrice && targetPrice > 0) ? Math.min(savedAmount / targetPrice, 1) : 0;
        const percent = Math.round(ratio * 100);

        if (goalLabelEl) goalLabelEl.textContent = `${percent}% 달성`;
        if (goalTargetEl) goalTargetEl.textContent = wishlist.name;
        if (goalFillEl) goalFillEl.style.width = `${percent}%`;

        setGoalHasMode();
    }

    function openWishlistModal() {
        if (!wishlistModal) return;
        wishlistModal.classList.add("is-open");
        if (wishlist && wishNameInput && wishPriceInput && wishUrlInput) {
            wishNameInput.value = wishlist.name;
            wishPriceInput.value = wishlist.price ? `${formatNumber(wishlist.price)}원` : "";
            wishUrlInput.value = wishlist.url || "";
        }
        validateWishlistForm(false);
    }

    function closeWishlistModal() {
        if (wishlistModal) wishlistModal.classList.remove("is-open");
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

        if (!name) valid = false;
        else if (name.length > 10) {
            valid = false;
            if (wishNameErrorEl) wishNameErrorEl.textContent = "상품명은 10자 이하여야 합니다.";
            if (nameField) nameField.classList.add("is-error");
        }

        if (!priceStr) valid = false;
        if (!urlFilled) valid = false;

        wishSaveBtn.disabled = !valid;
        wishSaveBtn.classList.toggle("is-active", valid);
        return valid;
    }

    if (wishlistEditBtn) wishlistEditBtn.addEventListener("click", openWishlistModal);
    if (wishlistCloseBtn) wishlistCloseBtn.addEventListener("click", closeWishlistModal);
    if (wishlistModal) {
        wishlistModal.addEventListener("click", (e) => {
            if (e.target === wishlistModal) {
                e.preventDefault(); e.stopPropagation();
            }
        });
    }

    [wishNameInput, wishPriceInput, wishUrlInput].forEach(input => {
        if(input) input.addEventListener("input", () => {
            if (input === wishPriceInput) input.value = input.value.replace(/[^0-9]/g, "");
            validateWishlistForm(false);
        });
    });

    if (wishPriceInput) {
        wishPriceInput.addEventListener("blur", () => {
            const num = parseInt(wishPriceInput.value.replace(/[^0-9]/g, ""), 10);
            if (!Number.isNaN(num) && num > 0) wishPriceInput.value = `${formatNumber(num)}원`;
            else wishPriceInput.value = "";
            validateWishlistForm(false);
        });
    }

    if (wishlistForm) {
        wishlistForm.addEventListener("submit", (e) => {
            e.preventDefault();
            if (!validateWishlistForm(true)) return;
            
            const name = wishNameInput.value.trim();
            const price = parseInt(wishPriceInput.value.replace(/[^0-9]/g, ""), 10);
            const url = wishUrlInput ? wishUrlInput.value.trim() : "";

            wishlist = { name, price, url };
            setWishlistButtonLabel();
            updateGoalProgress();
            closeWishlistModal();
        });
    }

    const customModal = document.querySelector(".custom-modal");
    const customCloseBtn = customModal ? customModal.querySelector(".custom-modal-close") : null;
    const customForm = customModal ? customModal.querySelector(".custom-form") : null;
    const customNameInput = customModal ? customModal.querySelector("#custom-name") : null;
    const customPriceInput = customModal ? customModal.querySelector("#custom-price") : null;
    const customSubmitBtn = customModal ? customModal.querySelector(".custom-submit") : null;
    const customIconInputs = customModal ? customModal.querySelectorAll("input[name='custom-icon']") : [];

    function openCustomModal() {
        if (!customModal) return;
        customModal.classList.add("is-open");
        if(customNameInput) customNameInput.value = "";
        if(customPriceInput) customPriceInput.value = "";
        if(customIconInputs.length > 0) customIconInputs[0].checked = true;
        validateCustomForm();
    }

    function closeCustomModal() {
        if(customModal) customModal.classList.remove("is-open");
    }

    function validateCustomForm() {
        if(!customNameInput || !customPriceInput || !customSubmitBtn) return;
        const name = customNameInput.value.trim();
        const priceStr = customPriceInput.value.replace(/[^0-9]/g, "");
        let valid = true;
        if(!name) valid = false;
        if(!priceStr) valid = false;
        customSubmitBtn.disabled = !valid;
        customSubmitBtn.classList.toggle("is-active", valid);
    }

    if (customCloseBtn) customCloseBtn.addEventListener("click", closeCustomModal);
    
    [customNameInput, customPriceInput].forEach(input => {
        if(input) input.addEventListener("input", () => {
            if (input === customPriceInput) input.value = input.value.replace(/[^0-9]/g, "");
            validateCustomForm();
        });
    });

    if(customForm) {
        customForm.addEventListener("submit", (e) => {
            e.preventDefault();
            if (customCategories.length >= 3) {
                alert("커스텀 단위는 최대 3개까지 추가할 수 있어요.");
                closeCustomModal();
                return;
            }
            const name = customNameInput.value.trim();
            const price = parseInt(customPriceInput.value.replace(/[^0-9]/g, ""), 10);
            const selectedIcon = document.querySelector("input[name='custom-icon']:checked").value;
            const id = `custom-${Date.now()}`;
            customCategories.push({
                id: id,
                label: name,
                price: price,
                unit: "개",
                img: selectedIcon
            });
            currentCategoryId = id;
            renderCategories();
            updateSummaryCard();
            updateEqualState();
            updateBubbles();
            closeCustomModal();
        });
    }

    const track = document.getElementById("category-track");
    const btnLeft = document.querySelector(".carousel-arrow-left");
    const btnRight = document.querySelector(".carousel-arrow-right");

    const amountInput = document.querySelector(".amount-input");
    const equalBtn = document.querySelector(".amount-equal-btn");
    const summaryCard = document.querySelector(".summary-card"); // 요약 카드 선택자 추가
    const summaryLabelEl = document.querySelector(".summary-label");
    const summaryAmountLinkEl = document.querySelector(".summary-amount-link");
    const summaryRightEl = document.querySelector(".summary-right");
    const summaryIconImgEl = document.querySelector(".summary-icon-img");

    const SCROLL_AMOUNT = 140;
    const DEFAULT_AMOUNT = 100000;

    function renderCategories() {
        if (!track) return;
        track.innerHTML = "";
        const cats = getAllCategories();
        cats.forEach((cat) => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "chip" + 
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
        if (digits.length === 0) return DEFAULT_AMOUNT;
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

    function formatNumber(num) {
        return num.toLocaleString("ko-KR");
    }

    function updateSummaryCard() {
        const cat = getPreset(currentCategoryId);
        if (!cat || !summaryLabelEl) return;
        const amount = getCurrentAmount();

        if (summaryCard) {
            summaryCard.style.transition = "background-color 0.3s, border-color 0.3s";
            
            if (cat.id === "heart") {
                summaryCard.style.backgroundColor = "#FFF0F5";
                summaryCard.style.borderColor = "#FFB6C1";
            } else {
                summaryCard.style.backgroundColor = "#ffffff";
                summaryCard.style.borderColor = "rgba(226, 231, 244, 0.9)";
            }
        }

        if (cat.id === "heart") {
            summaryLabelEl.textContent = "널 향한 나의 사랑";
        } else {
            summaryLabelEl.textContent = cat.label;
        }

        if (summaryIconImgEl) {
            summaryIconImgEl.src = cat.img;
            summaryIconImgEl.alt = cat.label;
        }

        if (cat.id === "heart") {
            summaryAmountLinkEl.textContent = "";
            summaryRightEl.textContent = "∞";
        } else if (cat.price && amount > 0) {
            const n = amount / cat.price;
            summaryAmountLinkEl.textContent = `${n.toFixed(1)}${cat.unit}`;
            summaryRightEl.textContent = `기준가: ${formatNumber(cat.price)}원`;
        } else if (cat.price && amount === 0) {
            summaryAmountLinkEl.textContent = `0${cat.unit}`;
            summaryRightEl.textContent = `기준가: ${formatNumber(cat.price)}원`;
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
        track.addEventListener("scroll", updateScrollButtons);
        
        track.addEventListener("click", (e) => {
            const chip = e.target.closest(".chip");
            if (!chip) return;
            if (chip.dataset.role === "add-category") {
                openCustomModal();
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

    function showAmountError(msg) {
        if (amountErrorMsg) {
            amountErrorMsg.textContent = msg;
            amountErrorMsg.classList.add("is-visible");
        }
    }

    function hideAmountError() {
        if (amountErrorMsg) {
            amountErrorMsg.classList.remove("is-visible");
        }
    }

    if (amountInput) {
        amountInput.addEventListener("input", function() {
            this.value = this.value.replace(/[^0-9]/g, "");

            let value = parseInt(this.value);
            
            if (value > 2000000) {
                this.value = "2000000"; 
                value = 2000000;
                showAmountError("최대 200만원까지만 가능해요");
            } else {
                hideAmountError();
            }

            updateEqualState();
            updateSummaryCard();
            updateBubbles();
        });
        
        amountInput.addEventListener("change", function() {
            let value = parseInt(this.value.replace(/[^0-9]/g, ""));
            
            if (isNaN(value)) {
                hideAmountError();
                return;
            }

            if (value < 10000) {
                showAmountError("최소 10,000원부터 가능해요");
                this.value = 10000;
            } else if (value > 2000000) {
                showAmountError("최대 200만원까지만 가능해요");
                this.value = 2000000;
            } else {
                hideAmountError();
            }
            
            updateEqualState();
            updateSummaryCard();
            updateBubbles();
        });
        
        amountInput.addEventListener("blur", () => {
            const v = getCurrentAmount();
            if (!v) {
                amountInput.value = "";
            } else {
                amountInput.value = `${formatNumber(v)} 원`;
            }
            const numVal = parseInt(amountInput.value.replace(/[^0-9]/g, ""));
            if(numVal >= 10000 && numVal <= 2000000) {
                hideAmountError();
            }
        });
        
        amountInput.addEventListener("focus", function() {
            this.value = this.value.replace(/[^0-9]/g, "");
        });
    }

    const bubbleContainer = document.getElementById("bubble-container");
    let bubbleEngine = null;
    let bubbleWorld = null;
    let bubbleRunner = null;
    let matterBubbles = [];
    let domBubbles = [];
    let walls = [];

    const BUBBLE_MIN_RADIUS = 12;
    const BUBBLE_MAX_RADIUS = 60;
    const BUBBLE_FILL_RATIO = 0.7;

    let heartInterval = null;
    const appContainer = document.querySelector(".app");
    const globalEffectContainer = document.createElement("div");
    globalEffectContainer.className = "global-effect-container";
    
    if (appContainer) {
        appContainer.appendChild(globalEffectContainer);
    }

    function toggleHeartTheme(isActive) {
        if (!appContainer) return;
        if (isActive) {
            appContainer.classList.add("mode-heart-theme");
            if (!heartInterval) {
                heartInterval = setInterval(() => {
                    createFloatingHeart();
                }, 300);
            }
        } else {
            appContainer.classList.remove("mode-heart-theme");
            if (heartInterval) {
                clearInterval(heartInterval);
                heartInterval = null;
            }
            globalEffectContainer.innerHTML = "";
        }
    }

    function createFloatingHeart() {
        const heart = document.createElement("div");
        heart.className = "floating-heart";
        heart.textContent = ["❤️", "💖", "💕", "💗"][Math.floor(Math.random() * 4)];
        const size = Math.random() * 20 + 10;
        const left = Math.random() * 100;
        const duration = Math.random() * 3 + 4;
        heart.style.left = `${left}%`;
        heart.style.fontSize = `${size}px`;
        heart.style.animationDuration = `${duration}s`;
        globalEffectContainer.appendChild(heart);
        setTimeout(() => {
            heart.remove();
        }, duration * 1000);
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

    function priceToRadiusAndCount(cat) {
        const N = getBubbleCount(cat);
        if (N === 0) return { radius: BUBBLE_MIN_RADIUS, count: 0 };
        const radius = getBubbleRadius(N);
        return { radius, count: N };
    }

    function initBubbleEngine() {
        if (!bubbleContainer || typeof Matter === "undefined") return;
        if (bubbleEngine) return;

        const { Engine, Runner, Events, Body } = Matter;
        bubbleEngine = Engine.create();
        bubbleWorld = bubbleEngine.world;
        bubbleWorld.gravity.y = 0.5;

        bubbleRunner = Runner.create();
        Runner.run(bubbleRunner, bubbleEngine);

        Events.on(bubbleEngine, "afterUpdate", () => {
            const isHeart = (currentCategoryId === "heart");
            const height = bubbleContainer.clientHeight || 260;
            const width = bubbleContainer.clientWidth || 340;

            matterBubbles.forEach((body, idx) => {
                const div = domBubbles[idx];
                if (!div) return;
                const r = body.circleRadius;
                const { x, y } = body.position;
                const angleDeg = (body.angle * 180) / Math.PI;
                div.style.transform = `translate(${x - r}px, ${y - r}px) rotate(${angleDeg}deg)`;

                if (isHeart && y > height + r + 10) {
                    Body.setPosition(body, {
                        x: Math.random() * width,
                        y: -r - 50
                    });
                    Body.setVelocity(body, { x: 0, y: 0 });
                }
            });
        });
    }

    function clearBubbles() {
        if (!bubbleWorld) return;
        const { World } = Matter;
        matterBubbles.forEach((b) => World.remove(bubbleWorld, b));
        walls.forEach((w) => World.remove(bubbleWorld, w));
        matterBubbles = [];
        walls = [];
        domBubbles.forEach((d) => d.remove());
        domBubbles = [];
    }

    function updateBubbles() {
        if (!bubbleContainer || typeof Matter === "undefined") return;
        initBubbleEngine();
        const cat = getPreset(currentCategoryId);
        if (!cat) return;
        toggleHeartTheme(cat.id === "heart");
        clearBubbles();

        const { Bodies, World, Body } = Matter;
        const width = bubbleContainer.clientWidth || 340;
        const height = bubbleContainer.clientHeight || 260;
        const wallOptions = { isStatic: true, render: { visible: false }, restitution: 0.9, friction: 0 };
        const wallThickness = 40;
        const ground = Bodies.rectangle(width / 2, height + wallThickness / 2, width, wallThickness, wallOptions);
        const leftWall = Bodies.rectangle(-wallThickness / 2, height / 2, wallThickness, height, wallOptions);
        const rightWall = Bodies.rectangle(width + wallThickness / 2, height / 2, wallThickness, height, wallOptions);
        walls = [ground, leftWall, rightWall];
        World.add(bubbleWorld, walls);

        const imgPath = cat.img;
        let radius, N;
        if (cat.id === "heart") {
            radius = 12; 
            N = 200; 
        } else {
            const res = priceToRadiusAndCount(cat);
            radius = res.radius;
            N = res.count;
        }

        for (let i = 0; i < N; i++) {
            const x = Math.random() * (width * 0.8) + width * 0.1;
            const y = -Math.random() * 400;
            const body = Bodies.circle(x, y, radius, {
                restitution: 0.7,
                friction: 0.05,
                frictionAir: cat.id === "heart" ? 0.05 : 0.0
            });
            Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.4);
            matterBubbles.push(body);
            const div = document.createElement("div");
            div.className = "bubble";
            div.style.width = `${radius * 2}px`;
            div.style.height = `${radius * 2}px`;
            if (imgPath) div.style.backgroundImage = `url(${imgPath})`;
            bubbleContainer.appendChild(div);
            domBubbles.push(div);
        }
        World.add(bubbleWorld, matterBubbles);
    }

    const overlaySaving = document.querySelector(".overlay-saving");
    const overlayCelebrate = document.querySelector(".overlay-celebrate");
    const overlayCloses = document.querySelectorAll(".overlay-close");
    const overlayResetBtn = document.querySelector(".overlay-reset");

    const ovEls = {
        remain: document.getElementById("overlay-remain"),
        goalName: document.getElementById("overlay-goal-name"),
        saved: document.getElementById("overlay-saved"),
        addAmount: document.getElementById("overlay-add-amount"),
        btnConfirm: document.getElementById("btn-save-confirm"),
        celGoalName: document.getElementById("celebrate-goal-name"),
        celSaved: document.getElementById("celebrate-saved"),
        btnBuy: document.getElementById("btn-go-buy")
    };

    overlayCloses.forEach(btn => {
        btn.addEventListener("click", () => {
            if(overlaySaving) overlaySaving.classList.remove("is-active");
            if(overlayCelebrate) overlayCelebrate.classList.remove("is-active");
        });
    });

    if (overlayResetBtn) {
        overlayResetBtn.addEventListener("click", () => {
            if (confirm("정말 누적 금액을 초기화 하시겠습니까?")) {
                savedAmount = 0;
                updateGoalProgress();
                if(overlaySaving) overlaySaving.classList.remove("is-active");
            }
        });
    }

    function showSavingOverlay(amountToAdd) {
        if (!wishlist) return;
        const currentSaved = savedAmount; 
        const target = wishlist.price;
        const remain = target - currentSaved - amountToAdd; 
        if(ovEls.goalName) ovEls.goalName.textContent = wishlist.name;
        if(ovEls.saved) ovEls.saved.textContent = formatNumber(currentSaved);
        if(ovEls.addAmount) ovEls.addAmount.textContent = formatNumber(amountToAdd);
        if(ovEls.remain) ovEls.remain.textContent = formatNumber(Math.max(0, remain));
        if(overlaySaving) overlaySaving.classList.add("is-active");
        if(ovEls.btnConfirm) {
            ovEls.btnConfirm.onclick = () => {
                savedAmount += amountToAdd;
                updateGoalProgress();
                if(overlaySaving) overlaySaving.classList.remove("is-active");
                if (savedAmount >= target) setTimeout(showCelebrateOverlay, 300);
            };
        }
    }

    function showCelebrateOverlay() {
        if (!wishlist) return;
        if(ovEls.celGoalName) ovEls.celGoalName.textContent = wishlist.name;
        if(ovEls.celSaved) ovEls.celSaved.textContent = formatNumber(savedAmount);
        if(overlayCelebrate) overlayCelebrate.classList.add("is-active");
        if(ovEls.btnBuy) {
            ovEls.btnBuy.onclick = () => {
                if (wishlist.url) window.open(wishlist.url, "_blank");
                else alert("구매 링크가 없습니다.");
            };
        }
    }

    if (equalBtn) {
        equalBtn.addEventListener("click", () => {
            const amount = getCurrentAmount();
            if (amount > 0) showSavingOverlay(amount);
        });
    }

    window.initValueCalculator = function ({ loggedIn = false, wishlist: initialWishlist = null, savedAmount: initialSaved = 0 } = {}) {
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

    renderCategories();
    updateSummaryCard();
    updateEqualState();
    updateBubbles();

    const MOCK_MODE = "goal-empty";
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