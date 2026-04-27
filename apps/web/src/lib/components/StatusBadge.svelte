<script lang="ts">
import { statusClasses } from '$lib/status-colors';
import type { MembershipStatus } from '@budden/shared';

const { status }: { status: MembershipStatus } = $props();
</script>

<span
  class="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium {statusClasses(
    status,
  )}"
>
  {status.replace(/_/g, ' ')}
</span>
