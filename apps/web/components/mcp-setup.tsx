'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type Client = {
  id: string;
  label: string;
  where: string;
  code: (url: string, key: string) => string;
};

const json = (value: unknown) => JSON.stringify(value, null, 2);

export const MCP_CLIENTS: Client[] = [
  {
    id: 'claude-code',
    label: 'Claude Code',
    where: 'Run in your terminal',
    code: (url, key) =>
      `claude mcp add --transport http easyrender ${url} \\\n  --header "Authorization: Bearer ${key}"`,
  },
  {
    id: 'cursor',
    label: 'Cursor',
    where: 'Add to ~/.cursor/mcp.json',
    code: (url, key) =>
      json({ mcpServers: { easyrender: { url, headers: { Authorization: `Bearer ${key}` } } } }),
  },
  {
    id: 'vscode',
    label: 'VS Code',
    where: 'Add to .vscode/mcp.json',
    code: (url, key) =>
      json({
        servers: {
          easyrender: { type: 'http', url, headers: { Authorization: `Bearer ${key}` } },
        },
      }),
  },
  {
    id: 'claude-desktop',
    label: 'Claude Desktop',
    where: 'Add to claude_desktop_config.json',
    code: (url, key) =>
      json({
        mcpServers: {
          easyrender: {
            command: 'npx',
            // biome-ignore lint/suspicious/noTemplateCurlyInString: mcp-remote expands ${AUTH} from env
            args: ['-y', 'mcp-remote', url, '--header', 'Authorization:${AUTH}'],
            env: { AUTH: `Bearer ${key}` },
          },
        },
      }),
  },
];

export const KEY_PLACEHOLDER = 'er_your_key';

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      type="button"
      size="icon-sm"
      variant="ghost"
      className="absolute top-2 right-2"
      aria-label="Copy"
      onClick={async () => {
        await navigator.clipboard.writeText(text).catch(() => {});
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? <Check /> : <Copy />}
    </Button>
  );
}

// The config snippet for each MCP client, filled with the user's key when we have one.
export function McpSetup({ url, apiKey }: { url: string; apiKey?: string | null }) {
  const key = apiKey ?? KEY_PLACEHOLDER;
  return (
    <Tabs defaultValue={MCP_CLIENTS[0].id} className="w-full gap-3">
      <TabsList className="h-auto max-w-full flex-wrap justify-start">
        {MCP_CLIENTS.map((client) => (
          <TabsTrigger key={client.id} value={client.id}>
            {client.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {MCP_CLIENTS.map((client) => {
        const code = client.code(url, key);
        return (
          <TabsContent key={client.id} value={client.id} className="space-y-2">
            <p className="text-xs text-muted-foreground">{client.where}</p>
            <div className="relative">
              <pre className="overflow-x-auto rounded-lg border bg-muted/40 p-3 pr-12 font-mono text-xs leading-relaxed">
                {code}
              </pre>
              <CopyButton text={code} />
            </div>
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
