import { test, expect } from '@playwright/test';

const TEST_EMAIL = `test-${Date.now()}@example.com`;
const TEST_PASSWORD = 'TestPassword123!';

test.describe('Authentication', () => {
  test('anonymous user redirected from dashboard to sign-in', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should redirect to sign-in with redirect parameter
    await expect(page).toHaveURL(/\/sign-in/);
    await expect(page.url()).toContain('redirect=%2Fdashboard');
    
    // Should show sign-in form
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
  });

  test('sign-up flow creates new account', async ({ page }) => {
    await page.goto('/sign-up');
    
    // Fill in sign-up form
    await page.getByLabel(/email/i).fill(TEST_EMAIL);
    await page.getByRole('combobox', { name: /i am a/i }).click();
    await page.getByRole('option', { name: /client/i }).click();
    await page.getByLabel(/^password$/i).fill(TEST_PASSWORD);
    await page.getByLabel(/confirm password/i).fill(TEST_PASSWORD);
    
    // Submit form
    await page.getByRole('button', { name: /create account/i }).click();
    
    // Should either show success message or redirect to dashboard
    // (depending on email confirmation settings)
    await page.waitForLoadState('networkidle');
    
    const url = page.url();
    const hasSuccessMessage = await page.getByText(/account created successfully/i).isVisible().catch(() => false);
    const isOnDashboard = url.includes('/dashboard');
    
    expect(hasSuccessMessage || isOnDashboard).toBeTruthy();
  });

  test('sign-in flow authenticates user', async ({ page }) => {
    // First create account (if not exists from previous test)
    // This is idempotent - if user exists, sign-up will fail but that's ok
    await page.goto('/sign-up');
    await page.getByLabel(/email/i).fill(TEST_EMAIL);
    await page.getByRole('combobox', { name: /i am a/i }).click();
    await page.getByRole('option', { name: /client/i }).click();
    await page.getByLabel(/^password$/i).fill(TEST_PASSWORD);
    await page.getByLabel(/confirm password/i).fill(TEST_PASSWORD);
    await page.getByRole('button', { name: /create account/i }).click();
    await page.waitForTimeout(1000);
    
    // Now test sign-in
    await page.goto('/sign-in');
    
    await page.getByLabel(/email/i).fill(TEST_EMAIL);
    await page.getByLabel(/password/i).fill(TEST_PASSWORD);
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    
    // Should show dashboard content
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  });

  test('authenticated user can access dashboard', async ({ page }) => {
    // Sign in first
    await page.goto('/sign-in');
    await page.getByLabel(/email/i).fill(TEST_EMAIL);
    await page.getByLabel(/password/i).fill(TEST_PASSWORD);
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);
    
    // Try to access dashboard directly
    await page.goto('/dashboard');
    
    // Should stay on dashboard (not redirect)
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  });

  test('sign-out returns user to home', async ({ page }) => {
    // Sign in first
    await page.goto('/sign-in');
    await page.getByLabel(/email/i).fill(TEST_EMAIL);
    await page.getByLabel(/password/i).fill(TEST_PASSWORD);
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);
    
    // Click sign out button
    await page.getByRole('button', { name: /sign out/i }).click();
    
    // Should redirect to home
    await expect(page).toHaveURL('/');
    
    // Try to access dashboard - should redirect to sign-in
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('password reset flow sends email', async ({ page }) => {
    await page.goto('/reset-password');
    
    await page.getByLabel(/email/i).fill(TEST_EMAIL);
    await page.getByRole('button', { name: /send reset link/i }).click();
    
    // Should show success message
    await expect(page.getByText(/check your email/i)).toBeVisible();
  });

  test('authenticated users redirected away from auth pages', async ({ page }) => {
    // Sign in first
    await page.goto('/sign-in');
    await page.getByLabel(/email/i).fill(TEST_EMAIL);
    await page.getByLabel(/password/i).fill(TEST_PASSWORD);
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);
    
    // Try to visit sign-in page
    await page.goto('/sign-in');
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    
    // Try to visit sign-up page
    await page.goto('/sign-up');
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
  });

  test('redirect parameter works after sign-in', async ({ page }) => {
    // Sign out first
    await page.goto('/dashboard');
    if (page.url().includes('/dashboard')) {
      await page.getByRole('button', { name: /sign out/i }).click();
      await page.waitForTimeout(500);
    }
    
    // Visit a protected route
    await page.goto('/dashboard/settings');
    
    // Should redirect to sign-in with redirect parameter
    await expect(page).toHaveURL(/\/sign-in.*redirect/);
    
    // Sign in
    await page.getByLabel(/email/i).fill(TEST_EMAIL);
    await page.getByLabel(/password/i).fill(TEST_PASSWORD);
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Should redirect to original destination
    await expect(page).toHaveURL(/\/dashboard\/settings/);
  });
});

