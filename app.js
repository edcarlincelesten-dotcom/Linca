// ============ BASE DE DATOS ============
let users     = JSON.parse(localStorage.getItem('linca_users'))       || [];
let products  = JSON.parse(localStorage.getItem('linca_products'))    || [];
let currentUser = JSON.parse(localStorage.getItem('linca_currentUser')) || null;
let favorites = JSON.parse(localStorage.getItem('linca_favorites'))   || [];
let purchases = JSON.parse(localStorage.getItem('linca_purchases'))   || [];
let cart      = JSON.parse(localStorage.getItem('linca_cart'))        || [];
// conversations: { id, productId, productName, productImage, buyerId, sellerId, messages:[] }
let conversations = JSON.parse(localStorage.getItem('linca_conversations')) || [];
let currentTheme  = localStorage.getItem('linca_theme') || 'light';
let activeConvId  = null;

// ============ PRODUCTOS DE EJEMPLO ============
if (products.length === 0) {
    products = [
        { id: 1, name: "iPhone 12 Pro", price: 699, category: "Electrónica", image: "", description: "Excelente estado, 128GB.", seller: "Carlos Méndez", sellerId: 1, sellerAvatar: "https://randomuser.me/api/portraits/men/32.jpg", date: new Date().toISOString() },
        { id: 2, name: "Zapatos Nike Air Max", price: 129, category: "Ropa", image: "", description: "Talla 42, poco uso.", seller: "Ana Rodríguez", sellerId: 2, sellerAvatar: "https://randomuser.me/api/portraits/women/44.jpg", date: new Date().toISOString() },
        { id: 3, name: "Sofá Seccional", price: 899, category: "Hogar", image: "", description: "Color gris, 3 módulos.", seller: "Miguel Torres", sellerId: 3, sellerAvatar: "https://randomuser.me/api/portraits/men/45.jpg", date: new Date().toISOString() }
    ];
    localStorage.setItem('linca_products', JSON.stringify(products));
}

// ============ GUARDADO ============
function saveUsers()         { localStorage.setItem('linca_users',         JSON.stringify(users)); }
function saveProducts()      { localStorage.setItem('linca_products',      JSON.stringify(products)); }
function saveCurrentUser()   { localStorage.setItem('linca_currentUser',   JSON.stringify(currentUser)); }
function saveFavorites()     { localStorage.setItem('linca_favorites',     JSON.stringify(favorites)); }
function savePurchases()     { localStorage.setItem('linca_purchases',     JSON.stringify(purchases)); }
function saveCart()          { localStorage.setItem('linca_cart',          JSON.stringify(cart)); }
function saveConversations() { localStorage.setItem('linca_conversations', JSON.stringify(conversations)); }

// ============ UTILIDADES ============
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
}

// ============ TEMA ============
function applyTheme(theme) {
    currentTheme = theme;
    document.body.classList.toggle('dark-mode', theme === 'dark');
    localStorage.setItem('linca_theme', theme);
    const l = document.getElementById('themeLight');
    const d = document.getElementById('themeDark');
    if (l) l.classList.toggle('active', theme === 'light');
    if (d) d.classList.toggle('active', theme === 'dark');
}
function setTheme(theme) {
    applyTheme(theme);
    showNotification(theme === 'dark' ? '🌙 Tema oscuro activado' : '☀️ Tema claro activado', 'success');
}

