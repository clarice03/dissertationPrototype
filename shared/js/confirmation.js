import { currency } from './products.js';

const safe = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const money = value => currency.format(Number(value) || 0);
let receipt;
try { receipt = JSON.parse(sessionStorage.getItem('lowkey:last-demo-order') || 'null'); } catch { receipt = null; }

const validReceipt = receipt && typeof receipt.orderNumber === 'string' && Array.isArray(receipt.items) && receipt.items.length > 0;
document.querySelector('#confirmation-content').hidden = !validReceipt;
document.querySelector('#confirmation-missing').hidden = Boolean(validReceipt);
document.querySelectorAll('.cart-count').forEach(element => { element.textContent = '0'; });

if (validReceipt) {
  document.querySelector('#order-number').textContent = receipt.orderNumber;
  document.querySelector('#receipt-subtotal').textContent = money(receipt.subtotal);
  document.querySelector('#receipt-shipping').textContent = Number(receipt.shipping) === 0 ? 'FREE' : money(receipt.shipping);
  document.querySelector('#receipt-total').textContent = money(receipt.total);
  document.querySelector('#receipt-items').innerHTML = receipt.items.map(item => `<div class="checkout-item"><div><strong>${safe(item.name)}</strong><p>${safe(item.colour)} · Size ${safe(item.size)} · Qty ${Math.max(1, Number(item.quantity) || 1)}</p></div><span>${money(Number(item.price) * Math.max(1, Number(item.quantity) || 1))}</span></div>`).join('');
}

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
