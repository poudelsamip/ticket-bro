import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import type { ApiResponse, Pagination } from "@/types";
import AdminLayout from "./AdminLayout";

type UserRole = "ADMIN" | "ORGANIZER" | "STAFF" | "USER";

interface AdminUser {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  role: UserRole;
  createdAt: string;
  organizer: { orgName: string } | null;
  _count: { tickets: number; orders: number };
}

const ROLE_COLORS: Record<UserRole, string> = {
  ADMIN: "admin-badge--purple",
  ORGANIZER: "admin-badge--blue",
  STAFF: "admin-badge--amber",
  USER: "admin-badge--gray",
};

const ROLE_OPTIONS: UserRole[] = ["ADMIN", "ORGANIZER", "STAFF", "USER"];

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (roleFilter) params.set("role", roleFilter);
    if (search) params.set("search", search);

    api
      .get<ApiResponse<{ users: AdminUser[]; pagination: Pagination }>>(
        `/admin/users?${params}`
      )
      .then((r) => {
        setUsers(r.data.data.users);
        setPagination(r.data.data.pagination);
      })
      .catch(() => setError("Failed to load users."))
      .finally(() => setLoading(false));
  }, [page, roleFilter, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Users</h1>
        <p className="admin-page-sub">Browse and filter all registered users</p>
      </div>

      {/* Filters */}
      <div className="admin-filters">
        <form onSubmit={handleSearch} className="admin-filters__search">
          <input
            type="text"
            id="users-search"
            placeholder="Search by name or email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="admin-input"
          />
          <button type="submit" className="admin-btn admin-btn--primary">
            Search
          </button>
          {search && (
            <button
              type="button"
              className="admin-btn admin-btn--ghost"
              onClick={() => {
                setSearch("");
                setSearchInput("");
                setPage(1);
              }}
            >
              Clear
            </button>
          )}
        </form>

        <select
          id="users-role-filter"
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          className="admin-select"
        >
          <option value="">All Roles</option>
          {ROLE_OPTIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="admin-loading">
          <div className="admin-spinner" />
        </div>
      )}
      {error && <p className="admin-error">{error}</p>}

      {!loading && !error && (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Org</th>
                  <th>Phone</th>
                  <th>Tickets / Orders</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="admin-table__empty">
                      No users found.
                    </td>
                  </tr>
                )}
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="admin-table__main-cell">
                        <p className="admin-table__title">{u.fullName ?? "—"}</p>
                        <p className="admin-table__sub">{u.email}</p>
                      </div>
                    </td>
                    <td>
                      <span className={`admin-badge ${ROLE_COLORS[u.role]}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>{u.organizer?.orgName ?? "—"}</td>
                    <td>{u.phone ?? "—"}</td>
                    <td>
                      <p>{u._count.tickets} tickets</p>
                      <p className="admin-table__sub">{u._count.orders} orders</p>
                    </td>
                    <td>{fmtDate(u.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="admin-pagination">
              <button
                className="admin-btn admin-btn--ghost"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                ← Prev
              </button>
              <span className="admin-pagination__info">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                className="admin-btn admin-btn--ghost"
                disabled={page === pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </AdminLayout>
  );
}
