// ============================================
// Linca — app.js con Supabase
// ============================================

// ── Estado global ─────────────────────────────
let currentUser  = JSON.parse(localStorage.getItem('linca_currentUser')) || null;
let products     = [];
let favorites    = [];
let cart         = JSON.parse(localStorage.getItem('linca_cart')) || [];
let purchases    = [];
let conversations = [];
let activeConvId = null;
let currentTheme = localStorage.getItem('linca_theme') || 'light';

// ── Utilidades ────────────────────────────────
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
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

// ── Tema ──────────────────────────────────────
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

// ── Carrito (sigue en localStorage) ──────────
function saveCart() { localStorage.setItem('linca_cart', JSON.stringify(cart)); }

function updateCartCount() {
    const count = document.getElementById("cartCount");
    if (count) count.innerText = cart.length;
}

// ── Notificaciones ────────────────────────────
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

// ============================================
// TARJETA DE PRODUCTO
// ============================================
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
                    <img src="${prod.seller_avatar || prod.sellerAvatar}" style="width:24px;height:24px;border-radius:50%;object-fit:cover;">
                    ${escapeHtml(prod.seller)}
                </div>
             <div style="display:flex;gap:8px;margin-top:8px;">
                <button class="buy-btn" style="flex:1" onclick="event.stopPropagation();openPaymentModal(${prod.id})">Comprar</button>
                <button class="${favorites.includes(prod.id) ? 'cart-btn-added' : 'cart-btn'}" onclick="event.stopPropagation();toggleFavorite(${prod.id})" title="Favorito">
                 <span class="material-icons" style="font-size:18px">${favorites.includes(prod.id) ? 'favorite' : 'favorite_border'}</span>
                 </button>
                    <button class="${inCart ? 'cart-btn-added' : 'cart-btn'}" onclick="event.stopPropagation();addToCart(${prod.id})" title="${inCart ? 'En carrito' : 'Añadir al carrito'}">
                    <span class="material-icons" style="font-size:18px">${inCart ? 'shopping_cart' : 'add_shopping_cart'}</span>
                </button>
</div>
            </div>
        </div>
    `;
}

// ============================================
// RENDERIZAR PRODUCTOS (desde Supabase)
// ============================================
async function renderProducts(filter = "") {
    const grid = document.getElementById("productsGrid");
    if (!grid) return;

    grid.innerHTML = '<div style="text-align:center;padding:40px;">Cargando productos...</div>';

    try {
        products = await dbGetProducts();
        let filtered = [...products];
        if (filter) filtered = filtered.filter(p => p.name.toLowerCase().includes(filter.toLowerCase()));

        if (filtered.length === 0) {
            grid.innerHTML = '<div style="text-align:center;padding:40px;">No hay productos en Linca 😢</div>';
            return;
        }
        grid.innerHTML = filtered.map(prod => renderProductCard(prod)).join('');
    } catch (e) {
        grid.innerHTML = '<div style="text-align:center;padding:40px;">Error cargando productos 😢</div>';
    }
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

// ============================================
// DETALLE DEL PRODUCTO
// ============================================
function openProductDetail(productId) {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;
    const isOwn  = currentUser && currentUser.id === (prod.seller_id || prod.sellerId);
    const inCart = cart.some(i => i.id === prod.id);
    const avatar = prod.seller_avatar || prod.sellerAvatar;
    const sellerId = prod.seller_id || prod.sellerId;

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
                    <img src="${avatar}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;">
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

// ============================================
// FAVORITOS (desde Supabase)
// ============================================
async function renderFavorites() {
    const container = document.getElementById("favoritesContainer");
    if (!container || !currentUser) return;

    container.innerHTML = '<div style="text-align:center;padding:20px;">Cargando...</div>';
    favorites = await dbGetFavorites(currentUser.id);
    const favProducts = products.filter(p => favorites.includes(p.id));

    if (favProducts.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:40px;">No tienes favoritos aún 🤍</div>';
        return;
    }
    container.innerHTML = favProducts.map(prod => renderProductCard(prod)).join('');
}

async function toggleFavorite(productId) {
    if (!currentUser) { showNotification("Inicia sesión para guardar favoritos", "error"); openLoginModal(); return; }
    const idx = favorites.indexOf(productId);
    if (idx === -1) {
        await dbAddFavorite(currentUser.id, productId);
        favorites.push(productId);
        showNotification("✅ Añadido a favoritos", "success");
    } else {
        await dbRemoveFavorite(currentUser.id, productId);
        favorites.splice(idx, 1);
        showNotification("❌ Eliminado de favoritos", "info");
    }
    renderProducts();
}

// ============================================
// COMPRAS (desde Supabase)
// ============================================
async function renderPurchases() {
    const container = document.getElementById("purchasesContainer");
    if (!container || !currentUser) return;

    container.innerHTML = '<div style="text-align:center;padding:20px;">Cargando...</div>';
    purchases = await dbGetPurchases(currentUser.id);

    if (purchases.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:40px;">No has realizado compras aún 📦</div>';
        return;
    }
    container.innerHTML = purchases.map(p => `
        <div class="purchase-card">
            <div style="flex:1">
                <h4>${escapeHtml(p.name)}</h4>
                <p>RD$${p.price}</p>
                <p style="font-size:12px;opacity:0.6;">Comprado: ${p.date}</p>
            </div>
            <span class="status delivered">✅ Entregado</span>
        </div>
    `).join('');
}

// ============================================
// CARRITO (sigue local, solo datos de sesión)
// ============================================
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
                    <h4 style="margin:0;">${escapeHtml(item.name)}</h4>
                    <p style="margin:2px 0;color:#7c3aed;font-weight:600;">RD$${item.price}</p>
                    <p style="margin:0;font-size:12px;opacity:0.6;">${escapeHtml(item.seller)}</p>
                </div>
                <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end;">
                    <button onclick="removeFromCart(${item.id})" class="remove-btn">❌ Quitar</button>
                    <button onclick="openPaymentModal(${item.id})" class="buy-btn" style="font-size:13px;padding:6px 12px;">💳 Comprar</button>
                </div>
            </div>
        `).join('')}
        <div class="cart-total">
            <div>
                <div style="font-size:13px;opacity:0.6;">${cart.length} producto${cart.length !== 1 ? 's' : ''}</div>
                <strong style="font-size:1.2rem;">Total: RD$${total}</strong>
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