// ============ TARJETA DE PRODUCTO ============
function renderProductCard(prod) {
    const inCart = cart.some(i => i.id === prod.id);
    return `
        <div class="product-card" onclick="openProductDetail(${prod.id})" style="cursor:pointer">
            ${prod.image
                ? `<img src="${prod.image}" alt="${escapeHtml(prod.name)}" style="width:100%;height:180px;object-fit:cover;border-radius:12px 12px 0 0;">`
                : `<div class="no-image">📦 ${escapeHtml(prod.name)}</div>`}
            <div class="product-info">
                <div class="product-title">${escapeHtml(prod.name)}</div>
                <div class="product-price">RD$${prod.price}</div>
                <div class="product-seller">
                    <img src="${prod.sellerAvatar}" style="width:24px;height:24px;border-radius:50%;object-fit:cover;">
                    ${escapeHtml(prod.seller)}
                </div>
                <div style="display:flex;gap:8px;margin-top:8px;">
                    <button class="buy-btn" style="flex:1" onclick="event.stopPropagation();openPaymentModal(${prod.id})">Comprar</button>
                    <button class="${inCart ? 'cart-btn-added' : 'cart-btn'}" onclick="event.stopPropagation();addToCart(${prod.id})" title="${inCart ? 'En carrito' : 'Añadir al carrito'}">
                        <span class="material-icons" style="font-size:18px">${inCart ? 'shopping_cart' : 'add_shopping_cart'}</span>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// ============ DETALLE DEL PRODUCTO (con chat) ============
function openProductDetail(productId) {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;
    const isOwn = currentUser && currentUser.id === prod.sellerId;
    const inCart = cart.some(i => i.id === prod.id);

    document.getElementById('productDetailBody').innerHTML = `
        <div class="detail-layout">
            <div class="detail-image">
                ${prod.image
                    ? `<img src="${prod.image}" alt="${escapeHtml(prod.name)}" style="width:100%;border-radius:12px;max-height:320px;object-fit:cover;">`
                    : `<div class="no-image" style="height:220px;border-radius:12px;font-size:2rem;">📦<br>${escapeHtml(prod.name)}</div>`}
            </div>
            <div class="detail-info">
                <h2 style="margin:0 0 4px">${escapeHtml(prod.name)}</h2>
                <div style="font-size:1.6rem;font-weight:700;color:#7c3aed;margin-bottom:12px;">RD$${prod.price}</div>
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
                    <img src="${prod.sellerAvatar}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;">
                    <div>
                        <div style="font-weight:600;">${escapeHtml(prod.seller)}</div>
                        <div style="font-size:12px;opacity:0.6;">${prod.category}</div>
                    </div>
                </div>
                <p style="opacity:0.8;margin-bottom:16px;">${escapeHtml(prod.description || 'Sin descripción')}</p>
                ${!isOwn ? `
                <div style="display:flex;gap:8px;flex-wrap:wrap;">
                    <button class="buy-btn" style="flex:1;min-width:120px" onclick="closeProductDetail();openPaymentModal(${prod.id})">💳 Comprar</button>
                    <button class="${inCart ? 'cart-btn-added' : 'cart-btn'}" style="flex:1;min-width:120px;padding:10px;" onclick="addToCart(${prod.id})">
                        <span class="material-icons" style="font-size:18px;vertical-align:middle">${inCart ? 'shopping_cart' : 'add_shopping_cart'}</span>
                        ${inCart ? ' En carrito' : ' Al carrito'}
                    </button>
                </div>
                <button class="chat-seller-btn" onclick="startChat(${prod.id})">
                    <span class="material-icons" style="font-size:18px;vertical-align:middle">chat</span>
                    Conversar con el vendedor
                </button>
                ` : `<div style="padding:10px;background:#f5f0ff;border-radius:8px;text-align:center;color:#7c3aed;">📦 Este es tu producto</div>`}
            </div>
        </div>
    `;
    document.getElementById('productDetailModal').style.display = 'flex';
}
function closeProductDetail() { document.getElementById('productDetailModal').style.display = 'none'; }

// ============ CHAT PRIVADO POR PRODUCTO ============
function startChat(productId) {
    if (!currentUser) { showNotification("Inicia sesión para chatear", "error"); openLoginModal(); return; }
    const prod = products.find(p => p.id === productId);
    if (!prod) return;
    if (currentUser.id === prod.sellerId) { showNotification("No puedes chatear contigo mismo", "info"); return; }

    // Buscar conversación existente para este producto entre estos dos usuarios
    let conv = conversations.find(c =>
        c.productId === productId &&
        c.buyerId === currentUser.id &&
        c.sellerId === prod.sellerId
    );

    if (!conv) {
        conv = {
            id: Date.now(),
            productId: prod.id,
            productName: prod.name,
            productImage: prod.image,
            productPrice: prod.price,
            buyerId: currentUser.id,
            buyerName: currentUser.name,
            buyerAvatar: currentUser.avatar,
            sellerId: prod.sellerId,
            sellerName: prod.seller,
            sellerAvatar: prod.sellerAvatar,
            messages: [],
            lastDate: new Date().toISOString()
        };
        conversations.push(conv);
        saveConversations();
    }

    closeProductDetail();
    showSection('messages');
    setTimeout(() => openConversation(conv.id), 100);
}

function renderInbox() {
    const list = document.getElementById('inboxList');
    if (!list || !currentUser) return;

    // Mostrar conversaciones donde el usuario es comprador o vendedor
    const myConvs = conversations.filter(c =>
        c.buyerId === currentUser.id || c.sellerId === currentUser.id
    ).sort((a, b) => new Date(b.lastDate) - new Date(a.lastDate));

    if (myConvs.length === 0) {
        list.innerHTML = '<div style="padding:20px;text-align:center;opacity:0.5;">No tienes conversaciones aún.<br>Haz clic en "Conversar con el vendedor" en cualquier producto.</div>';
        return;
    }

    list.innerHTML = myConvs.map(conv => {
        const isActive = conv.id === activeConvId;
        const isBuyer  = conv.buyerId === currentUser.id;
        const otherName   = isBuyer ? conv.sellerName  : conv.buyerName;
        const otherAvatar = isBuyer ? conv.sellerAvatar : conv.buyerAvatar;
        const lastMsg = conv.messages.length > 0 ? conv.messages[conv.messages.length - 1] : null;

        return `
            <div class="inbox-item ${isActive ? 'active' : ''}" onclick="openConversation(${conv.id})">
                <div style="position:relative;flex-shrink:0;">
                    <img src="${otherAvatar || 'https://randomuser.me/api/portraits/lego/1.jpg'}"
                         style="width:48px;height:48px;border-radius:50%;object-fit:cover;">
                    ${conv.productImage
                        ? `<img src="${conv.productImage}" style="width:20px;height:20px;border-radius:4px;object-fit:cover;position:absolute;bottom:-2px;right:-2px;border:2px solid white;">`
                        : ''}
                </div>
                <div style="flex:1;min-width:0;">
                    <div style="font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(otherName)}</div>
                    <div style="font-size:12px;opacity:0.6;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">📦 ${escapeHtml(conv.productName)}</div>
                    ${lastMsg ? `<div style="font-size:12px;opacity:0.5;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(lastMsg.text)}</div>` : ''}
                </div>
                <div style="font-size:11px;opacity:0.4;flex-shrink:0;">${lastMsg ? formatTime(lastMsg.date) : ''}</div>
            </div>
        `;
    }).join('');
}

function openConversation(convId) {
    activeConvId = convId;
    const conv = conversations.find(c => c.id === convId);
    if (!conv) return;

    renderInbox(); // Remarcar activo

    const isBuyer    = conv.buyerId === currentUser.id;
    const otherName  = isBuyer ? conv.sellerName  : conv.buyerName;
    const otherAvatar= isBuyer ? conv.sellerAvatar : conv.buyerAvatar;

    const chat = document.getElementById('inboxChat');
    chat.innerHTML = `
        <!-- Header -->
        <div class="chat-header">
            <img src="${otherAvatar || 'https://randomuser.me/api/portraits/lego/1.jpg'}"
                 style="width:40px;height:40px;border-radius:50%;object-fit:cover;">
            <div style="flex:1;min-width:0;">
                <div style="font-weight:600;">${escapeHtml(otherName)}</div>
                <div style="font-size:12px;opacity:0.6;">Sobre: ${escapeHtml(conv.productName)}</div>
            </div>
            <div class="chat-product-thumb">
                ${conv.productImage
                    ? `<img src="${conv.productImage}" style="width:44px;height:44px;border-radius:8px;object-fit:cover;">`
                    : `<div style="width:44px;height:44px;border-radius:8px;background:#e5e7eb;display:flex;align-items:center;justify-content:center;">📦</div>`}
                <span style="font-size:13px;font-weight:600;color:#7c3aed;">$${conv.productPrice} </span>
            </div>
        </div>
        <!-- Mensajes -->
        <div class="chat-messages" id="chatMessages"></div>
        <!-- Input -->
        <div class="chat-input-row">
            <input type="text" id="chatInput" class="chat-input" placeholder="Escribe un mensaje..."
                   onkeydown="if(event.key==='Enter') sendChatMessage()">
            <button class="chat-send-btn" onclick="sendChatMessage()">
                <span class="material-icons">send</span>
            </button>
        </div>
    `;
    renderChatMessages(conv);
}

function renderChatMessages(conv) {
    const container = document.getElementById('chatMessages');
    if (!container) return;

    if (conv.messages.length === 0) {
        container.innerHTML = `<div style="text-align:center;opacity:0.5;padding:20px;">Saluda al ${conv.buyerId === currentUser.id ? 'vendedor' : 'comprador'} 👋</div>`;
        return;
    }

    container.innerHTML = conv.messages.map(msg => {
        const isMine = msg.senderId === currentUser.id;
        return `
            <div class="chat-bubble-row ${isMine ? 'mine' : 'theirs'}">
                ${!isMine ? `<img src="${msg.senderAvatar || 'https://randomuser.me/api/portraits/lego/1.jpg'}"
                    style="width:28px;height:28px;border-radius:50%;object-fit:cover;flex-shrink:0;">` : ''}
                <div class="chat-bubble ${isMine ? 'bubble-mine' : 'bubble-theirs'}">
                    <span>${escapeHtml(msg.text)}</span>
                    <span class="bubble-time">${formatTime(msg.date)}</span>
                </div>
            </div>
        `;
    }).join('');

    container.scrollTop = container.scrollHeight;
}

function sendChatMessage() {
    const input = document.getElementById('chatInput');
    if (!input || !input.value.trim()) return;
    if (!currentUser) { showNotification("Inicia sesión", "error"); return; }

    const conv = conversations.find(c => c.id === activeConvId);
    if (!conv) return;

    const msg = {
        id: Date.now(),
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderAvatar: currentUser.avatar,
        text: input.value.trim(),
        date: new Date().toISOString()
    };

    conv.messages.push(msg);
    conv.lastDate = msg.date;
    saveConversations();
    input.value = '';
    renderChatMessages(conv);
    renderInbox();
}

function formatTime(dateStr) {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return 'Ahora';
    if (diff < 3600000) return `${Math.floor(diff/60000)}m`;
    if (diff < 86400000) return d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
    return d.toLocaleDateString([], {day:'2-digit',month:'2-digit'});
}

// ============ RENDER PRODUCTOS ============
function renderProducts(filter = "") {
    const grid = document.getElementById("productsGrid");
    if (!grid) return;
    let filtered = [...products];
    if (filter) filtered = filtered.filter(p => p.name.toLowerCase().includes(filter.toLowerCase()));
    if (filtered.length === 0) {
        grid.innerHTML = '<div style="text-align:center;padding:40px;">No hay productos en Linca 😢</div>';
        return;
    }
    grid.innerHTML = filtered.map(prod => renderProductCard(prod)).join('');
}

function filterByCategory(category) {
    ['favoritesSection','purchasesSection','messagesSection','cartSection','settingsSection']
        .forEach(id => document.getElementById(id).style.display = "none");
    document.getElementById("homeSection").style.display = "block";
    const grid = document.getElementById("productsGrid");
    const filtered = products.filter(p => p.category === category);
    if (filtered.length === 0) {
        grid.innerHTML = `<div style="text-align:center;padding:40px;">No hay productos en ${escapeHtml(category)} 😢</div>`;
        return;
    }
    grid.innerHTML = filtered.map(prod => renderProductCard(prod)).join('');
}

// ============ FAVORITOS ============
function renderFavorites() {
    const container = document.getElementById("favoritesContainer");
    if (!container) return;
    const favProducts = products.filter(p => favorites.includes(p.id));
    if (favProducts.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:40px;">No tienes favoritos aún 🤍</div>';
        return;
    }
    container.innerHTML = favProducts.map(prod => renderProductCard(prod)).join('');
}

function toggleFavorite(productId) {
    if (!currentUser) { showNotification("Inicia sesión para guardar favoritos", "error"); openLoginModal(); return; }
    const idx = favorites.indexOf(productId);
    if (idx === -1) { favorites.push(productId); showNotification("✅ Añadido a favoritos", "success"); }
    else { favorites.splice(idx, 1); showNotification("❌ Eliminado de favoritos", "info"); }
    saveFavorites(); renderProducts();
}

// ============ COMPRAS ============
function renderPurchases() {
    const container = document.getElementById("purchasesContainer");
    if (!container) return;
    if (purchases.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:40px;">No has realizado compras aún 📦</div>';
        return;
    }
    container.innerHTML = purchases.map(p => `
        <div class="purchase-card">
            <div style="flex:1">
                <h4>${escapeHtml(p.name)}</h4>
                <p>$${p.price} </p>
                <p style="font-size:12px;opacity:0.6;">Comprado: ${p.date}</p>
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
        container.innerHTML = '<div style="text-align:center;padding:40px;">Carrito vacío 🛒</div>';
        return;
    }
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    container.innerHTML = `
        ${cart.map(item => `
            <div class="cart-item">
                ${item.image ? `<img src="${item.image}" style="width:56px;height:56px;border-radius:8px;object-fit:cover;">` : `<div style="width:56px;height:56px;border-radius:8px;background:#e5e7eb;display:flex;align-items:center;justify-content:center;">📦</div>`}
                <div style="flex:1;min-width:0;">
                    <h4 style="margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(item.name)}</h4>
                    <p style="margin:2px 0;color:#7c3aed;font-weight:600;"RD$${item.price}</p>
                    <p style="margin:0;font-size:12px;opacity:0.6;">${escapeHtml(item.seller)}</p>
                </div>
                <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end;">
                    <button onclick="removeFromCart(${item.id})" class="remove-btn">❌ Quitar</button>
                    <button onclick="closeProductDetail && true; openPaymentModal(${item.id})" class="buy-btn" style="font-size:13px;padding:6px 12px;">💳 Comprar</button>
                </div>
            </div>
        `).join('')}
        <div class="cart-total">
            <div>
                <div style="font-size:13px;opacity:0.6;">${cart.length} producto${cart.length !== 1 ? 's' : ''}</div>
                <strong style="font-size:1.2rem;">Total: $${total} </strong>
            </div>
            <button onclick="checkout()" class="checkout-btn">🎉 Pagar todo</button>
        </div>
    `;
}

