# Vastu Griha — Component Library Specification v1.0

**Status**: Approved / Design System Spec  
**Version**: 1.0  
**Authors**: Principal UX Architect & Principal Design System Engineer  

This document serves as the official Component Library for Vastu Griha, defining the design and technical requirements for reusable UI components.

---

# 01. App Header

## Purpose
Provides page headers, branding logo, dark mode switcher, and visual context switches.

## Business Goal
Keeps navigation paths unified, reduces friction, and reinforces branding consistency.

## Usage
Fixed at the top of the viewport on all screens except absolute full-screen canvas modes.

## When to Use
On home dashboard, wizard onboarding, and visual editors.

## When NOT to Use
Within modal dialogue popups, raw fullscreen print checklists, or immersive canvas overlays.

## Variants
Default, Workspace Editor (compact), and Onboarding (minimal).

## States
Fixed (transparent/solid), Scrolled (elevated, drop-shadow border active).

## Properties
Sticky top, Height: 56px (mobile) / 64px (desktop), Background: var(--bg), Border-bottom: 1px solid var(--border).

## Sizes
Height 56px (mobile) / 64px (desktop), Max-width: 100vw.

## Spacing
Horizontal padding: 16px (mobile) / 24px (desktop), Inner element gaps: 12px.

## Typography
Title: Outfit 18px Bold. Caption/Status: Inter 12px Regular.

## Icons
Brand Logo SVG, Light/Dark Mode toggle: ti-sun / ti-moon.

## Interactions
Tapping avatar opens settings dropdown; tapping logo returns user to welcome dashboard.

## Animations
Crossfade on theme switch (200ms ease), border shadow toggle on scroll.

## Accessibility
Contrast ratio > 4.5:1. Aria-label attributes on logo link and setting toggles.

## Responsive Behaviour
Wraps nav link buttons on screens under 768px, shifting them into collapsable side menu drawer.

## Developer Notes
Position sticky with z-index 100 to stay above canvas elements.

## Future Enhancements
Add real-time multi-user editor avatars indicator bubbles.

---
# 02. Bottom Navigation

## Purpose
Primary navigation tabs switcher on mobile screens.

## Business Goal
Allows for easy thumb navigation on mobile and improves conversion to the remedies store.

## Usage
Anchored to the very bottom of the screen on devices with width < 768px.

## When to Use
On mobile devices when browsing Home, Canvas editor, Vastu reports, and Remedies store.

## When NOT to Use
On desktop screens, print dialog layout blocks, or when keyboard is active.

## Variants
Standard (4 tabs + middle FAB item).

## States
Visible, Hidden (during input editing). Active state uses var(--accent).

## Properties
Height: 60px, Padding: 4px horizontal, z-index: 100, Border-top: 1px solid var(--border).

## Sizes
Height: 60px, Width: 100% of viewport.

## Spacing
Tab item margins: 6px, Label vertical offset: 2px.

## Typography
Label: Inter 10px Medium.

## Icons
ti-home-2 (Home), ti-layout-grid (Design), ti-plus (FAB Add), ti-file-text (Reports), ti-shopping-cart (Remedies).

## Interactions
Clicking item changes tab layout page immediately.

## Animations
Subtle scale zoom on active navigation item icon (150ms spring).

## Accessibility
Aria-selected state toggled dynamically. Navigation items readable by screen readers.

## Responsive Behaviour
Hidden entirely on screens >= 768px (Desktop).

## Developer Notes
Requires CSS display: none media queries override rules inside index.css.

## Future Enhancements
Add badges with score change indicators (+5% badge on remedies tab).

---
# 03. Navigation Rail

## Purpose
Mid-sized navigation sidebar menu layout for tablets.

## Business Goal
Optimizes screen layouts on landscape tablets without crowding the visual canvas.

## Usage
Left-aligned layout strip on viewports between 768px and 1024px.

## When to Use
For medium tablets to switch screens.

## When NOT to Use
On small mobile phones (< 768px) or wide desktop displays.

## Variants
Icon-only with small text caption labels.

## States
Active, inactive, hover.

## Properties
Width: 72px, Height: 100vh, Background: var(--bg2).

## Sizes
Width: 72px, Icon size: 22px.

## Spacing
Item margins: 16px vertical, padding: 8px.

## Typography
Caption: Inter 10px Regular.

## Icons
ti-home-2, ti-layout-grid, ti-file-text, ti-shopping-cart.

## Interactions
Tab click triggers page state change.

## Animations
Subtle sidebar item background fade on hover (150ms ease).

## Accessibility
Full keyboard navigation support with Tab keys.

## Responsive Behaviour
Visible only within tablet media queries (max-width: 1024px).

## Developer Notes
Uses CSS flex-direction: column to keep items centered.

## Future Enhancements
Add floating badges for notifications.

---
# 04. Side Drawer

## Purpose
Hidden sidebar menu drawer that slides in on request.

## Business Goal
Consolidates menu entries, help guides, and user settings under a single panel.

## Usage
Triggers from header toggle icons, sliding from the left margin.

## When to Use
For supplemental links, documentation pages, or history logs.

## When NOT to Use
As the primary navigation router for editing paths.

## Variants
Left-drawer (Settings/Navigation), Right-drawer (Analysis history).

## States
Closed (hidden), Open (active), Animating.

## Properties
Width: 280px, Transition: transform 300ms ease, Backdrop overlay: active.

## Sizes
Width: 280px, Height: 100vh.

## Spacing
Inner margins: 20px, Header padding: 16px.

## Typography
Header: Outfit 16px Bold. Item links: Inter 14px Regular.

## Icons
ti-chevron-right on links, ti-x for closing.

## Interactions
Swipe left or tap backdrop overlay to close.

## Animations
Slide-in from left: transform translateX(-100%) to 0%.

## Accessibility
Escape key closes drawer. Trap focus inside active drawer.

## Responsive Behaviour
Clamps to width 100% on small devices.

## Developer Notes
Uses React Portal to mount drawer container directly to document root body.

## Future Enhancements
Integrate offline cached sync status indicators.

---
# 05. Floating Action Button (FAB)

## Purpose
Prominent circular trigger for the primary action on mobile viewports.

## Business Goal
Improves ease of use and speed when adding rooms to the drawing.

## Usage
Fixed at bottom-right corner of screen or nested in bottom navigation bar.

## When to Use
To add new elements to the canvas layout on mobile screen viewports.

## When NOT to Use
On desktop viewports where side catalog panels are already visible.

## Variants
Standard (Plus icon), Extended (Plus icon + 'Add Room' text).

## States
Idle, Hover, Active, Disabled.

## Properties
Background: var(--accent), Border-radius: 50%, Height: 52px, Shadow: 0 4px 10px rgba(0,0,0,0.3).

## Sizes
Diameter: 52px, Icon size: 22px.

## Spacing
Bottom offset: 80px, Right offset: 20px.

## Typography
Label: Outfit 12px Bold (extended only).

## Icons
ti-plus (Insert element), ti-wand (AI suggestion).

## Interactions
Tapping button triggers elements catalog popup drawer.

## Animations
Scale spring zoom on click (150ms spring cubic-bezier).

## Accessibility
Aria-label: 'Add room to layout'. Large tap target > 48px.

## Responsive Behaviour
Rendered on mobile screens only.

## Developer Notes
Uses position fixed with high z-index (90) to stay above room boxes.

## Future Enhancements
Add haptic vibrations on touch events.

---
# 06. Primary Button

## Purpose
Primary layout action selector for form submissions or wizard progression.

## Business Goal
Guides users along the primary path, improving conversion.

## Usage
Used for 'Continue', 'Apply', and 'Generate Plan' actions.

## When to Use
To move to the next onboarding step or confirm actions.

## When NOT to Use
For secondary pathways like 'Cancel', 'Clear Layout', or 'Go Back'.

## Variants
Full-width, Inline fit, Large size, Pill shape.

## States
Idle, Hover, Active, Focused, Disabled, Loading.

## Properties
Background: var(--accent), Font-weight: Bold, Height: 48px.

## Sizes
Height 48px, Corner radius: 8px.

## Spacing
Internal padding: 14px 24px, External margins: 12px.

## Typography
Label: Outfit 14px Bold.

## Icons
Optional leading icon: ti-arrow-right or ti-wand.

## Interactions
Click triggers click callbacks; loading state replaces label text with a spinner.

## Animations
Hover background lightens, active click scale shrinks (98% scale transition).

## Accessibility
Contrast ratio > 4.5:1. Triggers screen reader focus.

## Responsive Behaviour
Expands to width: 100% on mobile screens.

## Developer Notes
Uses background: linear-gradient(135deg, var(--gold), var(--accent)) for AI tasks.

## Future Enhancements
Add auto-focus attributes on initial step loads.

---
# 07. Secondary Button

## Purpose
Secondary action button for secondary pathways.

## Business Goal
Provides clean secondary options without distracting from primary tasks.

