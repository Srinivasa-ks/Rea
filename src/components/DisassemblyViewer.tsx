import { useState } from 'react';

interface DisassemblyLine {
  address: string;
  bytes: string;
  mnemonic: string;
  operands: string;
  comment?: string;
  isSelected?: boolean;
}

interface DisassemblyViewerProps {
  lines: DisassemblyLine[];
  onLineSelect?: (line: DisassemblyLine) => void;
  onAddressClick?: (address: string) => void;
}

export function DisassemblyViewer({ lines, onLineSelect, onAddressClick }: DisassemblyViewerProps) {
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [breakpoints, setBreakpoints] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [showComments, setShowComments] = useState(true);

  const toggleBreakpoint = (address: string) => {
    const newBreakpoints = new Set(breakpoints);
    if (newBreakpoints.has(address)) {
      newBreakpoints.delete(address);
    } else {
      newBreakpoints.add(address);
    }
    setBreakpoints(newBreakpoints);
  };

  const handleLineClick = (index: number, line: DisassemblyLine) => {
    setSelectedLine(index);
    onLineSelect?.(line);
  };

  const filteredLines = searchTerm
    ? lines.filter(line => 
        line.mnemonic.toLowerCase().includes(searchTerm.toLowerCase()) ||
        line.operands.toLowerCase().includes(searchTerm.toLowerCase()) ||
        line.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (line.comment && line.comment.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : lines;

  const getInstructionColor = (mnemonic: string): string => {
    const colors: Record<string, string> = {
      // Data movement
      'mov': 'text-blue-400',
      'movzx': 'text-blue-400',
      'movsx': 'text-blue-400',
      'lea': 'text-blue-400',
      'xchg': 'text-blue-400',
      
      // Stack operations
      'push': 'text-purple-400',
      'pop': 'text-purple-400',
      
      // Arithmetic
      'add': 'text-green-400',
      'sub': 'text-green-400',
      'mul': 'text-green-400',
      'div': 'text-green-400',
      'inc': 'text-green-400',
      'dec': 'text-green-400',
      'neg': 'text-green-400',
      
      // Logic
      'and': 'text-yellow-400',
      'or': 'text-yellow-400',
      'xor': 'text-yellow-400',
      'not': 'text-yellow-400',
      'shl': 'text-yellow-400',
      'shr': 'text-yellow-400',
      
      // Comparison
      'cmp': 'text-orange-400',
      'test': 'text-orange-400',
      
      // Control flow
      'jmp': 'text-red-400',
      'je': 'text-red-400',
      'jne': 'text-red-400',
      'jz': 'text-red-400',
      'jnz': 'text-red-400',
      'jg': 'text-red-400',
      'jl': 'text-red-400',
      'jge': 'text-red-400',
      'jle': 'text-red-400',
      'ja': 'text-red-400',
      'jb': 'text-red-400',
      'call': 'text-pink-400',
      'ret': 'text-pink-400',
      
      // Special
      'nop': 'text-gray-500',
      'int': 'text-cyan-400',
      'int3': 'text-cyan-400',
      'leave': 'text-purple-400',
    };
    
    return colors[mnemonic.toLowerCase()] || 'text-gray-300';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Toolbar */}
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-gray-900 dark:text-white">Disassembly View</h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {filteredLines.length} instructions
          </span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          <button
            onClick={() => setShowComments(!showComments)}
            className={`px-3 py-1 text-sm rounded ${
              showComments 
                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Comments
          </button>
        </div>
      </div>

      {/* Disassembly */}
      <div className="max-h-[600px] overflow-y-auto font-mono text-sm">
        {filteredLines.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            No disassembly available
          </div>
        ) : (
          <div className="p-2">
            {filteredLines.map((line, index) => (
              <div
                key={index}
                onClick={() => handleLineClick(index, line)}
                className={`flex items-start gap-2 px-2 py-1 rounded cursor-pointer transition-colors ${
                  selectedLine === index
                    ? 'bg-indigo-100 dark:bg-indigo-900/30'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                {/* Breakpoint */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleBreakpoint(line.address);
                  }}
                  className={`w-4 h-4 rounded-full flex-shrink-0 mt-0.5 ${
                    breakpoints.has(line.address)
                      ? 'bg-red-500'
                      : 'bg-gray-300 dark:bg-gray-600 hover:bg-red-300 dark:hover:bg-red-700'
                  }`}
                  title="Toggle breakpoint"
                />

                {/* Address */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddressClick?.(line.address);
                  }}
                  className="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 w-24 flex-shrink-0 text-left"
                  title="Jump to address"
                >
                  {line.address}
                </button>

                {/* Bytes */}
                <span className="text-gray-400 dark:text-gray-500 w-32 flex-shrink-0 text-xs">
                  {line.bytes}
                </span>

                {/* Mnemonic */}
                <span className={`font-semibold w-16 flex-shrink-0 ${getInstructionColor(line.mnemonic)}`}>
                  {line.mnemonic}
                </span>

                {/* Operands */}
                <span className="text-gray-700 dark:text-gray-300 flex-1">
                  {line.operands}
                </span>

                {/* Comment */}
                {showComments && line.comment && (
                  <span className="text-gray-500 dark:text-gray-400 text-xs italic flex-shrink-0 max-w-xs truncate">
                    ; {line.comment}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400 flex items-center justify-between">
        <div>
          {selectedLine !== null && (
            <span>
              Selected: {filteredLines[selectedLine].address} | 
              Breakpoints: {breakpoints.size}
            </span>
          )}
        </div>
        <div>
          {searchTerm && <span>Filtered: {filteredLines.length} / {lines.length}</span>}
        </div>
      </div>
    </div>
  );
}
