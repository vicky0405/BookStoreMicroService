import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/AuthService';
import { getCart, addToCart as addToCartApi } from '../services/CartService';
import GuestCart from '../utils/GuestCart';
import { debugLog } from '../utils/axiosInstance';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    // Khởi tạo user ngay từ localStorage để tránh trạng thái null tạm thời khi reload
    const [user, setUser] = useState(() => {
        try {
            const storedUser = localStorage.getItem('user');
            if (!storedUser) return null;
            const parsed = JSON.parse(storedUser);
            if (parsed && typeof parsed === 'object' && (parsed.id || parsed.username)) {
                return parsed;
            }
            return null;
        } catch {
            return null;
        }
    });
    const [cartItemCount, setCartItemCount] = useState(0);
    const [loading, setLoading] = useState(true);   
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        
        if (storedUser) {
            try {
                const parsed = JSON.parse(storedUser);
                if (parsed && typeof parsed === "object" && (parsed.id || parsed.username)) {
                    if (storedToken) {
                        // Validate token với server
                        authService.validateToken()
                            .then(serverUser => {
                                // Kiểm tra tài khoản có bị khóa không
                                if (serverUser.is_active === 0) {
                                    localStorage.removeItem('user');
                                    localStorage.removeItem('token');
                                    setUser(null);
                                    alert('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.');
                                } else {
                                    // Token hợp lệ, set user
                                    setUser(parsed);
                                }
                            })
                            .catch((err) => {
                                // Token không hợp lệ hoặc hết hạn - XÓA user và token
                                console.warn('Token validation failed, clearing auth data:', err.message);
                                localStorage.removeItem('user');
                                localStorage.removeItem('token');
                                setUser(null);
                            })
                            .finally(() => {
                                setLoading(false);
                            });
                    } else {
                        // Có user nhưng không có token - xóa user
                        console.warn('User exists but no token found, clearing user data');
                        localStorage.removeItem('user');
                        setUser(null);
                        setLoading(false);
                    }
                } else {
                    // User data không hợp lệ
                    localStorage.removeItem('user');
                    localStorage.removeItem('token');
                    setUser(null);
                    setLoading(false);
                }
            } catch (e) {
                // Parse error
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                setUser(null);
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user) {
            loadCartCount();
        } else {
            // dùng guest cart count khi chưa đăng nhập
            setCartItemCount(GuestCart.countItems());
        }
    }, [user]);

    const loadCartCount = async () => {
        if (!user) return;
        try {
            const response = await getCart();
            if (response.success) {
                
                setCartItemCount(response.data.length);
            } else {
                setCartItemCount(0);
            }
        } catch (error) {
            console.error('Error loading cart count:', error);
            setCartItemCount(0);
        }
    };

    const getRoleBasedRedirect = () => {
        if (!user) return '/';
        const roleId = user.role_id || (user.role === 'ADMIN' ? 1 : user.role === 'SALESPERSON' ? 2 : user.role === 'INVENTORY' ? 3 : 0);

        switch (roleId) {
            case 1:
                return '/admin'; 
            case 2:
                return '/sales'; 
            case 3:
                return '/inventory'; 
            case 5:
                return '/order-manager'; 
            case 6:
                return '/shipper'; 
            default:
                return '/';
        }
    };

    const getRoleLabel = (roleId) => {
        switch (roleId) {
            case 1:
                return 'Quản trị viên';
            case 2:
                return 'Nhân viên bán hàng';
            case 3:
                return 'Nhân viên thủ kho';
            default:
                return 'Người dùng';
        }
    };    // Login function
    const login = async (username, password) => {
        try {
            
            debugLog("[AUTH CONTEXT] Attempting login to API via authService", { username });
            const response = await authService.login(username, password);
            debugLog("[AUTH CONTEXT] Response received", { hasUser: !!response?.user, hasToken: !!response?.token });

            if (!response) {
                throw new Error('No data received from server');
            }

            const userData = response.user || response;
            const token = response.token;

            debugLog("[AUTH CONTEXT] User data parsed", { 
                userId: userData?.id, 
                username: userData?.username,
                roleId: userData?.role_id 
            });
            debugLog("[AUTH CONTEXT] Token received", { hasToken: !!token });

            // Kiểm tra userData hợp lệ
            if (!userData || typeof userData !== "object" || (!userData.id && !userData.username)) {
                throw new Error('Dữ liệu người dùng không hợp lệ');
            }
            
            // Map role_id to role string for compatibility with routes
            if (userData.role_id && !userData.role) {
                const roleMap = {
                    1: 'ADMIN',
                    2: 'SALESPERSON',
                    3: 'INVENTORY',
                    4: 'CUSTOMER',
                    5: 'ORDER_MANAGER',
                    6: 'SHIPPER'
                };
                userData.role = roleMap[userData.role_id] || 'CUSTOMER';
            }
            
            // Kiểm tra tài khoản có bị khóa không
            if (userData.is_active === 0) {
                throw new Error('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.');
            }
            
            debugLog("[AUTH CONTEXT] Login successful, processed user data", { 
                userId: userData.id,
                role: userData.role,
                isActive: userData.is_active
            });

            // QUAN TRỌNG: Lưu token NGAY LẬP TỨC trước khi làm bất cứ việc gì khác
            // authService.login đã lưu token rồi, nhưng đảm bảo chắc chắn ở đây
            if (token) {
                debugLog("[AUTH CONTEXT] Saving token to localStorage", {});
                localStorage.setItem('token', token);
            }
            
            // Lưu user vào localStorage
            debugLog("[AUTH CONTEXT] Saving user to localStorage", {});
            localStorage.setItem('user', JSON.stringify(userData));
            
            // Set user state
            debugLog("[AUTH CONTEXT] Setting user state", {});
            setUser(userData);

            // Merge guest cart -> server cart (best-effort)
            // Bọc trong try-catch riêng để không ảnh hưởng đến login flow
            try {
                debugLog("[AUTH CONTEXT] Starting guest cart merge after login", {});
                const guestItems = GuestCart.getItems();
                if (Array.isArray(guestItems) && guestItems.length > 0) {
                    for (const it of guestItems) {
                        try {
                            if (it && it.bookID && it.quantity > 0) {
                                debugLog("[AUTH CONTEXT] Merging guest item", { bookID: it.bookID, quantity: it.quantity });
                                await addToCartApi(it.bookID, it.quantity);
                            }
                        } catch (e) {
                            console.warn('Merge guest cart item failed', it, e?.response?.data || e?.message);
                        }
                    }
                    // clear guest cart sau khi merge
                    GuestCart.clear();
                    debugLog("[AUTH CONTEXT] Guest cart cleared after merge", {});
                }
                // load lại số lượng giỏ từ server
                await loadCartCount();
                debugLog("[AUTH CONTEXT] Cart count loaded after login", { count: cartItemCount });
            } catch (cartError) {
                console.warn('Cart operations failed after login, but login succeeded:', cartError);
                setCartItemCount(0);
            }

            debugLog("[AUTH CONTEXT] Login completed successfully - returning user data", {});

            return userData;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    // Logout function
    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        // tùy chọn: giữ nguyên guest cart (không clear) để người dùng tiếp tục mua như khách
        setCartItemCount(GuestCart.countItems());
    };

    const updateCartCount = (newCount) => {
        setCartItemCount(newCount);
    };

    const value = {
        user,
        loading,
        login,
        logout,
        getRoleBasedRedirect,
        getRoleLabel,
        cartItemCount,
        updateCartCount,
        loadCartCount,
        // Thêm cờ isAuthenticated cho các route bảo vệ
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;