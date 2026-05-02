"use client";
import React from 'react';
import { Calendar as CalendarIcon, Palmtree, User, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const members = [
  { name: "Sarah Connor", holiday: [1, 2, 3, 4, 5, 10], color: "bg-pink-500" },
  { name: "Emily Chen", holiday: [5, 6, 12, 13, 14], color: "bg-teal-500" },
  { name: "Jane Doe", holiday: [], color: "bg-blue-500" },
  { name: "Alex Smith", holiday: [8, 9], color: "bg-green-500" },
  { name: "Mike Johnson", holiday: [15, 16], color: "bg-orange-500" },
];

export default function CalendarView() {
  const days = Array.from({ length: 14 }, (_, i) => i + 1);
  const today = new Date().getDate();

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tight mb-1">Availability Calendar</h2>
          <p className="text-sm text-muted-foreground font-medium">Track team holidays and sprint availability</p>
        </div>
        <div className="flex items-center gap-2 bg-secondary p-1 rounded-xl border border-border">
          <button className="p-2 hover:bg-background rounded-lg transition-all"><ChevronLeft size={18} /></button>
          <span className="px-4 text-sm font-bold">May 2024</span>
          <button className="p-2 hover:bg-background rounded-lg transition-all"><ChevronRight size={18} /></button>
        </div>
      </div>

      <div className="flex-1 glass rounded-[2rem] border border-border overflow-hidden flex flex-col">
        {/* Calendar Grid Header */}
        <div className="grid grid-cols-[180px_1fr] border-b border-border bg-muted/30">
          <div className="p-4 border-r border-border font-black text-xs uppercase tracking-widest text-muted-foreground">Team Member</div>
          <div className="grid grid-cols-14 h-full">
            {days.map(d => (
              <div key={d} className={`flex flex-col items-center justify-center border-r border-border last:border-0 p-2 ${d === today ? 'bg-primary/5' : ''}`}>
                <span className="text-[10px] font-bold text-muted-foreground uppercase">{['M','T','W','T','F','S','S'][(d-1)%7]}</span>
                <span className={`text-sm font-black mt-0.5 ${d === today ? 'text-primary' : ''}`}>{d}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Calendar Rows */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {members.map((member, i) => (
            <div key={member.name} className="grid grid-cols-[180px_1fr] border-b border-border last:border-0 group hover:bg-muted/10 transition-colors">
              <div className="p-4 border-r border-border flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg ${member.color} flex items-center justify-center text-white font-black text-xs`}>
                  {member.name[0]}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">{member.name}</p>
                  <p className="text-[10px] text-muted-foreground font-medium">{member.holiday.length > 0 ? `${member.holiday.length} days off` : 'Available'}</p>
                </div>
              </div>
              <div className="grid grid-cols-14 h-full relative">
                {days.map(d => {
                  const isHoliday = member.holiday.includes(d);
                  return (
                    <div key={d} className={`border-r border-border last:border-0 relative ${d === today ? 'bg-primary/5' : ''}`}>
                      {isHoliday && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="absolute inset-1 rounded-md bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-500"
                          title="On Holiday"
                        >
                          <Palmtree size={12} />
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center gap-6">
        <div className="flex items-center gap-2 text-xs font-bold">
          <div className="w-4 h-4 rounded bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-500">
            <Palmtree size={10} />
          </div>
          <span>Team Holiday</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold">
          <div className="w-4 h-4 rounded bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
            <Clock size={10} />
          </div>
          <span>Today</span>
        </div>
        <div className="ml-auto text-[10px] font-black text-muted-foreground uppercase tracking-tighter">
          Sprint Alpha Availability View v1.0
        </div>
      </div>
    </div>
  );
}
