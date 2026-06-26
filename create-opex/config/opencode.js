import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

export function generateOpenCodeConfig(answers, root) {
  const configDir = join(homedir(), '.config', 'opencode');
  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true });
  }

  const mcpServers = {};

  // Open Design MCP
  if (existsSync(join(homedir(), 'open-design'))) {
    mcpServers['open-design'] = {
      type: 'local',
      command: ['/usr/bin/node', join(homedir(), 'open-design', 'apps', 'daemon', 'dist', 'cli.js'), 'mcp'],
      environment: {
        OD_DATA_DIR: join(homedir(), 'open-design', '.od'),
        OD_SIDECAR_IPC_PATH: '/tmp/open-design/ipc/default/daemon.sock',
      },
    };
  }

  // OpenRouter Image MCP (if key provided)
  if (answers.openrouterKey) {
    mcpServers['openrouter-image'] = {
      type: 'local',
      command: ['npx', '-y', '@mindbreaker81/openrouter-image'],
      environment: {
        OPENROUTER_API_KEY: answers.openrouterKey,
      },
    };
  }

  // Notion MCP (if key provided)
  if (answers.notionKey) {
    mcpServers['notion'] = {
      type: 'local',
      command: ['npx', '-y', '@notionhq/notion-mcp'],
      environment: {
        NOTION_INTEGRATION_KEY: answers.notionKey,
      },
    };
  }

  const config = {
    $schema: 'https://opencode.ai/config.json',
    mcp: Object.keys(mcpServers).length > 0 ? mcpServers : undefined,
    permission: {
      bash: 'allow',
      edit: 'allow',
      webfetch: 'allow',
      read: 'allow',
    },
    agent: {
      primary: 'AKAKA',
      autoInit: true,
      indexPath: join(root, '.opex', 'INDEX.md'),
    },
  };

  const configPath = join(configDir, 'opencode.json');
  writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
  console.log('  ✓ OpenCode config generated (~/.config/opencode/opencode.json)');

  // Generate the .opex opencode.json as well for portable config
  const localConfigPath = join(root, '.opencode.json');
  writeFileSync(localConfigPath, JSON.stringify(config, null, 2) + '\n');
  console.log('  ✓ Local opencode.json generated (.opencode.json)');
}
