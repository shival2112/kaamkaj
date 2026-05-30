/**
 * Prisma seed — populates demo jobs, companies, and employer profiles.
 * Run: npx prisma db seed
 *
 * Uses upsert throughout so it's safe to run multiple times.
 */
import { PrismaClient, JobType, ExperienceLevel, JobStatus, Role } from '@prisma/client';

const prisma = new PrismaClient();

// ─── Employer users (demo only — no Supabase Auth counterpart) ───────────────

const EMPLOYERS = [
  {
    id: 'seed-employer-technova-0001',
    email: 'hr@technova.demo',
    name: 'TechNova HR',
    role: Role.EMPLOYER,
  },
  {
    id: 'seed-employer-creditbay-002',
    email: 'hr@creditbay.demo',
    name: 'CreditBay HR',
    role: Role.EMPLOYER,
  },
  {
    id: 'seed-employer-retailco-0003',
    email: 'hr@retailco.demo',
    name: 'RetailCo HR',
    role: Role.EMPLOYER,
  },
] as const;

// ─── Companies ────────────────────────────────────────────────────────────────

const COMPANIES = [
  {
    id: 'seed-company-technova-0001',
    ownerId: 'seed-employer-technova-0001',
    name: 'TechNova India',
    industry: 'Software & IT Services',
    size: '51-200',
    description:
      'TechNova India is a fast-growing software company building SaaS products for enterprises across Asia. We work with cutting-edge technologies including cloud-native architectures, AI/ML pipelines, and scalable microservices.',
    isVerified: true,
  },
  {
    id: 'seed-company-creditbay-0002',
    ownerId: 'seed-employer-creditbay-002',
    name: 'CreditBay Financial Services',
    industry: 'Banking & Finance',
    size: '201-500',
    description:
      'CreditBay is a leading NBFC offering personal loans, business loans, and credit analytics solutions. With presence in 30+ cities, we are transforming how India accesses credit.',
    isVerified: true,
  },
  {
    id: 'seed-company-retailco-00003',
    ownerId: 'seed-employer-retailco-0003',
    name: 'RetailCo Pvt. Ltd.',
    industry: 'Retail & E-commerce',
    size: '500+',
    description:
      'RetailCo is a pan-India omnichannel retailer operating 200+ stores and a growing e-commerce platform. We serve 10 million+ customers and are expanding rapidly across Tier 2 and Tier 3 cities.',
    isVerified: false,
  },
] as const;

// ─── Jobs ─────────────────────────────────────────────────────────────────────

