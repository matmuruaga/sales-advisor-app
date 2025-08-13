<Task>
You will coordinate three specialized subagents to design and implement a high-value **Reports** page for the SixthSense AI Sales Co-Pilot platform.  
The process must follow a sequential workflow:  
1. **business-strategist** → 2. **saas-ux-optimizer** → 3. **frontend-engineer**.

---

**Step 1 – business-strategist** (Experienced B2B SaaS strategist specialized in AI-powered sales tools):
- Analyze SixthSense's business model, target audience, and core value proposition.
- Identify the types of reports and KPIs that will deliver the highest business value to companies using the tool.
- Recommend data visualizations and report categories aligned with:
  * Sales performance tracking (individual & team)
  * Pipeline health and forecasting
  * Call engagement metrics (pre/during/post-call)
  * Deal velocity and win/loss analysis
  * Coaching effectiveness
- Justify why each report is valuable for decision-making and ROI.
- Output in `<business_report_spec>` block:
  * List of recommended reports
  * KPIs/metrics for each
  * Recommended visualization types (e.g., bar charts, trend lines, heatmaps)
  * Priority ranking

---

**Step 2 – saas-ux-optimizer** (Senior full-stack developer & UX expert specialized in B2B SaaS sales enablement):
- Take the `<business_report_spec>` and design the **visual implementation plan** for the Reports page.
- Ensure the design aligns with SixthSense's current UI style and design system.
- Define:
  * Layout and navigation structure
  * Interaction flows (filters, sorting, drill-downs)
  * Responsive behavior (desktop/tablet/mobile)
  * Accessibility compliance (WCAG 2.1 AA minimum)
  * Data density vs. readability balance
- Provide detailed wireframe description and UI copy guidelines.
- Output in `<ux_report_plan>` block:
  * Layout description
  * Interaction notes
  * Color coding/legend guidelines
  * Accessibility notes
  * Responsive breakpoints

---

**Step 3 – frontend-engineer** (Senior frontend developer expert in React/TypeScript, data visualization libraries like D3.js/Recharts/Chart.js, and performance optimization):
- Take the `<ux_report_plan>` and implement the Reports page.
- Follow SixthSense’s existing frontend architecture, coding standards, and technology stack.
- Ensure:
  * High performance for large datasets
  * Smooth transitions and animations where relevant
  * Modular, maintainable components
  * State management consistent with the platform
  * Cross-browser and responsive compatibility
- Output in `<frontend_report_implementation>` block:
  * Component breakdown and folder structure
  * Library/framework choices and justifications
  * Key code snippets or pseudocode
  * Performance optimization notes
  * Testing and QA checklist

---

**Final Output Requirements**:
- business-strategist → `<business_report_spec>`
- saas-ux-optimizer → `<ux_report_plan>`
- frontend-engineer → `<frontend_report_implementation>`
</Task>
