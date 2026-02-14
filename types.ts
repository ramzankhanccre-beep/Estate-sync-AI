
export enum EntityType {
  UNIT = 'UNIT',
  REQUIREMENT = 'REQUIREMENT'
}

export interface PropertyEntity {
  id: string;
  type: EntityType;
  propertyType: string;
  community: string;
  price: number;
  size: string;
  contact: string;
  rawText: string;
}

export interface Match {
  unitId: string;
  requirementId: string;
  score: number; // 1-10
  reasoning: string;
}

export interface ExtractionResult {
  units: PropertyEntity[];
  requirements: PropertyEntity[];
}

export type ProcessingStep = 
  | 'idle'
  | 'reading'
  | 'extracting'
  | 'matching'
  | 'completed'
  | 'error';

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AppState {
  user: User | null;
  units: PropertyEntity[];
  requirements: PropertyEntity[];
  matches: Match[];
  rawChat: string;
  processingStep: ProcessingStep;
  currentChunk: number;
  totalChunks: number;
  error?: string;
  theme: 'light' | 'dark';
}
