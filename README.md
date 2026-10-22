# LOWKEY research prototypes

Static, vanilla HTML/CSS/JavaScript storefront foundation for the LOWKEY dissertation prototype. The traditional version lives at `/traditional/`; shared assets and modules live in `/shared/`. There is no server-side runtime, checkout provider, participant account system, or analytics service.

## Current scope

The current build is the **traditional homepage and shared Phase 1 foundation**. It includes the brand styles, responsive navigation, four featured items, search overlay, wishlist feedback, mock quick-add cart with LocalStorage persistence, shared sample product data, and an opt-in local-only event logger. The remaining catalogue, product detail, checkout, confirmation, and about pages are not implemented yet. The cart currently demonstrates persistence and item counts; checkout is not available.

Supplied LOWKEY PNGs are referenced in `images/logos/` as provided. Product and category photography has not been supplied; homepage cards and category tiles are deliberately labelled as placeholders. Replace those with approved local assets before participant testing. Jockey One, Montserrat, and Inter currently load from Google Fonts; local font files should be added if the study must work without third-party font requests or needs stable font rendering.

## Run locally

Use VS Code's Live Server extension, or any static HTTP server, from the repository root. Open `traditional/` (for example, `http://127.0.0.1:5500/traditional/`). ES modules need an HTTP server; opening the file directly with `file://` is not supported. The root `index.html` forwards visitors to the traditional prototype.

## Project structure

```text
index.html                 root entry, forwards to traditional/
traditional/index.html     Prototype A homepage
shared/css/site.css        shared design tokens and components
shared/js/products.js      shared fictional catalogue and prices
shared/js/store.js         shared mock cart storage operations
shared/js/logger.js        disabled-by-default local event logger
shared/js/home.js          traditional homepage behavior
images/logos/              original supplied brand artwork
netlify.toml               Netlify static publish and root redirect
_redirects                 Cloudflare Pages root redirect
```

## Product data

Edit `shared/js/products.js`. Keep product IDs stable and unique. Both prototypes must import this same catalogue so names, categories, prices, sizes, colours, and availability stay aligned. Set each `image` to a path relative to the site root when local product images are added. Use identical data in both versions for study comparisons.

## Adding the gamified version

Create `gamified/index.html` and its own version-specific module/styles only when its experimental features are defined. Reuse `shared/css/site.css`, `shared/js/products.js`, and `shared/js/store.js`; preserve the traditional navigation and task flow, product catalogue, prices, and checkout steps. Add only the planned gamified treatments. Mark the version in the root HTML, for example `data-prototype="gamified"`, so event records identify it. There should be no participant-facing version switch. Deploy the project root unchanged so the public paths are `/traditional/` and `/gamified/` on the same origin.

## Research event logging

`shared/js/logger.js` defines the event interface and a local mock sink. Events include an anonymous per-browser-session ID, prototype version, optional task ID, event type, ISO timestamp, and event metadata. Logging is disabled in `shared/js/home.js` (`enabled: false`) and no event is transmitted. To exercise the mock during development, explicitly enable it in the logger construction; events can then be inspected in browser storage under `lowkey:mock-events`. Do not put names, email addresses, addresses, or other directly identifying details in event metadata.

For a participant study, logging should be enabled only after approved consent and research procedures are in place. A backend or serverless endpoint becomes necessary when events must be collected centrally from public participant browsers, retained beyond local storage, backed up, or exported reliably. A database or managed research data store is needed when the serverless endpoint must persist, query, and control access to events. Before that step, decide retention, access control, consent/withdrawal handling, data minimization, and secure export with the institution's research process. No backend, database, remote tracking, or external collection service is configured here.

## Build and deploy

There is no compile/build step or package manager. Commit the project as a static site and choose the repository root as the publish directory. Netlify is configured in `netlify.toml`; Cloudflare Pages can publish the root directory and reads `_redirects`. Ensure the host serves `traditional/` and later `gamified/` as directories with `index.html`. All app assets use relative paths, so these nested paths work without a custom domain root. Do not deploy participant-facing study data or activate collection until the study setup is approved.

## Verify the public paths before a study

After deployment, open the HTTPS `/traditional/` URL and confirm the brand images, font rendering, responsive menu, search, wishlist feedback, quick-add, and cart persistence on desktop and mobile browsers. Confirm the host's `/` redirect. After Prototype B exists, check `/gamified/` directly and compare the same products, prices, tasks, navigation, and cart/checkout flow between versions. Check browser developer tools for missing assets and failed requests. These are deployment steps; this repository has not been deployed.

## Needed before participant testing

- Approved product/lifestyle images and any final logos/assets.
- Completed catalogue, product detail, cart, simulated checkout, and order confirmation pages.
- Defined study tasks, task IDs, assignment procedure, and final prototype comparison plan.
- Approved consent wording, event metadata, data retention/access/export, and an appropriate secure collection destination if central collection is needed.
- A second `/gamified/` implementation that shares the common data and shopping modules.
- A final HTTPS deployment and cross-device/browser review.

No real payments, real orders, participant accounts, remote analytics, or deployment are enabled.
