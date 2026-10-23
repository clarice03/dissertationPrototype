import { products, currency } from './products.js';
import { readCart, setCartQuantity, removeCartItem } from './store.js';
import { createEventLogger } from './logger.js';

const logger = createEventLogger({ enabled: false });
const itemHost = document.querySelector('#bag-items');
const safe = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const money = value => currency.format(Number(value) || 0);

function renderBag() {
  const cart = readCart();
  const count = cart.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  const subtotal = cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0);
  const shipping = subtotal === 0 || subtotal >= 100 ? 0 : 5;
  const hasItems = cart.length > 0;

  document.querySelectorAll('.cart-count').forEach(el => { el.textContent = count; });
  document.querySelector('.cart-link').setAttribute('aria-label', `Shopping bag, ${count} ${count === 1 ? 'item' : 'items'}`);
  document.querySelector('#cart-heading-count').textContent = `(${count})`;
  document.querySelector('#cart-subtotal').textContent = money(subtotal);
  document.querySelector('#cart-shipping').textContent = shipping === 0 && subtotal > 0 ? 'FREE' : money(shipping);
  document.querySelector('#cart-total').textContent = money(subtotal + shipping);
  document.querySelector('#shipping-note').textContent = subtotal === 0
    ? 'Shipping is simulated.'
    : subtotal >= 100 ? 'Your order qualifies for simulated free delivery.' : `Add ${money(100 - subtotal)} for simulated free delivery.`;
  document.querySelector('#empty-bag').hidden = hasItems;
  document.querySelector('.checkout-placeholder').disabled = !hasItems;
  document.querySelector('.cart-empty').hidden = hasItems;
  document.querySelector('.cart-continue').hidden = hasItems;

  itemHost.innerHTML = cart.map((item, index) => {
    const product = products.find(entry => entry.id === item.id);
    const name = product?.name || item.name || 'LOWKEY item';
    const price = Number(product?.price ?? item.price) || 0;
    const quantity = Math.min(10, Math.max(1, Number(item.quantity) || 1));
    const position = product?.sheetPosition;
    const imageStyle = position ? `--sheet-x:${position.x}%;--sheet-y:${position.y}%` : '';
    return `<article class="bag-item">
      <a class="bag-item-image" href="product.html?id=${encodeURIComponent(item.id)}" role="img" aria-label="${safe(name)}" style="${imageStyle}"></a>
      <div class="bag-item-details"><p class="bag-item-category">${safe(product?.category || 'LOWKEY')}</p><h3><a href="product.html?id=${encodeURIComponent(item.id)}">${safe(name)}</a></h3><p class="bag-item-variant">${safe(item.colour)} <span aria-hidden="true">·</span> Size ${safe(item.size)}</p>
        <div class="bag-item-controls"><div class="bag-quantity" role="group" aria-label="Quantity for ${safe(name)}"><button type="button" data-action="decrease" data-index="${index}" aria-label="Decrease ${safe(name)} quantity"${quantity <= 1 ? ' disabled' : ''}>−</button><output>${quantity}</output><button type="button" data-action="increase" data-index="${index}" aria-label="Increase ${safe(name)} quantity"${quantity >= 10 ? ' disabled' : ''}>+</button></div><button class="bag-remove" type="button" data-action="remove" data-index="${index}">REMOVE</button></div>
      </div><strong class="bag-item-price">${money(price * quantity)}</strong>
    </article>`;
  }).join('');
}

function showToast(message) {
  const toast = document.querySelector('.toast');
  toast.textContent = message;
  toast.classList.add('is-visible');
  window.setTimeout(() => toast.classList.remove('is-visible'), 2200);
}

itemHost.addEventListener('click', event => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const index = Number(button.dataset.index);
  const item = readCart()[index];
  if (!item) return;

  if (button.dataset.action === 'remove') {
    removeCartItem(index);
    logger.log('product_removed_from_cart', { productId: item.id, size: item.size, colour: item.colour, quantity: item.quantity });
    showToast(`${item.name || 'Item'} removed from your bag`);
    renderBag();
    return;
  }

  const change = button.dataset.action === 'increase' ? 1 : -1;
  const quantity = Math.min(10, Math.max(1, Number(item.quantity || 1) + change));
  setCartQuantity(index, quantity);
  logger.log('cart_updated', { productId: item.id, size: item.size, colour: item.colour, quantity });
  renderBag();
  itemHost.querySelector(`[data-action="${button.dataset.action}"][data-index="${index}"]`)?.focus();
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

window.addEventListener('storage', event => {
  if (event.key === 'lowkey:cart') renderBag();
});
renderBag();
logger.log('session_started', { page: 'cart' });
