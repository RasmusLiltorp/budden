<script lang="ts">
import { page } from '$app/stores';
import type { PageData } from './$types';

const { data }: { data: PageData } = $props();
const rotated = $derived($page.url.searchParams.get('rotated') === '1');
</script>

<h1 class="mb-6 text-2xl font-semibold tracking-tight">Settings</h1>

{#if rotated}
  <div class="mb-6 rounded-md border border-emerald-800 bg-emerald-950/40 p-3 text-sm text-emerald-200">
    Token rotated. Existing CLI / MCP clients must be updated with the new token.
  </div>
{/if}

<dl class="space-y-4 text-sm">
  <div>
    <dt class="text-zinc-500">Database</dt>
    <dd class="mt-0.5 font-mono text-xs text-zinc-300">{data.dbPath}</dd>
  </div>
  <div>
    <dt class="text-zinc-500">Config file</dt>
    <dd class="mt-0.5 font-mono text-xs text-zinc-300">{data.configPath}</dd>
  </div>
  <div>
    <dt class="text-zinc-500">Server</dt>
    <dd class="mt-0.5 font-mono text-xs text-zinc-300">{data.host}:{data.port}</dd>
  </div>
</dl>

<section class="mt-10 max-w-md rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
  <h2 class="text-sm font-medium text-zinc-100">Rotate API token</h2>
  <p class="mt-1 text-xs text-zinc-500">
    Generates a new bearer token. The current session is updated automatically; other clients
    (CLI, MCP) must be updated manually.
  </p>
  <form method="POST" action="?/rotateToken" class="mt-3">
    <button
      type="submit"
      class="rounded-md border border-red-900 bg-red-950/40 px-3 py-1.5 text-sm font-medium text-red-200 hover:bg-red-950/70"
    >
      Rotate token
    </button>
  </form>
</section>
