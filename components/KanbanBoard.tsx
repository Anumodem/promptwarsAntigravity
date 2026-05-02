"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Plus, X, Trash2, Edit3, ChevronDown, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

type Priority = 'low' | 'medium' | 'high';
type Status = 'todo' | 'in-progress' | 'review' | 'done';

interface Task {
  id: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  assignee: string;
  createdAt: string;
}

export const TEAM_MEMBERS = ["Jane Doe", "Alex Smith", "Sarah Connor", "Mike Johnson", "Emily Chen"];

const initialTasks: Task[] = [
  { id: "1", title: "Design System Implementation", description: "Build reusable UI components with consistent design tokens.", status: "todo", priority: "high", assignee: "Sarah Connor", createdAt: new Date().toISOString() },
  { id: "2", title: "Database Schema Migration", description: "Migrate from v2 to v3 schema with zero downtime.", status: "in-progress", priority: "medium", assignee: "Mike Johnson", createdAt: new Date().toISOString() },
  { id: "3", title: "Authentication Flow", description: "Implement OAuth2 with Google and GitHub providers.", status: "review", priority: "high", assignee: "Alex Smith", createdAt: new Date().toISOString() },
  { id: "4", title: "User Profile Settings", description: "Allow users to update avatar, bio, and notification preferences.", status: "done", priority: "low", assignee: "Emily Chen", createdAt: new Date().toISOString() },
  { id: "5", title: "API Rate Limiting", description: "Add rate limiting middleware to protect public endpoints.", status: "todo", priority: "medium", assignee: "Mike Johnson", createdAt: new Date().toISOString() },
  { id: "6", title: "Dashboard Analytics Widget", description: "Build chart components for the analytics dashboard.", status: "in-progress", priority: "low", assignee: "Jane Doe", createdAt: new Date().toISOString() },
];

const columns: { id: Status; title: string; color: string; icon: React.ReactNode }[] = [
  { id: "todo", title: "To Do", color: "bg-slate-400", icon: <AlertCircle size={14} /> },
  { id: "in-progress", title: "In Progress", color: "bg-blue-400", icon: <Clock size={14} /> },
  { id: "review", title: "Review", color: "bg-amber-400", icon: <Edit3 size={14} /> },
  { id: "done", title: "Done", color: "bg-emerald-400", icon: <CheckCircle2 size={14} /> },
];

const priorityConfig = {
  high: { label: 'HIGH', class: 'bg-red-500/15 text-red-500', dot: 'bg-red-500' },
  medium: { label: 'MED', class: 'bg-yellow-500/15 text-yellow-500', dot: 'bg-yellow-500' },
  low: { label: 'LOW', class: 'bg-emerald-500/15 text-emerald-500', dot: 'bg-emerald-500' },
};

const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('');

const assigneeColors: Record<string, string> = {
  "Jane Doe": "from-blue-500 to-purple-500",
  "Alex Smith": "from-green-500 to-emerald-500",
  "Sarah Connor": "from-pink-500 to-rose-500",
  "Mike Johnson": "from-orange-500 to-red-500",
  "Emily Chen": "from-teal-500 to-cyan-500",
};

interface KanbanBoardProps {
  searchQuery: string;
}

