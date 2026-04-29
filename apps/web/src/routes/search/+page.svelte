<script lang="ts">
import { fmtDate, fmtId } from '$lib/format';
import type { PageData } from './$types';

const { data }: { data: PageData } = $props();
</script>

{#if !data.q}
  <p class="text-sm text-zinc-500">Type something into the search bar above.</p>
{:else if !data.results}
  <p class="text-sm text-zinc-500">No query.</p>
{:else}
  <h1 class="mb-6 text-2xl font-semibold tracking-tight">
    Results for &ldquo;{data.q}&rdquo;
  </h1>

  <div class="space-y-8">
    <section>
      <h2 class="mb-2 text-sm font-medium text-zinc-100">
        Contacts ({data.results.contacts.length})
      </h2>
      {#if data.results.contacts.length === 0}
        <p class="text-sm text-zinc-500">No matches.</p>
      {:else}
        <ul class="space-y-1.5">
          {#each data.results.contacts as contact}
            <li class="rounded-md border border-zinc-800 bg-zinc-900/50 px-3 py-2">
              <a href="/contacts/{contact.id}" class="text-sm text-zinc-100 hover:underline">
                {contact.full_name}
              </a>
              {#if contact.role}<span class="ml-2 text-xs text-zinc-500">{contact.role}</span>{/if}
              <span class="ml-2 text-xs text-zinc-600">{fmtId(contact.id)}</span>
            </li>
          {/each}
        </ul>
      {/if}
    </section>

    <section>
      <h2 class="mb-2 text-sm font-medium text-zinc-100">
        Companies ({data.results.companies.length})
      </h2>
      {#if data.results.companies.length === 0}
        <p class="text-sm text-zinc-500">No matches.</p>
      {:else}
        <ul class="space-y-1.5">
          {#each data.results.companies as company}
            <li class="rounded-md border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-100">
              {company.name}
            </li>
          {/each}
        </ul>
      {/if}
    </section>

    <section>
      <h2 class="mb-2 text-sm font-medium text-zinc-100">
        Interactions ({data.results.interactions.length})
      </h2>
      {#if data.results.interactions.length === 0}
        <p class="text-sm text-zinc-500">No matches.</p>
      {:else}
        <ul class="space-y-1.5">
          {#each data.results.interactions as interaction}
            <li class="rounded-md border border-zinc-800 bg-zinc-900/50 px-3 py-2">
              <div class="text-xs text-zinc-500">
                {fmtDate(interaction.occurred_at)} · {interaction.direction} · {interaction.channel_type}
              </div>
              {#if interaction.subject}
                <div class="mt-0.5 text-sm font-medium text-zinc-200">{interaction.subject}</div>
              {/if}
              {#if interaction.body}
                <p class="mt-0.5 text-sm text-zinc-300">{interaction.body}</p>
              {/if}
              <a
                href="/contacts/{interaction.contact_id}"
                class="mt-1 inline-block text-xs text-zinc-500 hover:underline"
              >
                view contact
              </a>
            </li>
          {/each}
        </ul>
      {/if}
    </section>
  </div>
{/if}
