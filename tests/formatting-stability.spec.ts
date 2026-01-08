import { test, expect } from "@playwright/test";

/**
 * Formatting Stability Tests
 * Validates that document formatting remains consistent during editing,
 * annotations, and clause modifications
 */

test.describe("Formatting Stability", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Wait for app to be fully loaded
    await page.waitForLoadState("networkidle");
  });

  test("should maintain formatting when typing in clause editor", async ({
    page,
  }) => {
    // Open clause editor
    await page.click('button:has-text("Edit Clause")');

    const editor = page.locator('[contenteditable="true"]').first();
    await expect(editor).toBeVisible();

    // Type content
    await editor.fill("This is a test clause with specific formatting.");

    // Verify content is retained
    await expect(editor).toHaveText(
      "This is a test clause with specific formatting."
    );

    // Check that formatting controls are still accessible
    await expect(page.locator('button:has-text("Bold")')).toBeVisible();
  });

  test("should preserve formatting across save/load cycles", async ({
    page,
  }) => {
    const testText = "This clause should persist with formatting.";

    // Enter text
    const editor = page.locator('[contenteditable="true"]').first();
    await editor.fill(testText);

    // Apply bold formatting
    await page.click('button:has-text("Bold")');

    // Save changes
    await page.click('button:has-text("Save")');

    // Reload page
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Verify text is still present
    await expect(page.locator("text=" + testText)).toBeVisible();
  });

  test("should maintain formatting when adding annotations", async ({
    page,
  }) => {
    // Select text for annotation
    const documentText = page.locator(".document-content").first();
    await expect(documentText).toBeVisible();

    // Simulate text selection (this might need adjustment based on your UI)
    await documentText.click();

    // Add annotation
    await page.click('button:has-text("Add Annotation")');

    const annotationInput = page.locator('textarea[placeholder*="annotation"]');
    await annotationInput.fill("This is a test annotation");

    // Save annotation
    await page.click('button:has-text("Save Annotation")');

    // Verify original text formatting is intact
    await expect(documentText).toBeVisible();

    // Verify annotation appears
    await expect(page.locator(".annotation-marker")).toBeVisible();
  });

  test("should handle line breaks consistently", async ({ page }) => {
    const editor = page.locator('[contenteditable="true"]').first();

    // Type multi-line content
    await editor.fill("Line 1");
    await editor.press("Enter");
    await editor.type("Line 2");
    await editor.press("Enter");
    await editor.type("Line 3");

    // Check line breaks are preserved
    const content = await editor.textContent();
    expect(content?.split("\n").length).toBeGreaterThanOrEqual(3);
  });

  test("should maintain formatting when switching between clauses", async ({
    page,
  }) => {
    // Edit first clause
    await page.click(".clause-item:first-child");
    const editor = page.locator('[contenteditable="true"]').first();
    await editor.fill("First clause content");

    // Switch to second clause
    await page.click(".clause-item:nth-child(2)");
    await editor.fill("Second clause content");

    // Go back to first clause
    await page.click(".clause-item:first-child");

    // Verify first clause content is preserved
    await expect(editor).toHaveText("First clause content");
  });

  test("should handle special characters without breaking formatting", async ({
    page,
  }) => {
    const editor = page.locator('[contenteditable="true"]').first();
    const specialChars = '© ® ™ § ¶ € £ ¥ " " ';

    await editor.fill(specialChars);

    // Verify special characters are rendered correctly
    await expect(editor).toHaveText(specialChars);

    // Verify editor is still functional
    await editor.press("End");
    await editor.type(" Additional text");
    await expect(editor).toContainText("Additional text");
  });

  test("should maintain formatting when undoing/redoing changes", async ({
    page,
  }) => {
    const editor = page.locator('[contenteditable="true"]').first();

    await editor.fill("Original text");
    await expect(editor).toHaveText("Original text");

    // Make a change
    await editor.press("Control+A");
    await editor.type("Modified text");

    // Undo
    await editor.press("Control+Z");
    await expect(editor).toHaveText("Original text");

    // Redo
    await editor.press("Control+Y");
    await expect(editor).toHaveText("Modified text");
  });
});