function addToCart(productId) {
    if (!currentUser) { showNotification("Inicia sesión para añadir al carrito", "error"); openLoginModal(); return; }
    const product = products.find(p => p.id === productId);
    if (!product) return;
    if (cart.find(item => item.id === productId)) { showNotification("Ya está en el carrito", "info"); return; }
    cart.push({...product, quantity: 1});
    saveCart(); updateCartCount();
    showNotification("✅ Añadido al carrito", "success");
    renderCart(); renderProducts();
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart(); updateCartCount(); renderCart(); renderProducts();
}

function updateCartCount() {
    const count = document.getElementById("cartCount");
    if (count) count.innerText = cart.length;
}

function checkout() {
    if (cart.length === 0) return;
    redirectToStripeCheckoutCart(cart);
}

// ============ PUBLICAR PRODUCTO ============
function publishProduct() {
    const title    = document.getElementById("productTitle").value.trim();
    const price    = document.getElementById("productPriceInput").value;
    const category = document.getElementById("productCategory").value;
    const desc     = document.getElementById("productDesc").value;

    if (!title)  { showNotification("❌ Escribe un título", "error"); return; }
    if (!price)  { showNotification("❌ Escribe un precio", "error"); return; }
    const precioNumero = parseFloat(price);
    if (isNaN(precioNumero) || precioNumero <= 0) { showNotification("❌ Precio inválido", "error"); return; }
    if (!currentUser) { showNotification("❌ Inicia sesión para publicar", "error"); openLoginModal(); return; }

    const imageInput = document.getElementById("productImageInput");
    const file = imageInput && imageInput.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = e => crearYGuardarProducto(title, desc, precioNumero, category, e.target.result);
        reader.readAsDataURL(file);
    } else {
        crearYGuardarProducto(title, desc, precioNumero, category, "");
    }
}

