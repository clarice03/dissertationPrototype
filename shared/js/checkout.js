import { currency } from './products.js';
import { readCart, summarizeCart, writeCart } from './store.js';
import { createEventLogger } from './logger.js';

const logger = createEventLogger({ enabled: false });
const money = value => currency.format(Number(value) || 0);
let cart = [];
let itemCount = 0;
let subtotal = 0;
let shipping = 0;

const layout = document.querySelector('#checkout-layout');
const emptyMessage = document.querySelector('#checkout-empty');
function renderCheckout() {
  const summary = summarizeCart(readCart());
  cart = summary.lines;
  itemCount = summary.itemCount;
  subtotal = summary.subtotal;
  shipping = summary.shipping;
  document.querySelectorAll('.cart-count').forEach(element => { element.textContent = itemCount; });
  document.querySelector('.cart-page-link').setAttribute('aria-label', `Shopping bag, ${itemCount} ${itemCount === 1 ? 'item' : 'items'}`);
  layout.hidden = cart.length === 0;
  emptyMessage.hidden = cart.length > 0;
  if (!cart.length) return;

  document.querySelector('#checkout-items').innerHTML = cart.map(item => {
    return `<div class="checkout-item"><div><strong>${escapeText(item.name)}</strong><p>${escapeText(item.colour)} · Size ${escapeText(item.size)} · Qty ${item.quantity}</p></div><span>${money(item.lineTotal)}</span></div>`;
  }).join('');
  document.querySelector('#checkout-subtotal').textContent = money(subtotal);
  document.querySelector('#checkout-shipping').textContent = shipping === 0 ? 'FREE' : money(shipping);
  document.querySelector('#checkout-total').textContent = money(subtotal + shipping);
}
renderCheckout();
if (cart.length) {
  try { sessionStorage.removeItem('lowkey:last-demo-order'); } catch { /* session storage may be unavailable */ }
  logger.log('checkout_started', { itemCount, subtotal, shipping });
}

function escapeText(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

const form = document.querySelector('#checkout-form');
form.addEventListener('submit', event => {
  event.preventDefault();
  const error = document.querySelector('#checkout-error');
  renderCheckout();
  if (!cart.length) {
    window.location.assign('cart.html');
    return;
  }
  if (!form.checkValidity()) {
    error.textContent = 'Complete the required fictional details and choose a simulated payment method.';
    form.reportValidity();
    return;
  }

  const orderNumber = `LK-${globalThis.crypto?.randomUUID?.().replaceAll('-', '').slice(0, 8).toUpperCase() || Math.random().toString(36).slice(2, 10).toUpperCase()}`;
  const receipt = {
    orderNumber,
    items: cart.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      size: item.size,
      colour: item.colour
    })),
    subtotal,
    shipping,
    total: subtotal + shipping,
    completedAt: new Date().toISOString()
  };

  try {
    sessionStorage.setItem('lowkey:last-demo-order', JSON.stringify(receipt));
  } catch {
    error.textContent = 'This browser could not save the temporary demo receipt. Please enable session storage to complete this simulation.';
    return;
  }

  logger.log('checkout_completed', { orderNumber, itemCount, subtotal, shipping });
  writeCart([]);
  window.location.assign('confirmation.html');
});

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
window.addEventListener('storage', event => {
  if (event.key === 'lowkey:cart') renderCheckout();
});
