"use client";
import React, { useState } from 'react';
import KanbanBoard from '@/components/KanbanBoard';
import TeamView from '@/components/TeamView';
import SettingsView from '@/components/SettingsView';
import CalendarView from '@/components/CalendarView';
import { LayoutDashboard, Users, Settings, Bell, Search, Menu, X, Activity, Calendar } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

type Tab = 'dashboard' | 'team' | 'calendar' | 'settings';

interface Notification {
  id: number;
  text: string;
  time: string;
  unread: boolean;
}

const initialNotifications: Notification[] = [
  { id: 1, text: 'Alex moved "Auth Flow" to Review', time: '2m ago', unread: true },
  { id: 2, text: 'Sarah completed "Design System"', time: '15m ago', unread: true },
  { id: 3, text: 'Mike added 2 new tasks to In Progress', time: '1h ago', unread: false },
  { id: 4, text: 'Emily flagged "DB Migration" as high priority', time: '2h ago', unread: false },
  { id: 5, text: 'Jane created sprint "Alpha v2"', time: '5h ago', unread: false },
];

const navItems: { id: Tab; icon: any; label: string; badge?: string }[] = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'team', icon: Users, label: 'Team Members' },
  { id: 'calendar', icon: Calendar, label: 'Availability' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const markOneRead = (id: number) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, unread: false } : n));
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground transition-colors duration-300">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`w-72 glass border-r border-border flex flex-col shrink-0 fixed md:relative inset-y-0 left-0 z-40 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-8 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-xl shadow-primary/30">
              <span className="text-white font-black text-xl">F</span>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter leading-none">FlowSync</h1>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">Enterprise Plan</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-muted-foreground hover:text-foreground p-2 rounded-full hover:bg-secondary transition-all">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-5 space-y-2 overflow-y-auto custom-scrollbar">
          <p className="px-4 pb-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Main Menu</p>
          {navItems.map(item => (
            <button key={item.id}
              onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all text-left text-sm font-bold ${activeTab === item.id ? 'bg-primary text-primary-foreground shadow-2xl shadow-primary/30 scale-[1.02]' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'}`}>
              <item.icon size={22} strokeWidth={activeTab === item.id ? 2.5 : 2} />
              {item.label}
              {item.badge && <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full font-black ${activeTab === item.id ? 'bg-white/20 text-white' : 'bg-primary/20 text-primary'}`}>{item.badge}</span>}
            </button>
          ))}
          
          <div className="pt-6 mt-6 border-t border-border">
            <p className="px-4 pb-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Insights</p>
            <button className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-all text-left text-sm font-bold group">
              <Activity size={22} className="group-hover:text-primary transition-colors" />
              Real-time Analytics
              <span className="ml-auto text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 rounded-full font-black">Beta</span>
            </button>
          </div>
        </nav>

        {/* User profile */}
        <div className="p-5 border-t border-border">
          <div className="flex items-center gap-4 p-4 rounded-3xl hover:bg-secondary transition-all cursor-pointer group bg-muted/20">
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center font-black text-white text-sm shadow-lg group-hover:scale-105 transition-transform">
                JD
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-4 border-background rounded-full"></div>
            </div>
            <div className="text-left min-w-0">
              <p className="text-sm font-black truncate">Jane Doe</p>
              <p className="text-[11px] text-muted-foreground truncate font-bold">Product Manager</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-20 glass border-b border-border flex items-center justify-between px-8 z-20 shrink-0">
          <div className="flex items-center gap-6">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden text-muted-foreground hover:text-foreground p-2.5 rounded-xl hover:bg-secondary transition-colors">
              <Menu size={22} />
            </button>
            <div className="relative hidden sm:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Find tasks, members, or documents..."
                className="bg-secondary border border-border rounded-2xl py-2.5 pl-12 pr-6 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all w-80 focus:w-[400px] font-bold shadow-sm" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-secondary rounded-2xl border border-border">
              <div className="flex -space-x-2">
                {[1,2,3].map(i => (
                  <div key={i} className={`w-7 h-7 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-black`}>
                    {i}
                  </div>
                ))}
              </div>
              <span className="text-xs font-black text-muted-foreground">8 Team members active</span>
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-3 rounded-2xl transition-all ${showNotifications ? 'bg-primary text-primary-foreground shadow-2xl shadow-primary/30 scale-110' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'}`}>
                <Bell size={22} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-6 h-6 bg-destructive rounded-full text-[10px] font-black text-white flex items-center justify-center ring-4 ring-background animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                    <motion.div initial={{ opacity: 0, y: 15, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 15, scale: 0.95 }}
                      className="absolute right-0 top-full mt-4 w-96 glass border border-border rounded-[2rem] shadow-2xl overflow-hidden z-50">
                      <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-secondary/30">
                        <span className="font-black text-sm">Notifications Feed</span>
                        {unreadCount > 0 && (
                          <button onClick={markAllRead} className="text-[11px] text-primary hover:underline font-black uppercase tracking-wider">
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                        {notifications.map(n => (
                          <div key={n.id}
                            onClick={() => markOneRead(n.id)}
                            className={`px-6 py-5 hover:bg-secondary transition-colors border-b border-border last:border-0 flex items-start gap-4 cursor-pointer ${n.unread ? 'bg-primary/5' : ''}`}>
                            <span className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${n.unread ? 'bg-primary animate-pulse' : 'bg-muted-foreground/30'}`}></span>
                            <div className="min-w-0">
                              <p className={`text-sm leading-snug font-bold ${n.unread ? 'text-foreground' : 'text-muted-foreground'}`}>{n.text}</p>
                              <p className="text-[11px] text-muted-foreground mt-1.5 font-black uppercase tracking-tighter opacity-70">{n.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      {notifications.length === 0 && (
                        <div className="px-6 py-12 text-center text-muted-foreground text-sm font-bold">Workspace is quiet...</div>
                      )}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="h-full"
            >
              {activeTab === 'dashboard' && <KanbanBoard searchQuery={searchQuery} />}
              {activeTab === 'team' && <TeamView />}
              {activeTab === 'calendar' && <CalendarView />}
              {activeTab === 'settings' && <SettingsView />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
