// ============ BASE DE DATOS ============
let users = JSON.parse(localStorage.getItem('linca_users')) || [];
let products = JSON.parse(localStorage.getItem('linca_products')) || [];
let currentUser = JSON.parse(localStorage.getItem('linca_currentUser')) || null;
let favorites = JSON.parse(localStorage.getItem('linca_favorites')) || [];
let purchases = JSON.parse(localStorage.getItem('linca_purchases')) || [];
let cart = JSON.parse(localStorage.getItem('linca_cart')) || [];
let messages = JSON.parse(localStorage.getItem('linca_messages')) || [];

// ============ PRODUCTOS DE EJEMPLO ============
if (products.length === 0) {
    products = [
        { id: 1, name: "iPhone 12 Pro", price: 699, category: "Electrónica", image: "", seller: "Carlos Méndez", sellerId: 1, sellerAvatar: "https://randomuser.me/api/portraits/men/32.jpg", date: new Date().toISOString() },
        { id: 2, name: "Zapatos Nike Air Max", price: 129, category: "Ropa", image: "", seller: "Ana Rodríguez", sellerId: 2, sellerAvatar: "https://randomuser.me/api/portraits/women/44.jpg", date: new Date().toISOString() },
        { id: 3, name: "Sofá Seccional", price: 899, category: "Hogar", image: "", seller: "Miguel Torres", sellerId: 3, sellerAvatar: "https://randomuser.me/api/portraits/men/45.jpg", date: new Date().toISOString() }
    ];
    localStorage.setItem('linca_products', JSON.stringify(products));
}

// ============ FUNCIONES DE GUARDADO ============
function saveUsers() { localStorage.setItem('linca_users', JSON.stringify(users)); }
function saveProducts() { localStorage.setItem('linca_products', JSON.stringify(products)); }
function saveCurrentUser() { localStorage.setItem('linca_currentUser', JSON.stringify(currentUser)); }
function saveFavorites() { localStorage.setItem('linca_favorites', JSON.stringify(favorites)); }
function savePurchases() { localStorage.setItem('linca_purchases', JSON.stringify(purchases)); }
function saveCart() { localStorage.setItem('linca_cart', JSON.stringify(cart)); }
function saveMessages() { localStorage.setItem('linca_messages', JSON.stringify(messages)); }

// ============ RENDERIZAR PRODUCTOS ============
function renderProducts(filter = "") {
    const grid = document.getElementById("productsGrid");
    if (!grid) return;
    
    let filtered = [...products];
    if (filter) {
        filtered = filtered.filter(p => p.name.toLowerCase().includes(filter.toLowerCase()));
    }
    
    if (filtered.length === 0) {
        grid.innerHTML = '<div style="text-align:center; padding:40px;">No hay productos en Linca 😢</div>';
        return;
    }
    
    grid.innerHTML = filtered.map(prod => `
        <div class="product-card">
            ${prod.image ? `<img src="${prod.image}" alt="${prod.name}">` : `<div class="no-image">📦 ${prod.name}</div>`}
            <div class="product-info">
                <div class="product-title">${prod.name}</div>
                <div class="product-price">$${prod.price} USD</div>
                <div class="product-seller">
                    <img src="${prod.sellerAvatar}" style="width:24px;height:24px;border-radius:50%">
                    ${prod.seller}
                </div>
                <button class="buy-btn" onclick="openPaymentModal(${prod.id})">Comprar</button>
            </div>
        </div>
    `).join('');
}

