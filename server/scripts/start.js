const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: 'inherit', shell: process.platform === 'win32' });
    p.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}`))));
  });
}

function resolveSqlitePath(databaseUrl) {
  if (typeof databaseUrl !== 'string' || !databaseUrl.startsWith('file:')) {
    return null;
  }

  const rawPath = databaseUrl.slice(5).split('?')[0].split('#')[0];
  if (!rawPath) {
    return null;
  }

  return path.isAbsolute(rawPath) ? rawPath : path.resolve(process.cwd(), rawPath);
}

function ensureSqliteDirectory(databaseUrl) {
  const sqlitePath = resolveSqlitePath(databaseUrl);
  if (!sqlitePath) {
    return null;
  }

  fs.mkdirSync(path.dirname(sqlitePath), { recursive: true });
  return sqlitePath;
}

async function main() {
  const { CONFIG } = require('../src/config');
  const { startServer } = require('../src/server');

  ensureSqliteDirectory(CONFIG.DATABASE_URL);

  try {
    await run('npx', ['prisma', 'db', 'push']);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Prisma db push failed:', e.message);
  }

  await startServer();
}

if (require.main === module) {
  main();
}

module.exports = {
  ensureSqliteDirectory,
  main,
  resolveSqlitePath,
  run
};
