// Optional deployment-input check; install `ignore` in a separate QA tools directory.
// Set IGNORE_MODULE to its module path. This performs no Vercel operation.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ignore = require(process.env.IGNORE_MODULE || 'ignore');
const root = path.resolve(__dirname, '..');
const report = {};
for (const name of ['.', 'elementary-site']) {
  const dir = path.join(root, name);
  const rules = ignore().add(fs.readFileSync(path.join(dir, '.vercelignore'), 'utf8'));
  const files = fs.readdirSync(dir, { recursive: true })
    .map(file => file.replaceAll('\\', '/'))
    .filter(file => !file.startsWith('.git/') && fs.statSync(path.join(dir, file)).isFile());
  const included = files.filter(file => !rules.ignores(file)).sort();
  report[name] = included;
  const required = name === '.' ? [
    'index.html', 'secondary.html', 'elementary.html', 'llms.txt', 'sitemap.xml', 'robots.txt',
    'schools/pungyang-middle/index.html', 'exams/pungyang-middle/2026-g3-s1-final/index.html',
    'data/exams/pungyang-middle/2026-g3-s1-final.json', 'data/schemas/public-exam.schema.json',
    ...fs.readdirSync(path.join(dir, 'assets')).map(file => `assets/${file}`),
  ] : ['index.html', 'robots.txt', 'sitemap.xml', 'llms.txt', 'vercel.json', 'assets/site.css', 'assets/elementary.css', 'assets/site.js', 'assets/exit-offer.js', 'assets/ddak-logo-name.png'];
  required.forEach(file => assert.ok(included.includes(file), `${name}: required ${file} excluded`));
  if (name === '.') {
    assert.ok(!included.some(file => file.startsWith('elementary-site/')));
    assert.ok(!included.some(file => /^(\.seo|docs|tests|work|\.vercel)\//.test(file)));
  } else {
    assert.ok(!included.includes('seo-config.json'));
    assert.ok(!included.includes('sitemap.xml.template'));
  }
  console.log(`PASS: ${name}: ${included.length} included files; required files retained and other root/config excluded`);
}
fs.writeFileSync(path.resolve(root, process.env.DEPLOYMENT_REPORT_PATH || '.seo/reports/site-split-deployment-files.json'), JSON.stringify(report, null, 2) + '\n');
