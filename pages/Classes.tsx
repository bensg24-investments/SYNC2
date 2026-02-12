
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Plus, Clock, MapPin, Trash2, ChevronLeft, X, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DayOfWeek, ClassSchedule } from '../types';

const ClassesPage: React.FC = () => {
  const { user, addClass, removeClass, editClass } = useApp();
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingClassName, setEditingClassName] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [startTime, setStartTime] = useState('09:00 AM');
  const [endTime, setEndTime] = useState('10:15 AM');
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>([]);

  if (!user) return null;

  const days: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const toggleDay = (day: DayOfWeek) => setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);

  const handleEdit = (cls: ClassSchedule) => {
    setEditingClassName(cls.className);
    setName(cls.className);
    setLocation(cls.location || '');
    setStartTime(cls.startTime);
    setEndTime(cls.endTime);
    setSelectedDays(cls.days);
    setShowAddModal(true);
  };

  const handleSave = async () => {
    const classData: ClassSchedule = {
      className: name,
      location,
      startTime,
      endTime,
      days: selectedDays,
    };
    if (editingClassName) {
      await editClass(editingClassName, classData);
    } else {
      await addClass(classData);
    }
    setShowAddModal(false);
    resetForm();
  };

  const resetForm = () => {
    setName(''); setLocation(''); setStartTime('09:00 AM'); setEndTime('10:15 AM'); setSelectedDays([]); setEditingClassName(null);
  };

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="flex items-center gap-4 mb-10">
        <button onClick={() => navigate(-1)} className="text-[#1a4a5e]"><ChevronLeft size={32} strokeWidth={2.5} /></button>
        <h1 className="text-3xl font-black text-[#1a4a5e]">Schedule</h1>
      </div>

      <div className="space-y-6 mb-24">
        {user.schedule.map(cls => (
          <div key={cls.className} className="bg-white border border-slate-50 p-6 rounded-[32px] shadow-sm relative group">
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-xl font-black text-[#1a4a5e]">{cls.className}</h4>
              <div className="flex items-center gap-3">
                <button onClick={() => handleEdit(cls)} className="text-slate-300 hover:text-[#e67e5f]"><Edit2 size={18} /></button>
                <button onClick={() => removeClass(cls.className)} className="text-slate-200 hover:text-red-400"><Trash2 size={20} /></button>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 text-slate-400 font-bold text-xs">
              <div className="flex items-center gap-1.5"><Clock size={14} /><span>{cls.startTime} - {cls.endTime}</span></div>
              <div className="flex items-center gap-1.5"><MapPin size={14} /><span>{cls.location || 'Campus'}</span></div>
            </div>
            <div className="mt-3 flex gap-1">{cls.days.map(d => <span key={d} className="text-[10px] font-black bg-slate-50 text-slate-400 px-2 py-0.5 rounded-md">{d.toUpperCase()}</span>)}</div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-md px-8 z-40">
        <button onClick={() => { resetForm(); setShowAddModal(true); }} className="w-full bg-[#1e293b] text-white font-black py-5 rounded-[24px] shadow-xl flex items-center justify-center gap-2">
          <Plus size={20} strokeWidth={3} /><span>Add Class</span>
        </button>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-[#1a4a5e]/40 backdrop-blur-sm z-[200] flex items-end justify-center">
          <div className="bg-white w-full max-w-md rounded-t-[48px] p-8 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-10"><h2 className="text-3xl font-black text-[#1a4a5e]">{editingClassName ? 'Edit Class' : 'New Class'}</h2><button onClick={() => setShowAddModal(false)} className="text-slate-400"><X size={24} /></button></div>
            <div className="space-y-6">
              <input type="text" placeholder="Class Name" value={name} onChange={e => setName(e.target.value)} className="w-full py-5 px-6 bg-slate-50 border rounded-2xl font-bold" />
              <input type="text" placeholder="Location" value={location} onChange={e => setLocation(e.target.value)} className="w-full py-5 px-6 bg-slate-50 border rounded-2xl font-bold" />
              <div className="flex gap-2">
                <input type="text" placeholder="Start (e.g. 09:00 AM)" value={startTime} onChange={e => setStartTime(e.target.value)} className="flex-1 py-4 bg-slate-50 border rounded-2xl text-center" />
                <input type="text" placeholder="End (e.g. 10:15 AM)" value={endTime} onChange={e => setEndTime(e.target.value)} className="flex-1 py-4 bg-slate-50 border rounded-2xl text-center" />
              </div>
              <div className="flex flex-wrap gap-2">{days.map(day => (<button key={day} onClick={() => toggleDay(day)} className={`flex-1 py-4 rounded-xl font-black text-[10px] ${selectedDays.includes(day) ? 'bg-[#ff6b6b] text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`}>{day.toUpperCase()}</button>))}</div>
              <button onClick={handleSave} className="w-full py-5 bg-[#1a4a5e] text-white rounded-[24px] font-black uppercase tracking-widest">{editingClassName ? 'Update' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassesPage;