function crearYGuardarProducto(title, desc, price, category, imageBase64) {
    products.unshift({
        id: Date.now(), name: title,
        description: desc || "Sin descripción",
        price, category, image: imageBase64,
        seller: currentUser.name, sellerId: currentUser.id,
        sellerAvatar: currentUser.avatar || "https://randomuser.me/api/portraits/lego/1.jpg",
        date: new Date().toISOString()
    });
    saveProducts(); clearPublishForm(); closePublishModal(); renderProducts();
    showNotification(`✅ ¡${title} publicado en Linca!`, "success");
}

function clearPublishForm() {
    ["productTitle","productDesc"].forEach(id => document.getElementById(id).value = "");
    document.getElementById("productPriceInput").value = "";
    const ii = document.getElementById("productImageInput"); if (ii) ii.value = "";
    const ip = document.getElementById("imagePreview"); if (ip) ip.innerHTML = "";
}

// ============ LOGIN / REGISTRO ============
function switchTab(tab) {
    const lt = document.getElementById("loginTab");
    const rt = document.getElementById("registerTab");
    const tabs = document.querySelectorAll(".tab-btn");
    if (tab === 'login') {
        lt.style.display = "block"; rt.style.display = "none";
        tabs[0].classList.add("active"); tabs[1].classList.remove("active");
    } else {
        lt.style.display = "none"; rt.style.display = "block";
        tabs[0].classList.remove("active"); tabs[1].classList.add("active");
    }
}

