# Design System Document: The Editorial Architect

## 1. Overview & Creative North Star
**Creative North Star: The Digital Curator**
This design system moves away from the rigid, "utility-first" appearance of traditional B2B SaaS. Instead, it adopts the persona of a high-end event director—authoritative, meticulously organized, yet possessing an undeniable aesthetic grace. 

We break the "template" look by treating the Qsheet not as a spreadsheet, but as a live editorial document. We utilize **intentional asymmetry**, where sidebars and content areas have varying weights, and **High-Contrast Typography Scales** that juxtapose an expansive Serif display with a functional, condensed Sans-Serif UI. The goal is to make the user feel they are "curating" an experience rather than just entering data.

---

## 2. Colors & Surface Philosophy
The palette is rooted in a deep, prestigious foundation with "lit-from-within" accents.

### The Palette
- **Primary (`#041221`)**: Our "Midnight Navy." Used for primary navigation and high-authority headers to anchor the experience in trust.
- **Tertiary (`#190f00`) & Tertiary Fixed Dim (`#e9c176`)**: Our "Gold Accents." Use these sparingly for highlighting active scenes or high-priority "Show Moments."
- **Surface Tiers**: We use `surface-container-lowest` (`#ffffff`) for the actual Qsheet "cells" and `surface` (`#f8f9fa`) for the workspace background.

### The "No-Line" Rule
Standard 1px borders are strictly prohibited for sectioning. We define space through **Tonal Transitions**. 
- To separate a "Scene" from a "Program," shift the background from `surface-container-low` to `surface-container-high`. 
- Structural boundaries are felt, not seen.

### Surface Hierarchy & Nesting
Treat the UI as a series of stacked fine papers.
- **Level 0 (Base):** `surface` (#f8f9fa).
- **Level 1 (Sections):** `surface-container-low` (#f3f4f5).
- **Level 2 (Active Work Areas):** `surface-container-lowest` (#ffffff).
- **Glassmorphism:** For floating palettes (e.g., a "Quick Action" toolbar), use `surface_container_lowest` at 80% opacity with a `20px` backdrop-blur to allow the event schedule to bleed through.

---

## 3. Typography
The typography is the "soul" of the application, balancing the classic elegance of a gala invitation with the precision of a technical manual.

- **Display & Headlines (Noto Serif):** Used for Event Titles and Program Headers. This serif communicates heritage and high-end hospitality. 
    - *Example:* Use `headline-lg` for the Event Name to give it an editorial weight.
- **UI & Labels (Manrope):** A modern, geometric sans-serif used for the "data" of the Qsheet. 
    - *Example:* Use `label-md` for timecodes and `body-md` for scene descriptions.
- **The Hierarchy Strategy:** Always pair a `headline-sm` (Serif) with a `label-sm` (Sans-Serif, All-Caps, tracked out +5%) to create a sophisticated, labeled-archival look.

---

## 4. Elevation & Depth
We eschew traditional drop shadows for **Tonal Layering** and **Ambient Diffusion**.

- **The Layering Principle:** Place a `surface-container-lowest` card on a `surface-container-low` section. This creates a soft, natural "lift" that mimics physical paper on a desk.
- **Ambient Shadows:** For floating modals (e.g., "Edit Scene Details"), use a shadow with a 40px blur, 0% spread, and a color of `on-surface` at 5% opacity. It should feel like a soft glow, not a dark edge.
- **The Ghost Border:** For input fields or mandatory separations, use `outline-variant` (`#c5c6cd`) at **15% opacity**. It should be just barely visible to the eye, acting as a guide rather than a wall.

---

## 5. Components

### Structured Tables (The Qsheet)
*Forbid the use of divider lines.*
- **The Row:** Use a `0.5rem` (spacing-2) vertical gap between rows. 
- **The Highlight:** When a row is "Live," change the background to `secondary-container` (#c8dffe) and add a `2px` left-accent of `tertiary-fixed-dim` (#e9c176).
- **Typography:** Timecodes should be `body-md` in `on-surface-variant` to keep the focus on the Scene Content.

### Buttons
- **Primary:** `primary` (#041221) background with `on-primary` (#ffffff) text. Use `roundness-md` (0.375rem).
- **Secondary:** Transparent background with a `Ghost Border` and `primary` text.
- **Tertiary (Action):** `tertiary-container` (#342300) with `on-tertiary-container` (#ab8844). Use for "Add Scene" or "Add Program."

### Input Fields
- **Styling:** Minimalist. No background color; only a `Ghost Border` bottom-line.
- **Focus State:** Transition the bottom-line to `primary` (#041221) with a `1px` thickness.
- **Labels:** Always use `label-md` in `on-surface-variant` positioned `0.5rem` above the input.

### Event Hierarchy Chips
- **Event > Program > Scene:** Use `surface-container-highest` for the chip background with `roundness-full`. 
- Use a `spacing-1` gap between chips to create a "breadcrumb" effect that feels tactile.

---

## 6. Do’s and Don'ts

### Do
- **Do** use `spacing-12` (3rem) and `spacing-16` (4rem) for margins around major sections. White space is a luxury; use it.
- **Do** use `notoSerif` for any text that is "User-Generated" (e.g., Scene Titles) to make their work feel like a masterpiece.
- **Do** use subtle gradients (e.g., `primary` to `primary-container`) on the top navigation bar to give it a "satin" finish.

### Don't
- **Don't** use pure black (#000000). Always use `primary` or `on-surface` to maintain the navy/slate depth.
- **Don't** use standard "Success Green" or "Warning Yellow" at full saturation. Use muted, sophisticated versions that align with the `secondary` and `tertiary` tones.
- **Don't** use 100% opaque borders. If a line is needed, it must be a "Ghost Border" at 10-20% opacity.
- **Don't** crowd the Qsheet. If a table feels tight, increase the row padding to `spacing-4` (1rem).