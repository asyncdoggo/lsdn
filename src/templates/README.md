# UI Template Structure

This directory contains the separated UI templates for better readability and maintainability.

## File Structure

```
templates/
├── index.ts                    # Main export file for all templates
├── appTemplate.ts             # Main app template that combines all sections
├── header.ts                  # App header with title and subtitle
├── resolutionSection.ts       # Resolution selection buttons
├── colorSection.ts            # Color mode toggle (B&W/Color)
├── generationModeSection.ts   # Mode toggle (Pattern/Text-to-Image)
├── textToImageSection.ts      # AI text-to-image controls
├── patternSection.ts          # Pattern category and grid container
├── categoryTabs.ts            # Pattern category tabs
├── actionSection.ts           # Generate, Stop, and Download buttons
├── canvasSection.ts           # Canvas container and loading overlay
└── patterns/                  # Individual pattern category templates
    ├── basicPatterns.ts
    ├── geometricPatterns.ts
    ├── naturalPatterns.ts
    ├── structuralPatterns.ts
    ├── texturePatterns.ts
    ├── abstractPatterns.ts
    ├── cosmicPatterns.ts
    ├── architecturalPatterns.ts
    └── glitchPatterns.ts
```

## Benefits

1. **Modularity**: Each UI section is in its own file, making it easier to locate and modify specific components.

2. **Maintainability**: Changes to individual sections don't require scrolling through a massive template string.

3. **Readability**: Smaller, focused files are easier to read and understand.

4. **Reusability**: Individual templates can be reused or combined in different ways.

5. **Type Safety**: TypeScript provides better intellisense and error checking for each template.

## Usage

Import the main template in your TypeScript files:

```typescript
import { appTemplate } from './templates';

// Use the complete app template
document.querySelector('#app')!.innerHTML = appTemplate;
```

Or import individual sections if needed:

```typescript
import { 
  headerTemplate, 
  patternSectionTemplate,
  actionSectionTemplate 
} from './templates';
```

## Adding New Patterns

To add a new pattern category:

1. Create a new file in `templates/patterns/` (e.g., `newCategoryPatterns.ts`)
2. Export a template constant with the pattern cards
3. Import and add it to `patternSection.ts`
4. Add the category tab to `categoryTabs.ts`
5. Update the exports in `index.ts`

## Modifying Existing Templates

Each template is a simple string constant. Make sure to:

- Maintain the existing CSS class names and structure
- Keep HTML IDs consistent for JavaScript event handling
- Test the changes by running the development server

## Development

Run the development server to see changes:

```bash
npm run dev
```

The templates are statically bundled, so changes will trigger a rebuild and hot reload.
