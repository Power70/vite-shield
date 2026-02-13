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

  // --- 2. Create Production Node.js Server (Express + Security Headers) ---
  const serverPath = path.join(projectRoot, 'server.js');
  const serverTemplate = `import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 8080;

// Security headers middleware
app.use((req, res, next) => {
  // Strict-Transport-Security: Force HTTPS
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  
  // X-Frame-Options: Prevent clickjacking attacks
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  
  // Content Security Policy: Control resource loading
  // TODO: Update API endpoints and domains in connect-src based on your application needs
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https: https://fonts.googleapis.com; img-src 'self' data: blob: https://*.googleusercontent.com https://*.blob.core.windows.net; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://*.blob.core.windows.net wss:; frame-src 'self' blob:; media-src 'self' blob: https://*.blob.core.windows.net; frame-ancestors 'self'");
  
  // Additional security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  res.setHeader('X-Download-Options', 'noopen');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  res.setHeader('X-XSS-Protection', '0');
  
  next();
});

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle React Router (SPA routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(\`🚀 Secure Node server running on port \${port}\`);
});
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
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https: https://fonts.googleapis.com; img-src 'self' data: blob: https://*.googleusercontent.com https://*.blob.core.windows.net; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://*.blob.core.windows.net wss:; frame-src 'self' blob:; media-src 'self' blob: https://*.blob.core.windows.net; frame-ancestors 'self'" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer" always;
    add_header X-DNS-Prefetch-Control "off" always;
    add_header X-Download-Options "noopen" always;
    add_header X-Permitted-Cross-Domain-Policies "none" always;
    add_header X-XSS-Protection "0" always;

    location / {
        try_files $uri /index.html;
    }
}
  `;
  fs.writeFileSync(nginxPath, nginxTemplate);
  console.log('✅ Created secure nginx.conf.');

  // --- 4. Update package.json scripts and dependencies ---
  const pkgPath = path.join(projectRoot, 'package.json');
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    
    // Add start script (or update if exists)
    if (!pkg.scripts) pkg.scripts = {};
    pkg.scripts['start'] = 'node server.js';
    
    // Ensure express is in dependencies
    if (!pkg.dependencies) pkg.dependencies = {};
    if (!pkg.dependencies.express) {
      pkg.dependencies.express = '^4.21.2';
    }
    
    // Ensure type is set to module for ES modules support
    if (!pkg.type) {
      pkg.type = 'module';
    }
    
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
    console.log('✅ Updated package.json with start script and dependencies.');
  }
}

run().catch(console.error);