function register() {
    const name     = document.getElementById("regName").value;
    const email    = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;
    const avatarEl = document.getElementById("regAvatar");
    const file     = avatarEl ? avatarEl.files[0] : null;

    if (!name || !email || !password) { showNotification("Completa todos los campos", "error"); return; }
    if (users.find(u => u.email === email)) { showNotification("El email ya está registrado", "error"); return; }

    if (file) {
        const r = new FileReader();
        r.onload = e => createUser(name, email, password, e.target.result);
        r.readAsDataURL(file);
    } else {
        createUser(name, email, password, "https://randomuser.me/api/portraits/lego/1.jpg");
    }
}

function createUser(name, email, password, avatarUrl) {
    const newUser = { id: Date.now(), name, email, password, avatar: avatarUrl, joinDate: new Date().toLocaleDateString() };
    users.push(newUser); saveUsers();
    currentUser = newUser; saveCurrentUser();
    closeLoginModal(); updateUIForUser();
    showNotification(`🎉 ¡Bienvenido ${name} a Linca!`, "success");
    renderProducts();
    ["regName","regEmail","regPassword"].forEach(id => document.getElementById(id).value = "");
    const ra = document.getElementById("regAvatar"); if (ra) ra.value = "";
}

function login() {
    const email    = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        currentUser = user; saveCurrentUser();
        closeLoginModal(); updateUIForUser();
        showNotification(`👋 ¡Bienvenido de vuelta ${user.name}!`, "success");
        renderProducts();
        document.getElementById("loginEmail").value = "";
        document.getElementById("loginPassword").value = "";
    } else {
        showNotification("Email o contraseña incorrectos", "error");
    }
}

