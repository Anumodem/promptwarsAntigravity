"use client";
import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
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
  { id: "todo", title: "To Do", color: "bg-slate-400", icon: <AlertCircle size={14} aria-hidden="true" /> },
  { id: "in-progress", title: "In Progress", color: "bg-blue-400", icon: <Clock size={14} aria-hidden="true" /> },
  { id: "review", title: "Review", color: "bg-amber-400", icon: <Edit3 size={14} aria-hidden="true" /> },
  { id: "done", title: "Done", color: "bg-emerald-400", icon: <CheckCircle2 size={14} aria-hidden="true" /> },
];

const priorityConfig: Record<Priority, { label: string; class: string; dot: string }> = {
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

interface TaskCardProps {
  task: Task;
  index: number;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onChangeStatus: (id: string, status: Status) => void;
  statusMenuId: string | null;
  setStatusMenuId: (id: string | null) => void;
  deleteConfirmId: string | null;
  setDeleteConfirmId: (id: string | null) => void;
}

// Optimized Task Card Component
const TaskCard = memo(({ task, index, onEdit, onDelete, onChangeStatus, statusMenuId, setStatusMenuId, deleteConfirmId, setDeleteConfirmId }: TaskCardProps) => {
  return (
    <Draggable key={task.id} draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div 
          ref={provided.innerRef} 
          {...provided.draggableProps} 
          {...provided.dragHandleProps} 
          className="mb-4 outline-none"
          style={{ ...provided.draggableProps.style }}
          role="listitem"
          aria-label={`Task: ${task.title}`}
        >
          <div className={`glass p-5 rounded-2xl cursor-grab active:cursor-grabbing border-2 transition-all duration-300 ${snapshot.isDragging ? 'shadow-2xl ring-4 ring-primary/20 scale-[1.03] rotate-1 z-50 border-primary' : 'hover:border-primary/40 hover:shadow-lg border-transparent'}`}>
            <div className="flex justify-between items-start mb-4">
              <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg flex items-center gap-1.5 uppercase tracking-widest ${priorityConfig[task.priority].class}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${priorityConfig[task.priority].dot}`} aria-hidden="true"></span>
                {priorityConfig[task.priority].label}
              </span>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => { e.stopPropagation(); onEdit(task); }} className="text-muted-foreground hover:text-primary p-2 rounded-xl hover:bg-primary/10 transition-colors" aria-label="Edit Task">
                  <Edit3 size={14} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(deleteConfirmId === task.id ? null : task.id); }} className="text-muted-foreground hover:text-destructive p-2 rounded-xl hover:bg-destructive/10 transition-colors" aria-label="Delete Task">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <AnimatePresence>
              {deleteConfirmId === task.id && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute inset-0 z-20 bg-background/95 rounded-2xl flex flex-col items-center justify-center p-5 text-center border-2 border-destructive/20 backdrop-blur-md">
                  <p className="text-sm font-black mb-4">Delete this task?</p>
                  <div className="flex gap-3 w-full">
                    <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-2.5 rounded-xl bg-muted font-bold text-xs" aria-label="Cancel deletion">Cancel</button>
                    <button onClick={() => onDelete(task.id)} className="flex-1 py-2.5 rounded-xl bg-destructive text-white font-bold text-xs shadow-lg shadow-destructive/20" aria-label="Confirm deletion">Delete</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <h4 className="font-bold text-sm mb-2.5 leading-snug">{task.title}</h4>
            
            {task.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mb-5 leading-relaxed font-medium">
                {task.description}
              </p>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
              <div className="flex items-center gap-2.5" aria-label={`Assigned to ${task.assignee}`}>
                <div className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${assigneeColors[task.assignee] || 'from-gray-500 to-gray-600'} flex items-center justify-center text-[10px] font-black text-white ring-2 ring-background shadow-md`}>
                  {getInitials(task.assignee)}
                </div>
                <span className="text-xs font-bold text-muted-foreground">{task.assignee.split(' ')[0]}</span>
              </div>

              <div className="relative">
                <button 
                  onClick={(e) => { e.stopPropagation(); setStatusMenuId(statusMenuId === task.id ? null : task.id); }}
                  aria-expanded={statusMenuId === task.id}
                  aria-haspopup="listbox"
                  className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl bg-secondary hover:bg-primary hover:text-white transition-all shadow-sm"
                >
                  Move <ChevronDown size={12} aria-hidden="true" />
                </button>
                
                <AnimatePresence>
                  {statusMenuId === task.id && (
                    <motion.div 
                      initial={{ opacity: 0, y: 12, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 12, scale: 0.95 }}
                      className="absolute right-0 bottom-full mb-3 w-44 glass rounded-2xl shadow-2xl border border-border py-2 z-[60] max-h-48 overflow-y-auto custom-scrollbar"
                      role="listbox"
                    >
                      <p className="px-3 pb-1.5 text-[9px] font-black text-muted-foreground uppercase tracking-widest border-b border-border/50 mb-1" aria-hidden="true">Set Status</p>
                      {columns.map(c => (
                        <button 
                          key={c.id} 
                          role="option"
                          aria-selected={c.id === task.status}
                          disabled={c.id === task.status}
                          onClick={(e) => { e.stopPropagation(); onChangeStatus(task.id, c.id); }}
                          className={`w-full text-left px-3 py-2.5 text-[10px] flex items-center gap-3 transition-all ${c.id === task.status ? 'opacity-30 cursor-not-allowed bg-muted/20' : 'hover:bg-primary/10 hover:text-primary font-bold'}`}
                        >
                          <span className={`w-2 h-2 rounded-full ${c.color}`} aria-hidden="true"></span>
                          <span>{c.title}</span>
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
  );
});

TaskCard.displayName = 'TaskCard';

export default function KanbanBoard({ searchQuery }: { searchQuery: string }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formPriority, setFormPriority] = useState<Priority>("medium");
  const [formAssignee, setFormAssignee] = useState(TEAM_MEMBERS[0]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [statusMenuId, setStatusMenuId] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem('flowsync-tasks');
    if (saved) {
      try {
        setTasks(JSON.parse(saved));
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

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setModalMode(null);
      setDeleteConfirmId(null);
      setStatusMenuId(null);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return tasks;
    const q = searchQuery.toLowerCase();
    return tasks.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.assignee.toLowerCase().includes(q)
    );
  }, [tasks, searchQuery]);

  const onDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;
    const { source, destination } = result;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    setTasks(prev => {
      const newTasks = Array.from(prev);
      const draggedTaskIndex = newTasks.findIndex(t => t.id === result.draggableId);
      if (draggedTaskIndex > -1) {
        newTasks[draggedTaskIndex] = {
          ...newTasks[draggedTaskIndex],
          status: destination.droppableId as Status,
        };
      }
      return newTasks;
    });
  }, []);

  const changeStatus = useCallback((taskId: string, newStatus: Status) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    setStatusMenuId(null);
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    setDeleteConfirmId(null);
  }, []);

  const openEditModal = useCallback((task: Task) => {
    setFormTitle(task.title);
    setFormDesc(task.description);
    setFormPriority(task.priority);
    setFormAssignee(task.assignee);
    setEditingTask(task);
    setModalMode('edit');
  }, []);

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
      setTasks(prev => [...prev, newTask]);
    } else if (modalMode === 'edit' && editingTask) {
      setTasks(prev => prev.map(t => t.id === editingTask.id ? { ...t, title: formTitle, description: formDesc, priority: formPriority, assignee: formAssignee } : t));
    }
    setModalMode(null);
  };

  if (!isMounted) return null;

  const stats = {
    total: tasks.length,
    done: tasks.filter(t => t.status === 'done').length,
  };
  const completionPct = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  return (
    <div className="h-full flex flex-col relative" onClick={() => setStatusMenuId(null)} role="region" aria-label="Kanban Board">
      <div className="flex flex-wrap justify-between items-start mb-8 gap-6 shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-3xl font-black tracking-tighter">Project Sprint Alpha</h2>
            <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider" role="status">Active</span>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden lg:flex flex-col items-end gap-2" aria-label={`Sprint progress: ${completionPct}%`}>
            <div className="flex items-center gap-3 text-[11px] font-black text-muted-foreground uppercase tracking-widest">
              <span>Overall Completion</span>
              <span className="text-foreground">{completionPct}%</span>
            </div>
            <div className="w-64 h-2.5 bg-secondary rounded-full overflow-hidden border border-border">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${completionPct}%` }}
                className="h-full bg-gradient-to-r from-primary to-purple-500"
              />
            </div>
          </div>
          <button onClick={() => setModalMode('create')} className="flex items-center gap-2.5 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3.5 rounded-2xl transition-all shadow-xl shadow-primary/20 font-black text-sm active:scale-95 group" aria-label="Add New Task">
            <Plus size={20} className="group-hover:rotate-90 transition-transform" />
            Add New Task
          </button>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-4 flex-1 items-start custom-scrollbar" role="list" aria-label="Kanban Columns">
          {columns.map((column) => {
            const columnTasks = filteredTasks.filter(t => t.status === column.id);
            return (
              <div key={column.id} className="min-w-[320px] w-[320px] flex flex-col bg-muted/30 p-5 rounded-[2rem] border border-border h-full overflow-hidden" role="listitem">
                <div className="flex items-center justify-between mb-5 shrink-0 px-2">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${column.color} bg-opacity-20 text-foreground`} aria-hidden="true">
                      {column.icon}
                    </div>
                    <h3 className="font-black text-sm uppercase tracking-widest">{column.title}</h3>
                  </div>
                  <span className="bg-background/80 border border-border px-3 py-1 rounded-full text-[10px] font-black shadow-sm" aria-label={`${columnTasks.length} tasks`}>
                    {columnTasks.length}
                  </span>
                </div>

                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`flex-1 min-h-[150px] rounded-2xl transition-all duration-300 overflow-y-auto pr-1 custom-scrollbar ${snapshot.isDraggingOver ? 'bg-primary/5 ring-2 ring-primary/10' : ''}`}
                      role="list"
                      aria-label={`${column.title} column`}
                    >
                      {columnTasks.map((task, index) => (
                        <TaskCard 
                          key={task.id} 
                          task={task} 
                          index={index} 
                          onEdit={openEditModal}
                          onDelete={deleteTask}
                          onChangeStatus={changeStatus}
                          statusMenuId={statusMenuId}
                          setStatusMenuId={setStatusMenuId}
                          deleteConfirmId={deleteConfirmId}
                          setDeleteConfirmId={setDeleteConfirmId}
                        />
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

      <AnimatePresence>
        {modalMode && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setModalMode(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            role="dialog"
            aria-modal="true"
            aria-label={modalMode === 'create' ? 'Create New Task' : 'Update Task Details'}
          >
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass p-10 rounded-[3rem] w-full max-w-xl border border-white/20 shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-3xl font-black tracking-tighter">{modalMode === 'create' ? 'Create New Task' : 'Update Task Details'}</h3>
                <button onClick={() => setModalMode(null)} className="text-muted-foreground hover:text-foreground p-2.5 rounded-full hover:bg-muted transition-colors" aria-label="Close modal">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-muted-foreground mb-2.5 uppercase tracking-[0.2em]">Task Title</label>
                  <input autoFocus type="text" required value={formTitle} onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-sm"
                    placeholder="E.g., Finalize design system" aria-label="Task Title" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-muted-foreground mb-2.5 uppercase tracking-[0.2em]">Detailed Description</label>
                  <textarea value={formDesc} onChange={(e) => setFormDesc(e.target.value)} rows={4}
                    className="w-full bg-secondary border border-border rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none shadow-sm"
                    placeholder="Provide context for the team..." aria-label="Detailed Description" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-muted-foreground mb-2.5 uppercase tracking-[0.2em]">Priority Level</label>
                    <div className="flex gap-2.5" role="radiogroup" aria-label="Priority Level">
                      {(['high', 'medium', 'low'] as Priority[]).map(p => (
                        <button key={p} type="button" onClick={() => setFormPriority(p)}
                          role="radio" aria-checked={formPriority === p}
                          className={`flex-1 py-3 rounded-2xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${formPriority === p ? `${priorityConfig[p].class} border-primary shadow-lg scale-105` : 'bg-secondary border-transparent text-muted-foreground hover:border-border'}`}>
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-muted-foreground mb-2.5 uppercase tracking-[0.2em]">Team Assignee</label>
                    <select value={formAssignee} onChange={e => setFormAssignee(e.target.value)}
                      className="w-full bg-secondary border border-border rounded-2xl px-5 py-3.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer shadow-sm"
                      aria-label="Select Team Assignee">
                      {TEAM_MEMBERS.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-4 pt-8">
                  <button type="button" onClick={() => setModalMode(null)} className="flex-1 px-6 py-4 rounded-2xl bg-muted font-black text-sm uppercase tracking-widest hover:bg-muted/80 transition-colors" aria-label="Cancel task creation">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 px-6 py-4 rounded-2xl bg-primary text-white font-black text-sm uppercase tracking-widest shadow-2xl shadow-primary/30 hover:bg-primary/90 transition-all active:scale-95">
                    {modalMode === 'create' ? 'Add Task' : 'Save Changes'}
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
