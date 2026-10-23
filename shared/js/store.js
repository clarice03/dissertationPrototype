const CART_KEY = 'lowkey:cart';

export function readCart() {
  try {
    const cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    return Array.isArray(cart) ? cart : [];
  } catch { return []; }
}

export function writeCart(cart) {
  try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch { /* graceful private-mode fallback */ }
}

export function setCartQuantity(index, quantity) {
  const cart = readCart();
  if (!cart[index]) return cart;
  if (quantity <= 0) cart.splice(index, 1);
  else cart[index].quantity = Math.min(10, Math.floor(quantity));
  writeCart(cart);
  return cart;
}

export function removeCartItem(index) {
  const cart = readCart();
  if (index >= 0 && index < cart.length) cart.splice(index, 1);
  writeCart(cart);
  return cart;
}

export function addToCart(product, size = product.sizes[0], colour = product.colours[0], quantity = 1) {
  const cart = readCart();
  const existing = cart.find(item => item.id === product.id && item.size === size && item.colour === colour);
  if (existing) existing.quantity += quantity;
  else cart.push({ id: product.id, name: product.name, price: product.price, size, colour, quantity });
  writeCart(cart);
  return cart;
}
