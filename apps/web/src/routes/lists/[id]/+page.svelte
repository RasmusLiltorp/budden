<script lang="ts">
import { page } from '$app/stores';
import StatusBadge from '$lib/components/StatusBadge.svelte';
import { fmtId } from '$lib/format';
import type { ActionData, PageData } from './$types';

let { data, form }: { data: PageData; form: ActionData } = $props();
let adding = $state(false);

const imported = $derived($page.url.searchParams.get('imported'));
const linked = $derived($page.url.searchParams.get('linked'));
const dupes = $derived($page.url.searchParams.get('dupes'));
</script>

{#if imported}
  <div class="mb-4 rounded-md border border-emerald-800 bg-emerald-950/40 p-3 text-sm text-emerald-200">
    Imported {linked} contacts ({imported} new, {dupes} duplicates).
  </div>
{/if}

<div class="mb-6 flex items-start justify-between">
  <div>
    <div class="text-xs text-zinc-500">{fmtId(data.list.id)}</div>
    <h1 class="mt-1 text-2xl font-semibold tracking-tight">{data.list.name}</h1>
    {#if data.list.goal}
      <p class="mt-1 text-sm text-zinc-400">{data.list.goal}</p>
    {/if}
  </div>
  <div class="flex items-center gap-2">
    <button
      onclick={() => (adding = !adding)}
      class="rounded-md bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-white"
    >
      {adding ? 'Cancel' : 'Add contact'}
    </button>
    <a
      href="/lists/{data.list.id}/export.csv"
      class="rounded-md border border-zinc-800 px-3 py-1.5 text-sm text-zinc-400 hover:text-zinc-100"
    >
      Export CSV
    </a>
    {#if data.list.status !== 'archived'}
      <form method="POST" action="?/archive">
        <button
          type="submit"
          class="rounded-md border border-zinc-800 px-3 py-1.5 text-sm text-zinc-400 hover:text-zinc-100"
        >
          Archive
        </button>
      </form>
    {/if}
  </div>
</div>

{#if adding}
  <form
    method="POST"
    action="?/addContact"
    class="mb-6 grid grid-cols-1 gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 md:grid-cols-4"
  >
    <input
      name="full_name"
      placeholder="Full name"
      required
      class="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm focus:border-zinc-600 focus:outline-none"
    />
    <input
      name="company"
      placeholder="Company"
      class="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm focus:border-zinc-600 focus:outline-none"
    />
    <input
      name="role"
      placeholder="Role"
      class="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm focus:border-zinc-600 focus:outline-none"
    />
    <select
      name="priority"
      class="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm focus:border-zinc-600 focus:outline-none"
    >
      <option value="">Priority…</option>
      <option value="high">High</option>
      <option value="medium">Medium</option>
      <option value="low">Low</option>
    </select>
    {#if form?.error}
      <p class="text-sm text-red-400 md:col-span-4">{form.error}</p>
    {/if}
    <button
      type="submit"
      class="rounded-md bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-white md:col-span-1"
    >
      Add
    </button>
  </form>
{/if}

<div class="mb-6 flex flex-wrap gap-3 text-xs">
  {#each Object.entries(data.counts) as [status, count]}
    {#if count > 0}
      <div class="rounded-md border border-zinc-800 bg-zinc-900/50 px-2.5 py-1">
        <span class="text-zinc-500">{status.replace(/_/g, ' ')}</span>
        <span class="ml-1.5 font-medium text-zinc-100">{count}</span>
      </div>
    {/if}
  {/each}
</div>

{#if data.rows.length === 0}
  <p class="text-sm text-zinc-500">No contacts yet.</p>
{:else}
  <div class="overflow-hidden rounded-lg border border-zinc-800">
    <table class="w-full text-sm">
      <thead class="bg-zinc-900/70 text-xs uppercase tracking-wide text-zinc-500">
        <tr>
          <th class="px-4 py-2 text-left font-medium">Name</th>
          <th class="px-4 py-2 text-left font-medium">Status</th>
          <th class="px-4 py-2 text-left font-medium">Priority</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-zinc-800">
        {#each data.rows as { contact, membership }}
          <tr class="hover:bg-zinc-900/50">
            <td class="px-4 py-2">
              <a href="/contacts/{contact.id}" class="text-zinc-100 hover:underline">
                {contact.full_name}
              </a>
              {#if contact.role}
                <span class="ml-2 text-xs text-zinc-500">{contact.role}</span>
              {/if}
            </td>
            <td class="px-4 py-2"><StatusBadge status={membership.status} /></td>
            <td class="px-4 py-2 text-xs text-zinc-400">{membership.priority ?? ''}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}
