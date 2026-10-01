import { presentScenario } from './campaignNarrative.js';
export const METRIC_DEFINITIONS = [
  { id: 'army', label: 'Continental Army', short: 'Army' },
  { id: 'supply', label: 'Powder & Supply', short: 'Supply' },
  { id: 'credit', label: 'Public Credit', short: 'Credit' },
  { id: 'support', label: 'Patriot Support', short: 'Support' },
  { id: 'foreign', label: 'Foreign Confidence', short: 'Foreign' },
  { id: 'congress', label: 'Congressional Unity', short: 'Congress' },
];

export const ADVISORS = {
  firebrand: { name: 'Firebrand', role: 'Political mobilization', color: '#c1533d' },
  professional: { name: 'Professional', role: 'Army discipline', color: '#d2a943' },
  diplomat: { name: 'Diplomat', role: 'Credit and alliances', color: '#4d89a8' },
};

export const INITIAL_STATE = {
  version: 1,
  turn: 1,
  scenarioId: 'concord_aftermath',
  metrics: { army: 34, supply: 38, credit: 42, support: 62, foreign: 24, congress: 46 },
  flags: {},
  history: [],
  battleResult: null,
  pendingBattle: false,
  completed: false,
};

export const SCENARIOS = [
  {
    id: 'concord_aftermath',
    date: 'April 20, 1775',
    act: 'Act I · Rebellion',
    title: 'The Road Back from Concord',
    actor: 'Massachusetts Committee of Safety',
    location: 'Cambridge, Massachusetts',
    summary: 'British regulars have returned to Boston under fire from thousands of militia. The countryside is mobilizing faster than any civil authority can supply or direct it. Decide what this armed rising is to become.',
    context: 'The fighting at Lexington and Concord transformed political resistance into open war. New England militia converged on Boston, but enthusiasm did not automatically create a continental army or a durable supply system.',
    choices: [
      { id: 'a', advisor: 'professional', title: 'Form a regulated siege army', text: 'Register units, appoint a common command, and turn the militia ring around Boston into an organized force.', effects: { army: 10, supply: -5, support: -2, congress: 3 }, flags: { regulatedSiege: true }, next: 'continental_command' },
      { id: 'b', advisor: 'firebrand', title: 'Keep the militia rising broad', text: 'Let towns rotate companies and sustain pressure without waiting for a formal establishment.', effects: { support: 10, army: -4, supply: -3, congress: -2 }, flags: { militiaRising: true }, next: 'continental_command' },
      { id: 'c', advisor: 'diplomat', title: 'Frame the fighting as defensive', text: 'Publish depositions and insist that provincial forces answered an attack rather than began a rebellion.', effects: { foreign: 7, support: 3, army: -2, credit: 2 }, flags: { defensiveCase: true }, next: 'continental_command' },
    ],
  },
  {
    id: 'continental_command',
    date: 'June 15, 1775',
    act: 'Act I · Rebellion',
    title: 'An Army for Thirteen Colonies',
    actor: 'Second Continental Congress',
    location: 'Philadelphia, Pennsylvania',
    summary: 'The troops outside Boston are overwhelmingly New Englanders, but the political struggle cannot remain provincial. Congress must adopt the army and choose a commander who can bind regions with different interests.',
    context: 'Congress created the Continental Army and selected George Washington. His military experience mattered, but so did his Virginia identity and the need to make the war visibly continental.',
    choices: [
      { id: 'a', advisor: 'diplomat', title: 'Appoint Washington and adopt the army', text: 'Make the New England force continental and place a Virginian above its provincial commands.', effects: { congress: 11, army: 7, foreign: 3, credit: -2 }, flags: { washingtonCommand: true }, next: 'bunker_hill_council' },
      { id: 'b', advisor: 'professional', title: 'Keep Ward until the siege is settled', text: 'Preserve continuity at Cambridge and defer a politically broader command arrangement.', effects: { army: 5, congress: -8, support: 2, foreign: -2 }, flags: { wardCommand: true }, next: 'bunker_hill_council' },
      { id: 'c', advisor: 'firebrand', title: 'Create a rotating war council', text: 'Divide authority among regional generals so no colony appears subordinate to another.', effects: { support: 5, congress: 3, army: -9, supply: -2 }, flags: { rotatingCouncil: true }, next: 'bunker_hill_council' },
    ],
  },
  {
    id: 'bunker_hill_council',
    date: 'June 16, 1775',
    act: 'Act I · Rebellion',
    title: 'The Heights Above Boston',
    actor: 'Massachusetts Council of War',
    location: 'Charlestown Peninsula, Massachusetts',
    summary: 'British command intends to occupy the heights commanding Boston. Provincial officers propose fortifying the peninsula first, but powder is scarce and the narrow neck may become a trap.',
    context: 'The provincials fortified Breed’s Hill rather than Bunker Hill. British troops assaulted the works repeatedly and took the position after defenders exhausted much of their ammunition.',
    choices: [
      { id: 'a', advisor: 'professional', title: 'Fortify Breed’s Hill and hold', text: 'Build through the night, ration powder, and force the regulars to pay for the ground.', effects: { supply: -7, support: 3 }, flags: { breedsHill: true }, battle: 'bunker_hill' },
      { id: 'b', advisor: 'diplomat', title: 'Fortify Bunker Hill instead', text: 'Choose the stronger rearward height, preserve withdrawal, and avoid directly threatening Boston.', effects: { army: 5, foreign: 2, support: -3, congress: 2 }, flags: { bunkerHillRearward: true }, next: 'olive_branch' },
      { id: 'c', advisor: 'firebrand', title: 'Raid the landing force', text: 'Use skirmishers against the beaches and avoid fixing the army inside unfinished works.', effects: { support: 4, army: -3, supply: -4, foreign: -1 }, flags: { beachRaids: true }, next: 'olive_branch' },
    ],
  },
  {
    id: 'olive_branch',
    date: 'July 6, 1775',
    act: 'Act I · Rebellion',
    title: 'Petition and Declaration',
    actor: 'Continental Congress',
    location: 'Philadelphia, Pennsylvania',
    summary: 'Congress must explain why armies are in the field while many delegates still seek reconciliation. A petition to the king and a declaration of the causes for taking up arms can travel together, but the messages pull in different directions.',
    context: 'Congress sent the Olive Branch Petition while also issuing the Declaration of the Causes and Necessity of Taking Up Arms. The dual policy reflected real disagreement and a desire to preserve colonial unity.',
    choices: [
      { id: 'a', advisor: 'diplomat', title: 'Send both messages', text: 'Petition the king while defending armed resistance as a response to unconstitutional coercion.', effects: { congress: 8, foreign: 5, support: -2 }, flags: { dualPolicy: true }, next: 'independence_question' },
      { id: 'b', advisor: 'firebrand', title: 'Abandon the petition', text: 'State plainly that bloodshed has made another appeal to royal protection futile.', effects: { support: 9, congress: -8, foreign: -2 }, flags: { earlyBreak: true }, next: 'independence_question' },
      { id: 'c', advisor: 'professional', title: 'Say less and prepare the army', text: 'Avoid a final constitutional claim while fortifying the siege and securing powder.', effects: { army: 5, supply: 4, support: -4, foreign: -3 }, flags: { militaryPause: true }, next: 'independence_question' },
    ],
  },
  {
    id: 'independence_question',
    date: 'June 10, 1776',
    act: 'Act I · Rebellion',
    title: 'The Lee Resolution — Instructions Before the Vote',
    actor: 'Continental Congress',
    location: 'Pennsylvania State House',
    summary: 'Richard Henry Lee has placed independence before Congress, but several delegations remain bound by older instructions. A premature division could advertise weakness; too much delay could squander the political momentum created by a year of war.',
    context: 'Lee introduced Virginia’s resolution on June 7. Congress postponed a final vote while delegates sought new instructions and committees prepared a declaration, a model treaty, and a plan of confederation. The delay was coalition work, not inactivity.',
    choices: [
      { id: 'a', advisor: 'diplomat', title: 'Postpone briefly and secure new instructions', text: 'Use the interval to align the states, draft the public case, and prevent one divided delegation from appearing to veto the rest.', effects: { congress: 9, foreign: 4, credit: 2, support: -2 }, modifiers: [{ flag: 'dualPolicy', note: 'The earlier reconciliation policy kept cautious delegates inside the common cause long enough to negotiate the break.', effects: { congress: 3, foreign: 1 } }], flags: { consensusBuilt: true }, next: 'independence_vote' },
      { id: 'b', advisor: 'firebrand', title: 'Force an immediate division', text: 'Make every delegation answer the question now and let public pressure break the remaining instructions.', effects: { support: 9, foreign: 3, congress: -9, credit: -2 }, modifiers: [{ flag: 'earlyBreak', note: 'The earlier public break makes immediate independence less surprising outside Congress.', effects: { support: 3, congress: -1 } }], flags: { forcedIndependenceQuestion: true }, next: 'independence_vote' },
      { id: 'c', advisor: 'professional', title: 'Wait for military security and state authority', text: 'Prepare New York and defer the final question until hesitant states provide explicit instructions.', effects: { army: 5, supply: 2, congress: -4, foreign: -8, support: -4 }, modifiers: [{ flag: 'militaryPause', note: 'Earlier concentration on military preparation makes the delay more useful to the army.', effects: { army: 2, supply: 1 } }], flags: { independenceDelayedForSecurity: true }, next: 'independence_vote' },
    ],
  },
  {
    id: 'independence_vote',
    date: 'July 2, 1776',
    act: 'Act I · Rebellion',
    title: 'Twelve Delegations and an Open Door',
    actor: 'Continental Congress',
    location: 'Pennsylvania State House',
    summary: 'The decisive debate has reached its division. Pennsylvania and Delaware have been contested within their own delegations, while New York still lacks authority to vote. Congress must convert broad agreement into an act that can command armies and impress foreign courts.',
    context: 'Twelve delegations approved independence on July 2; none opposed, and New York abstained for want of instructions. The political achievement was not perfect simultaneity but an act broad enough for New York to approve on July 9.',
    choices: [
      { id: 'a', advisor: 'diplomat', title: 'Proceed with twelve and leave New York room to join', text: 'Record the approving states, treat New York’s abstention as temporary, and preserve the appearance of a continental rather than sectional act.', effects: { congress: 10, foreign: 9, support: 4, credit: 2 }, modifiers: [{ flag: 'consensusBuilt', note: 'The recess produced revised instructions and a vote without an opposing colony.', effects: { congress: 4, foreign: 2 } }], flags: { declaredIndependence: true, newYorkDoorOpen: true }, next: 'declaration_publication' },
      { id: 'b', advisor: 'firebrand', title: 'Accept a divided vote and announce the break', text: 'Count the available majority, publish the decision at once, and dare hesitant assemblies to stand apart from independence.', effects: { support: 11, foreign: 5, congress: -8, credit: -3 }, modifiers: [{ flag: 'forcedIndependenceQuestion', note: 'Public pressure has increased momentum, but it has also hardened resentment inside Congress.', effects: { support: 2, congress: -2 } }], flags: { declaredIndependence: true, dividedIndependence: true }, next: 'declaration_publication' },
      { id: 'c', advisor: 'professional', title: 'Adopt independence but defer public proclamation', text: 'Settle the legal question while giving New York and the army several days to prepare for the consequences of publication.', effects: { army: 3, congress: 3, foreign: -5, support: -4 }, modifiers: [{ flag: 'independenceDelayedForSecurity', note: 'Military preparations reduce the practical cost of another short delay.', effects: { army: 2, supply: 2 } }], flags: { declaredIndependence: true, declarationDeferred: true }, next: 'declaration_publication' },
    ],
  },
  {
    id: 'declaration_publication',
    date: 'July 4–9, 1776',
    act: 'Act I · Rebellion',
    title: 'The Declaration Goes Forth',
    actor: 'Committee of Five and John Dunlap’s Print Shop',
    location: 'Philadelphia, Pennsylvania',
    summary: 'Independence has been resolved. Congress now approves the public statement explaining the break, and printers prepare copies for assemblies, committees, military commanders, and readers across the Atlantic world.',
    context: 'Congress revised the Committee of Five’s draft and adopted the Declaration on July 4. Dunlap printed broadsides that went to civil authorities and commanders; Washington had the Declaration read to the assembled army in New York on July 9. Most delegates did not sign the engrossed parchment on July 4.',
    interlude: true,
    choices: [
      { id: 'a', advisor: 'diplomat', title: 'Print, dispatch, and read the Declaration', text: 'Send the approved text to the states, the Continental Army, and American representatives abroad. Independence now has a public argument as well as a congressional vote.', effects: { support: 6, foreign: 6, congress: 2, credit: 1, supply: -1 }, modifiers: [{ flag: 'newYorkDoorOpen', note: 'New York can approve the common act without being represented as its opponent.', effects: { congress: 3, support: 2 } }, { flag: 'dividedIndependence', note: 'Rapid publication wins attention but exposes the political division behind the vote.', effects: { support: 2, congress: -3, foreign: -1 } }, { flag: 'declarationDeferred', note: 'The additional delay gives commanders warning but blunts the first diplomatic impression.', effects: { army: 2, foreign: -2, support: -1 } }], flags: { declarationPublished: true }, next: 'new_york_defense' },
    ],
  },
  {
    id: 'new_york_defense',
    date: 'July 12, 1776',
    act: 'Act II · Survival',
    title: 'The Harbor and the Hudson',
    actor: 'General George Washington',
    location: 'New York City',
    summary: 'The largest British expedition yet assembled off the American coast controls the water around New York. Congress expects the city to be defended, but fixed positions on islands can divide the army faster than roads and boats can reunite it.',
    context: 'Washington attempted to defend New York, Long Island, and the Hudson approaches at once. British naval mobility and uncertain intelligence made that dispersed defense exceptionally dangerous.',
    choices: [
      { id: 'a', advisor: 'professional', title: 'Defend Brooklyn, Manhattan, and the Hudson', text: 'Contest every major approach while retaining a reserve near the East River crossings.', effects: { support: 5, army: -4, supply: -6, congress: 3 }, flags: { broadNewYorkDefense: true }, next: 'long_island_council' },
      { id: 'b', advisor: 'professional', title: 'Concentrate on Manhattan', text: 'Use Long Island as an observation screen and refuse to divide the main army across the river.', effects: { army: 7, supply: 3, support: -7, congress: -3 }, flags: { manhattanConcentration: true }, next: 'long_island_council' },
      { id: 'c', advisor: 'diplomat', title: 'Prepare a defense and an evacuation', text: 'Build works, inventory boats, and quietly establish authority to abandon exposed positions.', effects: { army: 4, credit: -2, support: -2, congress: 5 }, flags: { evacuationPrepared: true }, next: 'long_island_council' },
    ],
  },
  {
    id: 'long_island_council',
    date: 'August 26, 1776',
    act: 'Act II · Survival',
    title: 'The Passes Through the Heights',
    actor: 'Continental Headquarters',
    location: 'Brooklyn, New York',
    summary: 'British and Hessian forces have landed on Long Island. Roads through the wooded heights divide the armies. Reports conflict over the Jamaica Pass, while Congress and the city expect the forward line to stand.',
    context: 'The Continental position covered several passes inadequately. A large British turning column moved through Jamaica Pass and struck behind the forward defenses while other columns fixed them in place.',
    choices: [
      { id: 'a', advisor: 'professional', title: 'Hold the passes and keep a reserve', text: 'Delay the direct columns, patrol the far left, and preserve a force behind the Brooklyn lines.', effects: { supply: -6, army: -2 }, flags: { longIslandStand: true }, battle: 'long_island' },
      { id: 'b', advisor: 'firebrand', title: 'Reinforce every forward pass', text: 'Commit the reserve to prevent any road from being yielded without a fight.', effects: { support: 5, army: -10, supply: -5 }, flags: { forwardCommitment: true }, next: 'brooklyn_evacuation' },
      { id: 'c', advisor: 'diplomat', title: 'Withdraw behind the Brooklyn lines', text: 'Yield the outer roads before the British columns close and preserve bargaining power in the form of an intact army.', effects: { army: 7, support: -5, foreign: -2, congress: -2 }, flags: { earlyBrooklynWithdrawal: true }, next: 'brooklyn_evacuation' },
    ],
  },
  {
    id: 'brooklyn_evacuation',
    date: 'August 29, 1776',
    act: 'Act II · Survival',
    title: 'Escape Across the East River',
    actor: 'Commander in Chief',
    location: 'Brooklyn Heights, New York',
    summary: 'The army is enclosed against the East River. British siege preparations advance while wind, tide, fog, and the availability of small craft determine whether thousands can escape before daylight.',
    context: 'Washington evacuated the army at night using boats gathered from the region. The operation succeeded through preparation, disciplined movement, favorable weather, and British delay.',
    choices: [
      { id: 'a', advisor: 'professional', title: 'Evacuate the entire army tonight', text: 'Impose silence, send experienced troops last, and move guns and men across the river before dawn.', effects: { army: 10, supply: -5, support: -3, congress: 4 }, modifiers: [{ flag: 'evacuationPrepared', note: 'Boats were inventoried and evacuation authority was settled before the crisis.', effects: { army: 3, supply: 2 } }], flags: { brooklynEvacuated: true }, next: 'new_jersey_retreat' },
      { id: 'b', advisor: 'firebrand', title: 'Hold the lines another day', text: 'Demonstrate resolve and wait for a clearer chance to counterattack the siege works.', effects: { support: 4, army: -15, supply: -7, foreign: -3 }, flags: { brooklynHeld: true }, next: 'new_jersey_retreat' },
      { id: 'c', advisor: 'diplomat', title: 'Evacuate troops and abandon heavy stores', text: 'Move men first and accept the financial and material loss rather than risk discovery.', effects: { army: 7, supply: -10, credit: -5, congress: 2 }, flags: { menBeforeStores: true }, next: 'new_jersey_retreat' },
    ],
  },
  {
    id: 'new_jersey_retreat',
    date: 'December 2, 1776',
    act: 'Act II · Survival',
    title: 'The Retreat Across New Jersey',
    actor: 'General George Washington',
    location: 'New Brunswick, New Jersey',
    summary: 'The army has escaped New York, but enlistments expire at year’s end. British columns press west while Congress abandons Philadelphia. Preserve the army, restore confidence, or risk losing both.',
    context: 'Washington divided stores, guarded crossings, and continued toward the Delaware. The strategic problem was not merely battlefield defeat: the army itself might dissolve when enlistments expired.',
    choices: [
      { id: 'a', advisor: 'professional', title: 'Preserve the army', text: 'Retreat in disciplined stages, burn bridges, and protect the remaining artillery.', effects: { army: 8, supply: -4, support: -3, congress: 2 }, flags: { preservedArmy: true }, next: 'congressional_emergency' },
      { id: 'b', advisor: 'firebrand', title: 'Make a stand in New Jersey', text: 'Call militia forward and risk battle before public confidence collapses.', effects: { army: -9, supply: -7, support: 8, foreign: 2 }, flags: { aggressivePosture: true }, next: 'congressional_emergency' },
      { id: 'c', advisor: 'diplomat', title: 'Protect Philadelphia first', text: 'Detach troops toward the capital and reassure Congress at the cost of field concentration.', effects: { army: -6, credit: 5, support: 2, congress: 8 }, flags: { protectedCongress: true }, next: 'congressional_emergency' },
    ],
  },
  {
    id: 'congressional_emergency',
    date: 'December 12, 1776',
    act: 'Act II · Survival',
    title: 'Congress in Flight',
    actor: 'Continental Congress',
    location: 'Philadelphia, Pennsylvania',
    summary: 'Congress prepares to move to Baltimore. Washington asks for wider emergency authority while merchants demand credible repayment, the states guard their own troops and stores, and delegates dispute how a confederation should divide common obligations.',
    context: 'Congress granted Washington extraordinary military powers for a limited period while continuing to debate the Articles of Confederation. Independence had not settled quotas, finance, western claims, representation, or the means by which Congress could obtain compliance from the states.',
    choices: [
      { id: 'a', advisor: 'professional', title: 'Grant bounded emergency powers', text: 'Authorize rapid appointments and requisitions for six months, with reports to Congress.', effects: { army: 6, supply: 5, congress: -3, credit: -2 }, flags: { emergencyPowers: true }, next: 'delaware_gamble' },
      { id: 'b', advisor: 'diplomat', title: 'Advance confederation quotas and state guarantees', text: 'Tie requisitions to state quotas and merchant certificates while pressing the states toward a durable common compact.', effects: { supply: 2, credit: 8, congress: 6, army: -2 }, flags: { stateGuarantees: true, confederationPlan: true }, next: 'delaware_gamble' },
      { id: 'c', advisor: 'firebrand', title: 'Issue a public appeal', text: 'Frame the retreat as a test of republican endurance and call new militia to the Delaware.', effects: { support: 9, army: 3, supply: -3, credit: -2 }, flags: { publicAppeal: true }, next: 'delaware_gamble' },
    ],
  },
  {
    id: 'delaware_gamble',
    date: 'December 24, 1776',
    act: 'Act II · Survival',
    title: 'The Delaware Gamble',
    actor: 'Commander in Chief',
    location: 'McConkey’s Ferry, Pennsylvania',
    summary: 'Across an ice-filled river, the Hessian garrison at Trenton appears exposed. A victory could revive enlistments and credit. Failure could destroy the army before the new year.',
    context: 'The plan called for several crossings and converging columns. Weather and ice stopped most detachments, leaving Washington’s main force to march through sleet and attack alone.',
    choices: [
      { id: 'a', advisor: 'professional', title: 'Cross and strike before dawn', text: 'Accept weather delays, keep the columns moving, and attack Trenton from two roads.', effects: { supply: -7, congress: 2 }, modifiers: [
        { flag: 'emergencyPowers', note: 'Bounded emergency authority accelerates appointments and requisitions.', effects: { army: 2, supply: 2 } },
        { flag: 'stateGuarantees', note: 'State guarantees make boats, provisions, and merchant credit easier to assemble.', effects: { supply: 3, credit: 2 } },
        { flag: 'publicAppeal', note: 'The public appeal brings militia and renewed confidence to the Delaware.', effects: { support: 3, army: 2 } },
      ], flags: { trentonPlan: 'cross' }, battle: 'trenton' },
      { id: 'b', advisor: 'diplomat', title: 'Wait for firmer coordination', text: 'Delay until supporting crossings are reliable, preserving the army but surrendering surprise.', effects: { army: 3, supply: 2, support: -8, foreign: -5 }, flags: { trentonPlan: 'delay' }, next: 'winter_reckoning' },
      { id: 'c', advisor: 'firebrand', title: 'Launch scattered raids', text: 'Use militia and small detachments to harass posts without risking the main army.', effects: { support: 3, army: -2, supply: -3, foreign: -2 }, flags: { trentonPlan: 'raids' }, next: 'winter_reckoning' },
    ],
  },
  {
    id: 'winter_reckoning',
    date: 'January 3, 1777',
    act: 'Act II · Survival',
    title: 'Ten Crucial Days',
    actor: 'Council of War',
    location: 'Morristown, New Jersey',
    summary: 'The winter campaign has altered the army’s prospects. Now determine whether temporary success can be converted into enlistments, credit, and a defensible winter position.',
    context: 'Trenton and Princeton did not end the war. They restored confidence, complicated British occupation of New Jersey, and gave the Continental cause time to rebuild.',
    choices: [
      { id: 'a', advisor: 'professional', title: 'Rebuild around Morristown', text: 'Secure winter quarters, reorganize regiments, and preserve the core army.', effects: { army: 8, supply: -3, support: 2 }, flags: { winterArmy: true }, next: 'philadelphia_campaign' },
      { id: 'b', advisor: 'diplomat', title: 'Turn victory into credit', text: 'Send evidence abroad and press Congress to stabilize army certificates.', effects: { credit: 8, foreign: 8, army: -2 }, flags: { foreignDispatches: true }, next: 'philadelphia_campaign' },
      { id: 'c', advisor: 'firebrand', title: 'Keep New Jersey in motion', text: 'Support militia pressure against isolated posts while the main army recovers.', effects: { support: 7, supply: -4, army: 2 }, flags: { jerseyWar: true }, next: 'philadelphia_campaign' },
    ],
  },
  {
    id: 'philadelphia_campaign',
    date: 'September 9, 1777',
    act: 'Act II · Survival',
    title: 'The Road to Philadelphia',
    actor: 'Continental Council of War',
    location: 'Brandywine Creek, Pennsylvania',
    summary: 'Howe has landed below Philadelphia and is advancing through difficult country. Congress expects the capital to be defended, but the army must cover several crossings while reports disagree about roads beyond the right flank.',
    context: 'The capital carried political weight, but the Continental Army remained the indispensable instrument of resistance. Washington could risk battle without allowing defense of Philadelphia to become destruction of the army.',
    choices: [
      { id: 'a', advisor: 'professional', title: 'Guard the fords and retain a reserve', text: 'Hold Chadds Ford, investigate the upper crossings, and keep Greene ready to cover the Chester Road.', effects: { supply: -6, army: -2, congress: 3 }, modifiers: [{ flag: 'winterArmy', note: 'Morristown reorganization leaves a stronger reserve available for the campaign.', effects: { army: 4, supply: 1 } }], flags: { brandywineStand: true }, battle: 'brandywine' },
      { id: 'b', advisor: 'diplomat', title: 'Screen the capital and preserve the army', text: 'Yield the direct crossings before the turning column closes, trading political ground for an intact field force.', effects: { army: 7, congress: -7, support: -4, foreign: -2 }, flags: { philadelphiaScreened: true }, next: 'northern_department' },
      { id: 'c', advisor: 'firebrand', title: 'Strike Howe before he deploys', text: 'Send light troops against the marching columns and accept the danger of a fragmented engagement.', effects: { support: 6, army: -8, supply: -5, congress: 2 }, flags: { howeCounterstroke: true }, next: 'northern_department' },
    ],
  },
  {
    id: 'northern_department',
    date: 'September 22, 1777',
    act: 'Act III · Global War',
    title: 'The Northern Department',
    actor: 'Continental Congress',
    location: 'Albany, New York',
    summary: 'Burgoyne has pushed south from Canada, but his communications lengthen through hostile country. New England militia are gathering after Bennington while Congress must reconcile command disputes and sustain the army blocking the Hudson corridor.',
    context: 'The northern campaign depended on roads, supply, militia concentration, and cooperation among officers whose claims and reputations collided. Burgoyne’s isolation created an opportunity, not an automatic victory.',
    choices: [
      { id: 'a', advisor: 'professional', title: 'Unify the field command', text: 'Give Gates operational control while retaining Schuyler’s supply network and local intelligence.', effects: { army: 8, supply: 5, congress: -2, support: 3 }, flags: { northernCommandUnified: true }, next: 'saratoga_council' },
      { id: 'b', advisor: 'firebrand', title: 'Converge the militia on Burgoyne', text: 'Call the countryside against his roads and outposts while the Continental line blocks the river route.', effects: { support: 10, supply: -4, army: 2, congress: -2 }, flags: { militiaConvergence: true }, next: 'saratoga_council' },
      { id: 'c', advisor: 'diplomat', title: 'Build the case for France', text: 'Prepare dispatches showing that Burgoyne can be trapped, but avoid promising a victory not yet won.', effects: { foreign: 8, credit: 4, army: -2, congress: 2 }, flags: { frenchCasePrepared: true }, next: 'saratoga_council' },
    ],
  },
  {
    id: 'saratoga_council',
    date: 'October 7, 1777',
    act: 'Act III · Global War',
    title: 'Burgoyne’s Last Reconnaissance',
    actor: 'Northern Army Headquarters',
    location: 'Bemis Heights, New York',
    summary: 'Burgoyne’s provisions are failing and retreat is narrowing. A strong reconnaissance has left his field army exposed outside its works. An American attack could complete the encirclement or spend the advantage in a disordered pursuit.',
    context: 'At Bemis Heights, American formations attacked Burgoyne’s exposed columns and carried key positions. The battlefield result helped make surrender of the British army unavoidable.',
    choices: [
      { id: 'a', advisor: 'professional', title: 'Break the reconnaissance in sequence', text: 'Use Morgan on the flank, press the center after it bends, and close the northern road with fresh troops.', effects: { supply: -6, army: -1 }, flags: { bemisHeightsAttack: true }, battle: 'saratoga' },
      { id: 'b', advisor: 'diplomat', title: 'Hold the fortified line', text: 'Let Burgoyne consume his remaining supplies and negotiate from an increasingly hopeless position.', effects: { army: 5, supply: 3, support: -3, foreign: 5 }, flags: { saratogaContainment: true }, next: 'french_alliance' },
      { id: 'c', advisor: 'firebrand', title: 'Launch a general assault', text: 'Commit militia and Continentals together to crush the exposed army before darkness.', effects: { support: 7, army: -8, supply: -5, foreign: 4 }, flags: { saratogaGeneralAssault: true }, next: 'french_alliance' },
    ],
  },
  {
    id: 'french_alliance',
    date: 'February 6, 1778',
    act: 'Act III · Global War',
    title: 'A Rebellion Becomes a Global War',
    actor: 'American Commissioners at Paris',
    location: 'Paris, France',
    summary: 'News of Burgoyne’s surrender has altered the calculation at Versailles. France can provide open alliance, naval power, credit, and arms, but its ministers pursue French interests as well as American independence.',
    context: 'The treaties of Amity and Commerce and Alliance recognized American independence and brought France openly into the war. The alliance expanded American capacity while also globalizing the conflict.',
    choices: [
      { id: 'a', advisor: 'diplomat', title: 'Accept alliance and coordinate strategy', text: 'Secure recognition, arms, credit, and naval cooperation while preserving an American voice in campaign planning.', effects: { foreign: 16, credit: 10, supply: 8, congress: 5 }, modifiers: [{ flag: 'frenchCasePrepared', note: 'The earlier evidence sent to Paris strengthens the commissioners’ negotiating position.', effects: { foreign: 4, credit: 2 } }], flags: { frenchAlliance: true }, next: 'valley_forge_crisis' },
      { id: 'b', advisor: 'professional', title: 'Prioritize military guarantees', text: 'Press for fleets, matériel, and a binding commitment not to make a separate peace.', effects: { foreign: 11, army: 6, supply: 11, credit: 2 }, modifiers: [{ flag: 'northernCommandUnified', note: 'Unified command at Saratoga gives military guarantees greater credibility.', effects: { army: 2, foreign: 2 } }], flags: { militaryAlliance: true }, next: 'valley_forge_crisis' },
      { id: 'c', advisor: 'firebrand', title: 'Guard republican independence', text: 'Accept French aid but resist arrangements that appear to substitute one European patron for another.', effects: { support: 7, congress: 7, foreign: 6, credit: 3 }, modifiers: [{ flag: 'militiaConvergence', note: 'The militia convergence demonstrates that American popular mobilization has independent strength.', effects: { support: 3, congress: 2 } }], flags: { guardedAlliance: true }, next: 'valley_forge_crisis' },
    ],
  },
  {
    id: 'valley_forge_crisis',
    date: 'February 16, 1778',
    act: 'Act III · Global War',
    title: 'This Fatal Crisis',
    actor: 'Committee at Camp',
    location: 'Valley Forge, Pennsylvania',
    summary: 'The army has shelter, but meat, clothing, wagons, and money reach camp irregularly. Food exists in the wider country; overlapping purchasing systems, depreciating paper, bad roads, and state resistance prevent dependable delivery.',
    context: 'Valley Forge was not simply a tale of unavoidable scarcity. Administrative competition, weak credit, transportation, and political distrust turned procurement into a crisis even while the army remained close to productive districts.',
    choices: [
      { id: 'a', advisor: 'professional', title: 'Rebuild procurement under accountable officers', text: 'Give the quartermaster and commissary clear authority, audited accounts, and agents able to move cattle and flour across state lines.', effects: { supply: 12, army: 5, credit: -4, congress: -3 }, modifiers: [{ flag: 'stateGuarantees', note: 'Earlier state guarantees give the reformed departments firmer quotas and credit.', effects: { credit: 3, congress: 2 } }], flags: { supplySystemReformed: true }, next: 'army_reform' },
      { id: 'b', advisor: 'firebrand', title: 'Requisition locally with certificates', text: 'Take urgent provisions near camp and promise later payment rather than allow the regiments to go hungry.', effects: { supply: 9, army: 3, support: -9, credit: -5 }, modifiers: [{ flag: 'emergencyPowers', note: 'Existing emergency authority reduces delay in urgent procurement.', effects: { supply: 3, army: 2 } }], flags: { emergencyRequisitions: true }, next: 'army_reform' },
      { id: 'c', advisor: 'diplomat', title: 'Disperse detachments for subsistence', text: 'Reduce pressure on the central magazine and negotiate state deliveries, accepting weaker concentration and slower training.', effects: { supply: 6, congress: 4, army: -7, support: -2 }, flags: { dispersedWinterQuarters: true }, next: 'army_reform' },
    ],
  },
  {
    id: 'army_reform',
    date: 'March 23, 1778',
    act: 'Act III · Global War',
    title: 'One Army, One Exercise',
    actor: 'Commander in Chief and Board of War',
    location: 'Valley Forge, Pennsylvania',
    summary: 'Baron von Steuben offers a practical system of drill, inspection, camp order, and officer instruction. At the same time, victories in the north have enlarged rival reputations and sharpened arguments over the commander in chief.',
    context: 'The so-called Conway Cabal was not a single proven conspiracy with one plan. It was a genuine struggle over performance, patronage, the Board of War, and confidence in Washington after the defeats of 1777.',
    choices: [
      { id: 'a', advisor: 'professional', title: 'Make Steuben inspector under Washington', text: 'Train a model company, teach officers a common exercise, and spread standards through the regiments without creating a rival command.', effects: { army: 13, congress: 5, supply: -4, support: 2 }, modifiers: [{ flag: 'supplySystemReformed', note: 'A functioning supply administration gives Steuben’s inspection system room to take hold.', effects: { army: 4, supply: 2 } }], flags: { steubenSystem: true, washingtonSustained: true }, next: 'philadelphia_evacuation' },
      { id: 'b', advisor: 'diplomat', title: 'Let the Board of War direct reform', text: 'Use congressional supervision to reconcile regional officers, but divide responsibility between camp and York.', effects: { congress: 8, army: -4, credit: 3, support: -2 }, flags: { boardDirectedReform: true }, next: 'philadelphia_evacuation' },
      { id: 'c', advisor: 'firebrand', title: 'Keep state methods and elected influence', text: 'Standardize only what is essential and preserve the authority of established officers over outside inspectors.', effects: { support: 6, army: 3, congress: -6, supply: -2 }, flags: { stateDrillMethods: true }, next: 'philadelphia_evacuation' },
    ],
  },
  {
    id: 'philadelphia_evacuation',
    date: 'June 19, 1778',
    act: 'Act III · Global War',
    title: 'Clinton Leaves Philadelphia',
    actor: 'Continental Council of War',
    location: 'Valley Forge, Pennsylvania',
    summary: 'The British army has abandoned Philadelphia and is marching across New Jersey toward the fleet. The newly trained Continentals can pursue, but Clinton’s column remains formidable and the first French fleet is only beginning to alter British calculations.',
    context: 'French entry made the British position at Philadelphia less useful and increased the need to remain near naval support. Washington pursued from Valley Forge while his officers disagreed over the scale of attack.',
    choices: [
      { id: 'a', advisor: 'professional', title: 'Pursue with the main army', text: 'Pressure the rear guard, learn Clinton’s route, and prepare a substantial advance force without losing control of the army.', effects: { army: 4, supply: -7, support: 3 }, modifiers: [{ flag: 'steubenSystem', note: 'Steuben’s common drill lets the reformed army march and deploy with greater cohesion.', effects: { army: 5, support: 2 } }], flags: { clintonPursued: true }, next: 'monmouth_council' },
      { id: 'b', advisor: 'diplomat', title: 'Shadow the march and await the fleet', text: 'Preserve the army while the alliance changes the naval balance, accepting that Clinton may reach Sandy Hook intact.', effects: { foreign: 7, army: 4, support: -5, supply: 2 }, modifiers: [{ flag: 'militaryAlliance', note: 'Specific military guarantees improve coordination with the approaching French fleet.', effects: { foreign: 4, supply: 2 } }], flags: { fleetPriority: true }, next: 'monmouth_council' },
      { id: 'c', advisor: 'firebrand', title: 'Call out New Jersey militia', text: 'Harass roads, bridges, and forage while the Continental line closes on the British rear.', effects: { support: 9, supply: -4, army: -2, congress: 2 }, modifiers: [{ flag: 'jerseyWar', note: 'The militia network built in 1777 mobilizes quickly along the British route.', effects: { support: 3, army: 2 } }], flags: { jerseyPursuit: true }, next: 'monmouth_council' },
    ],
  },
  {
    id: 'monmouth_council',
    date: 'June 27, 1778',
    act: 'Act III · Global War',
    title: 'The British Rear at Monmouth',
    actor: 'Continental Headquarters',
    location: 'Englishtown, New Jersey',
    summary: 'Clinton’s long column is moving toward Sandy Hook. Charles Lee commands the advance force despite opposing a major action. Broken ground, uncertain roads, oppressive heat, and changing orders could turn pursuit into confusion.',
    context: 'Lee’s advance made contact on June 28 and then retreated as British strength developed. Washington restored the line and fought until dark; Clinton continued to the coast during the night.',
    choices: [
      { id: 'a', advisor: 'professional', title: 'Attack the rear with support close behind', text: 'Let Lee engage, keep Wayne and Lafayette connected, and bring Washington’s main line forward to stabilize any reverse.', effects: { supply: -6, army: -1 }, flags: { monmouthBattle: true }, battle: 'monmouth' },
      { id: 'b', advisor: 'firebrand', title: 'Strike the baggage and detachments', text: 'Avoid the main rear guard and turn the pursuit into a series of local attacks along the march.', effects: { support: 6, supply: 4, army: -4, foreign: -2 }, flags: { baggageRaids: true }, next: 'coalition_reckoning' },
      { id: 'c', advisor: 'diplomat', title: 'Refuse a general engagement', text: 'Preserve the reformed army for joint operations and let the British reach the fleet without another major battle.', effects: { army: 7, supply: 3, support: -7, foreign: 3 }, flags: { monmouthAvoided: true }, next: 'coalition_reckoning' },
    ],
  },
  {
    id: 'coalition_reckoning',
    date: 'August 24, 1778',
    act: 'Act III · Global War',
    title: 'The Alliance Meets the Weather',
    actor: 'American and French Headquarters',
    location: 'Rhode Island and Boston',
    summary: 'The first large joint operation has broken apart after difficult coordination, a British fleet, and a violent storm damaged plans around Newport. American officers are angry that d’Estaing has taken his squadron to Boston for repairs.',
    context: 'Alliance did not create a unified chain of command. French naval officers answered to royal instructions and fleet councils; American generals answered to Congress and their own military circumstances.',
    choices: [
      { id: 'a', advisor: 'diplomat', title: 'Defend the alliance and install liaison officers', text: 'Quiet public recriminations, exchange plans earlier, and create a permanent channel between army and fleet commands.', effects: { foreign: 10, congress: 5, army: 2, support: -2 }, modifiers: [{ flag: 'frenchAlliance', note: 'The broader alliance gives both governments reason to repair the failed operation.', effects: { foreign: 4, congress: 2 } }], flags: { coalitionLiaison: true }, next: 'frontier_strategy' },
      { id: 'b', advisor: 'firebrand', title: 'Publish the American grievance', text: 'Answer popular anger and demand that French commanders give firmer guarantees before another joint operation.', effects: { support: 7, congress: 3, foreign: -12 }, modifiers: [{ flag: 'guardedAlliance', note: 'Earlier caution toward France makes the public protest more credible at home.', effects: { support: 3, congress: 2 } }], flags: { allianceProtested: true }, next: 'frontier_strategy' },
      { id: 'c', advisor: 'professional', title: 'Pause operations and refit', text: 'Treat the failure as an operational lesson, rebuild stores, and plan around what fleets can actually sustain.', effects: { army: 5, supply: 8, foreign: -4, support: -2 }, modifiers: [{ flag: 'militaryAlliance', note: 'The military compact provides matériel and officers for a disciplined refit.', effects: { army: 3, supply: 3 } }], flags: { coalitionRefit: true }, next: 'frontier_strategy' },
    ],
  },
  {
    id: 'frontier_strategy',
    date: 'February 25, 1779',
    act: 'Act IV · Southern Decision',
    title: 'A War Beyond the Main Armies',
    actor: 'Continental Congress and Board of War',
    location: 'Philadelphia, Pennsylvania',
    summary: 'Raids, reprisals, rival land claims, and British-allied strongholds stretch from the Iroquois country to the Illinois settlements. Congress cannot defend every frontier with the same troops and supplies needed around New York.',
    context: 'The frontier war joined older contests over land and sovereignty to the imperial conflict. Continental expeditions could break settlements and supply bases, but destruction did not settle the political future of western communities or Native nations.',
    choices: [
      { id: 'a', advisor: 'professional', title: 'Mount a concentrated northern expedition', text: 'Send Sullivan and Clinton against the settlements and stores supporting raids, with strict marching discipline and a limited operational season.', effects: { army: 5, supply: -10, support: 3, congress: -2 }, modifiers: [{ flag: 'militiaConvergence', note: 'The northern militia network assembled during Saratoga improves guides and local concentration.', effects: { army: 3, supply: 2 } }], flags: { sullivanExpedition: true }, next: 'charleston_decision' },
      { id: 'b', advisor: 'diplomat', title: 'Support Clark in the Illinois country', text: 'Use a small mobile force, French-speaking settlements, and negotiated allegiance to weaken British authority in the west.', effects: { foreign: 5, support: 4, supply: -5, credit: -3 }, modifiers: [{ flag: 'frenchAlliance', note: 'French alliance contacts improve access to western settlements and intelligence.', effects: { foreign: 3, supply: 2 } }], flags: { illinoisCampaign: true }, next: 'charleston_decision' },
      { id: 'c', advisor: 'firebrand', title: 'Arm local defense associations', text: 'Keep Continental formations near the main armies and place frontier defense chiefly in county forts, militia, and ranger companies.', effects: { support: 7, congress: 4, army: 2, supply: -4, foreign: -2 }, modifiers: [{ flag: 'stateGuarantees', note: 'Existing state quotas make local magazines and militia obligations more dependable.', effects: { supply: 3, congress: 2 } }], flags: { frontierDefense: true }, next: 'charleston_decision' },
    ],
  },
  {
    id: 'charleston_decision',
    date: 'March 29, 1780',
    act: 'Act IV · Southern Decision',
    title: 'Charleston Behind the Bar',
    actor: 'Southern Department Council of War',
    location: 'Charleston, South Carolina',
    summary: 'Clinton has landed a major army south of Charleston while British ships press past the harbor defenses. The city contains valuable stores and political weight, but its garrison may be enclosed before relief can arrive.',
    context: 'Charleston’s defenses were substantial, yet British control of the approaches and Cooper River gradually closed the escape. Lincoln surrendered the city and more than five thousand troops in May 1780, the largest American capitulation of the war.',
    choices: [
      { id: 'a', advisor: 'professional', title: 'Evacuate the field army before enclosure', text: 'Remove the Continental core and portable stores while militia and engineers delay the siege from selected works.', effects: { army: 10, supply: 5, support: -8, congress: -4 }, modifiers: [{ flag: 'coalitionRefit', note: 'The earlier refit leaves transport and staff procedures ready for an orderly withdrawal.', effects: { army: 3, supply: 3 } }], flags: { charlestonArmySaved: true }, next: 'southern_command' },
      { id: 'b', advisor: 'firebrand', title: 'Hold Charleston to the last practicable moment', text: 'Treat the city as the political center of southern resistance and force Clinton to conduct a full siege.', effects: { support: 8, army: -14, supply: -10, congress: 3, foreign: -2 }, flags: { charlestonHeld: true }, next: 'southern_command' },
      { id: 'c', advisor: 'diplomat', title: 'Contest the approaches, then negotiate evacuation', text: 'Delay British works while seeking terms that preserve the garrison, accepting the risk that Clinton refuses once the lines close.', effects: { army: 2, support: -3, foreign: 3, congress: 2, supply: -6 }, modifiers: [{ flag: 'steubenSystem', note: 'Common drill and inspection make a staged withdrawal more credible under pressure.', effects: { army: 4, supply: 2 } }], flags: { charlestonNegotiated: true }, next: 'southern_command' },
    ],
  },
  {
    id: 'southern_command',
    date: 'October 30, 1780',
    act: 'Act IV · Southern Decision',
    title: 'An Army After Camden',
    actor: 'Continental Congress and Commander in Chief',
    location: 'Philadelphia and the Carolinas',
    summary: 'The defeat at Camden has broken another southern field army. British posts hold the interior, militia war is spreading, and Congress must choose a commander who can operate without expecting one decisive recovery battle.',
    context: 'Washington recommended Nathanael Greene, and Congress gave Greene command of the Southern Department. He inherited a weak army and relied on mobility, detached forces, local support, and the vulnerability of British communications.',
    choices: [
      { id: 'a', advisor: 'professional', title: 'Give Greene unified southern command', text: 'Authorize him to preserve the army, divide it when useful, rebuild supply, and make British posts pay for every inland mile.', effects: { army: 10, supply: 5, congress: 5, support: 2 }, modifiers: [{ flag: 'washingtonSustained', note: 'Washington’s retained authority makes his recommendation of Greene easier to accept.', effects: { army: 3, congress: 3 } }], flags: { greeneCommand: true }, next: 'cowpens_council' },
      { id: 'b', advisor: 'diplomat', title: 'Create a state-command compact', text: 'Tie Continental detachments to state executives and militia districts so local resources carry more of the campaign.', effects: { congress: 8, supply: 4, support: 5, army: -5 }, modifiers: [{ flag: 'stateGuarantees', note: 'Earlier state guarantees provide a tested framework for quotas and certificates.', effects: { congress: 2, credit: 3 } }], flags: { southernCompact: true }, next: 'cowpens_council' },
      { id: 'c', advisor: 'firebrand', title: 'Build the campaign around partisan commands', text: 'Back Marion, Sumter, and other local leaders while keeping the remaining Continentals mobile and difficult to pin.', effects: { support: 10, army: 2, supply: -5, congress: -3 }, modifiers: [{ flag: 'frontierDefense', note: 'Experience with dispersed frontier defense improves the use of local forts and intelligence.', effects: { support: 3, army: 2 } }], flags: { partisanNetwork: true }, next: 'cowpens_council' },
    ],
  },
  {
    id: 'cowpens_council',
    date: 'January 16, 1781',
    act: 'Act IV · Southern Decision',
    title: 'The Grazing Ground at Cowpens',
    actor: 'Brigadier General Daniel Morgan',
    location: 'Cowpens, South Carolina',
    summary: 'Tarleton is closing rapidly with experienced regulars and cavalry. Morgan has militia, riflemen, Continentals, and a mounted reserve, but retreat beyond the Broad River would be dangerous if the formation breaks too soon.',
    context: 'Morgan arranged successive lines: skirmishers, militia ordered to deliver limited fire, and Continentals backed by cavalry. Tarleton attacked aggressively; the controlled withdrawals and final counterattack enveloped much of his force.',
    choices: [
      { id: 'a', advisor: 'professional', title: 'Fight in successive lines', text: 'Give each line a limited task, keep Howard’s Continentals steady, and conceal Washington’s cavalry until Tarleton is committed.', effects: { supply: -5, army: 2 }, modifiers: [{ flag: 'greeneCommand', note: 'Greene’s operational design gives Morgan freedom to choose ground and preserve the detached force.', effects: { army: 4, supply: 2 } }, { flag: 'steubenSystem', note: 'Common drill helps the Continental line execute a controlled withdrawal and wheel.', effects: { army: 3, support: 2 } }], flags: { cowpensPlan: true }, battle: 'cowpens' },
      { id: 'b', advisor: 'diplomat', title: 'Decline battle and cross the Broad River', text: 'Preserve the detachment and its prisoners, but risk losing local confidence and being caught at a difficult crossing.', effects: { army: 5, support: -8, supply: -4, foreign: -2 }, flags: { cowpensAvoided: true }, next: 'carolinas_reckoning' },
      { id: 'c', advisor: 'firebrand', title: 'Attack Tarleton on the march', text: 'Use mounted militia and riflemen to strike first before the British Legion can deploy its full speed and discipline.', effects: { support: 7, army: -8, supply: -5, congress: 2 }, modifiers: [{ flag: 'partisanNetwork', note: 'Partisan scouts provide earlier warning of Tarleton’s route and pace.', effects: { army: 3, support: 2 } }], flags: { tarletonAmbush: true }, next: 'carolinas_reckoning' },
    ],
  },
  {
    id: 'carolinas_reckoning',
    date: 'March 18, 1781',
    act: 'Act IV · Southern Decision',
    title: 'Victory Without Holding the Field',
    actor: 'Southern Department Headquarters',
    location: 'Guilford Courthouse, North Carolina',
    summary: 'Cornwallis holds the field after Guilford Courthouse, but his casualties and supply problems are severe. Greene still has an army. The strategic question is whether to follow Cornwallis toward Virginia or turn against the inland posts he leaves behind.',
    context: 'Greene withdrew from Guilford in good order. Cornwallis moved to Wilmington and then Virginia, while Greene returned to South Carolina. Tactical defeat did not prevent the Americans from recovering much of the interior through continued campaigning.',
    choices: [
      { id: 'a', advisor: 'professional', title: 'Turn south against the inland posts', text: 'Refuse Cornwallis’s route, preserve the army, and force British garrisons to defend a chain they can no longer easily support.', effects: { army: 8, supply: 4, support: 6, congress: 3 }, modifiers: [{ flag: 'greeneCommand', note: 'Greene’s command system is designed to survive reverses and resume operations against exposed posts.', effects: { army: 4, support: 2 } }], flags: { reconquerInterior: true }, next: 'chesapeake_convergence' },
      { id: 'b', advisor: 'firebrand', title: 'Pursue Cornwallis into Virginia', text: 'Keep pressure on the damaged British army and try to turn its northward march into a public retreat.', effects: { support: 7, army: -7, supply: -8, foreign: 2 }, flags: { cornwallisPursued: true }, next: 'chesapeake_convergence' },
      { id: 'c', advisor: 'diplomat', title: 'Pause for militia and magazines', text: 'Rebuild the southern force before another campaign, accepting temporary British control of more interior posts.', effects: { supply: 9, credit: 5, army: 3, support: -7 }, modifiers: [{ flag: 'southernCompact', note: 'The state-command compact accelerates militia quotas and magazine reconstruction.', effects: { supply: 3, congress: 2 } }], flags: { southernRecovery: true }, next: 'chesapeake_convergence' },
    ],
  },
  {
    id: 'chesapeake_convergence',
    date: 'August 19, 1781',
    act: 'Act IV · Southern Decision',
    title: 'The March That Must Look North',
    actor: 'Washington and Rochambeau',
    location: 'Philipsburg, New York',
    summary: 'Cornwallis is establishing a base at Yorktown. De Grasse is sailing for the Chesapeake, but Clinton still watches the allied army near New York. Success requires secrecy, rapid marching, credit, shipping, and a fleet that remains long enough to close the bay.',
    context: 'Washington and Rochambeau shifted most of their force from the New York area toward Virginia while maintaining deception against Clinton. French naval control of the Chesapeake prevented Cornwallis from receiving relief or escaping by sea.',
    choices: [
      { id: 'a', advisor: 'diplomat', title: 'March for Virginia under a New York deception', text: 'Coordinate with Rochambeau and de Grasse, conceal the destination, and use French credit to move the allied army south.', effects: { foreign: 10, army: 6, supply: -8, credit: -4, congress: 4 }, modifiers: [{ flag: 'coalitionLiaison', note: 'Permanent liaison channels reduce the delays that damaged the Newport operation.', effects: { foreign: 4, army: 2 } }, { flag: 'militaryAlliance', note: 'Specific military guarantees improve access to ships, siege matériel, and French credit.', effects: { supply: 4, credit: 3 } }], flags: { yorktownMarch: true }, next: 'yorktown_siege' },
      { id: 'b', advisor: 'professional', title: 'Keep the main effort against New York', text: 'Treat Cornwallis as a southern detachment and preserve the long-planned concentration against Clinton’s principal base.', effects: { army: 5, supply: 3, foreign: -9, support: -5 }, flags: { newYorkPriority: true }, next: 'yorktown_siege' },
      { id: 'c', advisor: 'firebrand', title: 'Send Americans south immediately', text: 'Move ahead of French preparations so Virginia sees an American army taking the lead against Cornwallis.', effects: { support: 8, army: -5, supply: -10, foreign: -4, congress: 2 }, modifiers: [{ flag: 'partisanNetwork', note: 'Southern intelligence and local guides shorten the American approach to the Chesapeake.', effects: { army: 3, supply: 2 } }], flags: { americanDashSouth: true }, next: 'yorktown_siege' },
    ],
  },
  {
    id: 'yorktown_siege',
    date: 'October 14, 1781',
    act: 'Act IV · Southern Decision',
    title: 'The Second Parallel',
    actor: 'Allied Headquarters',
    location: 'Yorktown, Virginia',
    summary: 'The allied siege works approach Yorktown, but British redoubts still block completion of the second parallel. De Grasse’s fleet controls the bay for now. A coordinated assault can close the line before Clinton attempts relief.',
    context: 'American and French troops captured Redoubts 9 and 10 on October 14, allowing the second parallel to be completed. Cornwallis sought terms three days later and signed the articles of capitulation on October 19.',
    choices: [
      { id: 'a', advisor: 'professional', title: 'Take both redoubts in coordinated columns', text: 'Use separate American and French assaults, unloaded muskets for surprise, and engineers ready to extend the parallel immediately.', effects: { army: 8, foreign: 8, support: 8, supply: -6, congress: 5 }, modifiers: [{ flag: 'coalitionLiaison', note: 'Established liaison officers synchronize the French and American assault columns.', effects: { foreign: 3, army: 3 } }, { flag: 'yorktownMarch', note: 'The successful concentration brings siege stores and fresh formations into position on time.', effects: { supply: 3, support: 2 } }], flags: { yorktownVictory: true }, next: null },
      { id: 'b', advisor: 'firebrand', title: 'Order an immediate general assault', text: 'Exploit the closing trap before the British can attempt evacuation, accepting heavier losses against prepared works.', effects: { support: 10, army: -12, supply: -9, foreign: 3 }, flags: { yorktownStormed: true }, next: null },
      { id: 'c', advisor: 'diplomat', title: 'Tighten the siege and offer honorable terms', text: 'Complete the batteries, preserve allied strength, and make surrender preferable to a final bombardment.', effects: { foreign: 7, army: 5, support: 3, supply: -3, congress: 4 }, modifiers: [{ flag: 'frenchAlliance', note: 'The mature alliance gives the capitulation greater military and diplomatic weight.', effects: { foreign: 4, congress: 2 } }], flags: { yorktownTerms: true }, next: null },
    ],
  },
];

