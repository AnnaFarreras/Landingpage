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
        // 🔁 Recurse into subfolders
        const subfiles = await getFilesRecursively(repo, item.path);
        results.push(...subfiles);
      } else if (item.name.endsWith('.html') || item.name.endsWith('.pdf')) {
        results.push({
          name: item.name.replace(/-/g, ' ').replace(/test /i, '').replace(/\.(html|pdf)$/i, ''),
          url: `https://${username}.github.io/${repo}/${item.path}`
        });
      }
    }

    return results;
  } catch (e) {
    console.error(`❌ Error accedint a ${repo}/${dir}: ${e.message}`);
    return [];
  }
}

async function main() {
  const repos = await getRepos();
  const output = [];

  for (const repo of repos) {
    const apps = await getFilesRecursively(repo.name);
    if (apps.length > 0) {
      output.push({
        name: repo.name,
        apps
      });
    }
  }

  fs.mkdirSync('data', { recursive: true });
  fs.writeFileSync('data/repos.json', JSON.stringify(output, null, 2));

  console.log(`✅ Fitxer repos.json creat amb ${output.length} repositoris.`);
}

main();
