import { headerTemplate } from './header';
import { resolutionSectionTemplate } from './resolutionSection';
import { colorSectionTemplate } from './colorSection';
import { generationModeSectionTemplate } from './generationModeSection';
import { textToImageSectionTemplate } from './textToImageSection';
import { patternSectionTemplate } from './patternSection';
import { actionSectionTemplate } from './actionSection';
import { canvasSectionTemplate } from './canvasSection';

export const appTemplate = `
  <div class="app-container">
    ${headerTemplate}
    
    <div class="main-content">
      <div class="controls-panel">
        ${resolutionSectionTemplate}
        ${colorSectionTemplate}
        ${generationModeSectionTemplate}
        ${textToImageSectionTemplate}
        ${patternSectionTemplate}
        ${actionSectionTemplate}
      </div>

      ${canvasSectionTemplate}
    </div>
  </div>
`;
