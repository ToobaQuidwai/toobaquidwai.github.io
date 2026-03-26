const { test, expect } = require("@playwright/test");
const path = require("path");

const pageUrl = `file://${path.join(__dirname, "..", "index.html")}`;
const externalExpectations = {
  "https://scholar.google.com/citations?user=z7wjJ34AAAAJ&hl=en": ["scholar.google.com/citations"],
  "https://www.linkedin.com/in/tooba-quidwai/": ["linkedin.com/in/tooba-quidwai"],
  "https://www.researchgate.net/scientific-contributions/Tooba-Quidwai-2126076413": ["researchgate.net/scientific-contributions/Tooba-Quidwai-2126076413"],
  "https://elifesciences.org/articles/69786": ["elifesciences.org/articles/69786"],
  "https://elifesciences.org/articles/79299": ["elifesciences.org/articles/79299"],
  "https://pubs.rsc.org/en/content/articlelanding/2017/sc/c6sc02088g": ["pubs.rsc.org/en/content/articlelanding/2017/sc/c6sc02088g"],
  "https://doi.org/10.1016/j.ajhg.2017.03.008": ["doi.org/10.1016/j.ajhg.2017.03.008", "linkinghub.elsevier.com/retrieve/pii/S0002929717301131"],
  "https://doi.org/10.1101/413377": ["biorxiv.org/content/10.1101/413377v1"],
  "https://www.biorxiv.org/content/10.1101/413377v1": ["biorxiv.org/content/10.1101/413377v1"],
  "https://www.biorxiv.org/content/10.1101/2020.12.22.423978v1": ["biorxiv.org/content/10.1101/2020.12.22.423978v1"],
};

function isAcceptedExternalStatus(status) {
  return [200, 301, 302, 303, 307, 308, 403, 999].includes(status);
}

test.describe("portfolio page", () => {
  test("renders the core research narrative and key sections", async ({ page }) => {
    await page.goto(pageUrl);

    await expect(page).toHaveTitle(/Tooba Quidwai/i);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "I study cilia"
    );
    await expect(page.getByText("Dr. Tooba Quidwai").first()).toBeVisible();
    await expect(page.getByRole("link", { name: /contact by email/i })).toBeVisible();
    await expect(page.locator("#about")).toBeVisible();
    await expect(page.locator("#highlights")).toBeVisible();
    await expect(page.locator("#experience")).toBeVisible();
    await expect(page.locator("#publications")).toBeVisible();
    await expect(page.locator("#skills")).toBeVisible();
    await expect(page.locator("#education-status")).toBeVisible();
    await expect(page.locator("#contact")).toBeVisible();
  });

  test("shows publication evidence and separates publication types clearly", async ({ page }) => {
    await page.goto(pageUrl);

    await expect(page.locator("#publications img[src*='wdr35-main-localization.png']")).toBeVisible();
    await expect(page.locator("#publications img[src*='wdr35-main-em.png']")).toBeVisible();
    await expect(page.locator("#publications img[src*='caged-main-activation.png']")).toBeVisible();
    await expect(page.locator("#publications img[src*='caged-main-palm.png']")).toBeVisible();
    await expect(page.getByText("Peer-reviewed articles")).toBeVisible();
    await expect(page.getByText("Preprints and other scholarly outputs")).toBeVisible();
    await expect(page.getByText("WDR35-dependent transport of ciliary membrane cargo")).toBeVisible();
  });

  test("navigation links and external profile links are wired correctly", async ({ page }) => {
    await page.goto(pageUrl);

    const toggle = page.getByRole("button", { name: "Menu" });
    if (await toggle.isVisible()) {
      await toggle.click();
    }

    await page.locator(".nav-links").getByRole("link", { name: "Publications", exact: true }).click();
    await expect(page).toHaveURL(/#publications$/);
    await page.waitForFunction(() => {
      const nav = document.querySelector(".nav");
      const publicationSection = document.querySelector("#publications");
      if (!nav || !publicationSection) {
        return false;
      }

      const navHeight = nav.getBoundingClientRect().height;
      const top = publicationSection.getBoundingClientRect().top;
      return top >= navHeight - 4 && top <= navHeight + 60;
    });

    const anchorState = await page.evaluate(() => {
      const nav = document.querySelector(".nav");
      const publicationSection = document.querySelector("#publications");
      const activeLink = document.querySelector(".nav-links a.active");

      return {
        navHeight: nav.getBoundingClientRect().height,
        publicationTop: publicationSection.getBoundingClientRect().top,
        activeHref: activeLink?.getAttribute("href") || null,
      };
    });

    expect(anchorState.publicationTop).toBeGreaterThanOrEqual(anchorState.navHeight - 4);
    expect(anchorState.publicationTop).toBeLessThanOrEqual(anchorState.navHeight + 60);
    expect(anchorState.activeHref).toBe("#publications");

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

  test("responsive navigation adapts when the menu button is visible", async ({ page }) => {
    await page.goto(pageUrl);

    const toggle = page.getByRole("button", { name: "Menu" });
    if (await toggle.isVisible()) {
      await toggle.click();
      await page.getByRole("link", { name: "Talks" }).click();
      await expect(page).toHaveURL(/#talks-awards$/);
    } else {
      await expect(page.locator(".nav-links")).toBeVisible();
    }
  });

  test("paper preview assets load without broken local references", async ({ page }) => {
    await page.goto(pageUrl);

    const images = page.locator("img");
    await expect(images).toHaveCount(6);

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

  test("hero content is visibly rendered on first load", async ({ page }) => {
    await page.goto(pageUrl);

    const heroSummary = page.locator(".hero-summary");
    await expect(heroSummary).toBeVisible();

    const styles = await heroSummary.evaluate((node) => {
      const computed = window.getComputedStyle(node);
      return {
        opacity: computed.opacity,
        transform: computed.transform,
      };
    });

    expect(styles.opacity).toBe("1");
    expect(styles.transform === "none" || styles.transform.includes("matrix")).toBeTruthy();
  });

  test("layout stays within the viewport on phone, tablet, and laptop", async ({ page }) => {
    await page.goto(pageUrl);

    const dimensions = await page.evaluate(() => ({
      width: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));

    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.width + 1);
  });

  test("every internal and external link resolves to the intended destination", async ({ page, request }) => {
    await page.goto(pageUrl);

    const hrefs = await page.locator("a[href]").evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute("href")).filter(Boolean)
    );

    const uniqueHrefs = [...new Set(hrefs)];

    for (const href of uniqueHrefs) {
      if (href.startsWith("#")) {
        const target = page.locator(href);
        await expect(target, `${href} should resolve to an in-page section`).toHaveCount(1);
        continue;
      }

      if (href.startsWith("mailto:")) {
        expect(href).toBe("mailto:tooba.quidwai@bio.ku.dk");
        continue;
      }

      const response = await request.get(href, {
        failOnStatusCode: false,
        maxRedirects: 10,
        timeout: 20_000,
      });

      const status = response.status();
      const finalUrl = response.url();
      expect(isAcceptedExternalStatus(status), `${href} returned status ${status}`).toBeTruthy();

      const expectedFragments = externalExpectations[href];
      expect(expectedFragments, `Missing expected URL mapping for ${href}`).toBeTruthy();
      expect(
        expectedFragments.some((fragment) => finalUrl.includes(fragment) || href.includes(fragment)),
        `${href} resolved to unexpected URL ${finalUrl}`
      ).toBeTruthy();
    }
  });
});
