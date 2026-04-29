<script lang="ts">
import LogForm from '$lib/components/LogForm.svelte';
import StatusBadge from '$lib/components/StatusBadge.svelte';
import StatusSelect from '$lib/components/StatusSelect.svelte';
import { fmtDateTime, fmtId } from '$lib/format';
import type { PageData } from './$types';

const { data }: { data: PageData } = $props();
</script>

<div class="mb-6">
  <div class="text-xs text-zinc-500">{fmtId(data.contact.id)}</div>
  <h1 class="mt-1 text-2xl font-semibold tracking-tight">{data.contact.full_name}</h1>
  <p class="mt-1 text-sm text-zinc-400">
    {#if data.contact.role}{data.contact.role}{/if}
    {#if data.company}{#if data.contact.role} · {/if}{data.company.name}{/if}
  </p>
</div>

<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
  <div class="space-y-6 lg:col-span-2">
    <LogForm memberships={data.memberships} />

    <section>
      <h2 class="mb-2 text-sm font-medium text-zinc-100">Interactions</h2>
      {#if data.interactions.length === 0}
        <p class="text-sm text-zinc-500">No interactions yet.</p>
      {:else}
        <ul class="space-y-2">
          {#each data.interactions as interaction}
            <li class="rounded-md border border-zinc-800 bg-zinc-900/50 p-3">
              <div class="flex items-center gap-2 text-xs text-zinc-500">
                <span class="text-zinc-300">{interaction.direction}</span>
                <span>·</span>
                <span>{interaction.channel_type}</span>
                <span>·</span>
                <span>{fmtDateTime(interaction.occurred_at)}</span>
              </div>
              {#if interaction.subject}
                <div class="mt-1 text-sm font-medium text-zinc-200">{interaction.subject}</div>
              {/if}
              {#if interaction.body}
                <p class="mt-1 whitespace-pre-wrap text-sm text-zinc-300">{interaction.body}</p>
              {/if}
            </li>
          {/each}
        </ul>
      {/if}
    </section>
  </div>

  <aside class="space-y-6">
    <section>
      <h2 class="mb-2 text-sm font-medium text-zinc-100">Lists</h2>
      {#if data.memberships.length === 0}
        <p class="text-sm text-zinc-500">Not in any lists.</p>
      {:else}
        <ul class="space-y-1.5">
          {#each data.memberships as { membership, list }}
            <li class="rounded-md border border-zinc-800 bg-zinc-900/50 px-3 py-2">
              <div class="flex items-center justify-between">
                <a href="/lists/{list.id}" class="truncate text-sm text-zinc-100 hover:underline">
                  {list.name}
                </a>
                <StatusBadge status={membership.status} />
              </div>
              <div class="mt-2">
                <StatusSelect listId={list.id} current={membership.status} />
              </div>
            </li>
          {/each}
        </ul>
      {/if}
    </section>

    <section>
      <h2 class="mb-2 text-sm font-medium text-zinc-100">Channels</h2>
      {#if data.channels.length === 0}
        <p class="text-sm text-zinc-500">No channels.</p>
      {:else}
        <ul class="space-y-1.5">
          {#each data.channels as ch}
            <li
              class="rounded-md border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-300"
            >
              <div class="text-xs uppercase tracking-wide text-zinc-500">{ch.type}</div>
              <div class="truncate">{ch.handle}</div>
            </li>
          {/each}
        </ul>
      {/if}
    </section>

    {#if data.contact.notes}
      <section>
        <h2 class="mb-2 text-sm font-medium text-zinc-100">Notes</h2>
        <p class="whitespace-pre-wrap rounded-md border border-zinc-800 bg-zinc-900/50 p-3 text-sm text-zinc-300">
          {data.contact.notes}
        </p>
      </section>
    {/if}
  </aside>
</div>