export default function KanbanBoard({ searchQuery }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formPriority, setFormPriority] = useState<Priority>("medium");
  const [formAssignee, setFormAssignee] = useState(TEAM_MEMBERS[0]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [statusMenuId, setStatusMenuId] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem('flowsync-tasks');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTasks(parsed);
      } catch (e) {
        setTasks(initialTasks);
      }
    } else {
      setTasks(initialTasks);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('flowsync-tasks', JSON.stringify(tasks));
    }
  }, [tasks, isMounted]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setModalMode(null);
        setDeleteConfirmId(null);
        setExpandedTaskId(null);
        setStatusMenuId(null);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return tasks;
    const q = searchQuery.toLowerCase();
    return tasks.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.assignee.toLowerCase().includes(q) ||
      t.priority.toLowerCase().includes(q)
    );
  }, [tasks, searchQuery]);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination } = result;
    if (source.droppableId !== destination.droppableId || source.index !== destination.index) {
      const newTasks = Array.from(tasks);
      const draggedTaskIndex = newTasks.findIndex(t => t.id === result.draggableId);
      if (draggedTaskIndex > -1) {
        newTasks[draggedTaskIndex] = {
          ...newTasks[draggedTaskIndex],
          status: destination.droppableId as Status,
        };
        setTasks(newTasks);
      }
    }
  };

  const openCreateModal = () => {
    setFormTitle(""); setFormDesc(""); setFormPriority("medium"); setFormAssignee(TEAM_MEMBERS[0]);
    setEditingTask(null); setModalMode('create');
  };

  const openEditModal = (task: Task) => {
    setFormTitle(task.title); setFormDesc(task.description); setFormPriority(task.priority); setFormAssignee(task.assignee);
    setEditingTask(task); setModalMode('edit');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (modalMode === 'create') {
      const newTask: Task = {
        id: Date.now().toString(),
        title: formTitle,
        description: formDesc,
        status: "todo",
        priority: formPriority,
        assignee: formAssignee,
        createdAt: new Date().toISOString(),
      };
      setTasks([...tasks, newTask]);
    } else if (modalMode === 'edit' && editingTask) {
      setTasks(tasks.map(t => t.id === editingTask.id ? { ...t, title: formTitle, description: formDesc, priority: formPriority, assignee: formAssignee } : t));
    }
    setModalMode(null);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));
    setDeleteConfirmId(null);
  };

  const changeStatus = (taskId: string, newStatus: Status) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    setStatusMenuId(null);
  };

  if (!isMounted) return null;

  // Sprint dates calculation (2 weeks)
  const sprintStart = new Date();
  sprintStart.setDate(sprintStart.getDate() - (sprintStart.getDay() === 0 ? 6 : sprintStart.getDay() - 1));
  sprintStart.setHours(0,0,0,0);
  const sprintEnd = new Date(sprintStart);
  sprintEnd.setDate(sprintEnd.getDate() + 13);
  const today = new Date();
  const totalDays = 14;
  const elapsed = Math.max(0, Math.ceil((today.getTime() - sprintStart.getTime()) / (1000*60*60*24)));
  const daysLeft = Math.max(0, totalDays - elapsed);
  const sprintPct = Math.min(100, Math.round((elapsed / totalDays) * 100));

  // Stats
  const stats = {
    total: tasks.length,
    done: tasks.filter(t => t.status === 'done').length,
    high: tasks.filter(t => t.priority === 'high' && t.status !== 'done').length,
  };
  const completionPct = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  return (
    <div className="h-full flex flex-col relative" onClick={() => setStatusMenuId(null)}>
      {/* Board Header */}
      <div className="flex flex-wrap justify-between items-end mb-6 gap-4 shrink-0">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight mb-1">Project Alpha Sprint</h2>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5 bg-secondary px-2 py-1 rounded-md">
              <Calendar size={14} className="text-primary" />
              <span>{sprintStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {sprintEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-secondary px-2 py-1 rounded-md">
              <Clock size={14} className="text-primary" />
              <span className={daysLeft <= 3 ? 'text-destructive font-bold' : ''}>{daysLeft} days remaining</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex flex-col items-end gap-1">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <span>Sprint Progress</span>
              <span>{completionPct}%</span>
            </div>
            <div className="w-48 h-2 bg-secondary rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${completionPct}%` }}
                className="h-full bg-primary"
              />
            </div>
          </div>
          <button onClick={openCreateModal} className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-primary-foreground px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-primary/20 font-semibold text-sm active:scale-95">
            <Plus size={18} />
            Create Task
          </button>
        </div>
      </div>

      {/* Kanban Columns */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-4 flex-1 items-start custom-scrollbar">
          {columns.map((column) => {
            const columnTasks = filteredTasks.filter(t => t.status === column.id);
            return (
              <div key={column.id} className="min-w-[300px] w-[300px] flex flex-col bg-muted/40 p-4 rounded-2xl border border-border max-h-full overflow-hidden">
                <div className="flex items-center justify-between mb-4 shrink-0 px-1">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-lg ${column.color} bg-opacity-20 text-foreground`}>
                      {column.icon}
                    </div>
                    <h3 className="font-bold text-sm tracking-wide">{column.title}</h3>
                  </div>
                  <span className="bg-background/50 border border-border px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                    {columnTasks.length}
                  </span>
                </div>

                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`flex-1 min-h-[150px] rounded-xl transition-all duration-200 overflow-y-auto pr-1 custom-scrollbar ${snapshot.isDraggingOver ? 'bg-primary/5 ring-1 ring-primary/20' : ''}`}
                    >
                      {columnTasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <div 
                              ref={provided.innerRef} 
                              {...provided.draggableProps} 
                              {...provided.dragHandleProps} 
                              className="mb-3 outline-none"
                              style={{ ...provided.draggableProps.style }}
                            >
                              <div className={`glass p-4 rounded-xl cursor-grab active:cursor-grabbing border transition-all duration-200 ${snapshot.isDragging ? 'shadow-2xl ring-2 ring-primary scale-[1.02] rotate-2' : 'hover:border-primary/30 hover:shadow-md'}`}>
                                {/* Card Header */}
                                <div className="flex justify-between items-start mb-3">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1.5 ${priorityConfig[task.priority].class}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${priorityConfig[task.priority].dot}`}></span>
                                    {priorityConfig[task.priority].label}
                                  </span>
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={(e) => { e.stopPropagation(); openEditModal(task); }} className="text-muted-foreground hover:text-primary p-1.5 rounded-lg hover:bg-primary/10 transition-colors">
                                      <Edit3 size={14} />
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(deleteConfirmId === task.id ? null : task.id); }} className="text-muted-foreground hover:text-destructive p-1.5 rounded-lg hover:bg-destructive/10 transition-colors">
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </div>

                                {/* Delete confirmation overlay */}
                                <AnimatePresence>
                                  {deleteConfirmId === task.id && (
                                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                                      className="absolute inset-0 z-10 bg-background/95 rounded-xl flex flex-col items-center justify-center p-4 text-center border border-destructive/20">
                                      <p className="text-xs font-bold mb-3">Delete this task?</p>
                                      <div className="flex gap-2 w-full">
                                        <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-1.5 rounded-lg bg-muted text-[11px] font-bold">Cancel</button>
                                        <button onClick={() => handleDeleteTask(task.id)} className="flex-1 py-1.5 rounded-lg bg-destructive text-white text-[11px] font-bold shadow-lg shadow-destructive/20">Delete</button>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>

                                <h4 className="font-bold text-sm mb-2 leading-snug">{task.title}</h4>
                                
                                {task.description && (
                                  <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                                    {task.description}
                                  </p>
                                )}

                                {/* Card Footer */}
                                <div className="flex items-center justify-between pt-3 border-t border-border mt-auto">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-6 h-6 rounded-full bg-gradient-to-tr ${assigneeColors[task.assignee] || 'from-gray-500 to-gray-600'} flex items-center justify-center text-[9px] font-bold text-white ring-2 ring-background shadow-sm`}>
                                      {getInitials(task.assignee)}
                                    </div>
                                    <span className="text-[11px] font-medium text-muted-foreground">{task.assignee.split(' ')[0]}</span>
                                  </div>

                                  <div className="relative">
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); setStatusMenuId(statusMenuId === task.id ? null : task.id); }}
                                      className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg bg-secondary hover:bg-primary/10 hover:text-primary transition-all"
                                    >
                                      Move <ChevronDown size={12} />
                                    </button>
                                    
                                    <AnimatePresence>
                                      {statusMenuId === task.id && (
                                        <motion.div 
                                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                          animate={{ opacity: 1, y: 0, scale: 1 }}
                                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                          className="absolute right-0 bottom-full mb-2 w-36 glass rounded-xl shadow-2xl border border-border py-1.5 z-50 overflow-hidden"
                                        >
                                          {columns.map(c => (
                                            <button 
                                              key={c.id} 
                                              disabled={c.id === task.status}
                                              onClick={(e) => { e.stopPropagation(); changeStatus(task.id, c.id); }}
                                              className={`w-full text-left px-3 py-2 text-[11px] flex items-center gap-2.5 transition-colors ${c.id === task.status ? 'opacity-30 cursor-not-allowed' : 'hover:bg-primary/10 hover:text-primary'}`}
                                            >
                                              <span className={`w-2 h-2 rounded-full ${c.color}`}></span>
                                              <span className="font-semibold">{c.title}</span>
                                            </button>
                                          ))}
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {/* Modals... (keeping existing ones but with better styling) */}
      <AnimatePresence>
        {modalMode && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setModalMode(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass p-8 rounded-3xl w-full max-w-lg border border-white/20 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">{modalMode === 'create' ? 'New Task' : 'Edit Task'}</h3>
                <button onClick={() => setModalMode(null)} className="text-muted-foreground hover:text-foreground p-2 rounded-full hover:bg-muted transition-colors">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-2 uppercase tracking-widest">Title</label>
                  <input autoFocus type="text" required value={formTitle} onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                    placeholder="E.g., Design onboarding flow" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-2 uppercase tracking-widest">Description</label>
                  <textarea value={formDesc} onChange={(e) => setFormDesc(e.target.value)} rows={3}
                    className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none font-medium"
                    placeholder="Add more context here..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-2 uppercase tracking-widest">Priority</label>
                    <div className="flex gap-2">
                      {(['high', 'medium', 'low'] as Priority[]).map(p => (
                        <button key={p} type="button" onClick={() => setFormPriority(p)}
                          className={`flex-1 py-2.5 rounded-xl border text-[11px] font-bold transition-all ${formPriority === p ? `${priorityConfig[p].class} border-primary` : 'bg-secondary border-border text-muted-foreground hover:border-muted-foreground/30'}`}>
                          {p.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-2 uppercase tracking-widest">Assignee</label>
                    <select value={formAssignee} onChange={e => setFormAssignee(e.target.value)}
                      className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer font-medium">
                      {TEAM_MEMBERS.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 pt-6">
                  <button type="button" onClick={() => setModalMode(null)} className="flex-1 px-6 py-3 rounded-xl bg-muted font-bold text-sm hover:bg-muted/80 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95">
                    {modalMode === 'create' ? 'Add Task' : 'Update Task'}
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
