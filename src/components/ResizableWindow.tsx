import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import "../styles/resizableWindow.css";

interface ResizableWindowProps {
  left: React.ReactNode;
  right: React.ReactNode;
  leftDefaultSize?: number; // percent
  rightDefaultSize?: number; // percent
  minSize?: number; // percent
}

export default function ResizableWindow({
  left,
  right,
  leftDefaultSize = 50,
  rightDefaultSize = 50,
  minSize = 20,
}: ResizableWindowProps) {
  return (
    <div className="resizable-window">
      <PanelGroup direction="horizontal">
        {/* Left Panel */}
        <Panel defaultSize={leftDefaultSize} minSize={minSize}>
          <div className="panel-content">{left}</div>
        </Panel>

        {/* Resize Handle */}
        <PanelResizeHandle className="resize-handle" />

        {/* Right Panel */}
        <Panel defaultSize={rightDefaultSize} minSize={minSize}>
          <div className="panel-content">{right}</div>
        </Panel>
      </PanelGroup>
    </div>
  );
}
