import { Measurements, Gauges, PanelScript, Instruction, BlockSolution } from '../types.ts';

// --- Core Conversion Logic ---

export function cmToHalfNeedles(cm: number, gaugeX: number): number {
  // Based on spec: 52cm -> 108-108 with gauge 2.077. 
  // 52 * 2.077 = 108.004. 
  return Math.round(cm * gaugeX);
}

export function cmToRows(cm: number, gaugeY: number): number {
  return Math.round(cm * gaugeY);
}

// --- Block Solver ---

export function solveBlocks(
  needlesPerSide: number,
  rowBudget: number,
  blockA: { r: number; n: number },
  blockB: { r: number; n: number }
): BlockSolution | null {
  let best: BlockSolution = { nA: 0, nB: 0, waste: Infinity };
  let found = false;

  for (let nA = 0; nA <= Math.floor(needlesPerSide / blockA.n); nA++) {
    const remainingNeedles = needlesPerSide - nA * blockA.n;
    
    if (remainingNeedles % blockB.n === 0) {
      const nB = remainingNeedles / blockB.n;
      const rowsUsed = nA * blockA.r + nB * blockB.r;

      if (rowsUsed <= rowBudget) {
        const waste = rowBudget - rowsUsed;
        // Prefer tighter fit. Tie-breaker: prefer more nB blocks (smoother curve usually)
        if (waste < best.waste || (waste === best.waste && nB > best.nB)) {
          best = { nA, nB, waste };
          found = true;
        }
      }
    }
  }

  return found ? best : null;
}

// --- Panel Generators ---

export function generateBackPanel(m: Measurements, g: Gauges): PanelScript {
  const instructions: Instruction[] = [];
  let currentRow = 0;

  const T_n = cmToHalfNeedles(m.T, g.x);
  const S_n = cmToHalfNeedles(m.S, g.x);
  const C_n = cmToHalfNeedles(m.C, g.x);
  
  const LC_r = cmToRows(m.LC, g.y);
  const G_r = cmToRows(m.G, g.y);

  // Calculate Zones top-down to find fianco rows
  const shoulder_needles = S_n - C_n;
  const shoulder_rows = shoulder_needles * 2; // 2x2 blocks

  const armhole_needles = T_n - S_n;
  const b1_solution = solveBlocks(armhole_needles, G_r, { r: 2, n: 2 }, { r: 4, n: 2 });
  const b1_rows = b1_solution ? (b1_solution.nA * 2 + b1_solution.nB * 4) : 0;
  const b2_rows = G_r - b1_rows;

  const fianco_rows = LC_r - shoulder_rows - G_r;

  // Build Script bottom-up
  instructions.push({ action: 'AZZERO OROLOGIO', details: 'Azzera contatore', runningTotal: `${T_n}-${T_n}`, rowCounter: 0 });
  instructions.push({ action: 'Avvio', details: 'RETE II / TUB. / COSTA 1x1', runningTotal: `${T_n}-${T_n}`, rowCounter: 0 });
  
  // Zone A: Fianco
  currentRow += fianco_rows;
  instructions.push({ action: 'DRITTO', details: `Lavora ${fianco_rows} ranghi a dritto`, runningTotal: `${T_n}-${T_n}`, rowCounter: currentRow });

  // Zone B1: Armhole decreases
  if (b1_solution && (b1_solution.nA > 0 || b1_solution.nB > 0)) {
    currentRow += b1_rows;
    const details = `${b1_solution.nA} CALI 2x2 + ${b1_solution.nB} CALI 2x4 (Aghi rimasti: ${S_n}-${S_n})`;
    instructions.push({ action: 'Calo', details, runningTotal: `${S_n}-${S_n}`, rowCounter: currentRow });
  }

  // Zone B2: Armhole straight
  if (b2_rows > 0) {
    currentRow += b2_rows;
    instructions.push({ action: 'DRITTO', details: `Lavora ${b2_rows} ranghi a dritto`, runningTotal: `${S_n}-${S_n}`, rowCounter: currentRow });
  }

  // Zone C: Shoulder
  if (shoulder_needles > 0) {
    currentRow += shoulder_rows;
    const details = `${shoulder_needles} CALI 2x2 (Aghi rimasti: ${C_n}-${C_n})`;
    instructions.push({ action: 'Calo', details, runningTotal: `${C_n}-${C_n}`, rowCounter: currentRow });
  }

  return { name: 'Schiena', instructions };
}

