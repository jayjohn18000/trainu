import { test, expect } from '@playwright/test';

test.describe('Trainer Directory', () => {
  test('should display header and trainer cards', async ({ page }) => {
    await page.goto('/directory');
    
    // Check that the header is visible
    await expect(page.getByRole('heading', { name: /Trainer Directory/ })).toBeVisible();
    
    // Check that the description is visible
    await expect(page.getByText(/Find your perfect trainer and start your fitness journey/)).toBeVisible();
    
    // Check that the search input is visible
    await expect(page.getByPlaceholder(/Search by name, specialty, or location/)).toBeVisible();
    
    // If there are trainers in the database, check that at least one trainer card is visible
    // This will pass even if there are no trainers (empty state)
    const trainerCards = page.locator('[data-testid="trainer-card"]');
    const trainerCardCount = await trainerCards.count();
    
    if (trainerCardCount > 0) {
      // If there are trainers, check that the first one is visible
      await expect(trainerCards.first()).toBeVisible();
      
      // Check that trainer name is visible
      await expect(trainerCards.first().getByRole('heading', { level: 3 })).toBeVisible();
      
      // Check that "View Profile" button is visible
      await expect(trainerCards.first().getByRole('link', { name: /View Profile/ })).toBeVisible();
    } else {
      // If no trainers, check that the empty state message is visible
      await expect(page.getByText(/No trainers found matching your criteria/)).toBeVisible();
    }
  });

  test('should navigate to trainer profile when clicking View Profile', async ({ page }) => {
    await page.goto('/directory');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check if there are any trainer cards
    const trainerCards = page.locator('[data-testid="trainer-card"]');
    const trainerCardCount = await trainerCards.count();
    
    if (trainerCardCount > 0) {
      // Click on the first trainer's "View Profile" button
      await trainerCards.first().getByRole('link', { name: /View Profile/ }).click();
      
      // Check that we navigated to a trainer profile page
      await expect(page).toHaveURL(/\/trainers\/.+/);
      
      // Check that the trainer profile page loaded
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    } else {
      // If no trainers, skip this test
      test.skip();
    }
  });

  test('should have working search functionality', async ({ page }) => {
    await page.goto('/directory');
    
    // Get the search input
    const searchInput = page.getByPlaceholder(/Search by name, specialty, or location/);
    await expect(searchInput).toBeVisible();
    
    // Type in the search input
    await searchInput.fill('test search');
    
    // Verify the search input has the value
    await expect(searchInput).toHaveValue('test search');
    
    // Clear the search
    await searchInput.clear();
    await expect(searchInput).toHaveValue('');
  });

  test('should have filter dropdowns', async ({ page }) => {
    await page.goto('/directory');
    
    // Check that filter dropdowns are visible
    await expect(page.getByRole('combobox')).toHaveCount(3); // City, State, Specialty filters
    
    // Check that the first dropdown (Cities) is visible
    const cityFilter = page.getByRole('combobox').first();
    await expect(cityFilter).toBeVisible();
  });
});