async function checkout() {
    if (cart.length === 0) return;
    if (!currentUser) { showNotification("Inicia sesión para comprar", "error"); openLoginModal(); return; }

    for (const item of cart) {
        await dbCreatePurchase(currentUser.id, item);
    }

    cart = []; saveCart(); updateCartCount();
    showNotification("🎉 ¡Compra realizada con éxito!", "success");
    renderCart(); renderPurchases();
}

// ============================================
// MENSAJES (desde Supabase)
// ============================================
async function startChat(productId) {
    if (!currentUser) { showNotification("Inicia sesión para chatear", "error"); openLoginModal(); return; }
    const prod = products.find(p => p.id === productId);
    if (!prod) return;
    const sellerId = prod.seller_id || prod.sellerId;
    if (currentUser.id === sellerId) { showNotification("No puedes chatear contigo mismo", "info"); return; }

    try {
        const conv = await dbGetOrCreateConversation(prod.id, currentUser.id, sellerId, {
            productName:   prod.name,
            productImage:  prod.image,
            productPrice:  prod.price,
            buyerName:     currentUser.name,
            buyerAvatar:   currentUser.avatar,
            sellerName:    prod.seller,
            sellerAvatar:  prod.seller_avatar || prod.sellerAvatar,
        });

        closeProductDetail();
        showSection('messages');
        setTimeout(() => openConversation(conv.id), 300);
    } catch (e) {
        showNotification("Error al iniciar chat", "error");
    }
}

async function renderInbox() {
    const list = document.getElementById('inboxList');
    if (!list || !currentUser) return;

    list.innerHTML = '<div style="padding:20px;text-align:center;opacity:0.5;">Cargando...</div>';
    conversations = await dbGetConversations(currentUser.id);

    if (conversations.length === 0) {
        list.innerHTML = '<div style="padding:20px;text-align:center;opacity:0.5;">No tienes conversaciones aún.</div>';
        return;
    }

    list.innerHTML = conversations.map(conv => {
        const isActive   = conv.id === activeConvId;
        const isBuyer    = conv.buyer_id === currentUser.id;
        const otherName  = isBuyer ? conv.seller_name  : conv.buyer_name;
        const otherAvatar= isBuyer ? conv.seller_avatar : conv.buyer_avatar;

        return `
            <div class="inbox-item ${isActive ? 'active' : ''}" onclick="openConversation(${conv.id})">
                <img src="${otherAvatar || 'https://randomuser.me/api/portraits/lego/1.jpg'}"
                     style="width:48px;height:48px;border-radius:50%;object-fit:cover;flex-shrink:0;">
                <div style="flex:1;min-width:0;">
                    <div style="font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(otherName)}</div>
                    <div style="font-size:12px;opacity:0.6;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">📦 ${escapeHtml(conv.product_name)}</div>
                </div>
                <div style="font-size:11px;opacity:0.4;">${formatTime(conv.last_date)}</div>
            </div>
        `;
    }).join('');
}

