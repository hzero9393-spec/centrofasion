# Task 8-a: Rebuild Admin Layout & Login Page with Apple Dark Theme

## Agent: Main Agent

## Changes Made

### 1. `/src/components/admin/AdminLayout.tsx` — Full Apple Dark Theme Rebuild

**Sidebar:**
- Background changed from `bg-[#0A1B2A]` (navy) → `bg-[#1D1D1F]` (Apple dark surface)
- Border from `border-[#1E3A5A]/50` → `border-white/[0.06]`
- Active nav item: gradient accent bar (`from-[#FF5722] to-[#FF2D55]`) + gradient background tint
- Inactive nav: `text-white/40 hover:text-white/80 hover:bg-white/5`
- Logo: gradient `from-[#FF5722] to-[#FF2D55]` (replaces flat `bg-[#FF5722]`)
- Collapse button at bottom of sidebar

**Top Header Bar:**
- `bg-[#1D1D1F]/80 backdrop-blur-xl` (glass effect) with `border-b border-white/[0.06]`
- Replaces old `bg-white border-[#E4E7EC]`
- Title: `text-[#F5F5F7]`
- Bell icon: `text-[#86868B]`, notification dot: `bg-[#FF2D55]`

**Avatar & Dropdown:**
- Avatar: gradient `from-[#FF5722] to-[#FF2D55]`
- Dropdown: `bg-[#1D1D1F] border-white/[0.08] text-[#F5F5F7]`
- Logout: `text-[#FF2D55]`

**Main Content:**
- `bg-[#000000]` (pure black)

**Mobile Sheet:**
- `bg-[#1D1D1F] border-white/[0.08]`
- Menu button: dark with border

### 2. `/src/components/admin/AdminLoginPage.tsx` — Full Apple Dark Theme Rebuild

**Background:**
- `bg-[#000000]` (pure black)
- 3 gradient orbs: orange top-center, red bottom-right, orange left (subtle glowing effect)
- Removed old dot pattern and blue glow

**Card:**
- `bg-[#1D1D1F] border border-white/[0.08] rounded-2xl` (replaces old `bg-white`)
- Dark shadow: `shadow-[0_24px_80px_rgba(0,0,0,0.5)]`

**Logo:**
- Gradient `from-[#FF5722] to-[#FF2D55]` with orange glow shadow
- Title: "Fasion" uses gradient text via `bg-clip-text`

**Tabs:**
- TabsList: `bg-white/5 border border-white/[0.06]`
- Active tab: `bg-white/10 text-[#F5F5F7]`
- Inactive: `text-white/40`

**Inputs:**
- `bg-white/5 border-white/10 text-[#F5F5F7] placeholder:text-white/30`
- Focus: `border-[#FF5722]/50 ring-[#FF5722]/20`

**Buttons:**
- Gradient: `from-[#FF5722] to-[#FF2D55]` with orange glow shadow

**Demo Hint:**
- `bg-white/5 border border-white/[0.06]` with gray/white text

**OTP Slots:**
- Dark styled: `bg-white/5 border-white/10 text-[#F5F5F7]`

**All functionality preserved:** Password login, 6-digit code login, tab switching, demo credentials, back to store link.

## Verification
- ESLint: zero errors
- Dev server: running, no compilation errors