function logout() {
    currentUser = null; saveCurrentUser();
    activeConvId = null;
    updateUIForUser(); showNotification("Sesión cerrada", "info"); renderProducts();
}

function updateUIForUser() {
    const ab = document.getElementById("authButtons");
    const ui = document.getElementById("userInfo");
    if (currentUser) {
        if (ab) ab.style.display = "none";
        if (ui) {
            ui.style.display = "flex";
            const un = document.getElementById("userName");
            const ua = document.getElementById("userAvatar");
            if (un) un.textContent = currentUser.name;
            if (ua && currentUser.avatar) ua.src = currentUser.avatar;
        }
    } else {
        if (ab) ab.style.display = "flex";
        if (ui) ui.style.display = "none";
    }
}

// ============ NAVEGACIÓN ============
const ALL_SECTIONS = ['homeSection','favoritesSection','purchasesSection','messagesSection','cartSection','settingsSection'];

function showSection(section) {
    ALL_SECTIONS.forEach(id => document.getElementById(id).style.display = "none");
    const si = document.getElementById("search"); if (si) si.value = "";

    switch(section) {
        case 'home':      document.getElementById("homeSection").style.display = "block"; renderProducts(); break;
        case 'favorites': document.getElementById("favoritesSection").style.display = "block"; renderFavorites(); break;
        case 'purchases': document.getElementById("purchasesSection").style.display = "block"; renderPurchases(); break;
        case 'messages':
            if (!currentUser) { showNotification("Inicia sesión para ver mensajes", "error"); openLoginModal(); return; }
            document.getElementById("messagesSection").style.display = "block";
            renderInbox();
            break;
        case 'cart':     document.getElementById("cartSection").style.display = "block"; renderCart(); break;
        case 'settings':
            if (!currentUser) { showNotification("Inicia sesión para la configuración", "error"); openLoginModal(); return; }
            document.getElementById("settingsSection").style.display = "block"; loadSettingsData(); break;
    }
}

// ============ CONFIGURACIÓN ============
function switchSettingsTab(tab) {
    const panels = { profile:'settingsProfile', password:'settingsPassword', theme:'settingsTheme', myproducts:'settingsMyProducts' };
    Object.values(panels).forEach(id => document.getElementById(id).style.display = "none");
    document.getElementById(panels[tab]).style.display = "block";
    document.querySelectorAll('.settings-tab').forEach((btn, i) => {
        btn.classList.toggle('active', ['profile','password','theme','myproducts'][i] === tab);
    });
    if (tab === 'myproducts') renderMyProducts();
    if (tab === 'theme') applyTheme(currentTheme);
}

function loadSettingsData() {
    if (!currentUser) return;
    const n = document.getElementById("settingsName"); if (n) n.value = currentUser.name;
    const a = document.getElementById("settingsAvatarPreview"); if (a) a.src = currentUser.avatar || "";
}

function previewSettingsAvatar(input) {
    if (input.files && input.files[0]) {
        const r = new FileReader();
        r.onload = e => { document.getElementById("settingsAvatarPreview").src = e.target.result; };
        r.readAsDataURL(input.files[0]);
    }
}

function saveProfile() {
    if (!currentUser) return;
    const newName = document.getElementById("settingsName").value.trim();
    const file    = document.getElementById("settingsAvatar").files[0];
    if (!newName) { showNotification("❌ El nombre no puede estar vacío", "error"); return; }

    const doSave = (avatarUrl) => {
        currentUser.name = newName;
        if (avatarUrl) currentUser.avatar = avatarUrl;
        const idx = users.findIndex(u => u.id === currentUser.id);
        if (idx !== -1) users[idx] = currentUser;
        saveUsers(); saveCurrentUser(); updateUIForUser();
        showNotification("✅ Perfil actualizado", "success");
    };

    if (file) { const r = new FileReader(); r.onload = e => doSave(e.target.result); r.readAsDataURL(file); }
    else doSave(null);
}