## Usage
Used for 'Cancel', 'Reset', or 'Adjust Settings' options.

## When to Use
For minor settings adjustments or closing cards.

## When NOT to Use
To move forward in onboarding steps.

## Variants
Standard outline, solid grey background.

## States
Idle, Hover, Active, Disabled.

## Properties
Border: 1px solid var(--border), Background: var(--bg2), Text: var(--text2).

## Sizes
Height 44px, Corner radius: 8px.

## Spacing
Internal padding: 12px 20px.

## Typography
Label: Inter 13px Medium.

## Icons
None.

## Interactions
Resets state modifications or closes popup.

## Animations
Subtle border highlight on hover.

## Accessibility
Focus rings visible on keyboard tab focus.

## Responsive Behaviour
Fits text size width.

## Developer Notes
Uses hover transition rules for background color modifications.

## Future Enhancements
Add keyboard hotkeys indicators (e.g., [ESC] label).

---
# 08. Ghost Button

## Purpose
Low-emphasis action button with no border or background.

## Business Goal
Provides optional settings without cluttering the screen.

## Usage
Used for auxiliary links like 'View History', 'Learn More', or 'Skip Onboarding'.

## When to Use
To show auxiliary links or settings controls.

## When NOT to Use
When the screen action is critical for the flow.

## Variants
Text link, Icon link.

## States
Idle, Hover, Active, Disabled.

## Properties
Background: transparent, Text: var(--text2), hover: var(--accent).

## Sizes
Height 40px, padding: 8px 12px.

## Spacing
Padding: 8px vertical.

## Typography
Label: Inter 13px Regular.

## Icons
Optional trailing chevron ti-chevron-right.

## Interactions
Navigates to external references pages.

## Animations
Soft color transition on hover.

## Accessibility
Minimum contrast ratio 4.5:1 on text color.

## Responsive Behaviour
Remains static.

## Developer Notes
Uses color inherit on hover states.

## Future Enhancements
Add tooltip display triggers on hover.

---
# 09. Danger Button

## Purpose
High-emphasis button for destructive actions.

## Business Goal
Prevents accidental data loss or workspace resets.

## Usage
Used for 'Delete element' and 'Reset Canvas' buttons.

## When to Use
When removing elements from the canvas or resetting drafts.

## When NOT to Use
For simple closing actions or minor updates.

## Variants
Solid red, light red outline.

## States
Idle, Hover, Active, Disabled.

## Properties
Background: rgba(239, 68, 68, 0.15), Border: 1px solid rgba(239, 68, 68, 0.3), Text: #EF4444.

## Sizes
Height 40px, Corner radius: 16px (capsule).

## Spacing
Padding: 8px 16px.

## Typography
Label: Inter 12px Semibold.

## Icons
ti-trash (Delete).

## Interactions
Requires confirmation prompt before resetting the canvas.

## Animations
Scale down click transition (98%).

## Accessibility
Explicit warning confirmation overlays.

## Responsive Behaviour
Maintains size.

## Developer Notes
Used on the Easy Align panel delete option.

## Future Enhancements
Add swipe-to-confirm slider behaviors.

---
# 10. Icon Button

## Purpose
Compact, square action button containing only an icon.

## Business Goal
Saves screen space on mobile dashboards.

## Usage
Settings toggle gears, header notifications, and room close controls.

## When to Use
For minor secondary screen triggers.

## When NOT to Use
When text explanation is needed for the action.

## Variants
Circle background, transparent background.

## States
Idle, Hover, Active, Disabled.

## Properties
Width: 36px, Height: 36px, Border-radius: 50% / 6px.

## Sizes
Size: 36px x 36px, Icon size: 16px.

## Spacing
Margin: 4px.

## Typography
None.

## Icons
ti-x, ti-settings, ti-bell, ti-arrow-left.

## Interactions
Click triggers toggle functions.

## Animations
Rotation transition (90deg) on settings cog icons on hover.

## Accessibility
Must have aria-label describing the icon's action.

## Responsive Behaviour
Maintains size.

## Developer Notes
Uses padding: 0 to ensure icons are centered.

## Future Enhancements
Add dynamic badges over notification bell icons.

---
# 11. Card

## Purpose
General layout container that groups related content together.

## Business Goal
Organizes complex layout data into readable blocks.

## Usage
Dashboard widgets, settings groups, and analysis reports.

## When to Use
To group related options or items visually.

## When NOT to Use
When content is continuous text copy.

## Variants
Flat, bordered, elevated, highlighted.

## States
Default, Hover, Selected.

## Properties
Background: var(--bg2), Border: 1px solid var(--border), Border-radius: 12px.

## Sizes
Variable width, Border-radius: 12px.

## Spacing
Padding: 16px standard, margin-bottom: 12px.

## Typography
Variable based on content.

## Icons
None.

## Interactions
Tapping cards can open detailed options or trigger selects.

## Animations
Subtle border color highlight transition on hover.

## Accessibility
Semantic HTML: wraps content using section tags.

## Responsive Behaviour
Adapts to fit column layouts.

## Developer Notes
Main building block for dashboard grids.

## Future Enhancements
Add collapsible drawer behaviors for large text cards.

---
# 12. Project Card

## Purpose
Renders draft projects on the welcome screen.

## Business Goal
Enables users to quickly resume their draft layouts.

## Usage
Gupta House and Sharma Villa draft list.

## When to Use
On the welcome screen's recent project list.

## When NOT to Use
Within the active plan editor workspace.

## Variants
Default draft card.

## States
Idle, Hover, Loading.

## Properties
Background: var(--bg2), Border: 1px solid var(--border), Corner-radius: 12px.

## Sizes
Min-height: 120px, Width: 100%.

## Spacing
Padding: 16px, Margin-bottom: 16px.

## Typography
Title: Outfit 15px Bold. Dimension text: Fira Code 12px.

## Icons
ti-chevron-right (CTA arrow), ti-layout-grid (Blueprint layout).

## Interactions
Clicking card loads project dataset to canvas.

## Animations
Card scales up slightly (101%) on hover.

## Accessibility
Aria-label: 'Continue drafting project'.

## Responsive Behaviour
Stacks vertically as a single column on mobile viewports.

## Developer Notes
Uses handleContinueProject helper click events.

## Future Enhancements
Add inline miniature SVG floor plan layouts.

---
# 13. Product Card

## Purpose
Displays Vedic remedies inside the store.

## Business Goal
Increases remedies conversion rate.

## Usage
Copper boundary wire, brass helix pyramids catalog list.

## When to Use
On the Remedies Store tab.

## When NOT to Use
In reports or checklist pages.

## Variants
Vertical card, horizontal checkout item.

## States
Idle, Hover, Selected, Purchased.

## Properties
Background: var(--bg2), Border-radius: 12px, border: 1px solid var(--border).

## Sizes
Width: 260px (desktop) / 100% (mobile), height: variable.

## Spacing
Padding: 16px, margin: 8px.

## Typography
Title: Outfit 14px Bold. Price: Fira Code 14px Semibold.

## Icons
ti-shopping-cart, ti-circle-check.

## Interactions
Clicking Buy now triggers purchase validation loading spinner.

## Animations
Score bounce indicator triggered on purchase.

## Accessibility
Alt labels on product photos.

## Responsive Behaviour
Adapts to 2-column or 1-column layouts on mobile viewports.

## Developer Notes
Uses buyRemedies action handler.

## Future Enhancements
Add 3D rotate preview views on hover.

---
# 14. Recommendation Card

## Purpose
Renders AI recommendations for layout improvements.

## Business Goal
Helps users resolve Vastu compliance issues.

## Usage
Placed inside the analysis sidebar tab.

## When to Use
When there are active warning compliance states.

## When NOT to Use
When the project layout is fully compliant.

## Variants
Warning recommendation, informational tip.

## States
Active, resolved.

## Properties
Border-left: 4px solid var(--yellow), Background: var(--bg2).

## Sizes
Width: 100%, Min-height: 80px.

## Spacing
Padding: 12px 16px, margin-bottom: 8px.

## Typography
Text: Inter 13px Regular.

## Icons
ti-alert-triangle (Warning icon), ti-arrow-right.

## Interactions
Tapping item highlights the corresponding room on the canvas.

## Animations
Subtle border pulse on warning states.

## Accessibility
High contrast ratio for warning text.

## Responsive Behaviour
Static width expansion.

## Developer Notes
Matches sector warning states in dynamic layout check.

## Future Enhancements
Add quick 'Auto-Fix' layout adjustments buttons.

---
# 15. Vastu Score Card

## Purpose
Circular progress widget showing the Vastu score.

## Business Goal
Gamifies compliance audits, encouraging users to improve their score.

## Usage
Top of analysis pane and score preview views.

## When to Use
On compliance review screens.

## When NOT to Use
Within the wizard forms.

## Variants
Circular meter, horizontal bar.

## States
Excellent (>80%), Good (60-80%), Warning (<60%).

