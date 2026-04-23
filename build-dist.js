const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname);
const dist = path.join(root, 'dist');

function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function copyDirectory(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.rmSync(dest, { recursive: true, force: true });
  fs.mkdirSync(dest, { recursive: true });

  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else if (entry.isFile()) {
      copyFile(srcPath, destPath);
    }
  }
}

function buildDist() {
  if (fs.existsSync(dist)) {
    fs.rmSync(dist, { recursive: true, force: true });
  }
  fs.mkdirSync(dist, { recursive: true });

  const staticFiles = ['index.html', 'style.css', 'script.js', 'firebase-config.js'];
  for (const file of staticFiles) {
    const src = path.join(root, file);
    const dest = path.join(dist, file);
    if (fs.existsSync(src)) {
      copyFile(src, dest);
    }
  }

  copyDirectory(path.join(root, 'assets'), path.join(dist, 'assets'));

  const htaccess = path.join(root, '.htaccess');
  if (fs.existsSync(htaccess)) {
    copyFile(htaccess, path.join(dist, '.htaccess'));
  }

  console.log('Build complete: dist/ generated with static assets.');
}

buildDist();
