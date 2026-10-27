// MCP (Model Context Protocol) Integration
// Enables connection with Claude, Codex, Cursor, VS Code, and other AI tools

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, {
      type: string;
      description: string;
    }>;
    required?: string[];
  };
}

export interface MCPResource {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
}

export interface MCPPrompt {
  name: string;
  description: string;
  arguments?: Array<{
    name: string;
    description: string;
    required: boolean;
  }>;
}

export interface MCPServerConfig {
  name: string;
  version: string;
  description: string;
  tools: MCPTool[];
  resources: MCPResource[];
  prompts: MCPPrompt[];
}

// Define available MCP tools
export const MCP_TOOLS: MCPTool[] = [
  {
    name: 'analyze_file',
    description: 'Analyze a file for reverse engineering insights',
    inputSchema: {
      type: 'object',
      properties: {
        filePath: {
          type: 'string',
          description: 'Path to the file to analyze',
        },
        analysisType: {
          type: 'string',
          description: 'Type of analysis: binary, code, or auto',
        },
      },
      required: ['filePath'],
    },
  },
  {
    name: 'get_investigation_status',
    description: 'Get the current status of an investigation',
    inputSchema: {
      type: 'object',
      properties: {
        investigationId: {
          type: 'string',
          description: 'ID of the investigation',
        },
      },
      required: ['investigationId'],
    },
  },
  {
    name: 'list_investigations',
    description: 'List all investigations',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Maximum number of investigations to return',
        },
      },
    },
  },
  {
    name: 'get_evidence',
    description: 'Retrieve evidence for an investigation',
    inputSchema: {
      type: 'object',
      properties: {
        investigationId: {
          type: 'string',
          description: 'ID of the investigation',
        },
      },
      required: ['investigationId'],
    },
  },
  {
    name: 'run_sandbox',
    description: 'Execute code in the sandbox environment',
    inputSchema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'Code to execute',
        },
        timeout: {
          type: 'number',
          description: 'Execution timeout in milliseconds',
        },
      },
      required: ['code'],
    },
  },
  {
    name: 'disassemble',
    description: 'Disassemble binary code',
    inputSchema: {
      type: 'object',
      properties: {
        address: {
          type: 'string',
          description: 'Starting address',
        },
        length: {
          type: 'number',
          description: 'Number of bytes to disassemble',
        },
      },
      required: ['address', 'length'],
    },
  },
  {
    name: 'search_strings',
    description: 'Search for strings in a file',
    inputSchema: {
      type: 'object',
      properties: {
        filePath: {
          type: 'string',
          description: 'Path to the file',
        },
        pattern: {
          type: 'string',
          description: 'String pattern to search for',
        },
      },
      required: ['filePath', 'pattern'],
    },
  },
  {
    name: 'get_file_info',
    description: 'Get detailed information about a file',
    inputSchema: {
      type: 'object',
      properties: {
        filePath: {
          type: 'string',
          description: 'Path to the file',
        },
      },
      required: ['filePath'],
    },
  },
];

// Define available MCP resources
export const MCP_RESOURCES: MCPResource[] = [
  {
    uri: 'rea://investigations',
    name: 'Investigations',
    description: 'List of all investigations',
    mimeType: 'application/json',
  },
  {
    uri: 'rea://settings',
    name: 'Settings',
    description: 'Application settings',
    mimeType: 'application/json',
  },
  {
    uri: 'rea://agents',
    name: 'Agents',
    description: 'Multi-agent system status',
    mimeType: 'application/json',
  },
];

