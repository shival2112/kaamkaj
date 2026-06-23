import { test, expect } from '@playwright/test';
import { writeRunState } from './state';
import { markEmailVerified, disconnectDb } from './db';

// Creates a fresh employer account and posts a job via the API (reusing the
// browser context's session cookies). This avoids depending on whatever
// employer/company rows already exist in the shared dev database.
test('employer can sign up and post a job', async ({ page }) => {
  const runId = Date.now();
  const employerEmail = `e2e-employer-${runId}@kaamkaaj-test.com`;
  const employerPassword = 'E2eTest@12345';
  const employerName = `E2E Employer ${runId}`;
  const jobTitle = `E2E Test Job ${runId}`;

  await page.goto('/signup');

  await page.getByRole('button', { name: 'Employer Find great talent' }).click();
  await page.getByLabel('Full name').fill(employerName);
  await page.getByLabel('Email address').fill(employerEmail);
  await page.getByRole('textbox', { name: 'Password' }).fill(employerPassword);
  await page.getByRole('button', { name: 'Create account' }).click();

  await page.waitForURL('**/employer/dashboard', { timeout: 30_000 });

  await markEmailVerified(employerEmail);
  await disconnectDb();

  const response = await page.request.post('/api/employer/jobs', {
    data: {
      title: jobTitle,
      type: 'FULL_TIME',
      location: 'Bangalore, India',
      experienceLevel: 'JUNIOR',
      salaryMin: 600000,
      salaryMax: 900000,
      skills: ['JavaScript', 'React'],
      description: 'Job created by the Playwright E2E suite to exercise the candidate-apply / employer-review flow.',
    },
  });
  expect(response.ok()).toBeTruthy();
  const job = await response.json() as { id: string };

  writeRunState({ employerEmail, employerPassword, jobId: job.id, jobTitle });
});