const JOBS = [
  // ── TechNova India ──────────────────────────────────────────────────────────
  {
    id: 'seed-job-fullstack-tn-001',
    companyId: 'seed-company-technova-0001',
    title: 'Full Stack Developer',
    location: 'Remote',
    type: JobType.REMOTE,
    experienceLevel: ExperienceLevel.JUNIOR,
    salaryMin: 600000,
    salaryMax: 1200000,
    vacancies: 3,
    skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker'],
    description: `We are looking for a talented Full Stack Developer to join our product engineering team.

Responsibilities:
• Build and maintain scalable web applications using React and Node.js
• Design and implement RESTful APIs and GraphQL endpoints
• Collaborate with designers and product managers in an Agile environment
• Write clean, maintainable, and well-tested code
• Participate in code reviews and architecture discussions

Requirements:
• 1–3 years of experience with React and Node.js
• Strong knowledge of TypeScript and modern JavaScript (ES2020+)
• Experience with SQL databases (PostgreSQL preferred)
• Familiarity with Docker and CI/CD pipelines
• Good communication skills and ability to work remotely`,
    status: JobStatus.ACTIVE,
  },
  {
    id: 'seed-job-backend-tn-002',
    companyId: 'seed-company-technova-0001',
    title: 'Backend Engineer (Node.js)',
    location: 'Bangalore, Karnataka',
    type: JobType.FULL_TIME,
    experienceLevel: ExperienceLevel.MID,
    salaryMin: 900000,
    salaryMax: 1600000,
    vacancies: 2,
    skills: ['Node.js', 'Express', 'Redis', 'Kafka', 'AWS'],
    description: `Join our backend platform team to build the core APIs and data pipelines that power TechNova's products.

Responsibilities:
• Design and develop high-performance backend services handling 10M+ requests/day
• Own microservices end-to-end — from design through deployment
• Optimize database queries, caching strategies, and API response times
• Work with Kafka for event-driven architectures
• Mentor junior engineers and conduct technical interviews

Requirements:
• 3–6 years of backend development experience
• Deep expertise in Node.js, Express, and asynchronous programming
• Hands-on experience with Redis caching and message queues
• Strong understanding of distributed systems and cloud infrastructure (AWS/GCP)
• Experience with observability tools (Datadog, Grafana)`,
    status: JobStatus.ACTIVE,
  },
  {
    id: 'seed-job-devops-tn-003',
    companyId: 'seed-company-technova-0001',
    title: 'DevOps Engineer',
    location: 'Hyderabad, Telangana',
    type: JobType.FULL_TIME,
    experienceLevel: ExperienceLevel.MID,
    salaryMin: 1000000,
    salaryMax: 1800000,
    vacancies: 1,
    skills: ['Kubernetes', 'Terraform', 'AWS', 'GitHub Actions', 'Helm'],
    description: `We are looking for a DevOps Engineer to strengthen our infrastructure and help us scale reliably.

Responsibilities:
• Manage and scale Kubernetes clusters on AWS EKS
• Implement and maintain CI/CD pipelines using GitHub Actions
• Write infrastructure-as-code using Terraform and Helm
• Monitor platform health, respond to incidents, and drive root-cause analysis
• Improve deployment velocity and reliability across 20+ microservices

Requirements:
• 3–5 years of DevOps / SRE experience
• Hands-on expertise with Kubernetes and containerization
• Strong Terraform and IaC skills
• Experience with AWS (EKS, RDS, S3, CloudWatch)
• Comfortable on-call with a focus on reducing toil`,
    status: JobStatus.ACTIVE,
  },
  {
    id: 'seed-job-qa-tn-004',
    companyId: 'seed-company-technova-0001',
    title: 'Quality Assurance Engineer',
    location: 'Pune, Maharashtra',
    type: JobType.FULL_TIME,
    experienceLevel: ExperienceLevel.JUNIOR,
    salaryMin: 400000,
    salaryMax: 700000,
    vacancies: 2,
    skills: ['Selenium', 'Playwright', 'Postman', 'JIRA', 'Python'],
    description: `We are hiring a QA Engineer to ensure our products ship with the highest quality standards.

Responsibilities:
• Write and maintain automated test suites using Playwright and Selenium
• Perform API testing using Postman and custom scripts
• Create and execute test plans, test cases, and bug reports
• Work closely with developers to reproduce and resolve issues
• Contribute to CI pipeline by integrating automated tests

Requirements:
• 1–3 years of QA experience in software companies
• Experience with test automation frameworks (Playwright or Selenium)
• Good understanding of API testing (REST)
• Familiarity with Agile/Scrum methodologies
• Basic Python or JavaScript scripting skills`,
    status: JobStatus.ACTIVE,
  },
  {
    id: 'seed-job-product-tn-005',
    companyId: 'seed-company-technova-0001',
    title: 'Senior Product Manager',
    location: 'Mumbai, Maharashtra',
    type: JobType.FULL_TIME,
    experienceLevel: ExperienceLevel.SENIOR,
    salaryMin: 2000000,
    salaryMax: 3200000,
    vacancies: 1,
    skills: ['Product Strategy', 'Agile', 'SQL', 'Figma', 'A/B Testing'],
    description: `Drive the vision and roadmap for TechNova's flagship SaaS product used by 500+ enterprise clients.

Responsibilities:
• Define and prioritize product roadmap in alignment with business goals
• Gather and synthesise user feedback, data insights, and market research
• Collaborate with engineering, design, and sales teams on feature delivery
• Define success metrics and lead A/B experiments
• Present product updates to C-suite and customers

Requirements:
• 6–10 years of product management experience, ideally in B2B SaaS
• Strong analytical skills — comfortable writing SQL queries and reading dashboards
• Experience working with design tools (Figma) and tracking tools (Mixpanel/Amplitude)
• Excellent communication and stakeholder management
• MBA or engineering background preferred`,
    status: JobStatus.ACTIVE,
  },

  // ── CreditBay Financial Services ────────────────────────────────────────────
  {
    id: 'seed-job-rm-cb-006',
    companyId: 'seed-company-creditbay-0002',
    title: 'Relationship Manager – Personal Loans',
    location: 'Mumbai, Maharashtra',
    type: JobType.FULL_TIME,
    experienceLevel: ExperienceLevel.JUNIOR,
    salaryMin: 350000,
    salaryMax: 600000,
    vacancies: 10,
    skills: ['Sales', 'Customer Relationship', 'Loan Processing', 'MS Excel', 'Communication'],
    description: `Join CreditBay as a Relationship Manager and help individuals achieve their financial goals through personalised loan solutions.

Responsibilities:
• Identify and acquire new customers for personal loan products
• Build and manage a portfolio of customers through regular engagement
• Understand customer needs and recommend suitable loan products
• Ensure timely documentation and smooth disbursal process
• Achieve monthly disbursement targets

Requirements:
• 0–2 years of experience in banking, NBFC, or financial services
• Strong communication and interpersonal skills
• Goal-oriented mindset with a passion for sales
• Basic knowledge of loan products and credit assessment
• Graduate in any stream; MBA preferred`,
    status: JobStatus.ACTIVE,
  },
  {
    id: 'seed-job-credit-cb-007',
    companyId: 'seed-company-creditbay-0002',
    title: 'Credit Analyst',
    location: 'Gurugram, Haryana',
    type: JobType.FULL_TIME,
    experienceLevel: ExperienceLevel.MID,
    salaryMin: 600000,
    salaryMax: 1000000,
    vacancies: 3,
    skills: ['Credit Risk', 'Financial Analysis', 'MS Excel', 'SQL', 'CIBIL'],
    description: `We are looking for a Credit Analyst to assess loan applications and ensure sound credit decisions for CreditBay's growing portfolio.

Responsibilities:
• Analyse loan applications, financial statements, and credit bureau reports
• Assess repayment capacity and risk profile of borrowers
• Prepare detailed credit notes and present recommendations to the credit committee
• Monitor existing portfolio for early warning signals
• Support policy and process improvements in underwriting

Requirements:
• 3–5 years of credit analysis experience in banking or NBFC
• Proficiency in financial statement analysis and ratio analysis
• Strong Excel skills; SQL knowledge is a plus
• Familiarity with CIBIL scoring and credit bureau data
• CA / MBA Finance preferred`,
    status: JobStatus.ACTIVE,
  },
  {
    id: 'seed-job-data-cb-008',
    companyId: 'seed-company-creditbay-0002',
    title: 'Data Analyst',
    location: 'Bangalore, Karnataka',
    type: JobType.FULL_TIME,
    experienceLevel: ExperienceLevel.JUNIOR,
    salaryMin: 500000,
    salaryMax: 900000,
    vacancies: 2,
    skills: ['Python', 'SQL', 'Power BI', 'Statistics', 'Excel'],
    description: `Help CreditBay turn data into actionable insights that drive smarter credit decisions and business growth.

Responsibilities:
• Build and maintain dashboards and reports in Power BI and Metabase
• Write complex SQL queries to extract and analyse large datasets
• Develop Python scripts for data cleaning, transformation, and reporting
• Identify trends in loan performance, customer behaviour, and risk metrics
• Collaborate with risk, product, and finance teams on analytical requests

Requirements:
• 1–3 years of data analytics experience
• Strong SQL skills (PostgreSQL/MySQL)
• Hands-on Python for data analysis (Pandas, NumPy, Matplotlib)
• Experience with BI tools (Power BI, Tableau, or Metabase)
• Understanding of basic statistical concepts`,
    status: JobStatus.ACTIVE,
  },
  {
    id: 'seed-job-csr-cb-009',
    companyId: 'seed-company-creditbay-0002',
    title: 'Customer Service Representative',
    location: 'Ahmedabad, Gujarat',
    type: JobType.FULL_TIME,
    experienceLevel: ExperienceLevel.FRESHER,
    salaryMin: 220000,
    salaryMax: 360000,
    vacancies: 15,
    skills: ['Communication', 'CRM', 'Problem Solving', 'Hindi', 'MS Office'],
    description: `Be the voice of CreditBay and deliver exceptional service to our loan customers.

Responsibilities:
• Handle inbound customer queries via phone, email, and chat
• Assist customers with loan status, EMI schedules, and repayment queries
• Escalate complex issues to senior teams and ensure timely resolution
• Maintain accurate records of customer interactions in the CRM system
• Achieve customer satisfaction scores (CSAT) targets

Requirements:
• Freshers welcome — any graduate stream
• Excellent verbal and written communication in Hindi and English
• Basic computer literacy (MS Office, internet)
• Willingness to work in rotational shifts
• Customer-first attitude with empathy and patience`,
    status: JobStatus.ACTIVE,
  },
  {
    id: 'seed-job-finanalyst-cb-010',
    companyId: 'seed-company-creditbay-0002',
    title: 'Financial Analyst',
    location: 'Mumbai, Maharashtra',
    type: JobType.FULL_TIME,
    experienceLevel: ExperienceLevel.MID,
    salaryMin: 800000,
    salaryMax: 1400000,
    vacancies: 1,
    skills: ['Financial Modelling', 'Excel', 'Python', 'FP&A', 'Valuation'],
    description: `Support CreditBay's FP&A function with financial models, investor reporting, and strategic analyses.

Responsibilities:
• Build and maintain complex financial models for budgeting, forecasting, and scenario analysis
• Prepare monthly MIS reports and board presentations
• Assist in investor relations activities, due diligence, and fundraising decks
• Analyse cost structures and identify efficiency opportunities
• Support statutory and management audits

Requirements:
• 3–6 years of financial analysis experience in BFSI or consulting
• Advanced Excel and PowerPoint skills
• CA / CFA / MBA Finance qualification
• Experience with financial modelling best practices
• Strong attention to detail and the ability to work under tight deadlines`,
    status: JobStatus.ACTIVE,
  },

  // ── RetailCo Pvt. Ltd. ──────────────────────────────────────────────────────
  {
    id: 'seed-job-storemanager-rc-011',
    companyId: 'seed-company-retailco-00003',
    title: 'Store Manager',
    location: 'Delhi NCR',
    type: JobType.FULL_TIME,
    experienceLevel: ExperienceLevel.MID,
    salaryMin: 420000,
    salaryMax: 700000,
    vacancies: 5,
    skills: ['Retail Operations', 'Team Management', 'P&L', 'Customer Service', 'Inventory'],
    description: `Lead one of RetailCo's flagship stores and drive an outstanding customer and team experience.

Responsibilities:
• Oversee daily store operations including staffing, inventory, and visual merchandising
• Drive sales targets and manage the store P&L
• Hire, train, and develop a team of 15–25 store associates
• Ensure compliance with loss prevention and safety standards
• Build relationships with local community and corporate customers

Requirements:
• 3–6 years of retail store management experience
• Strong leadership and team motivation skills
• Understanding of retail KPIs (conversion, ATV, shrinkage)
• Graduate in any field; MBA preferred
• Willingness to work weekends and holidays`,
    status: JobStatus.ACTIVE,
  },
  {
    id: 'seed-job-supplychain-rc-012',
    companyId: 'seed-company-retailco-00003',
    title: 'Supply Chain Analyst',
    location: 'Gurugram, Haryana',
    type: JobType.FULL_TIME,
    experienceLevel: ExperienceLevel.JUNIOR,
    salaryMin: 450000,
    salaryMax: 750000,
    vacancies: 2,
    skills: ['Supply Chain', 'SQL', 'Excel', 'SAP', 'Demand Forecasting'],
    description: `Optimise RetailCo's supply chain to ensure the right products reach the right place at the right time.

Responsibilities:
• Analyse demand patterns and coordinate with procurement to manage inventory levels
• Track supplier performance and flag deviations in delivery timelines
• Build weekly and monthly supply chain reports using Excel and SQL
• Identify bottlenecks in the logistics network and recommend solutions
• Support new store openings with supply chain readiness planning

Requirements:
• 1–3 years of experience in supply chain, logistics, or procurement
• Proficiency in MS Excel and basic SQL
• Familiarity with ERP systems (SAP preferred)
• Strong analytical and problem-solving skills
• Engineering or MBA in Operations / Supply Chain`,
    status: JobStatus.ACTIVE,
  },
  {
    id: 'seed-job-marketing-rc-013',
    companyId: 'seed-company-retailco-00003',
    title: 'Digital Marketing Executive',
    location: 'Mumbai, Maharashtra',
    type: JobType.FULL_TIME,
    experienceLevel: ExperienceLevel.JUNIOR,
    salaryMin: 300000,
    salaryMax: 500000,
    vacancies: 2,
    skills: ['Google Ads', 'Meta Ads', 'SEO', 'Google Analytics', 'Canva'],
    description: `Drive RetailCo's digital presence and customer acquisition through paid and organic channels.

Responsibilities:
• Plan and execute performance marketing campaigns on Google, Meta, and Instagram
• Manage daily ad spends, optimise ROAS, and report on campaign performance
• Work with the content team to create compelling creatives and copy
• Monitor SEO rankings and implement on-page optimisation
• Manage email marketing campaigns and push notifications

Requirements:
• 1–3 years of digital marketing experience
• Hands-on experience with Google Ads and Meta Business Manager
• Basic Google Analytics 4 and Tag Manager knowledge
• Proficiency in Canva or basic design tools
• Data-driven mindset with strong attention to detail`,
    status: JobStatus.ACTIVE,
  },
  {
    id: 'seed-job-sales-rc-014',
    companyId: 'seed-company-retailco-00003',
    title: 'Sales Executive (Field)',
    location: 'Pan India',
    type: JobType.FULL_TIME,
    experienceLevel: ExperienceLevel.FRESHER,
    salaryMin: 200000,
    salaryMax: 380000,
    vacancies: 25,
    skills: ['Sales', 'Communication', 'Negotiation', 'CRM', 'Field Work'],
    description: `Join RetailCo's growing field sales team and help us expand our B2B customer base across India.

Responsibilities:
• Identify and visit potential B2B clients (small businesses, kirana stores, institutions)
• Demonstrate RetailCo products and present customised solutions
• Achieve monthly sales targets and maintain a healthy pipeline
• Collect payments and ensure timely order fulfilment
• Build long-term relationships with customers through regular follow-ups

Requirements:
• Freshers and experienced candidates welcome
• Two-wheeler with valid driving licence (preferred)
• Excellent communication in local language + Hindi
• Willingness to travel within the assigned territory
• Any graduate — commerce background preferred`,
    status: JobStatus.ACTIVE,
  },
  {
    id: 'seed-job-content-rc-015',
    companyId: 'seed-company-retailco-00003',
    title: 'Content Writer',
    location: 'Remote',
    type: JobType.REMOTE,
    experienceLevel: ExperienceLevel.FRESHER,
    salaryMin: 240000,
    salaryMax: 420000,
    vacancies: 2,
    skills: ['Content Writing', 'SEO Writing', 'Copywriting', 'WordPress', 'Research'],
    description: `Create compelling content that engages RetailCo's online audience and drives organic traffic.

Responsibilities:
• Write SEO-optimised blog posts, product descriptions, and landing page copy
• Research topics thoroughly and craft content that resonates with Indian consumers
• Collaborate with the SEO team to target high-value keywords
• Proofread and edit content from other team members
• Maintain a consistent brand voice across all written materials

Requirements:
• Freshers with strong writing portfolios welcome
• Excellent command of English; Hindi writing skills are a bonus
• Understanding of basic SEO principles (on-page, keyword research)
• Familiarity with WordPress or any CMS
• Ability to meet deadlines and handle multiple assignments`,
    status: JobStatus.ACTIVE,
  },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Seeding database...\n');

  // 1. Upsert employer users
  for (const emp of EMPLOYERS) {
    await prisma.user.upsert({
      where: { id: emp.id },
      update: {},
      create: {
        id: emp.id,
        email: emp.email,
        name: emp.name,
        role: emp.role,
        isVerified: true,
      },
    });
    console.log(`  ✓ Employer: ${emp.name}`);
  }

  // 2. Upsert companies
  for (const co of COMPANIES) {
    await prisma.company.upsert({
      where: { id: co.id },
      update: {},
      create: {
        id: co.id,
        name: co.name,
        industry: co.industry,
        size: co.size,
        description: co.description,
        isVerified: co.isVerified,
        ownerId: co.ownerId,
      },
    });
    console.log(`  ✓ Company: ${co.name}`);
  }

  // 3. Upsert jobs
  for (const job of JOBS) {
    await prisma.job.upsert({
      where: { id: job.id },
      update: {},
      create: {
        id: job.id,
        title: job.title,
        description: job.description,
        companyId: job.companyId,
        location: job.location,
        type: job.type,
        experienceLevel: job.experienceLevel,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        vacancies: job.vacancies,
        skills: job.skills as string[],
        status: job.status,
      },
    });
    console.log(`  ✓ Job: ${job.title} @ ${job.location}`);
  }

  console.log(`\n✅ Seed complete — ${EMPLOYERS.length} employers, ${COMPANIES.length} companies, ${JOBS.length} jobs.`);
}

main()
  .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