// ============ FILTRAR POR CATEGORÍA ============
function filterByCategory(category) {
    document.getElementById("favoritesSection").style.display = "none";
    document.getElementById("purchasesSection").style.display = "none";
    document.getElementById("messagesSection").style.display = "none";
    document.getElementById("cartSection").style.display = "none";
    document.getElementById("homeSection").style.display = "block";
    
    const grid = document.getElementById("productsGrid");
    const filtered = products.filter(p => p.category === category);
    
    if (filtered.length === 0) {
        grid.innerHTML = `<div style="text-align:center; padding:40px;">No hay productos en ${category} 😢</div>`;
        return;
    }
    
    grid.innerHTML = filtered.map(prod => `
        <div class="product-card">
            ${prod.image ? `<img src="${prod.image}" alt="${prod.name}">` : `<div class="no-image">📦 ${prod.name}</div>`}
            <div class="product-info">
                <div class="product-title">${prod.name}</div>
                <div class="product-price">$${prod.price} USD</div>
                <div class="product-seller">${prod.seller}</div>
                <button class="buy-btn" onclick="openPaymentModal(${prod.id})">Comprar</button>
            </div>
        </div>
    `).join('');
}

// ============ FAVORITOS ============
function renderFavorites() {
    const container = document.getElementById("favoritesContainer");
    if (!container) return;
    
    const favProducts = products.filter(p => favorites.includes(p.id));
    
    if (favProducts.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:40px;">No tienes favoritos aún 🤍</div>';
        return;
    }
    
    container.innerHTML = favProducts.map(prod => `
        <div class="product-card">
            ${prod.image ? `<img src="${prod.image}">` : `<div class="no-image">📦 ${prod.name}</div>`}
            <div class="product-info">
                <div class="product-title">${prod.name}</div>
                <div class="product-price">$${prod.price} USD</div>
                <button class="buy-btn" onclick="openPaymentModal(${prod.id})">Comprar</button>
            </div>
        </div>
    `).join('');
}

function toggleFavorite(productId) {
    if (!currentUser) {
        showNotification("Inicia sesión para guardar favoritos", "error");
        openLoginModal();
        return;
    }
    
    const index = favorites.indexOf(productId);
    if (index === -1) {
        favorites.push(productId);
        showNotification("✅ Añadido a favoritos", "success");
    } else {
        favorites.splice(index, 1);
        showNotification("❌ Eliminado de favoritos", "info");
    }
    saveFavorites();
    renderProducts();
}

// ============ COMPRAS ============
function renderPurchases() {
    const container = document.getElementById("purchasesContainer");
    if (!container) return;
    
    if (purchases.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:40px;">No has realizado compras aún 📦</div>';
        return;
    }
    
    container.innerHTML = purchases.map(purchase => `
        <div class="purchase-card">
            <div style="flex:1">
                <h4>${purchase.name}</h4>
                <p>$${purchase.price} USD</p>
                <p style="font-size:12px;color:#666">Comprado: ${purchase.date}</p>
            </div>
            <span class="status delivered">✅ Entregado</span>
        </div>
    `).join('');
}

