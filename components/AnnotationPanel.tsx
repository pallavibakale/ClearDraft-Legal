import React, { useState } from 'react';
import { Annotation, Clause } from '../types';
import { Button } from './Button';

interface AnnotationPanelProps {
  annotations: Annotation[];
  selectedClause: Clause | undefined;
  onAddAnnotation: (text: string) => void;
  onResolveAnnotation: (id: string) => void;
}

export const AnnotationPanel: React.FC<AnnotationPanelProps> = ({
  annotations,
  selectedClause,
  onAddAnnotation,
  onResolveAnnotation,
}) => {
  const [newText, setNewText] = useState('');

  const relevantAnnotations = selectedClause 
    ? annotations.filter(a => a.clauseId === selectedClause.id) 
    : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newText.trim()) {
      onAddAnnotation(newText);
      setNewText('');
    }
  };

  if (!selectedClause) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm p-6 text-center">
        <svg className="w-12 h-12 mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path></svg>
        <p>Select a clause to view or add annotations.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-200 shadow-sm">
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
          <span className="bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded text-xs font-mono">{selectedClause.numbering}</span>
          Annotations
        </h3>
      </div>

      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {relevantAnnotations.length === 0 ? (
          <p className="text-sm text-slate-400 italic">No annotations yet.</p>
        ) : (
          relevantAnnotations.map(ann => (
            <div key={ann.id} className={`p-3 rounded-lg border text-sm transition-opacity ${ann.resolved ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-amber-50 border-amber-200'}`}>
              <div className="flex justify-between items-start mb-1">
                <span className="font-semibold text-slate-700 text-xs">{ann.author}</span>
                <span className="text-xs text-slate-400">{new Date(ann.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
              <p className={`mb-2 text-slate-800 ${ann.resolved ? 'line-through text-slate-400' : ''}`}>{ann.text}</p>
              {!ann.resolved && (
                <button 
                  onClick={() => onResolveAnnotation(ann.id)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  Resolve
                </button>
              )}
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <form onSubmit={handleSubmit}>
          <textarea 
            className="w-full p-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none mb-2"
            rows={3}
            placeholder="Add a comment..."
            value={newText}
            onChange={e => setNewText(e.target.value)}
          />
          <Button type="submit" size="sm" className="w-full" disabled={!newText.trim()}>
            Add Annotation
          </Button>
        </form>
      </div>
    </div>
  );
};