aqui tinc això:
const fs = require('fs');

const path = require('path');

const axios = require('axios');

const username = 'AnnaFarreras';

const token = process.env.GH_TOKEN;

async function getRepos() {

const response = await axios.get(https://api.github.com/users/${username}/repos, {

headers: { Authorization: `token ${token}` }

});

return response.data;

}

async function getHTMLsFromRepo(repo) {

const res = await axios.get(https://api.github.com/repos/${username}/${repo}/contents, {

headers: { Authorization: `token ${token}` }

});

return res.data.filter(f => f.name.endsWith('.html')).map(f => ({

name: f.name,

url: `https://${username}.github.io/${repo}/${f.name}`

}));

}

async function main() {

const repos = await getRepos();

const output = [];

for (const repo of repos) {

try {

  const htmls = await getHTMLsFromRepo(repo.name);

  if (htmls.length > 0) {

    output.push({ name: repo.name, apps: htmls });

  }

} catch (e) {

  console.error("Error with repo:", repo.name, e.message);

}

}

fs.mkdirSync("data", { recursive: true });

fs.writeFileSync("data/repos.json", JSON.stringify(output, null, 2));

}

main();