export const PRIMERS = {
  militia: {
    title: 'Militia and Continental Service',
    body: 'Militia mobilized local manpower quickly and defended communities, but short service and provincial command complicated sustained campaigning. The Continental establishment attempted to create a force able to remain in the field.',
    sources: 'Journals of the Continental Congress, June 1775; Charles Royster, A Revolutionary People at War.',
  },
  command: {
    title: 'Why Washington',
    body: 'Washington brought prior military experience, but his appointment was also a political act. A Virginian commander helped make the army outside Boston a continental rather than solely New England institution.',
    sources: 'John Adams diary and autobiography; Journals of the Continental Congress, June 1775.',
  },
  reconciliation: {
    title: 'Resistance Before Independence',
    body: 'Many colonists took up arms while still professing loyalty to the king. Reconciliation and resistance coexisted because opinion, constitutional argument, and expectations of British policy remained unsettled through 1775.',
    sources: 'Olive Branch Petition; Declaration of the Causes and Necessity of Taking Up Arms.',
  },
  independence: {
    title: 'Resolution, Declaration, and Government',
    body: 'The July 2 resolution made the political decision for independence; the Declaration adopted July 4 explained that decision publicly. Neither act established a finished central government or gave Congress dependable revenue and enforcement powers.',
    sources: 'Journals of the Continental Congress, June 7 and July 2–4, 1776; Declaration of Independence; John Dickinson’s draft Articles of Confederation.',
  },
  state_instructions: {
    title: 'Delegates, States, and Effective Unanimity',
    body: 'Congress voted by colonies, and delegates could be constrained by instructions from home. Securing revised authority mattered because independence needed to appear a common act even though New York could not vote on July 2.',
    sources: 'Journals of the Continental Congress, June 7–July 2, 1776; John Adams, Notes of Debates; New York Provincial Congress resolution, July 9, 1776.',
  },
  declaration: {
    title: 'From Congressional Act to Public Argument',
    body: 'The Declaration addressed several audiences at once: inhabitants of the new states, soldiers sustaining the war, and foreign powers judging whether American independence represented a viable political cause. Printing and public reading made the congressional act widely known.',
    sources: 'Dunlap Broadside, July 4, 1776; John Hancock to George Washington, July 6, 1776; Washington general orders, July 9, 1776.',
  },
  new_york: {
    title: 'Why New York Was Difficult to Hold',
    body: 'New York’s islands, rivers, and harbor favored the side with naval command. Continental forces had to guard several approaches while British ships could move troops and threaten communications.',
    sources: 'George Washington correspondence, July-August 1776; Henry P. Johnston, The Campaign of 1776 Around New York and Brooklyn.',
  },
  evacuation: {
    title: 'The Brooklyn Evacuation',
    body: 'The night withdrawal preserved the Continental Army after a serious defeat. Boats, mariners, rear-guard discipline, fog, and British hesitation mattered as much as battlefield courage.',
    sources: 'Washington to John Hancock, August 31, 1776; General Orders, August 31, 1776; George Washington Papers, Library of Congress.',
  },
  army: {
    title: 'An Army Near Dissolution',
    body: 'Continental enlistments were short, disease was common, and soldiers expected pay and supply from institutions that barely existed. Preserving a trained core could matter more than holding ground.',
    sources: 'George Washington papers, December 1776; Robert Middlekauff, The Glorious Cause.',
  },
  authority: {
    title: 'Emergency Power and Civil Rule',
    body: 'Congress expanded Washington’s authority because ordinary committee procedure was too slow for the crisis. The grant was temporary and remained tied to a civilian political cause.',
    sources: 'Journals of the Continental Congress, December 27, 1776.',
  },
  trenton: {
    title: 'Why Trenton Mattered',
    body: 'The victory was small by European battlefield standards but large in political effect. It challenged the assumption that British occupation would end organized resistance quickly.',
    sources: 'Washington to John Hancock, December 27, 1776; David Hackett Fischer, Washington’s Crossing.',
  },
  philadelphia: {
    title: 'Capital and Army',
    body: 'Philadelphia was the seat of Congress, not a fortress whose fall ended political resistance. Howe could occupy the city and still fail to destroy Washington’s army or compel the states to submit.',
    sources: 'George Washington correspondence, September 1777; Journals of the Continental Congress, September 1777.',
  },
  saratoga: {
    title: 'Why Burgoyne Became Isolated',
    body: 'Burgoyne’s army depended on a long route from Canada through difficult country. American obstruction, militia concentration, failed cooperation, and losses at Bennington narrowed his freedom before the battles near Saratoga.',
    sources: 'Burgoyne campaign correspondence; Horatio Gates to John Hancock, October 1777; National Park Service, Saratoga campaign studies.',
  },
  alliance: {
    title: 'Alliance, Not Charity',
    body: 'France sought to weaken Britain and recover strategic influence. American victory made formal support appear less speculative; French recognition, credit, troops, and naval power then changed the scale of the war.',
    sources: 'Treaty of Amity and Commerce and Treaty of Alliance, February 6, 1778; Papers of Benjamin Franklin.',
  },
  valley_forge: {
    title: 'Supply Was a Political System',
    body: 'The worst shortages reflected more than absent food. Competing agents, weak paper credit, transport failures, state authority, and local resistance determined whether provisions reached a large permanent army.',
    sources: 'Valley Forge returns and commissary records, December 1777-March 1778; Erna Risch, Supplying Washington’s Army.',
  },
  command_dispute: {
    title: 'The Conway Cabal in Proportion',
    body: 'Officers and delegates criticized Washington and promoted alternatives, especially after Saratoga. Surviving evidence does not establish one disciplined conspiracy; patronage, military performance, and institutional rivalry overlapped.',
    sources: 'George Washington Papers, winter 1777-1778; Journals of the Continental Congress; John Ferling, The First of Men.',
  },
  monmouth: {
    title: 'What Monmouth Proved',
    body: 'Monmouth did not destroy Clinton’s army or prevent its arrival near New York. It showed that Washington could restore a confused field and that the Continental line could withstand British regulars in sustained action.',
    sources: 'George Washington general orders and correspondence, June-July 1778; U.S. Army Center of Military History, Monmouth campaign summary.',
  },
  coalition: {
    title: 'Allies Retain Their Own Interests',
    body: 'French and American forces shared an enemy without sharing one command system. Fleet condition, royal instructions, weather, local expectations, and different strategic priorities could defeat an agreed operation.',
    sources: 'Lafayette to Washington, August 25-26, 1778; d’Estaing and Washington correspondence, September 1778.',
  },
  frontier_war: {
    title: 'Several Frontier Wars at Once',
    body: 'The western and northern frontiers were not empty margins. Native nations, settlers, imperial officers, land companies, and state governments pursued different claims. Raids and expeditions joined the Revolution to older struggles over territory and political authority.',
    sources: 'George Washington to John Sullivan, May 31, 1779; George Rogers Clark memoir and correspondence, 1778-1779; Journals of the Continental Congress.',
  },
  southern_strategy: {
    title: 'Why Britain Turned South',
    body: 'British leaders expected stronger Loyalist support in the southern colonies and hoped coastal bases could be linked to interior political control. Capturing ports was possible; converting occupation into durable authority required troops, supply, and local cooperation across a large countryside.',
    sources: 'Henry Clinton correspondence and narrative; Cornwallis papers, 1780; Piers Mackesy, The War for America.',
  },
  charleston: {
    title: 'The Cost of Charleston',
    body: 'Charleston was politically and commercially important, but defending it placed a large American force where British land and naval operations could close the exits. The surrender removed thousands of troops that could not be quickly replaced.',
    sources: 'Benjamin Lincoln council of war minutes and correspondence, April-May 1780; Articles of Capitulation of Charleston, May 12, 1780.',
  },
  greene: {
    title: 'Greene’s Strategic Method',
    body: 'Greene did not need to win every battlefield to make British inland control untenable. He preserved a field army, used detached forces, rebuilt after reverses, and forced British commanders to spend men and supplies defending dispersed posts and communications.',
    sources: 'Nathanael Greene to George Washington, December 1780-April 1781; Papers of Nathanael Greene; Francis Vinton Greene, Life of Nathanael Greene.',
  },
  cowpens: {
    title: 'Defense in Depth at Cowpens',
    body: 'Morgan gave different troops tasks suited to their experience. Riflemen disrupted the advance, militia delivered limited volleys rather than being asked to hold indefinitely, and the Continental line and cavalry reserve converted Tarleton’s momentum into encirclement.',
    sources: 'Daniel Morgan to Nathanael Greene, January 19, 1781; John Eager Howard accounts; Banastre Tarleton, A History of the Campaigns of 1780 and 1781.',
  },
  carolinas: {
    title: 'A Tactical Field Is Not the Whole Campaign',
    body: 'Cornwallis held the ground at Guilford Courthouse but suffered losses difficult to replace. Greene retained an army and returned south against British posts. The result illustrates the difference between battlefield possession and strategic control.',
    sources: 'Nathanael Greene to Samuel Huntington, March 16, 1781; Cornwallis to Germain, March 17, 1781; Greene correspondence, spring 1781.',
  },
  yorktown: {
    title: 'Yorktown Required a Coalition',
    body: 'The concentration at Yorktown depended on French naval control, Rochambeau’s army, American troops, siege artillery, credit, deception, and rapid marching. No single arm could close Cornwallis’s escape and compel surrender by itself.',
    sources: 'Washington, Rochambeau, and de Grasse correspondence, August-October 1781; Articles of Capitulation at Yorktown, October 19, 1781.',
  },
};

