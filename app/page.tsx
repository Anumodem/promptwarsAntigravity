import React from 'react';
import KanbanBoard from '@/components/KanbanBoard';
import { LayoutDashboard, Users, Settings, Bell, Search, Menu } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 glass border-r border-white/5 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-white/5">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
            FlowSync
          </h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 text-primary font-medium">
            <LayoutDashboard size={20} />
            Dashboard
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
            <Users size={20} />
            Team
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
            <Settings size={20} />
            Settings
          </a>
        </nav>
        
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center font-bold">
              JD
            </div>
            <div>
              <p className="text-sm font-medium">Jane Doe</p>
              <p className="text-xs text-gray-400">Product Manager</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 glass border-b border-white/5 flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-gray-400 hover:text-white">
              <Menu size={20} />
            </button>
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search tasks..." 
                className="bg-surface border border-surface-border rounded-full py-1.5 pl-10 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-colors w-64 text-white"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="relative text-gray-400 hover:text-white transition-colors">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
          </div>
        </header>

        {/* Board Area */}
        <div className="flex-1 overflow-hidden p-6 flex flex-col">
          
          
          <div className="flex-1 overflow-hidden">
             <KanbanBoard />
          </div>
        </div>
      </main>
    </div>
  );
}
