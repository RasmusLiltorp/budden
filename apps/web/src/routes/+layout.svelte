<script lang="ts">
import '../app.css';
import { page } from '$app/stores';
import Nav from '$lib/components/Nav.svelte';

const { children } = $props();
</script>

{#if $page.url.pathname !== '/login'}
  <Nav />
{/if}

<main class="mx-auto max-w-7xl px-6 py-8">
  {@render children()}
</main>
