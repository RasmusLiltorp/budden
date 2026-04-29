<script lang="ts">
import { MembershipStatus } from '@budden/shared';

const { listId, current }: { listId: string; current: MembershipStatus } = $props();
const options = MembershipStatus.options;
</script>

<form method="POST" action="?/setStatus" class="flex items-center gap-1.5">
  <input type="hidden" name="list_id" value={listId} />
  <select
    name="status"
    value={current}
    class="rounded-md border border-zinc-800 bg-zinc-950 px-2 py-1 text-xs focus:border-zinc-600 focus:outline-none"
  >
    {#each options as option}
      <option value={option}>{option.replace(/_/g, ' ')}</option>
    {/each}
  </select>
  <button
    type="submit"
    class="rounded-md border border-zinc-800 px-2 py-1 text-xs text-zinc-400 hover:text-zinc-100"
  >
    Set
  </button>
</form>