## Properties
Circular score layout, active SVG circle strokes.

## Sizes
Diameter: 120px on workspace sidebar / 160px on score preview.

## Spacing
Margins: 16px vertical, padding: 12px.

## Typography
Score number: Outfit 32px Bold.

## Icons
None.

## Interactions
Tapping meter details the scoring breakdown.

## Animations
Circular stroke fill animation from 0% on load (800ms ease-out).

## Accessibility
Aria-valuemin/max/now attributes set.

## Responsive Behaviour
Centers on mobile views.

## Developer Notes
Uses calculateVastuScore utility helper.

## Future Enhancements
Add score breakdown charts.

---
# 16. Room Card

## Purpose
Canvas element container displaying room data.

## Business Goal
Serves as the main component for floor plan design.

## Usage
Bedroom, Kitchen, Pooja room boxes on canvas.

## When to Use
Always when rendering rooms on the planner canvas.

## When NOT to Use
In sidebar text listings.

## Variants
Rectangular rooms, irregular custom boundaries.

## States
Default, Hover, Selected, Dragging.

## Properties
Background: rgba(28, 29, 32, 0.85), Border: 1.5px solid var(--border), Text: forced white (#f8fafc).

## Sizes
Variable width/height (10-100% of grid).

## Spacing
Inner padding: 8px.

## Typography
Label: Outfit 12px Bold. Dimensions: Fira Code 9px.

## Icons
ti-x (Delete control), drag handle node indicators.

## Interactions
Drag to position, use corner handles to resize.

## Animations
Border glow expansion on active selection (200ms ease).

## Accessibility
Labels are forced to white for legibility on dark background.

## Responsive Behaviour
Room percentages scale correctly on all screen viewports.

## Developer Notes
Positioned using absolute inline coordinate percentages.

## Future Enhancements
Render furniture icons inside rooms.

---
# 17. Issue Card

## Purpose
Highlights specific compliance failures (e.g. toilet in NE).

## Business Goal
Directs users to areas that require corrections.

## Usage
In the analysis checklist drawer.

## When to Use
When a room location violates Vastu rules.

## When NOT to Use
When rooms are in neutral or auspicious locations.

## Variants
Critical (Red), Warning (Amber).

## States
Active, fixed.

## Properties
Background: var(--bg2), Border-left: 4px solid var(--red).

## Sizes
Width: 100%, Padding: 12px.

## Spacing
Margin-bottom: 10px.

## Typography
Title: Inter 13px Semibold, Body: Inter 11px Regular.

## Icons
ti-alert-circle.

## Interactions
Clicking card highlights the room that caused the warning.

## Animations
Shakes slightly on layout audit changes.

## Accessibility
Contrast helper ratios checked.

## Responsive Behaviour
Static width expansion.

## Developer Notes
Linked directly with evaluation rules matrix.

## Future Enhancements
Add single-tap remedy purchase attachments.

---
# 18. Activity Card

## Purpose
Displays updates or actions in the layout history.

## Business Goal
Keeps users informed about project updates.

## Usage
Recent events feed widget.

## When to Use
Within draft updates lists.

## When NOT to Use
In primary planning canvases.

## Variants
Timeline card.

## States
Default.

## Properties
Background: var(--bg2), padding: 8px 12px.

## Sizes
Width: 100%, height: auto.

## Spacing
Margin-bottom: 8px.

## Typography
Details: Inter 12px Regular.

## Icons
ti-history, ti-plus, ti-trash.

## Interactions
None.

## Animations
Subtle slide down on entry.

## Accessibility
Readable by assistive screen readers.

## Responsive Behaviour
Adapts width.

## Developer Notes
Used for history log updates.

## Future Enhancements
Add layout undo shortcuts buttons.

---
# 19. Collaboration Card

## Purpose
Shows active collaborators editing the project.

## Business Goal
Allows architects and homeowners to plan houses together.

## Usage
Sharing widgets panels.

## When to Use
When collaborative features are active.

## When NOT to Use
In single-user offline workflows.

## Variants
Collaborator list card.

## States
Active, offline.

## Properties
Background: var(--bg2), Border: 1px solid var(--border).

## Sizes
Width: 100%, Height: 56px.

## Spacing
Padding: 8px 12px.

## Typography
User: Inter 12px Semibold. Role: Inter 10px Regular.

## Icons
ti-users.

## Interactions
Tapping avatar details user editing permissions.

## Animations
Green dot pulses when user is online.

## Accessibility
Provides clear alt text descriptors.

## Responsive Behaviour
Adapts width.

## Developer Notes
Part of the team collaboration setup.

## Future Enhancements
Add real-time workspace cursor indicators.

---
# 20. User Avatar

## Purpose
Displays user profile picture or initials.

## Business Goal
Reinforces account ownership.

## Usage
Top right header corner and collaborator panels.

## When to Use
Always when user identification is required.

## When NOT to Use
In general canvas tools.

## Variants
Circular picture, text fallback.

## States
Idle, Hover, Active.

## Properties
Border-radius: 50%, Border: 2px solid var(--border).

## Sizes
Size: 32px x 32px (mobile) / 40px x 40px (desktop).

## Spacing
Margin: 4px.

## Typography
Initials text: Inter 12px Bold.

## Icons
None.

## Interactions
Clicking avatar opens account menu.

## Animations
Hover enlarges avatar slightly.

## Accessibility
Must have an alt attribute value (e.g. 'User avatar').

## Responsive Behaviour
Maintains dimensions.

## Developer Notes
Uses background images with fallback user initial text strings.

## Future Enhancements
Add online activity glow rings.

---
# 21. Member Chip

## Purpose
A tag-like badge displaying a collaborator's name and role.

## Business Goal
Provides at-a-glance collaborator details.

## Usage
Collaborator headers.

## When to Use
When listing multiple collaborators.

## When NOT to Use
In primary navigation flows.

## Variants
Aria chip.

## States
Default, Hover, Active.

## Properties
Background: var(--bg2), Border-radius: 16px, Padding: 4px 10px.

## Sizes
Height: 28px, Width: auto.

## Spacing
Margin-right: 6px.

## Typography
Label: Inter 11px Medium.

## Icons
ti-circle-filled.

## Interactions
Clicking chip opens collaborator profile details.

## Animations
Subtle fade transition.

## Accessibility
Tab focusable.

## Responsive Behaviour
Maintains size.

## Developer Notes
Uses inline flex layouts.

## Future Enhancements
Add role badge color variations.

---
# 22. Badge

## Purpose
Alert indicator displaying small counts or status indicators.

## Business Goal
Draws attention to status updates or cart items.

## Usage
Top right corners of shopping cart or alert bells.

## When to Use
When there is unread content or pending alerts.

## When NOT to Use
When there is no active change update.

## Variants
Red dot (empty), Count badge (numbers).

## States
Active, hidden.

## Properties
Background: #EF4444, Text: #FFF, Border-radius: 50% / 10px.

## Sizes
Size: 18px x 18px / 8px x 8px (dot).

## Spacing
Top offset: -6px, Right offset: -6px.

## Typography
Count text: Inter 9px Bold.

## Icons
None.

## Interactions
Disappears when user checks notifications.

## Animations
Pulse animations on high-priority alerts.

## Accessibility
Aria-label reads notification count.

## Responsive Behaviour
Maintains alignment.

## Developer Notes
Absolute positioning relative to parent button container.

## Future Enhancements
Add numeric rollover transition effects.

---
# 23. Tag

## Purpose
Non-clickable metadata badge.

## Business Goal
Categorizes items clearly.

## Usage
Room cards, style labels (e.g. 'Traditional').

## When to Use
To show property metadata classifications.

## When NOT to Use
When the label is a clickable toggle button.

## Variants
Accent tag, neutral tag.

## States
Default.

## Properties
Background: rgba(124, 111, 247, 0.1), Text: var(--accent), Corner-radius: 4px.

## Sizes
Height: 20px, Padding: 2px 6px.

## Spacing
Margin: 4px.

## Typography
Label: Inter 10px Semibold.

## Icons
None.

## Interactions
None.

## Animations
None.

## Accessibility
Semantic labeling tags.

## Responsive Behaviour
Maintains size.

## Developer Notes
Inline CSS flex centering wrapper.

## Future Enhancements
Add dynamic category color mappings.

---
# 24. Pill

## Purpose
Interactive toggle chip to filter lists or select criteria.

## Business Goal
Enables quick list filtering on mobile devices.

## Usage
Filtering catalog rooms (Private, Living, Vedic).

## When to Use
To filter options within grids.

## When NOT to Use
When inputs require manual text entry.

## Variants
Active pill, inactive pill.

## States
Default, Active, Hover.

## Properties
Corner-radius: 20px, Border: 1px solid var(--border).

## Sizes
Height: 32px, Padding: 6px 14px.

## Spacing
Margin-right: 8px.

## Typography
Label: Inter 12px Medium.

## Icons
Optional leading check icon.

## Interactions
Tapping pill switches active filter.

## Animations
Smooth background color switch on select.

## Accessibility
Aria role set to tab toggle button.

## Responsive Behaviour
Horizontal scrolling pill lists on mobile viewports.

## Developer Notes
Used inside elements drawer filters.

## Future Enhancements
Add search index integrations.

---
# 25. Progress Bar

## Purpose
Horizontal bar showing layout calculation progress.

## Business Goal
Improves perceived performance during loading screens.

## Usage
AI calculations screen.

## When to Use
During multi-step background calculations.

## When NOT to Use
For instant actions under 300ms.

## Variants
Determinate percentage progress.

## States
Loading, Completed.

## Properties
Track background: var(--border), Fill color: var(--accent).

## Sizes
Height: 6px, Width: 100%.

## Spacing
Padding: 4px, margin-bottom: 8px.

## Typography
Percentage: Inter 11px Semibold.

## Icons
None.

## Interactions
None.

## Animations
Horizontal slide fill transitions on change.

## Accessibility
Aria-valuenow properties updated dynamically.

## Responsive Behaviour
Expands to fit parent containers.

## Developer Notes
Used inside the AI loader widget wrapper.

## Future Enhancements
Add gradient transitions from orange to violet.

---
# 26. Circular Progress

## Purpose
Circular spinner for general page load indicators.

## Business Goal
Provides feedback that content is loading.

## Usage
Initial screen transitions.

## When to Use
When loading background assets.

## When NOT to Use
During inline button submissions.

## Variants
Indeterminate spinning circle.

## States
Active.

## Properties
Stroke-color: var(--accent), track-color: transparent.

## Sizes
Size: 40px x 40px.

## Spacing
Centered inside parent view container.

## Typography
None.

## Icons
None.

## Interactions
Blocks screen clicks when active.

## Animations
Infinite rotation spinner (360deg over 1s).

## Accessibility
Presents dynamic aria-live loading status alerts.

## Responsive Behaviour
Centered positioning.

## Developer Notes
Uses SVG linear dashboards.

## Future Enhancements
Add success checkmark animations upon load completion.

---
# 27. Skeleton Loader

## Purpose
Placeholder shapes that mimic content layout during loading.

## Business Goal
Prevents screen layouts from shifting as content loads.

## Usage
Project card and remedies store placeholders.

## When to Use
When fetching remote API data.

## When NOT to Use
During instant page changes.

## Variants
Card skeleton, list row skeleton, text skeleton.

## States
Active loading.

## Properties
Background: var(--bg2) linear-gradient overlay.

## Sizes
Matches final component size.

## Spacing
Margins match final component.

## Typography
None.

## Icons
None.

## Interactions
None.

## Animations
Shimmer pulse effect (1.5s infinite slide).

## Accessibility
Aria busy attribute set to true.

## Responsive Behaviour
Matches responsive rules of final component.

## Developer Notes
Uses background keyframe shifts.

## Future Enhancements
Match shimmer timing with network speeds.

---
# 28. AI Thinking Loader

## Purpose
Simulated indicator representing Acharya evaluation generation.

## Business Goal
Reinforces the value of the AI's complex calculations.

## Usage
Within the chatbot view dialogue.

## When to Use
While waiting for the Vastu Acharya chat assistant responses.

## When NOT to Use
During typical UI selections.

## Variants
Pulsing dots.

## States
Generating.

## Properties
Background: var(--bg2), 3 dots inside a text bubble.

## Sizes
Bubble size: 60px x 36px.

## Spacing
Margin-bottom: 12px.

## Typography
None.

## Icons
None.

## Interactions
User cannot query assistant until generation finishes.

## Animations
3 dots pulse up and down sequentially.

## Accessibility
Aria-label: 'Acharya is analyzing...'.

## Responsive Behaviour
Remains static.

## Developer Notes
Uses keyframe scale loops.

## Future Enhancements
Show scanning area updates on canvas while generating.

---
# 29. Search Bar

## Purpose
Input box to filter long lists of elements.

## Business Goal
Helps users quickly locate rooms in the catalog.

## Usage
Top of the rooms catalog drawer and remedies list.

## When to Use
Whenever list items exceed 10 entries.

## When NOT to Use
On simple property selection forms.

## Variants
Standard filter bar.

## States
Idle, Active, Typing, Selected.

## Properties
Background: var(--bg2), Border: 1px solid var(--border), Text color: var(--text).

## Sizes
Height: 40px, Corner radius: 8px.

## Spacing
Padding: 10px 14px 10px 36px (indented for search icon).

## Typography
Text: Inter 13px Regular.

## Icons
ti-search (leading), ti-x (trailing clear button).

## Interactions
Typing filters list items dynamically. Clicking 'x' clears search query.

## Animations
Border color shifts to var(--accent) on focus.

## Accessibility
Clear input label for screen readers.

## Responsive Behaviour
Expands to fit container width.

## Developer Notes
Linked directly with the searchQuery state.

## Future Enhancements
Add recent queries search index caching.

---
# 30. Text Input

## Purpose
Standard text input field.

## Business Goal
Allows users to add custom names to projects or rooms.

## Usage
Custom room text fields and email forms.

## When to Use
When input content is alphanumeric text.

## When NOT to Use
When options are limited (use checkboxes or dropdowns instead).

## Variants
Default placeholder, active edit text.

## States
Idle, Active, Error, Disabled.

## Properties
Background: var(--bg2), Border: 1px solid var(--border), Corner-radius: 8px.

## Sizes
Height 44px, Width 100%.

## Spacing
Padding: 12px 16px.

## Typography
Input text: Inter 14px Regular.

## Icons
None.

## Interactions
Keyboard focus opens text input interface.

## Animations
Border changes to purple (`var(--accent)`) on focus.

## Accessibility
Must have an associated text label.

## Responsive Behaviour
Adapts to fit column layouts.

## Developer Notes
Uses standard form validation states.

## Future Enhancements
Add voice-to-text dictation buttons.

---
# 31. Number Input

## Purpose
Input field optimized for numerical entry.

## Business Goal
Allows users to enter accurate plot measurements.

## Usage
Step 2 Dimensions input forms.

## When to Use
When typing dimension counts (Width/Length).

## When NOT to Use
For text coordinates or non-numeric variables.

## Variants
Width/Length input slots.

## States
Default, focused, validation error.

## Properties
Background: var(--bg2), Border: 1px solid var(--border), Corner-radius: 8px.

## Sizes
Height: 44px, Width: 100px.

## Spacing
Padding: 12px.

## Typography
Number text: Fira Code 14px Semibold.

## Icons
None.

## Interactions
Limits character entry to numbers and decimal points.

## Animations
Red border flash on input validation error.

## Accessibility
Aria properties validate limits.

## Responsive Behaviour
Spreads horizontally.

## Developer Notes
Performs parsing via parseFloat on change.

## Future Enhancements
Add quick increment/decrement buttons.

---
# 32. Dropdown

## Purpose
Combobox menu for selecting a single option from a list.

## Business Goal
Prevents spelling errors in selections.

## Usage
Selecting state, country, or project templates.

## When to Use
When options are between 5 and 15 items.

## When NOT to Use
When options are under 4 (use segmented pills instead).

## Variants
Default option list.

## States
Default, open, active.

## Properties
Background: var(--bg2), Border: 1px solid var(--border).

## Sizes
Height: 44px, list max-height: 200px.

## Spacing
Padding: 12px 36px 12px 16px.

## Typography
Option: Inter 13px Regular.

## Icons
ti-selector (trailing down arrow).

## Interactions
Click opens dropdown options list overlay.

## Animations
List options slide down (150ms ease).

## Accessibility
Escape key closes dropdown. Trap focus inside active list.

## Responsive Behaviour
Converts to native selector UI on mobile viewports.

## Developer Notes
Uses standard React dropdown components.

## Future Enhancements
Add autocomplete search filtering.

---
# 33. Compass Picker

## Purpose
A dial-style picker showing the plot's facing direction.

## Business Goal
Provides an intuitive way to configure compass facing angles.

## Usage
Step 2 Facing directions setup.

## When to Use
To define the main street facing direction.

## When NOT to Use
For selecting standard parameters.

## Variants
Rotatable compass graphic dial.

## States
Ready, rotating.

## Properties
Circular layout representing directions (N, E, S, W).

## Sizes
Diameter: 180px.

## Spacing
Margin-bottom: 24px.

## Typography
Label: Outfit 13px Bold.

## Icons
ti-compass (Compass pointer).

## Interactions
Drag dial or slider to adjust facing tilt parameters.

## Animations
Compass face rotates smoothly in real-time.

## Accessibility
Accessible via slider keyboard tabs.

## Responsive Behaviour
Centered positioning on mobile.

## Developer Notes
Applies CSS transforms dynamically based on tilt angles.

## Future Enhancements
Integrate mobile gyroscope API for automatic calibration.

---
# 34. Direction Picker

## Purpose
Segmented selectors representing the cardinal directions.

## Business Goal
Enables quick configuration of facing road directions.

## Usage
Cardinal button choices on onboarding panels.

## When to Use
To select N, E, S, or W road alignments.

## When NOT to Use
When entering custom angles.

## Variants
4 cardinal options.

## States
Default, Active, Hover.

## Properties
Flex segments, active border highlighted in purple.

## Sizes
Height: 48px, Margin: 6px.

## Spacing
Gaps: 12px.

## Typography
Direction text: Outfit 13px Bold.

## Icons
ti-sun (East facing), ti-moon (West facing).

## Interactions
Clicking segment changes plot facing direction.

## Animations
Active border fades in on selection.

## Accessibility
Segment controls accessible with tab keys.

## Responsive Behaviour
Displays as a 2x2 grid on mobile viewports.

## Developer Notes
Updates `onboarding.facing` state variable.

## Future Enhancements
Add micro-climate orientation alerts.

---
# 35. Plot Boundary Editor

## Purpose
SVG canvas editor for tracing plot outlines.

## Business Goal
Allows users to define custom, irregular plot boundaries.

## Usage
Step 3 Boundary drawing canvas.

## When to Use
When custom boundaries are needed.

## When NOT to Use
When using standard rectangular presets.

## Variants
Dot grid trace editor.

## States
Drawing, closed path, completed.

## Properties
Custom SVG path generation.

## Sizes
Height: 350px (mobile) / 450px (desktop).

## Spacing
Gaps: 16px margins.

## Typography
None.

## Icons
ti-line (Line node), ti-point (Point vertex).

## Interactions
Tap grid points to draw lines; tap starting point to close shape.

## Animations
Nodes scale up when selected.

## Accessibility
Clear undo / reset triggers provided.

## Responsive Behaviour
Scales viewport dimensions.

## Developer Notes
Uses absolute viewport coordinate tracking.

## Future Enhancements
Add CAD layout file (.dxf/.dwg) upload support.

---
# 36. Wall Editor

## Purpose
Draws wall partitions inside rooms.

## Business Goal
Supports accurate drafting of interior layouts.

## Usage
Canvas visual elements editor.

## When to Use
To create interior partitions.

## When NOT to Use
During high-level zone analysis.

## Variants
Thick wall, thin partition.

## States
Normal, editing.

## Properties
Line layout, color matches partition properties.

## Sizes
Thickness: 4px / 8px.

## Spacing
Grid snap: 12px.

## Typography
None.

## Icons
None.

## Interactions
Drag nodes to adjust wall paths.

## Animations
Snaps to coordinate guidelines.

## Accessibility
Color contrast checked.

## Responsive Behaviour
Scales proportionally.

## Developer Notes
Uses coordinate points array calculations.

## Future Enhancements
Add automatic structural columns alignment.

---
# 37. Door Component

## Purpose
Renders doors with opening swing arcs on the canvas.

## Business Goal
Enables users to check if door placements match Vastu rules.

## Usage
Inserted onto room boundaries.

## When to Use
To audit the main entrance gate or door positions.

## When NOT to Use
On simple property selection viewports.

## Variants
Single door, double door, sliding door.

## States
Compliant (Green), Non-compliant (Red).

## Properties
SVG arc path overlay.

## Sizes
Width: 24px (relative scale).

## Spacing
Snaps to room boundaries.

## Typography
None.

## Icons
None.

## Interactions
Drag to position on walls; tap to change opening direction.

## Animations
Swings open on placement.

## Accessibility
Screen reader announces placement validation status.

## Responsive Behaviour
Scales dynamically.

## Developer Notes
Requires coordinate collision detection.

## Future Enhancements
Integrate door direction checklist alerts.

---
# 38. Window Component

## Purpose
Renders window nodes on room boundaries.

## Business Goal
Allows auditing of natural light and ventilation compliance.

## Usage
Placed on room walls.

## When to Use
To check ventilation Vastu compliance.

## When NOT to Use
On high-level layout audits.

## Variants
Standard sliding, bay window.

## States
Default, Selected.

## Properties
Parallel line markers showing window location.

## Sizes
Width: 18px.

## Spacing
Snaps to room wall paths.

## Typography
None.

## Icons
None.

## Interactions
Drag to position along walls.

## Animations
Highlights on select.

## Accessibility
Clear color contrast.

## Responsive Behaviour
Scales dynamically.

## Developer Notes
Saves positions to room objects data structures.

## Future Enhancements
Integrate local sunlight exposure analysis.

---
# 39. Room Component

## Purpose
Main structural element wrapper on the canvas.

## Business Goal
Standardizes visual layout planning.

## Usage
Master Bedroom, Pooja room blocks.

## When to Use
To represent rooms on the layout canvas.

## When NOT to Use
For structural walls.

## Variants
Standard room card, highlight warning card.

## States
Normal, Selected, Dragging, Resize active.

## Properties
Background: var(--bg2), Border: 1.5px solid var(--border).

## Sizes
Variable widths and heights.

## Spacing
Minimum size: 10% x 10%.

## Typography
Label: Outfit 11px Bold. Size: Fira Code 9px.

## Icons
ti-x (Delete).

## Interactions
Drag to move; drag bottom-right corner to resize.

## Animations
Soft border highlight fade on selection.

## Accessibility
Label text color is forced to white for legibility.

## Responsive Behaviour
Saves coordinates as percentages for responsive loading.

## Developer Notes
Monitors touch dragging events inside Canvas.jsx.

## Future Enhancements
Add real-time floor area total calculations.

---
# 40. Furniture Component

## Purpose
Renders furniture icons (bed, dining table, sofa) inside rooms.

## Business Goal
Enables micro-Vastu placement audits (e.g. bed facing head direction).

## Usage
Placed inside room boundaries.

## When to Use
To evaluate internal item positioning.

## When NOT to Use
On high-level layout audits.

## Variants
Bed, sofa lounge, cooktop, toilet seat, dining table.

## States
Compliant, warning.

## Properties
SVG furniture outline overlay.

## Sizes
Proportional to parent room size.

## Spacing
Margin: 4px boundary offset.

## Typography
None.

## Icons
ti-bed, ti-soup, ti-wash-dryclean.

## Interactions
Drag to position inside rooms; tap to rotate.

## Animations
Snaps to walls on drag close.

## Accessibility
Detailed voice evaluations provided.

## Responsive Behaviour
Scales proportionally with room resizing.

## Developer Notes
Saves positions as local offsets.

## Future Enhancements
Add 3D model furniture preview options.

---
# 41. Canvas Toolbar

## Purpose
Floating toolbar providing editor control options.

## Business Goal
Improves editor usability by keeping controls nearby.

## Usage
Workspace editor header overlay.

## When to Use
Inside the canvas editor screen.

## When NOT to Use
In reports and checkout pages.

## Variants
Grid controls toolbar.

## States
Visible, hidden.

## Properties
Background: var(--bg2), Border: 1px solid var(--border).

## Sizes
Height: 40px, Corner-radius: 8px.

## Spacing
Padding: 6px 12px, margin-bottom: 12px.

## Typography
Label: Inter 11px Regular.

## Icons
ti-grid, ti-compass, ti-trash, ti-layout-grid.

## Interactions
Clicking icons toggles grids or clears canvas.

## Animations
Fades in on canvas load (200ms).

## Accessibility
Buttons have descriptive aria labels.

## Responsive Behaviour
Fits screen width.

## Developer Notes
Controls showNormalGrid and showVastuGrid states.

## Future Enhancements
Add screen snapshot buttons.

---
# 42. Inspector Panel

## Purpose
Sidebar inspector displaying details of selected rooms.

## Business Goal
Provides a clean way to view and edit element attributes.

## Usage
Left sidebar on desktop screens.

## When to Use
When an element is selected on the canvas.

## When NOT to Use
When no elements are selected.

## Variants
Default sidebar card.

## States
Active, inactive.

## Properties
Background: var(--bg2), width: 280px.

## Sizes
Width: 280px, height: auto.

## Spacing
Padding: 16px.

## Typography
Title: Outfit 14px Bold. Inputs: Inter 12px Regular.

## Icons
ti-settings, ti-edit.

## Interactions
Typing values updates room dimensions on the canvas in real-time.

## Animations
Slides in from the left margin on selection.

## Accessibility
Form controls labeled correctly.

## Responsive Behaviour
Converts to bottom sheets on mobile viewports.

## Developer Notes
Synchronized with selectedRoomId state.

## Future Enhancements
Add Vastu placement suggestions.

---
# 43. Right Analysis Panel

## Purpose
Displays sector audits, checklist scores, and remedies.

## Business Goal
Enables users to review and resolve layout issues.

## Usage
Right sidebar on desktop viewports.

## When to Use
To check layout compliance status.

## When NOT to Use
During initial plot setup steps.

## Variants
Checklist pane, detailed reports page.

## States
Auspicious, warnings present.

## Properties
Width: 320px, Background: var(--bg2).

## Sizes
Width: 320px, height: auto.

## Spacing
Padding: 16px, inner gaps: 12px.

## Typography
Title: Outfit 16px Bold. Body: Inter 13px Regular.

## Icons
ti-check-circle, ti-alert-triangle.

## Interactions
Clicking warnings highlights the corresponding room on the canvas.

## Animations
Updates dynamically with a fade transition on layout changes.

## Accessibility
Contrast helper ratios checked.

## Responsive Behaviour
Converts to a standalone tab on mobile viewports.

## Developer Notes
Uses analysis evaluations matrices.

## Future Enhancements
Add printable PDF report buttons.

---
# 44. Bottom Sheet

## Purpose
Sliding sheet overlay for mobile configurations.

## Business Goal
Saves screen space and keeps mobile user interactions simple.

## Usage
Room element catalog and configuration panels.

## When to Use
For settings panels on screen widths < 768px.

## When NOT to Use
On desktop screen viewports.

## Variants
Standard bottom sheet, compact quick-select sheet.

## States
Closed, open, drag active.

## Properties
Background: var(--bg2), Rounded top corners, z-index: 100.

## Sizes
Height: variable (40-80% viewport height).

## Spacing
Header padding: 16px, item margins: 8px.

## Typography
Title: Outfit 15px Bold.

## Icons
ti-minus (drag handle pill), ti-x.

## Interactions
Swipe down to close sheet; tap backdrop overlay to close.

## Animations
Slides up from bottom margin (300ms ease-out).

## Accessibility
Trap focus inside sheet when open. Escape key closes sheet.

## Responsive Behaviour
Active only on mobile viewports.

## Developer Notes
Uses pointer capture for drag behaviors.

## Future Enhancements
Add layout snaps at 50% and 80% heights.

---
# 45. Modal Dialog

## Purpose
Centered pop-up overlay for confirmations or alerts.

## Business Goal
Confirms critical actions to prevent accidental inputs.

## Usage
Confirm resets, share dialogs, and exit alerts.

## When to Use
When an action requires explicit user confirmation.

## When NOT to Use
For secondary settings or general configuration.

## Variants
Confirmation dialog, informational alert.

## States
Open, closed.

## Properties
Background: var(--bg2), Backdrop opacity: active.

## Sizes
Width: 320px (mobile) / 450px (desktop).

## Spacing
Padding: 24px, inner gap: 16px.

## Typography
Title: Outfit 16px Bold. Body: Inter 13px Regular.

## Icons
ti-info-circle, ti-alert-triangle.

## Interactions
Tapping background dismisses modal (optional).

## Animations
Scale spring zoom on open (200ms cubic-bezier).

## Accessibility
Escape key closes modal. Trap focus when open.

## Responsive Behaviour
Centered positioning on all screens.

## Developer Notes
Uses React createPortal helper.

## Future Enhancements
Add fingerprint/biometric confirmation options.

---
# 46. Toast

## Purpose
Temporary notification overlay showing system status.

## Business Goal
Provides feedback on completed actions (e.g. 'Project saved').

## Usage
Bottom center page notifications.

## When to Use
To confirm actions (saves, deletions) without blocking the workflow.

## When NOT to Use
When user action is required to resolve an issue.

## Variants
Success (Green), Info (Accent), Warning (Yellow).

## States
Visible, fading.

## Properties
Background: var(--bg2), Border: 1px solid var(--border), Auto-dismiss: 3s.

## Sizes
Height: 40px, padding: 8px 16px.

## Spacing
Bottom margin: 80px (mobile) / 24px (desktop).

## Typography
Text: Inter 12px Regular.

## Icons
ti-circle-check, ti-info-circle.

## Interactions
Tapping toast dismisses it immediately. Optional 'Undo' action button.

## Animations
Slide up from bottom margin (200ms ease), fade out on dismiss.

## Accessibility
Role: alert. Screen reader announces message.

## Responsive Behaviour
Centers on mobile; right-aligned on desktop.

## Developer Notes
Managed by a global context provider.

## Future Enhancements
Add action undo links inside the toast.

---
# 47. Snackbar

## Purpose
Bottom notification bar containing action buttons.

## Business Goal
Enables users to undo accidental deletions easily.

## Usage
Workspace action feedback (e.g. 'Room deleted').

## When to Use
To notify users of completed changes with an 'Undo' option.

## When NOT to Use
For general page navigation alerts.

## Variants
Action alert.

## States
Active, fading.

## Properties
Background: #1C1D20, Border-top: 2px solid var(--accent).

## Sizes
Width: 100% (mobile) / 400px (desktop).

## Spacing
Padding: 12px 16px.

## Typography
Label: Inter 12px Medium.

## Icons
None.

## Interactions
Clicking 'Undo' restores the previous state.

## Animations
Slide up from bottom margin (250ms ease).

## Accessibility
Polite screen reader announcements.

## Responsive Behaviour
Spans full width on mobile viewports.

## Developer Notes
Supports layout state restore helper functions.

## Future Enhancements
Add secondary action support (e.g., 'View History').

---
# 48. Tooltip

## Purpose
A small info bubble showing tips on hover or long-press.

## Business Goal
Provides helpful tips without cluttering the interface.

## Usage
Hovering over Vastu direction codes or settings icons.

## When to Use
To explain the function of icon-only controls.

## When NOT to Use
For primary instructions or critical warnings.

## Variants
Standard bubble pointer.

## States
Visible, hidden.

## Properties
Background: #0C0D10, Text color: #FFF, Border-radius: 4px.

## Sizes
Max-width: 200px, padding: 6px 10px.

## Spacing
Margin offset: 8px.

## Typography
Tip text: Inter 11px Regular.

## Icons
None.

## Interactions
Shows on hover (desktop) or long-press (mobile).

## Animations
Fades in on hover (150ms ease).

## Accessibility
Aria-describedby attributes link icon and tooltip.

## Responsive Behaviour
Position shifts to avoid viewport edges.

## Developer Notes
Uses Popper.js alignment rules.

## Future Enhancements
Integrate links inside tools.

---
# 49. Empty State

## Purpose
Placeholder widget shown when a screen has no content.

## Business Goal
Guides users on how to populate the empty view.

## Usage
Empty projects tab and empty shopping cart views.

## When to Use
When query returns no drafts, remedies, or updates.

## When NOT to Use
While content is loading.

## Variants
Standard layout empty screen.

## States
Default.

## Properties
Center flex layout, large icon, instruction text.

## Sizes
Height: 100% of parent container.

## Spacing
Margins: 32px standard.

## Typography
Title: Outfit 15px Bold. Body: Inter 12px Regular.

## Icons
ti-home-off, ti-shopping-cart-x.

## Interactions
Clicking the primary button starts the wizard.

## Animations
Fades in on screen display.

## Accessibility
Described clearly for screen readers.

## Responsive Behaviour
Centered positioning on all screens.

## Developer Notes
Accepts text and button action props.

## Future Enhancements
Add dynamic illustration suggestions.

---
# 50. Error State

## Purpose
A screen displaying an error message (e.g. connection lost).

## Business Goal
Provides clear steps to resolve errors and keep the user in the app.

## Usage
Calculations crash or offline notifications.

## When to Use
When a network error or system crash occurs.

## When NOT to Use
For inline input validation errors.

## Variants
Connection failure, system exception.

## States
Active.

## Properties
Background: var(--bg2), center container.

## Sizes
Width: 100%, padding: 32px.

## Spacing
Inner gap: 16px.

## Typography
Title: Outfit 16px Bold. Explanation: Inter 13px.

## Icons
ti-wifi-off, ti-bug.

## Interactions
Tapping 'Retry' restarts the active process.

## Animations
Shake transition on error load.

## Accessibility
Alerts screen reader immediately.

## Responsive Behaviour
Centered layout.

## Developer Notes
Triggers network connection status checks.

## Future Enhancements
Integrate automatic offline backup synchronization.

---
# 51. Loading State

## Purpose
Full-screen spinner overlay shown during loading states.

## Business Goal
Confirms to the user that background operations are in progress.

## Usage
Saving database coordinates or reloading assets.

## When to Use
When blocking the UI is necessary to complete a task.

## When NOT to Use
For fast page changes under 300ms.

## Variants
Spinner overlay.

## States
Loading.

## Properties
Background opacity: active, center spinner.

## Sizes
Full screen overlay.

## Spacing
None.

## Typography
Loading text: Inter 13px Medium.

## Icons
None.

## Interactions
Blocks click events during loading.

## Animations
Rotation loop on spinner.

## Accessibility
Aria busy attribute set to true.

## Responsive Behaviour
Centered overlay positioning.

## Developer Notes
Controlled by standard app load states.

## Future Enhancements
Add helpful Vastu tips during loading screens.

---
# 52. Notification Card

## Purpose
Renders system alerts or message notices.

## Business Goal
Highlights system updates or cart changes.

## Usage
Notifications panel widgets.

## When to Use
When notifying the user of updates.

## When NOT to Use
For critical warning popups.

## Variants
Unread, read notifications.

## States
Unread, read.

## Properties
Background: var(--bg2), Border: 1px solid var(--border).

## Sizes
Width: 100%, padding: 12px.

## Spacing
Margin-bottom: 8px.

## Typography
Description: Inter 12px Regular.

## Icons
ti-bell, ti-point.

## Interactions
Clicking notification marks it as read.

## Animations
Pulsing red dot on unread notifications.

## Accessibility
Full screen reader accessibility.

## Responsive Behaviour
Adapts to screen width.

## Developer Notes
Saves state to local notification databases.

## Future Enhancements
Add group notifications sorting.

---
# 53. Timeline

## Purpose
Displays layout update history in chronological order.

## Business Goal
Enables users to review and restore previous designs.

## Usage
Sidebar history panel.

## When to Use
To list version updates for a layout.

## When NOT to Use
Inside wizard options.

## Variants
Chronological item list.

## States
Active, inactive.

## Properties
Vertically connected dot indicator line.

## Sizes
Width: 100%, line thickness: 2px.

## Spacing
Padding: 8px horizontal, item margins: 12px.

## Typography
Version Title: Inter 12px Semibold. Date: Inter 10px.

## Icons
ti-circle (Dot marker), ti-git-commit.

## Interactions
Clicking item loads that project version.

## Animations
Subtle border highlight on selected version.

## Accessibility
Readable by assistive screen readers.

## Responsive Behaviour
Scrolls vertically.

## Developer Notes
Tied to design history data model.

## Future Enhancements
Add visual design comparison widgets.

---
# 54. Comment Bubble

## Purpose
A chat bubble container for collaboration notes.

## Business Goal
Allows team members to discuss and align layouts easily.

## Usage
Collaborator comment list panels.

## When to Use
When collaborative features are active.

## When NOT to Use
In single-user offline workflows.

## Variants
Author bubble, guest bubble.

## States
Read, unread.

## Properties
Background: var(--bg2), Corner-radius: 8px.

## Sizes
Max-width: 250px, height: auto.

## Spacing
Margin-bottom: 8px, padding: 8px 12px.

## Typography
Author name: Inter 11px Bold, message text: Inter 13px.

## Icons
None.

## Interactions
Clicking bubble opens comments thread options.

## Animations
Fades in on addition.

## Accessibility
Screen reader reads author and message contents.

## Responsive Behaviour
Static width limit.

## Developer Notes
Saves state to local database arrays.

## Future Enhancements
Add comment attachment indicators.

---
# 55. Version History Card

## Purpose
Displays summary details of saved project versions.

## Business Goal
Provides confidence that drafts are safely backed up.

## Usage
History panel layouts.

## When to Use
To list version backups.

## When NOT to Use
Inside general catalog dialogs.

## Variants
Simple layout card.

## States
Idle, Hover, Selected.

## Properties
Background: var(--bg2), Border: 1px solid var(--border).

## Sizes
Width: 100%, Height: 64px.

## Spacing
Padding: 8px 12px, margin-bottom: 8px.

## Typography
Label: Inter 12px Semibold. Subtext: Inter 10px.

## Icons
ti-device-floppy, ti-chevron-right.

## Interactions
Clicking card restores the project backup.

## Animations
Highlights active selection.

## Accessibility
Focusable with tab navigation.

## Responsive Behaviour
Adapts width.

## Developer Notes
Connected to layout restore helper.

## Future Enhancements
Add thumbnail preview tooltips.

---
# 56. Activity Feed

## Purpose
Displays a log of layout changes (e.g. 'Kitchen added').

## Business Goal
Provides updates on layout changes.

## Usage
Recent events feed panels.

## When to Use
To audit layout changes in the sidebar.

## When NOT to Use
In primary wizard steps.

## Variants
Log list.

## States
Normal.

## Properties
Scrollable container with chronological list.

## Sizes
Width: 100%, Height: variable.

## Spacing
Item gaps: 8px.

## Typography
Feed text: Inter 11px Regular.

## Icons
ti-plus, ti-trash, ti-adjustments.

## Interactions
None.

## Animations
Fades in on page load.

## Accessibility
Readable by screen readers.

## Responsive Behaviour
Scrolls vertically.

## Developer Notes
Logs changes to local state logs.

## Future Enhancements
Add filters by user role.

---
# 57. Share Dialog

## Purpose
A share modal popup showing invite options.

## Business Goal
Encourages users to share layouts and invite collaborators.

## Usage
Clicking 'Share Layout' in the header.

## When to Use
When sharing layouts with other users.

## When NOT to Use
Within the wizard forms.

## Variants
Standard share dialog.

## States
Open, closed.

## Properties
Background: var(--bg2), corner-radius: 12px.

## Sizes
Width: 350px (mobile) / 450px (desktop).

## Spacing
Padding: 20px, margins: auto.

## Typography
Title: Outfit 16px Bold. Body: Inter 13px.

## Icons
ti-copy, ti-link, ti-mail.

## Interactions
Clicking 'Copy link' copies invite link to clipboard.

## Animations
Scale spring zoom on open.

## Accessibility
Escape key closes dialog. Trap focus when open.

## Responsive Behaviour
Centered positioning on all screens.

## Developer Notes
Uses standard clipboard APIs.

## Future Enhancements
Add dynamic QR code creation.

---
# 58. Invite Member Dialog

## Purpose
Dialogue to send email invites to new team members.

## Business Goal
Encourages collaboration.

## Usage
Collaborators dashboard options.

## When to Use
To send email invites to collaborators.

## When NOT to Use
On simple property selection viewports.

## Variants
Email invite modal.

## States
Open, closed, sending.

## Properties
Background: var(--bg2), corner-radius: 12px.

## Sizes
Width: 350px, height: auto.

## Spacing
Padding: 20px.

## Typography
Label: Inter 12px Semibold. Inputs: Inter 13px.

## Icons
ti-send, ti-mail.

## Interactions
Sending shows a loading spinner.

## Animations
Fades in on open.

## Accessibility
Trap focus when open.

## Responsive Behaviour
Centered overlay positioning.

## Developer Notes
Triggers email invite APIs.

## Future Enhancements
Add autocomplete from address book.

---
# 59. Role Selector

## Purpose
Combobox menu to define editor permissions.

## Business Goal
Ensures design ownership.

## Usage
Collaborator profile card configurations.

## When to Use
To set permissions (Viewer, Contributor, Editor).

## When NOT to Use
In primary planning canvases.

## Variants
Dropdown selector.

## States
Default, open, active.

## Properties
Background: var(--bg2), Border: 1px solid var(--border).

## Sizes
Height: 32px, Width: 120px.

## Spacing
Padding: 4px 8px.

## Typography
Option text: Inter 11px Regular.

## Icons
ti-selector.

## Interactions
Tapping opens options list overlay.

## Animations
Option highlights on hover.

## Accessibility
Aria attributes set.

## Responsive Behaviour
Remains static.

## Developer Notes
Saves state to collaborator permissions data models.

## Future Enhancements
Add custom role settings options.

---
# 60. Product Placement Card

## Purpose
A recommendation card display showing product details.

## Business Goal
Encourages remedies purchases.

## Usage
Analysis sidebar remedies list.

## When to Use
When recommending remedies for warning zones.

## When NOT to Use
In checkout review states.

## Variants
Vertical recommendation item.

## States
Active, resolved.

## Properties
Background: var(--bg2), Border: 1px solid var(--border).

## Sizes
Width: 100%, Height: 80px.

## Spacing
Padding: 12px.

## Typography
Label: Inter 12px Semibold. Subtext: Inter 10px.

## Icons
ti-shopping-cart, ti-circle-check.

## Interactions
Clicking card highlights where to place the item.

## Animations
Highlights on select.

## Accessibility
Provides descriptive alt text.

## Responsive Behaviour
Adapts width.

## Developer Notes
Linked with target warning zones.

## Future Enhancements
Add virtual product placement previews on canvas.

---
# 61. Shopping Recommendation Card

## Purpose
Product recommendation list item showing pricing and checkout CTAs.

## Business Goal
Increases remedies conversion rate.

## Usage
Remedies recommendation panels.

## When to Use
When listing remedial items.

## When NOT to Use
In reports or checklist pages.

## Variants
List item.

## States
Idle, Hover, Purchased.

## Properties
Background: var(--bg2), Border-left: 3px solid var(--accent).

## Sizes
Width: 100%, Height: 72px.

## Spacing
Padding: 10px 14px, margin-bottom: 8px.

## Typography
Title: Inter 12px Semibold. Price: Fira Code 12px.

## Icons
ti-shopping-cart, ti-arrow-right.

## Interactions
Clicking CTA opens remedies checkout.

## Animations
Subtle border hover effect.

## Accessibility
High text contrast.

## Responsive Behaviour
Adapts width.

## Developer Notes
Linked to active warning compliance states.

## Future Enhancements
Add dynamic bundle discounts.

---
# 62. Report Section

## Purpose
Document layout container within report generator views.

## Business Goal
Organizes layout report details clearly.

## Usage
Vastu Health Report checklist summaries.

## When to Use
On layout report summary pages.

## When NOT to Use
Inside general canvas dialogs.

## Variants
Chronological checklist section.

## States
Pass, Fail, Warning.

## Properties
Border-bottom: 1px solid var(--border), Padding-bottom: 16px.

## Sizes
Width: 100%, height: auto.

## Spacing
Margin-bottom: 24px.

## Typography
Title: Outfit 16px Bold. Body: Inter 13px Regular.

## Icons
ti-circle-check (Pass), ti-alert-triangle (Warning).

## Interactions
None.

## Animations
Fades in on page load.

## Accessibility
Aria compliance checked.

## Responsive Behaviour
Adapts to screen width.

## Developer Notes
Saves report summaries data.

## Future Enhancements
Add collapsible detail options.

---
# 63. Print Layout Block

## Purpose
A container that reformats content for print layouts.

## Business Goal
Provides clean printed layouts for offline sharing.

## Usage
Print checklists view layouts.

## When to Use
In reports tab print reviews.

## When NOT to Use
On general interactive screens.

## Variants
Print-friendly layout block.

## States
Ready to print.

## Properties
Uses @media print CSS rules, white background, black text.

## Sizes
Fits standard A4 paper size width.

## Spacing
Padding: 20mm margins.

## Typography
Header: Outfit 20pt Bold. Body: Inter 11pt Regular.

## Icons
None.

## Interactions
Triggers window.print() on click.

## Animations
None.

## Accessibility
High-contrast layout optimized for print.

## Responsive Behaviour
Forces page breaks on overflow.

## Developer Notes
Utilizes window.print() function call integrations.

## Future Enhancements
Add custom signature blocks.

---
# 64. AI Chat Bubble

## Purpose
Chat bubble dialogue for user and assistant messages.

## Business Goal
Provides a clean conversational interface with the AI.

## Usage
Inside the Acharya Chat assistant view.

## When to Use
For chat history messages.

## When NOT to Use
For static page checklists.

## Variants
User message (Right, purple), Acharya message (Left, grey).

## States
Default.

## Properties
Max-width: 75%, Corner-radius: 12px (adjusted by side alignment).

## Sizes
Width: auto, Max-width: 75%.

## Spacing
Padding: 10px 14px, Margin-bottom: 12px.

## Typography
Message text: Inter 13px Regular.

## Icons
Optional copy icon.

## Interactions
Double tapping copy icon copies message text to clipboard.

## Animations
Slide up and fade in on send.

## Accessibility
Aria attributes describe author and message contents.

## Responsive Behaviour
Adapts width.

## Developer Notes
Controlled by standard message state arrays.

## Future Enhancements
Add voice feedback playback buttons.

---
# 65. Acharya Response Card

## Purpose
Structured advice card returned by the AI assistant.

## Business Goal
Provides actionable Vastu advice from the AI assistant.

## Usage
Chat chatbot response list layouts.

## When to Use
To display layout recommendations from the AI assistant.

## When NOT to Use
For simple text messages.

## Variants
Vastu review advice card.

## States
Active, resolved.

## Properties
Background: var(--bg2), Border-left: 3px solid var(--accent).

## Sizes
Width: 100%, Height: auto.

## Spacing
Padding: 12px, margin-bottom: 10px.

## Typography
Title: Outfit 13px Bold. Advice text: Inter 12px.

## Icons
ti-wand, ti-plus.

## Interactions
Clicking 'Apply layout change' adjusts the canvas elements.

## Animations
Fade in on generation.

## Accessibility
Trap focus inside active response links.

## Responsive Behaviour
Adapts width.

## Developer Notes
Triggers onRoomsChange state updates.

## Future Enhancements
Add options to compare changes.

---
# 66. Voice Assistant Button

## Purpose
A button to toggle speech-to-text dictation.

## Business Goal
Improves accessibility for users who prefer voice commands.

## Usage
Chat interface query panel.

## When to Use
To dictate queries to the chat assistant.

## When NOT to Use
When typing queries.

## Variants
Microphone toggle button.

## States
Idle, recording.

## Properties
Border-radius: 50%, Background: var(--bg2).

## Sizes
Size: 40px x 40px, Icon size: 16px.

## Spacing
Margin-left: 8px.

## Typography
None.

## Icons
ti-microphone (Idle), ti-microphone-off (Recording).

## Interactions
Clicking toggles SpeechRecognition API listening state.

## Animations
Red border pulse when recording is active.

## Accessibility
Aria-label: 'Dictate query to Acharya'.

## Responsive Behaviour
Maintains size.

## Developer Notes
Requires window.webkitSpeechRecognition API.

## Future Enhancements
Add support for Indian regional languages.

---
# 67. Property Selector

## Purpose
A list item card to select a property type.

## Business Goal
Starts onboarding with property type selection.

## Usage
Step 1 Property Type form.

## When to Use
To select the property type (e.g. Villa, Flat).

## When NOT to Use
Inside general canvas dialogs.

## Variants
Interactive list card.

## States
Default, Active, Hover.

## Properties
Background: var(--bg2), Border: 1.5px solid var(--border).

## Sizes
Width: 100%, Min-height: 56px.

## Spacing
Padding: 16px, Margin-bottom: 12px.

## Typography
Label: Outfit 14px Bold.

## Icons
ti-home-2, ti-layout-grid.

## Interactions
Clicking card sets property type onboarding state.

## Animations
Active border fades in on select.

## Accessibility
High contrast ratio for text.

## Responsive Behaviour
Adapts width.

## Developer Notes
Saves state to onboarding property selector datasets.

## Future Enhancements
Add custom property type fields.

---
# 68. Project Switcher

## Purpose
A dropdown menu to switch between projects.

## Business Goal
Allows users to manage multiple project drafts easily.

## Usage
Editor header workspace switchers.

## When to Use
To switch between active project drafts.

## When NOT to Use
Within the wizard forms.

## Variants
Dropdown selector.

## States
Default, open, active.

## Properties
Background: var(--bg2), Border: 1px solid var(--border).

## Sizes
Height: 36px, Width: 180px.

## Spacing
Padding: 6px 12px.

## Typography
Project Title: Outfit 13px Bold.

## Icons
ti-selector.

## Interactions
Tapping switcher opens draft options list overlay.

## Animations
Dropdown list slides down on click.

## Accessibility
Aria attributes configured.

## Responsive Behaviour
Converts to native selector UI on mobile viewports.

## Developer Notes
Updates selected project index variables.

## Future Enhancements
Add automated syncing for collaborative drafts.

---
# 69. Workspace Tabs

## Purpose
Tab switcher to navigate between editor views.

## Business Goal
Organizes the workspace screens under a unified tab menu.

## Usage
Top of the editor screen workspace.

## When to Use
To switch between Canvas, Upload, and Analysis views.

## When NOT to Use
Within the wizard forms.

## Variants
Horizontal tab bar.

## States
Default, Active, Hover.

## Properties
Flat border-bottom, Active item highlighted in purple.

## Sizes
Height: 44px, Tab padding: 8px 16px.

## Spacing
Gaps: 8px.

## Typography
Tab Label: Outfit 13px Bold.

## Icons
ti-layout-grid, ti-cloud-upload, ti-chart-bar.

## Interactions
Clicking tab changes the active workspace view.

## Animations
Active border underline slides on select.

## Accessibility
Aria role set to tablist.

## Responsive Behaviour
Fits screen width on mobile viewports.

## Developer Notes
Updates `activeTab` state variable.

## Future Enhancements
Add notifications count badges to tabs.

---
# 70. Floating Property Actions

## Purpose
Floating quick-action buttons on mobile canvasses.

## Business Goal
Improves access to common canvas commands on mobile.

## Usage
Workspace editor canvas overlay.

## When to Use
To trigger quick actions (Grid, Vastu, Clear) on mobile.

## When NOT to Use
On desktop viewports.

## Variants
Compact floating buttons bar.

## States
Visible, hidden.

## Properties
Background: rgba(28, 29, 32, 0.95), border-radius: 20px.

## Sizes
Height: 44px, width: auto.

## Spacing
Margin: 12px, padding: 4px 12px.

## Typography
Label: Inter 11px Medium.

## Icons
ti-grid-pattern, ti-compass-filled, ti-trash-filled.

## Interactions
Tapping toggles grids or clears the canvas.

## Animations
Fades in on canvas load.

## Accessibility
Aria attributes describe actions.

## Responsive Behaviour
Active only on mobile screens.

## Developer Notes
Controls showNormalGrid and showVastuGrid states.

## Future Enhancements
Add quick undo-redo actions buttons.

---
