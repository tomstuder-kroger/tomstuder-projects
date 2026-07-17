# Manual Testing Checklist: Import from Capacity Planning App

## Prerequisites
- Both apps should be in the same parent directory
- Capacity Planning app should have some IC data saved in localStorage

## Test Scenarios

### 1. Import with Valid Data
**Steps:**
1. Open Capacity Planning app (../capacity-planning-app)
2. Verify it has some ICs with names and roles
3. Open PD Resource Management app
4. Click Settings icon (gear) in nav bar
5. Click "Import/Export" tab (5th tab)
6. Click "Check for Data" button

**Expected:**
- Blue preview box appears showing IC names and roles
- Button text shows "Import X ICs" (where X is the count)

7. Click "Import X ICs" button

**Expected:**
- Green success message: "Successfully imported X designers from Capacity Planning app"
- Preview box disappears

8. Close Settings modal
9. View Individual Designers page

**Expected:**
- New designers appear in the grid
- Names match IC names from capacity-planning-app
- Levels are correctly mapped (Senior → SPD, Associate → APD, others → PD)
- All new designers show 0% allocated (no allocations yet)

---

### 2. Import with No Data
**Steps:**
1. Clear capacity-planning-app localStorage (open browser DevTools → Application → Local Storage → delete 'capacity-planning-ics')
2. In PD Resource Management Settings → Import/Export tab
3. Click "Check for Data"

**Expected:**
- Red error message: "No data found in Capacity Planning app. Make sure the app has been used first."
- No preview box appears
- No import button appears

---

### 3. Import Duplicate ICs
**Steps:**
1. Import ICs once (following Test 1)
2. Click "Check for Data" again
3. Try to import the same ICs again

**Expected:**
- Red error message: "No new designers to import (all ICs already exist)"
- Duplicate prevention works (compares names case-insensitively)

---

### 4. Role Mapping Validation
Create ICs in capacity-planning-app with these roles:
- "Senior Product Designer" → should map to SPD
- "Associate Product Designer" → should map to APD
- "Product Designer" → should map to PD
- "" (empty role) → should map to PD
- "UX Designer" → should map to PD

**Expected:**
After import, all designers have correct levels

---

### 5. Export/Import JSON Backup
**Steps:**
1. Make changes to designers, teams, settings
2. Settings → Import/Export → "Export All Data"
3. JSON file downloads with timestamp in filename
4. Make more changes or delete some data
5. Settings → Import/Export → "Choose File to Import"
6. Select the exported JSON file

**Expected:**
- Green success message
- All data restored to exported state
- No data corruption

---

## Edge Cases to Test

### IC with Missing Name
- Create IC in capacity-planning-app with empty name
- Import should skip it silently

### IC with Special Characters in Name
- Create IC with name like "O'Brien" or "José García"
- Should import correctly without breaking

### Very Long IC Name
- Create IC with 100+ character name
- Should import correctly (no truncation needed)

---

## Rollback Plan
If import breaks something:
1. Check browser console for errors
2. Settings → Import/Export → Import from a previous JSON backup
3. Or clear localStorage and refresh to reset to placeholder data

---

## Success Criteria
✅ Import creates valid designer records
✅ No duplicate imports
✅ Safe role mapping with defaults
✅ No app crashes or console errors
✅ Data can be exported and re-imported
✅ Imported designers can be edited normally
✅ Allocations can be added to imported designers
