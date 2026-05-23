export interface Measurements {
  T: number; // Chest
  S: number; // Shoulders
  C: number; // Neck
  P: number; // Wrist
  M: number; // Upper arm
  LC: number; // Body length
  G: number; // Armhole depth
  SC: number; // Neckline depth
  LM: number; // Sleeve length
  TM: number; // Sleeve cap height
}

export interface Gauges {
  x: number; // Needles per cm (half-width basis)
  y: number; // Rows per cm
}

export interface Instruction {
  action: string;
  details: string;
  runningTotal: string;
  rowCounter: number;
}

export interface PanelScript {
  name: string;
  instructions: Instruction[];
}

export interface GeneratedScript {
  id: string;
  clientName: string;
  date: string;
  yarnSpec: string;
  measurements: Measurements;
  gauges: Gauges;
  panels: PanelScript[];
}

export interface ArchiveRecord extends GeneratedScript {
  finalMeasurements?: Partial<Measurements>;
}

export interface BlockSolution {
  nA: number;
  nB: number;
  waste: number;
}
