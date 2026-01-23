import React, { useState, useEffect } from 'react';
import styles from './index.module.scss';

export interface CodeFileDescriptor {
  id: string;
  label: string;
  filename?: string;
  language?: string;
  code: string;
}

interface CodePreviewProps {
  files: CodeFileDescriptor[];
  emptyHint?: string;
}

const CodePreview: React.FC<CodePreviewProps> = ({ files, emptyHint }) => {
  const [activeId, setActiveId] = useState<string | undefined>(files[0]?.id);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!files.length) {
      setActiveId(undefined);
      return;
    }
    if (!activeId || !files.some((file) => file.id === activeId)) {
      setActiveId(files[0].id);
    }
  }, [files, activeId]);

  const activeFile = files.find((file) => file.id === activeId);

  const handleCopy = async () => {
    if (!activeFile) return;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(activeFile.code);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = activeFile.code;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore copy errors
    }
  };

  if (!files.length || !activeFile) {
    return (
      <div className={styles.codePreviewEmpty}>
        {emptyHint ||
          'Adjust the configuration on the left to generate code snippets.'}
      </div>
    );
  }

  return (
    <div className={styles.codePreview}>
      <div className={styles.codeHeader}>
        <div className={styles.codeTabs}>
          {files.map((file) => (
            <button
              key={file.id}
              type="button"
              className={`${styles.codeTab} ${
                file.id === activeFile.id ? styles.codeTabActive : ''
              }`}
              onClick={() => setActiveId(file.id)}
            >
              {file.label}
            </button>
          ))}
        </div>
        <div className={styles.codeHeaderMeta}>
          {activeFile.filename ? (
            <span className={styles.codeFilename}>{activeFile.filename}</span>
          ) : null}
          <button
            type="button"
            className={styles.copyButton}
            onClick={handleCopy}
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>
      <pre className={styles.codeBlock}>
        <code>{activeFile.code}</code>
      </pre>
    </div>
  );
};

export default CodePreview;