export const PRIMER_BY_SCENARIO = {
  concord_aftermath: ['militia'],
  continental_command: ['command', 'militia'],
  bunker_hill_council: ['militia'],
  olive_branch: ['reconciliation'],
  independence_question: ['state_instructions', 'independence', 'reconciliation'],
  independence_vote: ['state_instructions', 'independence'],
  declaration_publication: ['declaration', 'independence'],
  new_york_defense: ['new_york'],
  long_island_council: ['new_york'],
  brooklyn_evacuation: ['evacuation', 'new_york'],
  new_jersey_retreat: ['army'],
  congressional_emergency: ['authority', 'army'],
  delaware_gamble: ['trenton', 'army'],
  winter_reckoning: ['trenton'],
  philadelphia_campaign: ['philadelphia', 'army'],
  northern_department: ['saratoga', 'militia'],
  saratoga_council: ['saratoga'],
  french_alliance: ['alliance'],
  valley_forge_crisis: ['valley_forge', 'army'],
  army_reform: ['command_dispute', 'valley_forge'],
  philadelphia_evacuation: ['monmouth', 'alliance'],
  monmouth_council: ['monmouth'],
  coalition_reckoning: ['coalition', 'alliance'],
  frontier_strategy: ['frontier_war'],
  charleston_decision: ['southern_strategy', 'charleston'],
  southern_command: ['southern_strategy', 'greene'],
  cowpens_council: ['cowpens', 'greene'],
  carolinas_reckoning: ['carolinas', 'greene'],
  chesapeake_convergence: ['yorktown', 'alliance'],
  yorktown_siege: ['yorktown', 'coalition'],
};

