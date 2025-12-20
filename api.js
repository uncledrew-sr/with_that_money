const ApiService = {
    getHeaders: () => {
        const token = localStorage.getItem("accessToken");
        const headers = {
            "Content-Type": "application/json"
        };
        if (token && token !== "null" && token !== "undefined") {
            headers["Authorization"] = `Bearer ${token}`;
        }
        return headers;
    },

    updateUnit: async (unitId, iconId, unitName, unitPrice, unitCounter) => {
        const response = await fetch(`${CONFIG.API_BASE_URL}/api/units/${unitId}`, {
            method: "PUT",
            headers: ApiService.getHeaders(),
            body: JSON.stringify({ 
                iconId,
                unitName,
                unitPrice,
                unitCounter
            })
        });
        
        if (ApiService.handleAuthError(response.status)) throw new Error("인증 실패");
        if (!response.ok) throw new Error("수정 실패");
        
        return await response.json();
    },

    handleAuthError: (status) => {
        if (status === 401 || status === 403) {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            return true; 
        }
        return false;
    },

    getKakaoLoginUrl: async () => {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/api/auth/kakao/login`);
            if (response.ok) return await response.text();
        } catch (e) {
            console.error(e);
        }
        return null;
    },

    loginWithCode: async (code) => {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/api/auth/kakao/callback?code=${code}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });

            if (!response.ok) throw new Error("Login failed");
            
            const data = await response.json();
            
            if (data.accessToken) localStorage.setItem("accessToken", data.accessToken);
            if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);
            
            return data;
        } catch (e) {
            console.error(e);
            return null;
        }
    },

    getWishlist: async () => {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/api/wishlists/my/in-progress`, {
                method: "GET",
                headers: ApiService.getHeaders()
            });

            if (ApiService.handleAuthError(response.status)) return null;
            if (!response.ok) return null;

            return await response.json(); 
        } catch (e) {
            return null;
        }
    },

    createWishlist: async (itemName, targetPrice, itemUrl) => {
        const response = await fetch(`${CONFIG.API_BASE_URL}/api/wishlists`, {
            method: "POST",
            headers: ApiService.getHeaders(),
            body: JSON.stringify({ itemName, targetPrice, itemUrl })
        });
        
        if (ApiService.handleAuthError(response.status)) throw new Error("인증 실패");
        if (!response.ok) throw new Error("생성 실패");
        
        return await response.json();
    },

    updateWishlist: async (wishlistId, itemName, targetPrice, itemUrl) => {
        const response = await fetch(`${CONFIG.API_BASE_URL}/api/wishlists/${wishlistId}`, {
            method: "PUT",
            headers: ApiService.getHeaders(),
            body: JSON.stringify({ itemName, targetPrice, itemUrl })
        });

        if (ApiService.handleAuthError(response.status)) throw new Error("인증 실패");
        if (!response.ok) throw new Error("수정 실패");
        
        return await response.json();
    },

    deleteWishlist: async (wishlistId) => {
        const response = await fetch(`${CONFIG.API_BASE_URL}/api/wishlists/${wishlistId}`, {
            method: "DELETE",
            headers: ApiService.getHeaders()
        });
        
        if (ApiService.handleAuthError(response.status)) return false;
        return response.ok;
    },

    addAmount: async (wishlistId, amount) => {
        const response = await fetch(`${CONFIG.API_BASE_URL}/api/savings`, {
            method: "POST",
            headers: ApiService.getHeaders(),
            body: JSON.stringify({ wishlistId, amount })
        });

        if (ApiService.handleAuthError(response.status)) throw new Error("인증 실패");
        return await response.json();
    },

    getAllUnits: async () => {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/api/units/all`, {
                method: "GET",
                headers: ApiService.getHeaders()
            });
            
            if (ApiService.handleAuthError(response.status)) return [];
            if (!response.ok) return [];
            
            return await response.json();
        } catch (e) { 
            console.error(e); 
        }
        return [];
    },

    getUnitIcons: async () => {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/api/units/icons`, {
                method: "GET",
                headers: ApiService.getHeaders()
            });
            
            if (ApiService.handleAuthError(response.status)) return [];
            if (response.ok) return await response.json();
        } catch (e) { console.error(e); }
        return [];
    },

    createUnit: async (iconId, unitName, unitPrice, unitCounter) => {
        const response = await fetch(`${CONFIG.API_BASE_URL}/api/units`, {
            method: "POST",
            headers: ApiService.getHeaders(),
            body: JSON.stringify({ 
                iconId,
                unitName,
                unitPrice,
                unitCounter
            })
        });
        
        if (ApiService.handleAuthError(response.status)) throw new Error("인증 실패");
        return await response.json();
    },

    deleteUnit: async (unitId) => {
        const response = await fetch(`${CONFIG.API_BASE_URL}/api/units/${unitId}`, {
            method: "DELETE",
            headers: ApiService.getHeaders()
        });
        
        if (ApiService.handleAuthError(response.status)) return false;
        return response.ok;
    }
};