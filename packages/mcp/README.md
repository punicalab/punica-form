# @punica/form-mcp

An [MCP](https://modelcontextprotocol.io) server that lets an AI assistant use
[Punica Form](https://form.punicalab.com) correctly: look up the exact API,
read the rules and check the code it wrote.

Punica Form is rarely in a model's training data, so without help a model
guesses imports, service names and methods. With this server it looks them up
and validates its answer.

## Tools

| Tool            | What it does                                                                                                                  |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `get_guide`     | The rules: what the packages provide and what your application builds, the lifecycle, services, events and a complete example |
| `search_api`    | Finds exports of the Punica Form packages (core, services, React hooks, form kit) by name or documentation                    |
| `get_api`       | The exact TypeScript declaration and documentation of one or more exports                                                     |
| `validate_code` | Checks code for imports that do not exist, wrong service names and service calls that do not exist; each problem with a fix   |

Resources: `punica-form://guide` and `punica-form://api/<name>`.

The API is read from the type declarations of the Punica Form packages
installed in the project the server is started in, so the answers match
those versions. For a package that is not installed it uses the version it
was built with.

## Set up

**Claude Code**

```sh
claude mcp add punica-form -- npx -y @punica/form-mcp
```

**Cursor** (`.cursor/mcp.json`), **VS Code** (`.vscode/mcp.json`, key `servers`), **Claude Desktop** and others:

```json
{
  "mcpServers": {
    "punica-form": { "command": "npx", "args": ["-y", "@punica/form-mcp"] }
  }
}
```

## Development

```sh
pnpm build   # in the repository root: builds the packages, then bundled/
pnpm --filter @punica/form-mcp test
```
