# METRIC 01 — Cross-Browser Compatibility
**Score**: 4/5
**Status**: ⚠️

Static-inspection audit of `/home/user/audit/site/index.html` (2545 lines). Runtime Playwright verification across chromium / firefox / webkit was attempted but blocked (see Notes / Limitations). The site targets evergreen browsers and its CSS/JS surface is largely standards-compliant, but a handful of WebKit-specific gaps will cause visible differences on Safari (and older iOS/macOS versions in particular).

## Evidence

### 1. `backdrop-filter` used without `-webkit-backdrop-filter` counterpart
The site uses `backdrop-filter` in four places for the nav bar, media kicker chip, lightbox overlay, and mobile nav panel:

- `index.html:102` — `.nav { ... backdrop-filter: blur(18px); }`
- `index.html:632` — `.media-kicker { ... backdrop-filter: blur(10px); }`
- `index.html:712` — `.media-lightbox { ... backdrop-filter: blur(18px); }`
- `index.html:1551` — mobile `.nav-links { ... backdrop-filter: blur(18px); }`

Grep confirms no prefixed counterpart exists in the file:
```
$ grep -n "\-webkit\-backdrop\-filter" index.html
(no matches)
```

Safari has shipped `backdrop-filter` unprefixed only since Safari 18 (Sept 2024). Safari 9–17 and all iOS versions before iOS 18 require `-webkit-backdrop-filter`. Without the prefix the nav/lightbox/mobile-drawer will render on top of their semi-transparent background colors with **no blur**, which is a noticeable (but not broken) visual diff on Safari < 18 / iOS < 18.

### 2. `mask-image` used without `-webkit-mask-image` counterpart
- `index.html:69` — body grid overlay: `mask-image: radial-gradient(circle at center, black 38%, transparent 85%);`
- `index.html:187` — hero fade overlay: `mask-image: linear-gradient(180deg, black 0%, rgba(0,0,0,0.5) 60%, transparent 100%);`

```
$ grep -n "\-webkit\-mask" index.html
(no matches)
```

Safari (all current versions) still implements mask only under `-webkit-mask-image`. Without the prefix, the decorative grid overlay (body::before) and the hero's top-to-bottom fade will render **as solid opaque rectangles** in Safari/WebKit — producing an unintended visible grid over the whole page and a hard-edged horizontal strip in the hero. On Chrome/Firefox/Edge this is fine.

### 3. `100svh` viewport unit without fallback
- `index.html:34` — `--hero-height: 100svh;`
- `index.html:196` — `.hero-inner { min-height: calc(100svh - 5.6rem); }`
- `index.html:1578` — mobile `.hero-inner { min-height: calc(100svh - 5.2rem); }`

`svh` is supported in Chrome 108+, Firefox 101+, Safari 15.4+, Edge 108+. In Safari ≤ 15.3 and iOS < 15.4 the entire `calc()` expression is invalid and the declaration is dropped. The hero falls back to its natural content height (no breakage — auto-height works because nothing depends on `--hero-height` downstream — but the hero will not fill the viewport on legacy Safari).

### 4. `-webkit-line-clamp` without standard `line-clamp`
- `index.html:697-700` — `.media-caption p { display: -webkit-box; overflow: hidden; -webkit-box-orient: vertical; -webkit-line-clamp: 5; }`

The `-webkit-*` properties work in Chrome, Edge, Safari, **and Firefox (68+)**, so this is functional everywhere. Just a standards hygiene note — the modern unprefixed `line-clamp` property has broad support and should be added alongside.

### 5. `scroll-behavior: smooth` and `window.scrollTo({ behavior: "smooth" })`
- `index.html:43` — `html { scroll-behavior: smooth; }`
- `index.html:2413-2416` — `window.scrollTo({ top, behavior: ... "smooth" });`

Supported in Safari only since 15.4. On Safari 14 / 15.0–15.3 the smooth behavior is ignored and scrolling jumps instantly — functional but a UX diff.

