<script>
  import { onMount } from "svelte";
  import { navigate } from "../../../router.js";
  import AddModal from "../modals/AddModal.svelte";
  import { linkTreesStore, linkTreeTypes } from "../states/linkTreesStore";
  import { usersStore } from "../../users/states/usersStore";
  import { formatDate, showConfirmDialog } from "../../../helpers/toolsHelper";
  import { Plus, Link, Trash2, Search, LoaderCircle, Eye } from "lucide-svelte";

  let loading = false;
  let isMe = false;
  let searchQuery = "";
  let showAddModal = false;

  $: profile = $usersStore.profile;
  $: linkTrees = $linkTreesStore.linkTrees || [];

  $: filteredLinkTrees = linkTrees.filter((linkTree) => {
    const keyword = searchQuery.trim().toLowerCase();
    return [linkTree.title, linkTree.description].join(" ").toLowerCase().includes(keyword);
  });

  $: totalCount = linkTrees.length;
  $: publicCount = linkTrees.filter((linkTree) => linkTree.type === "public").length;
  $: unlistedCount = linkTrees.filter((linkTree) => linkTree.type === "unlisted").length;
  $: privateCount = linkTrees.filter((linkTree) => linkTree.type === "private").length;

  async function loadLinkTrees() {
    loading = true;
    await linkTreesStore.asyncSetLinkTrees(isMe);
    loading = false;
  }

  onMount(() => {
    loadLinkTrees();
  });

  function handleFilterChange(event) {
    isMe = event.currentTarget.checked;
    loadLinkTrees();
  }

  $: if ($linkTreesStore.isLinkTreeDelete) {
    const isSuccess = $linkTreesStore.isLinkTreeDeleted;
    linkTreesStore.setIsLinkTreeDelete(false);
    linkTreesStore.setIsLinkTreeDeleted(false);
    if (isSuccess) loadLinkTrees();
  }

  $: if ($linkTreesStore.isLinkTreeDeleteAll) {
    const isSuccess = $linkTreesStore.isLinkTreeDeletedAll;
    linkTreesStore.setIsLinkTreeDeleteAll(false);
    linkTreesStore.setIsLinkTreeDeletedAll(false);
    if (isSuccess) loadLinkTrees();
  }

  async function handleDelete(linkTreeId) {
    const result = await showConfirmDialog("Apakah Anda yakin ingin menghapus link tree ini?");
    if (result.isConfirmed) {
      linkTreesStore.asyncSetIsLinkTreeDelete(linkTreeId);
    }
  }

  async function handleDeleteAll() {
    const result = await showConfirmDialog("Apakah Anda yakin ingin menghapus SEMUA link tree?");
    if (result.isConfirmed) {
      linkTreesStore.asyncSetIsLinkTreeDeleteAll();
    }
  }
</script>

