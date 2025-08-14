import { categoryTabsTemplate } from './categoryTabs';
import { basicPatternTemplate } from './patterns/basicPatterns';
import { geometricPatternTemplate } from './patterns/geometricPatterns';
import { naturalPatternTemplate } from './patterns/naturalPatterns';
import { structuralPatternTemplate } from './patterns/structuralPatterns';
import { texturePatternTemplate } from './patterns/texturePatterns';
import { abstractPatternTemplate } from './patterns/abstractPatterns';
import { cosmicPatternTemplate } from './patterns/cosmicPatterns';
import { architecturalPatternTemplate } from './patterns/architecturalPatterns';
import { glitchPatternTemplate } from './patterns/glitchPatterns';

export const patternSectionTemplate = `
  <div class="pattern-section">
    <h3>Pattern Category</h3>
    ${categoryTabsTemplate}
    
    <div class="pattern-grid">
      ${basicPatternTemplate}
      ${geometricPatternTemplate}
      ${naturalPatternTemplate}
      ${structuralPatternTemplate}
      ${texturePatternTemplate}
      ${abstractPatternTemplate}
      ${cosmicPatternTemplate}
      ${architecturalPatternTemplate}
      ${glitchPatternTemplate}
    </div>
  </div>
`;
