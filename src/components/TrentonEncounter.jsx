import { withdrawalAdvice } from '../battle/withdrawalAdvice.js';
import {loadBattleProgress,saveBattleProgress} from '../game/battleStorage.js';
import {HistoricalLandmarks} from './HistoricalLandmarks.jsx';
import {startingAmmunition,CAMPAIGN_CHECKPOINT_NOTE} from '../battle/battleBriefing.js';
import { useCallback, useMemo, useRef, useState } from 'react';
import { FastForward, Minus, Pause, Plus, Shield, Swords, Undo2 } from 'lucide-react';
import { TrentonBattlefield } from '../battle/TrentonBattlefield.jsx';
import { BattleObjective, objectiveSummary } from './BattleObjective.jsx';
import { BattleDialog } from './BattleDialog.jsx';
import { BattleAudio } from './BattleAudio.jsx';
import { BattleGuide, formationAdvice } from './BattleGuide.jsx';
import { BattleTutorial } from './BattleTutorial.jsx';
import { battleDebrief } from '../battle/battleDebrief.js';
import { commandIndicator } from '../battle/commandIndicator.js';
import { weaponStatus } from '../battle/infantryAnimation.js';
import { getBattleDefinition } from '../battle/battleDefinitions.js';

export function TrentonEncounter({ battleId = 'trenton', campaignState, onResolve, practice = false, tutorial = false }) {
  const definition = getBattleDefinition(battleId);
  const [savedBattle]=useState(()=>practice ? {checkpoint:null,error:''} : loadBattleProgress(campaignState));
  const [checkpointStatus,setCheckpointStatus]=useState({time:null,error:savedBattle.error});
  const [restoreNotice,setRestoreNotice]=useState('');
  const resolving=useRef(false);
  const resolveBattle=result=>{if(resolving.current)return;resolving.current=true;const saved=onResolve(result);if(saved?.ok===false){resolving.current=false;setCheckpointStatus({time:null,error:saved.error});}};
  const onCheckpoint=useCallback(checkpoint=>{
    if(practice || resolving.current)return;
    const result=saveBattleProgress(campaignState,checkpoint);
    setCheckpointStatus({time:result.ok ? checkpoint.engine.time : null,error:result.error});
  },[campaignState,practice]);
  const onRestore=useCallback(result=>setRestoreNotice(result.restored ? 'Battle checkpoint restored.' : result.error || ''),[]);
  const battlefield = useRef(null);
  const [leaving, setLeaving] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [logOpen,setLogOpen] = useState(false);
  const [inspectResult,setInspectResult] = useState(false);
  const [tutorialOpen,setTutorialOpen] = useState(tutorial);
  const [tutorialEvent,setTutorialEvent] = useState(null);
  const tutorialSequence = useRef(0);
  const logSpeed = useRef(0);
  const guideSpeed = useRef(0);
  const resumeSpeed = useRef(0);
  const [speed, setSpeed] = useState(0);
  const [selectedId, setSelectedId] = useState(()=>definition.formations.some(u=>u.side==='continental'&&u.id===savedBattle.checkpoint?.selectedId)?savedBattle.checkpoint.selectedId:definition.defaultSelection);
  const [snapshot, setSnapshot] = useState(null);
  const emitTutorialEvent = useCallback((event) => {
    if (!tutorial || !event?.accepted) return;
    tutorialSequence.current += 1;
    setTutorialEvent({ ...event, sequence: tutorialSequence.current });
  }, [tutorial]);
  const onSnapshot = useCallback((value) => setSnapshot(value), []);
  const selectFormation = useCallback((unitId) => {
    setSelectedId(unitId);
    const unit = snapshot?.formations.find((entry) => entry.id === unitId && entry.side === 'continental');
    if (unit?.active && unit.status === 'steady') emitTutorialEvent({ type: 'select', unitId, accepted: true, battleTime: snapshot.time });
  }, [emitTutorialEvent, snapshot]);
  const onBattlefieldAction = useCallback((event) => emitTutorialEvent(event), [emitTutorialEvent]);
  const selected = useMemo(() => snapshot?.formations.find((unit) => unit.id === selectedId), [snapshot, selectedId]);
  const command = commandIndicator(selected, snapshot?.outcome, snapshot?.formations);
  const withdrawalWarning = withdrawalAdvice(selected, snapshot?.objective, snapshot?.outcome);
  const latestEvent = snapshot?.events?.at(-1);
  const showEvent = latestEvent && latestEvent.type !== 'objective' && snapshot.time - latestEvent.time < 10;
  const ammunitionAllowance=startingAmmunition(selected,definition);
  const canCommand = selected?.active && selected?.status !== 'routed';
  const completed = snapshot?.outcome && snapshot.outcome !== 'undecided';

  return (
    <div className="battle-shell">
      <header className="battle-header" inert={leaving ? true : undefined}>
        <div><p className="eyebrow">Field command · {definition.date}</p><h1>{definition.title}</h1></div>
        <div className="battle-objective"><strong>{completed ? snapshot.outcome === 'victory' ? 'The field objective is secured' : 'The engagement has ended' : definition.objective}</strong><span>{completed ? `Continental losses ${Math.round(snapshot.continentalLossRate * 100)}% · ${definition.enemyLabel} losses ${Math.round(snapshot.crownLossRate * 100)}%` : snapshot?.objective ? objectiveSummary(snapshot.objective) : definition.guidance}</span></div>
        <div className="speed-controls"><button className="text-control" onClick={()=>{logSpeed.current=speed;setSpeed(0);setLogOpen(true);}}>Reports</button><button className="text-control" onClick={() => { guideSpeed.current = speed; setSpeed(0); setGuideOpen(true); }}>Guide</button>{[0, 1, 2, 4].map((value) => <button key={value} className={speed === value ? 'active' : ''} onClick={() => setSpeed(value)} disabled={completed} aria-label={value === 0 ? 'Pause' : `${value} times speed`}>{value === 0 ? <Pause /> : value === 4 ? <FastForward /> : `${value}x`}</button>)}<button disabled={completed} onClick={() => { resumeSpeed.current = speed; setSpeed(0); setLeaving(true); }} aria-label={practice ? 'Leave practice battle' : 'Withdraw from the battle'}><Undo2 /></button></div>
      </header>
      {guideOpen && <BattleGuide definition={definition} onClose={() => { setGuideOpen(false); setSpeed(guideSpeed.current); }} />}
      {logOpen && <BattleDialog title="Field reports" onClose={()=>{setLogOpen(false);setSpeed(logSpeed.current);}}><p>{completed ? "Reports from the completed engagement." : "The battle is paused while you review reports."}</p>{!snapshot?.events?.length && <p>No field reports yet.</p>}<ol className="report-history">{snapshot?.events?.map((event,index)=><li key={index}><time>{Math.floor(event.time)}s</time> {event.message}</li>)}</ol></BattleDialog>}
      {leaving && <BattleDialog title={practice ? 'Leave this practice battle?' : 'Withdraw the army?'} onClose={()=>{setLeaving(false);setSpeed(resumeSpeed.current);}}><p>{practice ? 'Your campaign is unchanged. This practice battle will end.' : definition.evacuation ? 'Ending this battle now records defeat. To earn an organized withdrawal, return to the field and use formation Withdraw orders to complete the displayed delaying action and troop preservation objective.' : 'This records a withdrawal in the campaign. To retreat only one formation, cancel and use its Withdraw order.'}</p><button onClick={() => { setLeaving(false); setSpeed(resumeSpeed.current); }}>Keep fighting</button><button onClick={() => resolveBattle(definition.evacuation && !practice ? 'defeat' : 'withdrawal')}>{practice ? 'Return to practice menu' : definition.evacuation ? 'End battle and accept defeat' : 'Confirm army withdrawal'}</button></BattleDialog>}
      {tutorialOpen && <BattleTutorial snapshot={snapshot} selectedId={selectedId} event={tutorialEvent} speed={speed} onCheckpoint={() => setSpeed(0)} onDismiss={() => setTutorialOpen(false)} />}
      <main className="battle-layout" inert={leaving ? true : undefined}>
        <aside className="formation-panel">
          <label htmlFor="formation-select">Your formations</label><select id="formation-select" value={selectedId} onChange={(event) => selectFormation(event.target.value)}>{snapshot?.formations.filter((unit) => unit.side === 'continental').map((unit) => <option key={unit.id} value={unit.id}>{unit.name}{!unit.active ? unit.entered ? unit.status === 'routed' ? ' · routed off field' : ' · withdrawn' : ' · reserve' : unit.status === 'routed' ? ' · routed' : ''}</option>)}</select>
          <h2>{selected?.name || 'Continental force'}</h2>
          <div className="unit-stats"><div className="stat-row"><span>Strength</span><strong>{selected ? `${Math.round(selected.strength)} / ${selected.initialStrength}` : '—'}</strong></div>
          <div className="stat-row"><span>Cohesion</span><strong>{Math.round(selected?.cohesion || 0)}%</strong></div>
          <div className="stat-row"><span>Morale</span><strong>{Math.round(selected?.morale || 0)}%</strong></div>
          <div className="stat-row"><span>Ammunition</span><strong>{selected?.ammunition ?? '—'}</strong></div></div>
          <div className="stat-row"><span>Orders</span><strong>{selected?.status !== 'steady' ? selected?.status : selected?.order === 'fallback' ? 'Fall back' : selected?.order}{selected?.order === 'reform' ? ` · ${Math.ceil(selected.reformRemaining)}s safe ground needed` : ''}</strong></div>
          {canCommand && !completed && <small className="attack-hint">Click clear ground to move. Shift-click occupied ground to move there; clicking a friendly formation selects it.</small>}
          {selected?.reformBlocked && !completed && <p className="formation-advice" role="status">Reform interrupted by nearby enemies. Fall back or move to safe ground, then order Reform again. Hold cancels Reform and resumes permitted fire.</p>}
          {command && <p className="formation-advice" role="status">{command.label === 'Destination' ? 'Move order received. Destination marked on the field.' : command.label}</p>}
          {withdrawalWarning && <p className="formation-advice" role="status">{withdrawalWarning}</p>}
          <div className="stat-row"><span>Ground</span><strong>{selected?.terrain || 'Open ground'}</strong></div>
          {formationAdvice(selected) && <p className="formation-advice" role="status">{formationAdvice(selected)}</p>}
          {selected?.type === 'infantry' && <div className="formation-modes">{['line', 'column', 'open'].map((mode) => <button key={mode} className={selected?.formationMode === mode ? 'active' : ''} disabled={completed || !canCommand} onClick={() => battlefield.current?.formation(mode)}>{mode}</button>)}</div>}
          <label htmlFor="attack-target">Attack target</label><select id="attack-target" disabled={completed || !canCommand} value={selected?.targetId || ''} onChange={(event) => event.target.value ? battlefield.current?.attack(event.target.value) : battlefield.current?.order('hold')}><option value="">No assigned target</option>{snapshot?.formations.filter(unit => unit.side === 'crown' && unit.active && unit.status !== 'routed').map(unit => <option key={unit.id} value={unit.id}>{unit.name}</option>)}</select><small className="attack-hint">Select an enemy to engage. Hold cancels the attack.</small>
          {canCommand && selected?.fireObstacle && <p role="status">{selected.order==='attack' ? 'A building blocks the shot. Seeking a clear firing position.' : 'A building blocks the shot. Attack the target to seek a clear firing position, or move the formation. Hold keeps this position.'}</p>}
          <fieldset className="fire-policy" disabled={completed || !canCommand}><legend>Fire discipline</legend>{[['free', 'Fire at will'], ['effective', 'Effective range'], ['hold', 'Hold fire']].map(([value, label]) => <button key={value} aria-pressed={selected?.firePolicy === value} onClick={() => battlefield.current?.firePolicy(value)}>{label}</button>)}<small aria-label="Weapon status">{weaponStatus(selected)}. Volley requests one shot.</small></fieldset>

          {snapshot?.objective && <BattleObjective goal={snapshot.objective} />}
          <div className="campaign-inheritance"><span>{practice ? 'Practice conditions' : 'Campaign inheritance'}</span><strong>Army {Math.round(campaignState?.metrics?.army ?? 50)} · Supply {Math.round(campaignState?.metrics?.supply ?? 50)}</strong><small>{practice ? 'Neutral army and supply settings for repeatable practice.' : 'Army and public support affect morale and cohesion. Supplies determine starting ammunition.'}</small></div>

          {ammunitionAllowance && <div className="campaign-inheritance"><span>Starting ammunition · selected formation</span><strong>{ammunitionAllowance.actual} / {ammunitionAllowance.standard} standard load</strong></div>}
          {!practice && <div className="battle-checkpoint"><p>{CAMPAIGN_CHECKPOINT_NOTE}</p>{restoreNotice && <p>{restoreNotice}</p>}{checkpointStatus.error ? <p role="alert">{checkpointStatus.error}</p> : checkpointStatus.time!==null && <p>Local checkpoint · battle time {Math.floor(checkpointStatus.time)}s</p>}</div>}
          <HistoricalLandmarks battleId={battleId} onLocate={landmark=>battlefield.current?.locateLandmark(landmark)} />
          <BattleAudio snapshot={snapshot} speed={speed} />
          <ol className="field-orders">{definition.orders.map((order) => <li key={order}>{order}</li>)}</ol>
        </aside>
        <section className="battle-frame">
          <TrentonBattlefield key={battleId} battleId={battleId} campaignContext={{ metrics: campaignState?.metrics, flags: campaignState?.flags }} ref={battlefield} speed={speed} selectedId={selectedId} onSelect={selectFormation} onSnapshot={onSnapshot} onAction={onBattlefieldAction} checkpoint={savedBattle.checkpoint} onCheckpoint={practice ? undefined : onCheckpoint} onRestore={onRestore} />
          <div className="zoom-controls"><button onClick={() => battlefield.current?.pan(-120, 0)} aria-label="Pan left">←</button><button onClick={() => battlefield.current?.pan(0, -120)} aria-label="Pan up">↑</button><button onClick={() => battlefield.current?.focus()} aria-label="Center selected formation">◎</button><button onClick={() => battlefield.current?.pan(0, 120)} aria-label="Pan down">↓</button><button onClick={() => battlefield.current?.pan(120, 0)} aria-label="Pan right">→</button><button onClick={() => battlefield.current?.zoom(0.1)} aria-label="Zoom in"><Plus /></button><button onClick={() => battlefield.current?.zoom(-0.1)} aria-label="Zoom out"><Minus /></button></div>
          {!snapshot && <div className="field-preparing"><strong>Preparing field</strong><span>Placing formations and terrain</span></div>}
          {showEvent && !completed && <div className={`battle-alert ${latestEvent.type}`}><strong>{latestEvent.type === 'route' ? 'Formation broken' : 'New field report'}</strong><span>{latestEvent.message}</span></div>}
          {snapshot && !speed && !completed && !leaving && <button className="begin-battle" onClick={() => setSpeed(1)}><Swords /> {snapshot?.time ? 'Resume battle' : 'Begin battle'}</button>}
          {completed && !inspectResult && <div className="battle-result"><p className="eyebrow">Field dispatch</p><h2>{snapshot.outcome === 'victory' ? 'The field objective is secured' : snapshot.outcome === 'withdrawal' ? 'The army disengages' : 'The engagement is lost'}</h2><p>{battleDebrief(snapshot)}</p><p>{practice ? 'Practice complete. Your campaign is unchanged.' : 'This result will be recorded when you return to the campaign.'}</p>{checkpointStatus.error && !practice && <p role="alert">{checkpointStatus.error}</p>}<button className="inspect-result" onClick={()=>setInspectResult(true)}>Inspect battlefield</button><button onClick={() => resolveBattle(snapshot.outcome)}>{practice ? 'Return to practice menu' : 'Return to campaign'}</button></div>}
          {completed && inspectResult && <button className="begin-battle" onClick={()=>setInspectResult(false)}>Show battle result</button>}
        </section>
      </main>
      <div className="sr-battle-status" aria-live="polite">{!completed ? latestEvent?.message : ''}</div>
      <footer className="command-bar" inert={leaving ? true : undefined}>{['hold', 'advance', 'volley', 'reform', 'fallback', 'withdraw'].map((order) => <button key={order} onClick={() => battlefield.current?.order(order)} disabled={completed || !canCommand}><Shield /> {order === 'fallback' ? 'Fall back' : order}</button>)}<div className="field-clock">Battle time (s) <strong>{Math.round(snapshot?.time || 0)}</strong></div></footer>
    </div>
  );
}
