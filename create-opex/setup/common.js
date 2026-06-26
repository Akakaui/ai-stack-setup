import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { homedir, platform } from 'os';
import { join } from 'path';

export async function runSetup(answers) {
  const isLinux = platform() === 'linux';
  const isMac = platform() === 'darwin';
  const isRoot = process.getuid && process.getuid() === 0;

  console.log('  Starting dependency setup...\n');

  if (answers.installQdrant) {
    await installQdrant(isLinux, isRoot);
  } else {
    console.log('  ○ Skipping Qdrant installation');
  }

  if (answers.installOllama) {
    await installOllama(isLinux, isMac, isRoot);
  } else {
    console.log('  ○ Skipping Ollama installation');
  }

  if (answers.installYtdlp) {
    await installYtdlp(isLinux, isMac, isRoot);
  } else {
    console.log('  ○ Skipping yt-dlp + ffmpeg installation');
  }

  if (answers.installOllama) {
    await setupOllama();
  }
}

async function run(cmd, label) {
  try {
    console.log(`  → ${label}...`);
    execSync(cmd, { stdio: 'pipe', timeout: 300000 });
    console.log(`  ✓ ${label} done`);
    return true;
  } catch (e) {
    console.error(`  ✗ ${label} failed: ${e.message}`);
    return false;
  }
}

async function installQdrant(isLinux, isRoot) {
  const qdrantDir = join(homedir(), 'qdrant');
  const binaryPath = join(qdrantDir, 'qdrant');

  if (existsSync(binaryPath)) {
    console.log('  ○ Qdrant already installed');
    return;
  }

  console.log('  → Downloading Qdrant...');

  const url = isLinux
    ? 'https://github.com/qdrant/qdrant/releases/latest/download/qdrant-x86_64-unknown-linux-gnu.tar.gz'
    : 'https://github.com/qdrant/qdrant/releases/latest/download/qdrant-x86_64-apple-darwin.tar.gz';

  await run(`mkdir -p ${qdrantDir}`, 'Creating Qdrant directory');
  const ok = await run(
    `curl -sL "${url}" | tar xz -C ${qdrantDir}`,
    'Extracting Qdrant binary'
  );

  if (ok) {
    await run(`chmod +x ${binaryPath}`, 'Making Qdrant executable');

    if (isRoot) {
      const serviceContent = `[Unit]
Description=Qdrant Vector Database
After=network.target

[Service]
Type=simple
ExecStart=${binaryPath}
Restart=always
User=${process.env.USER || 'root'}

[Install]
WantedBy=multi-user.target
`;
      try {
        execSync(`echo '${serviceContent.replace(/'/g, "'\\''")}' > /etc/systemd/system/qdrant.service`, { stdio: 'pipe' });
        execSync('systemctl daemon-reload && systemctl enable qdrant && systemctl start qdrant', { stdio: 'pipe' });
        console.log('  ✓ Qdrant systemd service started');
      } catch {
        console.log('  ! Starting Qdrant in background (not root — no systemd)');
        execSync(`nohup ${binaryPath} > ${qdrantDir}/qdrant.log 2>&1 &`, { stdio: 'pipe' });
      }
    } else {
      console.log('  ! Starting Qdrant in background (no systemd access)');
      execSync(`nohup ${binaryPath} > ${qdrantDir}/qdrant.log 2>&1 &`, { stdio: 'pipe' });
    }

    console.log('  ✓ Qdrant ready on port 6333');
  }
}

async function installOllama(isLinux, isMac, isRoot) {
  if (existsSync('/usr/local/bin/ollama') || existsSync('/usr/bin/ollama')) {
    console.log('  ○ Ollama already installed');
    return;
  }

  const ok = await run(
    'curl -fsSL https://ollama.com/install.sh | sh',
    'Installing Ollama'
  );

  if (ok) {
    console.log('  → Pulling nomic-embed-text model...');
    await run('ollama pull nomic-embed-text', 'Pulling nomic-embed-text model');
    console.log('  ✓ Ollama ready with nomic-embed-text');
  }
}

async function installYtdlp(isLinux, isMac, isRoot) {
  const ytdlpPath = '/usr/local/bin/yt-dlp';

  if (existsSync(ytdlpPath)) {
    console.log('  ○ yt-dlp already installed');
  } else {
    if (isMac) {
      await run('brew install yt-dlp ffmpeg 2>/dev/null || (curl -sL https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && chmod +x /usr/local/bin/yt-dlp)', 'Installing yt-dlp');
    } else {
      await run('pip3 install yt-dlp 2>/dev/null || pip install yt-dlp', 'Installing yt-dlp via pip');
    }
  }

  if (!existsSync('/usr/bin/ffmpeg') && !existsSync('/usr/local/bin/ffmpeg')) {
    console.log('  → Installing ffmpeg...');
    if (isMac) {
      await run('brew install ffmpeg 2>/dev/null || echo "Install ffmpeg manually: brew install ffmpeg"', 'Installing ffmpeg');
    } else if (isRoot) {
      await run('apt-get install -y ffmpeg', 'Installing ffmpeg');
    } else {
      await run('sudo apt-get install -y ffmpeg 2>/dev/null || echo "Install ffmpeg: sudo apt install ffmpeg"', 'Installing ffmpeg');
    }
  } else {
    console.log('  ○ ffmpeg already installed');
  }

  console.log('  ✓ yt-dlp + ffmpeg ready');
}

async function setupOllama() {
  try {
    execSync('curl -s http://localhost:11434/api/tags > /dev/null 2>&1', { timeout: 5000 });
    console.log('  ○ Ollama already running');
    return;
  } catch {
    console.log('  → Starting Ollama server...');
    execSync('nohup ollama serve > /tmp/ollama.log 2>&1 &', { stdio: 'pipe' });
    await new Promise(r => setTimeout(r, 3000));
    console.log('  ✓ Ollama server started');
  }
}
