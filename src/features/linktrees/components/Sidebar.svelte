<script>
  import { createEventDispatcher } from "svelte";
  import { currentPath, navigate } from "../../../router.js";
  import { LayoutDashboard, Users, CircleUser } from "lucide-svelte";

  export let isSidebarOpen = false;
  export let onCloseMobile = undefined;

  const dispatch = createEventDispatcher();

  const navItems = [
    { to: "/", label: "Semua Link Tree", icon: LayoutDashboard, exact: true },
    { to: "/users", label: "Pengguna", icon: Users, exact: false },
    { to: "/profile", label: "Profil", icon: CircleUser, exact: false },
  ];

  function closeMobile() {
    dispatch("close-mobile");
    if (onCloseMobile) onCloseMobile();
  }

  function handleNav(to) {
    navigate(to);
    closeMobile();
  }

  function isItemActive(item, path) {
    if (item.exact) {
      return path === item.to;
    }
    return path.startsWith(item.to);
  }
</script>

<div>
  {#if isSidebarOpen}
    <button
      type="button"
      data-testid="sidebar-backdrop"
      on:click={closeMobile}
      aria-label="Tutup menu"
      class="fixed inset-0 z-30 bg-slate-900/40 md:hidden"
    ></button>
  {/if}

  <aside
    class="fixed top-16 bottom-0 left-0 z-30 w-64 bg-white border-r border-slate-200 p-4 transition-transform duration-200 ease-in-out md:translate-x-0 {isSidebarOpen
      ? 'translate-x-0'
      : '-translate-x-full'}"
  >
    <div class="flex flex-col h-full justify-between">
      <div>
        <p class="px-3 text-xs font-medium text-slate-600">Menu Utama</p>
        <nav class="mt-2 space-y-0.5" aria-label="Navigasi utama">
          {#each navItems as item (item.to)}
            {@const active = isItemActive(item, $currentPath)}
            <a
              href={item.to}
              on:click|preventDefault={() => handleNav(item.to)}
              aria-current={active ? "page" : undefined}
              class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors {active
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'}"
            >
              <svelte:component
                this={item.icon}
                size={18}
                class={active ? "text-indigo-700" : "text-slate-600"}
              />
              <span>{item.label}</span>
            </a>
          {/each}
        </nav>
      </div>

      <p class="px-3 py-2 text-xs text-slate-600 border-t border-slate-200">
        Praktikum 6 PABWE (Svelte)
      </p>
    </div>
  </aside>
</div>