// ============ CARRITO ============
function renderCart() {
    const container = document.getElementById("cartContainer");
    if (!container) return;
    
    if (cart.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:40px;">Carrito vacío 🛒</div>';
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    
    container.innerHTML = `
        ${cart.map(item => `
            <div class="cart-item">
                <div style="flex:1">
                    <h4>${item.name}</h4>
                    <p>$${item.price} USD</p>
                </div>
                <button onclick="removeFromCart(${item.id})" class="remove-btn">❌</button>
            </div>
        `).join('')}
        <div class="cart-total">
            <strong>Total: $${total} USD</strong>
            <button onclick="checkout()" class="checkout-btn">Proceder al pago</button>
        </div>
    `;
}

function addToCart(productId) {
    if (!currentUser) {
        showNotification("Inicia sesión para añadir al carrito", "error");
        openLoginModal();
        return;
    }
    
    const product = products.find(p => p.id === productId);
    if (cart.find(item => item.id === productId)) {
        showNotification("Ya está en el carrito", "info");
        return;
    }
    
    cart.push({...product, quantity: 1});
    saveCart();
    updateCartCount();
    showNotification("✅ Añadido al carrito", "success");
    renderCart();
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartCount();
    renderCart();
}

function updateCartCount() {
    const count = document.getElementById("cartCount");
    if (count) count.innerText = cart.length;
}

function checkout() {
    if (cart.length === 0) return;
    
    cart.forEach(item => {
        purchases.push({
            ...item,
            date: new Date().toLocaleString()
        });
    });
    
    savePurchases();
    cart = [];
    saveCart();
    updateCartCount();
    showNotification("🎉 Compra realizada con éxito!", "success");
    renderCart();
    renderPurchases();
}

// ============ MENSAJES ============
function renderMessages() {
    const container = document.getElementById("messagesContainer");
    if (!container) return;
    
    if (messages.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:40px;">No hay mensajes aún 💬</div>';
        return;
    }
    
    container.innerHTML = messages.map(msg => `
        <div class="message-card ${msg.userId === currentUser?.id ? 'sent' : 'received'}">
            <strong>${msg.userName}:</strong>
            <p>${msg.message}</p>
            <small>${msg.date}</small>
        </div>
    `).join('');
}

function sendMessage() {
    const input = document.getElementById("messageInput");
    if (!input || !input.value.trim()) {
        showNotification("Escribe un mensaje", "error");
        return;
    }
    
    if (!currentUser) {
        showNotification("Inicia sesión para enviar mensajes", "error");
        openLoginModal();
        return;
    }
    
    const newMessage = {
        id: messages.length + 1,
        userId: currentUser.id,
        userName: currentUser.name,
        message: input.value,
        date: new Date().toLocaleTimeString()
    };
    
    messages.push(newMessage);
    saveMessages();
    input.value = "";
    renderMessages();
    showNotification("Mensaje enviado", "success");
}

// ============ PUBLICAR PRODUCTO (CORREGIDO) ============
function publishProduct() {
    console.log("=== PUBLICANDO PRODUCTO ===");
    
    const titleInput = document.getElementById("productTitle");
    const priceInput = document.getElementById("productPrice");
    const categorySelect = document.getElementById("productCategory");
    const descTextarea = document.getElementById("productDesc");
    
    if (!titleInput) {
        showNotification("Error: Campo de título no encontrado", "error");
        return;
    }
    if (!priceInput) {
        showNotification("Error: Campo de precio no encontrado", "error");
        return;
    }
    if (!categorySelect) {
        showNotification("Error: Campo de categoría no encontrado", "error");
        return;
    }
    
    const title = titleInput.value;
    const price = priceInput.value;
    const category = categorySelect.value;
    const desc = descTextarea ? descTextarea.value : "";
    
    console.log("Título:", title);
    console.log("Precio:", price);
    console.log("Categoría:", category);
    
    if (!title || title.trim() === "") {
        showNotification("❌ Escribe un título", "error");
        return;
    }
    
    if (!price || price === "") {
        showNotification("❌ Escribe un precio", "error");
        return;
    }
    
    const precioNumero = parseFloat(price);
    if (isNaN(precioNumero) || precioNumero <= 0) {
        showNotification("❌ Precio inválido - Escribe solo números", "error");
        return;
    }
    
    if (!currentUser) {
        showNotification("❌ Inicia sesión para publicar", "error");
        openLoginModal();
        return;
    }
    
    const nuevoProducto = {
        id: Date.now(),
        name: title.trim(),
        description: desc || "Sin descripción",
        price: precioNumero,
        category: category,
        image: "",
        seller: currentUser.name,
        sellerId: currentUser.id,
        sellerAvatar: currentUser.avatar || "https://randomuser.me/api/portraits/lego/1.jpg",
        date: new Date().toISOString()
    };
    
    console.log("Producto creado:", nuevoProducto);
    
    products.unshift(nuevoProducto);
    saveProducts();
    
    titleInput.value = "";
    if (descTextarea) descTextarea.value = "";
    priceInput.value = "";
    const imageInput = document.getElementById("productImageInput");
    if (imageInput) imageInput.value = "";
    const imagePreview = document.getElementById("imagePreview");
    if (imagePreview) imagePreview.innerHTML = "";
    
    closePublishModal();
    renderProducts();
    showNotification(`✅ ¡${title} publicado en Linca!`, "success");
}

function clearPublishForm() {
    document.getElementById("productTitle").value = "";
    document.getElementById("productDesc").value = "";
    document.getElementById("productPrice").value = "";
    const imageInput = document.getElementById("productImageInput");
    if (imageInput) imageInput.value = "";
    const imagePreview = document.getElementById("imagePreview");
    if (imagePreview) imagePreview.innerHTML = "";
}

// ============ LOGIN / REGISTRO ============
function switchTab(tab) {
    const loginTab = document.getElementById("loginTab");
    const registerTab = document.getElementById("registerTab");
    const tabs = document.querySelectorAll(".tab-btn");
    
    if (tab === 'login') {
        loginTab.style.display = "block";
        registerTab.style.display = "none";
        tabs[0].classList.add("active");
        tabs[1].classList.remove("active");
    } else {
        loginTab.style.display = "none";
        registerTab.style.display = "block";
        tabs[0].classList.remove("active");
        tabs[1].classList.add("active");
    }
}

function register() {
    const name = document.getElementById("regName").value;
    const email = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;
    const avatarFile = document.getElementById("regAvatar").files[0];
    
    if (!name || !email || !password) {
        showNotification("Completa todos los campos", "error");
        return;
    }
    
    if (users.find(u => u.email === email)) {
        showNotification("El email ya está registrado", "error");
        return;
    }
    
    if (avatarFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
            createUser(name, email, password, e.target.result);
        };
        reader.readAsDataURL(avatarFile);
    } else {
        createUser(name, email, password, "https://randomuser.me/api/portraits/lego/1.jpg");
    }
}

