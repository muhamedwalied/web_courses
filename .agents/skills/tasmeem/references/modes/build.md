# Mode: build

For a new page, a new feature or a new component.

1. **Context:** read `PRODUCT.md`, `DESIGN.md`, the tokens and one representative component. If the project has no `DESIGN.md` and the work spans several pages, create it from the direction at step 3 (template: `templates/DESIGN.template.md`).
2. **Scope:**
   - **Component** (one element, or a brief under 30 words about one element): skip the page-level steps. Use the existing tokens, all eight states (`craft/components.md`), and a small demo page that shows every state.
   - **Page or feature:** continue.
3. **Direction:** `core/direction.md`, in full for a new surface and shortened (steps 1, 2 and 8) inside an existing system. State the design read and the plan, then run the reflex check. Present the plan (with up to three alternatives when the user is present), and proceed on approval, or on stated assumptions when running unattended.
4. **Build path:**
   - **comp-led** when image generation is available and the surface is brand-facing: `assets/pipeline.md` steps 2 to 4 (comp, region map, plates) before any page code;
   - otherwise **code-led**.
5. **Build**, loading only what the work touches:
   - type and scripts: `craft/typography.md` plus the `scripts-lang/` guide for every script present;
   - colour: `craft/color.md`;
   - layout: `craft/layout.md`;
   - components and forms: `craft/components.md`, `craft/forms.md`;
   - motion: `motion/principles.md`, `motion/techniques.md`;
   - floor: `craft/a11y-performance.md`, `core/honesty.md`.
6. **Gate:** `core/gate.md`. Measure, look, fix in one batch, measure once more, and report.

Write production code, complete and responsive, with no placeholder sections and no "TODO: style this". If an asset or fact is missing, leave a labelled gap and list it for the user.
