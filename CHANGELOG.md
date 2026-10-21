# Changelog

## Unreleased

- Turned on **self-hosted Umami analytics** (cookieless). The tracker loads from the owner's Umami instance over HTTPS through Tailscale Funnel, only on the live site; local previews are never counted. Bumped `main.js` to `v=2.0.3` on every page.

- Updated the site to the **19 October 2026 CV**: machine learning engineering student and degree, forward-deployed engineer (FDE) added to the roles sought, 9 projects, **Digital Twin Architecture Trainee** (09/2026 – present), a vocational diploma in Software Technology, and Finnish at a conversational level (CEFR A2), 20 ECTS.
- JobsResearch: built with a team of **8 AI agents** in builder, reviewer, verifier and coordinator roles under a written loop engineering process; the role line now reads "8-agent AI team manager".
- The presentation to Metropolia's President and CEO now records selection as the **only student** to present in the leadership session (Experience and the JobsResearch case study).
- Project role titles: CLboost "Frontend & DevOps Lead"; Fi-Job-Maps "full-stack developer & data engineer".
- Capabilities: added MCP, Codex, Google Cloud and MATLAB.
- Expanded **Capabilities** with skills the project pages already show: LLM fine-tuning (LoRA / QLoRA, PEFT, Hugging Face transformers, Unsloth, TRL), model evaluation against baselines, time-series forecasting, role-based AI agent teams, Claude Code, rule-based LLM guardrails, Prometheus, Portainer, GitHub, SQLAlchemy, data visualisation and Playwright E2E testing.
- Merged the Gemini, OpenAI and OpenRouter chips into one API chip that also lists Claude, and added a **Ways of working** group (project management, Agile / Scrum, security fundamentals, legacy-code documentation, architecture mapping, UML, i18n). Testing & Quality now lists testing only.
- Bumped `i18n.js` to `v=2.0.4` on every page.

- Updated the positioning to match the October 2026 CV: seeking a **junior or graduate position** as an AI engineer, backend or full-stack developer from January 2027 (homepage description and Contact, English and Finnish).
- Updated study progress on Experience to **171 / 240 ECTS** and added **expected graduation December 2026**. Removed the Contact thesis row, which conflicted with that date.
- Corrected the vocational diploma grade to 4.25 / 5.0.
- Described the Metropolia SW Factory work so far: repository clean-up, an architecture map, automated testing in CI and documentation for a project untouched for two years.
- Updated **JobsResearch**: 100,000+ postings from five sources since July 2026, 8,000+ analysed against a CV, LLM fit scores capped by deterministic eligibility rules, multi-user with Docker and PostgreSQL. The case study gains a "How it was built" section: a role-based AI agent team, ~4,700 commits and 1,500 merged pull requests (Aug–Oct 2026), and a Jenkins + SonarQube quality gate.
- Added the **October 2026 presentation to Metropolia's President and CEO** to Experience and the JobsResearch case study.
- Updated the Finnish language level to working level (CEFR A2), 20 ECTS.
- Re-derived project commit counts from GitHub: Fi-Job-Maps is now 45 of 45 and shows its 14 GitHub stars; the others are unchanged. Bumped `i18n.js` to `v=2.0.3` on every page.

- Added print styling, including expanded project entries and external link destinations.
- Added an email copy button with English/Finnish success and failure feedback.

- Added a custom **404 page** in the site style, with root-absolute URLs so it works at any path, `noindex`, and English/Finnish copy.
- Added `sitemap.xml` (every public page, with last-modified dates) and `robots.txt`.
- Corrected the About call to action to say the **four** featured projects.
- Lowercased the contact email address everywhere it appears.
- Tightened the spacing under the Work heading so the first project starts above the fold on short and mobile screens.
- Added **structured data** (schema.org `ProfilePage` / `Person`) to the homepage: name, job title, Metropolia, Helsinki and LinkedIn/GitHub profiles, so search engines can connect them.

## 2.0.0 — 2026-09-10

- Replaced the name-led opening with an animated **Think. Build. Ship.** composition and a small personal signature.
- Removed the repeated full name from the top bar and the three discipline shortcuts from the opening.
- Added a curved sliding navigation drawer and a homepage title index with image previews.
- Moved full section content into directly accessible static pages, preserving project context, contribution details and links.
- Added a draggable geographic globe for Shanghai, Bangkok and Helsinki, with city cards, local clocks and a static fallback.
- Added the self-hosted Linux lab as the fourth featured project, using the owner's dashboard screenshot and verified platform information.
- Added engineering notes, an interactive AI architecture walkthrough and an illustrative forecast sandbox.
- Improved English/Finnish coverage, keyboard navigation, image viewing, mobile layout and reduced-motion behavior.

The site remains a static GitHub Pages deployment. Existing contact and visit-counter integrations are retained. Geographic helpers and map data are bundled locally with their licenses.
