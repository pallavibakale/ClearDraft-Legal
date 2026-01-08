export enum ClauseType {
  HEADING = 'HEADING',
  PARAGRAPH = 'PARAGRAPH',
  LIST_ITEM = 'LIST_ITEM'
}

export interface Clause {
  id: string;
  type: ClauseType;
  content: string;
  numbering?: string;
  locked?: boolean; // If true, prevents structural deletion without warning
}

export interface Annotation {
  id: string;
  clauseId: string;
  text: string;
  author: string;
  timestamp: number;
  resolved: boolean;
}

export interface DocumentVersion {
  id: string;
  timestamp: number;
  clauses: Clause[];
  summary: string;
  author: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}