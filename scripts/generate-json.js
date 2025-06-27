const fs = require('fs');
const path = require('path');
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
  const apiUrl = `https://api.github.com/repos/${username}/${repo}/contents/${dir}`;
  try {
    const res = await axios.get(apiUrl, {
      headers: { Authorization: `token ${token}` }
    });

    const results = [];

    for (const item of res.data) {
      if (item.type === 'dir') {
        const subfiles = await getFilesRecursively(repo, item.path);
        results.push(...subfiles);
      } else if (item.name.endsWith('.html') || item.name.endsWith('.pdf')) {
        results.push({
          path: item.path,
          name: item.name.replace(/\.(html|pdf)$/i, '').replace(/-/g, ' '),
          url: `https://${username}.github.io/${repo}/${encodeURI(item.path)}`
        });
      }
    }

    return results;
  } catch (e) {
    console.error(`❌ Error accedint a ${repo}/${dir}: ${e.message}`);
    return [];
  }
}

function groupByRepoAndFolder(filesByRepo) {
  const grouped = [];

  for (const [repo, files] of Object.entries(filesByRepo)) {
    const folders = {};

    for (const file of files) {
      const parts = file.path.split('/');
      const folder = parts.length > 1 ? parts[0] : 'Arrel';

      if (!folders[folder]) folders[folder] = [];
      folders[folder].push({ name: file.name, url: file.url });
    }

    const folderArray = Object.entries(folders).map(([folderName, files]) => ({
      name: folderName,
      files
    }));

    grouped.push({
      name: repo,
      folders: folderArray
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
  console.log(`✅ repos.json creat amb estructura jeràrquica`);
}

main();