function createUser(name, email, password, avatarUrl) {
    const newUser = {
        id: users.length + 1,
        name: name,
        email: email,
        password: password,
        avatar: avatarUrl,
        joinDate: new Date().toLocaleDateString()
    };
    
    users.push(newUser);
    saveUsers();
    
    currentUser = newUser;
    saveCurrentUser();
    
    closeLoginModal();
    updateUIForUser();
    showNotification(`🎉 ¡Bienvenido ${name} a Linca!`, "success");
    renderProducts();
    
    document.getElementById("regName").value = "";
    document.getElementById("regEmail").value = "";
    document.getElementById("regPassword").value = "";
    document.getElementById("regAvatar").value = "";
}

function login() {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        saveCurrentUser();
        closeLoginModal();
        updateUIForUser();
        showNotification(`👋 ¡Bienvenido de vuelta ${user.name}!`, "success");
        renderProducts();
        
        document.getElementById("loginEmail").value = "";
        document.getElementById("loginPassword").value = "";
    } else {
        showNotification("Email o contraseña incorrectos", "error");
    }
}

function logout() {
    currentUser = null;
    saveCurrentUser();
    updateUIForUser();
    showNotification("Sesión cerrada", "info");
    renderProducts();
}

function updateUIForUser() {
    const authButtons = document.getElementById("authButtons");
    const userInfo = document.getElementById("userInfo");
    const userName = document.getElementById("userName");
    const userAvatar = document.getElementById("userAvatar");
    
    if (currentUser) {
        if (authButtons) authButtons.style.display = "none";
        if (userInfo) {
            userInfo.style.display = "flex";
            if (userName) userName.innerHTML = currentUser.name;
            if (userAvatar && currentUser.avatar) userAvatar.src = currentUser.avatar;
        }
    } else {
        if (authButtons) authButtons.style.display = "flex";
        if (userInfo) userInfo.style.display = "none";
    }
}

