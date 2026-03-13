# AGENTS.md

## Design Context

### Users
- Primary users are coaches and camp staff working in the admin panel during active camp days.
- The admin experience is used frequently, often on mobile phones in fast operational contexts.
- Secondary users (future public pages) are parents, children, and visitors browsing rankings, profiles, achievements, and camp galleries.

### Product Purpose
- The application manages children's battle camps: camps, teams, players, assignments, battle results, progression (ranks, achievements, medals), and camp photos.
- The interface must optimize speed, clarity, and reliability of repetitive operational tasks.

### Brand Personality
- 3-word personality: Practical, Calm, Modern.
- Emotional target: confidence and control during busy camp workflows.
- Voice: direct, helpful, and human.

### Aesthetic Direction
- Core direction: clean, structured, minimal admin UI with clear hierarchy.
- Prefer restrained visual language over decoration.
- Avoid decorative gradients, heavy shadows, visual noise, and dense table-heavy screens.
- Use soft elevation, rounded surfaces, generous spacing, and strong information grouping.

## Scope And Boundaries
- This design context governs UI/UX, interaction, and visual decisions for frontend work.
- Do not change backend contracts or business logic to satisfy design preferences.
- Favor explicit, readable implementations over complex abstractions.

## UX Principles

### 1. Mobile-First Operations
- Design for phone-first usage by default, then enhance for larger screens.
- Keep primary actions visible and reachable without deep navigation.
- Use tap-friendly controls with comfortable hit areas and clear spacing.
- Avoid horizontal scrolling for core admin workflows.

### 2. Fast And Obvious Workflows
- Prioritize task completion speed over ornamental UI.
- Keep navigation shallow and action placement predictable.
- Prefer inline section actions and clear page-level primary actions.
- Minimize modal stacking; avoid nested or competing overlays.

### 3. Calm And Predictable Interaction
- Preserve layout stability and avoid sudden shifts.
- Provide immediate feedback for loading, success, and failure states.
- Keep interaction patterns consistent across admin modules.
- Use progressive disclosure for advanced options.

### 4. Practical Clarity
- Prefer card and section-based layouts over dense data grids.
- Break large tasks into grouped, readable blocks.
- Use empty states to guide the next action.
- Keep forms short, obvious, and validation messages actionable.

## Layout Rules
- Use a spacing-first system with consistent vertical rhythm.
- Base layout should be single-column on mobile; add multi-column grids only when content benefits.
- Prefer card grids and grouped sections for scanning.
- Maintain generous internal padding and clean separation between sections.
- Keep page structure consistent: header, key actions, filters, content blocks.

## Component Guidelines

### Core Admin Building Blocks
- Cards and section containers are the primary composition units.
- Inputs should be clean, high-contrast, and easy to parse.
- Buttons should follow a strict hierarchy:
  - Primary: one clear main action per context.
  - Secondary: supportive actions.
  - Destructive: explicit and visually distinct.

### Forms
- Keep forms readable and vertically structured on mobile.
- Group related fields with clear section labels.
- Show field-level errors close to the field.
- Disable submit during async operations and show clear progress labels.

### Lists And Data
- Prefer card/list patterns for mobile usability.
- Use tables only where unavoidable; if used, provide mobile-safe alternatives.
- Keep dense analytics views secondary to operational clarity.

## Photo And Gallery UX
- Photo experiences must prioritize visual clarity and fast browsing.
- Use image-first cards with clean metadata support.
- Keep upload flows straightforward: select target, choose file, review, upload.
- Ensure gallery surfaces remain mobile-friendly and scroll naturally.

## Interaction And Motion Rules
- Motion should be subtle and purposeful, not decorative.
- Use transitions to communicate state changes, not to impress.
- Keep animation timing short and calm.
- Respect reduced-motion preferences when introducing animated behavior.

## Visual Style Rules
- Maintain a modern, minimal visual system focused on legibility.
- Use soft shadows and rounded corners with restraint.
- Keep contrast strong and typography clear.
- Avoid visual clutter, excessive ornament, and trend-driven effects.

## UX Writing And Tone (Bulgarian-First)
- Use clear, simple Bulgarian UI text.
- Prefer short action verbs and outcome-oriented labels.
- Avoid technical, backend, or developer-oriented wording in user-facing text.

### Preferred Action Verbs
- Създай
- Запази
- Изтрий
- Редактирай

### Writing Rules
- Button labels must name the action clearly.
- Error messages should explain what happened and what to do next.
- Empty states should state the situation and present a clear next action.
- Keep terminology consistent across screens.

## Performance Philosophy
- Prefer lightweight components and fast render paths.
- Avoid unnecessary UI complexity and over-engineered patterns.
- Optimize perceived speed with clear loading and success states.
- Keep frontend logic simple, explicit, and maintainable.

## Future Public Pages Direction
- Public pages (rankings, profiles, galleries, achievements) may be more showcase-like than admin screens.
- Keep the same design principles: clarity, hierarchy, responsiveness, and consistency.
- Visual polish may increase, but usability and readability remain non-negotiable.

## Design Decision Checklist
Use this checklist before shipping UI changes:
- Is the flow mobile-first and tap-friendly?
- Is the primary action obvious?
- Is the layout card/section oriented and easy to scan?
- Is wording clear Bulgarian and non-technical?
- Are loading/error/success states explicit?
- Does this avoid unnecessary visual decoration?
- Is behavior predictable and free of confusing modal stacks?
