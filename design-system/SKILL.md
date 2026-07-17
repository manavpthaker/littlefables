---
name: little-fables-design
description: Use this skill to generate well-branded interfaces and assets for Little Fables, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.
If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.
If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

Key files: `readme.md` (foundations, content + visual rules, component index), `styles.css` + `tokens/` (CSS custom properties; `tokens/tokens.json` mirror), `guidelines/rules-of-use.md` (composition, voice-slot spec, accessibility, density), `components/` (React primitives), `ui_kits/little-fables/` (five proof screens).
Non-negotiables: kid surfaces speak (utterance slot), terracotta = action, no red/failure states for kids, `[data-density="parent"]` for adult surfaces, everything over art goes in a scrim/capsule/panel.
