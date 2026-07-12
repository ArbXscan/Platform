import { Outlet } from "react-router-dom"
import { Sidebar } from "./Sidebar"

/**
 * Shared shell for every /app/* route. Rendered once by app/router.tsx;
 * individual pages (pages/dashboard, pages/token, ...) only render their own content.
 */
export function AppLayout() {
  return (
    <div className="flex min-h-screen text-white">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
    </div>
  )
}