// Define available MCP prompts
export const MCP_PROMPTS: MCPPrompt[] = [
  {
    name: 'analyze_binary',
    description: 'Analyze a binary file for reverse engineering',
    arguments: [
      {
        name: 'filePath',
        description: 'Path to the binary file',
        required: true,
      },
      {
        name: 'focus',
        description: 'What to focus on (e.g., "security", "functionality", "performance")',
        required: false,
      },
    ],
  },
  {
    name: 'explain_code',
    description: 'Explain what a piece of code does',
    arguments: [
      {
        name: 'code',
        description: 'Code to explain',
        required: true,
      },
      {
        name: 'language',
        description: 'Programming language',
        required: false,
      },
    ],
  },
  {
    name: 'find_vulnerabilities',
    description: 'Find potential security vulnerabilities',
    arguments: [
      {
        name: 'filePath',
        description: 'Path to the file to analyze',
        required: true,
      },
    ],
  },
];

// MCP Server configuration
export const MCP_SERVER_CONFIG: MCPServerConfig = {
  name: 'REA Agentic AI',
  version: '2.0.0',
  description: 'Reverse Engineer Anything - AI-powered reverse engineering platform',
  tools: MCP_TOOLS,
  resources: MCP_RESOURCES,
  prompts: MCP_PROMPTS,
};

// MCP Client configurations for different AI tools
export const MCP_CLIENT_CONFIGS = {
  claude: {
    name: 'Claude Desktop',
    config: {
      mcpServers: {
        'rea-agent': {
          command: 'rea-agent',
          args: ['serve', '--mcp'],
          env: {},
        },
      },
    },
    instructions: 'Add this to your Claude Desktop config file (claude_desktop_config.json)',
  },
  codex: {
    name: 'Codex',
    config: {
      mcpServers: {
        'rea-agent': {
          command: 'rea-agent',
          args: ['serve', '--mcp'],
          env: {},
        },
      },
    },
    instructions: 'Add this to your Codex configuration',
  },
  cursor: {
    name: 'Cursor',
    config: {
      mcpServers: {
        'rea-agent': {
          command: 'rea-agent',
          args: ['serve', '--mcp'],
          env: {},
        },
      },
    },
    instructions: 'Add this to your Cursor MCP settings',
  },
  vscode: {
    name: 'VS Code',
    config: {
      'mcp.servers': {
        'rea-agent': {
          command: 'rea-agent',
          args: ['serve', '--mcp'],
          env: {},
        },
      },
    },
    instructions: 'Add this to your VS Code settings.json',
  },
};

// MCP Server class (simulated for web app)
export class MCPServer {
  private config: MCPServerConfig;
  private isConnected: boolean;

  constructor() {
    this.config = MCP_SERVER_CONFIG;
    this.isConnected = false;
  }

  // Start MCP server
  async start(): Promise<void> {
    // In a real implementation, this would start an HTTP server
    // For web app, we simulate the connection
    this.isConnected = true;
    console.log('MCP Server started');
  }

  // Stop MCP server
  async stop(): Promise<void> {
    this.isConnected = false;
    console.log('MCP Server stopped');
  }

  // Get server info
  getInfo(): MCPServerConfig {
    return this.config;
  }

  // Check if connected
  isServerConnected(): boolean {
    return this.isConnected;
  }

  // Handle tool call
  async handleToolCall(toolName: string, args: Record<string, any>): Promise<any> {
    // Simulate tool execution
    switch (toolName) {
      case 'list_investigations':
        return { investigations: [] };
      case 'get_file_info':
        return { path: args.filePath, size: 0, type: 'unknown' };
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }

  // Handle resource request
  async handleResourceRequest(uri: string): Promise<any> {
    switch (uri) {
      case 'rea://investigations':
        return { investigations: [] };
      case 'rea://settings':
        return { theme: 'light', autoApproveReads: true };
      case 'rea://agents':
        return { agents: [] };
      default:
        throw new Error(`Unknown resource: ${uri}`);
    }
  }
}

// Generate client configuration for a specific tool
export function generateClientConfig(tool: keyof typeof MCP_CLIENT_CONFIGS): string {
  const config = MCP_CLIENT_CONFIGS[tool];
  return JSON.stringify(config.config, null, 2);
}
