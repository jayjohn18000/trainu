# Playwright Testing Starter

## Overview

This document provides a minimal Playwright configuration and test structure for the TrainU Next.js App Router application, aligned with the routes identified in the migration audit.

## Installation

```bash
# Install Playwright
pnpm add -D @playwright/test

# Install browsers
npx playwright install
```

## Configuration

Create `playwright.config.ts` in the project root:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

## Test Structure

```
tests/
├── auth/
│   ├── login.spec.ts
│   └── registration.spec.ts
├── public/
│   ├── landing.spec.ts
│   ├── directory.spec.ts
│   ├── discover.spec.ts
│   └── trainer-profile.spec.ts
├── dashboard/
│   ├── client-dashboard.spec.ts
│   ├── trainer-dashboard.spec.ts
│   ├── calendar.spec.ts
│   ├── clients.spec.ts
│   ├── messages.spec.ts
│   └── settings.spec.ts
├── booking/
│   └── booking-flow.spec.ts
├── fixtures/
│   ├── auth.json
│   └── test-data.json
└── utils/
    ├── auth-helpers.ts
    └── test-helpers.ts
```

## Core Test Files

### Public Routes Tests

#### `tests/public/landing.spec.ts`
```typescript
import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('should display hero section', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /TrainU/ })).toBeVisible();
  });

  test('should navigate to directory', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /Find Trainers/ }).click();
    await expect(page).toHaveURL('/directory');
  });
});
```

#### `tests/public/directory.spec.ts`
```typescript
import { test, expect } from '@playwright/test';

test.describe('Trainer Directory', () => {
  test('should display trainer cards', async ({ page }) => {
    await page.goto('/directory');
    await expect(page.getByTestId('trainer-card')).toHaveCount.greaterThan(0);
  });

  test('should filter trainers by specialty', async ({ page }) => {
    await page.goto('/directory');
    await page.getByRole('combobox').selectOption('Strength Training');
    await expect(page.getByTestId('trainer-card')).toHaveCount.greaterThan(0);
  });

  test('should navigate to trainer profile', async ({ page }) => {
    await page.goto('/directory');
    await page.getByTestId('trainer-card').first().click();
    await expect(page).toHaveURL(/\/trainers\/.+/);
  });
});
```

### Dashboard Tests

#### `tests/dashboard/client-dashboard.spec.ts`
```typescript
import { test, expect } from '@playwright/test';
import { loginAsClient } from '../utils/auth-helpers';

test.describe('Client Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsClient(page);
    await page.goto('/dashboard/client');
  });

  test('should display progress metrics', async ({ page }) => {
    await expect(page.getByTestId('progress-metric')).toBeVisible();
  });

  test('should show next session', async ({ page }) => {
    await expect(page.getByTestId('next-session')).toBeVisible();
  });
});
```

### Booking Flow Tests

#### `tests/booking/booking-flow.spec.ts`
```typescript
import { test, expect } from '@playwright/test';

test.describe('Booking Flow', () => {
  test('should complete booking process', async ({ page }) => {
    await page.goto('/trainers/sarah-chen');
    
    // Click book session
    await page.getByRole('button', { name: /Book Session/ }).click();
    
    // Select session type
    await page.getByTestId('session-type-card').first().click();
    await page.getByRole('button', { name: /Next/ }).click();
    
    // Select date and time
    await page.getByTestId('calendar-date').click();
    await page.getByTestId('time-slot').first().click();
    await page.getByRole('button', { name: /Next/ }).click();
    
    // Review and confirm
    await expect(page.getByTestId('booking-summary')).toBeVisible();
    await page.getByRole('button', { name: /Confirm Booking/ }).click();
    
    // Success page
    await expect(page.getByTestId('booking-success')).toBeVisible();
  });
});
```

## Test Utilities

### `tests/utils/auth-helpers.ts`
```typescript
import { Page } from '@playwright/test';

export async function loginAsClient(page: Page) {
  await page.goto('/login');
  await page.fill('[data-testid="email"]', 'client@test.com');
  await page.fill('[data-testid="password"]', 'password123');
  await page.click('[data-testid="login-button"]');
  await page.waitForURL('/dashboard/client');
}

export async function loginAsTrainer(page: Page) {
  await page.goto('/login');
  await page.fill('[data-testid="email"]', 'trainer@test.com');
  await page.fill('[data-testid="password"]', 'password123');
  await page.click('[data-testid="login-button"]');
  await page.waitForURL('/dashboard/trainer');
}
```

### `tests/utils/test-helpers.ts`
```typescript
import { Page } from '@playwright/test';

export async function waitForApiResponse(page: Page, url: string) {
  return page.waitForResponse(response => 
    response.url().includes(url) && response.status() === 200
  );
}

export async function mockApiResponse(page: Page, url: string, data: any) {
  await page.route(url, route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(data),
    });
  });
}
```

## Test Data Fixtures

### `tests/fixtures/test-data.json`
```json
{
  "trainers": [
    {
      "id": "t1",
      "slug": "sarah-chen",
      "name": "Sarah Chen",
      "specialties": ["Strength Training", "Olympic Lifting"],
      "rating": 4.9,
      "clients": 24
    }
  ],
  "sessions": [
    {
      "id": "s1",
      "trainerId": "t1",
      "title": "Personal Training",
      "duration": 60,
      "price": 80
    }
  ]
}
```

## Running Tests

```bash
# Run all tests
npx playwright test

# Run specific test file
npx playwright test tests/public/landing.spec.ts

# Run tests in headed mode
npx playwright test --headed

# Run tests with debug mode
npx playwright test --debug

# Generate test report
npx playwright show-report
```

## CI/CD Integration

### GitHub Actions
```yaml
name: Playwright Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: 18
    - name: Install dependencies
      run: pnpm install
    - name: Install Playwright browsers
      run: npx playwright install --with-deps
    - name: Run Playwright tests
      run: npx playwright test
    - uses: actions/upload-artifact@v3
      if: always()
      with:
        name: playwright-report
        path: playwright-report/
        retention-days: 30
```

## Test Coverage Areas

### Critical User Flows
- [ ] User registration and authentication
- [ ] Trainer discovery and booking
- [ ] Dashboard navigation and data display
- [ ] Calendar management
- [ ] Client communication
- [ ] Settings and profile management

### Edge Cases
- [ ] Network failures and retries
- [ ] Form validation errors
- [ ] Authentication token expiration
- [ ] Mobile responsiveness
- [ ] Accessibility compliance

### Performance
- [ ] Page load times
- [ ] API response times
- [ ] Large data set handling
- [ ] Memory usage

## Best Practices

1. **Use data-testid attributes** for reliable element selection
2. **Mock external APIs** for consistent test results
3. **Test both happy path and error scenarios**
4. **Use page object model** for complex interactions
5. **Keep tests independent** and parallelizable
6. **Use fixtures** for test data management
7. **Add visual regression tests** for UI components
