"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreHorizontal, MessageSquare, Clock, Plus, X } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

type Priority = 'low' | 'medium' | 'high';
type Status = 'todo' | 'in-progress' | 'review' | 'done';

interface Task {
  id: string;
  title: string;
  status: Status;
  priority: Priority;
  comments: number;
}

const initialTasks: Task[] = [
  { id: "1", title: "Design System Implementation", status: "todo", priority: "high", comments: 3 },
  { id: "2", title: "Database Schema Migration", status: "in-progress", priority: "medium", comments: 5 },
  { id: "3", title: "Authentication Flow", status: "review", priority: "high", comments: 12 },
  { id: "4", title: "User Profile Settings", status: "done", priority: "low", comments: 1 },
];

const columns = [
  { id: "todo", title: "To Do" },
  { id: "in-progress", title: "In Progress" },
  { id: "review", title: "Review" },
  { id: "done", title: "Done" },
];

export default function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>("medium");

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem('flowsync-tasks');
    if (saved) {
      try { setTasks(JSON.parse(saved)); } catch (e) { setTasks(initialTasks); }
    } else {
      setTasks(initialTasks);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('flowsync-tasks', JSON.stringify(tasks));
    }
  }, [tasks, isMounted]);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination } = result;

    if (source.droppableId !== destination.droppableId || source.index !== destination.index) {
      const newTasks = Array.from(tasks);
      const draggedTaskIndex = newTasks.findIndex(t => t.id === result.draggableId);
      
      if (draggedTaskIndex > -1) {
        // Update status if moved to another column
        newTasks[draggedTaskIndex].status = destination.droppableId as Status;
        setTasks(newTasks);
      }
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      status: "todo",
      priority: newTaskPriority,
      comments: 0
    };
    setTasks([...tasks, newTask]);
    setNewTaskTitle("");
    setIsModalOpen(false);
  };

  if (!isMounted) return null; // Avoid hydration mismatch

  return (
    <div className="h-full flex flex-col relative">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h2 className="text-2xl font-bold mb-1">Project Alpha Sprint</h2>
          <p className="text-gray-400 text-sm">Organize and manage your team's workflow</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg transition-colors shadow-lg shadow-primary/25"
        >
          <Plus size={18} />
          New Task
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-4 h-full items-start">
          {columns.map((column) => (
            <div key={column.id} className="min-w-[320px] flex-1 flex flex-col h-full bg-surface/30 p-4 rounded-2xl border border-white/5">
              <div className="flex items-center justify-between mb-4 shrink-0">
                <h3 className="font-semibold text-lg">{column.title}</h3>
                <span className="bg-surface px-2 py-1 rounded text-sm text-gray-400 font-medium">
                  {tasks.filter(t => t.status === column.id).length}
                </span>
              </div>
              
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`flex-1 min-h-[150px] transition-colors rounded-xl ${
                      snapshot.isDraggingOver ? 'bg-white/5 ring-1 ring-white/10' : ''
                    }`}
                  >
                    {tasks.filter(t => t.status === column.id).map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="mb-3"
                            style={{
                              ...provided.draggableProps.style,
                            }}
                          >
                            <div
                              className={`glass p-4 rounded-xl cursor-grab active:cursor-grabbing border ${
                                snapshot.isDragging ? 'shadow-2xl border-primary/50 scale-105 z-50' : 'border-white/5 hover:border-white/10'
                              } transition-all duration-200`}
                            >
                              <div className="flex justify-between items-start mb-3">
                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                  task.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                                  task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                  'bg-green-500/20 text-green-400'
                                }`}>
                                  {task.priority.toUpperCase()}
                                </span>
                                <button className="text-gray-400 hover:text-white transition-colors">
                                  <MoreHorizontal size={16} />
                                </button>
                              </div>
                              <h4 className="font-medium mb-4 text-white/90">{task.title}</h4>
                              
                              <div className="flex items-center justify-between text-gray-400 text-sm border-t border-white/5 pt-3 mt-3">
                                <div className="flex items-center gap-1">
                                  <Clock size={14} />
                                  <span>Today</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MessageSquare size={14} />
                                  <span>{task.comments}</span>
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
          ))}
        </div>
      </DragDropContext>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="glass p-6 rounded-2xl w-full max-w-md border border-white/10 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Create New Task</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleAddTask} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Task Title</label>
                  <input
                    type="text"
                    required
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="w-full bg-surface border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                    placeholder="E.g. Fix navigation bug..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as Priority)}
                    className="w-full bg-surface border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer transition-shadow"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
                <div className="pt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-2 rounded-lg bg-surface hover:bg-white/5 border border-white/10 transition-colors font-medium text-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover transition-colors font-medium text-white shadow-lg shadow-primary/20"
                  >
                    Create Task
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
