const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { ensureSqliteDirectory, resolveSqlitePath } = require('../scripts/start');

test('resolveSqlitePath 可以解析相对 sqlite 路径并忽略查询参数', () => {
  const actual = resolveSqlitePath('file:./data/db.sqlite?connection_limit=1');
  const expected = path.resolve(process.cwd(), 'data', 'db.sqlite');

  assert.equal(actual, expected);
});

test('resolveSqlitePath 对非 sqlite 数据库返回 null', () => {
  assert.equal(resolveSqlitePath('postgresql://localhost:5432/simplehub'), null);
});

test('ensureSqliteDirectory 会创建数据库父目录', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'simplehub-start-'));
  const sqliteDir = path.join(tempDir, 'nested', 'sqlite');
  const sqlitePath = path.join(sqliteDir, 'db.sqlite');

  try {
    const actual = ensureSqliteDirectory(`file:${sqlitePath}`);

    assert.equal(actual, sqlitePath);
    assert.ok(fs.existsSync(sqliteDir));
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});
