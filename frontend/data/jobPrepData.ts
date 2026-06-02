export interface PrepQuestion {
  duration: string;
  category: string;
  text: string;
  modelAnswer: string;
}

export interface PrepRound {
  name: string;
  duration: string;
  description: string;
  questions: PrepQuestion[];
}

export interface PrepEntry {
  company: string;
  role: string;
  slug: string;
  prepCount: number;
  salaryRange: string;
  logoColor: string;
  logoInitial: string;
  category: string;
  section: 'GLOBAL_TECH' | 'INDIAN_STARTUPS' | 'GLOBAL_MNCS';
  rounds: PrepRound[];
}

export const CATEGORIES = [
  'TECH', 'PRODUCT', 'DATA', 'STRATEGY', 'DESIGN',
  'CONSULTING', 'MARKETING', 'BANKING', 'BPO', 'ENGINEERING', 'HR', 'ACCOUNT',
] as const;

export const SECTION_LABELS: Record<'GLOBAL_TECH' | 'INDIAN_STARTUPS' | 'GLOBAL_MNCS', string> = {
  GLOBAL_TECH: 'GLOBAL TECH GIANTS',
  INDIAN_STARTUPS: 'INDIAN STARTUPS & UNICORNS',
  GLOBAL_MNCS: 'GLOBAL MNCS IN INDIA',
};

