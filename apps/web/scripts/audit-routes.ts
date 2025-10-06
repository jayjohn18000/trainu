#!/usr/bin/env tsx

/**
 * Route Auditor
 * 
 * Scans the Next.js App Router file system and generates a list of all routes.
 * Outputs to tmp/route-list.json for use by the crawler.
 */

import { readdirSync, statSync, writeFileSync, mkdirSync } from "fs";
import { join, relative } from "path";

interface RouteInfo {
  path: string;
  file: string;
  isDynamic: boolean;
  requiresAuth?: boolean;
  testVariants?: string[];
}

const APP_DIR = join(__dirname, "../app");
const OUTPUT_FILE = join(__dirname, "../tmp/route-list.json");
const BASE_PATH = ""; // No basePath in next.config
const BASE_URL = process.env.APP_URL || "http://localhost:3000";

function scanDirectory(dir: string, basePath: string = ""): RouteInfo[] {
  const routes: RouteInfo[] = [];

  try {
    const entries = readdirSync(dir);

    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);

      // Skip node_modules, hidden files, and component files
      if (
        entry.startsWith(".") ||
        entry === "node_modules" ||
        entry === "api" || // Skip API routes
        entry.endsWith(".tsx") && !entry.startsWith("page") // Skip non-page components
      ) {
        continue;
      }

      if (stat.isDirectory()) {
        // Handle route groups (auth), (public) - they don't affect URL paths
        if (entry.startsWith("(") && entry.endsWith(")")) {
          routes.push(...scanDirectory(fullPath, basePath));
        } else if (entry.startsWith("[") && entry.endsWith("]")) {
          // Dynamic segment
          const segmentName = entry.slice(1, -1);
          const isCatchAll = segmentName.startsWith("...");
          const newBasePath = `${basePath}/${isCatchAll ? segmentName.slice(3) : segmentName}`;
          routes.push(...scanDirectory(fullPath, newBasePath));
        } else {
          // Regular segment
          routes.push(...scanDirectory(fullPath, `${basePath}/${entry}`));
        }
      } else if (entry === "page.tsx" || entry === "page.ts") {
        // Found a route!
        const routePath = basePath || "/";
        const isDynamic = routePath.includes("[");
        const requiresAuth = fullPath.includes("/dashboard") || fullPath.includes("(auth)");

        const route: RouteInfo = {
          path: routePath,
          file: relative(APP_DIR, fullPath),
          isDynamic,
          requiresAuth,
        };

        // For dynamic routes, generate test variants
        if (isDynamic) {
          route.testVariants = generateTestVariants(routePath);
        }

        routes.push(route);
      }
    }
  } catch (error) {
    console.error(`Error scanning ${dir}:`, error);
  }

  return routes;
}

function generateTestVariants(path: string): string[] {
  // Replace dynamic segments with test values
  return [
    path.replace(/\[([^\]]+)\]/g, "test-$1"),
    path.replace(/\[slug\]/g, "sarah-johnson"), // Trainer slug example
    path.replace(/\[id\]/g, "123"),
  ].filter((v, i, a) => a.indexOf(v) === i); // Remove duplicates
}

function main() {
  console.log("🔍 Scanning App Router for routes...\n");

  const routes = scanDirectory(APP_DIR);

  // Sort routes by path
  routes.sort((a, b) => a.path.localeCompare(b.path));

  console.log(`✅ Found ${routes.length} routes:\n`);
  routes.forEach((route) => {
    const marker = route.isDynamic ? "🔀" : route.requiresAuth ? "🔒" : "🌐";
    console.log(`${marker} ${route.path}`);
    if (route.testVariants) {
      route.testVariants.forEach((v) => console.log(`  └─ Test: ${v}`));
    }
  });

  // Ensure tmp directory exists
  try {
    mkdirSync(join(__dirname, "../tmp"), { recursive: true });
  } catch (error) {
    // Directory already exists
  }

  // Write output
  const output = {
    baseUrl: BASE_URL,
    basePath: BASE_PATH,
    generatedAt: new Date().toISOString(),
    routes: routes.map((r) => ({
      path: r.path,
      url: `${BASE_URL}${BASE_PATH}${r.path}`,
      file: r.file,
      isDynamic: r.isDynamic,
      requiresAuth: r.requiresAuth,
      testVariants: r.testVariants?.map((v) => `${BASE_URL}${BASE_PATH}${v}`),
    })),
  };

  writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
  console.log(`\n📝 Route list written to: ${OUTPUT_FILE}`);
}

main();

