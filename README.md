# Vite-Shield 🛡️

**One-click security headers for Vite/React applications**

Automatically configure comprehensive security headers for your Vite-based React applications with a single command. Vite-Shield integrates security headers seamlessly into your development and production environments.

## Features

- ✅ **Zero Configuration**: Works out of the box with any Vite/React project
- ✅ **Complete Security Headers**: Implements all essential security headers
- ✅ **Multi-Environment Support**: Configures headers for dev, preview, and production
- ✅ **Production-Ready**: Generates Express.js server and Nginx configuration
- ✅ **AST-Based**: Safely modifies `vite.config.ts/js` using AST transformations
- ✅ **Non-Destructive**: Only adds headers, doesn't modify existing configuration

## Quick Start

### Installation

**Global installation** (recommended for CLI usage):
```bash
npm install -g vite-shield
```

**Local installation** (for project-specific usage):
```bash
npm install --save-dev vite-shield
```

**Use with npx** (no installation required):
```bash
npx vite-shield
```

After installation, the `vite-shield` command will be available globally (if installed globally) or via `npx vite-shield`.

### Usage

Navigate to your Vite/React project directory and run:

```bash
vite-shield
```

That's it! Vite-Shield will:

1. ✅ Update your `vite.config.ts` or `vite.config.js` with security headers for dev and preview servers
2. ✅ Create a production-ready `server.js` with Express.js and security headers
3. ✅ Create an `nginx.conf` template with security headers
4. ✅ Update your `package.json` with production server script and dependencies

## What Gets Configured

### Security Headers Applied

Vite-Shield configures the following security headers:

| Header | Value | Purpose |
|--------|-------|---------|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` | Forces HTTPS connections |
| `X-Frame-Options` | `SAMEORIGIN` | Prevents clickjacking attacks |
| `Content-Security-Policy` | Comprehensive CSP policy | Controls resource loading and prevents XSS |
| `X-Content-Type-Options` | `nosniff` | Prevents MIME-type sniffing |
| `Referrer-Policy` | `no-referrer` | Controls referrer information |
| `X-DNS-Prefetch-Control` | `off` | Disables DNS prefetching |
| `X-Download-Options` | `noopen` | Prevents file execution in IE |
| `X-Permitted-Cross-Domain-Policies` | `none` | Restricts cross-domain policies |
| `X-XSS-Protection` | `0` | Disables legacy XSS filter |

### Files Created/Modified

#### 1. `vite.config.ts` / `vite.config.js`

Adds security headers to both `server` and `preview` configurations:

```typescript
export default defineConfig({
  server: {
    headers: {
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
      'X-Frame-Options': 'SAMEORIGIN',
      // ... all other headers
    },
  },
  preview: {
    headers: {
      // ... same headers for preview server
    },
  },
});
```

#### 2. `server.js` (Created)

Production-ready Express.js server with security headers:

```javascript
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

// Security headers middleware
app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  // ... all security headers
  next();
});

