/**
 * Route Crawler Test
 * 
 * Crawls all discovered routes and checks for:
 * - 404 errors
 * - 500 errors
 * - JavaScript console errors
 * - Basic rendering
 * 
 * Outputs a detailed report to tmp/crawl-report.json
 */

import { test, expect } from "@playwright/test";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";

interface RouteListItem {
  path: string;
  url: string;
  file: string;
  isDynamic: boolean;
  requiresAuth?: boolean;
  testVariants?: string[];
}

interface RouteList {
  baseUrl: string;
  basePath: string;
  generatedAt: string;
  routes: RouteListItem[];
}

interface CrawlResult {
  url: string;
  path: string;
  status: number | null;
  success: boolean;
  errors: string[];
  consoleErrors: Array<{ type: string; text: string }>;
  screenshot?: string;
  timestamp: string;
}

const ROUTE_LIST_PATH = join(__dirname, "../tmp/route-list.json");
const REPORT_PATH = join(__dirname, "../tmp/crawl-report.json");
const SCREENSHOT_DIR = join(__dirname, "../tmp/screenshots");

// Ensure directories exist
try {
  mkdirSync(join(__dirname, "../tmp"), { recursive: true });
  mkdirSync(SCREENSHOT_DIR, { recursive: true });
} catch (error) {
  // Directories already exist
}

// Load route list
let routeList: RouteList;
try {
  routeList = JSON.parse(readFileSync(ROUTE_LIST_PATH, "utf-8"));
} catch (error) {
  throw new Error(
    `Failed to load route list. Run 'npm run audit:routes' first.\n${error}`
  );
}

// Generate list of URLs to test
const urlsToTest: Array<{ url: string; path: string; isDynamic: boolean; requiresAuth?: boolean }> = [];

routeList.routes.forEach((route) => {
  if (route.isDynamic && route.testVariants) {
    // Test all variants of dynamic routes
    route.testVariants.forEach((variantUrl) => {
      urlsToTest.push({
        url: variantUrl,
        path: route.path,
        isDynamic: true,
        requiresAuth: route.requiresAuth,
      });
    });
  } else {
    // Test static routes
    urlsToTest.push({
      url: route.url,
      path: route.path,
      isDynamic: false,
      requiresAuth: route.requiresAuth,
    });
  }
});

console.log(`\n🕷️  Crawling ${urlsToTest.length} URLs...\n`);

const results: CrawlResult[] = [];

test.describe("Route Crawler", () => {
  test.beforeAll(() => {
    console.log(`Base URL: ${routeList.baseUrl}`);
    console.log(`Routes found: ${routeList.routes.length}`);
    console.log(`URLs to test: ${urlsToTest.length}\n`);
  });

  for (const { url, path, isDynamic, requiresAuth } of urlsToTest) {
    test(`should load ${path} (${url})`, async ({ page }) => {
      const result: CrawlResult = {
        url,
        path,
        status: null,
        success: false,
        errors: [],
        consoleErrors: [],
        timestamp: new Date().toISOString(),
      };

      // Capture console errors
      page.on("console", (msg) => {
        if (msg.type() === "error") {
          result.consoleErrors.push({
            type: msg.type(),
            text: msg.text(),
          });
        }
      });

      // Capture page errors
      page.on("pageerror", (error) => {
        result.errors.push(`Page error: ${error.message}`);
      });

      try {
        const response = await page.goto(url, {
          waitUntil: "networkidle",
          timeout: 10000,
        });

        result.status = response?.status() || null;

        // Check for critical HTTP errors
        if (result.status === 404) {
          result.errors.push("404 Not Found");
          result.success = false;
        } else if (result.status && result.status >= 500) {
          result.errors.push(`${result.status} Server Error`);
          result.success = false;
        } else if (requiresAuth && result.status === 200) {
          // Auth routes should either redirect or show auth UI
          // For now, we'll accept 200 since we don't have auth implemented
          result.success = true;
        } else if (result.status === 200) {
          result.success = true;
        } else {
          result.errors.push(`Unexpected status: ${result.status}`);
          result.success = false;
        }

        // Take screenshot
        const screenshotName = `${path.replace(/\//g, "_") || "root"}.png`;
        const screenshotPath = join(SCREENSHOT_DIR, screenshotName);
        await page.screenshot({ path: screenshotPath, fullPage: false });
        result.screenshot = screenshotPath;

        // Log progress
        const statusIcon = result.success ? "✅" : "❌";
        console.log(`${statusIcon} ${result.status} ${path}`);

        if (result.errors.length > 0) {
          result.errors.forEach((err) => console.log(`  └─ Error: ${err}`));
        }

        // Assert success
        expect(result.success, `Route ${path} should load successfully`).toBe(true);
        expect(result.status).toBe(200);
      } catch (error: any) {
        result.errors.push(`Navigation failed: ${error.message}`);
        result.success = false;

        console.log(`❌ FAIL ${path}`);
        console.log(`  └─ ${error.message}`);

        throw error;
      } finally {
        results.push(result);
      }
    });
  }

  test.afterAll(() => {
    // Write report
    const report = {
      generatedAt: new Date().toISOString(),
      baseUrl: routeList.baseUrl,
      totalRoutes: urlsToTest.length,
      successCount: results.filter((r) => r.success).length,
      failureCount: results.filter((r) => !r.success).length,
      results,
    };

    writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
    console.log(`\n📊 Crawl report written to: ${REPORT_PATH}`);
    console.log(`✅ Success: ${report.successCount}`);
    console.log(`❌ Failures: ${report.failureCount}`);
  });
});

