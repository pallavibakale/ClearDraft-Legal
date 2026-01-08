import { Clause, ClauseType, DocumentVersion, ValidationResult } from '../types';

// Initial seed data
export const INITIAL_CLAUSES: Clause[] = [
  {
    id: 'c-1',
    type: ClauseType.HEADING,
    content: 'MASTER SERVICE AGREEMENT',
    numbering: '1.0',
    locked: true
  },
  {
    id: 'c-2',
    type: ClauseType.PARAGRAPH,
    content: 'This Master Service Agreement ("Agreement") is entered into as of the Effective Date by and between the Customer and the Service Provider.',
    numbering: '1.1'
  },
  {
    id: 'c-3',
    type: ClauseType.HEADING,
    content: 'TERM AND TERMINATION',
    numbering: '2.0',
    locked: true
  },
  {
    id: 'c-4',
    type: ClauseType.PARAGRAPH,
    content: 'The term of this Agreement shall commence on the Effective Date and shall continue for a period of twelve (12) months, unless earlier terminated in accordance with the provisions of this Section.',
    numbering: '2.1'
  },
  {
    id: 'c-5',
    type: ClauseType.PARAGRAPH,
    content: 'Either party may terminate this Agreement for cause immediately upon written notice if the other party breaches any material term of this Agreement.',
    numbering: '2.2'
  }
];

export const validateStructure = (clauses: Clause[]): ValidationResult => {
  const errors: string[] = [];
  
  if (clauses.length === 0) {
    errors.push("Document must contain at least one clause.");
  }

  // Example rule: Headings must have content
  clauses.forEach((clause, index) => {
    if (clause.type === ClauseType.HEADING && !clause.content.trim()) {
      errors.push(`Clause ${clause.numbering || index + 1}: Heading cannot be empty.`);
    }
    if (!clause.id) {
        errors.push(`Clause at index ${index} is missing a unique ID.`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const createVersion = (clauses: Clause[], summary: string): DocumentVersion => {
  return {
    id: `v-${Date.now()}`,
    timestamp: Date.now(),
    clauses: JSON.parse(JSON.stringify(clauses)), // Deep copy
    summary,
    author: 'Current User' // Mock user
  };
};