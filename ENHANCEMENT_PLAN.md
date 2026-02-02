# Mission Control Dashboard - Enhancement Plan

## Overview
Add two features to the Mission Control dashboard:
1. **Real-time updates** via polling
2. **Expandable card details** via slide-over drawer

---

## Phase 1: Research Findings

### 1. Real-Time Updates in Next.js

| Approach | Pros | Cons | Best For |
|----------|------|------|----------|
| **Polling** | Simple, works with HTTP, no extra infrastructure | Slight delay, more server requests | This dashboard ✓ |
| SSE | Real-time, auto-reconnect | Complex setup, Edge runtime issues | Live notifications |
| WebSocket | Bidirectional, true real-time | Overkill, separate server | Chat apps, games |

**Decision: Polling** - With local state and no database, polling every 5-10 seconds is perfect. Simple to implement, no infrastructure changes needed.

### 2. Expandable Card Details/Drawer

Options considered:
- **Modal**: Good for focused attention, blocks interaction with rest of UI
- **Expandable inline card**: Adds clutter to the grid
- **Slide-over drawer**: Best for detailed content, preserves context, feels professional

**Decision: Slide-over drawer** - Opens from right side, shows full item details including notes, created/updated dates, allows approve/reject actions without leaving the page.

### 3. Data Structure

The `items.ts` already has the `notes?: string` field - no changes needed!

```typescript
export interface MissionItem {
  id: string;
  title: string;
  description: string;
  category: "feature" | "workflow" | "template" | "research" | "automation";
  status: "pending" | "in-progress" | "approved" | "rejected";
  created: string;
  updated: string;
  link?: string;
  notes?: string;  // Already exists ✓
}
```

---

## Phase 2: Implementation Plan

### 1. Data Structure Changes
✅ **Already complete** - `notes?: string` field exists in `items.ts`

### 2. UI Approach: Slide-Over Drawer

**Component: `ItemDetailDrawer.tsx`**
- Fixed position, slides in from right
- Backdrop overlay with click-to-close
- Shows: title, description, full notes, category badge, dates, actions
- Animation: `transform transition-transform` with `translate-x-full`

### 3. Real-Time Strategy: Polling

**Implementation:**
- Add `useEffect` with `setInterval` (10 seconds)
- Fetch from existing `/api/items` endpoint
- Update local state when data changes
- Optimistic UI updates for actions

```typescript
useEffect(() => {
  const fetchItems = async () => {
    const res = await fetch('/api/items');
    const data = await res.json();
    setItems(data);
  };
  
  const interval = setInterval(fetchItems, 10000);
  return () => clearInterval(interval);
}, []);
```

### 4. API Endpoints Needed

✅ **Already exist**:
- `GET /api/items` - Returns all items
- `PATCH /api/items` - Update item status

No new endpoints needed!

---

## Phase 3: Execution Checklist

- [ ] Create `ItemDetailDrawer.tsx` component with slide-over animation
- [ ] Add `selectedItem` state to page.tsx
- [ ] Add click handler to cards to open drawer
- [ ] Add polling with `setInterval` (10 seconds)
- [ ] Add loading state during fetch
- [ ] Test with `npm run build`
- [ ] Push to GitHub

---

## Files to Modify

1. `src/app/page.tsx` - Add drawer state, polling, click handlers
2. `src/components/ItemDetailDrawer.tsx` - **New** drawer component

---

## Estimated Effort

- **Research**: 15 min ✓
- **Implementation**: 45 min
- **Testing & push**: 15 min
- **Total**: ~1 hour