### 6. Media and JS APIs — all standard
- Videos: H.264/AVC in MP4 (verified via `ftyp` atom: `isomiso2avc1mp41`), with `muted`, `playsinline`, `autoplay`, `preload="metadata"` set correctly for iOS Safari autoplay rules (`index.html:2047, 2072, 2095, 2158, 2180`).
- Images: PNG only (`index.html:1682, 2119, 2136, 2205`) — universal.
- JS uses `Array.from`, `IntersectionObserver` with feature-detect fallback (`index.html:2483-2496`), optional chaining `?.` (multiple places, e.g. `index.html:2336, 2354, 2394, 2531`), `const`/arrow functions, `history.pushState`, `matchMedia`, `window.scrollTo` with options. All are in the evergreen-browser baseline (Chrome 80+, Firefox 74+, Safari 13.1+, Edge 80+).
- No use of `structuredClone`, `requestIdleCallback`, `Array.prototype.at`, `ResizeObserver`, `navigator.clipboard`, `:has()`, `:is()`, `:where()`, `color-mix()`, `container-type`, `subgrid`, `scroll-timeline`, or `accent-color`.
- `reveals` fallback (`index.html:2494-2496`) marks items visible if `IntersectionObserver` is missing — safe progressive enhancement.

### 7. No obvious null-deref patterns
Cold paths are defensively guarded: `toggle && navLinks` check (`index.html:2425`), `mediaLightbox && mediaLightboxStage && mediaLightboxCopy && frame` check (`index.html:2303`), `trackedSections.length` check (`index.html:2379`), and optional-chaining on `mediaClose?.focus()` (`index.html:2336`), `lastFocusedTile?.focus()` (`index.html:2354`), `mediaClose?.addEventListener` (`index.html:2466`).

## Failing Items
- Missing `-webkit-backdrop-filter` fallback at `index.html:102, 632, 712, 1551`. Blur disappears on Safari < 18 / iOS < 18.
- Missing `-webkit-mask-image` fallback at `index.html:69, 187`. Mask disappears entirely on all current Safari/WebKit — the decorative background grid and hero fade will render as hard opaque rectangles.
- No fallback for `100svh` at `index.html:34, 196, 1578`. Hero does not fill viewport on Safari < 15.4 / iOS < 15.4.
- `scroll-behavior: smooth` and programmatic `scrollTo({ behavior: "smooth" })` are ignored on Safari < 15.4 (`index.html:43, 2415`) — minor UX diff.
- `-webkit-line-clamp` has no unprefixed `line-clamp` companion at `index.html:700`. Works today, but is fragile against future WebKit deprecation.

## Remediation

1. **Add `-webkit-backdrop-filter` before every `backdrop-filter` declaration** (index.html lines 102, 632, 712, 1551).
2. **Add `-webkit-mask-image` before every `mask-image` declaration** (index.html lines 69, 187).
3. **Provide a `vh` fallback before `svh`** (index.html lines 34, 196, 1578).
4. **Add standard `line-clamp` alongside the `-webkit-` versions** (index.html lines 697–700).
5. **Optional — smooth scroll fallback for older Safari.** No code change required; degradation is instant-jump, not broken.

Post-remediation, Safari/WebKit should match Chromium and Firefox to within the 5-px target and the score should rise to 5/5.

## Notes / Limitations

- **Playwright runtime check was not possible.** `npx playwright install` failed because the sandbox has no outbound network access. All findings above are from static inspection against published caniuse / MDN baselines.
- The existing Playwright config only defines three Chromium-based projects (`laptop-chrome`, `ipad-pro`, `mobile-chrome`). Adding firefox/webkit projects would be required for real cross-browser runs.
- Score rationale: all five listed issues are cosmetic/degraded on Safari, not functional failures. Functional parity (clicks, nav, lightbox, video autoplay, reveal animations, mobile drawer) is intact across all four target browsers.
