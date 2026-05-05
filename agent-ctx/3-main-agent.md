# Task ID: 3 — Rebuild HomePage with Apple.com-Inspired Cinematic 3D Design

## Agent: Main Agent
## Status: ✅ Complete

### Work Log:
1. **Read project context** — Analyzed worklog.md, current HomePage.tsx, globals.css, SharedTypes.ts, ProductCard.tsx, and navigation store to understand existing architecture.
2. **Added CSS animation classes** to `src/app/globals.css`:
   - `animate-fade-up` + delay variants (-delay-1 through -delay-4) — cinematic fade-up entrance
   - `animate-float`, `animate-float-slow`, `animate-float-reverse` — decorative orb floating animations
   - `hover-lift` — interactive hover lift effect
   - `text-gradient` — orange-to-pink gradient text
   - `dot-pattern` — subtle dot grid overlay for hero
   - `glass-btn` — glassmorphism scroll buttons
   - `skeleton-dark` — dark-themed loading skeletons
   - `scrollbar-hide` — hidden scrollbar utility
3. **Rebuilt HomePage.tsx** — Complete rewrite with 6 sections in black premium Apple.com theme:
   - **Section 1 (Hero)**: Full-screen cinematic hero with dark gradient, animated gradient orbs (3 orbs with different float speeds), dot pattern overlay, "Discover Your **Style**" with gradient accent text, dual CTA buttons (primary gradient + ghost), scroll-down indicator
   - **Section 2 (Categories)**: 3D perspective grid (`perspective-[1000px]`), 5-column category cards on `bg-[#1D1D1F]` with hover scale + orange glow shadow, image zoom on hover (700ms), staggered fade-up animations
   - **Section 3 (Featured Products)**: Dark container (`bg-[#1D1D1F] rounded-3xl`), horizontal snap scroll, glass-morphism scroll buttons with group-hover reveal, imports existing ProductCard component
   - **Section 4 (Banner Strip)**: Orange-to-pink gradient bar with emoji icons for Free Shipping, 30-Day Returns, COD
   - **Section 5 (Trending Now)**: 4-column product grid with staggered animations, ProductCard components, View All link
   - **Section 6 (Why Choose Us)**: Glass-morphism cards (`bg-white/5 backdrop-blur-lg border-white/10`), gradient icon circles, hover lift + glow effect
4. **Preserved all existing functionality**: API data fetching, loading skeletons, navigation to shop/product pages, horizontal scroll carousel
5. **Lint**: Zero ESLint errors
6. **Dev server**: Running clean on port 3000, all pages returning 200

### Files Modified:
- `src/app/globals.css` — Added 10+ new CSS animation classes
- `src/components/customer/HomePage.tsx` — Complete rebuild (446 → ~330 lines, cleaner architecture)

### Design Decisions:
- Removed carousel entirely per Apple-style "single powerful hero" philosophy
- Used staggered `animate-fade-up-delay-*` classes instead of JS-based intersection observers for simplicity
- Glass-morphism buttons appear on container hover to keep UI clean
- Category grid changed from 2x4 to 2x5 to fill wider perspective layout
- Background is pure `bg-black` to match Apple's premium dark aesthetic
