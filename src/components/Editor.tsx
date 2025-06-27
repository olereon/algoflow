import { AlertCircle, CheckCircle } from 'lucide-react';
import { ValidationResult } from '../types';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  validation?: ValidationResult;
  selectedLine?: number;
}

export const Editor: React.FC<EditorProps> = ({ value, onChange, validation, selectedLine }) => {
  const lines = value.split('\n');
  
  return (
    <div className="flex-1 bg-gray-900 rounded-lg p-4 text-white font-mono text-sm flex flex-col">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Pseudocode Editor</h3>
        <p className="text-gray-400 text-xs">
          End lines with :: to specify block types (e.g., "If condition::" for conditions)
        </p>
      </div>
      
      {validation && (
        <div className="mb-4">
          {validation.isValid ? (
            <div className="flex items-center text-green-400">
              <CheckCircle className="w-4 h-4 mr-2" />
              <span>Pseudocode is valid</span>
            </div>
          ) : (
            <div className="space-y-1">
              {validation.errors.map((error, i) => (
                <div key={i} className="flex items-center text-red-400">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  <span>{error}</span>
                </div>
              ))}
            </div>
          )}
          {validation.warnings.length > 0 && (
            <div className="mt-2 space-y-1">
              {validation.warnings.map((warning, i) => (
                <div key={i} className="flex items-center text-yellow-400">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  <span>{warning}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      <div className="relative flex-1 flex">
        <div className="absolute left-0 top-0 bottom-0 w-10 bg-gray-800 text-gray-500 text-right pr-2 select-none">
          {lines.map((_, i) => (
            <div key={i} className={selectedLine === i ? 'text-blue-400' : ''}>
              {i + 1}
            </div>
          ))}
        </div>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-full bg-transparent pl-12 pr-4 outline-none resize-none"
          placeholder="Start typing your pseudocode..."
          spellCheck={false}
        />
      </div>
    </div>
  );
};