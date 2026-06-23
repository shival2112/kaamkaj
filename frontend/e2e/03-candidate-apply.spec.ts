import { test, expect } from '@playwright/test';
import { readRunState } from './state';

test('candidate can log in and apply to the seeded test job', async ({ page }) => {
  const { candidateEmail, candidatePassword, jobId } = readRunState();
  if (!jobId) throw new Error('jobId missing from run state — did spec 01 run first?');

  await page.goto('/login');
  await page.getByLabel('Email address').fill(candidateEmail!);
  await page.getByRole('textbox', { name: 'Password' }).fill(candidatePassword!);
  await page.getByRole('button', { name: 'Sign in' }).click();

  await page.waitForURL('**/dashboard', { timeout: 30_000 });

  await page.goto(`/jobs/${jobId}`);

  // Desktop sidebar + mobile sticky bar both render an ApplyButton instance.
  const applyButton = page.getByRole('button', { name: 'Apply Now' }).first();
  const alreadyApplied = page.getByText('Applied Successfully').first();

  if (await alreadyApplied.isVisible().catch(() => false)) {
    await expect(alreadyApplied).toBeVisible();
    return;
  }

  await expect(applyButton).toBeVisible({ timeout: 20_000 });
  await applyButton.click();
  await page.getByRole('button', { name: 'Skip letter' }).first().click();

  await expect(page.getByText('Applied Successfully').first()).toBeVisible({ timeout: 20_000 });
});
