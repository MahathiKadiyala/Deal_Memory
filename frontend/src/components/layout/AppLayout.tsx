import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { AddInteractionModal } from '../deals/AddInteractionModal'

export const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isAddInteractionOpen, setIsAddInteractionOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Dark Navy Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Topbar */}
        <Topbar
          onMenuClick={() => setSidebarOpen(true)}
          onOpenAddInteraction={() => setIsAddInteractionOpen(true)}
        />

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet context={{ openAddInteraction: () => setIsAddInteractionOpen(true) }} />
        </main>
      </div>

      {/* Global Add Interaction Modal */}
      <AddInteractionModal
        isOpen={isAddInteractionOpen}
        onClose={() => setIsAddInteractionOpen(false)}
      />
    </div>
  )
}