export const BATTLE_DESTINATIONS = {
  bunker_hill: 'olive_branch',
  long_island: 'brooklyn_evacuation',
  brandywine: 'northern_department',
  saratoga: 'french_alliance',
  monmouth: 'coalition_reckoning',
  cowpens: 'carolinas_reckoning',
  trenton: 'winter_reckoning',
};

export function clampMetric(value) {
  return Math.max(0, Math.min(100, value));
}

export function applyMetricDelta(value, delta) {
  if (delta <= 0) return clampMetric(value + delta);
  const firstBand = Math.min(delta, Math.max(0, 80 - value));
  const afterFirst = delta - firstBand;
  const secondBand = Math.min(afterFirst, Math.max(0, 90 - Math.max(value, 80)));
  const finalBand = Math.max(0, afterFirst - secondBand);
  return clampMetric(value + firstBand + secondBand * 0.45 + finalBand * 0.2);
}

function campaignPressure(metrics, turn) {
  if (turn < 4) return {};
  const pressure = {};
  if (metrics.army >= 76) pressure.supply = (pressure.supply || 0) - 1;
  if (metrics.supply < 35) {
    pressure.army = (pressure.army || 0) - 1;
    pressure.support = (pressure.support || 0) - 1;
  }
  if (metrics.credit < 35) pressure.congress = (pressure.congress || 0) - 1;
  if (metrics.support < 35) pressure.congress = (pressure.congress || 0) - 1;
  return pressure;
}

