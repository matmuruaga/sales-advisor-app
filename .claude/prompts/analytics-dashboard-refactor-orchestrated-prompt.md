<Task>
You will coordinate three specialized subagents to refactor and enhance the existing **AnalyticsPage** of the SixthSense AI Sales Co-Pilot platform.
Execution order (strict, sequential handoff): 
1) business-strategist → 2) saas-ux-optimizer → 3) frontend-engineer.

Global goals:
- Make AnalyticsPage a decisive, high-signal dashboard for sales teams and leaders.
- Improve clarity, discoverability, and drill-down paths to action.
- Ensure performance, accessibility, and consistency with the platform’s design system and tech stack.

──────────────────────────────────────────────────────────────────────────────
Step 1 – business-strategist 
(Role: Experienced B2B SaaS strategist specialized in AI-powered sales tools)

Objectives:
- Define the highest-value analytics and dashboards for target personas (AE, SDR, Sales Manager, RevOps, Exec).
- Align metrics with business outcomes: activation, retention, pipeline health, forecast accuracy, deal velocity, win rate, coaching effectiveness.
- Recommend visualizations that communicate insight quickly and support drill-down to decisions.

Tasks:
1. Audit current dashboard intent and audience (assume current KPIs exist but may be noisy).
2. For each target persona, specify the top decisions they must make weekly/daily and the KPIs that unlock them.
3. Identify which metrics to keep, add, or remove; justify with decision-use cases (“so what, now what”).
4. Propose visualization types (trend, bar, stacked, heatmap, distribution, funnel, cohort) and drill-down paths.
5. Prioritize dashboards by business impact vs. effort.

Deliverable → <business_dashboard_spec>:
- Personas and their primary decisions.
- Dashboard list (ranked) with KPIs, definitions, and time windows.
- Recommended visualizations per dashboard and drill-down surfaces.
- Segmentation & filters (role, region, team, product line, date range).
- Keep/Add/Remove rationale (one-liner each).
- Success metrics (e.g., increased dashboard usage, shorter time-to-insight).

──────────────────────────────────────────────────────────────────────────────
Step 2 – saas-ux-optimizer 
(Role: Senior full-stack developer & UX expert for B2B SaaS sales enablement)

Objectives:
- Translate <business_dashboard_spec> into a concrete UX plan for **AnalyticsPage**.
- Preserve platform look & feel, improve information hierarchy, and ensure accessibility and responsiveness.

Tasks:
1. Define layout: header, filters/date range, KPI summary row, main charts grid, insights drawer/panel, empty/loading/error states.
2. Specify interaction flows: filtering, sorting, drill-down (panel/drawer), time range presets, export (if applicable).
3. Balance data density with readability; set chart legends, color scales, and tooltips rules.
4. Accessibility: WCAG 2.1 AA, keyboard navigation, ARIA labeling, color contrast ≥ 4.5:1, non-color cues.
5. Responsive: breakpoints and layout adjustments for desktop/tablet (and simplified mobile if applicable).
6. Performance hints: skeletons, virtualization where relevant, memoization points; loading/error messaging.

Deliverable → <ux_dashboard_plan>:
- Wireframe description (textual) and component map of AnalyticsPage.
- Layout grid and regions; placement of filters, KPIs, charts, insights drawer.
- Interaction notes (hover/click, drill-down, legends, tooltips, animations).
- Accessibility guidelines and color/legend specifications.
- Responsive breakpoints and behavior.
- Empty/loading/error/i18n states.

──────────────────────────────────────────────────────────────────────────────
Step 3 – frontend-engineer 
(Role: Senior frontend developer, expert in React/TypeScript and data visualization libraries like Recharts/D3/Chart.js)

Objectives:
- Implement the plan in the live codebase, **applying changes directly in `AnalyticsPage`**.
- **Create missing components/files** following project conventions.

Tasks:
1. Implement all updates in `AnalyticsPage` (preserve route/app shell).
2. If needed, **create components and utilities** under existing conventions (example paths):
   - `components/analytics/KpiStat.tsx`
   - `components/analytics/ChartCard.tsx`
   - `components/analytics/Legend.tsx`
   - `components/analytics/FiltersBar.tsx`
   - `components/analytics/InsightsDrawer.tsx`
   - `components/analytics/EmptyState.tsx`
   - `components/analytics/Skeletons.tsx`
   - `hooks/analytics/useAnalyticsData.ts`
   - `hooks/analytics/useFilters.ts`
   - `utils/analytics/formatters.ts`
   - `utils/analytics/mappers.ts`
3. Use the platform’s standard charting library; if none is standardized, propose Recharts with typed wrappers and accessibility props.
4. Ensure strong typing (TypeScript), modularity, and maintainability; follow linting/formatting and state management conventions.
5. Performance: memoization (`useMemo`, `React.memo`), selective re-renders, skeletons, debounced filters, and efficient data-fetching.
6. Accessibility & a11y testing: tab order, ARIA, focus states, keyboard interactions for charts/drawer, high-contrast mode support.
7. Testing & QA: add/expand unit tests (components/utils) and integration tests for filters, drill-down, empty/large/error data.
8. Documentation: component README or Storybook stories (if used), inline JSDoc/TSdoc, and migration notes.
9. Version control: commit in small, reviewable chunks; open PR(s) referencing this task and attach screenshots/GIFs.

Deliverable → <frontend_dashboard_implementation>:
- Summary of code changes (files created/modified, component tree).
- Library choices and justifications.
- Key code snippets (toggle filters, chart wrappers, drawer open/close, accessibility props).
- Performance tactics used.
- Testing plan and list of new/updated tests.
- **Git commit hashes and PR links**.

──────────────────────────────────────────────────────────────────────────────
Global Acceptance Criteria (apply to final result):
- All changes are applied in `AnalyticsPage` and compile with **zero TypeScript errors**.
- New components live under `components/analytics/*` (or the project’s equivalent) and follow naming/lint/testing standards.
- Charts are accessible (keyboard, ARIA, contrast) and performant on 1k+ records; filter interactions target <200ms perceived latency.
- Clear drill-down from high-level KPIs/charts to actionable insights (drawer/panel) without route reloads.
- Responsive layouts validated for desktop and tablet; mobile has a simplified, usable version (if required by product).
- Empty/loading/error states are implemented and consistent with the design system.
- Documentation and tests included; PR(s) reviewed and linked in the deliverables.

Final Output Requirements:
- business-strategist → <business_dashboard_spec>
- saas-ux-optimizer → <ux_dashboard_plan>
- frontend-engineer → <frontend_dashboard_implementation> (with applied changes in `AnalyticsPage` and any new files created as needed)
</Task>
