const { defineConfig, devices } = require("@playwright/test");
const path = require("path");

const pageUrl = `file://${path.join(__dirname, "index.html")}`;

module.exports = defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  use: {
    baseURL: pageUrl,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium-desktop",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
    {
      name: "mobile-chrome",
      use: {
        ...devices["Pixel 5"],
      },
    },
  ],
  reporter: [["list"]],
});
