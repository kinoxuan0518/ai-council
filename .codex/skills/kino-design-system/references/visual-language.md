# Kino Design System Visual Language

## Source

Primary reference image: `../assets/kino-design-system-reference.png`

Use it as a moodboard, not as a literal template. Preserve the visual grammar while adapting layout to the artifact being built.

## Palette

Core colors from the board:

| Role | Hex | Use |
| --- | --- | --- |
| Blue | `#8FAED6` | Primary accent, brush stroke, selected state, image overlay |
| Green | `#9BC5C9` | Secondary accent, hover, section rhythm |
| Yellow | `#F2D688` | Warm highlight, small accent, image overlay |
| Purple | `#B3DCF0` | Cool-lavender accent, underline, subtle contrast |
| Neutral | `#F6F4F4` | Page background, soft panels |
| Ink | `#262626` | Primary text |
| Dark gray | `#565656` | Body text |
| Mid gray | `#888888` | Captions, metadata |
| Line gray | `#BDBDBD` | Hairlines, dividers |
| Soft gray | `#E6E6E6` | Grid guides, faint backgrounds |

Notes:

- Keep the page mostly neutral. Use color as texture, rhythm, and emphasis.
- Prefer washed, chalky, watercolor, gouache, paper, or scraped-paint texture over flat fills.
- Do not let one hue dominate the entire artifact.

## Typography

Use two voices:

- Display serif: high-contrast editorial serif such as Cormorant Garamond, Playfair Display, Canela-like, Bodoni-like, or a local equivalent.
- Utility sans: quiet geometric or humanist sans such as Inter, Neue Haas Grotesk-like, Helvetica Neue, or a local equivalent.

Type hierarchy:

| Role | Typical size | Style |
| --- | --- | --- |
| H1 | 56-72px web, 44-64pt deck | Serif, regular, high line-height control |
| H2 | 34-44px web, 30-42pt deck | Serif, regular |
| H3 | 24-30px web, 22-28pt deck | Serif or sans depending on density |
| Body | 15-18px web, 13-18pt deck | Sans, regular |
| Caption | 11-13px web, 9-12pt deck | Sans, medium, often uppercase |
| Labels | 11-14px | Sans, uppercase, letter spacing 0 |

Keep headline letter spacing at 0. Use line-height around 0.95-1.12 for large serif headlines and 1.45-1.65 for body text.

## Layout

Grid:

- Use a 12-column desktop grid when possible.
- Keep wide margins, often 64-96px on desktop and 20-28px on mobile.
- Use thin vertical and horizontal dividers to create editorial panels.
- Number sections with small prefixes such as `01`, `02`, `03`.

Composition:

- Prefer asymmetric balance, large quiet type, and one textured visual anchor.
- Let some whitespace remain empty. Do not fill every panel.
- Use full-width bands or unframed layouts for sections. Use cards only for repeated items, project previews, modals, or contained tools.
- Keep first view informative: brand/name or object should be clearly visible, with a hint of the next section when building a landing page.

## Components

Buttons:

- Primary: brush-stroke blue background with white sans label.
- Secondary: thin rectangular outline, white/neutral fill, ink label.
- Tertiary: small text link with a fine brush underline or arrow.
- Hover: deepen the same color or use a soft brush overlay. Avoid glossy transitions.

Cards:

- Use thin `#E6E6E6` or `#BDBDBD` borders, minimal or no shadow.
- Combine a textured thumbnail with serif title and compact metadata.
- Radius should be 0-8px, usually square or barely rounded.

Navigation:

- Use sparse text nav, small section numbers, or minimal line icons.
- Vertical wordmarks are acceptable for portfolio/editorial compositions.

Icons:

- Use minimal line icons with consistent stroke.
- Favor person, envelope, bag, arrows, plus, minus, close, menu, grid dots.
- Use palette colors sparingly per icon.

## Imagery and Texture

Use painterly abstract fields that look tactile: paper grain, dry brush, scraped pastel, watercolor wash, chalk, or soft acrylic.

Image treatment:

- Apply subtle palette overlays to unify photos.
- Do not darken images heavily.
- Avoid generic stock atmosphere. The image should reveal material, product, place, person, or texture.

For image-generation prompts, include phrases like:

```text
soft editorial design system board, white paper background, thin gray dividers, high-contrast serif typography, quiet sans labels, tactile dry-brush pastel textures in washed blue green yellow lavender, generous negative space, minimal line icons, refined portfolio aesthetic
```

## Web Implementation Hints

- Use CSS custom properties for the palette.
- Use `border: 1px solid var(--line)` for structure.
- Use CSS masks, background images, or generated bitmap assets for brush strokes rather than trying to fake everything with gradients.
- Prefer stable grid tracks and fixed aspect ratios for galleries, cards, and texture tiles.
- Verify desktop and mobile screenshots. Text must not overlap panels or textured areas.

## Deck and Document Hints

- Use numbered sections and thin rules as the main organizing device.
- Prefer one large serif statement plus one texture field per slide.
- Keep body copy short. Use captions and small labels for hierarchy.
- Do not overuse colored backgrounds; most slides should stay neutral.
