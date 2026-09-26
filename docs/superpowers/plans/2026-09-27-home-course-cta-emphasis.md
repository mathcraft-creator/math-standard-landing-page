# Home Course CTA Emphasis Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make both home course “자세히 보기” calls to action immediately noticeable without changing their links or card layout.

**Architecture:** Keep the existing card-wide anchors and HTML intact. Add a small CSS contract test for the visual affordances, then implement scoped `.course-button` styles, interaction states, mobile sizing, and reduced-motion handling in the existing stylesheet.

**Tech Stack:** Static HTML, CSS, Node.js built-in test runner

---

### Task 1: Add a CTA style contract test

**Files:**
- Modify: `tests/site-structure.test.cjs`
- Test: `tests/site-structure.test.cjs`

- [x] **Step 1: Write the failing test**

Append a test that reads `assets/site.css` and requires distinct filled CTA colors, card focus visibility, an arrow interaction, a mobile override, and reduced-motion handling:

```js
test('home course CTAs have prominent and accessible visual states', () => {
  const css = fs.readFileSync(path.join(root, 'assets/site.css'), 'utf8');
  assert.match(css, /\.course-card\.elementary \.course-button\s*{[^}]*background:\s*#102e69;[^}]*color:\s*#fff;/s);
  assert.match(css, /\.course-card\.secondary \.course-button\s*{[^}]*background:\s*#ffd65a;[^}]*color:\s*#071a3c;/s);
  assert.match(css, /\.course-card:focus-visible\s*{[^}]*outline:/s);
  assert.match(css, /\.course-card:(?:hover|focus-visible) \.course-button \.arrow\s*{[^}]*transform:/s);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*?\.course-button\s*{[^}]*font-size:/s);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*?\.course-portrait\s*{[^}]*bottom:\s*72px;/s);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.course-button/s);
});
```

- [x] **Step 2: Run the focused test to verify it fails**

Run: `node --test tests/site-structure.test.cjs`

Expected: FAIL because the filled CTA and interaction selectors do not exist yet.

### Task 2: Implement the approved CTA treatment

**Files:**
- Modify: `assets/site.css:360-466`
- Modify: `assets/site.css` inside `@media (max-width: 767px)`
- Modify: `assets/site.css` reduced-motion section
- Test: `tests/site-structure.test.cjs`

- [x] **Step 1: Add the base button and color styles**

Replace the text-only CTA spacing with a pill-shaped button using `min-height: 52px`, horizontal padding, a stronger font, rounded corners, shadow, and transitions. Add `#102e69`/white colors for elementary and `#ffd65a`/`#071a3c` colors for secondary.

- [x] **Step 2: Add interaction and accessibility states**

Add a visible `.course-card:focus-visible` outline. On card hover and focus, raise the button slightly and move the arrow diagonally. Keep transitions limited to transform, box-shadow, and background color.

- [x] **Step 3: Add mobile and reduced-motion rules**

Within `@media (max-width: 767px)`, reduce CTA type and padding while preserving the filled shape. Within `@media (prefers-reduced-motion: reduce)`, disable CTA and arrow transitions and transforms.

- [x] **Step 4: Run the focused test to verify it passes**

Run: `node --test tests/site-structure.test.cjs`

Expected: all tests in the file PASS.

### Task 3: Verify layout and repository health

**Files:**
- Verify: `index.html`
- Verify: `assets/site.css`

- [x] **Step 1: Inspect desktop and mobile rendering**

Open the local homepage at desktop and mobile widths. Confirm both CTAs are visually dominant, remain readable over their cards, do not overlap the portraits, and retain keyboard focus visibility.

- [x] **Step 2: Run the full checks**

Run:

```powershell
node --test tests/*.test.cjs
node --check assets/site.js
git diff --check
```

Expected: all tests PASS and both syntax/diff checks exit with code 0.
