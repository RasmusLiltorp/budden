<script lang="ts">
import type { MembershipWithList } from '@budden/core';

const { memberships }: { memberships: MembershipWithList[] } = $props();
</script>

<form
  method="POST"
  action="?/log"
  class="space-y-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4"
>
  <h3 class="text-sm font-medium text-zinc-100">Log interaction</h3>

  <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
    <select
      name="list_id"
      required
      class="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm focus:border-zinc-600 focus:outline-none"
    >
      <option value="">Select list…</option>
      {#each memberships as { list }}
        <option value={list.id}>{list.name}</option>
      {/each}
    </select>

    <select
      name="direction"
      class="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm focus:border-zinc-600 focus:outline-none"
    >
      <option value="outbound">Outbound</option>
      <option value="inbound">Inbound (reply)</option>
      <option value="note">Note</option>
    </select>

    <select
      name="channel"
      class="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm focus:border-zinc-600 focus:outline-none"
    >
      <option value="email">Email</option>
      <option value="linkedin">LinkedIn</option>
      <option value="twitter">Twitter</option>
      <option value="discord">Discord</option>
      <option value="phone">Phone</option>
      <option value="in_person">In person</option>
      <option value="other">Other</option>
    </select>
  </div>

  <input
    name="subject"
    placeholder="Subject (optional)"
    class="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm focus:border-zinc-600 focus:outline-none"
  />
  <textarea
    name="body"
    placeholder="Message body or note…"
    rows="3"
    class="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm focus:border-zinc-600 focus:outline-none"
  ></textarea>

  <button
    type="submit"
    class="rounded-md bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-white"
  >
    Log
  </button>
</form>
