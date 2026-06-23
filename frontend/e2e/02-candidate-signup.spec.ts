import { test, expect } from '@playwright/test';
import { writeRunState } from './state';
import { markEmailVerified, disconnectDb } from './db';

test('candidate can sign up and complete onboarding', async ({ page }) => {
  const runId = Date.now();
  const candidateEmail = `e2e-candidate-${runId}@kaamkaaj-test.com`;
  const candidatePassword = 'E2eTest@12345';
  const candidateName = `E2E Candidate ${runId}`;

  await page.goto('/signup');

  await page.getByRole('button', { name: 'Job Seeker Find great opportunities' }).click();
  await page.getByLabel('Full name').fill(candidateName);
  await page.getByLabel('Email address').fill(candidateEmail);
  await page.getByRole('textbox', { name: 'Password' }).fill(candidatePassword);
  await page.getByRole('button', { name: 'Create account' }).click();

  await page.waitForURL('**/dashboard/onboarding', { timeout: 30_000 });

  await page.getByPlaceholder('Rahul Sharma').fill(candidateName);
  await page.getByPlaceholder('9876543210').fill('9876543210');
  await page.getByPlaceholder('e.g. Frontend Developer · React · 2 yrs exp').fill('E2E Test Engineer');
  await page.getByPlaceholder('e.g. Bangalore, India').fill('Bangalore, India');

  const skillInput = page.getByPlaceholder('Type a skill and press Enter');
  await skillInput.fill('JavaScript');
  await skillInput.press('Enter');
  await skillInput.fill('React');
  await skillInput.press('Enter');

  await page.getByRole('button', { name: 'Save Profile & Continue' }).click();

  await page.waitForURL('**/dashboard', { timeout: 30_000 });
  await expect(page).toHaveURL(/\/dashboard$/);

  await markEmailVerified(candidateEmail);
  await disconnectDb();

  writeRunState({ candidateEmail, candidatePassword, candidateName });
});
