# Task ID: 4 — Rebuild ProductCard with Apple.com-inspired 3D Tilt Effect

## Agent: Main Agent

### Work Log:
- Read `worklog.md` for project context (ClothFashion e-commerce, Flipkart-grade redesign)
- Read existing `ProductCard.tsx` and `SharedTypes.ts` to understand current functionality
- Rebuilt the entire `ProductCard.tsx` with Apple.com-inspired 3D tilt hover effect

### Changes Made:

**3D Tilt System:**
- Added `perspective(1000px)` wrapper and `transformStyle: preserve-3d` on the card
- `useRef` + `onMouseMove` handler calculates `rotateX`/`rotateY` from cursor position relative to card center
- Max rotation clamped to ±8° for subtle elegance
- `scale3d(1.02)` on hover for a premium lift feel
- `onMouseLeave` resets all transforms smoothly
- Dynamic glare overlay (`radial-gradient`) follows cursor position for glass-like shine

**Visual Design (Black Premium Apple Theme):**
- Card: `bg-[#1D1D1F]`, `border border-white/5 hover:border-white/10`, `rounded-2xl`
- Orange glow shadow: `hover:shadow-[0_20px_60px_rgba(255,87,34,0.2)]`
- Lift: `hover:-translate-y-2`
- Smooth cubic-bezier transition: `transition-[box-shadow,border-color] duration-500 cubic-bezier(0.4, 0, 0.2, 1)`
- Image section: `bg-[#0A0A0A]`, image zoom on hover (`group-hover:scale-110`), dual image crossfade
- Discount badge: `bg-gradient-to-r from-[#FF5722] to-[#FF2D55]`, rounded-full
- Wishlist button: `bg-black/50 backdrop-blur-md`, Heart with `fill-[#FF2D55]`
- Quick Add: gradient orange, slides up with `translate-y-full → group-hover:translate-y-0`
- Info: `text-white/40` category, `text-[#F5F5F7]` product name, `text-white` price, `bg-white/10` rating badge

**All Existing Functionality Preserved:**
- Wishlist toggle (fetch API with auth check)
- Quick add to cart (Zustand store + auth check)
- Product page navigation
- Image loading skeleton state
- Discount calculation
- Auth gating with toast messages

### Verification:
- ESLint: **zero errors**
- Dev server: compiling and serving correctly
