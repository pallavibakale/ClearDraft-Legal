import React, { useRef, useEffect, useState } from 'react';
import { Clause, ClauseType } from '../types';
import { Button } from './Button';
import { analyzeClauseLegality } from '../services/geminiService';

interface ClauseEditorProps {
  clause: Clause;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onUpdate: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  hasAnnotations: boolean;
}

export const ClauseEditor: React.FC<ClauseEditorProps> = ({
  clause,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  hasAnnotations,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [clause.content, isSelected]);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    const result = await analyzeClauseLegality(clause.content);
    setAiSuggestion(result);
    setIsAnalyzing(false);
  };

  return (
    <div 
      className={`group relative mb-4 transition-all duration-200 ${
        isSelected ? 'ring-2 ring-blue-500 rounded-lg bg-white shadow-sm' : 'hover:bg-gray-50'
      }`}
      onClick={() => onSelect(clause.id)}
    >
      <div className="flex items-start p-4 gap-4">
        {/* Numbering Gutter */}
        <div className="w-12 pt-1 flex-shrink-0 text-right select-none">
          <span className={`text-sm font-semibold text-slate-400 ${clause.type === ClauseType.HEADING ? 'text-slate-900 font-bold' : ''}`}>
            {clause.numbering}
          </span>
        </div>

        {/* Content */}
        <div className="flex-grow relative min-w-0">
          {isSelected ? (
            <textarea
              ref={textareaRef}
              value={clause.content}
              onChange={(e) => onUpdate(clause.id, e.target.value)}
              className={`w-full bg-transparent resize-none outline-none overflow-hidden legal-text text-slate-800 placeholder-slate-300 ${
                clause.type === ClauseType.HEADING ? 'font-bold text-lg uppercase tracking-wide' : 'text-base leading-relaxed'
              }`}
              placeholder="Enter clause text..."
            />
          ) : (
            <div className={`legal-text text-slate-800 whitespace-pre-wrap ${
               clause.type === ClauseType.HEADING ? 'font-bold text-lg uppercase tracking-wide' : 'text-base leading-relaxed'
            }`}>
              {clause.content}
            </div>
          )}
          
          {/* AI Feedback */}
          {isSelected && aiSuggestion && (
            <div className="mt-4 p-4 bg-indigo-50 border-l-4 border-indigo-500 rounded-r-md shadow-sm animate-fade-in">
              <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 text-indigo-600 mt-1">
                     {/* Sparkles Icon */}
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  </div>
                  <div>
                      <h4 className="text-sm font-bold text-indigo-900 mb-1">AI Legal Analysis</h4>
                      <p className="text-sm text-indigo-800 leading-relaxed">{aiSuggestion}</p>
                  </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Action Column - Dedicated space prevents overlap */}
        <div className="w-32 flex flex-col items-end gap-2 flex-shrink-0 pt-0.5">
           
           {/* Actions - Visible when selected */}
           <div className={`flex flex-col items-end gap-1 w-full transition-opacity duration-200 ${isSelected ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
               {isSelected && (
                   <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={(e) => { e.stopPropagation(); handleAnalyze(); }} 
                    disabled={isAnalyzing} 
                    className={`w-full justify-start pl-2 ${isAnalyzing ? "animate-pulse text-indigo-600" : "text-indigo-600 hover:bg-indigo-50"}`}
                   >
                       {isAnalyzing ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Checking...
                          </>
                       ) : (
                          <>
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
                            AI Check
                          </>
                       )}
                   </Button>
               )}
               {isSelected && !clause.locked && (
                   <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={(e) => { e.stopPropagation(); onDelete(clause.id); }} 
                    className="w-full justify-start pl-2 text-red-400 hover:text-red-600 hover:bg-red-50"
                   >
                       <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                       Delete
                   </Button>
               )}
           </div>

           {/* Annotation Indicator */}
           {hasAnnotations && (
             <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-100 self-end mr-1">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>Note</span>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};