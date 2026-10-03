import { execFileSync } from 'node:child_process';
it.each([
  ['', 'false', true], ['production', 'false', true], ['production', '', true],
  ['development', '', true], ['development', 'false', false], ['test', 'false', false],
])('auth enforcement NODE_ENV=%s CHECK_SIGNATURES=%s is %s', (mode, flag, expected) => {
  const result = execFileSync(process.execPath, ['--input-type=module', '-e', "import {CHECK_SIGNATURES} from './config.js'; console.log(CHECK_SIGNATURES)"], {
    cwd: new URL('..', import.meta.url), env: { ...process.env, NODE_ENV: mode, CHECK_SIGNATURES: flag }, encoding: 'utf8',
  });
  expect(result.trim()).toBe(String(expected));
});
