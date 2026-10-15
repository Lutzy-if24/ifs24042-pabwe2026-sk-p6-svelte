<script>
  import { onMount } from "svelte";
  import Navbar from "../components/Navbar.svelte";
  import Sidebar from "../components/Sidebar.svelte";
  import { usersStore } from "../../users/states/usersStore";
  import { authStore } from "../../auth/states/authStore";
  import apiHelper from "../../../helpers/apiHelper";
  import { navigate } from "../../../router.js";
  import { Link } from "lucide-svelte";

  let isSidebarOpen = false;

  $: profile = $usersStore.profile;

  onMount(() => {
    const authToken = apiHelper.getAccessToken();
    if (authToken) {
      usersStore.asyncSetProfile();
    } else {
      navigate("/auth/login");
    }
  });

  $: if ($usersStore.isProfile) {
    usersStore.setIsProfile(false);
    if (!profile) {
      apiHelper.putAccessToken("");
      navigate("/auth/login");
    }
  }

  $: if ($authStore.isAuthLogout) {
    authStore.setIsAuthLogout(false);
    navigate("/auth/login");
  }

  function handleLogout() {
    authStore.asyncSetIsAuthLogout();
  }

  function toggleSidebar() {
    isSidebarOpen = !isSidebarOpen;
  }

  function handleCloseSidebar() {
    isSidebarOpen = false;
  }
</script>

{#if !profile}
  <!-- Loading Screen -->
  <div class="relative min-h-screen flex items-center justify-center bg-slate-50 overflow-hidden">
    <!-- Subtle background blobs -->
    <div class="pointer-events-none absolute -top-40 -right-40 w-96 h-96 rounded-full bg-indigo-200/30 blur-3xl"></div>
    <div class="pointer-events-none absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-teal-200/30 blur-3xl"></div>

    <div class="relative flex flex-col items-center gap-4" role="status">
      <!-- Brand logo -->
      <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
        <Link size={26} strokeWidth={2.2} />
      </div>

      <!-- Spinner -->
      <div class="relative w-10 h-10">
        <div class="absolute inset-0 rounded-full border-4 border-slate-200"></div>
        <div class="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-600 border-r-indigo-600 animate-spin"></div>
      </div>

      <div class="text-center">
        <p class="text-sm font-bold text-slate-800">Memuat sesi pengguna...</p>
        <p class="text-xs text-slate-500 mt-1">Mohon tunggu sebentar</p>
      </div>
    </div>
  </div>
{:else}
  <!-- Main Layout -->
  <div class="relative min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden">
    <!-- Ambient background (subtle) -->
    <div class="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] rounded-full bg-gradient-to-br from-indigo-100/40 via-transparent to-teal-100/30 blur-3xl"></div>

    <div class="relative">
      <Navbar
        {profile}
        {isSidebarOpen}
        onLogout={handleLogout}
        onToggleSidebar={toggleSidebar}
      />

      <Sidebar {isSidebarOpen} onCloseMobile={handleCloseSidebar} />

      <main class="pt-16 md:pl-64 transition-[padding] duration-300 ease-out">
        <div class="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          <slot />
        </div>
      </main>
    </div>
  </div>
{/if}