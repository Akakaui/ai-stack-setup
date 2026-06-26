export function generateMcpConfig(answers) {
  const servers = {};

  if (answers.openrouterKey) {
    servers['openrouter-image'] = {
      type: 'local',
      command: ['npx', '-y', '@mindbreaker81/openrouter-image'],
      environment: {
        OPENROUTER_API_KEY: answers.openrouterKey,
      },
    };
  }

  if (answers.notionKey) {
    servers['notion'] = {
      type: 'local',
      command: ['npx', '-y', '@notionhq/notion-mcp'],
      environment: {
        NOTION_INTEGRATION_KEY: answers.notionKey,
      },
    };
  }

  return servers;
}

export function getMcpInstallInstructions(answers) {
  const steps = [];

  if (answers.openrouterKey) {
    steps.push('OpenRouter MCP: npx -y @mindbreaker81/openrouter-image');
  }

  if (answers.notionKey) {
    steps.push('Notion MCP: npx -y @notionhq/notion-mcp');
  }

  return steps;
}