// ============ NAVEGACIÓN ============
function showSection(section) {
    document.getElementById("favoritesSection").style.display = "none";
    document.getElementById("purchasesSection").style.display = "none";
    document.getElementById("messagesSection").style.display = "none";
    document.getElementById("cartSection").style.display = "none";
    document.getElementById("homeSection").style.display = "none";
    
    switch(section) {
        case 'home':
            document.getElementById("homeSection").style.display = "block";
            renderProducts();
            break;
        case 'favorites':
            document.getElementById("favoritesSection").style.display = "block";
            renderFavorites();
            break;
        case 'purchases':
            document.getElementById("purchasesSection").style.display = "block";
            renderPurchases();
            break;
        case 'messages':
            document.getElementById("messagesSection").style.display = "block";
            renderMessages();
            break;
        case 'cart':
            document.getElementById("cartSection").style.display = "block";
            renderCart();
            break;
    }
    
    const searchInput = document.getElementById("search");
    if (searchInput) searchInput.value = "";
}

// ============ MODALES ============
function openLoginModal() { document.getElementById("loginModal").style.display = "flex"; }
function closeLoginModal() { document.getElementById("loginModal").style.display = "none"; }
function openPublishModal() { 
    if (!currentUser) {
        showNotification("Inicia sesión para publicar", "error");
        openLoginModal();
        return;
    }
    document.getElementById("publishModal").style.display = "flex";
}
function closePublishModal() { document.getElementById("publishModal").style.display = "none"; }
function openPaymentModal(productId) {
    const product = products.find(p => p.id === productId);
    if (!currentUser) {
        showNotification("Inicia sesión para comprar", "error");
        openLoginModal();
        return;
    }
    document.getElementById("productName").innerText = product.name;
    document.getElementById("productPrice").innerText = product.price;
    document.getElementById("paymentModal").style.display = "flex";
}
function closePaymentModal() { document.getElementById("paymentModal").style.display = "none"; }
function processPayment(method) { 
    showNotification(`💳 Pago con ${method} realizado!`, "success");
    closePaymentModal(); 
}

function testPrice() {
    const precio = document.getElementById("productPrice").value;
    alert("El precio es: '" + precio + "'");
    console.log("Precio:", precio);
}

function showNotification(message, type) {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.innerHTML = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 12px 20px;
        background: ${type === 'success' ? '#2ecc71' : type === 'error' ? '#e74c3c' : '#3498db'};
        color: white;
        border-radius: 8px;
        z-index: 9999;
        animation: slideIn 0.3s;
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// ============ VISTA PREVIA DE IMAGEN ============
document.addEventListener("DOMContentLoaded", () => {
    renderProducts();
    updateUIForUser();
    updateCartCount();
    
    const imageInput = document.getElementById("productImageInput");
    if (imageInput) {
        imageInput.addEventListener("change", function(e) {
            const preview = document.getElementById("imagePreview");
            preview.innerHTML = "";
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                reader.onload = function(ev) {
                    const img = document.createElement("img");
                    img.src = ev.target.result;
                    img.style.maxWidth = "100%";
                    img.style.maxHeight = "200px";
                    img.style.borderRadius = "8px";
                    preview.appendChild(img);
                };
                reader.readAsDataURL(this.files[0]);
            }
        });
    }
    
    const searchInput = document.getElementById("search");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => renderProducts(e.target.value));
    }
    
    document.querySelectorAll("#categories li").forEach(cat => {
        cat.addEventListener("click", function() {
            const category = this.getAttribute("data-cat");
            filterByCategory(category);
        });
    });
});

// ============ FUNCIONES GLOBALES ============
window.switchTab = switchTab;
window.login = login;
window.register = register;
window.logout = logout;
window.showSection = showSection;
window.openLoginModal = openLoginModal;
window.closeLoginModal = closeLoginModal;
window.openPublishModal = openPublishModal;
window.closePublishModal = closePublishModal;
window.publishProduct = publishProduct;
window.openPaymentModal = openPaymentModal;
window.closePaymentModal = closePaymentModal;
window.processPayment = processPayment;
window.toggleFavorite = toggleFavorite;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.checkout = checkout;
window.sendMessage = sendMessage;
window.filterByCategory = filterByCategory;