// Serve static files and handle SPA routing
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(process.env.PORT || 8080);
```

#### 3. `nginx.conf` (Created)

Nginx configuration template with security headers:

```nginx
server {
    listen 8080;
    server_name _;
    root /home/site/wwwroot;
    index index.html;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    # ... all other headers

    location / {
        try_files $uri /index.html;
    }
}
```

#### 4. `package.json` (Updated)

Adds production server script and ensures dependencies:

```json
{
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.21.2"
  },
  "type": "module"
}
```

## How It Works

### AST-Based Configuration

Vite-Shield uses [jscodeshift](https://github.com/facebook/jscodeshift) to safely parse and modify your `vite.config.ts` or `vite.config.js` file. This ensures:

- ✅ No syntax errors introduced
- ✅ Preserves existing configuration
- ✅ Handles TypeScript and JavaScript
- ✅ Only adds headers, doesn't overwrite existing settings

### Transformation Process

1. **Parse Configuration**: Reads your `vite.config.ts` or `vite.config.js`
2. **Find Config Object**: Locates the `defineConfig` call
3. **Add Headers**: Safely adds headers to `server` and `preview` sections
4. **Generate Code**: Outputs updated configuration with proper formatting

### Production Server Generation

The generated `server.js`:

- Uses ES modules (modern JavaScript)
- Includes all security headers as middleware
- Serves static files from `dist/` directory
- Handles SPA routing (React Router, Vue Router, etc.)
- Ready for deployment on any Node.js hosting platform

## Customization

### Updating Content Security Policy

After running `vite-shield`, you may need to customize the Content Security Policy (CSP) based on your application's needs:

#### Common Customizations

**Add API Endpoints**:
```javascript
// In server.js, update the CSP connect-src directive
connect-src 'self' https://api.example.com https://*.blob.core.windows.net wss://ws.example.com
```

**Add External Image Sources**:
```javascript
// Update img-src directive
img-src 'self' data: blob: https://*.googleusercontent.com https://cdn.example.com
```

**Add Font Sources**:
```javascript
// Update font-src directive
font-src 'self' data: https://fonts.gstatic.com https://cdnjs.cloudflare.com
```

### Environment-Specific Configuration

For different CSP policies in development vs production, modify `server.js`:

```javascript
const isDevelopment = process.env.NODE_ENV === 'development';

const csp = isDevelopment
  ? "default-src 'self' http://localhost:3000; script-src 'self' 'unsafe-inline' 'unsafe-eval'; ..."
  : "default-src 'self'; script-src 'self' 'unsafe-inline'; ...";

res.setHeader('Content-Security-Policy', csp);
```

## Testing

### Verify Headers in Development

```bash
# Start your dev server
npm run dev

# In another terminal, check headers
curl -I http://localhost:5173
```

### Verify Headers in Production

```bash
# Build your app
npm run build

# Start production server
npm start

# Check headers
curl -I http://localhost:8080
```

### Expected Headers

You should see all security headers in the response:

```
HTTP/1.1 200 OK
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Frame-Options: SAMEORIGIN
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; ...
X-Content-Type-Options: nosniff
Referrer-Policy: no-referrer
X-DNS-Prefetch-Control: off
X-Download-Options: noopen
X-Permitted-Cross-Domain-Policies: none
X-XSS-Protection: 0
```

## Deployment

Vite-Shield generates production-ready configurations for various deployment platforms:

### Node.js Hosting (Express Server)

1. Build your application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

3. Or use PM2 for process management:
   ```bash
   pm2 start server.js --name my-app
   ```

### Nginx

1. Copy `nginx.conf` to your server
2. Update paths and server_name as needed
3. Reload Nginx:
   ```bash
   sudo nginx -t
   sudo nginx -s reload
   ```

### Azure App Service

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed Azure deployment instructions.

### Other Platforms

- **Vercel**: Use the generated `server.js` as a serverless function
- **Netlify**: Configure headers in `netlify.toml` (use nginx.conf as reference)
- **Docker**: Use `server.js` in your Dockerfile
- **AWS Elastic Beanstalk**: Use `nginx.conf` or `server.js`

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## Troubleshooting

### CSP Violations

If you see CSP violations in the browser console:

1. **Check the violation**: The console will show which resource was blocked
2. **Update CSP**: Modify the CSP in `server.js` or `vite.config.ts`
3. **Common fixes**:
   - Add domain to `connect-src` for API calls
   - Add domain to `img-src` for external images
   - Add `'unsafe-inline'` to `style-src` if needed (less secure)

### Headers Not Appearing

1. **Check server is running**: Ensure your server is actually running
2. **Check middleware order**: Security headers middleware should be before routes
3. **Check browser cache**: Clear cache or use incognito mode
4. **Verify configuration**: Check that headers are set in the correct file

### Server Won't Start

1. **Check Node.js version**: Requires Node.js 14+ for ES modules
2. **Check dependencies**: Ensure `express` is installed
3. **Check file paths**: Verify `dist/` directory exists after build
4. **Check port**: Ensure port 8080 (or your PORT env var) is available

## Content Security Policy (CSP) Guide

### Understanding CSP Directives

| Directive | Controls | Example |
|-----------|----------|---------|
| `default-src` | Fallback for other directives | `'self'` |
| `script-src` | JavaScript sources | `'self' 'unsafe-inline'` |
| `style-src` | CSS sources | `'self' 'unsafe-inline' https://fonts.googleapis.com` |
| `img-src` | Image sources | `'self' data: blob: https://*.example.com` |
| `font-src` | Font sources | `'self' data: https://fonts.gstatic.com` |
| `connect-src` | API/fetch/WebSocket | `'self' https://api.example.com wss://ws.example.com` |
| `frame-src` | iframe sources | `'self' blob:` |
| `media-src` | Video/audio sources | `'self' blob: https://*.example.com` |
| `frame-ancestors` | Who can embed your page | `'self'` |

