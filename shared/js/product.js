import { products, currency } from './products.js';
import { addToCart, readCart } from './store.js';
import { createEventLogger } from './logger.js';

const logger = createEventLogger({ enabled: false });
const params = new URLSearchParams(window.location.search);
const product = products.find(item => item.id === params.get('id')) || products[0];
const safe = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const colorValues = { Black: '#171717', Charcoal: '#4d4c49', 'Off-white': '#f3f0e8', Lime: '#b7ff3c', Grey: '#9c9b98', Olive: '#687355' };
let selectedSize = product.sizes.length === 1 ? product.sizes[0] : '';
let selectedColour = product.colours[0];
let quantity = 1;

document.title = `${product.name} — LOWKEY`;
document.querySelector('meta[name="description"]').content = `${product.description} Shop ${product.name} at LOWKEY.`;
document.querySelector('#breadcrumb-product').textContent = product.name.toUpperCase();
document.querySelector('#product-category').textContent = product.category.toUpperCase();
document.querySelector('#product-name').textContent = product.name;
document.querySelector('#product-price').textContent = currency.format(product.price);
document.querySelector('#product-description').textContent = product.description;
document.querySelector('#detail-information').textContent = `${product.description} Available in ${product.colours.join(', ')}. Sizes: ${product.sizes.join(', ')}.`;
document.querySelector('#detail-image').style.setProperty('--sheet-x', `${product.sheetPosition.x}%`);
document.querySelector('#detail-image').style.setProperty('--sheet-y', `${product.sheetPosition.y}%`);
document.querySelector('#detail-image').setAttribute('aria-label', product.name);

const colourOptions = document.querySelector('#colour-options');
colourOptions.innerHTML = product.colours.map((colour, index) => `<button class="colour-option" type="button" data-colour="${safe(colour)}" aria-label="Choose ${safe(colour)}" aria-pressed="${index === 0}"><span class="colour-swatch" style="background:${colorValues[colour] || '#77746e'}" aria-hidden="true"></span>${safe(colour)}</button>`).join('');
document.querySelector('#selected-colour-label').textContent = `— ${selectedColour}`;

const sizeOptions = document.querySelector('#size-options');
sizeOptions.innerHTML = product.sizes.map(size => `<button class="size-option" type="button" data-size="${safe(size)}" aria-pressed="${size === selectedSize}">${safe(size)}</button>`).join('');

colourOptions.addEventListener('click', event => {
  const button = event.target.closest('.colour-option');
  if (!button) return;
  selectedColour = button.dataset.colour;
  colourOptions.querySelectorAll('.colour-option').forEach(option => option.setAttribute('aria-pressed', String(option === button)));
  document.querySelector('#selected-colour-label').textContent = `— ${selectedColour}`;
});

sizeOptions.addEventListener('click', event => {
  const button = event.target.closest('.size-option');
  if (!button) return;
  selectedSize = button.dataset.size;
  sizeOptions.querySelectorAll('.size-option').forEach(option => option.setAttribute('aria-pressed', String(option === button)));
  document.querySelector('#size-error').textContent = '';
});

const quantityValue = document.querySelector('#quantity-value');
function setQuantity(value) {
  quantity = Math.min(10, Math.max(1, value));
  quantityValue.value = String(quantity);
  quantityValue.textContent = String(quantity);
}
document.querySelector('#quantity-decrease').addEventListener('click', () => setQuantity(quantity - 1));
document.querySelector('#quantity-increase').addEventListener('click', () => setQuantity(quantity + 1));

function readWishlist() {
  try {
    const saved = JSON.parse(localStorage.getItem('lowkey:wishlist') || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch { return []; }
}
const wishlistButton = document.querySelector('#wishlist-toggle');
function syncWishlist() {
  const saved = readWishlist().includes(product.id);
  wishlistButton.setAttribute('aria-pressed', String(saved));
  wishlistButton.innerHTML = `${saved ? '♥' : '♡'} <span>${saved ? 'SAVED TO WISHLIST' : 'SAVE TO WISHLIST'}</span>`;
}
wishlistButton.addEventListener('click', () => {
  const saved = readWishlist();
  const removing = saved.includes(product.id);
  try { localStorage.setItem('lowkey:wishlist', JSON.stringify(removing ? saved.filter(id => id !== product.id) : [...saved, product.id])); } catch { /* storage may be unavailable */ }
  syncWishlist();
  showToast(removing ? 'Removed from your wishlist' : 'Saved to your wishlist');
});

function renderCart() {
  const cart = readCart();
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll('.cart-count').forEach(element => { element.textContent = count; });
  document.querySelector('.cart-link').setAttribute('aria-label', `Shopping bag, ${count} ${count === 1 ? 'item' : 'items'}`);
  document.querySelector('.cart-items').innerHTML = cart.map(item => `<div class="cart-item"><div><strong>${safe(item.name)}</strong><p>${safe(item.colour)} / ${safe(item.size)} · Qty ${item.quantity}</p></div><span>${currency.format(item.price * item.quantity)}</span></div>`).join('');
  document.querySelector('.cart-empty').hidden = cart.length > 0;
  document.querySelector('.cart-continue').hidden = cart.length > 0;
}

function showToast(message) {
  const toast = document.querySelector('.toast');
  toast.textContent = message;
  toast.classList.add('is-visible');
  window.setTimeout(() => toast.classList.remove('is-visible'), 2200);
}

document.querySelector('#add-to-cart').addEventListener('click', () => {
  if (!selectedSize) {
    document.querySelector('#size-error').textContent = 'Please choose a size before adding this item.';
    sizeOptions.querySelector('.size-option')?.focus();
    return;
  }
  addToCart(product, selectedSize, selectedColour, quantity);
  renderCart();
  logger.log('product_added_to_cart', { productId: product.id, size: selectedSize, colour: selectedColour, quantity });
  showToast(`${quantity} × ${product.name} added to your bag`);
});

const cartPanel = document.querySelector('.cart-panel');
const cartScrim = document.querySelector('.cart-scrim');
function setCartOpen(open) {
  cartPanel.classList.toggle('is-open', open);
  cartPanel.setAttribute('aria-hidden', String(!open));
  cartScrim.classList.toggle('is-open', open);
  document.body.classList.toggle('panel-open', open);
  if (open) document.querySelector('.cart-close').focus();
}
document.querySelector('.cart-link').addEventListener('click', () => setCartOpen(true));
document.querySelector('.cart-close').addEventListener('click', () => setCartOpen(false));
cartScrim.addEventListener('click', () => setCartOpen(false));

const menuButton = document.querySelector('.menu-toggle');
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  document.querySelector('.primary-nav').classList.toggle('is-open', open);
});
document.querySelectorAll('.primary-nav a').forEach(link => link.addEventListener('click', () => {
  menuButton.setAttribute('aria-expanded', 'false');
  document.querySelector('.primary-nav').classList.remove('is-open');
}));

syncWishlist();
renderCart();
logger.log('product_viewed', { productId: product.id, category: product.category });
