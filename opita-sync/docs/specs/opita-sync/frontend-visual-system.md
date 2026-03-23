# Frontend Visual System

## Design Tokens

### Color Semantics

- `brand`: governed action, selected navigation, primary CTA
- `brand-soft`: contextual emphasis and low-risk highlight
- `success`: confirmed execution or healthy state
- `warning`: work-in-progress or attention-needed state
- `danger`: blocked or risky state
- `line`: neutral separators and control borders
- `paper` and `panel`: background hierarchy
- `surface`: soft elevated neutral surface for grouped content and secondary actions
- `ink`: primary readable text
- `muted` and `subtle`: secondary and structural text hierarchy
- The visual closure package fixes teal as the primary product accent and reserves blue for focus, links, and informational utility only.

### Typography

- Base family: system sans
- Headings: compact, high-contrast, mobile-readable
- Metadata: uppercase tracking only for small labels and structural signposts

### Spacing

- Dense mobile cards: 16-20px internal padding
- Shell sections: 20-24px mobile, 24-32px desktop
- Grid gaps: 16-20px standard

### Theme System

- Light and dark themes share the same semantic token names
- Theme switching happens at shell level through `data-theme`
- Contrast targets remain stable by changing surfaces and text tokens, not component structure

## Layout Patterns

- Mobile-first stacked shell
- Bottom navigation for operational roles
- Left rail only from medium breakpoints onward
- Cards as primary grouping unit
- Detail view as stacked summary plus action panel on mobile
- No glass, no glow, and no gradient-based identity surfaces in the main product UI.
- Branding uses Flow Grid v3 in header and compact identity only; it does not enter dense data surfaces.

## Form Patterns

- Single-column by default
- Primary action fixed in visual hierarchy near editable content
- Inputs and textareas use large touch targets

## State Patterns

- `loading`: descriptive progress, not spinner-only
- `empty`: explain what is missing and what to do next
- `error`: actionable and specific
- `success`: outcome plus audit implication when relevant
