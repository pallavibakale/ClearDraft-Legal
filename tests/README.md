# Playwright Test Setup for ClearDraft Legal

This directory contains end-to-end tests for the ClearDraft Legal Toolkit using Playwright.

## Test Suites

### 1. Formatting Stability Tests (`formatting-stability.spec.ts`)

Tests to ensure document formatting remains consistent during editing operations:

- Text editor formatting preservation
- Save/load cycle consistency
- Annotation formatting stability
- Line break handling
- Special character support
- Undo/redo operations

### 2. Keyboard Interaction Tests (`keyboard-interactions.spec.ts`)

Tests for keyboard shortcuts and navigation:

- Text editing shortcuts (Ctrl+B, Ctrl+I, Ctrl+U)
- Undo/redo (Ctrl+Z, Ctrl+Y)
- Navigation keys (Home, End, Arrow keys)
- Tab navigation and focus management
- Copy/paste operations
- Accessibility keyboard support

### 3. Cross-Browser Behavior Tests (`cross-browser.spec.ts`)

Tests to validate consistent behavior across Chrome, Firefox, and Safari:

- UI rendering consistency
- User interaction handling
- Content editing functionality
- Layout responsiveness
- Event handling
- Performance and loading
- Browser-specific features
- Accessibility compliance

## Running Tests

### Install Dependencies

```bash
npm install
npx playwright install
```

### Run All Tests

```bash
npm test
```

### Run Tests with UI

```bash
npm run test:ui
```

### Run Tests in Headed Mode

```bash
npm run test:headed
```

### Debug Tests

```bash
npm run test:debug
```

### Run Specific Test File

```bash
npx playwright test tests/formatting-stability.spec.ts
```

### Run Tests on Specific Browser

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## Test Configuration

Tests are configured in `playwright.config.ts` with the following settings:

- **Base URL**: http://localhost:5173
- **Browsers**: Chromium, Firefox, WebKit (Safari)
- **Mobile**: Pixel 5, iPhone 12
- **Trace**: On first retry
- **Screenshots**: On failure only
- **Dev Server**: Automatically started before tests

## Writing New Tests

When adding new tests, follow these patterns:

```typescript
import { test, expect } from "@playwright/test";

test.describe("Feature Name", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("should do something", async ({ page }) => {
    // Your test code here
    await expect(page.locator("selector")).toBeVisible();
  });
});
```

## Continuous Integration

Tests can be run in CI with:

```bash
CI=true npm test
```

This will:

- Run tests with 2 retries
- Use 1 worker (for consistency)
- Generate HTML report

## Viewing Test Reports

After running tests, view the HTML report:

```bash
npx playwright show-report
```

## Troubleshooting

### Tests are failing

1. Ensure dev server is running: `npm run dev`
2. Check that selectors match your UI
3. Adjust timeouts if needed
4. Run in headed mode to see what's happening: `npm run test:headed`

### Browser installation issues

```bash
npx playwright install --with-deps
```

### Selector issues

Use Playwright Inspector to find correct selectors:

```bash
npx playwright test --debug
```

## Best Practices

1. **Use semantic selectors**: Prefer `role`, `text`, and `label` selectors over CSS classes
2. **Wait for state**: Always wait for network idle or specific elements
3. **Isolate tests**: Each test should be independent
4. **Clear data**: Reset state in `beforeEach` hooks
5. **Meaningful assertions**: Use descriptive expect messages
6. **Screenshot on failure**: Automatically captured for debugging

## Notes

- Tests are designed to work with the actual UI elements in your app
- Some tests may need adjustment based on your specific implementation
- Selectors may need to be updated to match your component structure
- Consider adding data-testid attributes for more stable selectors
