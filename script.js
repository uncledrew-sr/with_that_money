document.addEventListener("DOMContentLoaded", async () => {
    function debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    }

    const urlParams = new URLSearchParams(window.location.search);
    const authCode = urlParams.get("code");

    if (authCode) {
        try {
            const loginData = await ApiService.loginWithCode(authCode);
            if (loginData) {
                alert("로그인 되었습니다!");
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        } catch (error) {
            console.error(error);
        }
    }

    const loginBtn = document.getElementById("btn-kakao-login");

    if (loginBtn) {
        loginBtn.addEventListener("click", async () => {
            try {
                const responseData = await ApiService.getKakaoLoginUrl();
                
                let data = null;
                try {
                    data = JSON.parse(responseData);
                } catch (e) {}

                if (data && data.accessToken) {
                    localStorage.setItem("accessToken", data.accessToken);
                    if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);
                    alert(`반갑습니다, ${data.nickname || '회원'}님! 로그인 되었습니다.`);
                    window.location.reload();
                    return;
                }

                if (data && data.url) {
                    window.location.href = data.url;
                    return;
                }
                if (typeof responseData === 'string' && responseData.startsWith("http")) {
                    window.location.href = responseData;
                    return;
                }

                window.location.href = `${CONFIG.API_BASE_URL}/api/auth/kakao/login`;

            } catch (err) {
                console.error(err);
                window.location.href = `${CONFIG.API_BASE_URL}/api/auth/kakao/login`;
            }
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

    const HEART_PRESET = {
        id: "heart",
        label: "하트",
        price: null,
        unit: "",
        img: "images/bubble/bubble-heart.png", 
        icon: "images/heart.png",            
        isDefault: true
    };

    let allCategories = [HEART_PRESET];
    let currentCategoryId = null;
    let currentWishlistId = null;

    function getFullImageUrl(path) {
        if (!path) return "https://placehold.co/100x100?text=No+Image";
        if (path.startsWith("http") || path.startsWith("data:")) return path;
        if (path.startsWith("images/")) return path;

        let cleanPath = path.replace(/\\/g, "/");
        if (!cleanPath.startsWith("/")) cleanPath = "/" + cleanPath;

        return `${CONFIG.API_BASE_URL}${cleanPath}`;
    }

    function handleImageError(imgElement) {
        imgElement.onerror = null;
        imgElement.src = "https://placehold.co/100x100?text=Error";
    }

    async function fetchAndRenderCategories() {
        const units = await ApiService.getAllUnits();
        
        if (units && units.length > 0) {
            const serverCategories = units.map(u => ({
                id: u.unitId,
                label: u.unitName,
                price: u.unitPrice,
                unit: u.unitCounter,
                img: getFullImageUrl(u.iconPath), 
                icon: getFullImageUrl(u.iconPath),
                isDefault: u.isDefault
            }));
            allCategories = [...serverCategories, HEART_PRESET];
        } else {
            allCategories = [HEART_PRESET];
        }

        if (!currentCategoryId && allCategories.length > 0) {
            currentCategoryId = allCategories[0].id;
        }

        renderCategories();
        updateSummaryCard();
        updateBubbles();
    }

    function getPreset(id) {
        return allCategories.find(c => c.id == id) || allCategories[0];
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
            if (wishSaveBtn) wishSaveBtn.textContent = "위시리스트 수정하기";
        } else {
            if (wishSaveBtn) wishSaveBtn.textContent = "위시리스트 저장하기";
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
        else if (name.length > 20) {
            valid = false;
            if (wishNameErrorEl) wishNameErrorEl.textContent = "상품명은 20자 이하여야 합니다.";
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
        wishlistForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            if (!validateWishlistForm(true)) return;
            
            const name = wishNameInput.value.trim();
            const price = parseInt(wishPriceInput.value.replace(/[^0-9]/g, ""), 10);
            const url = wishUrlInput ? wishUrlInput.value.trim() : "";

            try {
                let responseData;
                
                if (currentWishlistId) {
                    responseData = await ApiService.updateWishlist(currentWishlistId, name, price, url);
                    alert("목표가 수정되었습니다!");
                } else {
                    responseData = await ApiService.createWishlist(name, price, url);
                    alert("목표가 저장되었습니다!");
                }

                if (responseData && responseData.wishlistId) {
                    currentWishlistId = responseData.wishlistId;
                }
                
                wishlist = { name, price, url };
                setWishlistButtonLabel();
                updateGoalProgress();
                closeWishlistModal();
                
            } catch (err) {
                console.error(err);
                alert("처리에 실패했습니다.");
            }
        });
    }

    const customModal = document.querySelector(".custom-modal");
    const customCloseBtn = customModal ? customModal.querySelector(".custom-modal-close") : null;
    const customForm = customModal ? customModal.querySelector(".custom-form") : null;
    const customNameInput = customModal ? customModal.querySelector("#custom-name") : null;
    const customUnitInput = customModal ? customModal.querySelector("#custom-unit") : null;
    const customPriceInput = customModal ? customModal.querySelector("#custom-price") : null;
    const customSubmitBtn = customModal ? customModal.querySelector(".custom-submit") : null;
    const iconGrid = customModal ? customModal.querySelector(".icon-grid") : null;

    const MAX_PRICE_LIMIT = 2000000;
    const MIN_PRICE_LIMIT = 10000;
    const MAX_NAME_LENGTH = 10;
    const MAX_UNIT_LENGTH = 3;

    async function openCustomModal() {
        if (!customModal) return;
        
        if(customNameInput) customNameInput.value = "";
        if(customUnitInput) customUnitInput.value = "";
        if(customPriceInput) customPriceInput.value = "";
        
        if (iconGrid) {
            iconGrid.innerHTML = "로딩 중...";
            const icons = await ApiService.getUnitIcons();
            iconGrid.innerHTML = "";

            if (icons && icons.length > 0) {
                icons.forEach((icon, index) => {
                    const label = document.createElement("label");
                    label.className = "icon-option";
                    
                    const input = document.createElement("input");
                    input.type = "radio";
                    input.name = "custom-icon";
                    input.value = icon.iconId;
                    if (index === 0) input.checked = true;

                    const div = document.createElement("div");
                    div.className = "icon-circle";
                    
                    const img = document.createElement("img");
                    img.src = getFullImageUrl(icon.iconPath);
                    img.alt = icon.iconName;
                    img.onerror = () => handleImageError(img);

                    div.appendChild(img);
                    label.appendChild(input);
                    label.appendChild(div);
                    iconGrid.appendChild(label);
                });
            } else {
                iconGrid.innerHTML = "아이콘을 불러오지 못했습니다.";
            }
        }

        customModal.classList.add("is-open");
        validateCustomForm();
    }

    function closeCustomModal() {
        if(customModal) customModal.classList.remove("is-open");
    }

    function validateCustomForm() {
        if(!customNameInput || !customPriceInput || !customUnitInput || !customSubmitBtn) return;
        
        const name = customNameInput.value.trim();
        const unit = customUnitInput.value.trim();
        const priceStr = customPriceInput.value.replace(/[^0-9]/g, "");
        const price = parseInt(priceStr, 10);

        let valid = true;
        
        if(!name || name.length > MAX_NAME_LENGTH) valid = false;
        if(!unit || unit.length > MAX_UNIT_LENGTH) valid = false;

        if(!priceStr || isNaN(price) || price < MIN_PRICE_LIMIT || price > MAX_PRICE_LIMIT) valid = false;

        customSubmitBtn.disabled = !valid;
        customSubmitBtn.classList.toggle("is-active", valid);
    }

    if (customCloseBtn) customCloseBtn.addEventListener("click", closeCustomModal);
    
    [customNameInput, customUnitInput].forEach(input => {
        if(input) input.addEventListener("input", validateCustomForm);
    });

    if (customPriceInput) {
        customPriceInput.addEventListener("input", function() {
            this.value = this.value.replace(/[^0-9]/g, "");
            
            let val = parseInt(this.value, 10);
            if (!isNaN(val) && val > MAX_PRICE_LIMIT) {
                this.value = MAX_PRICE_LIMIT.toString();
            }
            validateCustomForm();
        });
        
        customPriceInput.addEventListener("blur", function() {
            let val = parseInt(this.value.replace(/[^0-9]/g, ""), 10);
            if (!isNaN(val) && val > 0) {
                this.value = `${formatNumber(val)}원`;
            } else {
                this.value = "";
            }
            validateCustomForm();
        });
        
        customPriceInput.addEventListener("focus", function() {
            this.value = this.value.replace(/[^0-9]/g, "");
        });
    }

    if(customForm) {
        customForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const name = customNameInput.value.trim();
            const unitVal = customUnitInput.value.trim();
            const price = parseInt(customPriceInput.value.replace(/[^0-9]/g, ""), 10);
            const selectedInput = document.querySelector("input[name='custom-icon']:checked");
            
            if (!selectedInput) return alert("아이콘을 선택해주세요.");
            
            const iconId = parseInt(selectedInput.value, 10);

            try {
                await ApiService.createUnit(iconId, name, price, unitVal);
                await fetchAndRenderCategories();
                closeCustomModal();
                alert("새로운 단위가 추가되었습니다!");
            } catch (err) {
                console.error(err);
                alert("단위 추가에 실패했습니다.");
            }
        });
    }

    const track = document.getElementById("category-track");
    const btnLeft = document.querySelector(".carousel-arrow-left");
    const btnRight = document.querySelector(".carousel-arrow-right");

    const amountInput = document.querySelector(".amount-input");
    const equalBtn = document.querySelector(".amount-equal-btn");
    const summaryCard = document.querySelector(".summary-card");
    const summaryLabelEl = document.querySelector(".summary-label");
    const summaryNumEl = document.getElementById("summary-num");
    const summaryUnitEl = document.getElementById("summary-unit");
    const summaryRightEl = document.querySelector(".summary-right");
    const summaryIconImgEl = document.querySelector(".summary-icon-img");

    const SCROLL_AMOUNT = 140;
    const DEFAULT_AMOUNT = 100000;

    function renderCategories() {
        if (!track) return;
        track.innerHTML = "";
        
        allCategories.forEach((cat) => {
            const btn = document.createElement("button");
            btn.type = "button";
            
            const isActive = (cat.id == currentCategoryId);
            const isCustom = (cat.isDefault === false);

            btn.className = `chip ${isActive ? 'chip-active' : ''} ${isCustom ? 'chip-custom' : ''}`;
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

    const debouncedCalculate = debounce(async (amount, unitId) => {
        if (unitId === "heart") return;

        const resultData = await ApiService.calculate(amount, unitId);
        
        if (resultData) {
            const targetVal = resultData.result; 
            const currentText = summaryNumEl.textContent.replace(/[^0-9.]/g, "");
            const startVal = parseFloat(currentText) || 0;
            animateFloat(summaryNumEl, startVal, targetVal, 500);

            if(summaryUnitEl) summaryUnitEl.textContent = resultData.unitCounter || "";
            if(summaryRightEl) summaryRightEl.textContent = `기준가: ${formatNumber(resultData.unitPrice)}원`;
        } else {
            const cat = getPreset(unitId);
            if (cat && cat.price > 0) {
                const targetVal = amount / cat.price;
                const currentText = summaryNumEl.textContent.replace(/[^0-9.]/g, "");
                const startVal = parseFloat(currentText) || 0;
                animateFloat(summaryNumEl, startVal, targetVal, 500);

                if(summaryUnitEl) summaryUnitEl.textContent = cat.unit || "";
                if(summaryRightEl) summaryRightEl.textContent = `기준가: ${formatNumber(cat.price)}원`;
            }
        }
    }, 300);

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
            summaryLabelEl.classList.add("special-heart-text");
            if(summaryNumEl) summaryNumEl.textContent = "";
            if(summaryUnitEl) summaryUnitEl.textContent = "";
            summaryRightEl.textContent = "∞";
        } else {
            summaryLabelEl.textContent = cat.label;
            summaryLabelEl.classList.remove("special-heart-text");
        }

        if (summaryIconImgEl) {
            summaryIconImgEl.src = getFullImageUrl(cat.icon || cat.img);
            summaryIconImgEl.alt = cat.label;
            summaryIconImgEl.onerror = () => handleImageError(summaryIconImgEl);
        }

        if (cat.id !== "heart" && amount >= 0) {
            debouncedCalculate(amount, cat.id);
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
        
        track.addEventListener("click", async (e) => {
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
            
            if (value > MAX_PRICE_LIMIT) {
                this.value = MAX_PRICE_LIMIT.toString(); 
                value = MAX_PRICE_LIMIT;
                showAmountError("최대 200만원까지만 가능해요");
            } else {
                hideAmountError();
            }

            updateEqualState();
            updateBubbles(); 
            updateSummaryCard(); 
        });
        
        amountInput.addEventListener("change", function() {
            let value = parseInt(this.value.replace(/[^0-9]/g, ""));
            if (isNaN(value)) { hideAmountError(); return; }

            if (value < MIN_PRICE_LIMIT) {
                showAmountError("최소 10,000원부터 가능해요");
                this.value = MIN_PRICE_LIMIT;
            } else if (value > MAX_PRICE_LIMIT) {
                showAmountError("최대 200만원까지만 가능해요");
                this.value = MAX_PRICE_LIMIT;
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
            if(numVal >= MIN_PRICE_LIMIT && numVal <= MAX_PRICE_LIMIT) {
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
        
        if (cat.id === "heart") {
            walls = [leftWall, rightWall];
        } else {
            walls = [ground, leftWall, rightWall];
        }

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
        if (!wishlist || !currentWishlistId) {
            if (!wishlist) return;
            alert("목표 정보가 정확하지 않습니다. 페이지를 새로고침 해주세요.");
            return;
        }
        const currentSaved = savedAmount; 
        const target = wishlist.price;
        const remain = target - currentSaved - amountToAdd; 
        if(ovEls.goalName) ovEls.goalName.textContent = wishlist.name;
        if(ovEls.saved) ovEls.saved.textContent = formatNumber(currentSaved);
        if(ovEls.addAmount) ovEls.addAmount.textContent = formatNumber(amountToAdd);
        if(ovEls.remain) ovEls.remain.textContent = formatNumber(Math.max(0, remain));
        if(overlaySaving) overlaySaving.classList.add("is-active");
        if(ovEls.btnConfirm) {
            ovEls.btnConfirm.onclick = async () => {
                try {
                    await ApiService.addAmount(currentWishlistId, amountToAdd);
                    savedAmount += amountToAdd;
                    updateGoalProgress();
                    if(overlaySaving) overlaySaving.classList.remove("is-active");
                    if (savedAmount >= target) setTimeout(showCelebrateOverlay, 300);
                } catch(err) {
                    alert("저축 처리에 실패했습니다.");
                }
            };
        }
    }

    function showCelebrateOverlay() {
        if (!wishlist) return;
        if(ovEls.celGoalName) ovEls.celGoalName.textContent = wishlist.name;
        if(ovEls.celSaved) ovEls.celSaved.textContent = formatNumber(savedAmount);
        if(overlayCelebrate) overlayCelebrate.classList.add("is-active");

        confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
        });
        function fire(ratio, opt) {
            confetti(Object.assign({}, opt, {
                origin: { y: 0.7 },
                particleCount: Math.floor(200 * ratio)
            }));
        }
        fire(0.25, { spread: 26, startVelocity: 55, decay: 0.95, scalar: 1.2 });
        fire(0.2, { spread: 60 });

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

    await fetchAndRenderCategories();

    const token = localStorage.getItem("accessToken");
    if (token) {
        const myData = await ApiService.getWishlist();
        if (myData) {
            currentWishlistId = myData.wishlistId;
            initValueCalculator({
                loggedIn: true,
                wishlist: { 
                    name: myData.itemName,
                    price: myData.targetPrice,
                    url: myData.itemUrl || ""
                },
                savedAmount: myData.currentAmount || 0
            });
        } else {
            initValueCalculator({ loggedIn: true, wishlist: null });
        }
    } else {
        initValueCalculator({ loggedIn: false });
    }
});

function animateValue(obj, start, end, duration, unit = "") {
    if (!obj) return;
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        
        const currentVal = Math.floor(progress * (end - start) + start);
        obj.textContent = `${currentVal.toLocaleString()}${unit}`;
        
        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            obj.textContent = `${end.toLocaleString()}${unit}`;
        }
    };
    window.requestAnimationFrame(step);
}

function animateFloat(obj, start, end, duration) {
    if (!obj) return;
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        
        const currentVal = progress * (end - start) + start;
        
        obj.textContent = `${currentVal.toFixed(1)}`;
        
        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            obj.textContent = `${end.toFixed(1)}`;
        }
    };
    window.requestAnimationFrame(step);
}