# Design System Document: The Kinetic Stadium

## 1. Overview & Creative North Star
**Creative North Star: "The Kinetic Stadium"**
This design system moves beyond the static "app" feel to emulate the architectural precision and raw energy of a professional sports arena. We are not just building a multi-sport platform; we are designing a digital stadium. 

To achieve a "High-End Editorial" experience, we break from the rigid, boxed-in layouts of traditional material design. Instead, we utilize **Intentional Asymmetry**—where content bleeds off-edge or overlaps layers—to create a sense of forward motion. We prioritize "edge-first" layouts where typography and imagery drive the structure, rather than containers driving the content.

---

## 2. Colors & Surface Logic

### The Palette
We utilize a sophisticated foundation of `surface` neutrals to allow our high-octane sport accents to pop.
- **Action Blue (`primary` #005bbf):** Our heartbeat. Used for critical momentum and primary interactions.
- **Sport Accents:** Use `secondary` (#1b6d24) for Cricket, `secondary_container` (vibrant yellow/orange tones) for Tennis, and `tertiary` (#6e24f5) for E-sports. These are immersive markers, not just decorations.

### The "No-Line" Rule
**Explicit Instruction:** Prohibit the use of 1px solid borders for sectioning. Boundaries must be defined solely through background color shifts or subtle tonal transitions.
- **Surface Hierarchy:** To define a section, move from `surface` to `surface-container-low`. 
- **The Nesting Principle:** Treat the UI as stacked sheets of fine paper. An inner card should live on `surface-container-lowest` if the background is `surface-container-low`. This creates depth without visual clutter.

### The "Glass & Gradient" Rule
To elevate the "Stitch" inspiration into a premium tier:
- **Glassmorphism:** For floating navigation or over-image overlays, use `surface` at 80% opacity with a `20px` backdrop-blur. 
- **Kinetic Gradients:** Main CTAs and Hero backgrounds should utilize a subtle linear gradient (135°) transitioning from `primary` to `primary_container`. This adds "soul" and dimension that flat hex codes cannot provide.

---

## 3. Typography: The Editorial Voice

Our typography is the bridge between technical precision and athletic energy.

- **Display & Headlines (Plus Jakarta Sans):** These are our "stadium Jumbotron" moments. Use `display-lg` for hero headlines with tight letter-spacing (-0.02em) to create an aggressive, high-energy feel.
- **Body & Labels (Inter):** The "scorekeeper's" font. Inter provides maximum legibility for dense statistics. 
- **Hierarchy as Identity:** Use high-contrast scaling. A `display-md` headline paired with a `label-md` uppercase kicker creates an authoritative editorial look. 

---

## 4. Elevation & Depth: Tonal Layering

We reject the traditional "drop shadow" in favor of **Ambient Light.**

- **The Layering Principle:** Use the `surface-container` tiers (Lowest to Highest) to create natural lift. 
    - *Example:* A live-score card (`surface-container-lowest`) sitting on a news feed (`surface-container-low`).
- **Ambient Shadows:** When a card must float (e.g., a modal or hovering state), use a highly diffused shadow: `box-shadow: 0 12px 32px rgba(25, 28, 29, 0.06)`. The shadow must feel like air, not ink.
- **The "Ghost Border" Fallback:** If accessibility requires a stroke, use `outline_variant` at **15% opacity**. It should be felt, not seen.

---

## 5. Component Signature Styles

### Buttons: The Momentum Drivers
- **Primary:** Gradient fill (`primary` to `primary_container`), `rounded-md`, with `title-sm` typography in `on_primary`.
- **Secondary:** Surface-tinted. Use `primary_fixed` background with `on_primary_fixed` text. No border.
- **Tertiary:** Transparent background with `primary` text. Use for low-priority "Read More" actions.

### Cards: The Content Vessels
- **Standard Card:** `surface-container-lowest` background, `rounded-lg` (1rem). 
- **Dynamic Overlap:** Elements like player headshots or sport-specific icons should "break the box," overlapping the card edge by `1rem` to create a 3D, edge-first effect.
- **Forbid Dividers:** Do not use lines to separate list items within a card. Use `8px` of vertical whitespace or a `surface-container-high` background on every second item.

### Chips: The Live Tags
- **Live Status:** Use `error` background with `on_error` text.
- **Sport Filter:** Use sport-specific accents (e.g., `tertiary_container` for E-sports) with `full` rounding to create a distinct "pill" shape.

### Input Fields: Minimalist Focus
- **Surface:** `surface-container-high` background.
- **State:** On focus, transition the background to `surface-container-lowest` and add a `2px` "Action Blue" underline. Avoid full-box outlines.

---

## 6. Do's and Don'ts

### Do:
- **Do** use "Breathing Room." If you think there is enough margin, add `1rem` more. High-end design thrives on whitespace.
- **Do** use `plusJakartaSans` for any text over 24px.
- **Do** align content to a 4-column or 12-column grid, but allow featured imagery to break the grid containers to create "editorial" tension.

### Don't:
- **Don't** use 100% black (#000000). Use `on_surface` (#191c1d) for text to maintain a premium, ink-on-paper feel.
- **Don't** use standard Material Design "Drop Shadows." Stick to Tonal Layering or Ambient Shadows.
- **Don't** use 1px dividers. If you feel the need to separate, use a background color shift or `16px` of whitespace.
- **Don't** use sharp 0px corners. Every interactive element must have at least `rounded-md` (0.75rem) to feel approachable and modern.