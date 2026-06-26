#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { execSync } from "child_process";
import { tmpdir } from "os";
import { mkdtempSync, readFileSync, rmSync } from "fs";
import { join } from "path";

const YT_DLP = "/usr/bin/yt-dlp";
const GROQ_API = "https://api.groq.com/openai/v1/audio/transcriptions";

function log(...args) {
  process.stderr.write("[transcribe-server] " + args.join(" ") + "\n");
}

function tmpDir() {
  return mkdtempSync(join(tmpdir(), "transcribe-"));
}

function cleanup(dir) {
  try { rmSync(dir, { recursive: true, force: true }); } catch {}
}

function srtToText(srt) {
  return srt
    .replace(/\d+\s*\n\d{2}:\d{2}:\d{2}[,\.]\d{3}\s*-->\s*\d{2}:\d{2}:\d{2}[,\.]\d{3}\s*/g, "\n")
    .replace(/<[^>]+>/g, "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .join(" ");
}

function tryGetSubs(url, dir, lang) {
  const langs = lang ? [lang, "en"] : ["en"];
  for (const l of langs) {
    try {
      execSync(
        `${YT_DLP} --write-subs --sub-langs ${l} --convert-subs srt --skip-download -o "%(id)s" -P ${dir} ${url}`,
        { timeout: 60000, stdio: "pipe" }
      );
    } catch { continue; }
    const result = execSync(`ls ${dir}/*.srt 2>/dev/null || true`, {
      timeout: 5000, stdio: "pipe", encoding: "utf-8",
    });
    const files = result.trim().split("\n").filter((f) => f.endsWith(".srt"));
    if (files.length > 0) return readFileSync(files[0], "utf-8");
  }
  return null;
}

function downloadAudio(url, dir) {
  const outtmpl = join(dir, "%(id)s.%(ext)s");
  execSync(`${YT_DLP} -x --audio-format mp3 -o "${outtmpl}" ${url}`, {
    timeout: 120000, stdio: "pipe",
  });
  const result = execSync(`ls ${dir}/*.mp3 2>/dev/null || true`, {
    timeout: 5000, stdio: "pipe", encoding: "utf-8",
  });
  const files = result.trim().split("\n").filter((f) => f.endsWith(".mp3"));
  if (files.length === 0) throw new Error("No audio file downloaded");
  return files[0];
}

async function transcribeWithGroq(audioPath, lang) {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY environment variable not set");
  const fs = await import("fs");
  const audioBuffer = fs.readFileSync(audioPath);
  const blob = new Blob([audioBuffer], { type: "audio/mpeg" });
  const formData = new FormData();
  formData.append("file", blob, "audio.mp3");
  formData.append("model", "whisper-large-v3-turbo");
  if (lang) formData.append("language", lang);
  const resp = await fetch(GROQ_API, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}` },
    body: formData,
  });
  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`Groq API error ${resp.status}: ${errText}`);
  }
  const data = await resp.json();
  return data.text;
}

const server = new Server(
  { name: "transcribe-server", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [{
    name: "transcribe_video",
    description: "Transcribe speech from any video URL (YouTube, Vimeo, TikTok, etc). Falls back to Groq Whisper API if no subtitles available.",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string", description: "Video URL" },
        language: { type: "string", description: "Language code (e.g. 'en', 'es'). Defaults to English." },
      },
      required: ["url"],
    },
  }],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { url, language } = request.params.arguments;
  if (!url || typeof url !== "string") {
    throw new Error("url is required and must be a string");
  }
  const dir = tmpDir();
  log(`Processing: ${url}`);
  try {
    const srtContent = tryGetSubs(url, dir, language);
    if (srtContent) {
      log("Got subtitles, extracting text");
      return { content: [{ type: "text", text: srtToText(srtContent) }] };
    }
    log("No subtitles, falling back to Groq Whisper");
    const audioPath = downloadAudio(url, dir);
    const text = await transcribeWithGroq(audioPath, language);
    return { content: [{ type: "text", text }] };
  } catch (err) {
    log(`Error: ${err.message}`);
    return {
      isError: true,
      content: [{ type: "text", text: `Transcription failed: ${err.message}` }],
    };
  } finally {
    cleanup(dir);
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  log("transcribe-server running on stdio");
}

main().catch((err) => {
  log(`Fatal: ${err.message}`);
  process.exit(1);
});
