import { execSync } from 'child_process';

export async function installLinuxPackages(packages) {
  const cmd = `sudo apt-get update -qq && sudo apt-get install -y -qq ${packages.join(' ')}`;
  execSync(cmd, { stdio: 'pipe', timeout: 120000 });
}

export function getLinuxQdrantUrl() {
  return 'https://github.com/qdrant/qdrant/releases/latest/download/qdrant-x86_64-unknown-linux-gnu.tar.gz';
}

export function getLinuxOllamaCmd() {
  return 'curl -fsSL https://ollama.com/install.sh | sh';
}

export function installLinuxYtdlp() {
  execSync('pip3 install yt-dlp 2>/dev/null || pip install yt-dlp', { stdio: 'pipe', timeout: 60000 });
}

export function installLinuxFfmpeg() {
  execSync('sudo apt-get install -y ffmpeg', { stdio: 'pipe', timeout: 60000 });
}

export function writeSystemdService(name, execStart, description) {
  const service = `[Unit]
Description=${description}
After=network.target

[Service]
Type=simple
ExecStart=${execStart}
Restart=always
User=${process.env.USER || 'root'}

[Install]
WantedBy=multi-user.target
`;
  execSync(`sudo tee /etc/systemd/system/${name}.service > /dev/null`, { stdio: 'pipe', input: service });
  execSync(`sudo systemctl daemon-reload && sudo systemctl enable ${name} && sudo systemctl start ${name}`, { stdio: 'pipe' });
}
