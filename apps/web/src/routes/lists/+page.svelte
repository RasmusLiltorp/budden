<script lang="ts">
import { fmtId } from '$lib/format';
import type { ActionData, PageData } from './$types';

let { data, form }: { data: PageData; form: ActionData } = $props();
let creating = $state(false);
</script>

<div class="mb-6 flex items-center justify-between">
  <h1 class="text-2xl font-semibold tracking-tight">Lists</h1>
  <button
    onclick={() => (creating = !creating)}
    class="rounded-md bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-white"
  >
    {creating ? 'Cancel' : 'New list'}
  </button>
</div>

{#if creating}
  <form
    method="POST"
    action="?/create"
    class="mb-6 space-y-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4"
  >
    <input
      name="name"
      placeholder="List name"
      required
      class="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm focus:border-zinc-600 focus:outline-none"
    />
    <input
      name="goal"
      placeholder="Goal (optional)"
      class="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm focus:border-zinc-600 focus:outline-none"
    />
    <textarea
      name="description"
      placeholder="Description (optional)"
      rows="2"
      class="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm focus:border-zinc-600 focus:outline-none"
    ></textarea>
    {#if form?.error}
      <p class="text-sm text-red-400">{form.error}</p>
    {/if}
    <button
      type="submit"
      class="rounded-md bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-white"
    >
      Create
    </button>
  </form>
{/if}

{#if data.rows.length === 0}
  <p class="text-sm text-zinc-500">No lists yet.</p>
{:else}
  <div class="overflow-hidden rounded-lg border border-zinc-800">
    <table class="w-full text-sm">
      <thead class="bg-zinc-900/70 text-xs uppercase tracking-wide text-zinc-500">
        <tr>
          <th class="px-4 py-2 text-left font-medium">ID</th>
          <th class="px-4 py-2 text-left font-medium">Name</th>
          <th class="px-4 py-2 text-left font-medium">Status</th>
          <th class="px-4 py-2 text-right font-medium">Contacts</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-zinc-800">
        {#each data.rows as { list, contactCount }}
          <tr class="hover:bg-zinc-900/50">
            <td class="px-4 py-2 font-mono text-xs text-zinc-500">{fmtId(list.id)}</td>
            <td class="px-4 py-2">
              <a href="/lists/{list.id}" class="text-zinc-100 hover:underline">{list.name}</a>
              {#if list.goal}<span class="ml-2 text-xs text-zinc-500">{list.goal}</span>{/if}
            </td>
            <td class="px-4 py-2 text-zinc-400">{list.status}</td>
            <td class="px-4 py-2 text-right tabular-nums">{contactCount}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}
