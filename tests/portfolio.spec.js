const { test, expect } = require("@playwright/test");
const path = require("path");

const pageUrl = `file://${path.join(__dirname, "..", "index.html")}`;
const externalExpectations = {
  "https://beta.unipune.ac.in/dept/science/Biotechnology/default.htm": ["unipune.ac.in/dept/science/Biotechnology/default.htm"],
  "https://www.nccs.res.in": ["nccs.res.in"],
  "https://cdri.res.in/#gsc.tab=0": ["cdri.res.in"],
  "https://www.nii.res.in": ["nii.res.in"],
  "https://www.mpi-dortmund.mpg.de/en": ["mpi-dortmund.mpg.de/en"],
  "https://www.embl.org/sites/heidelberg/": ["embl.org/sites/heidelberg"],
  "https://www.maxperutzlabs.ac.at/research/research-groups/ries": ["maxperutzlabs.ac.at/research/research-groups/ries"],
  "https://esric.org": ["esric.org"],
  "https://institute-genetics-cancer.ed.ac.uk/research/funded-centres/mrc-human-genetics-unit": ["institute-genetics-cancer.ed.ac.uk/research/funded-centres/mrc-human-genetics-unit"],
  "https://scholar.google.com/citations?user=z7wjJ34AAAAJ&hl=en": ["scholar.google.com/citations"],
  "https://www.linkedin.com/in/tooba-quidwai/": ["linkedin.com/in/tooba-quidwai"],
  "https://www.cilialab.co.uk": ["cilialab.co.uk"],
  "https://humantechnopole.it/en/people/gaia-pigino/": ["humantechnopole.it/en/people/gaia-pigino"],
  "https://www.mpi-cbg.de": ["mpi-cbg.de"],
  "https://mbg.au.dk/en/research/research-areas/protein-science/esben-lorentzen": ["mbg.au.dk/en/research/research-areas/protein-science/esben-lorentzen"],
  "https://www1.bio.ku.dk/english/staff/?pure=en/persons/293381": ["bio.ku.dk/english/staff/"],
  "https://elifesciences.org/articles/69786": ["elifesciences.org/articles/69786"],
  "https://elifesciences.org/articles/79299": ["elifesciences.org/articles/79299"],
  "https://pubs.rsc.org/en/content/articlelanding/2017/sc/c6sc02088g": ["pubs.rsc.org/en/content/articlelanding/2017/sc/c6sc02088g"],
  "https://doi.org/10.1016/j.ajhg.2017.03.008": [
    "doi.org/10.1016/j.ajhg.2017.03.008",
    "linkinghub.elsevier.com/retrieve/pii/S0002929717301131",
  ],
  "https://www.biorxiv.org/content/10.1101/413377v1": ["biorxiv.org/content/10.1101/413377v1"],
  "https://www.biorxiv.org/content/10.1101/2020.12.22.423978v1": ["biorxiv.org/content/10.1101/2020.12.22.423978v1"],
};

function isAcceptedExternalStatus(status) {
  return [200, 301, 302, 303, 307, 308, 403, 999].includes(status);
}