export function resolveChoiceEffects(state, choice) {
  const effects = { ...(choice.effects || {}) };
  const appliedModifiers = [];
  for (const modifier of choice.modifiers || []) {
    if (!state.flags?.[modifier.flag]) continue;
    for (const [key, delta] of Object.entries(modifier.effects || {})) effects[key] = (effects[key] || 0) + delta;
    appliedModifiers.push(modifier);
  }
  return { effects, appliedModifiers };
}

export function applyChoice(state, scenario, choice) {
  // Resolve by ID here as well as in the UI, keeping saves and callers consistent.
  choice = presentScenario(state, scenario).choices.find(item => item.id === choice.id) || choice;
  const { effects, appliedModifiers } = resolveChoiceEffects(state, choice);
  const metrics = { ...state.metrics };
  const appliedEffects = {};
  for (const [key, delta] of Object.entries(effects)) {
    const before = metrics[key] || 0;
    metrics[key] = applyMetricDelta(before, delta);
    appliedEffects[key] = Math.round((metrics[key] - before) * 10) / 10;
  }
  const pressure = campaignPressure(metrics, state.turn);
  for (const [key, delta] of Object.entries(pressure)) {
    const before = metrics[key] || 0;
    metrics[key] = clampMetric(before + delta);
    appliedEffects[key] = Math.round(((appliedEffects[key] || 0) + metrics[key] - before) * 10) / 10;
  }
  const historyEntry = { scenarioId: scenario.id, choiceId: choice.id, title: choice.title, effects: appliedEffects, nominalEffects: effects, pressure, modifiers: appliedModifiers.map((modifier) => modifier.note) };
  return {
    ...state,
    turn: state.turn + 1,
    scenarioId: choice.next ?? state.scenarioId,
    metrics,
    flags: { ...state.flags, ...(choice.flags || {}) },
    history: [...state.history, historyEntry],
    pendingBattle: choice.battle || false,
    completed: choice.next === null,
  };
}

