import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'

export function Layout() {
  return (
    <div className="appShell">
      <aside className="sidebar">
        <div className="sidebarInner">
          <div className="brand">
            <div className="brandTitle">COMP6080 Final｜押题训练场</div>
            <div className="brandSub">
              Vite + React + TypeScript｜Game1 &amp; Game2（共 20 题）
            </div>
          </div>
          <div className="navScroll">
            <Sidebar />
          </div>
        </div>
      </aside>

      <main className="content">
        <div className="contentInner">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

