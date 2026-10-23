import { products, currency } from './products.js';
import { addToCart, readCart, summarizeCart } from './store.js';
import { createEventLogger } from './logger.js';

const logger = createEventLogger({ enabled: false });
const grid = document.querySelector('#catalog-grid');
const searchInput = document.querySelector('#catalog-search');
const categoryFilter = document.querySelector('#category-filter');
const sizeFilter = document.querySelector('#size-filter');
const minPrice = document.querySelector('#min-price');
const maxPrice = document.querySelector('#max-price');
const sortFilter = document.querySelector('#sort-filter');
const safe = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
let wishlistOnly = false;

function readWishlist() {
  try {
    const saved = JSON.parse(localStorage.getItem('lowkey:wishlist') || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch { return []; }
}

function writeWishlist(ids) {
  try { localStorage.setItem('lowkey:wishlist', JSON.stringify(ids)); } catch { /* storage may be unavailable */ }
}

function productCard(product, savedIds) {
  const sizes = product.sizes.map(size => `<option value="${safe(size)}">${safe(size)}</option>`).join('');
  const selector = product.sizes.length > 1
    ? `<option value="">Select size</option>${sizes}`
    : sizes;
  const buttonDisabled = product.sizes.length > 1 ? ' disabled' : '';
  const selected = product.sizes.length === 1 ? ' selected' : '';
  const isSaved = savedIds.includes(product.id);

  return `<article class="product-card shop-product-card">
    <div class="product-visual"><a class="product-view-link" href="product.html?id=${encodeURIComponent(product.id)}" aria-label="View ${safe(product.name)} details"><div class="product-image" role="img" aria-label="${safe(product.name)}" style="--sheet-x:${product.sheetPosition.x}%;--sheet-y:${product.sheetPosition.y}%"></div></a><button class="wishlist-button" type="button" data-wishlist-id="${safe(product.id)}" aria-label="${isSaved ? 'Remove' : 'Save'} ${safe(product.name)} ${isSaved ? 'from' : 'to'} wishlist" aria-pressed="${isSaved}">${isSaved ? '♥' : '♡'}</button>${product.featured ? '<span class="product-badge">NEW DROP</span>' : ''}</div>
    <div class="product-info"><div><h3><a href="product.html?id=${encodeURIComponent(product.id)}">${safe(product.name)}</a></h3><p>${safe(product.category)} <span>·</span> ${product.sizes.map(safe).join(' / ')}</p></div><strong>${currency.format(product.price)}</strong></div>
    <label class="shop-size-row"><span>SIZE</span><select class="product-size" aria-label="Choose size for ${safe(product.name)}" data-product-id="${safe(product.id)}"${selected}>${selector}</select></label>
    <button class="quick-add" type="button" data-product-id="${safe(product.id)}"${buttonDisabled}>QUICK ADD <span aria-hidden="true">+</span></button>
  </article>`;
}

function getVisibleProducts() {
  const query = searchInput.value.trim().toLowerCase();
  const category = categoryFilter.value;
  const size = sizeFilter.value;
  const min = minPrice.value === '' ? 0 : Number(minPrice.value);
  const max = maxPrice.value === '' ? Infinity : Number(maxPrice.value);
  const savedIds = readWishlist();

  const visible = products.filter(product => {
    const matchesQuery = !query || `${product.name} ${product.category}`.toLowerCase().includes(query);
    const matchesCategory = category === 'all' || product.category === category;
    const matchesSize = size === 'all' || product.sizes.includes(size);
    const matchesPrice = product.price >= min && product.price <= max;
    const matchesWishlist = !wishlistOnly || savedIds.includes(product.id);
    return matchesQuery && matchesCategory && matchesSize && matchesPrice && matchesWishlist;
  });

  if (sortFilter.value === 'price-asc') visible.sort((a, b) => a.price - b.price);
  if (sortFilter.value === 'price-desc') visible.sort((a, b) => b.price - a.price);
  if (sortFilter.value === 'name-asc') visible.sort((a, b) => a.name.localeCompare(b.name));
  if (sortFilter.value === 'featured') visible.sort((a, b) => Number(b.featured) - Number(a.featured));
  return { visible, savedIds };
}

function renderProducts() {
  const { visible, savedIds } = getVisibleProducts();
  grid.innerHTML = visible.map(product => productCard(product, savedIds)).join('');
  document.querySelector('#result-count').textContent = `${visible.length} ${visible.length === 1 ? 'PIECE' : 'PIECES'}`;
  document.querySelector('#empty-results').hidden = visible.length > 0;
}

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

function showToast(message) {
  const toast = document.querySelector('.toast');
  toast.textContent = message;
  toast.classList.add('is-visible');
  window.setTimeout(() => toast.classList.remove('is-visible'), 2200);
}

const initialCategory = new URLSearchParams(window.location.search).get('category');
if ([...categoryFilter.options].some(option => option.value === initialCategory || option.textContent === initialCategory)) {
  categoryFilter.value = initialCategory;
}
const initialSearch = new URLSearchParams(window.location.search).get('search');
if (initialSearch) searchInput.value = initialSearch;
wishlistOnly = new URLSearchParams(window.location.search).get('wishlist') === '1';
document.querySelector('.wishlist-filter').setAttribute('aria-pressed', String(wishlistOnly));

for (const control of [searchInput, categoryFilter, sizeFilter, minPrice, maxPrice, sortFilter]) {
  control.addEventListener('input', renderProducts);
  control.addEventListener('change', () => {
    renderProducts();
    logger.log('filter_applied', {
      category: categoryFilter.value,
      size: sizeFilter.value,
      minPrice: minPrice.value,
      maxPrice: maxPrice.value,
      sort: sortFilter.value
    });
  });
}

searchInput.addEventListener('keydown', event => {
  if (event.key === 'Enter' && searchInput.value.trim()) logger.log('product_searched', { query: searchInput.value.trim() });
});

document.querySelector('#clear-filters').addEventListener('click', () => {
  searchInput.value = '';
  categoryFilter.value = 'all';
  sizeFilter.value = 'all';
  minPrice.value = '0';
  maxPrice.value = '200';
  sortFilter.value = 'featured';
  wishlistOnly = false;
  document.querySelector('.wishlist-filter').setAttribute('aria-pressed', 'false');
  renderProducts();
});

document.querySelector('.wishlist-filter').addEventListener('click', event => {
  wishlistOnly = !wishlistOnly;
  event.currentTarget.setAttribute('aria-pressed', String(wishlistOnly));
  renderProducts();
});

document.addEventListener('change', event => {
  if (!event.target.matches('.product-size')) return;
  const addButton = event.target.closest('.shop-product-card').querySelector('.quick-add');
  addButton.disabled = !event.target.value;
});

document.addEventListener('click', event => {
  const addButton = event.target.closest('.quick-add');
  if (addButton && !addButton.disabled) {
    const product = products.find(item => item.id === addButton.dataset.productId);
    const size = addButton.closest('.shop-product-card').querySelector('.product-size').value;
    addToCart(product, size, product.colours[0]);
    renderCart();
    logger.log('product_added_to_cart', { productId: product.id, quantity: 1, size });
    showToast(`${product.name} added to your bag`);
  }

  const wishlistButton = event.target.closest('.wishlist-button[data-wishlist-id]');
  if (wishlistButton) {
    const productId = wishlistButton.dataset.wishlistId;
    const savedIds = readWishlist();
    const removing = savedIds.includes(productId);
    writeWishlist(removing ? savedIds.filter(id => id !== productId) : [...savedIds, productId]);
    showToast(removing ? 'Removed from your wishlist' : 'Saved to your wishlist');
    renderProducts();
  }
});

document.querySelector('.shop-search-focus').addEventListener('click', () => {
  searchInput.focus();
  searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
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

renderProducts();
renderCart();
window.addEventListener('storage', event => {
  if (event.key === 'lowkey:cart') renderCart();
});
logger.log('session_started', { page: 'shop' });