// Preview uses the exact decision resolver, including inherited modifiers,
// diminishing gains, clamping and upkeep. It never mutates the campaign.
export function previewChoice(state, scenario, choice) {
  const next=applyChoice(state,scenario,choice),entry=next.history.at(-1);
  return {effects:entry.effects,modifiers:entry.modifiers,pressure:entry.pressure,
    limited:Object.entries(entry.nominalEffects).some(([key,delta])=>Math.abs(applyMetricDelta(state.metrics[key],delta)-state.metrics[key]-delta)>1e-8)};
}

export function applyBattleResult(state, battleId, result) {
  const trentonEffects = result === 'victory'
    ? { army: 10, support: 14, credit: 8, foreign: 8, congress: 5, supply: -3 }
    : result === 'withdrawal' ? { army: -3, support: -4, credit: -3, supply: -2 } : { army: -14, support: -12, credit: -9, foreign: -6, congress: -5 };
  const bunkerEffects = result === 'victory'
    ? { army: 6, support: 11, foreign: 5, supply: -8 }
    : result === 'withdrawal' ? { army: 2, support: 5, foreign: 3, supply: -5 } : { army: -9, support: -4, supply: -7, congress: -2 };
  const longIslandEffects = result === 'victory'
    ? { army: 5, support: 4, foreign: 3, supply: -6 }
    : result === 'withdrawal' ? { army: 1, support: -3, supply: -5 } : { army: -13, support: -8, supply: -8, congress: -4 };
  const brandywineEffects = result === 'victory'
    ? { army: 4, support: 4, congress: 3, supply: -6 }
    : result === 'withdrawal' ? { army: 2, support: -4, supply: -6, congress: -2 } : { army: -11, support: -8, supply: -7, congress: -3 };
  const saratogaEffects = result === 'victory'
    ? { foreign: 16, support: 10, army: 6, credit: 5, supply: -4 }
    : result === 'withdrawal' ? { foreign: 6, support: 2, army: -2, supply: -3 } : { foreign: -8, army: -8, support: -5, supply: -5 };
  const monmouthEffects = result === 'victory'
    ? { army: 9, support: 7, foreign: 4, supply: -5 }
    : result === 'withdrawal' ? { army: 2, support: -2, supply: -4 } : { army: -10, support: -7, foreign: -3, supply: -6 };
  const cowpensEffects = result === 'victory'
    ? { army: 10, support: 10, supply: 5, congress: 4, foreign: 3 }
    : result === 'withdrawal' ? { army: 2, support: -4, supply: -3 } : { army: -10, support: -8, supply: -6, congress: -3 };
  const battleEffects = { bunker_hill: bunkerEffects, long_island: longIslandEffects, brandywine: brandywineEffects, saratoga: saratogaEffects, monmouth: monmouthEffects, cowpens: cowpensEffects, trenton: trentonEffects };
  const effects = battleEffects[battleId] || trentonEffects;
  const metrics = { ...state.metrics };
  const appliedEffects = {};
  for (const [key, delta] of Object.entries(effects)) {
    const before=metrics[key];metrics[key]=applyMetricDelta(before,delta);
    appliedEffects[key]=Math.round((metrics[key]-before)*10)/10;
  }
  return {
    ...state,
    scenarioId: BATTLE_DESTINATIONS[battleId] || 'winter_reckoning',
    metrics,
    battleResult: result,
    pendingBattle: false,
    history: [...state.history, { scenarioId: `${battleId}_battle`, choiceId: result, title: `${{ bunker_hill: 'Bunker Hill', long_island: 'Long Island', brandywine: 'Brandywine', saratoga: 'Bemis Heights', monmouth: 'Monmouth', cowpens: 'Cowpens', trenton: 'Trenton' }[battleId] || 'Battle'}: ${result}`, effects: appliedEffects }],
  };
}