export function generateFrontPanel(m: Measurements, g: Gauges): PanelScript {
  const instructions: Instruction[] = [];
  let currentRow = 0;

  const T_n = cmToHalfNeedles(m.T, g.x);
  const S_n = cmToHalfNeedles(m.S, g.x);
  const C_n = cmToHalfNeedles(m.C, g.x);
  
  const LC_r = cmToRows(m.LC, g.y);
  const G_r = cmToRows(m.G, g.y);
  const SC_r = cmToRows(m.SC, g.y);

  // Calculate Zones
  const armhole_needles = T_n - S_n;
  const b1_solution = solveBlocks(armhole_needles, G_r, { r: 2, n: 2 }, { r: 4, n: 2 });
  const b1_rows = b1_solution ? (b1_solution.nA * 2 + b1_solution.nB * 4) : 0;
  const b2_rows = G_r - b1_rows;
  
  const shoulder_needles = S_n - C_n;
  const shoulder_rows = shoulder_needles * 2;
  const fianco_rows = LC_r - shoulder_rows - G_r;

  // Neckline logic
  const intreccio = 16;
  const neck_rem_needles = C_n - intreccio;
  const neck_solution = solveBlocks(neck_rem_needles, SC_r, { r: 2, n: 2 }, { r: 4, n: 2 });
  const neck_dec_rows = neck_solution ? (neck_solution.nA * 2 + neck_solution.nB * 4) : 0;
  const neck_straight_rows = SC_r - neck_dec_rows;

  // Build Script
  instructions.push({ action: 'AZZERO OROLOGIO', details: 'Azzera contatore', runningTotal: `${T_n}-${T_n}`, rowCounter: 0 });
  instructions.push({ action: 'Avvio', details: 'RETE II / TUB. / COSTA 1x1', runningTotal: `${T_n}-${T_n}`, rowCounter: 0 });
  
  // Fianco
  currentRow += fianco_rows;
  instructions.push({ action: 'DRITTO', details: `Lavora ${fianco_rows} ranghi a dritto`, runningTotal: `${T_n}-${T_n}`, rowCounter: currentRow });

  // Armhole decreases
  if (b1_solution && (b1_solution.nA > 0 || b1_solution.nB > 0)) {
    currentRow += b1_rows;
    instructions.push({ action: 'Calo', details: `${b1_solution.nA} CALI 2x2 + ${b1_solution.nB} CALI 2x4 (Aghi rimasti: ${S_n}-${S_n})`, runningTotal: `${S_n}-${S_n}`, rowCounter: currentRow });
  }

  // Armhole straight up to neckline start
  const rows_before_neckline = LC_r - SC_r;
  const remaining_straight = rows_before_neckline - currentRow;
  
  if (remaining_straight > 0) {
    currentRow += remaining_straight;
    instructions.push({ action: 'DRITTO', details: `Lavora ${remaining_straight} ranghi a dritto fino allo scollo`, runningTotal: `${S_n}-${S_n}`, rowCounter: currentRow });
  }

  // Neckline start
  instructions.push({ action: 'Intreccio', details: `INTRECCIO ${intreccio}-${intreccio} (Centrale)`, runningTotal: `${S_n - intreccio}-${S_n - intreccio}`, rowCounter: currentRow });

  // Neckline decreases (happens concurrently with shoulder, simplified for linear script)
  if (neck_solution && (neck_solution.nA > 0 || neck_solution.nB > 0)) {
      currentRow += neck_dec_rows;
      instructions.push({ action: 'Calo', details: `${neck_solution.nA} CALI 2x2 + ${neck_solution.nB} CALI 2x4 (Scollo) (Aghi rimasti: ${S_n - C_n}-${S_n - C_n})`, runningTotal: `${S_n - C_n}-${S_n - C_n}`, rowCounter: currentRow });
  }

  if (neck_straight_rows > 0) {
      currentRow += neck_straight_rows;
      instructions.push({ action: 'DRITTO', details: `Lavora ${neck_straight_rows} ranghi a dritto`, runningTotal: `${S_n - C_n}-${S_n - C_n}`, rowCounter: currentRow });
  }

  return { name: 'Davanti', instructions };
}

