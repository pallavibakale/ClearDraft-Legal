import React from 'react';
import { DocumentVersion } from '../types';
import { Button } from './Button';

interface VersionHistoryProps {
  versions: DocumentVersion[];
  currentVersionId: string | null;
  onRestore: (version: DocumentVersion) => void;
}

export const VersionHistory: React.FC<VersionHistoryProps> = ({
  versions,
  currentVersionId,
  onRestore,
}) => {
  return (
    <div className="h-full bg-slate-50 border-r border-slate-200 flex flex-col">
      <div className="p-4 border-b border-slate-200">
        <h2 className="font-bold text-slate-800 flex items-center gap-2">
          <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          Version History
        </h2>
      </div>
      <div className="flex-grow overflow-y-auto">
        <div className="divide-y divide-slate-100">
          {versions.slice().reverse().map((version, idx) => {
            const isCurrent = currentVersionId === version.id;
            return (
              <div key={version.id} className={`p-4 hover:bg-white transition-colors ${isCurrent ? 'bg-white border-l-4 border-blue-500' : ''}`}>
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-bold text-slate-500">v{versions.length - idx}.0</span>
                  <span className="text-xs text-slate-400">{new Date(version.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="text-sm font-medium text-slate-800 mb-1">
                  {version.summary || 'No summary'}
                </div>
                <div className="text-xs text-slate-500 mb-2">
                  Edited by {version.author}
                </div>
                {!isCurrent && (
                   <Button variant="secondary" size="sm" className="w-full text-xs" onClick={() => onRestore(version)}>
                     Rollback to this
                   </Button>
                )}
                 {isCurrent && (
                    <span className="inline-block px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-medium">Active</span>
                 )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};