### Common CSP Patterns

**React/Vue Applications**:
```javascript
script-src 'self' 'unsafe-inline'
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com
```

**File Upload/Preview Applications**:
```javascript
img-src 'self' data: blob: https://*.blob.core.windows.net
frame-src 'self' blob:
media-src 'self' blob: https://*.blob.core.windows.net
```

**API-Heavy Applications**:
```javascript
connect-src 'self' https://api.example.com https://*.blob.core.windows.net wss://ws.example.com
```

## Best Practices

1. **Start Restrictive**: Begin with a restrictive CSP and relax incrementally
2. **Test Thoroughly**: Test in staging before production
3. **Monitor Violations**: Use browser console to identify CSP violations
4. **Document Changes**: Keep track of why each domain is allowed
5. **Regular Updates**: Review and update CSP as your app evolves
6. **Use Nonces**: Consider using nonces instead of `'unsafe-inline'` for better security

## Security Headers Explained

### Strict-Transport-Security (HSTS)

Forces browsers to use HTTPS only. Once set, browsers will remember to use HTTPS for the specified duration.

**Value**: `max-age=31536000; includeSubDomains; preload`
- `max-age`: Duration in seconds (1 year)
- `includeSubDomains`: Applies to all subdomains
- `preload`: Allows inclusion in browser HSTS preload lists

### X-Frame-Options

Prevents clickjacking by controlling iframe embedding.

**Value**: `SAMEORIGIN`
- Allows framing only from the same origin
- Alternative: `DENY` (never allow framing)

### Content-Security-Policy

Controls which resources can be loaded and executed, preventing XSS attacks.

**Default Policy**: Restrictive policy allowing only same-origin resources with necessary exceptions for common web app needs.

### X-Content-Type-Options

Prevents MIME-type sniffing attacks.

**Value**: `nosniff`
- Forces browsers to respect declared content types

### Referrer-Policy

Controls how much referrer information is sent with requests.

**Value**: `no-referrer`
- Never sends referrer information
- Alternative: `strict-origin-when-cross-origin` for more permissive policy

## Examples

### Basic React App

```bash
# Create new Vite React app
npm create vite@latest my-app -- --template react
cd my-app

# Install dependencies
npm install

# Run vite-shield
npx vite-shield

# Start dev server (headers already configured)
npm run dev
```

### Vue App

```bash
# Create new Vite Vue app
npm create vite@latest my-app -- --template vue
cd my-app

# Install dependencies
npm install

# Run vite-shield
npx vite-shield

# Build and serve
npm run build
npm start
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see [LICENSE](./LICENSE) file for details.

## Support

- **Issues**: [GitHub Issues](https://github.com/Power70/vite-shield/issues)
- **Documentation**: See [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment guides
- **Security Headers Guide**: Comprehensive guide included in deployment documentation

## Related Projects

- [Helmet.js](https://helmetjs.github.io/) - Security middleware for Express
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/) - CSP policy validator
- [Security Headers](https://securityheaders.com/) - Security headers checker

---

**Made with ❤️ for secure web applications**
