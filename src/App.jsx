import {publicAsset} from './game/publicAsset.js';
import {clearBattleProgress,resolveCampaignBattle} from './game/battleStorage.js';
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Archive, BookOpen, Download, Home, RotateCcw, Scale, Swords, Upload } from 'lucide-react';
import { ADVISORS, applyBattleResult, applyChoice, campaignReport, METRIC_DEFINITIONS, previewChoice, SCENARIOS } from './game/campaign.js';
import { clearCampaign, freshCampaign, importCampaignResult, loadCampaign, saveCampaign, serializeCampaign } from './game/storage.js';
import { getCampaignScene } from './game/scenes.js';
import { presentScenario, campaignEnding } from './game/campaignNarrative.js';
import { HistoricalContext } from './components/HistoricalContext.jsx';
import { CampaignDialog } from './components/CampaignDialog.jsx';

const TrentonEncounter = lazy(() => import('./components/TrentonEncounter.jsx').then((module) => ({ default: module.TrentonEncounter })));
const getScenario = (id) => SCENARIOS.find((scenario) => scenario.id === id) || SCENARIOS[0];

function downloadText(filename, text) {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function MetricChanges({ effects = {} }) {
  return <div className="effect-ledger">{Object.entries(effects).map(([key, value]) => <span className={value >= 0 ? 'gain' : 'cost'} key={key}>{METRIC_DEFINITIONS.find((metric) => metric.id === key)?.short} {value > 0 ? '+' : ''}{value}</span>)}</div>;
}

export function App() {
  const [initialCampaign] = useState(() => loadCampaign());
  const [state, setState] = useState(() => initialCampaign || freshCampaign());
  const [practiceBattle, setPracticeBattle] = useState(null);
  const [commandPractice, setCommandPractice] = useState(false);
  const [practiceOpen, setPracticeOpen] = useState(false);
  const [screen, setScreen] = useState('home');
  const [battle, setBattle] = useState(() => Boolean(state.pendingBattle));
  const [contextOpen, setContextOpen] = useState(false);
  const [walkthrough, setWalkthrough] = useState(() => !initialCampaign);
  const [aftermath, setAftermath] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [importError, setImportError] = useState('');
  const [storageError, setStorageError] = useState('');
  const [campaignStarted, setCampaignStarted] = useState(() => Boolean(initialCampaign));
  const importInput = useRef(null);
  const scenario = useMemo(() => presentScenario(state, getScenario(state.scenarioId)), [state]);
  const scene = useMemo(() => scenario.id === 'yorktown_siege' && state.flags?.newYorkPriority ? { ...getCampaignScene('new_york_defense'), label: 'THE NEW YORK FRONT' } : getCampaignScene(scenario.id), [scenario.id, state.flags?.newYorkPriority]);

  useEffect(() => {
    if (screen === 'home' && !campaignStarted) return;
    const result = saveCampaign(state);
    setStorageError(result.ok ? '' : result.error);
  }, [campaignStarted, screen, state]);
  useEffect(() => { document.getElementById('game-content')?.scrollTo({ top: 0, behavior: 'auto' }); }, [screen, battle, practiceBattle, state.scenarioId, state.completed]);

  const beginNew = () => {
    clearBattleProgress();
    const cleared = clearCampaign();
    setStorageError(cleared.ok ? '' : cleared.error);
    setState(freshCampaign());
    setBattle(false);
    setAftermath(null);
    setWalkthrough(true);
    setConfirmReset(false);
    setCampaignStarted(true);
    setScreen('campaign');
  };

  const choose = (choice) => {
    const next = applyChoice(state, scenario, choice);
    setState(next);
    if (choice.battle) {
      setBattle(true);
      return;
    }
    setAftermath({
      date: scenario.date,
      title: choice.title,
      effects: next.history.at(-1)?.effects,
      modifiers: next.history.at(-1)?.modifiers || [],
      nextTitle: choice.next ? presentScenario(next, getScenario(choice.next)).title : 'The campaign reaches its reckoning',
    });
  };

  const exportSave = () => downloadText('titans-of-war-revolution-save.json', serializeCampaign(state));
  const handleImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    let text;
    try { text = await file.text(); }
    catch {
      event.target.value = '';
      setImportError('That save file could not be read. Choose the file again or export a new copy.');
      return;
    }
    const result = importCampaignResult(text);
    event.target.value = '';
    if (!result.state) {
      setImportError(result.error);
      return;
    }
    setImportError('');
    clearBattleProgress();
    setState(result.state);
    setBattle(Boolean(result.state.pendingBattle));
    setCampaignStarted(true);
    setScreen('campaign');
  };

  if (practiceBattle) return <Suspense fallback={<p>Preparing battlefield…</p>}><TrentonEncounter practice tutorial={commandPractice} key={`${practiceBattle}-${commandPractice ? 'tutorial' : 'practice'}`} battleId={practiceBattle} onResolve={() => { setPracticeOpen(true); setPracticeBattle(null); setCommandPractice(false); }} /></Suspense>;

  if (screen === 'home') {
    return <main className="title-screen">
      <img src={publicAsset('/images/campaign/yorktown-1781.webp')} alt="Allied siege lines overlooking Yorktown" />
      <div className="title-shade" />
      <div className="title-brand"><span>TF</span><p>Titans Forge</p></div>
      <section className="title-copy">
        <p className="eyebrow">1775–1781 · Local-first historical strategy</p>
        <h1><span>Titans of War</span>Revolution</h1>
        <p>Command an army that barely exists. Hold thirteen governments together. Turn survival into alliance, and alliance into victory.</p>
        <div className="title-actions">
          {campaignStarted && <button className="primary" onClick={() => setScreen('campaign')}>Continue campaign</button>}
          <button className={campaignStarted ? '' : 'primary'} onClick={() => campaignStarted ? setConfirmReset(true) : beginNew()}>New campaign</button>
          <button onClick={() => importInput.current?.click()}><Upload /> Import save</button>
          <button onClick={() => { setCommandPractice(true); setPracticeBattle('trenton'); }}><Swords /> Command practice</button>
        </div>
        <details className="practice-menu" open={practiceOpen} onToggle={(event) => setPracticeOpen(event.currentTarget.open)}><summary>Practice a battle</summary><p>Neutral supplies and training. Your campaign is unchanged.</p><div className="title-actions">{[['bunker_hill', 'Bunker Hill'], ['long_island', 'Long Island'], ['trenton', 'Trenton'], ['brandywine', 'Brandywine'], ['saratoga', 'Saratoga'], ['monmouth', 'Monmouth'], ['cowpens', 'Cowpens']].map(([id, title]) => <button key={id} onClick={() => { setCommandPractice(false); setPracticeBattle(id); }}>{title}</button>)}</div></details>
        <small>Deterministic campaign · Seven playable battles · No account or connection required</small>
        {importError && <p className="import-error">{importError}</p>}
        {storageError && <p className="import-error" role="alert">{storageError} The Save button still exports a local file.</p>}
      </section>
      <input ref={importInput} hidden type="file" accept="application/json,.json" onChange={handleImport} />
      {confirmReset && <ResetDialog onExport={exportSave} onReset={beginNew} onCancel={() => setConfirmReset(false)} />}
    </main>;
  }

  if (battle) return <Suspense fallback={<div className="battle-loading"><Swords /><strong>Deploying formations</strong></div>}><TrentonEncounter battleId={state.pendingBattle || 'trenton'} campaignState={state} onResolve={(result) => { const saved=resolveCampaignBattle(state,result); if(saved.ok){setState(saved.state);setBattle(false);} return saved; }} /></Suspense>;

  if (state.completed) {
    const report = campaignReport(state.metrics, state.history);
    const ending = campaignEnding(state);
    return <div className="ending-screen">
      <div className="ending-copy"><p className="eyebrow">{ending.place}</p><h1>{ending.title}</h1><p>{ending.text}</p>{storageError && <p className="import-error" role="alert">{storageError} Export campaign still creates a local file.</p>}<div className="final-grade"><span>Campaign grade</span><strong>{report.overall}</strong></div><div className="category-grades">{report.categories.map((category) => <article key={category.id}><strong>{category.grade}</strong><div><span>{category.label} · {category.score}</span><small>{category.note}</small></div></article>)}</div><div className="ending-actions"><button onClick={exportSave}><Download /> Export campaign</button><button onClick={() => setConfirmReset(true)}><RotateCcw /> Begin again</button></div></div>
      <div className="ending-ledger"><p className="eyebrow">Decision record</p>{state.history.map((entry, index) => <article key={`${entry.scenarioId}-${index}`}><span>{String(index + 1).padStart(2, '0')}</span><div><strong>{entry.title}</strong><small>{Object.entries(entry.effects || {}).map(([key, value]) => `${key} ${value > 0 ? '+' : ''}${value}`).join(' · ')}</small></div></article>)}</div>
      {confirmReset && <ResetDialog onExport={exportSave} onReset={beginNew} onCancel={() => setConfirmReset(false)} />}
    </div>;
  }

  return <div className="app-shell">
    <header className="topbar">
      <div className="brand-mark">TF</div><div className="brand"><p>Titans of War</p><h1>Revolution</h1></div>
      <div className="campaign-date"><span>{scenario.act}</span><strong>{scenario.date}</strong></div>
      <div className="top-actions"><button onClick={() => setScreen('home')}><Home /> Title</button><button onClick={() => setWalkthrough((value) => !value)}><BookOpen /> Guide</button><button onClick={exportSave}><Download /> Save</button><button onClick={() => setConfirmReset(true)}><RotateCcw /> Reset</button></div>
    </header>
    {walkthrough && <div className="walkthrough"><strong>Turn guide</strong><span>Read the crisis, compare the available courses, then choose the cost you can carry. High scores become harder to raise, while armies, credit, and public support continue to create obligations.</span><button onClick={() => setWalkthrough(false)}>Understood</button></div>}
    {storageError && <p className="import-error" role="alert">{storageError} The Save button still exports a local file.</p>}
    <main className="campaign-grid">
      <aside className="metrics-panel"><p className="eyebrow">State of the cause</p><h2>Continental pressures</h2><div className="metrics-list">{METRIC_DEFINITIONS.map((metric) => <div className="metric" key={metric.id}><div><span>{metric.label}</span><strong>{Math.round(state.metrics[metric.id])}</strong></div><div className="meter" aria-label={`${metric.label}: ${Math.round(state.metrics[metric.id])} out of 100`}><i style={{ width: `${state.metrics[metric.id]}%` }} /></div></div>)}</div><div className="campaign-progress"><Archive /><div><span>Campaign progress</span><strong>Turn {Math.min(state.turn, SCENARIOS.length)} of {SCENARIOS.length}</strong></div></div></aside>
      <section className="decision-stage">
        <div className="stage-heading"><div><p className="eyebrow">{scenario.location}</p><h2>{scenario.title}</h2><span>{scenario.actor}</span></div><div className="stage-seal"><Scale /><span>Strategic council</span></div></div>
        <figure className="campaign-scene"><img src={publicAsset(scene.image)} alt={scene.label.toLowerCase()} style={{ objectPosition: scene.position }} /><div className="scene-vignette" /><figcaption>{scene.label}</figcaption></figure>
        <p className="scenario-summary">{scenario.summary}</p>
        <HistoricalContext scenarioId={scenario.id} open={contextOpen} onOpen={() => setContextOpen(true)} onClose={() => setContextOpen(false)} />
        <div className="choice-list">{scenario.choices.map((choice) => {
          const advisor = ADVISORS[choice.advisor];
          const { effects, modifiers, pressure, limited } = previewChoice(state, scenario, choice);
          return <button className="choice" key={choice.id} onClick={() => choose(choice)} style={{ '--advisor': advisor.color }}><span className="choice-letter">{choice.id.toUpperCase()}</span><div><div className="choice-head"><strong>{choice.title}</strong><span>{advisor.name}</span></div><p>{choice.text}</p>{modifiers.map((note,index) => <span className="choice-legacy" key={index}>Earlier decision matters · {note}</span>)}<small className="choice-legacy">Net change this turn{Object.keys(pressure).length ? ' · Includes upkeep and shortages' : ''}{limited ? ' · Resource limits included' : ''}</small><MetricChanges effects={effects} />{choice.battle && <small className="choice-legacy">Play tactical battle · deploy paused, then begin when ready</small>}</div>{choice.battle && <Swords className="battle-icon" />}</button>;
        })}</div>
      </section>
      <aside className="council-panel"><p className="eyebrow">Council voices</p><h2>Three claims on power</h2>{Object.entries(ADVISORS).map(([id, advisor]) => <article key={id} style={{ '--advisor': advisor.color }}><span>{advisor.name.slice(0, 1)}</span><div><strong>{advisor.name}</strong><small>{advisor.role}</small><p>{id === 'firebrand' ? 'A republic must show that defeat cannot extinguish public resistance.' : id === 'professional' ? 'Ground can be yielded. A trained army, once lost, cannot be recalled by proclamation.' : 'Foreign courts and domestic creditors judge whether the cause can govern as well as resist.'}</p></div></article>)}</aside>
    </main>
    {aftermath && <CampaignDialog className="aftermath" labelledBy="aftermath-title" onClose={() => setAftermath(null)}><p className="eyebrow">Decision entered · {aftermath.date}</p><h2 id="aftermath-title">{aftermath.title}</h2><MetricChanges effects={aftermath.effects} />{aftermath.modifiers.map((modifier) => <p className="aftermath-legacy" key={modifier}>{modifier}</p>)}<div className="aftermath-next"><span>Next dispatch</span><strong>{aftermath.nextTitle}</strong></div><button autoFocus data-dialog-safe onClick={() => setAftermath(null)}>Continue campaign</button></CampaignDialog>}
    {confirmReset && <ResetDialog onExport={exportSave} onReset={beginNew} onCancel={() => setConfirmReset(false)} />}
  </div>;
}

function ResetDialog({ onExport, onReset, onCancel }) {
  return <CampaignDialog className="confirm-dialog" labelledBy="reset-title" onClose={onCancel}><p className="eyebrow">New campaign</p><h2 id="reset-title">Replace the current campaign?</h2><p>Export the current save first if you want to keep it.</p><div><button onClick={onExport}><Download /> Export save</button><button className="danger" onClick={onReset}>Replace and begin</button><button autoFocus data-dialog-safe onClick={onCancel}>Cancel</button></div></CampaignDialog>;
}
