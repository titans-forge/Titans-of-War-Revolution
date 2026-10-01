import {landmarksFor,LANDMARK_NOTE,landmarkMovementNote} from '../battle/historicalLandmarks.js';
export function HistoricalLandmarks({battleId,onLocate}){
 return <details className="historical-landmarks"><summary>Historic landmarks</summary><p>{LANDMARK_NOTE}</p>{landmarksFor(battleId).map(l=><article key={l.id}><h3>{l.name}</h3><p>{l.description}</p>{landmarkMovementNote(battleId,l.id)&&<p>{landmarkMovementNote(battleId,l.id)}</p>}<button onClick={()=>onLocate(l)}>Locate on battlefield</button><a href={l.source} target="_blank" rel="noreferrer">{l.sourceLabel} ↗</a></article>)}</details>;
}
