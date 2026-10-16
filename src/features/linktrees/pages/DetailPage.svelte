<script>
  import { onMount } from "svelte";
  import { navigate } from "../../../router.js";
  import ChangeCoverModal from "../modals/ChangeCoverModal.svelte";
  import ChangeModal from "../modals/ChangeModal.svelte";
  import ItemModal from "../modals/ItemModal.svelte";
  import { linkTreesStore, linkTreeTypes } from "../states/linkTreesStore";
  import { usersStore } from "../../users/states/usersStore";
  import { formatDate, showConfirmDialog } from "../../../helpers/toolsHelper";
  import {
    ArrowLeft,
    ImagePlus,
    PenLine,
    Plus,
    Trash2,
    Calendar,
    ExternalLink,
    Link as LinkIcon,
    Info,
  } from "lucide-svelte";

  export let linkTreeId;

  let showCoverModal = false;
  let showChangeModal = false;
  let showItemModal = false;
  let selectedItem = null;

  $: profile = $usersStore.profile;
  $: linkTree = $linkTreesStore.linkTree;
  $: items = linkTree?.items || [];
  $: coverAlt = linkTree?.title ? `Sampul ${linkTree.title}` : "Sampul";

  onMount(() => {
    if (linkTreeId) {
      linkTreesStore.asyncSetLinkTree(linkTreeId);
    }
  });

  let prevId = linkTreeId;
  $: if (linkTreeId !== prevId) {
    prevId = linkTreeId;
    linkTreesStore.asyncSetLinkTree(linkTreeId);
  }

  $: if ($linkTreesStore.isLinkTree) {
    linkTreesStore.setIsLinkTree(false);
    if (!linkTree) {
      navigate("/");
    }
  }

  $: if ($linkTreesStore.isLinkTreeItemDelete) {
    const isSuccess = $linkTreesStore.isLinkTreeItemDeleted;
    linkTreesStore.setIsLinkTreeItemDelete(false);
    linkTreesStore.setIsLinkTreeItemDeleted(false);
    if (isSuccess) {
      linkTreesStore.asyncSetLinkTree(linkTreeId);
    }
  }

  function openItemModal(item) {
    selectedItem = item;
    showItemModal = true;
  }

  async function handleDeleteItem(item) {
    const result = await showConfirmDialog("Apakah Anda yakin ingin menghapus tautan ini?");
    if (result.isConfirmed) {
      linkTreesStore.asyncSetIsLinkTreeItemDelete(linkTreeId, item.id);
    }
  }
</script>