test.describe("portfolio page", () => {
  test("renders the requested navigation and section structure", async ({ page }) => {
    await page.goto(pageUrl);

    await expect(page).toHaveTitle(/Tooba Quidwai/i);
    await expect(page.locator(".brand")).toContainText("Dr. Tooba Quidwai");
    await expect(page.locator(".brand")).toContainText("Advanced Imaging | Cilia Biology | Disease Mechanisms");

    const expectedNavOrder = [
      "About",
      "Appointments",
      "Publications",
      "Talks",
      "Methods",
      "Images",
      "Contact",
    ];

    const navLinks = page.locator(".nav-links a");
    await expect(navLinks).toHaveCount(expectedNavOrder.length);

    const navText = await navLinks.evaluateAll((nodes) => nodes.map((node) => node.textContent.trim()));
    expect(navText).toEqual(expectedNavOrder);

    for (const sectionId of ["#about", "#experience", "#publications", "#talks", "#skills", "#images", "#contact"]) {
      await expect(page.locator(sectionId)).toHaveCount(1);
    }
  });

  test("about and appointments sections reflect the new academic information architecture", async ({ page }) => {
    await page.goto(pageUrl);

    await expect(page.locator("#about")).toContainText("Dr. Tooba Quidwai");
    await expect(page.locator("#about .section-heading p")).toHaveCount(0);
    await expect(page.locator("#about")).toContainText("National Centre for Cell Science");
    await expect(page.locator("#about")).toContainText("WDR35/IFT121");
    await expect(page.locator("#about .about-portrait img")).toBeVisible();
    await expect(page.locator("#about .about-copy p")).toHaveCount(8);
    await expect(page.locator("#about a[href^='https://']")).toHaveCount(16);

    await expect(page.locator("#experience .journey-step")).toHaveCount(5);
    await expect(page.locator("#experience")).toContainText("India");
    await expect(page.locator("#experience")).toContainText("Germany");
    await expect(page.locator("#experience")).toContainText("United Kingdom");
    await expect(page.locator("#experience")).toContainText("United States");
    await expect(page.locator("#experience")).toContainText("Awards & fellowships");
  });

  test("publications remain newest first and keep paper figures with the matching featured paper", async ({ page }) => {
    await page.goto(pageUrl);

    const publicationLeads = page.locator(".publication-lead");
    await expect(publicationLeads).toHaveCount(2);
    await expect(publicationLeads.nth(0)).toContainText("WDR35-dependent transport of ciliary membrane cargo");
    await expect(publicationLeads.nth(0).locator("img[src*='wdr35-main-localization.png']")).toBeVisible();
    await expect(publicationLeads.nth(0).locator("img[src*='wdr35-main-em.png']")).toBeVisible();
    await expect(publicationLeads.nth(1)).toContainText("Caged fluorophores");
    await expect(publicationLeads.nth(1).locator("img[src*='caged-main-activation.png']")).toBeVisible();
    await expect(publicationLeads.nth(1).locator("img[src*='caged-main-palm.png']")).toBeVisible();

    const peerReviewedTitles = await page
      .locator(".publication-list .publication-item .publication-title")
      .evaluateAll((nodes) => nodes.slice(0, 4).map((node) => node.textContent.trim()));

    expect(peerReviewedTitles).toEqual([
      "Centriolar satellites expedite mother centriole remodeling to promote ciliogenesis",
      "A WDR35-dependent coat protein complex transports ciliary membrane cargo vesicles to cilia",
      "PLAA Mutations Cause a Lethal Infantile Epileptic Encephalopathy by Disrupting Ubiquitin-Mediated Endolysosomal Degradation of Synaptic Proteins",
      "Specific protein labeling with caged fluorophores for dual-color imaging and super-resolution microscopy in living cells",
    ]);
  });

  test("talks remain newest first and methods/images sections are populated", async ({ page }) => {
    await page.goto(pageUrl);

    const talks = await page.locator("#talks .stack-column").nth(0).locator("li").evaluateAll((nodes) =>
      nodes.map((node) => node.textContent.trim())
    );

    expect(talks[0]).toContain("July 31, 2025");
    expect(talks[1]).toContain("July 30, 2025");
    expect(talks[talks.length - 1]).toContain("2020");

    await expect(page.locator("#skills")).toContainText("FLIM");
    await expect(page.locator("#skills")).toContainText("Plasmodium falciparum culture");
    await expect(page.locator("#skills")).toContainText("BioRender");
    await expect(page.locator("#images .figure-card")).toHaveCount(4);
  });

  test("navigation anchors land at the right sections and stay in sync", async ({ page }) => {
    await page.goto(pageUrl);

    const toggle = page.getByRole("button", { name: "Menu" });
    if (await toggle.isVisible()) {
      await toggle.click();
    }

    await page.locator(".nav-links").getByRole("link", { name: "Images", exact: true }).click();
    await expect(page).toHaveURL(/#images$/);

    await page.waitForFunction(() => {
      const nav = document.querySelector(".nav");
      const target = document.querySelector("#images");
      if (!nav || !target) {
        return false;
      }

      const navHeight = nav.getBoundingClientRect().height;
      const top = target.getBoundingClientRect().top;
      return top >= navHeight - 4 && top <= navHeight + 60;
    });

    const anchorState = await page.evaluate(() => {
      const nav = document.querySelector(".nav");
      const target = document.querySelector("#images");
      const activeLink = document.querySelector(".nav-links a.active");

      return {
        navHeight: nav.getBoundingClientRect().height,
        targetTop: target.getBoundingClientRect().top,
        activeHref: activeLink?.getAttribute("href") || null,
      };
    });

    expect(anchorState.targetTop).toBeGreaterThanOrEqual(anchorState.navHeight - 4);
    expect(anchorState.targetTop).toBeLessThanOrEqual(anchorState.navHeight + 60);
    expect(anchorState.activeHref).toBe("#images");
  });

  test("desktop header keeps navigation tabs on a single line", async ({ page }) => {
    await page.goto(pageUrl);

    const navMetrics = await page.locator(".nav-links").evaluate((node) => ({
      clientHeight: node.clientHeight,
      scrollHeight: node.scrollHeight,
    }));

    expect(navMetrics.scrollHeight).toBeLessThanOrEqual(navMetrics.clientHeight + 1);
  });

  test("portrait and figure assets load without broken local references", async ({ page }) => {
    await page.goto(pageUrl);

    await expect(page.locator("#about .hero-photo")).toBeVisible();

    const images = page.locator("img");
    await expect(images).toHaveCount(9);

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
        await expect(page.locator(href), `${href} should resolve to an in-page section`).toHaveCount(1);
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
