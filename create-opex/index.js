import { runPrompts } from './prompts.js';
import { runOnboarding } from './onboarding.js';
import { runSetup } from './setup/common.js';

function printBanner() {
  const banner = `
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║              OPEX / AKAKA Business OS                    ║
║         AI Agent Fleet for Creators & Founders            ║
║                                                          ║
║             ╻ ╻┏━┓┏━┓┏━┓╻ ╻ ┏┓ ┏━┓╻  ╻                 ║
║             ┃┏┛┃ ┃┣━┛┣━┫┗┳┛ ┣┻┓┃ ┃┃  ┃                 ║
║             ┗┛ ┗━┛╹  ╹ ╹ ╹  ┗━┛┗━┛┗━╸╹                 ║
║                                                          ║
║              One-command setup. Ready in minutes.         ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
`;
  console.log(banner);
}

async function main() {
  printBanner();

  console.log('Welcome to the OPEX/AKAKA Business Operating System setup.\n');

  const answers = await runPrompts();
  console.log('\nSetting up your system...\n');

  runOnboarding(answers);

  await runSetup(answers);

  const userName = answers.name || 'User';
  console.log(`
╔══════════════════════════════════════════════════════════╗
║              ✓  OPEX/AKAKA SYSTEM READY!                ║
╚══════════════════════════════════════════════════════════╝

  ${userName}, your AKAKA Business OS has been initialized.

  ── Your system is at: .opex/

  ── NEXT STEPS:

  1. Read your system manifest:
     cat .opex/MANIFEST.md

  2. Open the INDEX.md to see how agents work:
     cat .opex/INDEX.md

  3. Start your AI agent tool and point it to this folder.
     The system will auto-initialize.

  4. (Optional) Configure your API keys in .opex/config/
     - user.config.md   → your name, business, platforms
     - models.config.md → your LLM routing preferences

  For help: https://github.com/akaka-ai/opex

  Go build. 🚀
`);
}

main().catch(err => {
  console.error('Setup failed:', err);
  process.exit(1);
});
