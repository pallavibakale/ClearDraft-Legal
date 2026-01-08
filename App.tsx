import React, { useState, useCallback } from 'react';
import { Clause, Annotation, DocumentVersion, ClauseType, ValidationResult } from './types';
import { INITIAL_CLAUSES, validateStructure, createVersion } from './services/mockBackend';
import { summarizeVersionChanges } from './services/geminiService';
import { ClauseEditor } from './components/ClauseEditor';
import { AnnotationPanel } from './components/AnnotationPanel';
import { VersionHistory } from './components/VersionHistory';
import { Button } from './components/Button';

const App: React.FC = () => {
  // --- State ---
  const [clauses, setClauses] = useState<Clause[]>(INITIAL_CLAUSES);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  
  // Initialize with baseline version to ensure history is never empty
  const [versions, setVersions] = useState<DocumentVersion[]>(() => [
    createVersion(INITIAL_CLAUSES, "Initial Import")
  ]);

  const [selectedClauseId, setSelectedClauseId] = useState<string | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isAnnotationPanelOpen, setAnnotationPanelOpen] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // --- Actions ---

  const handleUpdateClause = (id: string, content: string) => {
    setClauses(prev => prev.map(c => c.id === id ? { ...c, content } : c));
    setSaveStatus('idle');
  };

  const handleDeleteClause = (id: string) => {
    setClauses(prev => prev.filter(c => c.id !== id));
  };

  const handleAddAnnotation = (text: string) => {
    if (!selectedClauseId) return;
    const newAnnotation: Annotation = {
      id: `a-${Date.now()}`,
      clauseId: selectedClauseId,
      text,
      author: 'Current User',
      timestamp: Date.now(),
      resolved: false,
    };
    setAnnotations(prev => [...prev, newAnnotation]);
  };

  const handleResolveAnnotation = (id: string) => {
    setAnnotations(prev => prev.map(a => a.id === id ? { ...a, resolved: !a.resolved } : a));
  };

  const handleSaveVersion = async () => {
    setSaveStatus('saving');
    
    // 1. Validate
    const validation: ValidationResult = validateStructure(clauses);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      setSaveStatus('error');
      return;
    }
    setValidationErrors([]);

    // 2. Generate Summary (using AI if available)
    const lastVersion = versions[versions.length - 1];
    const oldClauses = lastVersion ? lastVersion.clauses : [];
    const summary = await summarizeVersionChanges(oldClauses, clauses);

    // 3. Create Version
    const newVersion = createVersion(clauses, summary);
    setVersions(prev => [...prev, newVersion]);
    setSaveStatus('saved');
    
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const handleRestoreVersion = (version: DocumentVersion) => {
    if (confirm(`Are you sure you want to rollback to version from ${new Date(version.timestamp).toLocaleString()}? Unsaved changes will be lost.`)) {
      setClauses(version.clauses); // In a real app, this would also create a new 'revert' version
      setSaveStatus('idle');
    }
  };

  const handleAddClause = () => {
    const newClause: Clause = {
        id: `c-${Date.now()}`,
        type: ClauseType.PARAGRAPH,
        content: '',
        numbering: 'NEW', // In a real app, logic would calculate next numbering
        locked: false
    };
    // Insert after selected or at end
    if (selectedClauseId) {
        const idx = clauses.findIndex(c => c.id === selectedClauseId);
        const newClauses = [...clauses];
        newClauses.splice(idx + 1, 0, newClause);
        setClauses(newClauses);
    } else {
        setClauses([...clauses, newClause]);
    }
    setSelectedClauseId(newClause.id);
  };

  const selectedClause = clauses.find(c => c.id === selectedClauseId);

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      
      {/* Left Sidebar: Version History */}
      <div className={`${isSidebarOpen ? 'w-80' : 'w-0'} flex-shrink-0 transition-all duration-300 ease-in-out border-r border-slate-200 overflow-hidden`}>
        <VersionHistory 
          versions={versions} 
          currentVersionId={versions[versions.length - 1]?.id} 
          onRestore={handleRestoreVersion} 
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col min-w-0 bg-gray-50/50">
        
        {/* Header / Toolbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="text-slate-500 hover:text-slate-700">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7"></path></svg>
            </button>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">ClearDraft <span className="text-blue-600">Legal</span></h1>
            {saveStatus === 'error' && (
                <span className="text-xs text-red-500 font-medium bg-red-50 px-2 py-1 rounded">Validation Failed</span>
            )}
            {saveStatus === 'saved' && (
                <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    Saved
                </span>
            )}
          </div>

          <div className="flex items-center gap-3">
             <Button onClick={handleAddClause} variant="secondary" size="sm">
               + Add Clause
             </Button>
             <Button onClick={handleSaveVersion} disabled={saveStatus === 'saving'}>
                {saveStatus === 'saving' ? 'Saving...' : 'Save Version'}
             </Button>
             <button onClick={() => setAnnotationPanelOpen(!isAnnotationPanelOpen)} className={`p-2 rounded-md ${isAnnotationPanelOpen ? 'bg-amber-100 text-amber-700' : 'text-slate-400 hover:bg-slate-100'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path></svg>
             </button>
          </div>
        </header>

        {/* Editor Area */}
        <main className="flex-grow overflow-y-auto p-8 flex justify-center scroll-smooth">
          <div className="w-full max-w-4xl bg-white min-h-[calc(100vh-8rem)] shadow-sm border border-slate-200 p-12 rounded-sm">
             
             {/* Validation Errors Banner */}
             {validationErrors.length > 0 && (
                <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-md">
                    <h4 className="text-red-800 font-semibold mb-2">Structure Violations Found:</h4>
                    <ul className="list-disc list-inside text-sm text-red-700">
                        {validationErrors.map((err, i) => <li key={i}>{err}</li>)}
                    </ul>
                </div>
             )}

             <div className="space-y-2">
                {clauses.map(clause => (
                    <ClauseEditor
                        key={clause.id}
                        clause={clause}
                        isSelected={selectedClauseId === clause.id}
                        onSelect={setSelectedClauseId}
                        onUpdate={handleUpdateClause}
                        onDelete={handleDeleteClause}
                        hasAnnotations={annotations.some(a => a.clauseId === clause.id)}
                    />
                ))}
             </div>
             
             <div className="mt-12 pt-8 border-t border-slate-100 text-center text-slate-400 text-sm">
                 End of Document
             </div>
          </div>
        </main>
      </div>

      {/* Right Sidebar: Annotations */}
      <div className={`${isAnnotationPanelOpen ? 'w-80' : 'w-0'} flex-shrink-0 transition-all duration-300 ease-in-out border-l border-slate-200 overflow-hidden`}>
          <AnnotationPanel 
             annotations={annotations}
             selectedClause={selectedClause}
             onAddAnnotation={handleAddAnnotation}
             onResolveAnnotation={handleResolveAnnotation}
          />
      </div>

    </div>
  );
};

export default App;