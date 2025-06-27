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
        const filePath = item.path;
        const folder = path.dirname(filePath);
        const section = folder === '.' ? repo : `${repo} / ${folder}`;
        results.push({
          section,
          name: item.name.replace(/-/g, ' ').replace(/test /i, '').replace(/\.(html|pdf)$/i, ''),
          url: `https://${username}.github.io/${repo}/${encodeURI(filePath)}`
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
  const allResults = [];

  for (const repo of repos) {
    const files = await getFilesRecursively(repo.name);
    allResults.push(...files);
  }

  // Agrupar per secció
  const grouped = {};
  for (const file of allResults) {
    if (!grouped[file.section]) grouped[file.section] = [];
    grouped[file.section].push({ name: file.name, url: file.url });
  }

  const output = Object.entries(grouped).map(([section, apps]) => ({
    name: section,
    apps
  }));

  fs.mkdirSync('data', { recursive: true });
  fs.writeFileSync('data/repos.json', JSON.stringify(output, null, 2));
  console.log(`✅ Creat repos.json amb ${output.length} seccions`);
}

main();