async function openConversation(convId) {
    activeConvId = convId;
    const conv = conversations.find(c => c.id === convId);
    if (!conv) return;
    renderInbox();

    const isBuyer    = conv.buyer_id === currentUser.id;
    const otherName  = isBuyer ? conv.seller_name  : conv.buyer_name;
    const otherAvatar= isBuyer ? conv.seller_avatar : conv.buyer_avatar;

    const chat = document.getElementById('inboxChat');
    chat.innerHTML = `
        <div class="chat-header">
            <img src="${otherAvatar || 'https://randomuser.me/api/portraits/lego/1.jpg'}"
                 style="width:40px;height:40px;border-radius:50%;object-fit:cover;">
            <div style="flex:1;min-width:0;">
                <div style="font-weight:600;">${escapeHtml(otherName)}</div>
                <div style="font-size:12px;opacity:0.6;">Sobre: ${escapeHtml(conv.product_name)}</div>
            </div>
            <div class="chat-product-thumb">
                ${conv.product_image
                    ? `<img src="${conv.product_image}" style="width:44px;height:44px;border-radius:8px;object-fit:cover;">`
                    : `<div style="width:44px;height:44px;border-radius:8px;background:#e5e7eb;display:flex;align-items:center;justify-content:center;">📦</div>`}
                <span style="font-size:13px;font-weight:600;color:#7c3aed;">RD$${conv.product_price}</span>
            </div>
        </div>
        <div class="chat-messages" id="chatMessages"></div>
        <div class="chat-input-row">
            <input type="text" id="chatInput" class="chat-input" placeholder="Escribe un mensaje..."
                   onkeydown="if(event.key==='Enter') sendChatMessage()">
            <button class="chat-send-btn" onclick="sendChatMessage()">
                <span class="material-icons">send</span>
            </button>
        </div>
    `;

    // Cargar mensajes
    const messages = await dbGetMessages(convId);
    renderChatMessages(messages);
}

