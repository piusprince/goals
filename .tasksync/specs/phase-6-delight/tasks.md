# Phase 6: Delight Features - Tasks

## Overview
Add delightful features including Year-in-Review, goal templates, and celebration animations to enhance user engagement.

## Tasks

### 1. Year-in-Review Enhancement
- [ ] Create `lib/actions/summary-actions.ts` for year statistics
- [ ] Add aggregate queries for:
  - Total goals created
  - Goals completed
  - Total check-ins
  - Longest streak
  - Most consistent goal
  - Top category
- [ ] Create `components/summary/year-stats-card.tsx`
- [ ] Create `components/summary/activity-heatmap.tsx`
- [ ] Create `components/summary/year-comparison.tsx`
- [ ] Create `components/summary/shareable-card.tsx`
- [ ] Add share/download functionality for summary card
- [ ] Update `/summary` page with new components

### 2. Goal Templates System
- [ ] Create templates data file `lib/data/goal-templates.ts`
- [ ] Define template categories and common templates
- [ ] Create `components/goals/template-picker.tsx`
- [ ] Create `components/goals/template-card.tsx`
- [ ] Update `goal-form.tsx` with template option
- [ ] Add "Recently used" templates tracking
- [ ] Test template flow end-to-end

### 3. Celebration Animations
- [ ] Create `components/celebrations/confetti.tsx`
- [ ] Create `components/celebrations/milestone-toast.tsx`
- [ ] Add streak milestone detection in check-in flow
- [ ] Add goal completion celebration
- [ ] Add 50% progress celebration
- [ ] Add badge earned animation
- [ ] Implement prefers-reduced-motion support
- [ ] Test performance impact

### 4. Micro-Animations
- [ ] Add progress bar animation on check-in
- [ ] Add checkbox/toggle animation
- [ ] Add ripple effect on buttons (mobile)
- [ ] Add staggered list entry animation
- [ ] Add modal open/close transitions
- [ ] Add dropdown expand/collapse animations
- [ ] Verify all animations respect prefers-reduced-motion

### 5. Testing & Polish
- [ ] Test Year-in-Review with sample data
- [ ] Test shareable card generation
- [ ] Test template creation flow
- [ ] Test celebration animations
- [ ] Performance audit (animations)
- [ ] Accessibility audit (reduced motion)
- [ ] Fix any visual issues

## Progress Tracking
- Started: Not yet
- Current Task: 1. Year-in-Review Enhancement
- Completed: 0/5

## Notes
- Dark mode already implemented in Phase 5
- Motion library already installed
- Animated list component exists
- Page transition component exists
