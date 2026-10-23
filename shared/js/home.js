import { products, currency } from './products.js';
import { addToCart, readCart, summarizeCart } from './store.js';
import { createEventLogger } from './logger.js';

const logger = createEventLogger({ enabled: false });
const grid = document.querySelector('#product-grid');
const safe = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const WISHLIST_KEY = 'lowkey:wishlist';

function readWishlist() {
  try {
    const saved = JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch { return []; }
}

const heroSlides = [
  {
    eyebrow: 'INDEPENDENT STREETWEAR · EST. 2026',
    title: 'NOTHING<br>TO <span>PROVE.</span>',
    subtitle: 'Streetwear for the unwritten.',
    cta: 'SHOP THE DROP',
    href: 'shop.html',
    image: '../images/logos/Screenshot%202026-09-05%20at%2019.12.55.png',
    alt: 'LOWKEY illustrated character wearing an acid lime hoodie'
  },
  {
    eyebrow: 'BUILT FOR EVERYDAY MOVEMENT',
    title: 'BUILT<br><span>DIFFERENT.</span>',
    subtitle: 'Made to move. Made to last.',
    cta: 'SHOP THE DROP',
    href: 'shop.html',
    image: null,
    alt: ''
  },
  {
    eyebrow: 'NO RULES. NO APPROVAL.',
    title: 'WEAR IT<br><span>YOUR WAY.</span>',
    subtitle: 'Your style. Your call.',
    cta: 'EXPLORE COLLECTION',
    href: '#categories',
    image: null,
    alt: ''
  }
];

let activeHeroSlide = 0;
function showHeroSlide(index) {
  activeHeroSlide = (index + heroSlides.length) % heroSlides.length;
  const slide = heroSlides[activeHeroSlide];
  document.querySelector('.hero-eyebrow-text').textContent = slide.eyebrow;
  document.querySelector('#hero-title').innerHTML = slide.title;
  document.querySelector('.hero-subtitle').textContent = slide.subtitle;
  const cta = document.querySelector('.hero-cta');
  cta.href = slide.href;
  cta.innerHTML = `${slide.cta} <span aria-hidden="true">↗</span>`;
  const artwork = document.querySelector('.hero-art-image');
  const hero = document.querySelector('.hero');
  hero.classList.toggle('is-text-only', !slide.image);
  document.querySelector('.hero-art').hidden = !slide.image;
  if (slide.image) artwork.src = slide.image;
  artwork.alt = slide.alt;
  document.querySelector('.hero-current').textContent = String(activeHeroSlide + 1).padStart(2, '0');
  document.querySelector('.index-progress').style.width = `${((activeHeroSlide + 1) / heroSlides.length) * 100}%`;
}
document.querySelector('.hero-prev').addEventListener('click', () => showHeroSlide(activeHeroSlide - 1));
document.querySelector('.hero-next').addEventListener('click', () => showHeroSlide(activeHeroSlide + 1));
showHeroSlide(0);

function productCard(product) {
  return `<article class="product-card">
    <div class="product-visual"><a class="product-view-link" href="product.html?id=${encodeURIComponent(product.id)}" aria-label="View ${safe(product.name)} details"><div class="product-image" role="img" aria-label="${safe(product.name)}" style="--sheet-x:${product.sheetPosition.x}%;--sheet-y:${product.sheetPosition.y}%"></div></a><button class="wishlist-button" type="button" data-wishlist-id="${safe(product.id)}" aria-label="Save ${safe(product.name)} to wishlist" aria-pressed="false">♡</button><span class="product-badge">NEW DROP</span></div>
    <div class="product-info"><div><h3><a href="product.html?id=${encodeURIComponent(product.id)}">${safe(product.name)}</a></h3><p>${safe(product.category)} <span>·</span> ${product.sizes.join(' / ')}</p></div><strong>${currency.format(product.price)}</strong></div>
    <button class="quick-add" type="button" data-product-id="${safe(product.id)}">QUICK ADD <span aria-hidden="true">+</span></button>
    </article>`;
}

grid.innerHTML = products.filter(product => product.featured).map(productCard).join('');
grid.querySelectorAll('.wishlist-button').forEach(button => {
  const saved = readWishlist().includes(button.dataset.wishlistId);
  const product = products.find(item => item.id === button.dataset.wishlistId);
  button.setAttribute('aria-pressed', String(saved));
  button.setAttribute('aria-label', `${saved ? 'Remove' : 'Save'} ${product.name} ${saved ? 'from' : 'to'} wishlist`);
  button.textContent = saved ? '♥' : '♡';
});

const renderCart = () => {
  const cart = readCart();
  const summary = summarizeCart(cart);
  const count = summary.itemCount;
  document.querySelectorAll('.cart-count').forEach(el => { el.textContent = count; });
  const cartButton = document.querySelector('.cart-link');
  cartButton.setAttribute('aria-label', `Shopping bag, ${count} ${count === 1 ? 'item' : 'items'}`);
  const items = document.querySelector('.cart-items');
  items.innerHTML = summary.lines.map(item => `<div class="cart-item"><div><strong>${safe(item.name)}</strong><p>${safe(item.colour)} / ${safe(item.size)} · Qty ${item.quantity}</p></div><span>${currency.format(item.lineTotal)}</span></div>`).join('');
  document.querySelector('.cart-empty').hidden = cart.length > 0;
  document.querySelector('.cart-continue').hidden = cart.length > 0;
};

document.addEventListener('click', event => {
  const addButton = event.target.closest('.quick-add');
  if (addButton) {
    const product = products.find(item => item.id === addButton.dataset.productId);
    addToCart(product);
    logger.log('product_added_to_cart', { productId: product.id, quantity: 1 });
    renderCart();
    document.querySelector('.toast').textContent = `${product.name} added to your bag`;
    document.querySelector('.toast').classList.add('is-visible');
    window.setTimeout(() => document.querySelector('.toast').classList.remove('is-visible'), 2400);
  }
  const wishlist = event.target.closest('.wishlist-button');
  if (wishlist) {
    const saved = readWishlist();
    const productId = wishlist.dataset.wishlistId;
    const product = products.find(item => item.id === productId);
    const removing = saved.includes(productId);
    const nextSaved = removing ? saved.filter(id => id !== productId) : [...saved, productId];
    try { localStorage.setItem(WISHLIST_KEY, JSON.stringify(nextSaved)); } catch { /* storage may be unavailable */ }
    wishlist.setAttribute('aria-pressed', String(!removing));
    wishlist.setAttribute('aria-label', `${removing ? 'Save' : 'Remove'} ${product.name} ${removing ? 'to' : 'from'} wishlist`);
    wishlist.textContent = removing ? '♡' : '♥';
    document.querySelector('.toast').textContent = removing ? 'Removed from your wishlist' : 'Saved to your wishlist';
    document.querySelector('.toast').classList.add('is-visible');
    window.setTimeout(() => document.querySelector('.toast').classList.remove('is-visible'), 2000);
  }
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
document.querySelector('.cart-continue').addEventListener('click', () => setCartOpen(false));
cartScrim.addEventListener('click', () => setCartOpen(false));

const searchPanel = document.querySelector('.search-panel');
const searchScrim = document.querySelector('.search-scrim');
const searchInput = document.querySelector('#site-search');
function setSearchOpen(open) {
  searchPanel.classList.toggle('is-open', open);
  searchPanel.setAttribute('aria-hidden', String(!open));
  searchScrim.classList.toggle('is-open', open);
  if (open) searchInput.focus();
}
document.querySelector('.search-toggle').addEventListener('click', () => setSearchOpen(true));
document.querySelector('.search-close').addEventListener('click', () => setSearchOpen(false));
searchScrim.addEventListener('click', () => setSearchOpen(false));
searchInput.addEventListener('input', () => {
  const query = searchInput.value.trim().toLowerCase();
  const matching = query ? products.filter(item => `${item.name} ${item.category}`.toLowerCase().includes(query)) : [];
  document.querySelector('.search-results').innerHTML = matching.length
    ? matching.map(item => `<a class="search-result" href="shop.html?search=${encodeURIComponent(query)}"><span>${safe(item.name)}</span><strong>${currency.format(item.price)}</strong></a>`).join('')
    : query ? '<p class="search-empty">No pieces found. Try another search.</p>' : '<p class="search-empty">Search the LOWKEY collection.</p>';
});
searchInput.addEventListener('keydown', event => {
  if (event.key === 'Enter' && searchInput.value.trim()) {
    logger.log('product_searched', { query: searchInput.value.trim() });
    window.location.href = `shop.html?search=${encodeURIComponent(searchInput.value.trim())}`;
  }
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

renderCart();
window.addEventListener('storage', event => {
  if (event.key === 'lowkey:cart') renderCart();
});
logger.log('session_started', { page: 'home' });
