import { test, expect } from '@playwright/test';
import { readRunState } from './state';

test('employer can log in and move the candidate to the next stage', async ({ page }) => {
  const { employerEmail, employerPassword, candidateName, jobId } = readRunState();
  if (!jobId) throw new Error('jobId missing from run state — did spec 01 run first?');

  await page.goto('/login');
  await page.getByLabel('Email address').fill(employerEmail!);
  await page.getByRole('textbox', { name: 'Password' }).fill(employerPassword!);
  await page.getByRole('button', { name: 'Sign in' }).click();

  await page.waitForURL('**/employer/dashboard', { timeout: 30_000 });

  await page.goto(`/employer/dashboard/applications?jobId=${jobId}`);

  const row = page.locator('div.grid', { hasText: candidateName! }).first();
  await expect(row).toBeVisible({ timeout: 20_000 });

  const updateButton = row.getByRole('button', { name: /Update/ });

  // Application may already be in a terminal state (HIRED/REJECTED) from a
  // previous run — in that case there's nothing left to advance.
  if (!(await updateButton.isVisible().catch(() => false))) {
    await expect(row).toContainText(/Hired|Rejected/i);
    return;
  }

  await updateButton.click();
  await row.getByRole('button', { name: /Review|Shortlist|Hire/ }).first().click();

  await expect(page.getByText(/Application moved to/i)).toBeVisible({ timeout: 20_000 });
});
