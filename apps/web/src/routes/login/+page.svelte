<script lang="ts">
import type { ActionData, PageData } from './$types';

const { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<div class="flex min-h-screen items-center justify-center px-6">
  <div class="w-full max-w-sm space-y-6">
    <div>
      <h1 class="text-2xl font-semibold tracking-tight">budden</h1>
      <p class="mt-1 text-sm text-zinc-500">Self-hosted, AI-native CRM.</p>
    </div>

    {#if !data.configured}
      <div class="rounded-md border border-amber-800 bg-amber-950/40 p-3 text-sm text-amber-200">
        No API token configured. Run <code class="text-amber-100">budden init</code> first.
      </div>
    {/if}

    <form method="POST" class="space-y-3">
      <label class="block">
        <span class="mb-1 block text-sm text-zinc-400">API token</span>
        <input
          name="token"
          type="password"
          autocomplete="off"
          class="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm focus:border-zinc-600 focus:outline-none"
        />
      </label>

      {#if form?.error}
        <p class="text-sm text-red-400">{form.error}</p>
      {/if}

      <button
        type="submit"
        class="w-full rounded-md bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-white"
      >
        Sign in
      </button>
    </form>
  </div>
</div>
