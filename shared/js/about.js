import { currency } from './products.js';
import { readCart, summarizeCart } from './store.js';

const safe = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

function renderCart() {
  const cart = readCart();
  const summary = summarizeCart(cart);
  const count = summary.itemCount;
  document.querySelectorAll('.cart-count').forEach(element => { element.textContent = count; });
  document.querySelector('.cart-link').setAttribute('aria-label', `Shopping bag, ${count} ${count === 1 ? 'item' : 'items'}`);
  document.querySelector('.cart-items').innerHTML = summary.lines.map(item => `<div class="cart-item"><div><strong>${safe(item.name)}</strong><p>${safe(item.colour)} / ${safe(item.size)} · Qty ${item.quantity}</p></div><span>${currency.format(item.lineTotal)}</span></div>`).join('');
  document.querySelector('.cart-empty').hidden = cart.length > 0;
  document.querySelector('.cart-continue').hidden = cart.length > 0;
}

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

renderCart();
window.addEventListener('storage', event => {
  if (event.key === 'lowkey:cart') renderCart();
});
