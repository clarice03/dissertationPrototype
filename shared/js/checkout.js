import { products, currency } from './products.js';
import { readCart, writeCart } from './store.js';
import { createEventLogger } from './logger.js';

const logger = createEventLogger({ enabled: false });
const cart = readCart();
const money = value => currency.format(Number(value) || 0);
const productFor = item => products.find(product => product.id === item.id);
const linePrice = item => Number(productFor(item)?.price ?? item.price) || 0;
const quantity = item => Math.min(10, Math.max(1, Number(item.quantity) || 1));
const itemCount = cart.reduce((sum, item) => sum + quantity(item), 0);
const subtotal = cart.reduce((sum, item) => sum + linePrice(item) * quantity(item), 0);
const shipping = subtotal === 0 || subtotal >= 100 ? 0 : 5;

document.querySelectorAll('.cart-count').forEach(element => { element.textContent = itemCount; });
document.querySelector('.cart-page-link').setAttribute('aria-label', `Shopping bag, ${itemCount} ${itemCount === 1 ? 'item' : 'items'}`);

const layout = document.querySelector('#checkout-layout');
const emptyMessage = document.querySelector('#checkout-empty');
if (!cart.length) {
  layout.hidden = true;
  emptyMessage.hidden = false;
} else {
  try { sessionStorage.removeItem('lowkey:last-demo-order'); } catch { /* session storage may be unavailable */ }
  document.querySelector('#checkout-items').innerHTML = cart.map(item => {
    const product = productFor(item);
    return `<div class="checkout-item"><div><strong>${escapeText(product?.name || item.name || 'LOWKEY item')}</strong><p>${escapeText(item.colour)} · Size ${escapeText(item.size)} · Qty ${quantity(item)}</p></div><span>${money(linePrice(item) * quantity(item))}</span></div>`;
  }).join('');
  document.querySelector('#checkout-subtotal').textContent = money(subtotal);
  document.querySelector('#checkout-shipping').textContent = shipping === 0 ? 'FREE' : money(shipping);
  document.querySelector('#checkout-total').textContent = money(subtotal + shipping);
  logger.log('checkout_started', { itemCount, subtotal, shipping });
}

function escapeText(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

const form = document.querySelector('#checkout-form');
form.addEventListener('submit', event => {
  event.preventDefault();
  const error = document.querySelector('#checkout-error');
  if (!form.checkValidity()) {
    error.textContent = 'Complete the required fictional details and choose a simulated payment method.';
    form.reportValidity();
    return;
  }
  if (!readCart().length) {
    window.location.assign('cart.html');
    return;
  }

  const orderNumber = `LK-${globalThis.crypto?.randomUUID?.().replaceAll('-', '').slice(0, 8).toUpperCase() || Math.random().toString(36).slice(2, 10).toUpperCase()}`;
  const receipt = {
    orderNumber,
    items: cart.map(item => ({
      id: item.id,
      name: productFor(item)?.name || item.name || 'LOWKEY item',
      price: linePrice(item),
      quantity: quantity(item),
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
