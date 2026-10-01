import { useEffect, useRef } from 'react';

export function CampaignDialog({ children, className = '', labelledBy, onClose }) {
  const dialog = useRef(null);

  useEffect(() => {
    const previous = document.activeElement;
    const element = dialog.current;
    if (element && !element.open) {
      element.showModal();
      element.querySelector('[data-dialog-safe]')?.focus();
    }
    return () => {
      if (element?.open) element.close();
      if (previous?.isConnected) previous.focus();
    };
  }, []);

  return <dialog
    ref={dialog}
    className={`campaign-dialog ${className}`.trim()}
    aria-labelledby={labelledBy}
    onCancel={(event) => { event.preventDefault(); onClose(); }}
  >{children}</dialog>;
}
