"use client";
import React, { useState, useEffect } from 'react';
import { Moon, Sun, Volume2, VolumeX, Trash2, Save, CheckCircle, Monitor } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SettingsView() {
  const [theme, setTheme] = useState('dark');
  const [projectName, setProjectName] = useState('Project Alpha Sprint');
  const [notifications, setNotifications] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    setTheme(currentTheme);
    
    const stored = localStorage.getItem('flowsync-settings');
    if (stored) {
      try {
        const s = JSON.parse(stored);
        if (s.projectName) setProjectName(s.projectName);
        if (s.notifications !== undefined) setNotifications(s.notifications);
      } catch {}
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('flowsync-theme', next);
  };

  const handleSave = () => {
    localStorage.setItem('flowsync-settings', JSON.stringify({ projectName, notifications }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    // In a real app, this might trigger a context update or API call
  };

  const handleClearData = () => {
    if (confirm('This will reset all tasks and settings permanently. Are you sure?')) {
      localStorage.removeItem('flowsync-tasks');
      localStorage.removeItem('flowsync-settings');
      localStorage.removeItem('flowsync-theme');
      window.location.reload();
    }
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-1">Settings</h2>
        <p className="text-sm text-muted-foreground">Manage your workspace preferences</p>
      </div>

      <div className="space-y-6">
        {/* Appearance */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="glass p-6 rounded-2xl shadow-sm">
          <h3 className="font-semibold text-sm mb-4 uppercase tracking-wider text-muted-foreground">Appearance</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
              </div>
              <div>
                <p className="text-sm font-medium">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</p>
                <p className="text-xs text-muted-foreground">Switch between light and dark theme</p>
              </div>
            </div>
            <button onClick={toggleTheme}
              className={`w-12 h-6 rounded-full transition-colors relative ${theme === 'dark' ? 'bg-primary' : 'bg-muted'}`}>
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-transform ${theme === 'dark' ? 'left-[26px]' : 'left-1'}`} />
            </button>
          </div>
        </motion.div>

        {/* Workspace */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass p-6 rounded-2xl shadow-sm">
          <h3 className="font-semibold text-sm mb-4 uppercase tracking-wider text-muted-foreground">Workspace</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Project Name</label>
              <input type="text" value={projectName} onChange={e => setProjectName(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  {notifications ? <Volume2 size={20} /> : <VolumeX size={20} />}
                </div>
                <div>
                  <p className="text-sm font-medium">Notifications</p>
                  <p className="text-xs text-muted-foreground">Show activity and task alerts</p>
                </div>
              </div>
              <button onClick={() => setNotifications(!notifications)}
                className={`w-12 h-6 rounded-full transition-colors relative ${notifications ? 'bg-primary' : 'bg-muted'}`}>
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-transform ${notifications ? 'left-[26px]' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Danger Zone */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass p-6 rounded-2xl border border-destructive/20 bg-destructive/5 shadow-sm">
          <h3 className="font-semibold text-sm mb-4 text-destructive uppercase tracking-wider">Danger Zone</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Reset All Data</p>
              <p className="text-xs text-muted-foreground">Clear all tasks, settings, and history permanently</p>
            </div>
            <button onClick={handleClearData}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors text-sm font-medium">
              <Trash2 size={16} /> Reset
            </button>
          </div>
        </motion.div>

        {/* Save */}
        <div className="flex justify-end pt-4">
          <button onClick={handleSave}
            className={`flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-sm transition-all shadow-lg ${saved ? 'bg-green-500 shadow-green-500/20 text-white' : 'bg-primary hover:bg-primary/90 shadow-primary/20 text-white'}`}>
            {saved ? <><CheckCircle size={18} /> Saved Successfully</> : <><Save size={18} /> Save Preferences</>}
          </button>
        </div>
      </div>
    </div>
  );
}