export function campaignGrade(metrics) {
  const average = Object.values(metrics).reduce((sum, value) => sum + value, 0) / Object.keys(metrics).length;
  if (average >= 78) return 'A';
  if (average >= 68) return 'B';
  if (average >= 56) return 'C';
  if (average >= 44) return 'D';
  return 'F';
}

const letterGrade = (score) => score >= 86 ? 'A' : score >= 74 ? 'B' : score >= 62 ? 'C' : score >= 50 ? 'D' : 'F';

export function campaignReport(metrics, history = []) {
  const categories = [
    { id: 'command', label: 'Command', score: metrics.army * 0.65 + metrics.support * 0.35, note: 'Preserving a force while sustaining the public cause.' },
    { id: 'sustainment', label: 'Sustainment', score: metrics.supply * 0.6 + metrics.credit * 0.4, note: 'Feeding, arming, and financing a continental war.' },
    { id: 'statecraft', label: 'Statecraft', score: metrics.congress * 0.55 + metrics.credit * 0.25 + metrics.support * 0.2, note: 'Holding political authority together under pressure.' },
    { id: 'coalition', label: 'Coalition', score: metrics.foreign * 0.65 + metrics.congress * 0.35, note: 'Turning recognition and coordination into strategic power.' },
  ].map((category) => ({ ...category, score: Math.round(category.score), grade: letterGrade(category.score) }));
  const ranked = history.map((entry) => ({
    ...entry,
    net: Object.values(entry.effects || {}).reduce((sum, value) => sum + value, 0),
  })).sort((a, b) => b.net - a.net);
  return {
    overall: campaignGrade(metrics),
    categories,
    strongest: ranked[0] || null,
    costliest: ranked.at(-1) || null,
  };
}
