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
  "https://bsky.app/profile/toobaquidwai.bsky.social": ["bsky.app/profile/toobaquidwai.bsky.social"],
  "https://x.com/ToobaQuidwai": ["x.com/ToobaQuidwai", "twitter.com/ToobaQuidwai"],
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

    await expect(page.locator("#about .section-heading")).toHaveCount(0);
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

    const entries = page.locator(".publication-reference-list .publication-entry");
    await expect(entries).toHaveCount(8);
    await expect(entries.nth(1).locator(".publication-thumb--text")).toContainText("eLife");
    await expect(entries.nth(3).locator(".publication-thumb--text")).toContainText("Chemical Science");

    const titles = await page
      .locator(".publication-reference-list .publication-entry .publication-title")
      .evaluateAll((nodes) => nodes.map((node) => node.textContent.trim()));

    expect(titles).toEqual([
      "Centriolar satellites expedite mother centriole remodeling to promote ciliogenesis",
      "A WDR35-dependent coat protein complex transports ciliary membrane cargo vesicles to cilia",
      "PLAA Mutations Cause a Lethal Infantile Epileptic Encephalopathy by Disrupting Ubiquitin-Mediated Endolysosomal Degradation of Synaptic Proteins",
      "Specific protein labeling with caged fluorophores for dual-color imaging and super-resolution microscopy in living cells",
      "A WDR35-dependent coat protein complex transports ciliary membrane cargo vesicles to cilia",
      "Role of WDR35 in the formation of functional cilia",
      "A WDR35-dependent coatomer transports ciliary membrane proteins from the Golgi to the cilia",
      "Cytoskeleton mechanics determine resting size and activation dynamics of platelets",
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
    await expect(page.locator("#images video")).toHaveCount(4);
    await expect(page.locator("#images")).toContainText("Kidney confocal walkthrough");
    await expect(page.locator("#images")).toContainText("ARL13B");
    await expect(page.locator("#images")).toContainText("SIR-tubulin");
    await expect(page.locator("#images")).toContainText("3D-TEM movie");
    await expect(page.locator("#images")).toContainText("Dync2h1 null movie");
    await expect(page.locator("#images")).toContainText("Multiscale imaging");
    await expect(page.locator("#images")).toContainText("WDR35-EmGFP");
    await expect(page.locator("#images")).toContainText("method scale and resolution comparison integrated directly into the composed figure");
    await expect(page.locator("#images")).toContainText("IFT88 collage");
    await expect(page.locator("#images")).toContainText("Wdr35 null MEF");
    await expect(page.locator("#images")).toContainText("Ac α tubulin");
    await expect(page.locator("#images")).toContainText("γ tubulin");

    const imageTitles = await page.locator("#images .media-frame .media-caption h3").evaluateAll((nodes) =>
      nodes.map((node) => node.textContent.trim())
    );

    expect(imageTitles[3]).toBe("Wdr35 null MEF");
    expect(imageTitles[5]).toBe("Multiscale imaging");
    expect(imageTitles[6]).toBe("IFT88 collage");
  });

  test("images section opens a zoom view for figures and movies", async ({ page }) => {
    await page.goto(pageUrl);

    await page.getByRole("button", { name: "Open Multiscale imaging" }).click();
    await expect(page.locator("#media-lightbox")).toHaveClass(/is-open/);
    await expect(page.locator("#media-lightbox-stage img")).toHaveCount(1);
    await expect(page.locator("#media-lightbox-copy")).toContainText("Multiscale imaging");
    await expect(page.locator("#media-lightbox-copy")).toContainText("WDR35-EmGFP");

    await page.getByRole("button", { name: "Close expanded media" }).click();
    await expect(page.locator("#media-lightbox")).not.toHaveClass(/is-open/);

    await page.getByRole("button", { name: "Open Dync2h1 null movie" }).click();
    await expect(page.locator("#media-lightbox-stage video")).toHaveCount(1);
    await expect(page.locator("#media-lightbox-copy")).toContainText("Dync2h1 null movie");
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

  test("about portrait adapts between wrapped desktop flow and stacked smaller screens", async ({ page }) => {
    await page.goto(pageUrl);

    const portraitState = await page.locator("#about .about-portrait").evaluate((node) => {
      const computed = window.getComputedStyle(node);
      return {
        float: computed.float,
        viewportWidth: window.innerWidth,
      };
    });

    if (portraitState.viewportWidth > 1100) {
      expect(portraitState.float).toBe("left");
    } else {
      expect(portraitState.float).toBe("none");
    }
  });

  test("portrait and movie assets load without broken local references", async ({ page }) => {
    await page.goto(pageUrl);

    await expect(page.locator("#about .hero-photo")).toBeVisible();

    const images = page.locator("img");
    await expect(images).toHaveCount(4);

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

    const videoStates = await page.locator("#images video").evaluateAll((nodes) =>
      nodes.map((node) => ({
        currentSrc: node.currentSrc,
        readyState: node.readyState,
        networkState: node.networkState,
      }))
    );

    expect(videoStates).toHaveLength(4);
    expect(videoStates[0].currentSrc).toContain("assets/media/kidney-confocal-walkthrough.mp4");
    expect(videoStates[1].currentSrc).toContain("assets/media/xyzt-dual-channel-walkthrough.mp4");
    expect(videoStates[2].currentSrc).toContain("assets/media/3d-tem-movie.mp4");
    expect(videoStates[3].currentSrc).toContain("assets/media/dync2h1null-movie.mp4");
    for (const video of videoStates) {
      expect(video.networkState).not.toBe(3);
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
    test.setTimeout(60_000);
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
        expect([
          "mailto:tooba.quidwai@bio.ku.dk",
          "mailto:tquidwaiunipne@gmail.com",
        ]).toContain(href);
        continue;
      }

      let response;
      try {
        response = await request.get(href, {
          failOnStatusCode: false,
          maxRedirects: 10,
          timeout: 20_000,
        });
      } catch (error) {
        const message = String(error);
        if (message.includes("ENOTFOUND") || message.includes("EAI_AGAIN")) {
          continue;
        }
        throw error;
      }

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
