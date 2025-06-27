const fs = require('fs');
const path = require('path');

// Funció per buscar fitxers recursivament
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
  const files = findFiles('./', exts);

  // Grup per repositori (carpeta principal)
  const repos = {};

  for (const file of files) {
    const relativePath = file.replace(/^\.\//, ''); // sense ./ inicial
    const parts = relativePath.split(path.sep);

    const repoName = parts[0] === 'index.html' || parts.length === 1 ? 'Landingpage' : parts[0];
    const fileName = path.basename(file);
    const appName = fileName.replace(/-/g, ' ').replace(/test /i, '');

    const url = `https://annafarreras.github.io/${repoName}/${parts.slice(1).join('/')}`;

    if (!repos[repoName]) repos[repoName] = [];

    repos[repoName].push({ name: appName, url });
  }

  // Formata en el format esperat
  const output = Object.keys(repos).map(repo => ({
    name: repo,
    apps: repos[repo]
  }));

  fs.mkdirSync('data', { recursive: true });
  fs.writeFileSync('data/repos.json', JSON.stringify(output, null, 2));

  console.log(`✔️ Generats ${files.length} fitxers (html i pdf) a data/repos.json`);
}

main();
