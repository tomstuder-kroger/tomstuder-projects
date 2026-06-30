# Settings Panel Design

**Date:** 2026-06-29
**Feature:** Settings Panel with Capacity, Rates, Product Teams, and Portfolios management
**Type:** Modal with inline editing for MVP

---

## Overview

Add a comprehensive Settings Panel accessible via the settings gear icon in the GlobalNavBar. The panel allows users to configure capacity settings, hourly rates, and manage product teams and portfolios through a tabbed modal interface.

**Key Requirements:**
- Fast and simple for MVP
- Reuse existing modal patterns
- Inline editing (no nested modals)
- Helpful error messages with step-by-step guidance
- Immediate saves to localStorage via existing ResourceContext

---

## Architecture

### Component Structure

```
src/components/
  SettingsModal.jsx              // Main coordinator with KdsTabs
  SettingsCapacityTab.jsx        // Tab 1: Work schedule and time-off
  SettingsRatesTab.jsx           // Tab 2: Hourly rates by level
  SettingsTeamsTab.jsx           // Tab 3: Product teams CRUD
  SettingsPortfoliosTab.jsx      // Tab 4: Portfolios CRUD
```

### Modal Structure

**Component:** `SettingsModal.jsx`

- Uses `MxModal` from mx-web-components with `size="xl"`
- Contains `KdsTabs` with 4 tabs
- No primary footer action (changes save immediately)
- Close button only
- Consumes `useResource()` context for all state and actions

**Integration with App.jsx:**
- Restore `settingsOpen` state to AppContent
- Pass `onSettingsClick={() => setSettingsOpen(true)}` to GlobalNavBar
- Render `<SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />`

**State Management:**
- No local state needed
- All changes call ResourceContext actions directly
- Auto-saves to localStorage via existing useEffect in ResourceContext
- Optimistic UI updates

---

## Tab 1: Capacity Settings

**Component:** `SettingsCapacityTab.jsx`

### Layout

Simple form with two sections and a calculation preview.

**Section 1: Work Schedule**
- Standard Hours Per Week (number input, default: 40)
- Weeks Per Year (number input, default: 52)

**Section 2: Time Off Adjustments (hours/year)**
- PTO Hours (default: 120 = 15 days × 8)
- Holiday Hours (default: 80 = 10 days × 8)
- L&D Hours (default: 24 = 3 days × 8)
- OKR Planning Hours (default: 16 = 2 days × 8)

**Calculation Preview:**
Show calculated result below the form:
```
Available Hours/Year = (40 × 52) - (120 + 80 + 24 + 16) = 1,840 hours
```

### Behavior

- All fields use `MxInputTextBox` with `type="number"`
- onChange calls `updateCapacitySettings({ fieldName: value })`
- Changes immediately reflect in calculations throughout app
- No validation needed (all positive integers)

### UI Details

- Card layout with subtle border
- Labels on left, inputs on right (two-column layout)
- Calculation preview in highlighted box at bottom
- Helper text: "These settings affect available hours for all designers"

---

## Tab 2: Rate Settings

**Component:** `SettingsRatesTab.jsx`

### Layout

Table with 3 rows (one per level) and 3 columns.

**Columns:**
1. Level (APD, PD, SPD) - read-only badge
2. Actual Hourly Rate - editable currency input
3. Blended Hourly Rate - editable currency input

**Example:**
```
Level | Actual Rate      | Blended Rate
APD   | $100/hr [edit]   | $125/hr [edit]
PD    | $120/hr [edit]   | $150/hr [edit]
SPD   | $150/hr [edit]   | $180/hr [edit]
```

### Behavior

- Inputs use `MxInputTextBox` with `mask="currency"`
- onChange calls `updateCapacitySettings({ ratesByLevel: { [level]: { actual, blended } } })`
- Rates immediately update all financial calculations (run rates, costs)
- Allow up to 2 decimal places

### UI Details

- Table styling consistent with OutcomesTable
- Helper text below table: "Actual = direct cost, Blended = loaded cost (benefits, overhead)"
- Level badges use existing color scheme (APD green, PD blue, SPD orange)

