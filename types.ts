
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
  groupName: string;
  timestamp: string; // New: To store message date/time
}

export interface Match {
  unitId: string;
  requirementId: string;
  score: number;
  reasoning: string;
}

export type TaskStatus = 'pending' | 'processing' | 'success' | 'error';

export interface ExtractionTask {
  id: string;
  fileId: string;
  chunkIndex: number;
  status: TaskStatus;
  progress: number;
  content: string;
  groupName: string;
  error?: string;
}

export interface ChatFile {
  id: string;
  name: string;
  groupName: string;
  rawContent: string;
  tasksCount: number;
}

export type ProcessingStep = 
  | 'idle'
  | 'uploading'
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
  files: ChatFile[];
  tasks: ExtractionTask[];
  units: PropertyEntity[];
  requirements: PropertyEntity[];
  matches: Match[];
  processingStep: ProcessingStep;
  theme: 'light' | 'dark';
  customApiKey?: string;
}
