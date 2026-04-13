// ============================================
// Linca — Conexión con Supabase
// Base de datos compartida para todos los usuarios
// ============================================
const SUPABASE_URL  = 'https://tyedekdpfgfpnetygifh.supabase.co';
const SUPABASE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5ZWRla2RwZmdmcG5ldHlnaWZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMDc3NTYsImV4cCI6MjA5MTY4Mzc1Nn0.mT5XRGXb4Ou-EctmVdPqAGAzSfsHH7R6oeLNhX9CVoU';

// ── Cliente Supabase ──────────────────────────
const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_KEY);

// ============================================
// USUARIOS
// ============================================
async function dbGetUser(email) {
    const { data } = await db.from('users').select('*').eq('email', email).single();
    return data;
}

async function dbCreateUser(user) {
    const { data, error } = await db.from('users').insert([{
        id:                user.id,
        name:              user.name,
        email:             user.email,
        password:          user.password,
        avatar:            user.avatar,
        stripe_account_id: user.stripeAccountId || null,
        join_date:         user.joinDate
    }]).select().single();
    if (error) throw error;
    return data;
}

async function dbUpdateUser(user) {
    const { error } = await db.from('users').update({
        name:              user.name,
        avatar:            user.avatar,
        password:          user.password,
        stripe_account_id: user.stripeAccountId || null,
    }).eq('id', user.id);
    if (error) throw error;
}

// ============================================
// PRODUCTOS
// ============================================
async function dbGetProducts() {
    const { data } = await db.from('products').select('*').order('date', { ascending: false });
    return data || [];
}

async function dbCreateProduct(product) {
    const { data, error } = await db.from('products').insert([{
        id:           product.id,
        name:         product.name,
        description:  product.description,
        price:        product.price,
        category:     product.category,
        image:        product.image,
        seller:       product.seller,
        seller_id:    product.sellerId,
        seller_avatar: product.sellerAvatar,
    }]).select().single();
    if (error) throw error;
    return data;
}

async function dbUpdateProduct(product) {
    const { error } = await db.from('products').update({
        name:        product.name,
        description: product.description,
        price:       product.price,
        category:    product.category,
    }).eq('id', product.id);
    if (error) throw error;
}

async function dbDeleteProduct(productId) {
    const { error } = await db.from('products').delete().eq('id', productId);
    if (error) throw error;
}

// ============================================
// FAVORITOS
// ============================================
async function dbGetFavorites(userId) {
    const { data } = await db.from('favorites').select('product_id').eq('user_id', userId);
    return (data || []).map(f => f.product_id);
}

async function dbAddFavorite(userId, productId) {
    await db.from('favorites').insert([{ user_id: userId, product_id: productId }]);
}

async function dbRemoveFavorite(userId, productId) {
    await db.from('favorites').delete().eq('user_id', userId).eq('product_id', productId);
}

// ============================================
// COMPRAS
// ============================================
async function dbGetPurchases(userId) {
    const { data } = await db.from('purchases').select('*').eq('user_id', userId).order('id', { ascending: false });
    return data || [];
}

async function dbCreatePurchase(userId, item) {
    await db.from('purchases').insert([{
        user_id:    userId,
        product_id: item.id,
        name:       item.name,
        price:      item.price,
        date:       new Date().toLocaleString()
    }]);
}

// ============================================
// CONVERSACIONES
// ============================================
async function dbGetConversations(userId) {
    const { data } = await db.from('conversations')
        .select('*')
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
        .order('last_date', { ascending: false });
    return data || [];
}

async function dbGetOrCreateConversation(productId, buyerId, sellerId, productData) {
    // Buscar conversación existente
    const { data: existing } = await db.from('conversations')
        .select('*')
        .eq('product_id', productId)
        .eq('buyer_id', buyerId)
        .eq('seller_id', sellerId)
        .single();

    if (existing) return existing;

    // Crear nueva conversación
    const { data, error } = await db.from('conversations').insert([{
        id:             Date.now(),
        product_id:     productId,
        product_name:   productData.productName,
        product_image:  productData.productImage,
        product_price:  productData.productPrice,
        buyer_id:       buyerId,
        buyer_name:     productData.buyerName,
        buyer_avatar:   productData.buyerAvatar,
        seller_id:      sellerId,
        seller_name:    productData.sellerName,
        seller_avatar:  productData.sellerAvatar,
    }]).select().single();

    if (error) throw error;
    return data;
}

// ============================================
// MENSAJES
// ============================================
async function dbGetMessages(conversationId) {
    const { data } = await db.from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('date', { ascending: true });
    return data || [];
}

async function dbSendMessage(conversationId, sender) {
    const { data, error } = await db.from('messages').insert([{
        id:              Date.now(),
        conversation_id: conversationId,
        sender_id:       sender.id,
        sender_name:     sender.name,
        sender_avatar:   sender.avatar,
        text:            sender.text,
    }]).select().single();

    // Actualizar fecha de última actividad
    await db.from('conversations').update({ last_date: new Date().toISOString() }).eq('id', conversationId);

    if (error) throw error;
    return data;
}