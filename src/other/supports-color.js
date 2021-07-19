const {env} = process;

const forceColor = readEnv('FORCE_COLOR');
const noColor = readEnv('NO_COLOR');

module.exports = (() => {
  if (noColor === true || forceColor === false) return false;
  if (!process.stdout.isTTY && forceColor === undefined) return false;
  if (env.TERM === 'dumb') return forceColor || false;
  return true;
})();

function readEnv(name) {
  if (!(name in env)) return;
  if (env[name].length === 0) return true;
  if (env[name] === 'true') return true;
  if (env[name] === 'false') return false;
  return Boolean(parseInt(env[name], 10));
}
