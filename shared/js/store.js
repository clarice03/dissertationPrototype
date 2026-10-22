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

export function addToCart(product, size = product.sizes[0], colour = product.colours[0]) {
  const cart = readCart();
  const existing = cart.find(item => item.id === product.id && item.size === size && item.colour === colour);
  if (existing) existing.quantity += 1;
  else cart.push({ id: product.id, name: product.name, price: product.price, size, colour, quantity: 1 });
  writeCart(cart);
  return cart;
}
