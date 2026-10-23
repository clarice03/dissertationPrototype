import { products } from './products.js';

const CART_KEY = 'lowkey:cart';

export function readCart() {
  try {
    const cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    return Array.isArray(cart) ? cart : [];
  } catch { return []; }
}

export function summarizeCart(cart = readCart()) {
  const lines = cart.map(item => {
    const product = products.find(entry => entry.id === item.id);
    const quantity = Math.min(10, Math.max(1, Math.floor(Number(item.quantity) || 1)));
    const price = Number(product?.price ?? item.price) || 0;
    return {
      ...item,
      name: product?.name || item.name || 'LOWKEY item',
      category: product?.category || 'LOWKEY',
      product,
      quantity,
      price,
      lineTotal: price * quantity
    };
  });
  const itemCount = lines.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = lines.reduce((sum, item) => sum + item.lineTotal, 0);
  const shipping = subtotal === 0 || subtotal >= 100 ? 0 : 5;
  return { lines, itemCount, subtotal, shipping, total: subtotal + shipping };
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
  const addedQuantity = Math.min(10, Math.max(1, Math.floor(Number(quantity) || 1)));
  if (existing) existing.quantity = Math.min(10, Math.max(1, Number(existing.quantity) || 1) + addedQuantity);
  else cart.push({ id: product.id, name: product.name, price: product.price, size, colour, quantity: addedQuantity });
  writeCart(cart);
  return cart;
}
