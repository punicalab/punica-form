#!/usr/bin/env node
// punica-form-mcp: the MCP server over stdio.
import { readFileSync } from 'node:fs';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createPunicaFormServer } from './create.mjs';
import { loadPackage } from './load.mjs';

const packages = ['@punica/form', '@punica/form-service'].map((name) => loadPackage(name));
const guide = readFileSync(new URL('./guide.md', import.meta.url), 'utf8');

const server = createPunicaFormServer({ packages, guide });
await server.connect(new StdioServerTransport());