---

## Tab 3: Product Teams

**Component:** `SettingsTeamsTab.jsx`

### Layout

Table with inline editing for CRUD operations.

**Columns:**
1. Team Name - editable text input
2. Portfolio - editable dropdown
3. Designers Assigned - read-only count with tooltip
4. Actions - [Edit] [Delete] or [Save] [Cancel]

**Row States:**
- **View mode:** Display text with [Edit] [Delete] buttons
- **Edit mode:** Inline inputs replace text, [Save] [Cancel] buttons
- **Add mode:** Empty row at top with inputs, [Save] [Cancel] buttons

### CRUD Operations

**Add Team:**
1. Click "+ Add Product Team" button
2. Row appears at top with empty inputs
3. Fill in Team Name (required, max 50 chars)
4. Select Portfolio from dropdown (required)
5. Click [Save] → calls `addProductTeam({ name, portfolioId })`
6. New team appears in table, sorted by portfolio

**Edit Team:**
1. Click [Edit] on a row
2. Row switches to edit mode with inputs populated
3. Modify name or portfolio
4. Click [Save] → calls `updateProductTeam(id, { name, portfolioId })`
5. Row returns to view mode with updated values

**Delete Team:**
1. Click [Delete] on a row
2. Check if designers allocated:
   ```javascript
   const hasDesigners = designers.some(d =>
     d.allocations.some(a => a.productTeamId === id)
   );
   ```
3. **If has designers:** Show `KdsMessage` kind="error" with helpful guidance:
   ```
   Cannot delete [Team Name] - 3 designers are currently allocated.

   To delete this team:
   1. Go to Individual Designers page
   2. Find designers allocated to [Team Name]: [Designer1], [Designer2], [Designer3]
   3. Edit each designer and remove their allocation to this team
   4. Return here to delete the team
   ```
4. **If no designers:** Show confirmation dialog:
   - Header: "Delete [Team Name]?"
   - Body: "Are you sure you want to delete '[Team Name]'? This action cannot be undone."
   - Footer: [Delete] (kind="destructive") | [Cancel]
5. On confirm → calls `deleteProductTeam(id)`

### Designers Assigned Column

- Shows count: "3 designers"
- Clickable to show designer names in tooltip/popover
- Helps users understand impact before deletion

### Validation

- Team name required, max 50 characters
- Portfolio required
- No duplicate team names (case-insensitive check)
- Show validation errors inline using `KdsMessage` kind="error"

### UI Details

- Group rows visually by portfolio (alternating background colors)
- Only one row editable at a time (clicking Edit elsewhere cancels current edit)
- Empty state: "No product teams yet. Click '+ Add Product Team' to create one."
- Table has sticky header for long lists

---

## Tab 4: Portfolios

**Component:** `SettingsPortfoliosTab.jsx`

### Layout

Simpler table than Product Teams.

**Columns:**
1. Portfolio Name - editable text input
2. Teams Count - read-only count with tooltip
3. Actions - [Edit] [Delete] or [Save] [Cancel]

Same row states as Product Teams tab.

### CRUD Operations

**Add Portfolio:**
1. Click "+ Add Portfolio" button
2. Row appears at top with empty input
3. Fill in Portfolio Name (required, max 30 chars)
4. Click [Save] → calls `addPortfolio({ name })`

**Edit Portfolio:**
1. Click [Edit] on a row
2. Row switches to edit mode
3. Modify name
4. Click [Save] → calls `updatePortfolio(id, { name })`

**Delete Portfolio:**
1. Click [Delete] on a row
2. Check if teams assigned:
   ```javascript
   const hasTeams = productTeams.some(t => t.portfolioId === id);
   ```
3. **If has teams:** Show error with guidance:
   ```
   Cannot delete [Portfolio Name] - 4 product teams are assigned.

   To delete this portfolio:
   1. Switch to Product Teams tab
   2. Either delete or reassign these teams: [Team1], [Team2], [Team3], [Team4]
   3. Return here to delete the portfolio
   ```
