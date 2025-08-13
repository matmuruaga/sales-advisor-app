<Task>
You will coordinate two specialized subagents to deliver a complete UX-to-frontend implementation for a new feature in the SixthSense AI Sales Co-Pilot platform.

**Feature**: Add an alternative dynamic "graph view" to replace or complement current classification cards (non-table), allowing users to toggle between a list/table view and an interactive graphical view of team performance.

**Workflow**:
1. **saas-ux-optimizer** (Senior full-stack + UX expert):
   - Analyze the feature description and validate the user experience design.
   - Identify opportunities to improve clarity, usability, and accessibility while maintaining performance and scalability.
   - Provide a final UX specification ready for implementation, including interaction flows, responsive behavior, and edge cases.

2. **frontend-engineer** (Senior frontend developer, expert in React/TypeScript/D3.js or similar):
   - Take the approved UX specification from the saas-ux-optimizer.
   - Implement a responsive, performant, and visually engaging interactive graph view, following the UX spec.
   - Ensure seamless toggle between table/list view and graph view without page reload.
   - Integrate hover tooltips, click-to-expand panels, animations, sorting/grouping, and search as defined in the UX spec.
   - Optimize for both desktop and tablet, and provide a simplified mobile fallback.

**Key UX Details to Preserve**:
- Toggle button/tab: “View Graphically” (or similar) that switches between list/table and graphical view.
- Graphical view: 
  * Each team member = a circle/node.
  * Circle size = performance score/KPI (larger = higher performance).
  * Circle color = performance category (Green/Blue = top, Yellow = medium, Red/Grey = low).
  * Ability to sort/group by role, region/team, or score.
- Interactions:
  * Hover: tooltip with Name, Role, Score, Active Deals count.
  * Click: slide-in panel or pop-up with active deals list (client, stage, value, est. close date).
- Smooth animations for transitions, expanding/collapsing, and hover states.
- Search bar for filtering by name.
- Scales gracefully from 5 to 50+ members.
- Meets accessibility and performance standards.

**Output Requirements**:
- saas-ux-optimizer: Deliver in `<ux_spec>` block with:
  * Wireframe or diagram description
  * Interaction flow
  * Responsive layout notes
  * Accessibility considerations
  * Suggested UI copy
- frontend-engineer: Deliver in `<frontend_implementation>` block with:
  * Chosen libraries/frameworks
  * Component structure
  * State management approach
  * Pseudocode or code snippets for key parts (toggle, rendering, tooltips, panel)
  * Notes on performance optimization and scalability
</Task>
