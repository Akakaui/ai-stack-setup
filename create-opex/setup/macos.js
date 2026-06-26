import { execSync } from 'child_process';

export async function installMacPackages(packages) {
  // Prefer Homebrew
  try {
    execSync('brew --version', { stdio: 'pipe' });
    execSync(`brew install ${packages.join(' ')}`, { stdio: 'pipe', timeout: 300000 });
  } catch {
    console.log('  ! Homebrew not found. Install from https://brew.sh or install manually.');
  }
}

export function getMacQdrantUrl() {
  return 'https://github.com/qdrant/qdrant/releases/latest/download/qdrant-x86_64-apple-darwin.tar.gz';
}

export function installMacYtdlp() {
  try {
    execSync('brew install yt-dlp 2>/dev/null', { stdio: 'pipe', timeout: 120000 });
  } catch {
    // fallback to curl
    execSync('curl -sL https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && chmod +x /usr/local/bin/yt-dlp', { stdio: 'pipe', timeout: 30000 });
  }
}

export function installMacFfmpeg() {
  try {
    execSync('brew install ffmpeg', { stdio: 'pipe', timeout: 300000 });
  } catch {
    console.log('  ! Failed to install ffmpeg via brew. Install manually: brew install ffmpeg');
  }
}
