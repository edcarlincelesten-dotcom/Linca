// ============================================
// Linca — Stripe Config con Connect
// ============================================
const STRIPE_PUBLIC_KEY = 'pk_test_51TLSIuFYdaYZLA7gGHP1W9kNmGA0vyR3bRROYh5uGIkZFyaGsyPAOHuPKINS0xfq18crHMn0i6oVkalky6x9dQ7H00PMqtaW2T';
const SERVER_URL        = 'https://linca-server-production.up.railway.app';

// ── Pago por producto individual ─────────────
async function redirectToStripeCheckout(productName, productPrice, productId, sellerId) {
    try {
        showNotification('⏳ Procesando pago...', 'info');

        // Buscar stripeAccountId del vendedor
        const users          = JSON.parse(localStorage.getItem('linca_users') || '[]');
        const seller         = users.find(u => u.id === sellerId);
        const sellerStripeId = seller?.stripeAccountId || null;

        const response = await fetch(`${SERVER_URL}/create-checkout-session`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                productName,
                productPrice,
                productId,
                sellerId,
                sellerStripeId // null si no tiene cuenta Connect
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error del servidor');
        }

        const { url } = await response.json();
        window.location.href = url;

    } catch (error) {
        console.error('Error al conectar con Stripe:', error);
        showNotification('❌ Error al procesar el pago. ¿Está el servidor corriendo?', 'error');
    }
}

// ── Pagar carrito completo ───────────────────
async function redirectToStripeCheckoutCart(cartItems) {
    try {
        showNotification('⏳ Procesando carrito...', 'info');

        const response = await fetch(`${SERVER_URL}/create-checkout-cart`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: cartItems })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error del servidor');
        }

        const { url } = await response.json();
        window.location.href = url;

    } catch (error) {
        console.error('Error al procesar carrito:', error);
        showNotification('❌ Error al procesar el carrito. ¿Está el servidor corriendo?', 'error');
    }
}

// ── Conectar cuenta Stripe del vendedor ──────
// Se llama cuando el vendedor quiere publicar y no tiene cuenta Connect
async function connectSellerStripeAccount() {
    const currentUser = JSON.parse(localStorage.getItem('linca_currentUser') || 'null');
    if (!currentUser) return;

    try {
        showNotification('⏳ Preparando tu cuenta de pagos...', 'info');

        const response = await fetch(`${SERVER_URL}/create-connect-link`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId:    currentUser.id,
                userName:  currentUser.name,
                userEmail: currentUser.email
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error del servidor');
        }

        const { url } = await response.json();
        // Redirigir a Stripe para que el vendedor complete su perfil
        window.location.href = url;

    } catch (error) {
        console.error('Error Connect:', error);
        showNotification('❌ Error al conectar cuenta. ¿Está el servidor corriendo?', 'error');
    }
}