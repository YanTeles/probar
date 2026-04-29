const fs = require('fs');
const path = require('path');

const root = path.resolve('.');
const dist = path.join(root, 'dist');

console.log('🛠️  Gerando dist/ para PHP Hostinger...');

if (fs.existsSync(dist)) {
  fs.rmSync(dist, { recursive: true, force: true });
}
fs.mkdirSync(dist, { recursive: true });

const files = [
  'index.html',
  'style.css',
  'script.js',
  'api.php',
  '.htaccess'
];

for (const file of files) {
  const src = path.join(root, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(dist, file));
    console.log(`✅ ${file}`);
  }
}

// Copiar assets
if (fs.existsSync('assets')) {
  fs.cpSync('assets', path.join(dist, 'assets'), { recursive: true });
  console.log('✅ assets/');
}

// Copiar README
fs.copyFileSync('README-PHP.md', path.join(dist, 'README-PHP.md'));
console.log('✅ README-PHP.md');

console.log('\n🎉 dist/ pronto para upload Hostinger!');
console.log('Execute: node build-dist-php.js');

