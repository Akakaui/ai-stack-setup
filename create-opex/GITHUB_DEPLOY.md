# Deploy to npm

This package is publishable on npm as `create-opex`.
When users run `npx create-opex`, npm downloads and executes it.

## Prerequisites

- Node.js >= 18
- npm account (create one at https://www.npmjs.com/signup)

## Publish

```bash
# Login to npm
npm login

# Publish the package
npm publish

# Verify it works
npx create-opex
```

## Test Locally

Before publishing, test the package locally:

```bash
# From the create-opex/ directory
node bin/create-opex

# Or via npx (from the package directory)
npm link
create-opex
```

## Update

When you make changes:

```bash
# Bump version in package.json
# Then publish again
npm publish
```

## Package Structure

```
create-opex/
  package.json        # Package manifest with bin entry
  bin/create-opex     # CLI entry point (shebang)
  index.js            # Main CLI — banner, wizard, setup
  prompts.js          # Interactive question wizard
  onboarding.js       # Generates .opex/ directory
  setup/
    common.js         # Cross-platform install functions
    linux.js          # Linux-specific install helpers
    macos.js          # macOS-specific install helpers
  config/
    opencode.js       # OpenCode config generation
    mcp.js            # MCP server configuration
    agents.js         # Agent file generation
  GITHUB_DEPLOY.md    # This file
```

## Notes

- No external npm dependencies — uses only Node.js built-in modules
  (fs, path, os, child_process, readline)
- Works on macOS and Linux
- Auto-detects platform and adjusts install commands
- Generates a complete AKAKA Business OS agent fleet in `.opex/`
