
export enum EntityType {
  UNIT = 'UNIT',
  REQUIREMENT = 'REQUIREMENT'
}

export enum Platform {
  WHATSAPP = 'WHATSAPP',
  TELEGRAM = 'TELEGRAM'
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
  timestamp: string;
  platform: Platform;
  username?: string; // For Telegram deep linking
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
  platform: Platform;
  error?: string;
}

export interface ChatFile {
  id: string;
  name: string;
  groupName: string;
  rawContent: string;
  tasksCount: number;
  platform: Platform;
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
