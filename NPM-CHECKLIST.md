# NPM Publishing Checklist

## ✅ Package Configuration Complete

Your package is ready to publish! Here's what has been configured:

### Package.json Updates
- ✅ **files** field added - Only includes `dist/`, `README.md`, `LICENSE`, `AUTHENTICATION.md`
- ✅ **prepublishOnly** script - Automatically builds before publishing
- ✅ **keywords** expanded - Better discoverability on npm
- ✅ **repository** field - Links to GitHub repo (update with your actual URL)
- ✅ **author** field - Update with your name and email
- ✅ **bin** field - Allows `npx @markstiles/mcp-search-server` to work

### Files Created
- ✅ `.npmignore` - Excludes test files, source files, and development artifacts
- ✅ `PUBLISHING.md` - Complete publishing guide
- ✅ `README.md` updated - Installation instructions for npm users

## 📋 Before Publishing

### 1. Update Author Information

Edit `package.json`:
```json
"author": "Your Name <your.email@example.com>"
```

### 2. Update Repository URLs

Edit `package.json` (replace with your actual GitHub username/org):
```json
"repository": {
  "type": "git",
  "url": "https://github.com/yourusername/mcp-sitecore-search-server.git"
},
"bugs": {
  "url": "https://github.com/yourusername/mcp-sitecore-search-server/issues"
},
"homepage": "https://github.com/yourusername/mcp-sitecore-search-server#readme"
```

### 3. Package Name

The package is configured as: `@markstiles/mcp-search-server`

This uses your npm username as the scope, which you automatically own.

## 🚀 Publishing Steps

### First Time Setup

1. **Create npm account** (if you don't have one):
   - Visit https://www.npmjs.com/signup

2. **Login to npm**:
   ```bash
   npm login
   ```

### Publish the Package

1. **Ensure code is committed**:
   ```bash
   git add .
   git commit -m "Prepare for npm publish"
   ```

2. **Build the package**:
   ```bash
   npm run build
   ```

3. **Test the package locally** (optional but recommended):
   ```bash
   npm pack
   # This creates: sitecore-mcp-search-server-1.0.0.tgz
   # Test it in another project
   ```

4. **Publish to npm**:
   ```bash
   # For scoped packages (first time)
   npm publish --access public
   
   # For subsequent publishes
   npm publish
   ```

## 📦 After Publishing

### Verify Publication

Visit your package on npm:
```
https://www.npmjs.com/package/@markstiles/mcp-search-server
```

### Test Installation

```bash
# Test global installation
npm install -g @markstiles/mcp-search-server

# Test npx usage
npx @markstiles/mcp-search-server --help
```

### Update Documentation

If you created a GitHub repo, update it with:
- Push your code
- Add topics/tags for discoverability
- Create releases for versions

## 🔄 Updating the Package

When you make changes and want to publish a new version:

```bash
# Update version (choose one)
npm version patch   # 1.0.0 -> 1.0.1 (bug fixes)
npm version minor   # 1.0.0 -> 1.1.0 (new features)
npm version major   # 1.0.0 -> 2.0.0 (breaking changes)

# Build
npm run build

# Publish
npm publish
```

## 📝 Usage After Publishing

Users can then install and use your package:

### Installation
```bash
# Install globally
npm install -g @markstiles/mcp-search-server

# Or use with npx (no installation)
npx @markstiles/mcp-search-server
```

### MCP Client Configuration

In Claude Desktop config (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "sitecore-search": {
      "command": "npx",
      "args": ["-y", "@markstiles/mcp-search-server"],
      "env": {
        "SITECORE_DOMAIN_ID": "your-domain-id",
        "SITECORE_CLIENT_KEY": "your-client-key",
        "SITECORE_API_KEY": "your-api-key"
      }
    }
  }
}
```

## ⚠️ Important Notes

1. **Package Name Availability**: Make sure your chosen package name is available on npm
2. **Scoped Packages**: Scoped packages like `@yourname/package` are free on npm
3. **Version Numbers**: Once published, you cannot unpublish after 72 hours
4. **Secrets**: Double-check that no API keys are in the published files
5. **License**: MIT license is already set in package.json

## 🎯 Quick Command Reference

```bash
# Check what will be published
npm pack --dry-run

# View package contents
tar -tzf sitecore-mcp-search-server-1.0.0.tgz

# Login to npm
npm login

# Publish (first time, scoped)
npm publish --access public

# Publish (subsequent)
npm publish

# View package info
npm view @markstiles/mcp-search-server

# Unpublish a version (within 72 hours)
npm unpublish @markstiles/mcp-search-server@1.0.0
```

## ✨ You're Ready!

Your package is fully configured and ready to publish. Just update the author/repository information and run `npm publish`!