{#if !profile || !linkTree}
  <div class="flex flex-col items-center justify-center py-20" role="status">
    <div class="relative w-10 h-10" aria-hidden="true">
      <div class="absolute inset-0 rounded-full border-4 border-slate-200"></div>
      <div class="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-600 border-r-indigo-600 animate-spin"></div>
    </div>
    <p class="mt-3 text-sm font-semibold text-slate-700">Memuat detail link tree...</p>
  </div>
{:else}
  <div class="space-y-6 max-w-4xl mx-auto">
    <!-- Top Bar: Back + Actions -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <a
        href="/"
        data-testid="back-to-link-trees-link"
        on:click|preventDefault={() => navigate("/")}
        class="inline-flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-indigo-700 transition-colors group"
      >
        <span
          class="grid w-8 h-8 place-items-center rounded-xl bg-white border border-slate-200 group-hover:border-indigo-300 group-hover:bg-indigo-50 transition-colors"
          aria-hidden="true"
        >
          <ArrowLeft size={16} />
        </span>
        Kembali ke Semua Link Tree
      </a>

      <div class="flex flex-wrap items-center gap-2">
        <button
          type="button"
          data-testid="edit-cover-btn"
          on:click={() => (showCoverModal = true)}
          class="inline-flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold rounded-xl text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <ImagePlus size={16} aria-hidden="true" />
          Ubah Sampul
        </button>
        <button
          type="button"
          data-testid="edit-detail-btn"
          on:click={() => (showChangeModal = true)}
          class="inline-flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold rounded-xl text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <PenLine size={16} aria-hidden="true" />
          Ubah Data
        </button>
      </div>
    </div>

    <!-- Hero Article -->
    <article class="relative bg-white rounded-3xl border border-slate-200/80 shadow-lg shadow-slate-200/40 overflow-hidden">
      {#if linkTree.cover}
        <div class="relative">
          <img
            src={linkTree.cover}
            alt={coverAlt}
            class="w-full h-64 sm:h-80 object-cover bg-slate-900"
          />
          <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" aria-hidden="true"></div>
        </div>
      {/if}

      <div class="relative p-6 sm:p-8 space-y-4">
        <div class="pointer-events-none absolute -top-20 -right-20 w-64 h-64 rounded-full bg-indigo-100/40 blur-3xl" aria-hidden="true"></div>

        <div class="relative space-y-4">
          <span
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider border {linkTreeTypes[linkTree.type]?.badgeClass}"
          >
            <Info size={12} aria-hidden="true" />
            {linkTreeTypes[linkTree.type]?.label}
          </span>

          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {linkTree.title}
          </h1>

          <p data-testid="link-tree-description" class="text-slate-700 leading-relaxed">
            {linkTree.description}
          </p>

          <div class="flex flex-wrap items-center gap-2 pt-2">
            <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
              <Calendar size={12} class="text-indigo-700 shrink-0" aria-hidden="true" />
              <span class="text-slate-700">Dibuat:</span>
              <strong class="text-slate-900">{formatDate(linkTree.created_at)}</strong>
            </div>
            <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
              <Calendar size={12} class="text-teal-700 shrink-0" aria-hidden="true" />
              <span class="text-slate-700">Diperbarui:</span>
              <strong class="text-slate-900">{formatDate(linkTree.updated_at)}</strong>
            </div>
          </div>
        </div>
      </div>
    </article>

    <!-- Items Section -->
    <section
      aria-label="Daftar tautan"
      class="relative bg-white rounded-3xl border border-slate-200/80 shadow-lg shadow-slate-200/40 p-6 sm:p-8 space-y-4 overflow-hidden"
    >
      <div class="pointer-events-none absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-teal-100/40 blur-3xl" aria-hidden="true"></div>

      <div class="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <!-- FIXED: text-indigo-600/80 → text-indigo-700 (kontras lebih gelap) -->
          <p class="text-[11px] font-bold uppercase tracking-[0.15em] text-indigo-700">
            Konten
          </p>
          <h2 class="mt-1 text-lg font-extrabold text-slate-900 tracking-tight">Daftar Tautan</h2>
        </div>
        <button
          type="button"
          data-testid="add-item-btn"
          on:click={() => openItemModal(null)}
          class="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl text-white bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus size={16} strokeWidth={2.5} aria-hidden="true" />
          Tambah Tautan
        </button>
      </div>

      <div class="relative space-y-2">
        {#each items as item (item.id)}
          <div
            data-testid={`item-row-${item.id}`}
            class="group flex items-center gap-3 p-3 rounded-2xl border border-slate-200/80 bg-white hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-500/10 hover:-translate-y-0.5 transition-all duration-200"
          >
            <span
              class="shrink-0 grid w-10 h-10 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-md shadow-indigo-500/25"
              aria-hidden="true"
            >
              <LinkIcon size={16} strokeWidth={2.2} />
            </span>

            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              class="flex-1 min-w-0 inline-flex items-center gap-2 font-bold text-slate-800 hover:text-indigo-700 transition-colors break-all"
            >
              <span class="truncate">{item.title}</span>
              <ExternalLink
                size={14}
                class="shrink-0 text-slate-500 group-hover:text-indigo-500 transition-colors"
                aria-hidden="true"
              />
            </a>

            <div class="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                data-testid={`edit-item-${item.id}`}
                on:click={() => openItemModal(item)}
                aria-label={`Ubah tautan ${item.title}`}
                title="Ubah Tautan"
                class="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors"
              >
                <PenLine size={14} aria-hidden="true" />
              </button>
              <button
                type="button"
                data-testid={`delete-item-${item.id}`}
                on:click={() => handleDeleteItem(item)}
                aria-label={`Hapus tautan ${item.title}`}
                title="Hapus Tautan"
                class="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-red-800 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
              >
                <Trash2 size={14} aria-hidden="true" />
              </button>
            </div>
          </div>
        {:else}
          <div
            data-testid="empty-items"
            class="py-12 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50"
          >
            <span
              class="inline-flex w-12 h-12 rounded-2xl bg-slate-100 items-center justify-center mb-3"
              aria-hidden="true"
            >
              <LinkIcon size={22} class="text-slate-500" />
            </span>
            <p class="text-sm font-semibold text-slate-700">Belum ada tautan pada link tree ini.</p>
            <p class="text-xs text-slate-600 mt-1">Klik "Tambah Tautan" untuk membuat tautan pertama.</p>
          </div>
        {/each}
      </div>
    </section>

    <ChangeCoverModal
      show={showCoverModal}
      {linkTree}
      onClose={() => (showCoverModal = false)}
    />
    <ChangeModal
      show={showChangeModal}
      {linkTree}
      onClose={() => (showChangeModal = false)}
    />
    <ItemModal
      show={showItemModal}
      {linkTreeId}
      item={selectedItem}
      onClose={() => (showItemModal = false)}
    />
  </div>
{/if}