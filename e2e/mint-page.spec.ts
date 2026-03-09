import { test, expect } from "@playwright/test";

test.describe("Mint Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("[data-testid='hero']", { timeout: 15000 });
  });

  test("should display page title and hero", async ({ page }) => {
    const hero = page.locator("[data-testid='hero']");
    await expect(hero.locator("h1")).toContainText("BONSAI VAULT");
    await expect(hero.locator("h1")).toContainText("#001");
  });

  test("should display all 4 bonsai cards", async ({ page }) => {
    const grid = page.locator("[data-testid='bonsai-grid']");
    await expect(grid.getByText("雅趣")).toBeVisible();
    await expect(grid.getByText("天平")).toBeVisible();
    await expect(grid.getByText("螺旋")).toBeVisible();
    await expect(grid.getByText("Kyoku")).toBeVisible();
  });

  test("should show bonsai valuation method badges", async ({ page }) => {
    const grid = page.locator("[data-testid='bonsai-grid']");
    const allText = await grid.allTextContents();
    const joined = allText.join(" ");
    expect(joined).toContain("Classic Gallery");
    expect(joined).toContain("Exchange Gallery");
    expect(joined).toContain("Secondary Market");
  });

  test("should display correct ETH prices for each bonsai", async ({ page }) => {
    const grid = page.locator("[data-testid='bonsai-grid']");
    await expect(grid.getByText("14 ETH")).toBeVisible();
    await expect(grid.getByText("1.12 ETH")).toBeVisible();
    await expect(grid.getByText("5.678 ETH")).toBeVisible();
    await expect(grid.getByText("20 ETH")).toBeVisible();
  });

  test("should show mint panel with price", async ({ page }) => {
    const panel = page.locator("[data-testid='mint-panel']");
    await expect(panel.getByText("Mint Price")).toBeVisible();
  });

  test("should show vault total value of 40.798", async ({ page }) => {
    await expect(page.getByText("40.798").first()).toBeVisible();
  });

  test("should show max supply of 1000", async ({ page }) => {
    await expect(page.getByText("/ 1000")).toBeVisible();
  });

  test("should display connect wallet prompt when not connected", async ({ page }) => {
    await expect(page.getByText("Connect wallet to mint")).toBeVisible();
  });

  test("should have working quantity increment", async ({ page }) => {
    const panel = page.locator("[data-testid='mint-panel']");
    const plusBtn = panel.locator("button:has-text('+')");

    await plusBtn.click();
    await expect(panel.getByText("0.1000 ETH")).toBeVisible();
  });

  test("should have working quantity decrement", async ({ page }) => {
    const panel = page.locator("[data-testid='mint-panel']");
    const plusBtn = panel.locator("button:has-text('+')");
    const minusBtn = panel.locator("button:has-text('−')");

    await plusBtn.click(); // 2
    await plusBtn.click(); // 3
    await minusBtn.click(); // 2
    await expect(panel.getByText("0.1000 ETH")).toBeVisible();
  });

  test("should display header with BONSAI VAULT branding", async ({ page }) => {
    const header = page.locator("header");
    await expect(header.getByText("BONSAI VAULT")).toBeVisible();
  });

  test("should display vault economics section", async ({ page }) => {
    await expect(page.getByText("Vault Economics")).toBeVisible();
    await expect(page.getByText("Underlying Asset Value")).toBeVisible();
  });

  test("should show revenue distribution info", async ({ page }) => {
    await expect(page.getByText("Rental Revenue")).toBeVisible();
    await expect(page.getByText("Sales Revenue")).toBeVisible();
  });

  test("should display valuation breakdown", async ({ page }) => {
    await expect(page.getByText("Valuation Breakdown")).toBeVisible();
  });

  test("should show important notice", async ({ page }) => {
    await expect(page.getByText("Important Notice")).toBeVisible();
  });

  test("should display footer disclaimer", async ({ page }) => {
    const footer = page.locator("footer");
    await expect(footer.getByText("No yield or dividends are guaranteed")).toBeVisible();
  });

  test("should show bonsai images", async ({ page }) => {
    const grid = page.locator("[data-testid='bonsai-grid']");
    const images = grid.locator("img");
    await expect(images).toHaveCount(4);
  });

  test("should be responsive on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.reload();
    await page.waitForSelector("[data-testid='hero']", { timeout: 15000 });
    const hero = page.locator("[data-testid='hero']");
    await expect(hero.locator("h1")).toContainText("BONSAI VAULT");
  });
});
