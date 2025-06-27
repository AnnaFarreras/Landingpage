const fs = require('fs');
const axios = require('axios');

const username = 'AnnaFarreras';
const token = process.env.GH_TOKEN;

async function getRepos() {
  const response = await axios.get(`https://api.github.com/users/${username}/repos`, {
    headers: { Authorization: `token ${token}` }
  });
  return response.data;
}

async function getFilesRecursively(repo, dir = '') {
  const url = `https://api.github.com/repos/${username}/${repo}/contents/${dir}`;
  const res = await axios.get(url, {
    headers: { Authorization: `token ${token}` }
  });

  const files = [];

  for (const item of res.data) {
    if (item.type === 'dir') {
      const subfiles = await getFilesRecursively(repo, item.path);
      files.push(...subfiles);
    } else if (item.name.endsWith('.html') || item.name.endsWith('.pdf')) {
      files.push({
        path: item.path,
        name: item.name.replace(/\.(html|pdf)$/i, '').replace(/-/g, ' '),
        url: `https://${username}.github.io/${repo}/${encodeURI(item.path)}`
      });
    }
  }

  return files;
}

function groupByRepoAndFolder(filesByRepo) {
  const grouped = [];

  for (const [repo, files] of Object.entries(filesByRepo)) {
    const folders = [];
    const rootFiles = [];

    for (const file of files) {
      const parts = file.path.split('/');
      if (parts.length === 1) {
        rootFiles.push({ name: file.name, url: file.url });
      } else {
        const folder = parts[0];
        let folderObj = folders.find(f => f.name === folder);
        if (!folderObj) {
          folderObj = { name: folder, files: [] };
          folders.push(folderObj);
        }
        folderObj.files.push({ name: file.name, url: file.url });
      }
    }

    grouped.push({
      name: repo,
      folders,
      files: rootFiles
    });
  }

  return grouped;
}

async function main() {
  const repos = await getRepos();
  const filesByRepo = {};

  for (const repo of repos) {
    const files = await getFilesRecursively(repo.name);
    if (files.length > 0) {
      filesByRepo[repo.name] = files;
    }
  }

  const output = groupByRepoAndFolder(filesByRepo);

  fs.mkdirSync('data', { recursive: true });
  fs.writeFileSync('data/repos.json', JSON.stringify(output, null, 2));
  console.log('✅ repos.json creat correctament');
}

main();
