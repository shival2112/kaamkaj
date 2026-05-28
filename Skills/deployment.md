# Deployment Skill — KaamKaaj

## Platform: Vercel
Zero-config deployment for Next.js. Free tier sufficient for demo.

## Repository
https://github.com/shival2112/kaamkaj

## Deployment Configuration

### vercel.json (in frontend/)
```json
{
  "buildCommand": "prisma generate && next build",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

## Environment Variables on Vercel
Set these in Vercel dashboard → Project → Settings → Environment Variables:

```
DATABASE_URL
DIRECT_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

Note: `NEXT_PUBLIC_*` variables are bundled into client JS.
Secret variables (SERVICE_ROLE_KEY, DATABASE_URL) are server-only.

## GitHub Workflow
Branch strategy:
```
main               ← production branch (deploys to Vercel prod)
feature/homepage   ← feature branches (auto preview deployments on Vercel)
feature/auth
feature/jobs-page
feature/candidate-dashboard
feature/employer-dashboard
feature/admin-dashboard
```

## Deployment Steps
1. Push code to GitHub feature branch → Vercel creates preview deployment
2. Test on preview URL
3. Merge PR to main → Vercel auto-deploys to production
4. Monitor Vercel logs for build/runtime errors

## Build Checklist
- [ ] `npm run build` passes locally
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No ESLint errors (`npm run lint`)
- [ ] All env vars set on Vercel
- [ ] Prisma schema synced with production DB

## Next.js Build Output
- Static pages (/, /jobs) → prerendered at build time
- Dynamic pages (/jobs/[id]) → ISR or SSR depending on data
- API routes → serverless functions

## Common Deployment Issues
1. **Prisma client not generated**: Add `prisma generate` to build command
2. **Missing env vars**: Check Vercel dashboard, ensure not `NEXT_PUBLIC_` for secrets
3. **Database connection**: Use pooler URL for Prisma (port 6543 with ?pgbouncer=true)
4. **Import alias @/ not resolving**: Verify `paths` in tsconfig.json

## Vercel CLI (optional, for local testing)
```bash
npm i -g vercel
vercel dev        # local dev with Vercel environment
vercel            # deploy to preview
vercel --prod     # deploy to production
```

## Performance Monitoring
- Use Vercel Analytics (free tier)
- Core Web Vitals tracked automatically
- Add `@vercel/analytics` package to frontend for detailed metrics

## Custom Domain (when ready)
1. Buy domain or use Vercel subdomain
2. Vercel dashboard → Domains → Add
3. Configure DNS CNAME → cname.vercel-dns.com