function renderChatMessages(messages) {
    const container = document.getElementById('chatMessages');
    if (!container) return;
    if (messages.length === 0) {
        container.innerHTML = `<div style="text-align:center;opacity:0.5;padding:20px;">Saluda 👋</div>`;
        return;
    }
    container.innerHTML = messages.map(msg => {
        const isMine = msg.sender_id === currentUser.id;
        return `
            <div class="chat-bubble-row ${isMine ? 'mine' : 'theirs'}">
                ${!isMine ? `<img src="${msg.sender_avatar || 'https://randomuser.me/api/portraits/lego/1.jpg'}"
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

async function sendChatMessage() {
    const input = document.getElementById('chatInput');
    if (!input || !input.value.trim()) return;
    if (!currentUser) return;

    const conv = conversations.find(c => c.id === activeConvId);
    if (!conv) return;

    await dbSendMessage(activeConvId, {
        id:     currentUser.id,
        name:   currentUser.name,
        avatar: currentUser.avatar,
        text:   input.value.trim(),
    });

    input.value = '';
    const messages = await dbGetMessages(activeConvId);
    renderChatMessages(messages);
    renderInbox();
}

// ============================================
// PUBLICAR PRODUCTO (a Supabase)
// ============================================
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

async function crearYGuardarProducto(title, desc, price, category, imageBase64) {
    try {
        const nuevoProducto = {
            id:           Date.now(),
            name:         title,
            description:  desc || "Sin descripción",
            price:        price,
            category:     category,
            image:        imageBase64,
            seller:       currentUser.name,
            sellerId:     currentUser.id,
            sellerAvatar: currentUser.avatar || "https://randomuser.me/api/portraits/lego/1.jpg",
        };

        await dbCreateProduct(nuevoProducto);
        clearPublishForm();
        closePublishModal();
        await renderProducts();
        showNotification(`✅ ¡${title} publicado en Linca!`, "success");
    } catch (e) {
        showNotification("❌ Error al publicar: " + e.message, "error");
    }
}

function clearPublishForm() {
    ["productTitle","productDesc"].forEach(id => document.getElementById(id).value = "");
    document.getElementById("productPriceInput").value = "";
    const ii = document.getElementById("productImageInput"); if (ii) ii.value = "";
    const ip = document.getElementById("imagePreview"); if (ip) ip.innerHTML = "";
}

// ============================================
// LOGIN / REGISTRO (con Supabase)
// ============================================
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

async function register() {
    const name     = document.getElementById("regName").value.trim();
    const email    = document.getElementById("regEmail").value.trim();
    const password = document.getElementById("regPassword").value;
    const avatarEl = document.getElementById("regAvatar");
    const file     = avatarEl ? avatarEl.files[0] : null;

    if (!name || !email || !password) { showNotification("Completa todos los campos", "error"); return; }

    // Verificar si el email ya existe
    const existing = await dbGetUser(email);
    if (existing) { showNotification("El email ya está registrado", "error"); return; }

    if (file) {
        const r = new FileReader();
        r.onload = e => createUser(name, email, password, e.target.result);
        r.readAsDataURL(file);
    } else {
        createUser(name, email, password, "https://randomuser.me/api/portraits/lego/1.jpg");
    }
}

async function createUser(name, email, password, avatarUrl) {
    try {
        const newUser = {
            id:       Date.now(),
            name,
            email,
            password,
            avatar:   avatarUrl,
            joinDate: new Date().toLocaleDateString()
        };

        await dbCreateUser(newUser);
        currentUser = newUser;
        localStorage.setItem('linca_currentUser', JSON.stringify(currentUser));
        closeLoginModal(); updateUIForUser();
        showNotification(`🎉 ¡Bienvenido ${name} a Linca!`, "success");
        renderProducts();
        ["regName","regEmail","regPassword"].forEach(id => document.getElementById(id).value = "");
        const ra = document.getElementById("regAvatar"); if (ra) ra.value = "";
    } catch (e) {
        showNotification("❌ Error al registrar: " + e.message, "error");
    }
}

async function login() {
    const email    = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    try {
        const user = await dbGetUser(email);
        if (user && user.password === password) {
            currentUser = {
                id:              user.id,
                name:            user.name,
                email:           user.email,
                password:        user.password,
                avatar:          user.avatar,
                stripeAccountId: user.stripe_account_id,
                joinDate:        user.join_date,
            };
            localStorage.setItem('linca_currentUser', JSON.stringify(currentUser));
            closeLoginModal(); updateUIForUser();
            showNotification(`👋 ¡Bienvenido de vuelta ${user.name}!`, "success");
            renderProducts();
            document.getElementById("loginEmail").value = "";
            document.getElementById("loginPassword").value = "";
        } else {
            showNotification("Email o contraseña incorrectos", "error");
        }
    } catch (e) {
        showNotification("❌ Error al iniciar sesión", "error");
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('linca_currentUser');
    activeConvId = null;
    updateUIForUser();
    showNotification("Sesión cerrada", "info");
    renderProducts();
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

// ============================================
// NAVEGACIÓN
// ============================================
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
            document.getElementById("messagesSection").style.display = "block"; renderInbox(); break;
        case 'cart':     document.getElementById("cartSection").style.display = "block"; renderCart(); break;
        case 'settings':
            if (!currentUser) { showNotification("Inicia sesión para la configuración", "error"); openLoginModal(); return; }
            document.getElementById("settingsSection").style.display = "block"; loadSettingsData(); break;
    }
}

// ============================================
// CONFIGURACIÓN
// ============================================
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

async function saveProfile() {
    if (!currentUser) return;
    const newName = document.getElementById("settingsName").value.trim();
    const file    = document.getElementById("settingsAvatar").files[0];
    if (!newName) { showNotification("❌ El nombre no puede estar vacío", "error"); return; }

    const doSave = async (avatarUrl) => {
        currentUser.name = newName;
        if (avatarUrl) currentUser.avatar = avatarUrl;
        await dbUpdateUser(currentUser);
        localStorage.setItem('linca_currentUser', JSON.stringify(currentUser));
        updateUIForUser();
        showNotification("✅ Perfil actualizado", "success");
    };

    if (file) { const r = new FileReader(); r.onload = e => doSave(e.target.result); r.readAsDataURL(file); }
    else doSave(null);
}

async function changePassword() {
    if (!currentUser) return;
    const cur  = document.getElementById("currentPassword").value;
    const nw   = document.getElementById("newPassword").value;
    const conf = document.getElementById("confirmPassword").value;
    if (cur !== currentUser.password) { showNotification("❌ Contraseña actual incorrecta", "error"); return; }
    if (!nw || nw.length < 4) { showNotification("❌ Mínimo 4 caracteres", "error"); return; }
    if (nw !== conf) { showNotification("❌ Las contraseñas no coinciden", "error"); return; }
    currentUser.password = nw;
    await dbUpdateUser(currentUser);
    localStorage.setItem('linca_currentUser', JSON.stringify(currentUser));
    ["currentPassword","newPassword","confirmPassword"].forEach(id => document.getElementById(id).value = "");
    showNotification("✅ Contraseña actualizada", "success");
}

async function renderMyProducts() {
    const container = document.getElementById("myProductsContainer");
    if (!container || !currentUser) return;
    container.innerHTML = '<div style="text-align:center;padding:20px;">Cargando...</div>';

    const myProds = products.filter(p => (p.seller_id || p.sellerId) === currentUser.id);
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

async function saveEditProduct() {
    const id       = parseInt(document.getElementById("editProductId").value);
    const title    = document.getElementById("editProductTitle").value.trim();
    const desc     = document.getElementById("editProductDesc").value;
    const price    = parseFloat(document.getElementById("editProductPrice").value);
    const category = document.getElementById("editProductCategory").value;
    if (!title) { showNotification("❌ El título no puede estar vacío", "error"); return; }
    if (isNaN(price) || price <= 0) { showNotification("❌ Precio inválido", "error"); return; }

    const idx = products.findIndex(p => p.id === id);
    if (idx !== -1) {
        products[idx] = { ...products[idx], name: title, description: desc, price, category };
        await dbUpdateProduct(products[idx]);
        renderMyProducts(); renderProducts(); closeEditModal();
        showNotification("✅ Producto actualizado", "success");
    }
}

async function deleteProduct(productId) {
    if (!confirm("¿Seguro que quieres eliminar este producto?")) return;
    await dbDeleteProduct(productId);
    products = products.filter(p => p.id !== productId);
    renderMyProducts(); renderProducts();
    showNotification("🗑️ Producto eliminado", "info");
}

// ============================================
// MODALES
// ============================================
function openLoginModal()    { document.getElementById("loginModal").style.display = "flex"; }
function closeLoginModal()   { document.getElementById("loginModal").style.display = "none"; }

function openPublishModal() {
    if (!currentUser) { showNotification("Inicia sesión para publicar", "error"); openLoginModal(); return; }
    if (!currentUser.stripeAccountId) {
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
    const imgDiv = document.getElementById("modalProductImg");
    if (product.image) {
        imgDiv.style.cssText = `background-image:url('${product.image}');background-size:cover;background-position:center;`;
        imgDiv.innerHTML = '';
    } else {
        imgDiv.style.cssText = "background:#f5f0ff;display:flex;align-items:center;justify-content:center;";
        imgDiv.innerHTML = `<span style="font-size:48px;">📦</span>`;
    }
    const avatar = product.seller_avatar || product.sellerAvatar;
    document.getElementById("modalSellerRow").innerHTML = `
        <img src="${avatar}" style="width:28px;height:28px;border-radius:50%;object-fit:cover;">
        <span>Vendido por <strong>${escapeHtml(product.seller)}</strong></span>
    `;
    document.getElementById("paymentModal").style.display = "flex";
}
function closePaymentModal() { document.getElementById("paymentModal").style.display = "none"; }

function processPayment(method) {
    const name  = document.getElementById("modalProductName").innerText;
    const price = parseFloat(document.getElementById("modalProductPrice").innerText);
    const prod  = products.find(p => p.name === name);
    const sellerId = prod?.seller_id || prod?.sellerId;
    closePaymentModal();
    redirectToStripeCheckout(name, price, prod?.id, sellerId);
}

function selectPayMethod(method) {
    document.querySelectorAll('.payment-method-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('btn' + method.charAt(0).toUpperCase() + method.slice(1)).classList.add('active');
}

// ============================================
// INIT
// ============================================
document.addEventListener("DOMContentLoaded", async () => {
    applyTheme(currentTheme);
    updateUIForUser();
    updateCartCount();
    await renderProducts();

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

// ============================================
// GLOBALES
// ============================================
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
window.sendChatMessage=sendChatMessage; window.selectPayMethod=selectPayMethod;
window.connectSellerStripeAccount=connectSellerStripeAccount;