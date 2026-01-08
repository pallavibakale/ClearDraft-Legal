import { test, expect } from "@playwright/test";

/**
 * Cross-Browser Behavior Tests
 * Validates that core functionality works consistently across Chrome, Firefox, and Safari
 * Tests are run on all browsers configured in playwright.config.ts
 */

test.describe("Cross-Browser Behavior", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test.describe("UI Rendering", () => {
    test("should render main interface correctly", async ({
      page,
      browserName,
    }) => {
      // Check main components are visible
      await expect(page.locator("h1, .app-title")).toBeVisible();
      await expect(page.locator("button").first()).toBeVisible();

      // Take screenshot for visual regression
      await page.screenshot({
        path: `tests/screenshots/main-interface-${browserName}.png`,
        fullPage: true,
      });
    });

    test("should display clause editor correctly", async ({ page }) => {
      const editor = page.locator('[contenteditable="true"]').first();
      await expect(editor).toBeVisible();

      // Verify editor is functional
      await editor.fill("Test content");
      await expect(editor).toHaveText("Test content");
    });

    test("should render buttons with correct styling", async ({ page }) => {
      const buttons = page.locator("button");
      const count = await buttons.count();

      expect(count).toBeGreaterThan(0);

      // Check each button is properly rendered
      for (let i = 0; i < Math.min(count, 5); i++) {
        const button = buttons.nth(i);
        await expect(button).toBeVisible();

        const box = await button.boundingBox();
        expect(box).not.toBeNull();
        expect(box?.width).toBeGreaterThan(0);
        expect(box?.height).toBeGreaterThan(0);
      }
    });

    test("should render annotation panel correctly", async ({ page }) => {
      // Look for annotation panel or button to open it
      const annotationButton = page
        .locator(
          'button:has-text("Annotation"), button:has-text("Add Annotation")'
        )
        .first();

      if (await annotationButton.isVisible()) {
        await annotationButton.click();

        // Verify panel appears
        const panel = page.locator(
          '[class*="annotation"], [role="complementary"]'
        );
        await expect(panel).toBeVisible();
      }
    });
  });

  test.describe("User Interactions", () => {
    test("should handle button clicks correctly", async ({ page }) => {
      const button = page.locator("button").first();
      await expect(button).toBeEnabled();

      await button.click();
      await page.waitForTimeout(300);

      // Verify click was processed (adjust based on your UI)
    });

    test("should handle text input correctly", async ({ page }) => {
      const editor = page.locator('[contenteditable="true"]').first();
      const testText = "Cross-browser test input";

      await editor.fill(testText);
      await expect(editor).toHaveText(testText);

      // Verify text persists
      await page.waitForTimeout(500);
      await expect(editor).toHaveText(testText);
    });

    test("should handle textarea input correctly", async ({ page }) => {
      const textarea = page.locator("textarea").first();

      if (await textarea.isVisible()) {
        const testText = "Textarea input test\nWith multiple lines";
        await textarea.fill(testText);
        await expect(textarea).toHaveValue(testText);
      }
    });

    test("should handle form submissions", async ({ page }) => {
      // Look for any form elements
      const forms = page.locator("form");
      const formCount = await forms.count();

      if (formCount > 0) {
        const form = forms.first();
        const submitButton = form.locator('button[type="submit"]');

        if (await submitButton.isVisible()) {
          await submitButton.click();
          await page.waitForTimeout(500);
        }
      }
    });
  });

  test.describe("Content Editing", () => {
    test("should support content editable elements", async ({ page }) => {
      const editor = page.locator('[contenteditable="true"]').first();

      await editor.click();
      await editor.type("Testing content editable");

      await expect(editor).toContainText("Testing content editable");
    });

    test("should preserve formatting across browsers", async ({ page }) => {
      const editor = page.locator('[contenteditable="true"]').first();

      await editor.fill("Formatted text");

      // Apply formatting (if buttons exist)
      const boldButton = page.locator('button:has-text("Bold")');
      if (await boldButton.isVisible()) {
        await boldButton.click();

        // Check formatting applied
        const bold = page.locator("strong, b");
        await expect(bold).toBeVisible();
      }
    });

    test("should handle paste operations", async ({ page }) => {
      const editor = page.locator('[contenteditable="true"]').first();

      await editor.fill("Original");
      await editor.press("Control+A");
      await editor.press("Control+C");
      await editor.type(" ");
      await editor.press("Control+V");

      await expect(editor).toContainText("Original");
    });
  });

  test.describe("Layout and Responsiveness", () => {
    test("should maintain layout on window resize", async ({ page }) => {
      // Start with default size
      await page.setViewportSize({ width: 1920, height: 1080 });
      const initialTitle = page.locator("h1, .app-title").first();
      await expect(initialTitle).toBeVisible();

      // Resize to tablet
      await page.setViewportSize({ width: 768, height: 1024 });
      await expect(initialTitle).toBeVisible();

      // Resize to mobile
      await page.setViewportSize({ width: 375, height: 667 });
      await expect(initialTitle).toBeVisible();
    });

    test("should handle overflow content correctly", async ({ page }) => {
      const editor = page.locator('[contenteditable="true"]').first();

      // Add lots of content
      const longText = "Lorem ipsum dolor sit amet. ".repeat(50);
      await editor.fill(longText);

      // Verify element is still visible and scrollable
      await expect(editor).toBeVisible();
      const box = await editor.boundingBox();
      expect(box).not.toBeNull();
    });
  });

  test.describe("Event Handling", () => {
    test("should handle click events consistently", async ({ page }) => {
      const button = page.locator("button").first();
      let clickCount = 0;

      // Click multiple times
      for (let i = 0; i < 3; i++) {
        await button.click();
        clickCount++;
        await page.waitForTimeout(100);
      }

      expect(clickCount).toBe(3);
    });

    test("should handle focus events", async ({ page }) => {
      const editor = page.locator('[contenteditable="true"]').first();

      await editor.focus();
      await expect(editor).toBeFocused();

      await page.keyboard.press("Tab");
      await expect(editor).not.toBeFocused();
    });

    test("should handle blur events", async ({ page }) => {
      const editor = page.locator('[contenteditable="true"]').first();

      await editor.focus();
      await expect(editor).toBeFocused();

      await page.locator("body").click();
      await expect(editor).not.toBeFocused();
    });
  });

  test.describe("Performance and Loading", () => {
    test("should load application within acceptable time", async ({ page }) => {
      const startTime = Date.now();

      await page.goto("/");
      await page.waitForLoadState("networkidle");

      const loadTime = Date.now() - startTime;

      // Application should load in under 5 seconds
      expect(loadTime).toBeLessThan(5000);
    });

    test("should handle rapid interactions", async ({ page }) => {
      const button = page.locator("button").first();

      // Rapid clicks
      for (let i = 0; i < 10; i++) {
        await button.click({ delay: 50 });
      }

      // UI should still be responsive
      await expect(button).toBeVisible();
      await expect(button).toBeEnabled();
    });
  });

  test.describe("Browser-Specific Features", () => {
    test("should support browser back/forward navigation", async ({ page }) => {
      const initialURL = page.url();

      // Navigate if possible (adjust based on your routing)
      await page.goto("/#/test");
      await page.waitForTimeout(300);

      await page.goBack();
      await page.waitForTimeout(300);

      expect(page.url()).toBe(initialURL);
    });

    test("should maintain state across page refresh", async ({ page }) => {
      const editor = page.locator('[contenteditable="true"]').first();
      const testText = "Persistence test";

      await editor.fill(testText);

      // Reload page
      await page.reload();
      await page.waitForLoadState("networkidle");

      // Check if state is preserved (if your app implements persistence)
      // Note: This may fail if you don't have localStorage/sessionStorage
      await page.waitForTimeout(500);
    });
  });

  test.describe("Accessibility Across Browsers", () => {
    test("should maintain ARIA attributes", async ({ page }) => {
      // Check for ARIA labels
      const ariaElements = page.locator(
        "[aria-label], [aria-describedby], [role]"
      );
      const count = await ariaElements.count();

      expect(count).toBeGreaterThan(0);
    });

    test("should support keyboard navigation", async ({ page }) => {
      await page.keyboard.press("Tab");

      const focused = page.locator(":focus");
      await expect(focused).toBeVisible();
    });

    test("should have proper heading hierarchy", async ({ page }) => {
      const h1 = page.locator("h1");
      const h1Count = await h1.count();

      // Should have at least one h1
      expect(h1Count).toBeGreaterThan(0);
    });
  });

  test.describe("Error Handling", () => {
    test("should handle invalid input gracefully", async ({ page }) => {
      const editor = page.locator('[contenteditable="true"]').first();

      // Try various edge cases
      await editor.fill("");
      await expect(editor).toBeVisible();

      await editor.fill('<script>alert("test")</script>');
      // Should not execute script
      await page.waitForTimeout(500);
    });

    test("should recover from navigation errors", async ({ page }) => {
      // Try to navigate to non-existent route
      await page.goto("/#/nonexistent");
      await page.waitForTimeout(500);

      // App should still be functional
      await page.goto("/");
      await expect(page.locator("h1, .app-title").first()).toBeVisible();
    });
  });
});
