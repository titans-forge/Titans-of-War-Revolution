import { useEffect, useRef } from 'react';

export function BattleDialog({ title, onClose, children }) {
  const dialog = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    const element = dialog.current;
    if (!element.open) element.showModal();
    return () => {
      if (element.open) element.close();
      if (previous?.isConnected) previous.focus();
    };
  }, []);
  return <dialog ref={dialog} className="battle-guide" aria-label={title} onCancel={event => { event.preventDefault(); onClose(); }}><button autoFocus className="guide-close" onClick={onClose}>Close</button><h2>{title}</h2>{children}</dialog>;
}
