#!/usr/bin/env node
// punica-form-mcp: the MCP server over stdio.
import { readFileSync } from 'node:fs';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createPunicaFormServer } from './create.mjs';
import { loadPackage } from './load.mjs';

const packages = [
  loadPackage('@punica/form'),
  loadPackage('@punica/form-service'),
  loadPackage('@punica/form-react'),
  loadPackage('@punica/form-kit'),
  loadPackage('@punica/form-kit', process.cwd(), 'react'),
  loadPackage('@punica/form-kit', process.cwd(), 'json'),
  loadPackage('@punica/form-json'),
  loadPackage('@punica/form-schema')
].filter(Boolean);
const guide = readFileSync(new URL('./guide.md', import.meta.url), 'utf8');

const server = createPunicaFormServer({ packages, guide });
await server.connect(new StdioServerTransport());
