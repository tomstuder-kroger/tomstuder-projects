# LocalStorage Backup & Restore Instructions

## How to Restore LocalStorage from Backup

If your app data is deleted, follow these steps to restore from a backup JSON file.

---

## Method 1: Safe Restore (Recommended)

1. Open your backup file (e.g., `7_8_local-storage-backup.json`)
2. Copy the **entire contents** of the file
3. Open the browser console (F12 or right-click → Inspect → Console tab)
4. Paste this code:

```javascript
// Step 1: Paste your backup data
const backup = {
  // Paste the entire JSON contents here (between the curly braces)
};

// Step 2: Restore to localStorage
Object.entries(backup).forEach(([key, value]) => {
  localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
});

// Step 3: Verify it worked
console.log('✓ Restored keys:', Object.keys(localStorage));
console.log('✓ Active IC ID:', localStorage.getItem('capacity-planning-active-id'));
console.log('✓ Total ICs:', JSON.parse(localStorage.getItem('capacity-planning-ics')).length);
```

5. Press Enter to execute
6. **Reload the page** to see your restored data

---

## Method 2: One-Liner Restore

1. Copy the **entire contents** of your backup JSON file
2. Paste this into the browser console (replacing `PASTE_JSON_HERE` with your copied JSON):

```javascript
Object.entries(PASTE_JSON_HERE).forEach(([k,v]) => localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v)));
```

3. Press Enter
4. **Reload the page**

---

## Verification Commands

After restoring, verify your data before reloading:

```javascript
// Check active IC
console.log(localStorage.getItem('capacity-planning-active-id'));

// Check number of ICs restored
console.log(JSON.parse(localStorage.getItem('capacity-planning-ics')).length);

// Check team name
console.log(localStorage.getItem('capacity-planning-team-name'));

// View all localStorage keys
console.log(Object.keys(localStorage));
```

---

## Creating a New Backup

To create a fresh backup of your current localStorage:

```javascript
// Copy all localStorage to clipboard
copy(JSON.stringify(localStorage));
```

Then paste into a new `.txt` file and convert to JSON format.

---

## Backup File Naming Convention

Format: `MM_DD_local-storage-backup.json`

Example: `7_8_local-storage-backup.json` (July 8th backup)

---

## Important Notes

- Always **reload the page** after restoring localStorage
- The restore process will **overwrite** existing localStorage data
- Keep multiple dated backups for safety
- Backups are specific to the domain/port (e.g., `localhost:3000`)
