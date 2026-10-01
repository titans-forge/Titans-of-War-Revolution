const canStrike = unit => unit?.type !== 'artillery' && unit?.order !== 'withdraw';

// Build the contact graph separately from its directed attacks. Every legal
// pair remains engaged, while each formation divides one tick of outgoing
// effort evenly among the opponents touching it.
export function planMeleeExchange(formations, isLegalContact) {
  if (!Array.isArray(formations) || typeof isLegalContact !== 'function') return { pairs: [], exchanges: [] };

  const pairs = [];
  const opponentCounts = new Map();
  for (let i = 0; i < formations.length; i++) for (let j = i + 1; j < formations.length; j++) {
    const a = formations[i], b = formations[j];
    if (!a || !b || a.side === b.side || !isLegalContact(a,b)) continue;
    pairs.push([a,b]);
    if (canStrike(a)) opponentCounts.set(a,(opponentCounts.get(a) || 0) + 1);
    if (canStrike(b)) opponentCounts.set(b,(opponentCounts.get(b) || 0) + 1);
  }

  const exchanges = [];
  for (const [a,b] of pairs) {
    if (canStrike(a)) exchanges.push({attacker:a,defender:b,effort:1/opponentCounts.get(a)});
    if (canStrike(b)) exchanges.push({attacker:b,defender:a,effort:1/opponentCounts.get(b)});
  }
  return {pairs,exchanges};
}
