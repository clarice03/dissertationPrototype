# LOWKEY research prototypes

Static, vanilla HTML/CSS/JavaScript storefront foundation for the LOWKEY dissertation prototype. The traditional version lives at `/traditional/`; shared assets and modules live in `/shared/`. There is no server-side runtime, checkout provider, participant account system, or analytics service.

## Current scope

The current build includes the **traditional homepage, 50-item shop page, product detail page, cart, simulated checkout, order confirmation, and shared foundation**. It includes the brand styles, responsive navigation, homepage carousel, search, category/size/price filters, sorting, wishlist, mock cart persistence, cart quantity and removal controls, shared product data, and an opt-in local-only event logger.

Supplied LOWKEY PNGs are referenced in `images/logos/` as provided. The 50 product entries use the single `shared/LOWKEY Streetwear Catalog Grid.png` sprite sheet; each record stores a CSS background position for its product tile. Confirm the product names, prices, and imagery before participant testing. Jockey One, Montserrat, and Inter currently load from Google Fonts; local font files should be added if the study must work without third-party font requests or needs stable font rendering.

## Run locally

Use VS Code's Live Server extension, or any static HTTP server, from the repository root. Open `traditional/` (for example, `http://127.0.0.1:5500/traditional/`) for the homepage, `traditional/shop.html` for the catalogue, `traditional/cart.html` for the cart, or `traditional/checkout.html` for the simulated checkout. ES modules need an HTTP server; opening the file directly with `file://` is not supported. The root `index.html` forwards visitors to the traditional prototype.

## Project structure

```text
index.html                 root entry, forwards to traditional/
traditional/index.html     Prototype A homepage
traditional/shop.html      50-product catalogue and filters
traditional/product.html   product details and selection controls
traditional/cart.html      cart review, quantity, removal, and summary
traditional/checkout.html  fictional delivery form and simulated checkout
traditional/confirmation.html session-only demo order receipt
shared/css/site.css        shared design tokens and components
shared/js/products.js      shared 50-item catalogue, prices, and sprite positions
shared/js/store.js         shared mock cart storage operations
shared/js/logger.js        disabled-by-default local event logger
shared/js/home.js          traditional homepage behavior
shared/js/shop.js          catalogue search, filters, sorting, and mock cart
shared/js/product.js       product options, wishlist, and cart behavior
shared/js/cart.js          cart rendering and simulated order summary
shared/js/checkout.js      checkout validation and demo order completion
shared/js/confirmation.js  session-only demo receipt rendering
shared/css/shop.css        catalogue layout and responsive filter styles
shared/css/product.css     responsive product details layout
shared/css/cart.css        responsive cart layout
shared/css/checkout.css    responsive checkout and receipt layout
images/logos/              original supplied brand artwork
shared/LOWKEY Streetwear Catalog Grid.png   single 50-product image sheet
netlify.toml               Netlify static publish and root redirect
_redirects                 Cloudflare Pages root redirect
```

## Product data

Edit `shared/js/products.js`. Keep product IDs stable and unique. Both prototypes must import this same catalogue so names, categories, prices, sizes, colours, and availability stay aligned. Each product's `sheetPosition` selects its tile from the shared catalog image through CSS background positioning. Use identical data in both versions for study comparisons.

## Adding the gamified version

Create `gamified/index.html` and its own version-specific module/styles only when its experimental features are defined. Reuse `shared/css/site.css`, `shared/js/products.js`, and `shared/js/store.js`; preserve the traditional navigation and task flow, product catalogue, prices, and checkout steps. Add only the planned gamified treatments. Mark the version in the root HTML, for example `data-prototype="gamified"`, so event records identify it. There should be no participant-facing version switch. Deploy the project root unchanged so the public paths are `/traditional/` and `/gamified/` on the same origin.

## Research event logging

`shared/js/logger.js` defines the event interface and a local mock sink. Events include an anonymous per-browser-session ID, prototype version, optional task ID, event type, ISO timestamp, and event metadata. Logging is disabled in `shared/js/home.js` (`enabled: false`) and no event is transmitted. To exercise the mock during development, explicitly enable it in the logger construction; events can then be inspected in browser storage under `lowkey:mock-events`. Do not put names, email addresses, addresses, or other directly identifying details in event metadata.

For a participant study, logging should be enabled only after approved consent and research procedures are in place. A backend or serverless endpoint becomes necessary when events must be collected centrally from public participant browsers, retained beyond local storage, backed up, or exported reliably. A database or managed research data store is needed when the serverless endpoint must persist, query, and control access to events. Before that step, decide retention, access control, consent/withdrawal handling, data minimization, and secure export with the institution's research process. No backend, database, remote tracking, or external collection service is configured here.

## Build and deploy

There is no compile/build step or package manager. Commit the project as a static site and choose the repository root as the publish directory. Netlify is configured in `netlify.toml`; Cloudflare Pages can publish the root directory and reads `_redirects`. Ensure the host serves `traditional/` and later `gamified/` as directories with `index.html`. All app assets use relative paths, so these nested paths work without a custom domain root. Do not deploy participant-facing study data or activate collection until the study setup is approved.

## Verify the public paths before a study

After deployment, open the HTTPS `/traditional/` URL, `/traditional/shop.html`, `/traditional/product.html?id=lk-hoodie-01`, `/traditional/cart.html`, and `/traditional/checkout.html`. Confirm the brand images, font rendering, responsive menu, search, filters, sorting, product selection, wishlist, add-to-cart, quantity changes, item removal, simulated checkout, and confirmation receipt on desktop and mobile browsers. Confirm the host's `/` redirect. After Prototype B exists, check `/gamified/` directly and compare the same products, prices, tasks, navigation, and cart/checkout flow between versions. Check browser developer tools for missing assets and failed requests. These are deployment steps; this repository has not been deployed.

## Needed before participant testing

- Approved product/lifestyle images and any final logos/assets.
- Defined study tasks, task IDs, assignment procedure, and final prototype comparison plan.
- Approved consent wording, event metadata, data retention/access/export, and an appropriate secure collection destination if central collection is needed.
- A second `/gamified/` implementation that shares the common data and shopping modules.
- A final HTTPS deployment and cross-device/browser review.

Checkout asks participants to use fictional contact and delivery details. The page does not read those values into JavaScript, save them, or transmit them; it asks for no card number. A mock order receipt containing only item and total information is kept in `sessionStorage` for the browser session. No real payments, real orders, participant accounts, remote analytics, or deployment are enabled.
