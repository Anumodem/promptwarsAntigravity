"use client";
import React, { useState, useCallback, useMemo } from 'react';
import { Mail, MoreVertical, MessageSquare, Briefcase, Search, UserPlus, X, CheckCircle, Circle, Clock, Calendar, Palmtree, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const memberColors = [
  "from-blue-500 to-purple-500",
  "from-green-500 to-emerald-500",
  "from-pink-500 to-rose-500",
  "from-orange-500 to-red-500",
  "from-teal-500 to-cyan-500",
  "from-violet-500 to-indigo-500",
];

type AvailabilityStatus = 'Available' | 'On Holiday' | 'In Meeting' | 'Ooo';

interface Member {
  id: number;
  name: string;
  role: string;
  email: string;
  tasks: number;
  online: boolean;
  status: AvailabilityStatus;
  color: string;
  joined: string;
  holidayDates?: string;
}

const initialMembers: Member[] = [
  { id: 1, name: "Jane Doe", role: "Product Manager", email: "jane@flowsync.io", tasks: 12, online: true, status: 'Available', color: memberColors[0], joined: "Jan 2024" },
  { id: 2, name: "Alex Smith", role: "Lead Developer", email: "alex@flowsync.io", tasks: 8, online: true, status: 'In Meeting', color: memberColors[1], joined: "Feb 2024" },
  { id: 3, name: "Sarah Connor", role: "UI/UX Designer", email: "sarah@flowsync.io", tasks: 5, online: false, status: 'On Holiday', color: memberColors[2], joined: "Mar 2024", holidayDates: "May 1 - May 10" },
  { id: 4, name: "Mike Johnson", role: "Backend Engineer", email: "mike@flowsync.io", tasks: 15, online: true, status: 'Available', color: memberColors[3], joined: "Jan 2024" },
  { id: 5, name: "Emily Chen", role: "QA Tester", email: "emily@flowsync.io", tasks: 3, online: false, status: 'Ooo', color: memberColors[4], joined: "Apr 2024", holidayDates: "May 5" },
  { id: 6, name: "David Wright", role: "DevOps Engineer", email: "david@flowsync.io", tasks: 7, online: true, status: 'Available', color: memberColors[5], joined: "Dec 2023" },
];

const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('');

const workloadLevel = (tasks: number) => {
  if (tasks >= 12) return { label: 'High', color: 'text-destructive', bg: 'bg-destructive', width: `${Math.min(tasks / 15 * 100, 100)}%` };
  if (tasks >= 7) return { label: 'Medium', color: 'text-yellow-500', bg: 'bg-yellow-500', width: `${tasks / 15 * 100}%` };
  return { label: 'Low', color: 'text-emerald-500', bg: 'bg-emerald-500', width: `${tasks / 15 * 100}%` };
};

const statusStyles: Record<AvailabilityStatus, { bg: string, text: string, icon: any }> = {
  'Available': { bg: 'bg-emerald-500/10', text: 'text-emerald-500', icon: UserCheck },
  'On Holiday': { bg: 'bg-purple-500/10', text: 'text-purple-500', icon: Palmtree },
  'In Meeting': { bg: 'bg-blue-500/10', text: 'text-blue-500', icon: Clock },
  'Ooo': { bg: 'bg-muted', text: 'text-muted-foreground', icon: Circle },
};

export default function TeamView() {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [search, setSearch] = useState('');
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [filter, setFilter] = useState<'all' | 'online' | 'holiday'>('all');

  const filtered = useMemo(() => {
    return members.filter(m => {
      const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.role.toLowerCase().includes(search.toLowerCase());
      if (filter === 'online') return matchSearch && m.online;
      if (filter === 'holiday') return matchSearch && m.status === 'On Holiday';
      return matchSearch;
    });
  }, [members, search, filter]);

  const handleInvite = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newRole.trim()) return;
    const newMember: Member = {
      id: Date.now(),
      name: newName,
      role: newRole,
      email: newEmail,
      tasks: 0,
      online: false,
      status: 'Available',
      color: memberColors[members.length % memberColors.length],
      joined: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    };
    setMembers(prev => [...prev, newMember]);
    setNewName(''); setNewRole(''); setNewEmail('');
    setIsInviteOpen(false);
  }, [newName, newRole, newEmail, members.length]);

  const holidayCount = useMemo(() => members.filter(m => m.status === 'On Holiday').length, [members]);
  const onlineCount = useMemo(() => members.filter(m => m.online).length, [members]);

  return (
    <div className="h-full flex flex-col" role="region" aria-label="Team Directory">
      <header className="shrink-0 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-black tracking-tight mb-1">Team Directory</h2>
            <div className="flex items-center gap-4 text-sm text-muted-foreground font-medium" aria-label="Team statistics">
              <span><span className="text-foreground font-bold">{members.length}</span> Members</span>
              <span className="flex items-center gap-1.5" aria-label={`${onlineCount} members online`}>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true"></span>
                <span className="text-emerald-500 font-bold">{onlineCount}</span> Online
              </span>
              <span className="flex items-center gap-1.5" aria-label={`${holidayCount} members on holiday`}>
                <Palmtree size={14} className="text-purple-500" aria-hidden="true" />
                <span className="text-purple-500 font-bold">{holidayCount}</span> on Holiday
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsInviteOpen(true)}
            aria-label="Add new team member"
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-2xl transition-all shadow-lg shadow-primary/20 font-bold text-sm active:scale-95"
          >
            <UserPlus size={18} aria-hidden="true" />
            Add Member
          </button>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[280px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} aria-hidden="true" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, role or expertise..."
              aria-label="Search members"
              className="w-full bg-secondary border border-border rounded-xl pl-12 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all shadow-sm"
            />
          </div>
          <nav className="flex gap-2 bg-secondary p-1 rounded-xl border border-border" aria-label="Filter members">
            {(['all', 'online', 'holiday'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                aria-pressed={filter === f}
                className={`px-4 py-2 rounded-lg text-xs font-black transition-all capitalize ${filter === f ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {f}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <section className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-4 min-h-0 custom-scrollbar" role="list" aria-label="Team Members Grid">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-6">
          {filtered.map((member, index) => {
            const workload = workloadLevel(member.tasks);
            const StatusIcon = statusStyles[member.status].icon;
            
            return (
              <motion.article
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                key={member.id}
                className="glass p-6 rounded-3xl border border-border hover:border-primary/30 transition-all duration-300 group shadow-sm hover:shadow-xl hover:-translate-y-1"
                role="listitem"
                aria-label={`Team member: ${member.name}`}
              >
                <div className="flex justify-between items-start mb-5">
                  <div className="relative">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-tr ${member.color} flex items-center justify-center text-white font-black text-2xl shadow-xl transform group-hover:rotate-3 transition-transform`}>
                      {getInitials(member.name)}
                    </div>
                    <div className={`absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-full border-4 border-background ${member.online ? 'bg-emerald-500' : 'bg-muted-foreground'}`} title={member.online ? 'Online' : 'Offline'}></div>
                  </div>
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${statusStyles[member.status].bg} ${statusStyles[member.status].text}`}>
                    <StatusIcon size={12} aria-hidden="true" />
                    {member.status}
                  </div>
                </div>

                <div className="mb-5">
                  <h3 className="font-bold text-lg leading-tight mb-1">{member.name}</h3>
                  <p className="text-sm font-semibold text-primary">{member.role}</p>
                  <p className="text-xs text-muted-foreground mt-1 font-medium">{member.email}</p>
                </div>

                {member.status === 'On Holiday' && (
                  <div className="mb-5 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center gap-2.5">
                    <Calendar size={14} className="text-purple-500" aria-hidden="true" />
                    <span className="text-[11px] font-bold text-purple-600">Away: {member.holidayDates || 'TBD'}</span>
                  </div>
                )}

                <div className="mb-6 space-y-2.5" aria-label={`Workload: ${member.tasks} active tasks`}>
                  <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    <span className="flex items-center gap-1.5"><Briefcase size={12} aria-hidden="true" /> Task Load</span>
                    <span className={workload.color}>{member.tasks} active</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2 overflow-hidden border border-border/50">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: workload.width }}
                      className={`h-full rounded-full ${workload.bg}`}
                    ></motion.div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary py-3 rounded-2xl transition-all text-xs font-black border border-primary/10" aria-label={`Ping ${member.name}`}>
                    <MessageSquare size={14} aria-hidden="true" />
                    Ping
                  </button>
                  <button className="flex items-center justify-center w-12 bg-secondary hover:bg-muted border border-border py-3 rounded-2xl transition-all text-foreground" aria-label={`Email ${member.name}`}>
                    <Mail size={14} aria-hidden="true" />
                  </button>
                  <button className="flex items-center justify-center w-12 bg-secondary hover:bg-muted border border-border py-3 rounded-2xl transition-all text-foreground" aria-label="More options">
                    <MoreVertical size={14} aria-hidden="true" />
                  </button>
                </div>
              </motion.article>
            );
          })}
        </div>
      </section>

      <AnimatePresence>
        {isInviteOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="invite-title"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="glass p-8 rounded-[2rem] w-full max-w-md border border-white/20 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 id="invite-title" className="text-2xl font-black">Add New Member</h3>
                <button onClick={() => setIsInviteOpen(false)} aria-label="Close dialog" className="text-muted-foreground hover:text-foreground p-2 rounded-full hover:bg-muted transition-colors">
                  <X size={24} aria-hidden="true" />
                </button>
              </div>
              <form onSubmit={handleInvite} className="space-y-5">
                <div>
                  <label htmlFor="member-name" className="block text-xs font-black text-muted-foreground mb-2.5 uppercase tracking-widest">Full Name</label>
                  <input id="member-name" autoFocus required value={newName} onChange={e => setNewName(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-2xl px-5 py-3.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="Enter full name..." />
                </div>
                <div>
                  <label htmlFor="member-role" className="block text-xs font-black text-muted-foreground mb-2.5 uppercase tracking-widest">Role</label>
                  <input id="member-role" required value={newRole} onChange={e => setNewRole(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-2xl px-5 py-3.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="e.g. Lead Designer" />
                </div>
                <div>
                  <label htmlFor="member-email" className="block text-xs font-black text-muted-foreground mb-2.5 uppercase tracking-widest">Email</label>
                  <input id="member-email" type="email" required value={newEmail} onChange={e => setNewEmail(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-2xl px-5 py-3.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="email@flowsync.io" />
                </div>
                <div className="flex gap-4 pt-6">
                  <button type="button" onClick={() => setIsInviteOpen(false)} className="flex-1 px-6 py-4 rounded-2xl bg-muted font-black text-sm hover:bg-muted/80 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 px-6 py-4 rounded-2xl bg-primary text-white font-black text-sm shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95">
                    Create Member
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