export const PREP_DATA: PrepEntry[] = [
  // ── Google ────────────────────────────────────────────────────────────────
  {
    company: 'Google',
    role: 'Senior QA Engineer',
    slug: 'google-senior-qa-engineer',
    prepCount: 200,
    salaryRange: '9L – 12L',
    logoColor: 'bg-blue-500',
    logoInitial: 'G',
    category: 'TECH',
    section: 'GLOBAL_TECH',
    rounds: [
      {
        name: 'Fundamental Screening',
        duration: '20 minutes',
        description: 'Evaluates foundational knowledge in software testing principles, QA methodologies, and basic programming concepts used across Google teams.',
        questions: [
          {
            duration: '5 minutes',
            category: 'Technical Knowledge',
            text: 'What is the difference between functional and non-functional testing? Provide examples for each.',
            modelAnswer: 'Functional testing validates that features meet their spec — a login button correctly authenticating valid credentials and blocking invalid ones. Non-functional testing covers performance (response time under load), security (session encryption), and accessibility (screen reader support). The key distinction is "does it work?" versus "how well does it work under constraint?". I plan both each sprint: automated functional suites run in CI while non-functional cycles align with release milestones.',
          },
          {
            duration: '5 minutes',
            category: 'Testing Concepts',
            text: 'Explain the test pyramid and how you would apply it in a microservices architecture.',
            modelAnswer: 'The test pyramid prescribes a 70/20/10 ratio of unit, integration, and E2E tests — fast at the base, slow at the top. In microservices, each service owns its own unit and integration suites running in CI within seconds, with consumer-driven contract tests (Pact) validating service interfaces without full-stack deployment. E2E tests are reserved for the 5–6 critical user journeys that cross multiple services. This keeps CI feedback loops under 5 minutes while covering over 90% of realistic failure modes.',
          },
          {
            duration: '10 minutes',
            category: 'Problem Solving',
            text: 'Given a login form with email, password, and a "Remember me" checkbox — list all the test cases you would write.',
            modelAnswer: 'I group cases into functional (valid/invalid credentials, empty fields), boundary (max-length email, special characters in password), security (SQL injection, CSRF token validation, password field masking), and state-based (Remember Me persistence across sessions, session expiry). Non-functional cases include load testing the auth endpoint under 1,000 concurrent requests and verifying it stays within SLA. A complete suite for this form runs 30–40 cases covering every branch and all security vectors.',
          },
        ],
      },
      {
        name: 'Technical Deep Dive',
        duration: '30 minutes',
        description: 'A deep technical round focusing on test automation frameworks, CI/CD integration, and advanced QA practices used at Google scale.',
        questions: [
          {
            duration: '10 minutes',
            category: 'Automation',
            text: 'Design an end-to-end test automation framework for a web application. What tools would you choose and why?',
            modelAnswer: 'I would choose Playwright for its cross-browser support, built-in network interception, and excellent TypeScript integration. The architecture follows the Page Object Model to separate UI interactions from test logic, with Docker providing clean isolated browser environments for CI. Allure reporting delivers stakeholders visual dashboards on every pipeline run, and test data is generated via factories (Faker.js) to ensure test independence.',
          },
          {
            duration: '10 minutes',
            category: 'CI/CD',
            text: 'How would you integrate automated tests into a CI/CD pipeline? What strategies do you use to keep the pipeline fast?',
            modelAnswer: 'I structure three CI stages: unit tests on every commit (< 2 min), integration tests on every PR (< 10 min), and full E2E on merge to main (< 30 min). Test impact analysis runs only tests covering changed code paths, parallelization across shards reduces wall time, and a flaky test quarantine prevents noisy failures from blocking deployments. Smoke tests deploy to staging within 5 minutes of every merge to catch environment-specific regressions early.',
          },
          {
            duration: '10 minutes',
            category: 'Performance',
            text: 'Describe how you would test the performance of Google Search under 1 billion daily users. What metrics matter most?',
            modelAnswer: 'I would script realistic user journeys with k6 against a production-mirroring staging environment, capturing P50, P95, and P99 latency percentiles as primary SLA metrics. For Google Search, the target SLA would require P99 < 200ms modelling geographic distribution, query diversity (head vs long-tail), and varying cache hit rates. Regressions are flagged when any percentile exceeds the 30-day baseline by 10%, triggering an automated incident before the build ships.',
          },
        ],
      },
      {
        name: 'Googleyness & Leadership',
        duration: '25 minutes',
        description: 'Assesses cultural fit, collaboration, and handling ambiguity — core aspects of working across Google\'s large distributed engineering teams.',
        questions: [
          {
            duration: '8 minutes',
            category: 'Behavioral',
            text: 'Tell me about a time when you discovered a critical bug just before a major product launch. What did you do?',
            modelAnswer: 'Discovering a data corruption bug in our export pipeline 48 hours before launch, I called a war room with the engineering lead, PM, and head of QA to assess three options: delay, partial launch, or a compressed hotfix. I pushed for partial launch — disabling only the affected export feature — backed by data showing just 2% of users needed it on day 1. We launched on schedule, the hotfix shipped in 36 hours, and customer trust was maintained throughout.',
          },
          {
            duration: '8 minutes',
            category: 'Collaboration',
            text: 'Describe a situation where you had to influence engineers who disagreed with your quality standards.',
            modelAnswer: 'When engineers resisted raising test coverage from 40% to 80%, I stopped arguing about metrics and showed the cost of bugs: our last 3 outages totalled $1.2M in lost revenue and were all uncovered by existing tests. I introduced a shared quality dashboard visible to the whole team and embedded quality champions in each squad rather than keeping a separate QA team. Within 2 sprints, engineers were voluntarily writing tests and P1 production bugs dropped 60%.',
          },
          {
            duration: '9 minutes',
            category: 'Leadership',
            text: 'How do you mentor junior QA engineers on your team? Share a specific example of a QA engineer you helped grow.',
            modelAnswer: 'I identify each person\'s growth edge through 1:1s and test-review sessions, then assign challenges just above their current level with coaching checkpoints but full decision authority. One junior engineer was strong in functional testing but struggled with exploratory strategy, so I had her own a quality blitz project for 2 sprints. Six months later she was leading cross-squad quality initiatives independently, and today she mentors the two newest engineers on the team.',
          },
        ],
      },
      {
        name: 'System Design & Scalability',
        duration: '45 minutes',
        description: 'Evaluates ability to design scalable test infrastructure and QA strategies for large distributed systems at internet scale.',
        questions: [
          {
            duration: '15 minutes',
            category: 'System Design',
            text: 'Design a distributed test execution platform that can run 10,000 concurrent test cases across multiple cloud regions.',
            modelAnswer: 'The platform runs on Kubernetes with Kafka as the distributed job queue and dynamically scaled worker pools pulling test jobs into isolated containers. A geo-aware scheduler routes jobs to the nearest regional worker pool to minimize latency, and a central result aggregator produces a unified dashboard within 30 seconds of test completion. The system auto-scales worker pods based on queue depth with a hard cap to control cost, and each worker runs in a fresh container for complete test isolation.',
          },
          {
            duration: '15 minutes',
            category: 'Architecture',
            text: 'How would you design a flaky test detection and quarantine system for a test suite with 100K tests?',
            modelAnswer: 'A flaky detection service re-runs every test 5 times over 24 hours and flags any with a non-deterministic pass rate into an auto-quarantine suite that runs but does not block CI. Each quarantined test generates a triage ticket assigned to the owning squad with a 2-sprint deadline; tests not fixed are deleted automatically. Flakiness rate is tracked as a team health KPI with a target of zero blocking flaky tests, reviewed in every sprint retrospective.',
          },
          {
            duration: '15 minutes',
            category: 'Scale',
            text: 'Design a chaos engineering testing framework to validate the resilience of Google Workspace services.',
            modelAnswer: 'I would build on Chaos Mesh for Kubernetes-native fault injection with scenarios covering pod failures, network partitions, disk I/O saturation, and dependency timeouts. Each experiment runs against a staging environment with synthetic monitoring validating SLAs in real time — exceeding P99 thresholds auto-stops the experiment and files an incident. Results feed a quarterly resilience scorecard reviewed by engineering leads, with the goal of validating that SLAs hold under realistic failure conditions, not just finding failures.',
          },
        ],
      },
    ],
  },
  {
    company: 'Google',
    role: 'Software Engineer',
    slug: 'google-software-engineer',
    prepCount: 350,
    salaryRange: '15L – 25L',
    logoColor: 'bg-blue-500',
    logoInitial: 'G',
    category: 'TECH',
    section: 'GLOBAL_TECH',
    rounds: [
      {
        name: 'Data Structures & Algorithms',
        duration: '45 minutes',
        description: 'Core coding round testing problem-solving ability with data structures and algorithms — Google\'s primary engineering filter.',
        questions: [
          {
            duration: '15 minutes',
            category: 'Arrays',
            text: 'Given an array of integers, find all pairs whose sum equals a target value. Optimize for O(n) time complexity.',
            modelAnswer: 'Use a HashMap: iterate the array once, and for each element check if (target − element) exists in the map; if yes, record the pair, otherwise insert the element. This runs in O(n) time and O(n) space, far better than the naive O(n²) nested loop. Handle edge cases: duplicates (track indices, not just values), negative numbers, and whether the same element can be used twice based on the problem constraints.',
          },
          {
            duration: '15 minutes',
            category: 'Trees',
            text: 'Implement a function to find the lowest common ancestor of two nodes in a binary tree.',
            modelAnswer: 'Use recursive DFS: if the current node is null or equals p or q, return it. Recursively search the left and right subtrees; if both return non-null, the current node is the LCA since p and q are in different subtrees. If only one side returns non-null, propagate that value upward — this handles the case where one target is an ancestor of the other. Time complexity is O(n), space is O(h) where h is tree height.',
          },
          {
            duration: '15 minutes',
            category: 'Graphs',
            text: 'Given a directed graph, detect all cycles and return the nodes involved in each cycle.',
            modelAnswer: 'Use DFS with three-color marking: white (unvisited), grey (in current DFS path), black (fully processed). If DFS encounters a grey node, a back edge is detected — a cycle exists. Track the current DFS path in a stack; when the back edge is found, unwind the stack from the grey node to collect all cycle members. This runs in O(V + E) time and correctly handles graphs with multiple independent cycles.',
          },
        ],
      },
      {
        name: 'System Design',
        duration: '45 minutes',
        description: 'Design scalable distributed systems — focus on trade-offs, reliability, and scalability patterns used at Google.',
        questions: [
          {
            duration: '15 minutes',
            category: 'Architecture',
            text: 'Design Google Drive — file storage, sharing, real-time collaboration, and versioning across billions of users.',
            modelAnswer: 'Metadata (file hierarchy, permissions, version history) lives in a distributed SQL store (Spanner); actual bytes are stored in GCS with chunked resumable uploads for large files. Real-time collaboration uses Operational Transformation synchronized through a WebSocket hub per document, with a conflict-resolution service merging concurrent edits. Version history is append-only with content-hash deduplication reducing storage by ~40% across similar documents.',
          },
          {
            duration: '15 minutes',
            category: 'Scalability',
            text: 'How would you design a URL shortener like bit.ly to handle 1 billion requests per day?',
            modelAnswer: 'Hash the long URL to a 6-character base62 string (58 billion possible keys), store the mapping in Redis for hot URLs and Cassandra for cold storage. A CDN layer serves popular URL redirects without hitting the origin, delivering sub-5ms response times globally. Use 301 for permanent links (browser-cached) and 302 for analytics tracking (server-logged), with rate limiting at ingestion to prevent abuse.',
          },
          {
            duration: '15 minutes',
            category: 'Database',
            text: 'Design the database schema for a social media platform supporting posts, likes, comments, and follows at scale.',
            modelAnswer: 'Core tables: users, posts (user_id FK, content, timestamp), likes (user_id + post_id composite PK), comments (post_id, user_id, content), follows (follower_id, followee_id). Index posts on (user_id, created_at DESC) for timeline queries. Pre-compute a denormalized feed table for users with millions of followers (the celebrity problem) to avoid fan-out read explosions. Shard posts by user_id hash for horizontal scale.',
          },
        ],
      },
      {
        name: 'Behavioral & Leadership',
        duration: '30 minutes',
        description: 'Assess teamwork, communication, and leadership qualities aligned with Google\'s culture of ownership and collaboration.',
        questions: [
          {
            duration: '10 minutes',
            category: 'Behavioral',
            text: 'Tell me about a project you\'re most proud of. What was your specific contribution and measurable impact?',
            modelAnswer: 'My proudest project was rebuilding our recommendation service — I owned the ML pipeline, A/B test design, and production rollout for a 3-person team. The new model increased CTR by 18% and reduced P99 latency from 300ms to 45ms, generating $2M in additional annualized revenue. The most important thing I learned was how to instrument production systems for rapid feedback: having dashboards live before the feature shipped let us iterate confidently in the first week.',
          },
          {
            duration: '10 minutes',
            category: 'Conflict',
            text: 'Describe a time you disagreed with your tech lead\'s technical decision. How did you handle it constructively?',
            modelAnswer: 'My tech lead wanted to use NoSQL for a feature I felt needed strong consistency guarantees. I prepared a document with failure scenarios, data loss probability estimates under eventual consistency, and a proposed PostgreSQL alternative with benchmarks showing comparable latency. After a 30-minute review session, we agreed on a hybrid: NoSQL for non-critical metadata, PostgreSQL for the transactional core. The key was bringing data to the conversation rather than opinions.',
          },
          {
            duration: '10 minutes',
            category: 'Growth',
            text: 'What\'s the hardest technical problem you\'ve solved? Walk me through your full thought process.',
            modelAnswer: 'The hardest problem I solved was diagnosing a 200ms P99 latency spike that appeared randomly in production but never reproduced locally. I traced it to thread pool starvation caused by a third-party library holding locks during slow DNS lookups under high concurrency. The fix was a 3-line change wrapping the call in a dedicated thread pool, but the diagnosis took 2 weeks of distributed tracing, heap profiling, and coordinating with the library maintainers to confirm the root cause.',
          },
        ],
      },
    ],
  },
  {
    company: 'Google',
    role: 'Product Manager',
    slug: 'google-product-manager',
    prepCount: 180,
    salaryRange: '20L – 35L',
    logoColor: 'bg-blue-500',
    logoInitial: 'G',
    category: 'PRODUCT',
    section: 'GLOBAL_TECH',
    rounds: [
      {
        name: 'Product Sense',
        duration: '30 minutes',
        description: 'Evaluates how you think about product problems, user needs, and success metrics — the heart of Google\'s PM interview.',
        questions: [
          {
            duration: '10 minutes',
            category: 'Product Design',
            text: 'How would you improve Google Maps for elderly users? Define the problem, user needs, and your solution.',
            modelAnswer: 'Elderly users\' top jobs-to-be-done are navigating safely on foot, reading directions clearly, and getting help when lost. I\'d propose a Senior Mode toggle: larger fonts, high-contrast map layers, simplified step-by-step voice guidance with no jargon, and a one-tap "Share my location" button with emergency contacts pre-set. The primary success metric is 7-day retention among users aged 65+, targeting a 20% lift within 6 months of launch.',
          },
          {
            duration: '10 minutes',
            category: 'Metrics',
            text: 'What metrics would you use to measure the success of Google Assistant? What would concern you most?',
            modelAnswer: 'The north star metric is Task Completion Rate — the percentage of requests where the user achieved their goal without rephrasing. Supporting metrics are Intent Accuracy (correct intent detected?), Abandonment Rate (user stopped mid-interaction), and post-session CSAT. I would be most concerned if Task Completion Rate dropped while Query Volume stayed flat — that signals the model is degrading on the same request types, which is a silent quality regression.',
          },
          {
            duration: '10 minutes',
            category: 'Trade-offs',
            text: 'Google is considering adding ads to Gmail search results. Walk me through your full analysis of this decision.',
            modelAnswer: 'I\'d evaluate this against three levers: ad revenue potential, CSAT impact, and competitive risk (users switching to Outlook or Hey). I\'d recommend a controlled experiment with strict relevance filters on a 1% user segment, gating wider rollout on a measured CSAT floor of 4.2/5.0 and a churn rate increase below 0.1%. If the experiment shows CSAT declining below threshold, the revenue upside doesn\'t justify eroding Gmail\'s value proposition as a productivity tool.',
          },
        ],
      },
      {
        name: 'Analytical Thinking',
        duration: '30 minutes',
        description: 'Tests your ability to use data and structured reasoning to drive product decisions at Google scale.',
        questions: [
          {
            duration: '10 minutes',
            category: 'Data Analysis',
            text: 'Google Search CTR dropped 10% last week. Walk me through exactly how you would investigate this.',
            modelAnswer: 'First I\'d segment the drop: is it uniform across all query types, devices, and countries, or concentrated in one slice? If concentrated, that narrows the cause quickly. Next, check for external events: algorithm update, competitor launch, or a major news event shifting query intent. Finally, distinguish a reach problem (impressions fell too) from a relevance problem (impressions held but users stopped clicking) — the fix differs completely between the two.',
          },
          {
            duration: '10 minutes',
            category: 'A/B Testing',
            text: 'How would you design an A/B test to validate a new feature in Google Photos? What are the key considerations?',
            modelAnswer: 'Define the primary metric (feature adoption at D7) and guardrail metrics (session duration, crash rate, retention). Split 50/50 on a random user sample stratified by platform and usage tier, run for at least 2 weeks to capture weekly usage cycles. Ship if the variant shows ≥5% lift with p < 0.05 and no negative movement in any guardrail metric. Key consideration: Photos has heavy engagement variance by season — run the test across a neutral period to avoid confounding.',
          },
          {
            duration: '10 minutes',
            category: 'Estimation',
            text: 'Estimate the number of Google Docs opened per day globally. Show your full reasoning.',
            modelAnswer: 'Google has ~1.5B monthly active workspace users; assume 10% are daily Docs users = 150M DAU. Average user opens 2 documents per day, but the top 20% (heavy users) open 5+, giving a blended average of ~2.5 opens/user/day = 375M docs opened per day. Sanity check: Google has stated 1B active Drive users and Docs represents ~30% of Drive activity, which yields 300M — consistent with our estimate. I\'d round to 300–400M as the stated range.',
          },
        ],
      },
    ],
  },
  // ── Zomato ────────────────────────────────────────────────────────────────
  {
    company: 'Zomato',
    role: 'Product Manager',
    slug: 'zomato-product-manager',
    prepCount: 145,
    salaryRange: '18L – 28L',
    logoColor: 'bg-red-500',
    logoInitial: 'Z',
    category: 'PRODUCT',
    section: 'INDIAN_STARTUPS',
    rounds: [
      {
        name: 'Product Sense Round',
        duration: '25 minutes',
        description: 'Tests your ability to think like a PM — understanding user needs, defining problems, and prioritizing features in a fast-paced food-tech environment.',
        questions: [
          {
            duration: '8 minutes',
            category: 'Product Design',
            text: 'Design a feature for Zomato that improves the experience for users who frequently order late at night.',
            modelAnswer: 'Late-night users (10PM–2AM) are tired, time-pressed, and want minimal decision friction. I\'d build a "Night Mode" toggle: curated late-night menu showing only restaurants currently open with fast delivery estimates, an AI-prefilled "Order Again" with their most frequent late-night choice, and a one-tap reorder. Success metric: repeat order conversion rate for users ordering between 10PM–2AM, targeting a 15% lift.',
          },
          {
            duration: '8 minutes',
            category: 'Prioritization',
            text: 'You have a backlog of 20 features. How do you prioritize them? Describe your framework with a concrete example.',
            modelAnswer: 'I use an Impact × Confidence ÷ Effort score for each feature, then overlay user need frequency and strategic fit. For Zomato specifically, I weight delivery experience improvements over discovery improvements, since retention drivers outweigh acquisition at this scale. I present the top 5 to stakeholders with trade-off notes, align on quarterly bets in a planning session, and protect the roadmap from reactive requests by requiring a data threshold to add unplanned work.',
          },
          {
            duration: '9 minutes',
            category: 'User Research',
            text: 'How would you identify why users who tried Zomato Gold cancelled their subscription after 2 months?',
            modelAnswer: 'I\'d combine exit surveys (stated reason) with behavioral cohort analysis: usage frequency before cancellation, order cadence, discount utilization rate, and restaurant access in their area. My top hypotheses are value perception (too expensive for their usage frequency), content gap (restaurants near them aren\'t on Gold), or a lifecycle event (moved city). A retention offer targeting high-usage churners with a personalized discount would be the first intervention to validate hypothesis 1.',
          },
        ],
      },
      {
        name: 'Analytical & Execution',
        duration: '30 minutes',
        description: 'Assesses how you use data and execute on product decisions in a high-ownership startup environment.',
        questions: [
          {
            duration: '10 minutes',
            category: 'Metrics',
            text: 'What\'s the one metric you would use to measure Zomato\'s delivery partner satisfaction? Defend your choice.',
            modelAnswer: 'I\'d use Earnings Consistency Score — the percentage of partners who earn within 10% of their expected hourly rate on any given shift. Partners primarily churn due to income unpredictability, not just low pay, so this metric captures the core pain better than a simple average earnings or NPS. Supporting metrics are on-time payment rate and in-app support ticket volume, but the consistency score is the one I\'d put on the CEO dashboard.',
          },
          {
            duration: '10 minutes',
            category: 'Root Cause Analysis',
            text: 'Zomato\'s order completion rate dropped 8% in Delhi NCR this week. How do you investigate and respond?',
            modelAnswer: 'I\'d build a hypothesis tree splitting demand-side (fewer users checking out) from supply-side (restaurants offline, partners unavailable) failures. Segment by time of day, zone, and restaurant category to isolate where the drop concentrates. For Delhi NCR specifically, my first hypothesis is a weather event or a competitor promotional campaign — I\'d validate with weather API data and check App Store reviews mentioning competitors before escalating.',
          },
          {
            duration: '10 minutes',
            category: 'Roadmap',
            text: 'Build a 6-month roadmap for Zomato\'s "Zomato Live" event discovery feature. What would you focus on first?',
            modelAnswer: 'Months 1–2: core discovery (event listings, venue pages, ticket booking integration). Months 3–4: personalization (recommendations based on music preferences and past bookings) and a social layer (see which friends are attending). Months 5–6: creator tools for venues (analytics, promotional levers). North star metric: monthly ticketed events sold through the Zomato platform, with a 6-month target of 50,000 tickets/month.',
          },
        ],
      },
      {
        name: 'Behavioral Round',
        duration: '20 minutes',
        description: 'Evaluates leadership, collaboration, and alignment with Zomato\'s high-ownership, high-accountability culture.',
        questions: [
          {
            duration: '7 minutes',
            category: 'Leadership',
            text: 'Tell me about a time you owned a product failure. What happened and what did you change because of it?',
            modelAnswer: 'I owned a checkout redesign that reduced completion rate by 3% before we caught it — a button placement change buried the "Apply Coupon" step. I presented the data transparently to leadership within 24 hours, ran a hotfix within 48 hours, and wrote a post-mortem that went to the entire product org. The process change: we now ship all UI changes to 1% of users first and monitor funnel metrics for 48 hours before broad rollout.',
          },
          {
            duration: '6 minutes',
            category: 'Stakeholders',
            text: 'How do you handle disagreements between engineering and business stakeholders on feature scope?',
            modelAnswer: 'When engineering pushed to defer a P2 bug causing 5% of order failures, I presented the business math: 5% × 2M daily orders × ₹50 average order value = ₹5M daily revenue impact. Engineering agreed to schedule the fix in the next sprint with a dedicated refactor budget. The framework I use is: translate every technical decision into a business number, make the cost of inaction concrete, and give engineering ownership of the solution — not just the problem.',
          },
          {
            duration: '7 minutes',
            category: 'Impact',
            text: 'What\'s the most impactful product decision you\'ve made? How did you measure the impact?',
            modelAnswer: 'Switching the homepage hero from a promotional banner to a personalized feed — risky because promotions drove significant GMV. I ran a 4-week A/B test and the personalized feed increased D7 retention by 8% and overall order frequency by 12%, generating ₹40 crore additional GMV in the first quarter. The lesson was that long-term retention value massively outweighs short-term promotional lift, a principle I now apply to every placement trade-off decision.',
          },
        ],
      },
    ],
  },
  {
    company: 'Zomato',
    role: 'Data Analyst',
    slug: 'zomato-data-analyst',
    prepCount: 98,
    salaryRange: '8L – 14L',
    logoColor: 'bg-red-500',
    logoInitial: 'Z',
    category: 'DATA',
    section: 'INDIAN_STARTUPS',
    rounds: [
      {
        name: 'SQL & Data Fundamentals',
        duration: '30 minutes',
        description: 'Tests ability to query, analyze, and interpret data using SQL and statistical thinking in a food delivery context.',
        questions: [
          {
            duration: '10 minutes',
            category: 'SQL',
            text: 'Write a SQL query to find the top 3 restaurants in each city by average rating with at least 100 orders last month.',
            modelAnswer: 'SELECT city, restaurant_name, avg_rating FROM (SELECT city, restaurant_name, AVG(rating) AS avg_rating, RANK() OVER (PARTITION BY city ORDER BY AVG(rating) DESC) AS rnk FROM orders JOIN restaurants USING (restaurant_id) WHERE order_date >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY) GROUP BY city, restaurant_name HAVING COUNT(*) >= 100) t WHERE rnk <= 3. Key detail: the HAVING filter must run before the window function to exclude low-volume restaurants that would otherwise skew rankings.',
          },
          {
            duration: '10 minutes',
            category: 'Analysis',
            text: 'How would you analyze whether a new restaurant onboarding flow is performing better than the old one?',
            modelAnswer: 'Define the primary metric (onboarding completion rate) and set a statistical significance threshold (p < 0.05). Compare the two cohorts over a matched 30-day period, controlling for confounders like restaurant density in the user\'s area and the day-of-week they started. A 10% lift in completion rate with no negative impact on 7-day first-order activation would be the success bar, and I\'d present the result as a confidence interval, not a point estimate.',
          },
          {
            duration: '10 minutes',
            category: 'Statistics',
            text: 'Explain the difference between correlation and causation with a Zomato delivery example.',
            modelAnswer: 'Areas with more delivery partners show higher user ratings — both are driven by demand density, not a causal link between partner count and ratings. To test for causation I\'d look for a natural experiment: when Zomato expanded partner supply in a specific zone while holding demand constant, did ratings increase? Without a controlled intervention, we can claim co-variance but not causation — an important distinction when recommending operational policy changes.',
          },
        ],
      },
      {
        name: 'Product Analytics Case',
        duration: '25 minutes',
        description: 'A case study round where you analyze product data and make data-backed recommendations for Zomato.',
        questions: [
          {
            duration: '8 minutes',
            category: 'Case Study',
            text: 'Zomato Pro membership renewals are down 15% this quarter. Analyze possible causes and recommend actions.',
            modelAnswer: 'I\'d segment churners vs renewers by usage cohort: high-usage churners (≥4 orders/month) signal a value perception problem; low-usage churners (< 1 order/month) are an engagement failure. Cross-reference with benefit utilization rate and NPS at renewal time. Intervention: personalized re-engagement emails with a usage recap for low-usage churners; a pricing test for high-usage churners who see the value but find it too expensive.',
          },
          {
            duration: '8 minutes',
            category: 'Funnel Analysis',
            text: 'Describe how you would analyze the checkout funnel to identify the highest drop-off point.',
            modelAnswer: 'Map each funnel step: restaurant landing → cart → coupon → address confirmation → payment → confirmation. Track drop-off percentage at each step by session, segmented by platform (iOS/Android/web) and order value tier. For Zomato, the highest drop-off is typically at the payment step — I\'d drill into payment failure rates by provider and UPI vs card splits to identify whether it\'s a UX or payment infrastructure issue.',
          },
          {
            duration: '9 minutes',
            category: 'Dashboard Design',
            text: 'Design a dashboard for Zomato\'s city managers to monitor real-time delivery performance.',
            modelAnswer: 'Core metrics: live order volume by zone, delivery time P50 and P90, partner availability heatmap, and restaurant acceptance rate. Built in Metabase with 60-second auto-refresh and zone-level drill-down. Alert thresholds send a Slack notification when delivery P90 exceeds 45 minutes in any zone. The dashboard loads in under 2 seconds using materialized views refreshed every 30 seconds on the underlying data warehouse.',
          },
        ],
      },
    ],
  },
  {
    company: 'Zomato',
    role: 'Backend Engineer',
    slug: 'zomato-backend-engineer',
    prepCount: 120,
    salaryRange: '12L – 20L',
    logoColor: 'bg-red-500',
    logoInitial: 'Z',
    category: 'TECH',
    section: 'INDIAN_STARTUPS',
    rounds: [
      {
        name: 'Technical Screening',
        duration: '20 minutes',
        description: 'Basic technical screening covering data structures, system knowledge, and backend fundamentals for Zomato\'s Go-heavy stack.',
        questions: [
          {
            duration: '7 minutes',
            category: 'DSA',
            text: 'Implement an LRU cache with O(1) get and put operations. Walk through both the data structure and the code.',
            modelAnswer: 'Use a HashMap for O(1) lookup combined with a doubly-linked list for O(1) insertion and deletion. On get(), move the accessed node to the head (most recent); on put(), insert at the head and evict the tail node if at capacity. In Python, collections.OrderedDict gives this natively; in Java, LinkedHashMap with accessOrder=true is the standard approach. The HashMap stores node references, not values, enabling O(1) list manipulation.',
          },
          {
            duration: '6 minutes',
            category: 'Database',
            text: 'What indexes would you create for a table storing 500 million food orders? Justify your choices.',
            modelAnswer: 'Composite index on (user_id, created_at DESC) for "my orders" queries; index on (restaurant_id, status) for restaurant-side order management; index on (delivery_partner_id, created_at) for partner history. I avoid single-column indexes on high-cardinality columns — composite indexes aligned to actual query patterns provide far better selectivity. I\'d also partition the table by month for faster range scans and cheaper backups as the table crosses 1TB.',
          },
          {
            duration: '7 minutes',
            category: 'API Design',
            text: 'Design a RESTful API for Zomato\'s restaurant menu management system. Include versioning strategy.',
            modelAnswer: 'Core endpoints: GET /v1/restaurants/{id}/menu, POST /v1/menu-items, PUT /v1/menu-items/{id}, DELETE /v1/menu-items/{id}, PATCH /v1/menu-items/{id}/availability. Version with /v1/ prefix in the URL — simple, cacheable, and backward-compatible. Return 422 with field-level error details on validation failure, use ETag headers for cache consistency on menu reads, and enforce idempotency keys on all write operations.',
          },
        ],
      },
      {
        name: 'System Design',
        duration: '45 minutes',
        description: 'Design scalable backend systems for Zomato\'s high-traffic food delivery platform.',
        questions: [
          {
            duration: '20 minutes',
            category: 'Architecture',
            text: 'Design Zomato\'s order management system to handle 2 million orders per day at peak. Address state management across services.',
            modelAnswer: 'Event-driven architecture with Kafka: order creation → payment service → kitchen service → delivery matching → tracking. Each service owns its state in a dedicated database (PostgreSQL for transactional services, Redis for real-time order status). A Saga pattern handles distributed transactions — if payment fails, a compensation event cancels the order across all downstream services, ensuring consistency without a distributed transaction lock.',
          },
          {
            duration: '15 minutes',
            category: 'Real-time',
            text: 'How would you design real-time order tracking that shows a rider\'s location to the customer every 5 seconds?',
            modelAnswer: 'Delivery partners send GPS updates every 5 seconds via a WebSocket connection to a location service that writes to Redis Geo. The customer\'s app subscribes to a WebSocket channel keyed by order_id; the server pushes updates when partner location changes by more than 50 metres. A Go-based push server can maintain 1M concurrent WebSocket connections on modest hardware, with horizontal scaling behind a Layer 4 load balancer.',
          },
          {
            duration: '10 minutes',
            category: 'Reliability',
            text: 'How do you design for fault tolerance when payment gateways fail during high-traffic periods?',
            modelAnswer: 'Implement a circuit breaker per payment provider: if error rate exceeds 5% over 60 seconds, open the circuit and route to a backup provider automatically. Use idempotency keys on all payment requests so retries are safe — the gateway deduplicates and returns the original response. Store payment attempt state in a Redis write-ahead log so in-flight transactions survive a service crash, enabling exactly-once processing on recovery.',
          },
        ],
      },
    ],
  },
  // ── Cisco ─────────────────────────────────────────────────────────────────
  {
    company: 'Cisco',
    role: 'Network Engineer',
    slug: 'cisco-network-engineer',
    prepCount: 88,
    salaryRange: '8L – 14L',
    logoColor: 'bg-blue-700',
    logoInitial: 'C',
    category: 'ENGINEERING',
    section: 'GLOBAL_MNCS',
    rounds: [
      {
        name: 'Networking Fundamentals',
        duration: '25 minutes',
        description: 'Evaluates foundational knowledge of networking protocols, OSI model, and Cisco-specific technologies expected for all network engineer roles.',
        questions: [
          {
            duration: '8 minutes',
            category: 'Protocols',
            text: 'Explain the difference between TCP and UDP. Give scenarios where you would choose one over the other in a production system.',
            modelAnswer: 'TCP guarantees delivery via connection setup (3-way handshake), acknowledgements, and retransmission — use it for HTTP, database queries, and file transfers where data integrity matters. UDP is connectionless with no delivery guarantee — use it for DNS queries, VoIP, and video streaming where low latency matters more than retransmission overhead. In production I use UDP for internal health-check probes and TCP for all transactional data flows, with application-level retry for critical UDP messages.',
          },
          {
            duration: '8 minutes',
            category: 'Routing',
            text: 'Compare OSPF and BGP. When would you use OSPF vs BGP in an enterprise network and why?',
            modelAnswer: 'OSPF is an interior gateway protocol designed for fast convergence within a single autonomous system — use it for campus or data center routing where you control all devices and need sub-second failover. BGP is the exterior gateway protocol for routing between autonomous systems — use it when connecting to the internet or to cloud providers (AWS Direct Connect, Azure ExpressRoute). I run OSPF internally for fast intra-DC routing and redistribute into BGP at the edge for external connectivity.',
          },
          {
            duration: '9 minutes',
            category: 'Troubleshooting',
            text: 'A user can\'t access the internet but can ping the default gateway. Walk me through your complete troubleshooting steps.',
            modelAnswer: 'The user has L3 connectivity, so the issue is above IP. First, test DNS: can they nslookup google.com? If DNS fails, verify the DNS server IP in the client config and test reachability to the DNS server. If DNS resolves but HTTP fails, check the client\'s proxy settings and test with curl — a curl failure pointing to connection refused suggests an ACL or NAT issue at the gateway; run "show ip nat translations" to confirm NAT is working.',
          },
        ],
      },
      {
        name: 'Protocol Deep Dive',
        duration: '35 minutes',
        description: 'Advanced round covering Cisco-specific protocols, VLANs, MPLS, and network security across enterprise deployments.',
        questions: [
          {
            duration: '12 minutes',
            category: 'VLAN',
            text: 'Design a VLAN architecture for a company with 3 departments (Engineering, Sales, HR) across 2 floors. Show your tagging strategy.',
            modelAnswer: 'Engineering: VLAN 10 (192.168.10.0/24), Sales: VLAN 20 (192.168.20.0/24), HR: VLAN 30 (192.168.30.0/24). Inter-VLAN routing on a Layer 3 switch (SVIs for each VLAN). Trunk ports carrying all VLANs with 802.1Q tagging connect the floor switches; access ports in each office are assigned to the appropriate VLAN with no tagging. ACLs between VLANs restrict HR data from Engineering and Sales, with a dedicated management VLAN 99 for network devices.',
          },
          {
            duration: '12 minutes',
            category: 'Security',
            text: 'How would you secure a Cisco router against unauthorized access and common attack vectors like MITM and ARP spoofing?',
            modelAnswer: 'Disable unused services (CDP on external interfaces, HTTP server, Telnet), enable SSH v2 only, and restrict VTY access to the management subnet via ACL. Use AAA with TACACS+ for centralized authentication and full command logging. Set exec-timeout 5 on all VTY lines, enable service password-encryption, configure Cisco IOS Firewall for stateful inspection, and use Dynamic ARP Inspection (DAI) on access switches to block ARP spoofing at the port level.',
          },
          {
            duration: '11 minutes',
            category: 'Optimization',
            text: 'A WAN link between two offices has high latency during business hours. How would you diagnose and remediate this?',
            modelAnswer: 'Start with baseline measurement: traceroute and continuous ping from both ends to identify where latency is introduced in the path. Check interface error counters for drops or CRC errors indicating physical degradation. If the issue is at the ISP, open a ticket with timestamped SLA evidence. If local, check QoS configuration — bulk traffic (backups, video conferencing) may be starving latency-sensitive apps. Implement DSCP marking and priority queuing to protect voice and critical application traffic.',
          },
        ],
      },
      {
        name: 'Behavioral & Culture Fit',
        duration: '20 minutes',
        description: 'Assesses teamwork, learning agility, and alignment with Cisco\'s culture of inclusion and innovation.',
        questions: [
          {
            duration: '7 minutes',
            category: 'Teamwork',
            text: 'Describe a time you had to work with a difficult stakeholder on a network migration project. How did you keep it moving?',
            modelAnswer: 'During a regulated bank migration, a compliance officer blocked our change window 2 hours before cutover due to documentation gaps. I immediately compiled the missing change approval forms, walked the officer through our rollback plan, and got sign-off 30 minutes later with only a 1-hour delay. Post-project I implemented a pre-change checklist requiring compliance sign-off 72 hours ahead — that change window has never been blocked since.',
          },
          {
            duration: '6 minutes',
            category: 'Learning',
            text: 'How do you stay current with new networking technologies and Cisco certifications (CCNA, CCNP, CCIE)?',
            modelAnswer: 'I maintain CCNP Enterprise certification with 3-year renewal cycles and complete one Cisco DevNet module per month. I follow the RIPE NCC routing security updates for BGP best practices and Cisco\'s networking blog for platform announcements. Each quarter I spin up an EVE-NG lab to test a new feature before recommending it to clients — currently working through Cisco DNA Center API automation and Catalyst 9000 ETA (Encrypted Traffic Analytics).',
          },
          {
            duration: '7 minutes',
            category: 'Problem-Solving',
            text: 'Tell me about the most complex network issue you\'ve resolved. Walk me through your diagnosis and resolution process.',
            modelAnswer: 'The most complex issue was a BGP route flap causing intermittent 30-second outages on a financial trading network with strict SLAs. Using Wireshark captures and Cisco EEM scripting to log BGP state changes, I identified a misconfigured hold timer causing routes to be withdrawn during brief interface congestion spikes. The fix was a 2-line config change to the hold timer and keepalive interval, but diagnosing it required 3 days of packet captures, NetFlow analysis, and coordination with the upstream ISP.',
          },
        ],
      },
    ],
  },
  {
    company: 'Cisco',
    role: 'Solutions Architect',
    slug: 'cisco-solutions-architect',
    prepCount: 65,
    salaryRange: '18L – 30L',
    logoColor: 'bg-blue-700',
    logoInitial: 'C',
    category: 'TECH',
    section: 'GLOBAL_MNCS',
    rounds: [
      {
        name: 'Technical Architecture',
        duration: '40 minutes',
        description: 'Evaluates ability to design enterprise networking and cloud solutions for Cisco customers across hybrid environments.',
        questions: [
          {
            duration: '14 minutes',
            category: 'Cloud Networking',
            text: 'Design a hybrid cloud network for a bank connecting on-premise data centers to AWS and Azure with sub-5ms latency.',
            modelAnswer: 'Connect on-premise DCs to AWS via AWS Direct Connect (dedicated 10Gbps) and to Azure via ExpressRoute, both terminating on Cisco ASR routers at the DC edge. Use Cisco SD-WAN to create a unified fabric across all sites with centralized policy management from vManage. BGP redistributes routes between private connections and the SD-WAN overlay; traffic policy routes latency-sensitive workloads (trading systems) over Direct Connect and internet-tolerant workloads over cheaper broadband paths.',
          },
          {
            duration: '13 minutes',
            category: 'SD-WAN',
            text: 'When would you recommend Cisco SD-WAN over MPLS for a multi-branch enterprise? What are the key trade-offs?',
            modelAnswer: 'MPLS offers guaranteed QoS and SLA-backed latency — retain it for the hub-to-DC core where SLAs are contractually required. Cisco SD-WAN over broadband/LTE costs 60–80% less, provides application-aware routing, and delivers unified policy management from a single dashboard — ideal for branches with variable traffic profiles and budget pressure. I recommend SD-WAN for all branch-to-internet traffic and new branch openings, with MPLS maintained only for the primary hub-to-DC connection.',
          },
          {
            duration: '13 minutes',
            category: 'Security',
            text: 'Design a Zero Trust network architecture for a 5,000-employee company using Cisco\'s security portfolio.',
            modelAnswer: 'Layer 1 — Identity: enforce MFA and certificate-based device trust using Cisco Duo and ISE for posture validation before network access. Layer 2 — Network: micro-segment with Cisco TrustSec SGTs so Engineering, Finance, and HR segments require explicit policy to communicate. Layer 3 — Workload: use Cisco Tetration for workload visibility and east-west traffic policy enforcement. All access decisions are logged to Cisco Stealthwatch for anomaly detection with automated quarantine on suspicious lateral movement.',
          },
        ],
      },
      {
        name: 'Customer Scenario',
        duration: '30 minutes',
        description: 'Role-play a customer engagement to evaluate consultative selling, technical communication, and solution framing.',
        questions: [
          {
            duration: '10 minutes',
            category: 'Consultative',
            text: 'A CTO is concerned about ROI of upgrading from legacy routers to Cisco Catalyst 9000 series. How do you frame the value proposition?',
            modelAnswer: 'I anchor the ROI conversation on three pillars: operational savings (automated provisioning reduces manual config time by 70%, freeing 2 FTE), security ROI (built-in ETA detects threats in encrypted traffic without decryption, replacing a $500K security appliance), and business continuity (Catalyst 9000\'s 3-nines SLA reduces unplanned downtime cost). I build a 3-year TCO model showing break-even at approximately 18 months for 500-device deployments.',
          },
          {
            duration: '10 minutes',
            category: 'Objection Handling',
            text: 'A customer says they want to use open-source routing (FRRouting) instead of Cisco. How do you respond without being dismissive?',
            modelAnswer: 'I acknowledge FRRouting\'s strengths — hyperscaler-proven and no licensing cost — then shift the conversation to total cost of ownership. FRR requires 2 dedicated FTE minimum for configuration, debugging, and maintenance; Cisco IOS XE with DNA Center provides a supported platform with 24/7 TAC and a 4-hour hardware replacement SLA. For a bank with strict change-control and audit requirements, the support contract and compliance documentation reduce risk more than licensing savings justify.',
          },
          {
            duration: '10 minutes',
            category: 'Requirements',
            text: 'Walk me through how you would gather and prioritize requirements for a campus network redesign project.',
            modelAnswer: 'Three-phase discovery: stakeholder interviews (network ops, security, application owners, CIO) to understand business drivers and pain points; current-state assessment (topology audit, traffic analysis, capacity utilization); and future-state workshops to define the desired architecture and prioritize requirements. Deliverables are a Current State Report, a Prioritized Requirements Document, and a High-Level Design brief presenting 3 architecture options with trade-offs — approved by the steering committee before detailed design begins.',
          },
        ],
      },
    ],
  },
  // ── Apple (Head of QA — full rounds) ─────────────────────────────────────
  {
    company: 'Apple',
    role: 'Head of QA',
    slug: 'apple-headofqa',
    prepCount: 74,
    salaryRange: '35L – 60L',
    logoColor: 'bg-gray-700',
    logoInitial: 'A',
    category: 'TECH',
    section: 'GLOBAL_TECH',
    rounds: [
      {
        name: 'Initial Screening & Leadership Acumen',
        duration: '30 minutes',
        description: 'Evaluates your experience leading quality organizations and your ability to set strategy, drive culture, and make difficult calls under pressure.',
        questions: [
          {
            duration: '5 minutes',
            category: 'Leadership Experience',
            text: 'Describe your experience leading quality teams, including the size and structure of those teams. What were some key challenges you faced?',
            modelAnswer: 'Leading a 40-person QA organization across 3 product lines, I restructured from a centralized testing model into squads aligned to feature teams, embedding 2 QEs per squad to shorten feedback loops from 2 weeks to 2 days. This cut bug escape rate by 35% in 2 quarters. The hardest challenge was the cultural shift — some QEs resisted moving from "testing at the end" to continuous quality ownership throughout the sprint, which required deliberate coaching and a change in performance metrics.',
          },
          {
            duration: '5 minutes',
            category: 'Technical Acumen',
            text: 'How have you fostered a culture of innovation within your QA teams to continually improve testing processes?',
            modelAnswer: 'I run quarterly Quality Hackathons where engineers propose new automation tools, metrics, or strategies — the best ideas receive 1 sprint of engineering time to prototype. I also introduced blameless postmortems for every escaped bug, converting shame into shared learning. The outcome was 3 internally-built tools (a visual regression diff system, a flakiness dashboard, and a test impact analysis service) that became standard across all product teams.',
          },
          {
            duration: '5 minutes',
            category: 'Communication & Influence',
            text: 'Describe a situation where you had to make a difficult decision regarding quality vs schedule. How did you approach it?',
            modelAnswer: 'When a VP pushed to ship a feature with 5 known P2 bugs to make a trade show deadline, I prepared a one-page risk assessment: probability of customer impact, estimated support cost if we shipped, and reputational risk given Apple\'s quality standard. We agreed to ship with 3 of the 5 bugs fixed and defer the other 2 to a point release with a known-issues brief for internal reviewers. The decision was data-driven and owned jointly — not a unilateral quality veto — which maintained the relationship and the trust.',
          },
        ],
      },
      {
        name: 'Technical Deep Dive & System Design',
        duration: '30 minutes',
        description: 'Evaluates your hands-on technical depth in testing methodologies, automation architecture, and quality strategy at Apple\'s scale.',
        questions: [
          {
            duration: '5 minutes',
            category: 'Technical Knowledge',
            text: 'Describe your experience with black-box, white-box, and gray-box testing. How do you choose which to apply?',
            modelAnswer: 'Black-box tests validate behavior without code knowledge — ideal for acceptance testing and regression suites owned by QA. White-box tests validate internal logic — used for unit tests written by developers during implementation. Gray-box sits between: the tester knows the architecture but not the implementation, useful for integration testing and API contract validation. I choose based on risk: black-box for user-facing flows, white-box for complex business logic, gray-box for cross-service boundaries where I need to validate interfaces without owning the internals.',
          },
          {
            duration: '5 minutes',
            category: 'Problem-Solving',
            text: 'Explain regression testing strategies in a fast-paced environment with frequent releases.',
            modelAnswer: 'I use risk-based test selection: rank tests by defect detection history and feature change frequency, then run only the top-risk tests in the daily CI cycle. Full regression runs on release candidates only. Combined with test impact analysis (only tests covering changed code paths run per PR), CI time dropped from 45 minutes to 8 minutes without reducing defect coverage. Flaky tests are quarantined immediately — a flaky test in the mandatory suite is worse than no test because it erodes team trust in the signal.',
          },
          {
            duration: '5 minutes',
            category: 'System Design',
            text: 'Describe your experience with test automation frameworks. What factors guide your selection?',
            modelAnswer: 'I evaluate frameworks on four criteria: language alignment with the engineering team (reduces friction and enables collaboration), community maturity (LTS support, rich plugin ecosystem), CI/CD integration (Docker support, parallelization, built-in reporting), and maintainability (Page Object Model support, readability for non-QA engineers). For web I\'ve standardized on Playwright; for iOS, XCTest; for Android, Espresso; with Appium as a cross-platform fallback. The framework that engineers actually contribute to beats the one with the best feature list.',
          },
        ],
      },
      {
        name: 'Behavioral & Apple Values Alignment',
        duration: '30 minutes',
        description: 'Assesses cultural alignment with Apple\'s values: craftsmanship, privacy-first design, user-centric quality, and collaborative excellence.',
        questions: [
          {
            duration: '5 minutes',
            category: 'Cultural Fit',
            text: 'Why are you interested in working at Apple and what aspects of Apple\'s culture resonate with you?',
            modelAnswer: 'Apple\'s commitment to privacy-first design and the integration of hardware and software to create seamless user experiences aligns deeply with how I think about quality — not as a phase at the end, but as a design principle embedded from the first user story. I\'ve studied how Apple\'s QA culture holds a different standard: every bug that ships is a broken promise to the user, not a known limitation. I want to help protect that standard at the organization level.',
          },
          {
            duration: '5 minutes',
            category: 'Teamwork',
            text: 'Describe a time you worked with a cross-functional team to accomplish a complex goal. What role did you play?',
            modelAnswer: 'During an iOS release with 3 teams (Platform, Apps, Hardware) owning overlapping features, I drove weekly cross-team quality syncs and created a shared defect triage backlog with clear ownership at the squad level. My role was quality integrator — I didn\'t own the fix, but I owned the coordination: tracking blockers, surfacing cross-team regressions early, and escalating misaligned priorities. The release shipped on schedule with the fewest customer-reported defects in the product\'s history.',
          },
          {
            duration: '5 minutes',
            category: 'Passion for Apple',
            text: 'Apple emphasizes user experience above all else. Describe your approach to ensuring products meet the highest user experience expectations.',
            modelAnswer: 'My approach starts at the requirements stage: I work with UX designers to add testable acceptance criteria to every user story before a line of code is written. For Apple-grade quality, I add usability sessions with real users on prototype builds, testing across the full range of device capabilities — accessibility modes, different screen sizes, low-power states, and offline scenarios. I also build automated visual regression tests using screenshot diffing to catch subtle layout regressions that functional tests miss entirely.',
          },
        ],
      },
    ],
  },
  // ── Additional stubs for landing page ─────────────────────────────────────
  {
    company: 'Meta',
    role: 'Frontend Engineer',
    slug: 'meta-frontend-engineer',
    prepCount: 280,
    salaryRange: '20L – 35L',
    logoColor: 'bg-blue-600',
    logoInitial: 'M',
    category: 'TECH',
    section: 'GLOBAL_TECH',
    rounds: [],
  },
  {
    company: 'Amazon',
    role: 'SDE II',
    slug: 'amazon-sde-ii',
    prepCount: 420,
    salaryRange: '18L – 30L',
    logoColor: 'bg-orange-500',
    logoInitial: 'A',
    category: 'TECH',
    section: 'GLOBAL_TECH',
    rounds: [],
  },
  {
    company: 'Microsoft',
    role: 'Program Manager',
    slug: 'microsoft-program-manager',
    prepCount: 190,
    salaryRange: '15L – 24L',
    logoColor: 'bg-green-600',
    logoInitial: 'M',
    category: 'PRODUCT',
    section: 'GLOBAL_TECH',
    rounds: [],
  },
  {
    company: 'Apple',
    role: 'iOS Engineer',
    slug: 'apple-ios-engineer',
    prepCount: 155,
    salaryRange: '22L – 40L',
    logoColor: 'bg-gray-700',
    logoInitial: 'A',
    category: 'TECH',
    section: 'GLOBAL_TECH',
    rounds: [],
  },
  {
    company: 'CRED',
    role: 'Product Manager',
    slug: 'cred-product-manager',
    prepCount: 112,
    salaryRange: '20L – 32L',
    logoColor: 'bg-purple-600',
    logoInitial: 'C',
    category: 'PRODUCT',
    section: 'INDIAN_STARTUPS',
    rounds: [],
  },
  {
    company: 'Zerodha',
    role: 'Backend Developer',
    slug: 'zerodha-backend-developer',
    prepCount: 78,
    salaryRange: '10L – 18L',
    logoColor: 'bg-teal-600',
    logoInitial: 'Z',
    category: 'TECH',
    section: 'INDIAN_STARTUPS',
    rounds: [],
  },
  {
    company: 'Swiggy',
    role: 'Software Engineer',
    slug: 'swiggy-software-engineer',
    prepCount: 134,
    salaryRange: '11L – 19L',
    logoColor: 'bg-orange-400',
    logoInitial: 'S',
    category: 'TECH',
    section: 'INDIAN_STARTUPS',
    rounds: [],
  },
  {
    company: 'Flipkart',
    role: 'Product Analyst',
    slug: 'flipkart-product-analyst',
    prepCount: 167,
    salaryRange: '12L – 20L',
    logoColor: 'bg-yellow-500',
    logoInitial: 'F',
    category: 'DATA',
    section: 'INDIAN_STARTUPS',
    rounds: [],
  },
  {
    company: 'Meesho',
    role: 'Full Stack Engineer',
    slug: 'meesho-full-stack-engineer',
    prepCount: 89,
    salaryRange: '10L – 16L',
    logoColor: 'bg-pink-500',
    logoInitial: 'M',
    category: 'TECH',
    section: 'INDIAN_STARTUPS',
    rounds: [],
  },
  {
    company: 'Salesforce',
    role: 'Solutions Engineer',
    slug: 'salesforce-solutions-engineer',
    prepCount: 72,
    salaryRange: '14L – 22L',
    logoColor: 'bg-sky-500',
    logoInitial: 'S',
    category: 'TECH',
    section: 'GLOBAL_MNCS',
    rounds: [],
  },
  {
    company: 'Oracle',
    role: 'Database Administrator',
    slug: 'oracle-database-administrator',
    prepCount: 91,
    salaryRange: '10L – 16L',
    logoColor: 'bg-red-600',
    logoInitial: 'O',
    category: 'TECH',
    section: 'GLOBAL_MNCS',
    rounds: [],
  },
  {
    company: 'SAP',
    role: 'SAP Consultant',
    slug: 'sap-sap-consultant',
    prepCount: 103,
    salaryRange: '12L – 20L',
    logoColor: 'bg-blue-800',
    logoInitial: 'S',
    category: 'CONSULTING',
    section: 'GLOBAL_MNCS',
    rounds: [],
  },
  {
    company: 'Adobe',
    role: 'UI Engineer',
    slug: 'adobe-ui-engineer',
    prepCount: 86,
    salaryRange: '15L – 24L',
    logoColor: 'bg-red-500',
    logoInitial: 'A',
    category: 'TECH',
    section: 'GLOBAL_MNCS',
    rounds: [],
  },
  {
    company: 'Accenture',
    role: 'Business Analyst',
    slug: 'accenture-business-analyst',
    prepCount: 204,
    salaryRange: '7L – 12L',
    logoColor: 'bg-purple-700',
    logoInitial: 'A',
    category: 'CONSULTING',
    section: 'GLOBAL_MNCS',
    rounds: [],
  },
];

export function getPrepBySlug(slug: string): PrepEntry | undefined {
  return PREP_DATA.find((p) => p.slug === slug);
}
