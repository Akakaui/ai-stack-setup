import { createInterface } from 'readline';

async function readAllLines() {
  const rl = createInterface({ input: process.stdin });
  const lines = [];
  for await (const line of rl) {
    lines.push(line);
  }
  return lines;
}

function createTTYPrompt() {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const questions = [];
  let running = false;

  function ask(query) {
    return new Promise(resolve => {
      questions.push({ query, resolve });
      if (!running) processNext();
    });
  }

  function processNext() {
    running = true;
    const q = questions.shift();
    if (!q) { running = false; return; }
    rl.question(q.query, answer => {
      q.resolve(answer.trim());
      processNext();
    });
  }

  function close() { rl.close(); }
  return { ask, close };
}

function createPipePrompt(lines) {
  let idx = 0;
  const out = process.stdout;

  function ask(query) {
    out.write(query);
    const answer = idx < lines.length ? lines[idx++] : '';
    out.write(answer + '\n');
    return Promise.resolve(answer.trim());
  }

  function close() {}
  return { ask, close };
}

function parseMultiSelect(input) {
  return input.split(/[,;|]/).map(s => s.trim()).filter(Boolean);
}

export async function runPrompts() {
  const isTTY = process.stdin.isTTY;

  let prompt;
  if (isTTY) {
    prompt = createTTYPrompt();
  } else {
    const lines = await readAllLines();
    prompt = createPipePrompt(lines);
  }

  try {
    console.log('Let\'s get to know you and your business.\n');

    const name = await prompt.ask('  ? What\'s your name? (default: opex) ');
    const business = await prompt.ask('  ? What\'s your business/brand? (creator, coach, agency, SaaS, local biz, etc.) ');
    const goal = await prompt.ask('  ? What\'s your main goal? (generate leads, sell courses, build audience, get clients, etc.) ');

    console.log('');
    const installQdrant = await askConfirm(prompt, 'Do you want to install Qdrant (vector DB)?');
    const installOllama = await askConfirm(prompt, 'Do you want to install Ollama (local AI)?');
    const installYtdlp = await askConfirm(prompt, 'Do you want to install yt-dlp + ffmpeg (video tools)?');

    console.log('');
    const openrouterKey = await prompt.ask('  ? Do you have an OpenRouter API key? (optional, press Enter to skip) ');
    const notionKey = await prompt.ask('  ? Do you have a Notion integration key? (optional, press Enter to skip) ');

    console.log('');
    console.log('  Pick your content platforms (comma-separated):');
    console.log('    Options: Twitter/X, LinkedIn, YouTube, Instagram, TikTok, Blog/SEO');
    const platformsRaw = await prompt.ask('  ? Your platforms: ');
    const platforms = parseMultiSelect(platformsRaw);

    const industry = await prompt.ask('  ? What industry are you in? (e.g. SaaS, coaching, health, ecommerce, AI) ');

    return {
      name,
      business: business || 'creator/coach',
      goal: goal || 'build an audience and generate leads',
      installQdrant,
      installOllama,
      installYtdlp,
      openrouterKey,
      notionKey,
      platforms,
      industry: industry || 'digital business',
    };
  } finally {
    prompt.close();
  }
}

async function askConfirm(prompt, query, defaultYes = true) {
  const hint = defaultYes ? '[Y/n]' : '[y/N]';
  const answer = await prompt.ask(`  ${query} ${hint} `);
  const trimmed = answer.trim().toLowerCase();
  if (trimmed === '' && defaultYes) return true;
  if (trimmed === '' && !defaultYes) return false;
  return trimmed === 'y' || trimmed === 'yes';
}
