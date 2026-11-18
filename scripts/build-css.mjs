import { watch } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { compile, optimize } from '@tailwindcss/node';
import { Scanner } from '@tailwindcss/oxide';

const root = fileURLToPath(new URL('../', import.meta.url));
const input = resolve(root, 'src/input.css');
const output = resolve(root, 'dist/styles.css');
const watchMode = process.argv.includes('--watch');

async function build() {
  const compiler = await compile(await readFile(input, 'utf8'), {
    base: dirname(input),
    from: input,
    onDependency() {},
  });
  const sources = compiler.root === 'none'
    ? compiler.sources
    : [{ base: root, pattern: '**/*', negated: false, ...compiler.root }, ...compiler.sources];
  const css = compiler.build(new Scanner({ sources }).scan());
  const result = watchMode ? css : optimize(css, { file: input, minify: true }).code;
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, result);
  console.log('Built dist/styles.css');
}

if (watchMode) {
  let pending;
  let queue = build().catch(error => console.error(error));
  function scheduleBuild() {
    clearTimeout(pending);
    pending = setTimeout(() => {
      queue = queue.then(build).catch(error => console.error(error));
    }, 75);
  }

  watch(root, (_event, filename) => {
    if (!filename || /\.(html|js)$/.test(filename)) scheduleBuild();
  });
  watch(dirname(input), { recursive: true }, scheduleBuild);
} else {
  await build();
}
