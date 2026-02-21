import { test, expect } from "@playwright/test";

// ============================================================================
// LOGIN PAGE (unauthenticated users see this)
// ============================================================================
test.describe("Login Page", () => {
  test("displays login page with Kenlo branding", async ({ page }) => {
    await page.goto("/");

    // Should show the login card
    await expect(page.getByText("Portal de Vendas")).toBeVisible();
    await expect(page.getByText("Entrar com Google")).toBeVisible();
  });

  test("shows allowed email domains", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText("@kenlo.com.br")).toBeVisible();
    await expect(page.getByText("@i-value.com.br")).toBeVisible();
    await expect(page.getByText("@laik.com.br")).toBeVisible();
  });

  test("shows Kenlo logo on login page", async ({ page }) => {
    await page.goto("/");

    // The Kenlo logo should be visible (both in header and login card)
    const logos = page.locator("img[alt*='Kenlo'], svg, [class*='kenlo']");
    await expect(logos.first()).toBeVisible();
  });

  test("redirects all routes to login when unauthenticated", async ({ page }) => {
    // Test that protected routes redirect to login
    const protectedRoutes = [
      "/calculadora",
      "/kombos",
      "/produtos/imob",
      "/produtos/locacao",
      "/historico",
    ];

    for (const route of protectedRoutes) {
      await page.goto(route);
      // Should show login page content (redirected)
      await expect(page.getByText("Portal de Vendas")).toBeVisible({ timeout: 10000 });
    }
  });
});

// ============================================================================
// PUBLIC API ENDPOINTS
// ============================================================================
test.describe("Public API Endpoints", () => {
  test("Pricing Bible PDF endpoint returns valid response", async ({ request }) => {
    // The generateReferencePDF is a public procedure
    const response = await request.post("/api/trpc/pricingAdmin.generateReferencePDF", {
      headers: { "Content-Type": "application/json" },
      data: JSON.stringify({}),
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toBeDefined();

    // tRPC with superjson wraps data in result.data.json
    const result = body.result?.data?.json;
    expect(result).toBeDefined();
    expect(result.pdf).toBeDefined();
    expect(result.pdf.length).toBeGreaterThan(1000); // PDF should be substantial
    expect(result.generatedAt).toBeDefined();
    expect(result.filename).toBeDefined();
  });

  test("Pricing Bible PDF returns consistent cached data on second call", async ({ request }) => {
    // First call
    const response1 = await request.post("/api/trpc/pricingAdmin.generateReferencePDF", {
      headers: { "Content-Type": "application/json" },
      data: JSON.stringify({}),
    });
    const body1 = await response1.json();
    const pdf1 = body1.result?.data?.json?.pdf;

    // Second call (should be cached)
    const response2 = await request.post("/api/trpc/pricingAdmin.generateReferencePDF", {
      headers: { "Content-Type": "application/json" },
      data: JSON.stringify({}),
    });
    const body2 = await response2.json();
    const pdf2 = body2.result?.data?.json?.pdf;

    // Both should return the same PDF (cached)
    expect(pdf1).toBe(pdf2);
    expect(body2.result?.data?.json?.fromCache).toBe(true);
  });

  test("health check - server responds to tRPC", async ({ request }) => {
    // Any tRPC call should get a response (even if error)
    const response = await request.get("/api/trpc/auth.me");
    // Should return 200 or 401, not 500
    expect([200, 401]).toContain(response.status());
  });
});

// ============================================================================
// STATIC ASSETS & META
// ============================================================================
test.describe("Static Assets", () => {
  test("favicon is accessible", async ({ request }) => {
    const response = await request.get("/favicon.ico");
    // Should return 200 or redirect
    expect(response.status()).toBeLessThan(400);
  });

  test("page has proper meta tags", async ({ page }) => {
    await page.goto("/");

    // Check viewport meta tag exists
    const viewport = await page.locator('meta[name="viewport"]').getAttribute("content");
    expect(viewport).toContain("width=device-width");

    // Page title should be set
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });
});

// ============================================================================
// PERFORMANCE
// ============================================================================
test.describe("Performance", () => {
  test("login page loads within 5 seconds", async ({ page }) => {
    const start = Date.now();
    await page.goto("/");
    await expect(page.getByText("Portal de Vendas")).toBeVisible();
    const loadTime = Date.now() - start;

    expect(loadTime).toBeLessThan(5000);
  });

  test("API response time is acceptable", async ({ request }) => {
    const start = Date.now();
    await request.get("/api/trpc/auth.me");
    const responseTime = Date.now() - start;

    // API should respond within 2 seconds
    expect(responseTime).toBeLessThan(2000);
  });
});
