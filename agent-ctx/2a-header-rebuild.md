# Task 2-a: Header Component Rebuild — Apple.com Style

**Agent**: UI Rebuild Agent
**Date**: 2025
**Status**: ✅ Complete

---

## Objective
Rebuild the Header component at `/src/components/customer/Header.tsx` to match an Apple.com-inspired dark glass navigation bar, replacing the old Flipkart navy style.

---

## Changes Made

### Visual Design Overhaul
- **Background**: Floating glass effect — `bg-black/70 backdrop-blur-xl` (default) → `bg-black/80 backdrop-blur-2xl` (scrolled)
- **Border**: Ultra-subtle `border-b border-white/[0.06]` matching Apple's invisible line aesthetic
- **Header height**: Slimmed to `h-[44px]` on desktop (Apple uses ~44px), `h-[48px]` on mobile
- **Max width**: `1280px` with `px-8` generous padding

### Logo
- Split into two spans: **"Cloth"** in `text-white` + **"Fasion"** in gradient (`bg-gradient-to-r from-[#FF5722] to-[#FF2D55] bg-clip-text text-transparent`)
- 17px font, semibold, tight tracking — mimicking Apple's clean type

### Navigation Links (Desktop)
- Removed second-row layout — integrated into single row like Apple.com
- Style: `text-[11px] tracking-wide text-white/50 hover:text-white`
- **NO underline** on active state — just brighter text (`text-white`)
- **NO background highlight** on hover — only color transition
- Generous `gap-[26px]` between links

### Search Bar
- Compact pill: `h-[30px] w-[180px] rounded-full bg-white/[0.04] border-white/[0.08]`
- **Expands on focus** to `w-[260px]` with smoother border — Apple-like animation
- Placeholder text simplified to "Search" (from "Search for products, brands and more...")
- 12px font size, white/30 placeholder color
- Zero ring offset — clean focus state (`focus-visible:ring-0 focus-visible:ring-offset-0`)
- Autocomplete dropdown: rounded-2xl, `bg-[#1D1D1F]/95 backdrop-blur-2xl`, 320px wide

### Action Icons
- Thin vertical divider `w-px bg-white/[0.08]` between search and icons
- Icon size: `size-[17px]`, compact buttons `h-8 w-8`
- Colors: `text-white/60 hover:text-white hover:bg-white/[0.04]`
- All icons have `sr-only` labels for accessibility

### Cart Badge
- Gradient: `bg-gradient-to-r from-[#FF5722] to-[#FF2D55]`
- Compact: `h-[16px] min-w-[16px] text-[10px]`
- Soft glow shadow: `shadow-[0_2px_8px_rgba(255,45,85,0.4)]`

### User Dropdown
- Background: `bg-[#1D1D1F]` (solid dark, not translucent — cleaner Apple feel)
- Rounded: `rounded-2xl` with `p-1.5` padding
- User info card: `bg-white/[0.04] rounded-xl`
- Menu items: `rounded-xl px-3 py-2 text-[13px]` with `hover:bg-white/[0.04]`
- Logout: `text-[#FF453A]` with `hover:bg-[#FF453A]/[0.06]`
- `sideOffset={8}` for proper spacing from trigger

### Mobile Sheet
- Width: `w-[280px]` (slightly narrower for cleaner feel)
- Background: `bg-[#1D1D1F]/[0.98] backdrop-blur-2xl`
- Nav items: `rounded-xl px-3 py-[11px]` with `hover:bg-white/[0.04]`
- Active state: `bg-white/[0.06] text-white font-medium` (subtle, no gradient)
- Search input: `rounded-xl` (not rounded-full — better for mobile sheet context)

### Accessibility
- All interactive buttons have `aria-label` or `sr-only` text
- `outline-none` on buttons (shadcn handles focus-visible)
- Keyboard navigation preserved through native button elements

### Architecture
- Single-row desktop layout (was two-row: search + nav)
- Removed unused `X` import from lucide
- Removed unused `mobileSearch` state (was tracked but never toggled)
- Used `<>` fragment wrapper to include click-away backdrop for search suggestions
- `useCallback` for search functions to avoid re-renders
- `useRef` for proper debounce timer typing (`ReturnType<typeof setTimeout>`)

---

## Functionality Preserved
- ✅ Search autocomplete with debounced API calls (300ms)
- ✅ Desktop search dropdown with product results
- ✅ Mobile search in Sheet sidebar
- ✅ Wishlist navigation (authenticated → profile/wishlist, unauthenticated → login)
- ✅ Cart navigation with live badge count
- ✅ User dropdown (Profile, Orders, Wishlist, Settings, Logout)
- ✅ Mobile Sheet with hamburger menu, all nav links, login/logout
- ✅ Admin Panel link in mobile sheet
- ✅ Scroll-based header opacity/blur enhancement
- ✅ Click-outside to close search suggestions
- ✅ Active page detection via `isActive()` helper

---

## Quality Checks
- ✅ ESLint: **0 errors**, 0 warnings
- ✅ Dev server: running, `/` returns 200
- ✅ No unused imports
- ✅ Proper TypeScript typing throughout
