import fs from 'fs';
import path from 'path';

const STATE_DIR = path.join(__dirname, '.tmp');
const STATE_FILE = path.join(STATE_DIR, 'run-state.json');

interface RunState {
  employerEmail?: string;
  employerPassword?: string;
  jobId?: string;
  jobTitle?: string;
  candidateEmail?: string;
  candidatePassword?: string;
  candidateName?: string;
}

export function readRunState(): RunState {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8')) as RunState;
  } catch {
    return {};
  }
}

export function writeRunState(patch: Partial<RunState>) {
  fs.mkdirSync(STATE_DIR, { recursive: true });
  const merged = { ...readRunState(), ...patch };
  fs.writeFileSync(STATE_FILE, JSON.stringify(merged, null, 2));
}
