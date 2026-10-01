import { useEffect, useRef } from 'react';
import { BookOpen, X } from 'lucide-react';
import { PRIMERS, PRIMER_BY_SCENARIO } from '../game/campaign.js';

export function HistoricalContext({ scenarioId, open, onOpen, onClose }) {
  const primerIds = PRIMER_BY_SCENARIO[scenarioId] || [];
  const closeButton = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const previousFocus = document.activeElement;
    closeButton.current?.focus();
    const handleKeyDown = (event) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      previousFocus?.focus?.();
    };
  }, [onClose, open]);

  if (!open) {
    return <button className="context-trigger" onClick={onOpen}><BookOpen /> Historical context <span>{primerIds.length}</span></button>;
  }
  return (
    <div className="context-overlay" role="dialog" aria-modal="true" aria-label="Historical context" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="context-panel">
        <header><div><p className="eyebrow">Evidence desk</p><h2>Historical context</h2></div><button ref={closeButton} className="icon-button" onClick={onClose} aria-label="Close historical context"><X /></button></header>
        <div className="primer-list">
          {primerIds.map((id) => <article key={id}><h3>{PRIMERS[id].title}</h3><p>{PRIMERS[id].body}</p><small>{PRIMERS[id].sources}</small></article>)}
        </div>
      </section>
    </div>
  );
}
