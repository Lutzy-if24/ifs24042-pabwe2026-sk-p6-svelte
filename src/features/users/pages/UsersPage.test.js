import { describe, it, expect, vi, beforeEach } from "vitest";
import UsersPage from "./UsersPage.svelte";
import { renderWithProviders } from "../../../test-utils";
import { usersStore } from "../states/usersStore";

describe("UsersPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const mockUsers = [
    {
      id: 1,
      name: "Abdullah",
      email: "abdullah@delcom.org",
      photo: "https://example.com/photo.jpg",
      created_at: "2024-10-05T02:53:38.000000Z",
    },
    {
      id: 2,
      name: "Ubaid",
      email: "ubaid@delcom.org",
      photo: null,
      created_at: "2024-10-05T03:18:14.000000Z",
    },
    {
      id: 3,
      name: "",
      email: "",
      photo: null,
      created_at: "2024-10-05T03:18:14.000000Z",
    },
  ];

  it("should render users list, fallback initial avatar, and search users", async () => {
    vi.spyOn(usersStore, "asyncSetUsers").mockImplementation(() => Promise.resolve());
    const { wrapper } = renderWithProviders(UsersPage, {
      preloadedState: {
        users: mockUsers,
      },
    });

    expect(wrapper.text()).toContain("Semua Pengguna");
    expect(wrapper.text()).toContain("Abdullah");
    expect(wrapper.text()).toContain("Ubaid");
    expect(wrapper.text()).toContain("U");

    const searchInput = wrapper.find('[data-testid="search-user-input"]');

    await searchInput.setValue("abdullah");
    expect(wrapper.text()).toContain("Abdullah");
    expect(wrapper.text()).not.toContain("Ubaid");

    await searchInput.setValue("ubaid@delcom");
    expect(wrapper.text()).toContain("Ubaid");
    expect(wrapper.text()).not.toContain("Abdullah");

    await searchInput.setValue("nonexistentquery");
    expect(wrapper.text()).toContain("Tidak ada data pengguna ditemukan.");
  });

  it("should handle state when users in store is null", async () => {
    vi.spyOn(usersStore, "asyncSetUsers").mockImplementation(() => Promise.resolve());
    const { wrapper } = renderWithProviders(UsersPage, {
      preloadedState: {
        users: null,
      },
    });

    await new Promise((r) => setTimeout(r, 10));
    expect(wrapper.text()).toContain("Semua Pengguna");
    expect(wrapper.text()).toContain("Tidak ada data pengguna ditemukan.");
  });

  it("should show empty state when no users found and not loading", async () => {
    vi.spyOn(usersStore, "asyncSetUsers").mockImplementation(() => Promise.resolve());
    const { wrapper } = renderWithProviders(UsersPage, {
      preloadedState: {
        users: [],
      },
    });

    await new Promise((r) => setTimeout(r, 10));
    expect(wrapper.text()).toContain("Tidak ada data pengguna ditemukan.");
  });

  it("should show loading indicator while users are being fetched", async () => {
    let resolveLoad;
    const pendingPromise = new Promise((resolve) => {
      resolveLoad = resolve;
    });

    vi.spyOn(usersStore, "asyncSetUsers").mockReturnValue(pendingPromise);

    const { wrapper } = renderWithProviders(UsersPage, {
      preloadedState: {
        users: [],
      },
    });

    expect(wrapper.text()).toContain("Memuat daftar pengguna...");

    resolveLoad();
    await pendingPromise;
    await new Promise((r) => setTimeout(r, 10));

    expect(wrapper.text()).not.toContain("Memuat daftar pengguna...");
  });

  it("should render fallback text for users with empty name and email", async () => {
    vi.spyOn(usersStore, "asyncSetUsers").mockImplementation(() => Promise.resolve());
    const { wrapper } = renderWithProviders(UsersPage, {
      preloadedState: {
        users: [
          {
            id: 99,
            name: "",
            email: "",
            photo: null,
            created_at: "2024-10-05T02:53:38.000000Z",
          },
        ],
      },
    });

    await new Promise((r) => setTimeout(r, 10));

    expect(wrapper.text()).toContain("Pengguna");
    expect(wrapper.text()).toContain("-");
    expect(wrapper.text()).toContain("ID: #99");
  });

  it("should cover email filter when name is empty during search", async () => {
    vi.spyOn(usersStore, "asyncSetUsers").mockImplementation(() => Promise.resolve());
    const { wrapper } = renderWithProviders(UsersPage, {
      preloadedState: {
        users: [
          { id: 1, name: "", email: "onlyemail@delcom.org", photo: null, created_at: "2024-10-05T00:00:00Z" },
          { id: 2, name: "Budi", email: "budi@delcom.org", photo: null, created_at: "2024-10-05T00:00:00Z" },
        ],
      },
    });

    await new Promise((r) => setTimeout(r, 10));

    const searchInput = wrapper.find('[data-testid="search-user-input"]');
    await searchInput.setValue("onlyemail");

    expect(wrapper.text()).toContain("onlyemail@delcom.org");
    expect(wrapper.text()).not.toContain("Budi");
  });

  it("should cover name filter when email is empty during search", async () => {
    vi.spyOn(usersStore, "asyncSetUsers").mockImplementation(() => Promise.resolve());
    const { wrapper } = renderWithProviders(UsersPage, {
      preloadedState: {
        users: [
          { id: 1, name: "Ahmad", email: "", photo: null, created_at: "2024-10-05T00:00:00Z" },
          { id: 2, name: "Budi", email: "budi@delcom.org", photo: null, created_at: "2024-10-05T00:00:00Z" },
        ],
      },
    });

    await new Promise((r) => setTimeout(r, 10));

    const searchInput = wrapper.find('[data-testid="search-user-input"]');
    await searchInput.setValue("ahmad");

    expect(wrapper.text()).toContain("Ahmad");
    expect(wrapper.text()).not.toContain("Budi");
  });

  it("should cover short-circuit when name matches but email does not", async () => {
    vi.spyOn(usersStore, "asyncSetUsers").mockImplementation(() => Promise.resolve());
    const { wrapper } = renderWithProviders(UsersPage, {
      preloadedState: {
        users: [
          { id: 1, name: "Ahmad Fauzi", email: "zi@delcom.org", photo: null, created_at: "2024-10-05T00:00:00Z" },
          { id: 2, name: "Budi", email: "budi@delcom.org", photo: null, created_at: "2024-10-05T00:00:00Z" },
        ],
      },
    });

    await new Promise((r) => setTimeout(r, 10));

    const searchInput = wrapper.find('[data-testid="search-user-input"]');
    await searchInput.setValue("ahmad");

    expect(wrapper.text()).toContain("Ahmad Fauzi");
    expect(wrapper.text()).not.toContain("Budi");
  });

  it("should render fallback avatar 'U' when user has no photo and no name", async () => {
    vi.spyOn(usersStore, "asyncSetUsers").mockImplementation(() => Promise.resolve());
    const { wrapper } = renderWithProviders(UsersPage, {
      preloadedState: {
        users: [
          {
            id: 88,
            name: "",
            email: "noName@delcom.org",
            photo: null,
            created_at: "2024-10-05T00:00:00Z",
          },
        ],
      },
    });

    await new Promise((r) => setTimeout(r, 10));

    const userCard = wrapper.find('[data-testid="user-card-88"]');
    expect(userCard.exists()).toBe(true);

    const fallbackAvatar = userCard.find("div[aria-hidden='true']");
    expect(fallbackAvatar.exists()).toBe(true);
    expect(fallbackAvatar.text().trim()).toBe("U");
  });

  it("should render alt fallback 'pengguna' when user has photo but no name", async () => {
    vi.spyOn(usersStore, "asyncSetUsers").mockImplementation(() => Promise.resolve());
    const { wrapper } = renderWithProviders(UsersPage, {
      preloadedState: {
        users: [
          {
            id: 77,
            name: "",
            email: "hasPhoto@delcom.org",
            photo: "https://example.com/photo.jpg",
            created_at: "2024-10-05T00:00:00Z",
          },
        ],
      },
    });

    await new Promise((r) => setTimeout(r, 10));

    const userCard = wrapper.find('[data-testid="user-card-77"]');
    expect(userCard.exists()).toBe(true);

    const img = userCard.find("img");
    expect(img.exists()).toBe(true);
    expect(img.attributes("alt")).toContain("pengguna");
  });
});