export function generateSleevePanel(m: Measurements, g: Gauges): PanelScript {
  const instructions: Instruction[] = [];
  let currentRow = 0;

  const P_n = cmToHalfNeedles(m.P, g.x);
  const M_n = cmToHalfNeedles(m.M, g.x);
  const LM_r = cmToRows(m.LM, g.y);
  
  // Zone 1: Increases
  const inc_needles = M_n - P_n;
  const zone1_budget = Math.floor(LM_r * 0.7) - 10; // 10 is default straight rows
  const z1_solution = solveBlocks(inc_needles, zone1_budget, { r: 6, n: 1 }, { r: 8, n: 1 });
  const z1_rows = z1_solution ? (z1_solution.nA * 6 + z1_solution.nB * 8) : 0;

  // Zone 2: Straight
  const z2_rows = 10;

  // Zone 3: Decreases (Sleeve head)
  const testa_cm = 0.15 * m.T;
  const testa_n = cmToHalfNeedles(testa_cm, g.x);
  const dec_needles = M_n - testa_n;
  const z3_budget = LM_r - z1_rows - z2_rows;
  
  const z3_solution = solveBlocks(dec_needles, z3_budget, { r: 2, n: 2 }, { r: 4, n: 2 });
  const z3_rows = z3_solution ? (z3_solution.nA * 2 + z3_solution.nB * 4) : 0;
  const z3_waste = z3_budget - z3_rows;

  // Build Script
  instructions.push({ action: 'AZZERO OROLOGIO', details: 'Azzera contatore', runningTotal: `${P_n}-${P_n}`, rowCounter: 0 });
  instructions.push({ action: 'Avvio', details: 'RETE II / TUB. / COSTA 1x1', runningTotal: `${P_n}-${P_n}`, rowCounter: 0 });

  // Increases
  if (z1_solution && (z1_solution.nA > 0 || z1_solution.nB > 0)) {
    currentRow += z1_rows;
    instructions.push({ action: 'Aumento', details: `${z1_solution.nA} AUM. 1x6 + ${z1_solution.nB} AUM. 1x8 (Aghi rimasti: ${M_n}-${M_n})`, runningTotal: `${M_n}-${M_n}`, rowCounter: currentRow });
  }

  // Straight
  currentRow += z2_rows;
  instructions.push({ action: 'DRITTO', details: `Lavora ${z2_rows} ranghi a dritto`, runningTotal: `${M_n}-${M_n}`, rowCounter: currentRow });

  // Decreases
  if (z3_solution) {
    currentRow += z3_rows;
    // Format as requested: split nA into open and close
    const nA_open = Math.min(5, z3_solution.nA);
    const nA_close = z3_solution.nA - nA_open;
    let det = '';
    if (nA_open > 0) det += `${nA_open} CALI 2x2 `;
    if (z3_solution.nB > 0) det += `+ ${z3_solution.nB} CALI 2x4 `;
    if (nA_close > 0) det += `+ ${nA_close} CALI 2x2`;
    
    instructions.push({ action: 'Calo', details: `${det.trim().replace(/^\+ /, '')} (Aghi rimasti: ${testa_n}-${testa_n})`, runningTotal: `${testa_n}-${testa_n}`, rowCounter: currentRow });
  }

  if (z3_waste > 0) {
      currentRow += z3_waste;
      instructions.push({ action: 'DRITTO', details: `Lavora ${z3_waste} ranghi a dritto per terminare`, runningTotal: `${testa_n}-${testa_n}`, rowCounter: currentRow });
  }

  return { name: 'Manica x2', instructions };
}

export function generateNecklineBorder(m: Measurements, g: Gauges): PanelScript {
    const C_n = cmToHalfNeedles(m.C, g.x);
    // Total neckline is roughly front + back neck width. 
    // Back neck is C_n * 2. Front neck is C_n * 2. Total = C_n * 4.
    // Usually it's slightly less due to shaping, but we'll use a simple approximation for the border.
    const total_border_needles = Math.round(C_n * 3); 
    
    return {
        name: 'Bordo Girocollo',
        instructions: [
            { action: 'Avvio', details: 'RETE II / TUB. 14 (2)', runningTotal: `${total_border_needles}-${total_border_needles}`, rowCounter: 2 },
            { action: 'Costa', details: 'COSTA 1x1 div. 14', runningTotal: `${total_border_needles}-${total_border_needles}`, rowCounter: 30 }
        ]
    }
}

export function generateFullScript(clientName: string, yarnSpec: string, m: Measurements, g: Gauges): GeneratedScript {
  return {
    id: `KSG-${Date.now().toString().slice(-6)}`,
    clientName,
    date: new Date().toISOString().split('T')[0],
    yarnSpec,
    measurements: m,
    gauges: g,
    panels: [
      generateBackPanel(m, g),
      generateFrontPanel(m, g),
      generateSleevePanel(m, g),
      generateNecklineBorder(m, g)
    ]
  };
}
