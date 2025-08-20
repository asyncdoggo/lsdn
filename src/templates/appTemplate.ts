import { headerTemplate } from './header';
import { resolutionSectionTemplate } from './resolutionSection';
import { textToImageSectionTemplate } from './textToImageSection';
import { actionSectionTemplate } from './actionSection';
import { canvasSectionTemplate } from './canvasSection';

export const appTemplate = `
  <div class="app-container">
    ${headerTemplate}
    
    <div class="main-content">
      <div class="controls-panel">
        ${resolutionSectionTemplate}
        ${textToImageSectionTemplate}
        ${actionSectionTemplate}
      </div>

      ${canvasSectionTemplate}
    </div>
  </div>
`;