function changePassword() {
    if (!currentUser) return;
    const cur  = document.getElementById("currentPassword").value;
    const nw   = document.getElementById("newPassword").value;
    const conf = document.getElementById("confirmPassword").value;
    if (cur !== currentUser.password) { showNotification("❌ Contraseña actual incorrecta", "error"); return; }
    if (!nw || nw.length < 4) { showNotification("❌ Mínimo 4 caracteres", "error"); return; }
    if (nw !== conf) { showNotification("❌ Las contraseñas no coinciden", "error"); return; }
    currentUser.password = nw;
    const idx = users.findIndex(u => u.id === currentUser.id);
    if (idx !== -1) users[idx] = currentUser;
    saveUsers(); saveCurrentUser();
    ["currentPassword","newPassword","confirmPassword"].forEach(id => document.getElementById(id).value = "");
    showNotification("✅ Contraseña actualizada", "success");
}

function renderMyProducts() {
    const container = document.getElementById("myProductsContainer");
    if (!container || !currentUser) return;
    const myProds = products.filter(p => p.sellerId === currentUser.id);
    if (myProds.length === 0) { container.innerHTML = '<div style="text-align:center;padding:40px;">No has publicado productos aún 📦</div>'; return; }
    container.innerHTML = myProds.map(prod => `
        <div class="my-product-card">
            ${prod.image ? `<img src="${prod.image}" style="width:64px;height:64px;object-fit:cover;border-radius:8px;flex-shrink:0;">` : `<div style="width:64px;height:64px;background:#e5e7eb;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0;">📦</div>`}
            <div style="flex:1;min-width:0;">
                <strong style="display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(prod.name)}</strong>
                <span style="color:#7c3aed;font-weight:600;">RD$${prod.price}</span>
                <span style="display:block;font-size:12px;opacity:0.6;">${prod.category}</span>
            </div>
            <div style="display:flex;gap:8px;flex-shrink:0;">
                <button onclick="openEditModal(${prod.id})" class="edit-btn">✏️ Editar</button>
                <button onclick="deleteProduct(${prod.id})" class="delete-btn">🗑️ Eliminar</button>
            </div>
        </div>
    `).join('');
}

function openEditModal(productId) {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;
    document.getElementById("editProductId").value    = prod.id;
    document.getElementById("editProductTitle").value = prod.name;
    document.getElementById("editProductDesc").value  = prod.description || "";
    document.getElementById("editProductPrice").value = prod.price;
    document.getElementById("editProductCategory").value = prod.category;
    document.getElementById("editProductModal").style.display = "flex";
}
function closeEditModal() { document.getElementById("editProductModal").style.display = "none"; }

function saveEditProduct() {
    const id       = parseInt(document.getElementById("editProductId").value);
    const title    = document.getElementById("editProductTitle").value.trim();
    const desc     = document.getElementById("editProductDesc").value;
    const price    = parseFloat(document.getElementById("editProductPrice").value);
    const category = document.getElementById("editProductCategory").value;
    if (!title) { showNotification("❌ El título no puede estar vacío", "error"); return; }
    if (isNaN(price) || price <= 0) { showNotification("❌ Precio inválido", "error"); return; }
    const idx = products.findIndex(p => p.id === id);
    if (idx !== -1) { products[idx] = { ...products[idx], name: title, description: desc, price, category }; saveProducts(); renderMyProducts(); renderProducts(); closeEditModal(); showNotification("✅ Producto actualizado", "success"); }
}

function deleteProduct(productId) {
    if (!confirm("¿Seguro que quieres eliminar este producto?")) return;
    products = products.filter(p => p.id !== productId);
    saveProducts(); renderMyProducts(); renderProducts();
    showNotification("🗑️ Producto eliminado", "info");
}

