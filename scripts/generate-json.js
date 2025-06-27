const fs = require('fs');
const path = require('path');

function findFiles(dir, extensions, files = []) {
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      findFiles(fullPath, extensions, files);
    } else {
      const ext = path.extname(item).toLowerCase();
      if (extensions.includes(ext)) {
        files.push(fullPath);
      }
    }
  }
  return files;
}

function main() {
  const exts = ['.html', '.pdf'];

  const allFiles = findFiles('./', exts);

  const output = allFiles.map(f => {
    const ext = path.extname(f);
    const name = path.basename(f, ext)
      .replace(/-/g, ' ')
      .replace(/test /i, '');

    return {
      name,
      ruta: f.replace(/^\.\//, '')
    };
  });

  fs.mkdirSync('data', { recursive: true });
  fs.writeFileSync('data/repos.json', JSON.stringify(output, null, 2));

  console.log(`Generats ${output.length} fitxers (html i pdf) a data/repos.json`);
}

main();

