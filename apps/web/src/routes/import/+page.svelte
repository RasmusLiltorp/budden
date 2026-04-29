<script lang="ts">
import type { ActionData, PageData } from './$types';

const { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<h1 class="mb-2 text-2xl font-semibold tracking-tight">Import contacts</h1>
<p class="mb-6 text-sm text-zinc-500">
  Paste CSV with headers like <code>name,email,linkedin,company,role</code>. Existing channels
  dedupe automatically.
</p>

<form
  method="POST"
  class="space-y-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4"
>
  <select
    name="list_id"
    required
    class="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm focus:border-zinc-600 focus:outline-none"
  >
    <option value="">Select destination list…</option>
    {#each data.lists as list}
      <option value={list.id}>{list.name}</option>
    {/each}
  </select>

  <textarea
    name="csv"
    placeholder="Paste CSV here…"
    rows="14"
    required
    class="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 font-mono text-xs focus:border-zinc-600 focus:outline-none"
  ></textarea>

  {#if form?.error}
    <p class="text-sm text-red-400">{form.error}</p>
  {/if}

  <button
    type="submit"
    class="rounded-md bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-white"
  >
    Import
  </button>
</form>
