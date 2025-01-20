import React, { useState } from 'react';
import './ComponentInspector.css';

interface InspectorInfo {
  top: number;
  left: number;
  width: number;
  height: number;
}

export const ComponentInspector: React.FC<{
  children: React.ReactNode;
  componentName: string;
  mfName: string;
}> = ({ children, componentName, mfName }) => {
  const [inspectorInfo, setInspectorInfo] = useState<InspectorInfo | null>(
    null,
  );

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setInspectorInfo({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    });
  };

  const handleMouseLeave = () => {
    setInspectorInfo(null);
  };

  return (
    <div
      className="component-inspector"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {inspectorInfo && (
        <>
          <div
            className="inspector-info"
            style={{
              top: `${inspectorInfo.top - 30}px`,
              left: `${inspectorInfo.left}px`,
              width: `${inspectorInfo.width}px`,
            }}
          >
            <span className="mf-tag">{mfName}</span>
            <span className="divider">|</span>
            <span className="gradient-text">{componentName}</span>
          </div>
          <div
            className="inspector-overlay"
            style={{
              top: `${inspectorInfo.top}px`,
              left: `${inspectorInfo.left}px`,
              width: `${inspectorInfo.width}px`,
              height: `${inspectorInfo.height}px`,
            }}
          />
        </>
      )}
    </div>
  );
};
