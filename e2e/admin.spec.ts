import { test, expect } from "@playwright/test";

test.describe("Admin Pages", () => {
  test.describe("Guard — Not Connected", () => {
    const adminRoutes = [
      { path: "/admin", label: "Dashboard" },
      { path: "/admin/bonsai", label: "Bonsai" },
      { path: "/admin/vaults", label: "Vaults" },
      { path: "/admin/buyback", label: "Buyback & Burn" },
    ];

    for (const route of adminRoutes) {
      test(`${route.label} page shows connect wallet prompt`, async ({ page }) => {
        await page.goto(route.path);
        const guard = page.locator("[data-testid='admin-guard-connect']");
        await expect(guard).toBeVisible({ timeout: 15000 });
        await expect(guard.getByText("Connect Wallet")).toBeVisible();
        await expect(guard.getByText("Connect the owner wallet")).toBeVisible();
      });
    }

    for (const route of adminRoutes) {
      test(`${route.label} page returns 200`, async ({ page }) => {
        const response = await page.goto(route.path);
        expect(response?.status()).toBe(200);
      });
    }
  });

  test.describe("Admin Navigation", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/admin");
      await page.waitForSelector("[data-testid='admin-nav']", { timeout: 15000 });
    });

    test("should display all navigation tabs", async ({ page }) => {
      const nav = page.locator("[data-testid='admin-nav']");
      await expect(nav.getByText("Dashboard")).toBeVisible();
      await expect(nav.getByText("Bonsai")).toBeVisible();
      await expect(nav.getByText("Vaults")).toBeVisible();
      await expect(nav.getByText("Buyback & Burn")).toBeVisible();
    });

    test("Dashboard tab should be active on /admin", async ({ page }) => {
      const nav = page.locator("[data-testid='admin-nav']");
      const dashboardLink = nav.locator("a", { hasText: "Dashboard" });
      await expect(dashboardLink).toHaveClass(/border-vault-accent/);
    });

    test("should navigate to Bonsai page", async ({ page }) => {
      const nav = page.locator("[data-testid='admin-nav']");
      await nav.getByText("Bonsai").click();
      await expect(page).toHaveURL(/\/admin\/bonsai/);
    });

    test("should navigate to Vaults page", async ({ page }) => {
      const nav = page.locator("[data-testid='admin-nav']");
      await nav.getByText("Vaults").click();
      await expect(page).toHaveURL(/\/admin\/vaults/);
    });

    test("should navigate to Buyback page", async ({ page }) => {
      const nav = page.locator("[data-testid='admin-nav']");
      await nav.getByText("Buyback & Burn").click();
      await expect(page).toHaveURL(/\/admin\/buyback/);
    });

    test("should have Back to Mint link", async ({ page }) => {
      const nav = page.locator("[data-testid='admin-nav']");
      const backLink = nav.getByText("Back to Mint");
      await expect(backLink).toBeVisible();
    });

    test("Back to Mint navigates to home", async ({ page }) => {
      const nav = page.locator("[data-testid='admin-nav']");
      await nav.getByText("Back to Mint").click();
      await expect(page).toHaveURL("/");
    });

    test("Bonsai tab is active on /admin/bonsai", async ({ page }) => {
      await page.goto("/admin/bonsai");
      await page.waitForSelector("[data-testid='admin-nav']", { timeout: 15000 });
      const nav = page.locator("[data-testid='admin-nav']");
      const bonsaiLink = nav.locator("a", { hasText: "Bonsai" });
      await expect(bonsaiLink).toHaveClass(/border-vault-accent/);
    });

    test("Vaults tab is active on /admin/vaults", async ({ page }) => {
      await page.goto("/admin/vaults");
      await page.waitForSelector("[data-testid='admin-nav']", { timeout: 15000 });
      const nav = page.locator("[data-testid='admin-nav']");
      const vaultsLink = nav.locator("a", { hasText: "Vaults" });
      await expect(vaultsLink).toHaveClass(/border-vault-accent/);
    });

    test("Buyback tab is active on /admin/buyback", async ({ page }) => {
      await page.goto("/admin/buyback");
      await page.waitForSelector("[data-testid='admin-nav']", { timeout: 15000 });
      const nav = page.locator("[data-testid='admin-nav']");
      const burnLink = nav.locator("a", { hasText: "Buyback & Burn" });
      await expect(burnLink).toHaveClass(/border-vault-accent/);
    });
  });

  test.describe("Admin Layout", () => {
    test("should have admin layout wrapper", async ({ page }) => {
      await page.goto("/admin");
      await expect(page.locator("[data-testid='admin-layout']")).toBeVisible({ timeout: 15000 });
    });

    test("should display site header on admin pages", async ({ page }) => {
      await page.goto("/admin");
      const header = page.locator("header");
      await expect(header.getByText("BONSAI VAULT")).toBeVisible({ timeout: 15000 });
    });

    test("guard and nav coexist — nav visible even when guard blocks", async ({ page }) => {
      await page.goto("/admin");
      await page.waitForSelector("[data-testid='admin-nav']", { timeout: 15000 });
      // Nav should be visible
      await expect(page.locator("[data-testid='admin-nav']")).toBeVisible();
      // Guard should also be visible
      await expect(page.locator("[data-testid='admin-guard-connect']")).toBeVisible();
    });
  });

  test.describe("Page Title", () => {
    test("admin pages have correct title", async ({ page }) => {
      await page.goto("/admin");
      await expect(page).toHaveTitle(/Admin.*BONSAI VAULT/);
    });
  });
});