{#if profile}
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold text-slate-900 tracking-tight">
          Semua Link Tree
        </h1>
        <p class="text-sm text-slate-600 mt-1">
          Kelola dan bagikan kumpulan tautan Anda dalam satu halaman.
        </p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <button
          type="button"
          data-testid="delete-all-btn"
          on:click={handleDeleteAll}
          disabled={linkTrees.length === 0}
          class="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-sm text-red-700 bg-white border border-slate-300 hover:bg-red-50 hover:border-red-300 transition-colors disabled:opacity-50 disabled:hover:bg-white disabled:hover:border-slate-300"
        >
          <Trash2 size={16} />
          <span>Hapus Semua</span>
        </button>
        <button
          type="button"
          data-testid="add-link-tree-btn"
          on:click={() => (showAddModal = true)}
          class="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>Tambah Link Tree</span>
        </button>
      </div>
    </div>

    <section
      aria-label="Statistik link tree"
      class="grid grid-cols-2 sm:grid-cols-4 gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200"
    >
      <div data-testid="stat-card" class="bg-white px-5 py-4">
        <p class="text-sm text-slate-600">Total Link Tree</p>
        <p class="mt-1 text-2xl font-semibold tabular-nums text-slate-900">{totalCount}</p>
      </div>
      <div data-testid="stat-card" class="bg-white px-5 py-4">
        <p class="text-sm text-slate-600">Publik</p>
        <p class="mt-1 text-2xl font-semibold tabular-nums text-slate-900">{publicCount}</p>
      </div>
      <div data-testid="stat-card" class="bg-white px-5 py-4">
        <p class="text-sm text-slate-600">Tidak Terdaftar</p>
        <p class="mt-1 text-2xl font-semibold tabular-nums text-slate-900">{unlistedCount}</p>
      </div>
      <div data-testid="stat-card" class="bg-white px-5 py-4">
        <p class="text-sm text-slate-600">Privat</p>
        <p class="mt-1 text-2xl font-semibold tabular-nums text-slate-900">{privateCount}</p>
      </div>
    </section>

    <section class="space-y-4">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="relative flex-1 max-w-md">
          <Search size={16} class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
          <label for="search-link-tree-input" class="sr-only">Cari link tree</label>
          <input
            id="search-link-tree-input"
            type="search"
            data-testid="search-link-tree-input"
            bind:value={searchQuery}
            placeholder="Cari judul atau deskripsi..."
            class="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-500 focus:border-indigo-600"
          />
        </div>

        <div class="flex items-center gap-2">
          <input
            id="filter-is-me-checkbox"
            type="checkbox"
            data-testid="filter-is-me-checkbox"
            checked={isMe}
            on:change={handleFilterChange}
            class="w-4 h-4 accent-indigo-600"
          />
          <label for="filter-is-me-checkbox" class="text-sm font-medium text-slate-800">
            Hanya milik saya
          </label>
        </div>
      </div>

      {#if loading && filteredLinkTrees.length === 0}
        <div class="py-16 text-center text-slate-600 rounded-xl border border-dashed border-slate-300 bg-white" role="status">
          <LoaderCircle size={32} class="mx-auto text-indigo-700 animate-spin mb-2" />
          <p class="text-sm font-medium">Memuat daftar link tree...</p>
        </div>
      {:else if filteredLinkTrees.length === 0}
        <div class="py-16 text-center text-slate-600 rounded-xl border border-dashed border-slate-300 bg-white">
          <Link size={32} class="mx-auto text-slate-600 mb-2" />
          <p class="text-sm font-medium">Belum ada link tree yang cocok.</p>
        </div>
      {:else}
        <ul class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {#each filteredLinkTrees as linkTree (linkTree.id)}
            <li
              data-testid={`link-tree-card-${linkTree.id}`}
              class="rounded-xl border border-slate-200 bg-white flex flex-col transition-colors hover:border-slate-300"
            >
              <div class="p-5 flex flex-col gap-2 flex-1">
                <div class="flex items-start justify-between gap-3">
                  <h2 class="font-semibold text-slate-900 leading-snug">{linkTree.title}</h2>
                  <span
                    class="shrink-0 inline-flex px-2 py-0.5 rounded-md text-xs font-medium border {linkTreeTypes[linkTree.type]?.badgeClass}"
                  >
                    {linkTreeTypes[linkTree.type]?.label}
                  </span>
                </div>
                <p class="text-sm text-slate-600 line-clamp-2">{linkTree.description}</p>
                <p class="mt-auto pt-2 text-xs text-slate-600">
                  {linkTree.total_links} tautan · Dibuat {formatDate(linkTree.created_at)}
                </p>
              </div>
              <div class="flex items-center justify-end gap-1 px-3 py-2 border-t border-slate-100">
                <button
                  type="button"
                  data-testid={`view-link-tree-${linkTree.id}`}
                  on:click={() => navigate(`/link-trees/${linkTree.id}`)}
                  aria-label={`Lihat detail ${linkTree.title}`}
                  title="Lihat Detail"
                  class="p-2 text-slate-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  <Eye size={18} />
                </button>
                <button
                  type="button"
                  data-testid={`delete-link-tree-${linkTree.id}`}
                  on:click={() => handleDelete(linkTree.id)}
                  aria-label={`Hapus ${linkTree.title}`}
                  title="Hapus Link Tree"
                  class="p-2 text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </li>
          {/each}
        </ul>
      {/if}
    </section>

    <AddModal
      show={showAddModal}
      onClose={() => (showAddModal = false)}
      onSaved={loadLinkTrees}
    />
  </div>
{/if}