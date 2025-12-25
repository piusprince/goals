# Phase 6: Delight Features - Requirements

## Introduction

Phase 6 focuses on adding delightful features that enhance user engagement and provide additional value. This includes a Year-in-Review summary feature, reusable goal templates, and polished animations throughout the app. Dark mode has already been implemented as part of the PWA polish phase.

## Current State Analysis

### Already Implemented
- ✅ Dark mode with theme toggle
- ✅ Basic page transitions (via `page-transition.tsx`)
- ✅ Animated lists (via `animated-list.tsx`)
- ✅ Summary page exists (`/summary`)

### To Be Implemented
- Year-in-review feature with shareable cards
- Goal templates system
- Enhanced micro-animations
- Celebration animations for achievements

---

## Requirements

### Requirement 1: Year-in-Review

**User Story:** As a user, I want to see a beautiful summary of my yearly progress, so that I can reflect on my achievements and share them with others.

#### Acceptance Criteria

1. WHEN a user navigates to /summary AND selects a year THEN the system SHALL display:
   - Total goals created that year
   - Goals completed (100% progress)
   - Total check-ins made
   - Longest streak achieved
   - Most consistent goal
   - Top category of goals

2. WHEN displaying year-in-review THEN the system SHALL show:
   - A monthly heatmap of check-in activity
   - Progress comparison with previous year (if data exists)
   - Personalized "highlights" or achievements

3. WHEN the user clicks "Share" on year-in-review THEN the system SHALL:
   - Generate a shareable card image (OG-style)
   - Allow sharing to social media or downloading the image
   - Include basic stats in a visually appealing format

4. IF no data exists for a selected year THEN the system SHALL display an appropriate empty state

5. WHEN generating shareable cards THEN the system SHALL:
   - Use the app's brand colors
   - Include the user's name (optionally)
   - Show key stats in a visually striking layout

---

### Requirement 2: Goal Templates

**User Story:** As a user, I want to quickly create goals from predefined templates, so that I can get started faster with common goal types.

#### Acceptance Criteria

1. WHEN creating a new goal THEN the system SHALL offer:
   - A "Start from template" option
   - A "Create custom" option

2. WHEN the user selects "Start from template" THEN the system SHALL display:
   - A list of predefined templates organized by category
   - Template preview with name, description, and suggested settings
   - Option to customize before creating

3. The system SHALL provide templates for common categories:
   - Health & Fitness (e.g., "Exercise 3x/week", "Drink 8 glasses of water")
   - Learning (e.g., "Read 30 mins daily", "Learn a new skill")
   - Finance (e.g., "Save $X monthly", "Track expenses weekly")
   - Wellness (e.g., "Meditate daily", "Journal before bed")
   - Productivity (e.g., "Complete daily reviews", "Inbox zero weekly")

4. WHEN a template is selected THEN the system SHALL:
   - Pre-fill the goal form with template values
   - Allow modification of all fields before saving
   - Track that the goal was created from a template (for analytics)

5. WHEN displaying templates THEN the system SHALL show:
   - Template name and description
   - Suggested goal type (binary/quantity/milestone)
   - Suggested frequency and target
   - Popularity indicator (if available)

6. IF the user has previously used templates THEN the system SHALL:
   - Show recently used templates
   - Suggest templates based on user's existing goals

---

### Requirement 3: Celebration Animations

**User Story:** As a user, I want to see celebratory animations when I achieve milestones, so that I feel rewarded and motivated.

#### Acceptance Criteria

1. WHEN a user completes a check-in that results in a streak milestone THEN the system SHALL:
   - Display a celebration animation (confetti, stars, etc.)
   - Show a congratulatory message
   - Milestones: 7 days, 14 days, 30 days, 60 days, 90 days, 180 days, 365 days

2. WHEN a user reaches 100% progress on a goal THEN the system SHALL:
   - Display a "Goal Completed!" celebration
   - Show total time taken to complete
   - Offer options to archive or continue the goal

3. WHEN a user reaches 50% progress on a goal THEN the system SHALL:
   - Show a "Halfway there!" toast notification
   - Display encouraging message

4. WHEN a user earns a badge THEN the system SHALL:
   - Display the badge with a reveal animation
   - Show badge name and description
   - Add to user's badge collection

5. Celebration animations SHALL:
   - Be performant (< 60fps impact)
   - Be accessible (respect prefers-reduced-motion)
   - Be dismissible by tap/click
   - Not block user interaction

---

### Requirement 4: Micro-Animations

**User Story:** As a user, I want smooth and delightful animations throughout the app, so that the experience feels polished and premium.

#### Acceptance Criteria

1. The system SHALL implement smooth transitions for:
   - Page navigation (already exists via page-transition)
   - Modal open/close
   - Dropdown expand/collapse
   - List item add/remove

2. WHEN a check-in is recorded THEN the system SHALL:
   - Animate the progress bar change
   - Show a subtle success indicator
   - Update streak counter with animation

3. WHEN toggling goal completion THEN the system SHALL:
   - Animate the checkbox or toggle
   - Show ripple effect on touch
   - Update UI with smooth transitions

4. WHEN loading data THEN the system SHALL:
   - Show skeleton loaders (already exists)
   - Fade in content when ready
   - Animate list items staggered entry

5. All animations SHALL:
   - Use CSS/Framer Motion for performance
   - Respect prefers-reduced-motion media query
   - Complete within 300ms for micro-interactions
   - Complete within 500ms for page transitions

---

## Technical Notes

### Existing Components
- `components/layout/page-transition.tsx` - Page transitions
- `components/layout/animated-list.tsx` - Animated lists with motion
- `app/(dashboard)/summary/page.tsx` - Summary page to enhance

### Libraries Available
- `motion` (Framer Motion) - Already installed
- CSS animations via `tw-animate-css`

### New Components Needed
- `components/summary/year-review-card.tsx` - Shareable card component
- `components/summary/activity-heatmap.tsx` - Monthly heatmap
- `components/goals/template-picker.tsx` - Template selection
- `components/celebrations/confetti.tsx` - Celebration animation
- `components/celebrations/milestone-toast.tsx` - Milestone notification

### Data Requirements
- Aggregate queries for year statistics
- Templates stored in database or static JSON
- Badge/milestone tracking in user_stats table

---

## Deferred to Future

1. **Custom templates** - Allow users to save their own templates
2. **Social sharing** - Direct sharing to Twitter/Instagram
3. **AI suggestions** - Template recommendations based on goals
4. **Sound effects** - Audio feedback for celebrations

---

## Dependencies

- Phase 1-5 completed
- Badge system implemented (Phase 2)
- User statistics tracking in place
