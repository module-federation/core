import type React from 'react';
import './ComponentInspector.css';
import { ToastContainer, toast } from 'react-toastify';
import CopyIcon from './copy.svg';
import 'react-toastify/dist/ReactToastify.css';

interface InspectorInfo {
  top: number;
  left: number;
  width: number;
  height: number;
}

export const wrapComponent = ({
  react,
  CustomComponent,
  componentName,
  mfName,
  versionOrEntry,
}: {
  react: typeof React;
  CustomComponent: React.ComponentType;
  componentName: string;
  mfName: string;
  versionOrEntry?: string;
}) => {
  const ComponentInspector: React.FC<{
    children: React.ReactNode;
    componentName: string;
    mfName: string;
    versionOrEntry?: string;
  }> = ({ children, componentName, mfName, versionOrEntry }) => {
    const [inspectorInfo, setInspectorInfo] =
      react.useState<InspectorInfo | null>(null);
    const componentRef = react.useRef<HTMLDivElement>(null);
    const trackedElementRef = react.useRef<HTMLDivElement | null>(null);
    const leaveTimeoutRef = react.useRef<NodeJS.Timeout | null>(null);
    const frameRequestRef = react.useRef<number | null>(null);
    const isMouseOverInspectorInfoRef = react.useRef(false);
    const [inspectedElement, setInspectedElement] =
      react.useState<HTMLDivElement | null>(null);

    const updateInspectorPosition = react.useCallback(() => {
      const element = trackedElementRef.current;
      if (!element) {
        return;
      }

      const rect = element.getBoundingClientRect();
      setInspectorInfo((previous) => {
        if (
          previous &&
          previous.top === rect.top &&
          previous.left === rect.left &&
          previous.width === rect.width &&
          previous.height === rect.height
        ) {
          return previous;
        }
        return {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        };
      });
    }, []);

    const scheduleInspectorUpdate = react.useCallback(() => {
      if (typeof window === 'undefined') {
        updateInspectorPosition();
        return;
      }

      if (frameRequestRef.current !== null) {
        return;
      }

      frameRequestRef.current = window.requestAnimationFrame(() => {
        frameRequestRef.current = null;
        updateInspectorPosition();
      });
    }, [updateInspectorPosition]);

    const clearInspector = react.useCallback(() => {
      trackedElementRef.current = null;
      setInspectedElement(null);
      if (frameRequestRef.current !== null && typeof window !== 'undefined') {
        window.cancelAnimationFrame(frameRequestRef.current);
        frameRequestRef.current = null;
      }
      setInspectorInfo(null);
    }, []);

    const showInspector = react.useCallback(
      (element: HTMLDivElement) => {
        trackedElementRef.current = element;
        setInspectedElement(element);
        updateInspectorPosition();
        scheduleInspectorUpdate();
      },
      [scheduleInspectorUpdate, updateInspectorPosition],
    );

    const shouldKeepInspectorVisible = react.useCallback(() => {
      if (typeof window === 'undefined') {
        return false;
      }
      try {
        return localStorage.getItem('mf-inspector-show') === 'all';
      } catch (error) {
        return false;
      }
    }, []);

    const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
      showInspector(e.currentTarget);
    };

    const handleMouseLeave = () => {
      if (leaveTimeoutRef.current) {
        clearTimeout(leaveTimeoutRef.current);
      }

      if (shouldKeepInspectorVisible()) {
        return;
      }

      leaveTimeoutRef.current = setTimeout(() => {
        if (!isMouseOverInspectorInfoRef.current) {
          clearInspector();
        }
        leaveTimeoutRef.current = null;
      }, 50);
    };

    react.useEffect(() => {
      if (typeof window === 'undefined') {
        return;
      }

      const checkLocalStorage = () => {
        if (shouldKeepInspectorVisible() && componentRef.current) {
          showInspector(componentRef.current);
        } else if (!isMouseOverInspectorInfoRef.current) {
          clearInspector();
        }
      };

      checkLocalStorage();

      const handleStorageChange = (event: StorageEvent) => {
        if (event.key === 'mf-inspector-show') {
          checkLocalStorage();
        }
      };

      window.addEventListener('storage', handleStorageChange);

      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    }, [clearInspector, shouldKeepInspectorVisible, showInspector]);

    const inspectorVisible = inspectorInfo !== null;

    react.useEffect(() => {
      if (!inspectorVisible || typeof window === 'undefined') {
        return;
      }

      const handleScrollOrResize = () => {
        scheduleInspectorUpdate();
      };

      window.addEventListener('scroll', handleScrollOrResize, true);
      window.addEventListener('resize', handleScrollOrResize);

      let resizeObserver: ResizeObserver | null = null;
      if (typeof ResizeObserver !== 'undefined' && inspectedElement) {
        resizeObserver = new ResizeObserver(() => {
          scheduleInspectorUpdate();
        });
        resizeObserver.observe(inspectedElement);
      }

      scheduleInspectorUpdate();

      return () => {
        window.removeEventListener('scroll', handleScrollOrResize, true);
        window.removeEventListener('resize', handleScrollOrResize);
        if (resizeObserver) {
          resizeObserver.disconnect();
        }
      };
    }, [inspectorVisible, inspectedElement, scheduleInspectorUpdate]);

    react.useEffect(() => {
      return () => {
        if (leaveTimeoutRef.current) {
          clearTimeout(leaveTimeoutRef.current);
        }
        if (frameRequestRef.current !== null && typeof window !== 'undefined') {
          window.cancelAnimationFrame(frameRequestRef.current);
          frameRequestRef.current = null;
        }
      };
    }, []);

    return (
      <div
        ref={componentRef}
        className="component-inspector"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
        {inspectorInfo && (
          <>
            <div
              onMouseEnter={() => {
                setIsMouseOverInspectorInfo(true);
                if (leaveTimeout) {
                  clearTimeout(leaveTimeout);
                  leaveTimeout = null;
                }
              }}
              onMouseLeave={() => {
                setIsMouseOverInspectorInfo(false);
                // If not 'all', hide when mouse leaves info box
                if (localStorage.getItem('mf-inspector-show') !== 'all') {
                  setInspectorInfo(null);
                }
              }}
              className="inspector-info"
              style={{
                top: `${inspectorInfo.top - 30}px`,
                left: `${inspectorInfo.left - 6}px`,
                width: `${inspectorInfo.width + 12}px`,
              }}
            >
              <span className="mf-info">
                <img
                  src="https://module-federation.io/svg.svg"
                  className="mf-img"
                />
                <span className="mf-tag">{componentName}</span>
                <span className="mf-tag">|</span>
                <span className="mf-tag">{mfName}</span>
                {versionOrEntry ? (
                  <>
                    <span className="mf-tag">|</span>
                    <span className="mf-tag">{versionOrEntry}</span>
                  </>
                ) : null}
              </span>
              <img
                className="copy-btn"
                src={CopyIcon}
                onClick={async () => {
                  const textToCopy = JSON.stringify(
                    {
                      componentName,
                      mfName,
                      ...(versionOrEntry && { versionOrEntry }),
                    },
                    null,
                    2,
                  );
                  try {
                    await navigator.clipboard.writeText(textToCopy);
                    toast.success('Copy succeed!', { autoClose: 2000 });
                  } catch (err) {
                    toast.error('Copy failed!', { autoClose: 2000 });
                    console.error('Failed to copy: ', err);
                  }
                }}
                alt="Copy"
                style={{ width: '16px', height: '16px' }}
              />
            </div>
            <ToastContainer />
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

  return (
    <ComponentInspector
      componentName={componentName}
      mfName={mfName}
      versionOrEntry={versionOrEntry}
    >
      <CustomComponent />
    </ComponentInspector>
  );
};
