import { useEffect, useRef } from 'react';

export function useAutoResizeTextarea(minRows = 1, maxRows = 10) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const handleResize = () => {
      if (textareaRef.current) {
        const textarea = textareaRef.current;
        textarea.style.height = 'auto';
        textarea.style.height = `${Math.min(
          textarea.scrollHeight,
          maxRows * 16 + 24
        )}px`;
      }
    };

    handleResize();

    if (textareaRef.current) {
      textareaRef.current.addEventListener('input', handleResize);
    }

    return () => {
      if (textareaRef.current) {
        textareaRef.current.removeEventListener('input', handleResize);
      }
    };
  }, [minRows, maxRows]);

  return textareaRef;
}