4. **If no teams:** Show confirmation dialog
5. On confirm → calls `deletePortfolio(id)`

### Teams Count Column

- Shows count: "4 teams"
- Tooltip shows team names on hover
- Helps users understand dependencies

### Validation

- Portfolio name required, max 30 characters
- No duplicate portfolio names (case-insensitive)
- Show validation errors inline

### UI Details

- Simpler than Teams tab (no grouping needed)
- Only one row editable at a time
- Empty state: "No portfolios yet. Click '+ Add Portfolio' to create one."

---

## Shared Patterns

### Inline Editing Pattern

**Edit Mode Activation:**
- Click [Edit] button → row switches to edit mode with inputs
- Only one row editable at a time across the entire tab
- Clicking [Edit] on another row cancels current edit (with warning if unsaved changes)

**Save Behavior:**
1. Validate inputs (non-empty, no duplicates, length limits)
2. If valid:
   - Call context action
   - Exit edit mode
   - Show brief success (green highlight on row for 1 second)
3. If invalid:
   - Show `KdsMessage` kind="error" inline
   - Stay in edit mode
   - Focus first invalid field

**Cancel Behavior:**
- Revert to original values
- Exit edit mode
- Remove add row if adding

### Delete Confirmation Dialog

Uses `MxModal` for teams/portfolios with no dependencies:
- Header: "Delete [Entity Name]?"
- Body: "Are you sure you want to delete '[Name]'? This action cannot be undone."
- Footer: [Delete] button (kind="destructive") | [Cancel] button

### Error Messages

**Validation Errors (inline):**
- Empty name: "[Entity] name is required"
- Duplicate name: "A [entity] with this name already exists"
- Too long: "[Entity] name must be 50 characters or less"

**Deletion Blockers (with guidance):**
- Follow pattern shown in Tab 3 and Tab 4 sections
- Always list specific items blocking deletion
- Provide step-by-step instructions
- Show count and names

---

## Tab Navigation

### Behavior

- Use `KdsTabs` component with controlled `activeTab` state
- Switching tabs cancels any active edit/add operation
- If unsaved changes exist, show warning: "You have unsaved changes. Cancel editing?"
- Tab state persists - changes are saved immediately, so returning to a tab shows latest data

### Tab Order

1. Capacity (most commonly adjusted)
2. Rates (frequently adjusted)
3. Product Teams (occasional CRUD)
4. Portfolios (rarely changed)

---

## Styling & Layout

### Consistent with Existing App

- Use `kds-Card` pattern for tab content areas
- Table styling matches OutcomesTable:
  - Sticky header
  - Hover states on rows
  - Alternating row backgrounds for grouping
  - Border radius and shadow
