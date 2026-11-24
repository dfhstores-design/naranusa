# NaraNusa character art

Flat, source-controlled SVG illustrations based on the character preview. The designs keep their identity anchors across every asset: Nara is a girl with black twin braids, a yellow star clip, a teal long-sleeved top, coral backpack straps, amber trousers, and white shoes. Nusa is a boy with tousled black hair, a coral-orange hoodie, a navy compass backpack, navy trousers, and white/blue shoes. Every expression and pose is a distinct illustration rather than a label-only reuse of generic art.

## Asset catalog

### Nara

- Expressions: `nara-expression-greeting.svg` (warm greeting smile), `nara-expression-thinking.svg` (gaze upward and hand at chin), `nara-expression-aha.svg` (bright realization), `nara-expression-celebrating.svg` (joyful celebration), and `nara-expression-gentle-concern.svg` (soft, caring concern).
- Poses: `nara-pose-wave.svg` (wave hello), `nara-pose-holding-book.svg` (holds an open book), `nara-pose-pointing.svg` (points toward a board/question), and `nara-pose-star-high-five.svg` (reaches up for a star high-five).
- Avatar: `nara-avatar.svg`.

### Nusa

- Expressions: `nusa-expression-thumbs-up.svg` (encouraging thumbs-up), `nusa-expression-surprised.svg` (playful surprise), `nusa-expression-confused.svg` (scratches his head), `nusa-expression-laughing.svg` (laughing), and `nusa-expression-ready.svg` (confident and ready).
- Poses: `nusa-pose-thumbs-up.svg` (gives a thumbs-up), `nusa-pose-holding-pencil.svg` (holds a pencil), `nusa-pose-looking-at-map.svg` (studies a map and compass), and `nusa-pose-jogging-backpack.svg` (jogs with his backpack).
- Avatar: `nusa-avatar.svg`.

All illustrations have transparent backgrounds; the compact avatars use circular backgrounds. The SVG colors follow the Naranusa palette. The rangkong logo is a separate brand asset, not a character.

## React API

`src/components/character-art.tsx` exports `CharacterArt`, `CharacterName`, the per-character expression/pose types, and the combined `CharacterExpression` and `CharacterPose` types. Its discriminated prop types prevent choosing a Nusa-only variant for Nara (or vice versa).

```tsx
import { CharacterArt } from "@/components/character-art";

<CharacterArt character="nara" variant={{ type: "expression", name: "aha" }} size={200} />
<CharacterArt character="nara" variant={{ type: "pose", name: "holding-book" }} size={240} />
<CharacterArt character="nusa" variant={{ type: "expression", name: "confused" }} size={200} />
<CharacterArt character="nusa" variant={{ type: "pose", name: "jogging-backpack" }} size={240} />
<CharacterArt character="nara" variant={{ type: "avatar" }} size={40} alt="Avatar Nara" />
```

When `variant` is omitted, Nara's waving pose or Nusa's thumbs-up pose is rendered. `CharacterArt` explicitly prefixes local Next Image sources with `/naranusa`, matching the app's static-export `basePath`.
