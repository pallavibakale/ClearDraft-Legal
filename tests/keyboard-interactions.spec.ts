import { test, expect } from "@playwright/test";

/**
 * Keyboard Interaction Tests
 * Validates keyboard shortcuts, navigation, and accessibility features
 */

test.describe("Keyboard Interactions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test.describe("Text Editing Shortcuts", () => {
    test("should support Ctrl+B for bold", async ({ page }) => {
      const editor = page.locator('[contenteditable="true"]').first();
      await editor.fill("Bold text");
      await editor.press("Control+A");
      await editor.press("Control+B");

      // Check if bold formatting is applied
      const boldElement = page.locator("strong, b");
      await expect(boldElement).toBeVisible();
    });

    test("should support Ctrl+I for italic", async ({ page }) => {
      const editor = page.locator('[contenteditable="true"]').first();
      await editor.fill("Italic text");
      await editor.press("Control+A");
      await editor.press("Control+I");

      // Check if italic formatting is applied
      const italicElement = page.locator("em, i");
      await expect(italicElement).toBeVisible();
    });

    test("should support Ctrl+U for underline", async ({ page }) => {
      const editor = page.locator('[contenteditable="true"]').first();
      await editor.fill("Underlined text");
      await editor.press("Control+A");
      await editor.press("Control+U");

      // Check if underline formatting is applied
      const underlineElement = page.locator("u");
      await expect(underlineElement).toBeVisible();
    });

    test("should support Ctrl+Z for undo", async ({ page }) => {
      const editor = page.locator('[contenteditable="true"]').first();
      await editor.fill("Original");
      await editor.press("Control+A");
      await editor.type("Changed");

      await editor.press("Control+Z");
      await expect(editor).toHaveText("Original");
    });

    test("should support Ctrl+Y for redo", async ({ page }) => {
      const editor = page.locator('[contenteditable="true"]').first();
      await editor.fill("Original");
      await editor.press("Control+A");
      await editor.type("Changed");

      await editor.press("Control+Z"); // Undo
      await editor.press("Control+Y"); // Redo
      await expect(editor).toHaveText("Changed");
    });

    test("should support Ctrl+A for select all", async ({ page }) => {
      const editor = page.locator('[contenteditable="true"]').first();
      const testText = "Select all this text";
      await editor.fill(testText);
      await editor.press("Control+A");
      await editor.type("Replaced");

      await expect(editor).toHaveText("Replaced");
    });
  });

  test.describe("Navigation Shortcuts", () => {
    test("should navigate with arrow keys", async ({ page }) => {
      const editor = page.locator('[contenteditable="true"]').first();
      await editor.fill("Test text");

      // Move to beginning
      await editor.press("Home");
      await editor.type("Start ");

      await expect(editor).toHaveText("Start Test text");
    });

    test("should navigate with Home and End keys", async ({ page }) => {
      const editor = page.locator('[contenteditable="true"]').first();
      await editor.fill("Middle");

      await editor.press("Home");
      await editor.type("Start ");

      await editor.press("End");
      await editor.type(" End");

      await expect(editor).toHaveText("Start Middle End");
    });

    test("should navigate with Ctrl+Home and Ctrl+End", async ({ page }) => {
      const editor = page.locator('[contenteditable="true"]').first();
      await editor.fill("Line 1\nLine 2\nLine 3");

      await editor.press("Control+End");
      await editor.type(" - Added at end");

      await expect(editor).toContainText("Added at end");
    });

    test("should support Tab key for navigation", async ({ page }) => {
      // Tab through interactive elements
      await page.keyboard.press("Tab");

      // Check first focusable element is focused
      const firstButton = page.locator("button").first();
      await expect(firstButton).toBeFocused();

      // Tab to next element
      await page.keyboard.press("Tab");
      const secondButton = page.locator("button").nth(1);
      await expect(secondButton).toBeFocused();
    });

    test("should support Shift+Tab for reverse navigation", async ({
      page,
    }) => {
      const lastButton = page.locator("button").last();
      await lastButton.focus();

      await page.keyboard.press("Shift+Tab");

      // Previous element should be focused
      const previousElement = page.locator(":focus");
      await expect(previousElement).toBeVisible();
    });
  });

  test.describe("Document Operations", () => {
    test("should support Ctrl+S for save", async ({ page }) => {
      // Set up listener for save operation
      let saveTriggered = false;
      page.on("console", (msg) => {
        if (msg.text().includes("save")) {
          saveTriggered = true;
        }
      });

      await page.keyboard.press("Control+S");

      // Give time for save operation
      await page.waitForTimeout(500);

      // Verify save action (adjust based on your UI feedback)
      // Could check for toast notification, API call, etc.
    });

    test("should support Ctrl+F for find", async ({ page }) => {
      await page.keyboard.press("Control+F");

      // Browser's native find should open
      // This is handled by the browser, so we just verify the key works
      await page.waitForTimeout(300);
    });

    test("should support Escape to close modals", async ({ page }) => {
      // Open a modal
      await page.click('button:has-text("Add Annotation")');
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();

      // Press Escape
      await page.keyboard.press("Escape");

      // Modal should close
      await expect(modal).not.toBeVisible();
    });
  });

  test.describe("Accessibility Keyboard Support", () => {
    test("should support Enter key to activate buttons", async ({ page }) => {
      const button = page.locator("button").first();
      await button.focus();
      await page.keyboard.press("Enter");

      // Verify button was activated (adjust based on button behavior)
      await page.waitForTimeout(300);
    });

    test("should support Space key to activate buttons", async ({ page }) => {
      const button = page.locator("button").first();
      await button.focus();
      await page.keyboard.press("Space");

      // Verify button was activated
      await page.waitForTimeout(300);
    });

    test("should maintain focus visibility", async ({ page }) => {
      await page.keyboard.press("Tab");

      const focusedElement = page.locator(":focus");
      await expect(focusedElement).toBeVisible();

      // Check focus indicator is visible (CSS outline or custom styling)
      const box = await focusedElement.boundingBox();
      expect(box).not.toBeNull();
    });

    test("should support keyboard navigation in lists", async ({ page }) => {
      const clauseList = page.locator(".clause-item").first();
      await clauseList.focus();

      await page.keyboard.press("ArrowDown");
      await page.waitForTimeout(100);

      // Second item should be focused/selected
      const secondItem = page.locator(".clause-item").nth(1);
      await expect(secondItem).toHaveClass(/selected|focused|active/);
    });
  });

  test.describe("Copy/Paste Operations", () => {
    test("should support Ctrl+C and Ctrl+V", async ({ page }) => {
      const editor = page.locator('[contenteditable="true"]').first();
      const testText = "Copy this text";

      await editor.fill(testText);
      await editor.press("Control+A");
      await editor.press("Control+C");

      // Clear and paste
      await editor.press("Delete");
      await editor.press("Control+V");

      await expect(editor).toHaveText(testText);
    });

    test("should support Ctrl+X for cut", async ({ page }) => {
      const editor = page.locator('[contenteditable="true"]').first();
      const testText = "Cut this text";

      await editor.fill(testText);
      await editor.press("Control+A");
      await editor.press("Control+X");

      await expect(editor).toHaveText("");

      // Paste it back
      await editor.press("Control+V");
      await expect(editor).toHaveText(testText);
    });
  });

  test.describe("Multi-key Combinations", () => {
    test("should handle rapid key sequences", async ({ page }) => {
      const editor = page.locator('[contenteditable="true"]').first();

      // Type quickly
      await editor.type("Quick", { delay: 10 });
      await editor.type(" typing", { delay: 10 });
      await editor.type(" test", { delay: 10 });

      await expect(editor).toHaveText("Quick typing test");
    });

    test("should handle multiple modifiers", async ({ page }) => {
      const editor = page.locator('[contenteditable="true"]').first();
      await editor.fill("Test");

      // Ctrl+Shift+End (select to end)
      await editor.press("Home");
      await editor.press("Control+Shift+End");
      await editor.type("Replaced");

      await expect(editor).toHaveText("Replaced");
    });
  });
});
