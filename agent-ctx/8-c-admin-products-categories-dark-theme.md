# Task 8-c: Rebuild AdminProducts & AdminCategories with Apple Dark Theme

## Work Done
Rebuilt both admin components with the full Apple.com dark theme design system.

### AdminProducts.tsx
- **Surface**: Replaced all `Card` wrappers with `bg-[#1D1D1F] border border-white/[0.08] rounded-2xl`
- **Filter row**: Glass-style inputs with `bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#FF5722]/50`
- **Table**: Dark header `bg-white/[0.03]`, row text `text-[#F5F5F7]`, hover `hover:bg-white/5`, alternating rows with `bg-white/[0.02]`
- **Status badges**: Dark variants with `bg-[#34D399]/10 text-[#34D399] border border-[#34D399]/20` (active) and red variant (inactive)
- **Stock colors**: Green `#34D399`, Yellow `#FBBF24`, Red `#F87171`
- **Pagination**: Dark buttons with gradient active state, `bg-white/5 border-white/10` for inactive
- **Add/Edit Dialog**: Dark bg `bg-[#1D1D1F] border-white/10`, all inputs dark-themed, size toggles as styled label chips instead of plain checkboxes
- **Featured tag**: Gold badge `text-[#FFB020] bg-[#FFB020]/10`
- **Buttons**: Gradient accent `from-[#FF5722] to-[#FF2D55]` with shadow, secondary `bg-white/5 hover:bg-white/10`
- **Delete danger**: `text-[#F87171] hover:bg-[#F87171]/10`
- **Skeleton**: `bg-white/5 rounded-xl`
- **Select dropdowns**: `bg-[#1D1D1F] border-white/10` with `text-[#F5F5F7]` items

### AdminCategories.tsx
- **Category cards**: `bg-[#1D1D1F] border border-white/[0.08] rounded-2xl` with `hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20 transition-all duration-300`
- **Image area**: `bg-white/[0.03]` with gradient overlay on hover `from-[#1D1D1F] via-transparent to-transparent`
- **Hover actions**: `bg-black/60 backdrop-blur-sm border border-white/10` glass buttons with `translate-y-1 group-hover:translate-y-0` entrance animation
- **Product count badge**: `bg-white/5 text-[#86868B] border border-white/[0.06]`
- **Empty state**: Dark icon container with subtle helper text
- **Add/Edit Dialog**: Same dark treatment as products
- **Delete Dialog**: Same dark treatment with `bg-[#F87171]` danger button

### Color Replacements Made
| Old (Light) | New (Dark) |
|---|---|
| `bg-white`, `bg-[#F5F7FA]` | `bg-[#1D1D1F]`, `bg-white/5` |
| `border-[#E4E7EC]` | `border-white/[0.08]`, `border-white/10` |
| `text-[#1F2A3A]` | `text-[#F5F5F7]` |
| `text-[#5A6B7F]` | `text-[#86868B]` |
| `text-[#CBD5E1]` | `text-white/20`, `text-white/40` |
| `bg-[#FF5722]` button | `bg-gradient-to-r from-[#FF5722] to-[#FF2D55]` |
| `bg-[#DC3545]` danger | `bg-[#F87171]` |
| `bg-[#E8F5E9]/[#2E7D32]` badges | `bg-[color]/10 text-[color] border-[color]/20` |

### Preserved Functionality
- ✅ All CRUD operations (Create, Read, Update, Delete) for both products and categories
- ✅ Pagination with 10/25/50 per page
- ✅ Search, category filter, stock filter
- ✅ Size checkbox toggles
- ✅ Featured product badge
- ✅ Image thumbnails in table
- ✅ Image preview in category cards
- ✅ Loading skeletons
- ✅ Empty states
- ✅ All API endpoints unchanged
- ✅ All state management unchanged

## Verification
- ESLint: zero errors
- Dev server: running, all routes 200
