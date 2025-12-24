# Publishing to NPM

This guide explains how to publish the Sitecore Search MCP Server to npm.

## Pre-Publishing Checklist

Before publishing, ensure:

1. **Version is updated** in `package.json`
2. **Build is successful**: `npm run build`
3. **Tests pass** (if applicable)
4. **README is up to date** with installation and usage instructions
5. **License file exists** (MIT)
6. **Author information** is set in `package.json`
7. **Repository URL** is set in `package.json`

## First-Time Setup

### 1. Create an npm Account

If you don't have an npm account:
```bash
# Visit https://www.npmjs.com/signup to create an account
```

### 2. Login to npm

```bash
npm login
```

Enter your npm username, password, and email when prompted.

### 3. Configure Scoped Package (Optional)

If publishing under a scope (e.g., `@markstiles/sitecore-search-mcp`), you may need to:

**For Public Scoped Package:**
```bash
npm publish --access public
```

**For Private Scoped Package (requires paid npm account):**
```bash
npm publish
```

## Publishing Process

### Step 1: Update Version

Update the version in `package.json` following [Semantic Versioning](https://semver.org/):

```bash
# Patch release (bug fixes): 1.0.0 -> 1.0.1
npm version patch

# Minor release (new features, backward compatible): 1.0.0 -> 1.1.0
npm version minor

# Major release (breaking changes): 1.0.0 -> 2.0.0
npm version major
```

This will:
- Update `package.json`
- Create a git commit
- Create a git tag

### Step 2: Build the Project

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` folder.

### Step 3: Test the Package Locally (Optional)

Test your package before publishing:

```bash
# Create a tarball
npm pack

# This creates a file like: sitecore-sitecore-search-mcp-1.0.0.tgz
# Install it in another project to test:
cd /path/to/test-project
npm install /path/to/mcp-sitecore-search-server/sitecore-sitecore-search-mcp-1.0.0.tgz
```

### Step 4: Publish to npm

**For first-time publish of scoped package:**
```bash
npm publish --access public
```

**For subsequent publishes:**
```bash
npm publish
```

### Step 5: Verify Publication

Visit your package on npm:
```
https://www.npmjs.com/package/@markstiles/sitecore-search-mcp
```

## Using the Published Package

Once published, users can install it:

```bash
npm install @sitecore/sitecore-search-mcp
```

Or install globally:
```bash
npm install -g @sitecore/sitecore-search-mcp
```

## MCP Client Configuration

After publishing, users can configure the MCP server in their MCP clients (e.g., Claude Desktop):

```json
{
  "mcpServers": {
    "sitecore-search": {
      "command": "npx",
      "args": [
        "-y",
        "@sitecore/sitecore-search-mcp"
      ],
      "env": {
        "SITECORE_DOMAIN_ID": "your-domain-id",
        "SITECORE_CLIENT_KEY": "your-client-key",
        "SITECORE_API_KEY": "your-api-key"
      }
    }
  }
}
```

Or if installed globally:

```json
{
  "mcpServers": {
    "sitecore-search": {
      "command": "mcp-sitecore-search-server",
      "env": {
        "SITECORE_DOMAIN_ID": "your-domain-id",
        "SITECORE_CLIENT_KEY": "your-client-key",
        "SITECORE_API_KEY": "your-api-key"
      }
    }
  }
}
```

## Updating the Package

To publish a new version:

1. Make your changes
2. Update version: `npm version patch|minor|major`
3. Build: `npm run build`
4. Publish: `npm publish`

## Unpublishing (Use with Caution)

To unpublish a specific version:
```bash
npm unpublish @sitecore/sitecore-search-mcp@1.0.0
```

To unpublish entire package (only within 72 hours):
```bash
npm unpublish @sitecore/sitecore-search-mcp --force
```

**Warning:** Unpublishing is not recommended as it can break dependencies.

## Best Practices

1. **Use Semantic Versioning** - Follow semver strictly
2. **Test Before Publishing** - Always test the package locally first
3. **Document Breaking Changes** - Update README and CHANGELOG
4. **Don't Publish Secrets** - Verify `.npmignore` excludes sensitive files
5. **Use Tags for Releases** - `npm version` creates git tags automatically
6. **Maintain a CHANGELOG** - Document changes between versions

## Troubleshooting

### "You do not have permission to publish"

If using a scoped package under an organization:
- Ensure you have access to the organization
- Use `npm publish --access public` for public packages

### "Package name already taken"

- Choose a different package name in `package.json`
- Or use a scoped package: `@your-org/package-name`

### "Version already published"

- Update the version number in `package.json`
- Use `npm version` to bump the version

## References

- [npm Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [Semantic Versioning](https://semver.org/)
- [npm Scope](https://docs.npmjs.com/cli/v9/using-npm/scope)