- Color scheme:
  - Primary actions: Blue (#0F52A2)
  - Success: Green (#2e7d32)
  - Destructive/Errors: Red (#d32f2f)
  - Gray for neutral/disabled

### Responsive Design

- Modal is `size="xl"` on desktop
- Tables scroll horizontally on mobile
- Inputs stack on very narrow screens
- Close button always visible

### Empty States

- Show helpful message when no data exists
- Include call-to-action button (e.g., "+ Add Product Team")
- Use light gray background with centered text

---

## Data Flow

### Reads (from ResourceContext)

```javascript
const {
  capacitySettings,
  productTeams,
  portfolios,
  designers,
  updateCapacitySettings,
  addProductTeam,
  updateProductTeam,
  deleteProductTeam,
  addPortfolio,
  updatePortfolio,
  deletePortfolio
} = useResource();
```

### Writes (to ResourceContext)

All updates call context actions directly:
- `updateCapacitySettings({ ...settings })`
- `addProductTeam({ name, portfolioId })`
- `updateProductTeam(id, { name, portfolioId })`
- `deleteProductTeam(id)`
- `addPortfolio({ name })`
- `updatePortfolio(id, { name })`
- `deletePortfolio(id)`

ResourceContext handles:
- ID generation (uuid)
- State updates
- localStorage persistence (auto-save with 500ms debounce)
- Cascade logic (e.g., removing team allocations when team deleted)

---

## Testing Strategy

### Manual Testing Checklist

**Capacity Settings:**
- [ ] Edit hours per week → verify calculation preview updates
- [ ] Edit PTO hours → verify available hours changes
- [ ] Switch to Team Summary → verify designer hours reflect new settings

**Rate Settings:**
- [ ] Edit actual rate for PD → verify it accepts currency format
- [ ] Edit blended rate for SPD → verify decimals work
- [ ] Check Individual Designers page → verify monthly run rates updated

**Product Teams:**
- [ ] Add new team with portfolio selection
- [ ] Edit team name and portfolio
- [ ] Try to delete team with designers → verify helpful error appears
- [ ] Delete team with no designers → verify confirmation works
- [ ] Check Designer Edit Modal → verify new team appears in dropdown
- [ ] Duplicate name validation works

**Portfolios:**
- [ ] Add new portfolio
- [ ] Edit portfolio name
- [ ] Try to delete portfolio with teams → verify helpful error
- [ ] Delete portfolio with no teams → verify confirmation works
- [ ] Check Product Teams tab → verify new portfolio in dropdown
- [ ] Duplicate name validation works

**General:**
- [ ] Only one row editable at a time
- [ ] Cancel reverts changes correctly
- [ ] Switching tabs cancels edit mode
- [ ] Empty states show when all items deleted
- [ ] Settings persist after page reload
- [ ] Responsive layout on mobile

### Edge Cases

- Editing a team's portfolio while designers are allocated (should work)
- Deleting last portfolio (should show error - need at least one)
- Very long team names (truncate in UI, enforce max length)
- Special characters in names (allow, but sanitize)
- Portfolio with 10+ teams (scrollable dropdown)

---

## Success Criteria

**Functional:**
- Users can adjust capacity settings and see real-time calculation updates
- Users can adjust rates and see financial metrics update
- Users can add/edit/delete product teams with proper validation
- Users can add/edit/delete portfolios with proper validation
- Deletion is blocked with helpful error messages when dependencies exist
- All changes auto-save to localStorage

**UX:**
- Settings modal feels fast and responsive
- Inline editing is intuitive (familiar spreadsheet-like UX)
- Error messages are helpful and actionable
- No nested modals (stays clean and simple)
- Consistent with existing app patterns

**Technical:**
- Reuses existing ResourceContext actions
- No new state management complexity
- All components < 200 lines of code
- Follows existing mx-web-components patterns
- Maintains existing test coverage

---

## Future Enhancements (Post-MVP)

- Data Management tab (export/import JSON, reset to placeholder)
- Bulk edit capabilities (e.g., adjust all rates by 10%)
- Search/filter for long lists of teams
- Drag-to-reorder teams within portfolios
- Audit log showing who changed what when
- Undo/redo functionality
- Nested modals for complex forms if needed

---

## Implementation Notes

**Component Sizing Estimates:**
- SettingsModal.jsx: ~80 lines (coordinator with tabs)
- SettingsCapacityTab.jsx: ~100 lines (form with preview)
- SettingsRatesTab.jsx: ~80 lines (simple table)
- SettingsTeamsTab.jsx: ~200 lines (complex CRUD with validation)
- SettingsPortfoliosTab.jsx: ~150 lines (simpler CRUD)

**Total:** ~610 lines of new code

**Dependencies:**
- mx-web-components (already installed): MxModal, MxInputTextBox, MxSingleSelect, KdsTabs, KdsButton, KdsMessage
- ResourceContext actions (already implemented)
- uuid (already installed) - used by context for ID generation

**Development Approach:**
1. Build SettingsModal shell with tabs
2. Implement Capacity tab (simplest)
3. Implement Rates tab (simple table)
4. Implement Portfolios tab (simpler CRUD, good pattern practice)
5. Implement Teams tab (most complex, reuse Portfolio patterns)
6. Wire up to App.jsx
7. Manual testing checklist
8. Polish and bug fixes