// ============ MODALES ============
function openLoginModal()    { document.getElementById("loginModal").style.display = "flex"; }
function closeLoginModal()   { document.getElementById("loginModal").style.display = "none"; }
function openPublishModal() {
    if (!currentUser) {
        showNotification("Inicia sesión para publicar", "error");
        openLoginModal();
        return;
    }

    // ¿Tiene cuenta Stripe conectada?
    if (!currentUser.stripeAccountId) {
        // Mostrar modal de conexión Stripe
        document.getElementById("stripeConnectModal").style.display = "flex";
        return;
    }

    document.getElementById("publishModal").style.display = "flex";
}
function closePublishModal() { document.getElementById("publishModal").style.display = "none"; }
function openPaymentModal(productId) {
    if (!currentUser) { showNotification("Inicia sesión para comprar", "error"); openLoginModal(); return; }
    const product = products.find(p => p.id === productId);
    if (!product) return;

    document.getElementById("modalProductName").innerText  = product.name;
    document.getElementById("modalProductPrice").innerText = product.price;

    // Imagen del producto
    const imgDiv = document.getElementById("modalProductImg");
    if (product.image) {
        imgDiv.style.cssText = `background-image:url('${product.image}');background-size:cover;background-position:center;`;
    } else {
        imgDiv.style.cssText = "background:#f5f0ff;";
        imgDiv.innerHTML = `<span style="font-size:48px;">📦</span>`;
    }

    // Vendedor
    document.getElementById("modalSellerRow").innerHTML = `
        <img src="${product.sellerAvatar}" style="width:28px;height:28px;border-radius:50%;object-fit:cover;">
        <span>Vendido por <strong>${escapeHtml(product.seller)}</strong></span>
    `;

    document.getElementById("paymentModal").style.display = "flex";
}
function closePaymentModal() { 
    document.getElementById("paymentModal").style.display = "none"; 
}
function processPayment(method) {
    const name  = document.getElementById("modalProductName").innerText;
    const price = parseFloat(document.getElementById("modalProductPrice").innerText);
    const prod  = products.find(p => p.name === name);
    closePaymentModal();
    redirectToStripeCheckout(name, price, prod?.id, prod?.sellerId);
}

function selectPayMethod(method) {
    document.querySelectorAll('.payment-method-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('btn' + method.charAt(0).toUpperCase() + method.slice(1)).classList.add('active');
}
// ============ NOTIFICACIONES ============
function showNotification(message, type) {
    const n = document.createElement("div");
    n.textContent = message;
    n.style.cssText = `position:fixed;bottom:20px;right:20px;padding:12px 20px;
        background:${type==='success'?'#2ecc71':type==='error'?'#e74c3c':'#3498db'};
        color:white;border-radius:8px;z-index:9999;font-size:14px;
        box-shadow:0 4px 12px rgba(0,0,0,0.2);`;
    document.body.appendChild(n);
    setTimeout(() => n.remove(), 3000);
}

// ============ INIT ============
document.addEventListener("DOMContentLoaded", () => {
    applyTheme(currentTheme);
    renderProducts();
    updateUIForUser();
    updateCartCount();

    const imageInput = document.getElementById("productImageInput");
    if (imageInput) {
        imageInput.addEventListener("change", function() {
            const preview = document.getElementById("imagePreview");
            preview.innerHTML = "";
            if (this.files && this.files[0]) {
                const r = new FileReader();
                r.onload = ev => {
                    const img = document.createElement("img");
                    img.src = ev.target.result;
                    img.style.cssText = "max-width:100%;max-height:200px;border-radius:8px;margin-top:8px;";
                    preview.appendChild(img);
                };
                r.readAsDataURL(this.files[0]);
            }
        });
    }

    const si = document.getElementById("search");
    if (si) si.addEventListener("input", e => renderProducts(e.target.value));

    document.querySelectorAll("#categories li").forEach(cat => {
        cat.addEventListener("click", function() { filterByCategory(this.getAttribute("data-cat")); });
    });
});

// ============ GLOBALES ============
window.switchTab=switchTab; window.login=login; window.register=register; window.logout=logout;
window.showSection=showSection; window.openLoginModal=openLoginModal; window.closeLoginModal=closeLoginModal;
window.openPublishModal=openPublishModal; window.closePublishModal=closePublishModal;
window.publishProduct=publishProduct; window.openPaymentModal=openPaymentModal;
window.closePaymentModal=closePaymentModal; window.processPayment=processPayment;
window.toggleFavorite=toggleFavorite; window.addToCart=addToCart;
window.removeFromCart=removeFromCart; window.checkout=checkout;
window.filterByCategory=filterByCategory; window.switchSettingsTab=switchSettingsTab;
window.saveProfile=saveProfile; window.changePassword=changePassword;
window.setTheme=setTheme; window.previewSettingsAvatar=previewSettingsAvatar;
window.openEditModal=openEditModal; window.closeEditModal=closeEditModal;
window.saveEditProduct=saveEditProduct; window.deleteProduct=deleteProduct;
window.openProductDetail=openProductDetail; window.closeProductDetail=closeProductDetail;
window.startChat=startChat; window.openConversation=openConversation;
window.sendChatMessage=sendChatMessage;
window.selectPayMethod = selectPayMethod;
window.connectSellerStripeAccount = connectSellerStripeAccount;
window.processPayment = processPayment;