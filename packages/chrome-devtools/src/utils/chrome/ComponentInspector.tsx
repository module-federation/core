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

    const showInspector = (element: HTMLDivElement) => {
      const rect = element.getBoundingClientRect();
      setInspectorInfo({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    };

    const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
      showInspector(e.currentTarget);
    };

    const [isMouseOverInspectorInfo, setIsMouseOverInspectorInfo] =
      react.useState(false);

    let leaveTimeout: NodeJS.Timeout | null = null;

    const handleMouseLeave = () => {
      if (leaveTimeout) {
        clearTimeout(leaveTimeout);
      }
      leaveTimeout = setTimeout(() => {
        if (!isMouseOverInspectorInfo) {
          setInspectorInfo(null);
        }
      }, 50); // Add a small delay to allow mouse to enter the info box
    };

    react.useEffect(() => {
      const checkLocalStorage = () => {
        if (typeof window !== 'undefined') {
          const inspectorShow = localStorage.getItem('mf-inspector-show');
          if (inspectorShow === 'all' && componentRef.current) {
            showInspector(componentRef.current);
          } else if (inspectorShow !== 'all' && !isMouseOverInspectorInfo) {
            // If not 'all', and not hovered on component or info, hide it.
            // This check might be redundant if onMouseLeave handles it well.
            // setInspectorInfo(null);
          }
        }
      };

      checkLocalStorage(); // Check on mount

      // Optional: Listen for storage changes if you want it to be dynamic without page reload
      const handleStorageChange = (event: StorageEvent) => {
        if (event.key === 'mf-inspector-show') {
          checkLocalStorage();
        }
      };

      window.addEventListener('storage', handleStorageChange);

      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    }, []); // Empty dependency array means this effect runs once on mount and cleanup on unmount.

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
