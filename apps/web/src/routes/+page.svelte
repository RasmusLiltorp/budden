<script lang="ts">
import { fmtId } from '$lib/format';
import type { PageData } from './$types';

const { data }: { data: PageData } = $props();
</script>

<div class="mb-8 flex items-center justify-between">
  <div>
    <h1 class="text-2xl font-semibold tracking-tight">Dashboard</h1>
    <p class="mt-1 text-sm text-zinc-500">Active campaigns at a glance.</p>
  </div>
  <a
    href="/lists"
    class="rounded-md bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-white"
  >
    All lists
  </a>
</div>

{#if data.overview.length === 0}
  <div class="rounded-md border border-zinc-800 bg-zinc-900/50 p-8 text-center text-zinc-500">
    No lists yet. Create one from the
    <a href="/lists" class="text-zinc-300 underline underline-offset-2">Lists page</a>.
  </div>
{:else}
  <div class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
    {#each data.overview as { list, today, followups, inbox }}
      <a
        href="/lists/{list.id}"
        class="block rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 transition-colors hover:border-zinc-700 hover:bg-zinc-900"
      >
        <div class="flex items-start justify-between">
          <h2 class="truncate text-sm font-medium text-zinc-100">{list.name}</h2>
          <span class="ml-2 shrink-0 text-xs text-zinc-600">{fmtId(list.id)}</span>
        </div>
        {#if list.goal}
          <p class="mt-1 truncate text-xs text-zinc-500">{list.goal}</p>
        {/if}
        <div class="mt-4 flex gap-4 text-xs">
          <div>
            <div class="text-zinc-500">Today</div>
            <div class="mt-0.5 text-base font-medium text-zinc-100">{today}</div>
          </div>
          <div>
            <div class="text-zinc-500">Follow-ups</div>
            <div class="mt-0.5 text-base font-medium text-zinc-100">{followups}</div>
          </div>
          <div>
            <div class="text-zinc-500">Inbox</div>
            <div class="mt-0.5 text-base font-medium text-zinc-100">{inbox}</div>
          </div>
        </div>
      </a>
    {/each}
  </div>
{/if}
