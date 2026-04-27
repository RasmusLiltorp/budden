<script lang="ts">
import { page } from '$app/stores';

const links = [
  { href: '/', label: 'Dashboard' },
  { href: '/lists', label: 'Lists' },
  { href: '/import', label: 'Import' },
  { href: '/settings', label: 'Settings' },
];

const isActive = (href: string, current: string): boolean => {
  if (href === '/') return current === '/';
  return current.startsWith(href);
};
</script>

<nav class="flex h-14 items-center gap-1 border-b border-zinc-800 px-6">
  <a href="/" class="mr-6 text-sm font-semibold tracking-tight text-zinc-100">budden</a>
  {#each links as link}
    <a
      href={link.href}
      class="rounded-md px-3 py-1.5 text-sm transition-colors {isActive(
        link.href,
        $page.url.pathname,
      )
        ? 'bg-zinc-800 text-zinc-100'
        : 'text-zinc-400 hover:text-zinc-100'}"
    >
      {link.label}
    </a>
  {/each}

  <form method="GET" action="/search" class="ml-6 flex-1 max-w-xs">
    <input
      type="search"
      name="q"
      placeholder="Search contacts, companies, messages…"
      value={$page.url.pathname === '/search' ? ($page.url.searchParams.get('q') ?? '') : ''}
      class="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-sm focus:border-zinc-600 focus:outline-none"
    />
  </form>

  <form method="POST" action="/logout" class="ml-auto">
    <button class="text-sm text-zinc-500 hover:text-zinc-200" type="submit">Sign out</button>
  </form>
</nav>
