#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const transform = require('../lib/transformer');

const projectRoot = process.cwd();

async function run() {
  console.log('🛡️  Vite-Shield: Securing your project...');

  // --- 1. Update vite.config (AST Transformation) ---
  const configPath = ['vite.config.ts', 'vite.config.js']
    .map(f => path.join(projectRoot, f))
    .find(p => fs.existsSync(p));

  if (configPath) {
    try {
      const content = fs.readFileSync(configPath, 'utf8');
      const updated = transform(content);
      fs.writeFileSync(configPath, updated);
      console.log('✅ Updated Vite Configuration.');
    } catch (err) {
      console.error('❌ Error updating Vite config:', err.message);
    }
  }

  // --- 2. Create Production Node.js Server (Express + Helmet) ---
  const serverPath = path.join(projectRoot, 'server.js');
  const serverTemplate = `
const express = require('express');
const path = require('path');
const helmet = require('helmet');

const app = express();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "https:"],
      imgSrc: ["'self'", "data:"],
      frameAncestors: ["'none'"] // Matching your Nginx "DENY" policy
    }
  },
  frameguard: { action: 'deny' } // Explicitly set X-Frame-Options to DENY
}));

app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log('🚀 Secure Node server: http://localhost:' + PORT));
  `;
  
  fs.writeFileSync(serverPath, serverTemplate);
  console.log('✅ Created production server.js.');

  // --- 3. Create Nginx Configuration (Matching your requirement) ---
  const nginxPath = path.join(projectRoot, 'nginx.conf');
  const nginxTemplate = `
server {
    listen 8080;
    server_name _;

    root /home/site/wwwroot;
    index index.html;

    # ✅ Security headers
    add_header X-Frame-Options "DENY" always;
    add_header Content-Security-Policy "default-src 'self'; frame-ancestors 'none';" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "0; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header Referrer-Policy "no-referrer" always;

    location / {
        try_files $uri /index.html;
    }
}
  `;
  fs.writeFileSync(nginxPath, nginxTemplate);
  console.log('✅ Created secure nginx.conf.');

  // --- 4. Update package.json scripts ---
  const pkgPath = path.join(projectRoot, 'package.json');
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    pkg.scripts['serve:prod'] = 'node server.js';
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
    console.log('✅ Added "serve:prod" script to package.json.');
  }
}

run().catch(console.error);