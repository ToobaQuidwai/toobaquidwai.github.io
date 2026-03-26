const { test, expect } = require("@playwright/test");
const path = require("path");

const pageUrl = `file://${path.join(__dirname, "..", "index.html")}`;

test.describe("portfolio page", () => {
  test("renders the core research narrative and key sections", async ({ page }) => {
    await page.goto(pageUrl);

    await expect(page).toHaveTitle(/Tooba Quidwai/i);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Researching cilia"
    );
    await expect(page.getByRole("link", { name: /contact by email/i })).toBeVisible();
    await expect(page.locator("#about")).toBeVisible();
    await expect(page.locator("#highlights")).toBeVisible();
    await expect(page.locator("#experience")).toBeVisible();
    await expect(page.locator("#publications")).toBeVisible();
    await expect(page.locator("#skills")).toBeVisible();
    await expect(page.locator("#contact")).toBeVisible();
  });

  test("shows updated scholar metrics and publication evidence", async ({ page }) => {
    await page.goto(pageUrl);

    await expect(page.getByText("218").first()).toBeVisible();
    await expect(page.getByText("Google Scholar h-index")).toBeVisible();
    await expect(page.getByText("Google Scholar i10-index")).toBeVisible();
    await expect(page.getByText("43 citations")).toBeVisible();
    await expect(page.getByText("69 citations")).toBeVisible();
    await expect(page.locator('img[src*="wdr35-fig-02.png"]')).toBeVisible();
    await expect(page.locator('img[src*="caged-fig-03.png"]')).toBeVisible();
  });

  test("desktop navigation links and external profile links are wired correctly", async ({ page, isMobile }) => {
    await page.goto(pageUrl);

    if (isMobile) {
      await page.getByRole("button", { name: "Menu" }).click();
    }

    await page.locator(".nav-links").getByRole("link", { name: "Publications", exact: true }).click();
    await expect(page).toHaveURL(/#publications$/);

    await expect(page.getByRole("link", { name: "Google Scholar" }).first()).toHaveAttribute(
      "href",
      /scholar\.google\.com/
    );
    await expect(page.getByRole("link", { name: "LinkedIn" }).first()).toHaveAttribute(
      "href",
      /linkedin\.com/
    );
    await expect(page.getByRole("link", { name: "ResearchGate" }).first()).toHaveAttribute(
      "href",
      /researchgate\.net/
    );
    await expect(page.getByRole("link", { name: /contact by email/i })).toHaveAttribute(
      "href",
      "mailto:tooba.quidwai@bio.ku.dk"
    );
  });

  test("mobile menu opens and reaches in-page sections", async ({ page, isMobile }) => {
    test.skip(!isMobile, "Mobile-only navigation test");

    await page.goto(pageUrl);

    const toggle = page.getByRole("button", { name: "Menu" });
    await expect(toggle).toBeVisible();
    await toggle.click();
    await page.getByRole("link", { name: "Talks & Awards" }).click();
    await expect(page).toHaveURL(/#talks-awards$/);
  });

  test("paper preview assets load without broken local references", async ({ page }) => {
    await page.goto(pageUrl);

    const images = page.locator("img");
    await expect(images).toHaveCount(2);

    const imageStates = await images.evaluateAll((nodes) =>
      nodes.map((node) => ({
        complete: node.complete,
        naturalWidth: node.naturalWidth,
        src: node.getAttribute("src"),
      }))
    );

    for (const image of imageStates) {
      expect(image.complete, `${image.src} should complete loading`).toBeTruthy();
      expect(image.naturalWidth, `${image.src} should have width`).toBeGreaterThan(0);
    }
  });
});
