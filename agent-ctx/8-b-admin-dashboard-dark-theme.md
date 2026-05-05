# Task 8-b: Rebuild AdminDashboard with Apple Dark Theme

## Status: Completed

## Changes Made

Rebuilt `/home/z/my-project/src/components/admin/AdminDashboard.tsx` with complete Apple.com dark theme design system.

### Design System Applied
- **Background**: `bg-[#000000]` (inherits from page)
- **Cards**: `bg-[#1D1D1F]` with `border border-white/[0.08] rounded-2xl`
- **Text**: Primary `text-[#F5F5F7]`, Secondary `text-[#86868B]`, Muted `text-white/40`
- **Accent**: Gradient `from-[#FF5722] to-[#FF2D55]` on bar chart
- **Borders**: `border-white/[0.06]` (table rows), `border-white/[0.04]` (table separators)
- **Hover**: `hover:bg-white/5` on rows and KPI cards
- **Skeleton**: `bg-white/5 rounded-xl` with `animate-pulse`

### Component Updates
1. **KPI Cards**: Removed light-colored icon backgrounds (`#FFF3E0`, `#E3F2FD`, etc.) → `bg-white/5`. Icons now `text-[#86868B]`. Trend text uses dark theme colors.
2. **Revenue Chart**: Grid `stroke="rgba(255,255,255,0.06)"` with `vertical={false}`. Axis text `fill="#86868B"`. Multi-stop gradient fill (0.3 → 0.1 → 0 opacity).
3. **Custom DarkTooltip**: `bg-[#2A2A2E] border border-white/10 rounded-xl` with `text-[#F5F5F7]`. Used across all charts.
4. **Order Status Pie**: `stroke="#1D1D1F"` between slices. Dark tooltip. Legend text `text-[#86868B]`.
5. **Top Products Table**: Dark card bg. Headers `text-[#86868B]`. Row text `text-[#F5F5F7]`. Hover `hover:bg-white/5`. Row numbers `text-white/40`.
6. **Top Categories Bar**: Gradient fill `from-[#FF5722] to-[#FF2D55]`. Dark grid and axis. Dark tooltip.
7. **Low Stock Alert**: `bg-[#FFC107]/5 border border-[#FFC107]/20 rounded-2xl`. Row items `bg-white/[0.03]` with `hover:bg-white/5`.
8. **Skeleton Loading**: Custom `DarkSkeleton` component with `bg-white/5 rounded-xl`.

### Removed
- All shadcn Card imports (using plain divs with dark theme classes)
- All light theme colors (#E4E7EC, #F5F7FA, #1F2A3A, #5A6B7F, #CBD5E1, #FFFDF5, etc.)
- `admin-row` class reference

### Preserved
- All data fetching logic (fetch `/api/admin`)
- All interfaces (DashboardData)
- All recharts integration (AreaChart, PieChart, BarChart, Legend, etc.)
- All data transformations (kpis, revenueData, orderStatusData, categoryData, lowStock)

### Lint: Zero errors
