import { useState } from 'react';

interface AssemblyEditorProps {
  initialCode?: string;
  onAssemble?: (code: string) => void;
  onDisassemble?: (bytes: string) => void;
}

export function AssemblyEditor({ initialCode = '', onAssemble, onDisassemble }: AssemblyEditorProps) {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState<string>('');
  const [mode, setMode] = useState<'assemble' | 'disassemble'>('assemble');
  const [hexInput, setHexInput] = useState('');

  const handleAssemble = () => {
    // Simulate assembly - in real implementation, this would call an assembler
    const lines = code.split('\n').filter(line => line.trim() && !line.trim().startsWith(';'));
    const assembled: string[] = [];
    
    lines.forEach((line, index) => {
      const trimmed = line.trim().toLowerCase();
      const address = (0x1000 + index * 4).toString(16).padStart(8, '0');
      
      // Simple instruction encoding simulation
      let bytes = '';
      if (trimmed.startsWith('nop')) {
        bytes = '90';
      } else if (trimmed.startsWith('ret')) {
        bytes = 'c3';
      } else if (trimmed.startsWith('push')) {
        bytes = '55'; // push rbp
      } else if (trimmed.startsWith('pop')) {
        bytes = '5d'; // pop rbp
      } else if (trimmed.startsWith('mov')) {
        bytes = '48 89 e5'; // mov rbp, rsp (simplified)
      } else if (trimmed.startsWith('sub')) {
        bytes = '48 83 ec 20'; // sub rsp, 0x20
      } else if (trimmed.startsWith('add')) {
        bytes = '48 83 c4 20'; // add rsp, 0x20
      } else if (trimmed.startsWith('call')) {
        bytes = 'e8 00 00 00 00'; // call rel32
      } else if (trimmed.startsWith('jmp')) {
        bytes = 'e9 00 00 00 00'; // jmp rel32
      } else if (trimmed.startsWith('je') || trimmed.startsWith('jz')) {
        bytes = '74 00'; // je rel8
      } else if (trimmed.startsWith('jne') || trimmed.startsWith('jnz')) {
        bytes = '75 00'; // jne rel8
      } else if (trimmed.startsWith('cmp')) {
        bytes = '48 39 c0'; // cmp rax, rax
      } else if (trimmed.startsWith('xor')) {
        bytes = '31 c0'; // xor eax, eax
      } else if (trimmed.startsWith('int')) {
        bytes = 'cc'; // int3
      } else {
        bytes = '90'; // default to nop
      }
      
      assembled.push(`${address}: ${bytes.padEnd(20)} ${line.trim()}`);
    });
    
    setOutput(assembled.join('\n'));
    onAssemble?.(code);
  };

  const handleDisassemble = () => {
    // Simulate disassembly - in real implementation, this would call a disassembler
    const bytes = hexInput.split(/\s+/).filter(b => b.match(/^[0-9a-f]{2}$/i));
    const disassembled: string[] = [];
    let offset = 0;
    
    while (offset < bytes.length) {
      const address = (0x1000 + offset).toString(16).padStart(8, '0');
      const byte = bytes[offset].toLowerCase();
      
      let mnemonic = '';
      let operands = '';
      let instrSize = 1;
      
      // Simple instruction decoding
      if (byte === '90') {
        mnemonic = 'nop';
      } else if (byte === 'c3') {
        mnemonic = 'ret';
      } else if (byte === '55') {
        mnemonic = 'push';
        operands = 'rbp';
      } else if (byte === '5d') {
        mnemonic = 'pop';
        operands = 'rbp';
      } else if (byte === '48' && offset + 2 < bytes.length) {
        const nextByte = bytes[offset + 1].toLowerCase();
        if (nextByte === '89') {
          mnemonic = 'mov';
          operands = 'rbp, rsp';
          instrSize = 3;
        } else if (nextByte === '83') {
          const subByte = bytes[offset + 2].toLowerCase();
          if (subByte === 'ec') {
            mnemonic = 'sub';
            operands = `rsp, 0x${bytes[offset + 3] || '00'}`;
            instrSize = 4;
          } else if (subByte === 'c4') {
            mnemonic = 'add';
            operands = `rsp, 0x${bytes[offset + 3] || '00'}`;
            instrSize = 4;
          }
        }
      } else if (byte === 'e8' && offset + 4 < bytes.length) {
        mnemonic = 'call';
        operands = `0x${(parseInt(address, 16) + 5 + parseInt(bytes.slice(offset + 1, offset + 5).reverse().join(''), 16)).toString(16)}`;
        instrSize = 5;
      } else if (byte === 'e9' && offset + 4 < bytes.length) {
        mnemonic = 'jmp';
        operands = `0x${(parseInt(address, 16) + 5 + parseInt(bytes.slice(offset + 1, offset + 5).reverse().join(''), 16)).toString(16)}`;
        instrSize = 5;
      } else if (byte === '74' && offset + 1 < bytes.length) {
        mnemonic = 'je';
        operands = `0x${(parseInt(address, 16) + 2 + parseInt(bytes[offset + 1], 16)).toString(16)}`;
        instrSize = 2;
      } else if (byte === '75' && offset + 1 < bytes.length) {
        mnemonic = 'jne';
        operands = `0x${(parseInt(address, 16) + 2 + parseInt(bytes[offset + 1], 16)).toString(16)}`;
        instrSize = 2;
      } else if (byte === '31') {
        mnemonic = 'xor';
        operands = 'eax, eax';
        instrSize = 2;
      } else if (byte === 'cc') {
        mnemonic = 'int3';
      } else {
        mnemonic = 'db';
        operands = `0x${byte}`;
      }
      
      const instrBytes = bytes.slice(offset, offset + instrSize).join(' ');
      disassembled.push(`${address}: ${instrBytes.padEnd(20)} ${mnemonic} ${operands}`);
      
      offset += instrSize;
    }
    
    setOutput(disassembled.join('\n'));
    onDisassemble?.(hexInput);
  };

  const exampleCode = `; Example x86-64 assembly
; Function prologue
push rbp
mov rbp, rsp
sub rsp, 0x20

; Function body
xor eax, eax
mov [rbp-0x8], rdi
call 0x1050

; Function epilogue
add rsp, 0x20
pop rbp
ret`;

  const exampleHex = '55 48 89 e5 48 83 ec 20 31 c0 48 89 7d f8 e8 00 00 00 00 48 83 c4 20 5d c3';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white">Assembly Editor</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setMode('assemble')}
              className={`px-3 py-1 text-sm rounded ${
                mode === 'assemble'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Assemble
            </button>
            <button
              onClick={() => setMode('disassemble')}
              className={`px-3 py-1 text-sm rounded ${
                mode === 'disassemble'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Disassemble
            </button>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="p-4">
        {mode === 'assemble' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Assembly Code
            </label>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter assembly code..."
              className="w-full h-64 p-3 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white resize-none"
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleAssemble}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg"
              >
                Assemble
              </button>
              <button
                onClick={() => setCode(exampleCode)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg"
              >
                Load Example
              </button>
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Hex Bytes
            </label>
            <textarea
              value={hexInput}
              onChange={(e) => setHexInput(e.target.value)}
              placeholder="Enter hex bytes (e.g., 55 48 89 e5...)"
              className="w-full h-64 p-3 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white resize-none"
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleDisassemble}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg"
              >
                Disassemble
              </button>
              <button
                onClick={() => setHexInput(exampleHex)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg"
              >
                Load Example
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Output */}
      {output && (
        <div className="border-t border-gray-200 dark:border-gray-700">
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Output</h4>
          </div>
          <div className="p-4 max-h-96 overflow-y-auto">
            <pre className="font-mono text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
              {output}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
