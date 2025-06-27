import React from 'react';
import { Download, Save, FolderOpen, FileText, Trash2 } from 'lucide-react';

interface ToolbarProps {
  onExport: () => void;
  onSave: () => void;
  onLoad: () => void;
  onNew: () => void;
  onDelete?: () => void;
  hasCurrentProject: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onExport,
  onSave,
  onLoad,
  onNew,
  onDelete,
  hasCurrentProject
}) => {
  return (
    <div className="flex gap-2 mb-4">
      <button
        onClick={onNew}
        className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
      >
        <FileText className="w-4 h-4" />
        New
      </button>
      
      <button
        onClick={onSave}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        <Save className="w-4 h-4" />
        Save
      </button>
      
      <button
        onClick={onLoad}
        className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
      >
        <FolderOpen className="w-4 h-4" />
        Load
      </button>
      
      <button
        onClick={onExport}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
      >
        <Download className="w-4 h-4" />
        Export PNG
      </button>
      
      {hasCurrentProject && onDelete && (
        <button
          onClick={onDelete}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors ml-auto"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      )}
    </div>
  );
};