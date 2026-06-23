import { execSync } from 'child_process';

if (process.env.NODE_ENV === 'production') {
  process.exit(0);
}

const PORT = Number(process.env.PORT) || 3000;

function getPidsOnPort(port) {
  try {
    return execSync(`lsof -ti :${port}`, { encoding: 'utf8' })
      .trim()
      .split('\n')
      .filter(Boolean)
      .map(Number);
  } catch {
    return [];
  }
}

function getProcessCommand(pid) {
  try {
    return execSync(`ps -p ${pid} -o args=`, { encoding: 'utf8' }).trim();
  } catch {
    return '';
  }
}

const pids = getPidsOnPort(PORT);

for (const pid of pids) {
  const command = getProcessCommand(pid);
  if (command.includes('server/index.js')) {
    try {
      process.kill(pid, 'SIGTERM');
      console.log(`Stopped previous server (pid ${pid}) on port ${PORT}`);
    } catch {
      // Process may have already exited.
    }
  }
}
