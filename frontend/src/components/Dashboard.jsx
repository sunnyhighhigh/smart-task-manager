import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, Search, Trash2, Edit2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000/api`;

function Dashboard({ token }) {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [search, setSearch] = useState('');
  
  const [formData, setFormData] = useState({
    title: 'Para-Educator', description: '', category: 'Work', priority: 'Medium', status: 'Pending',
    due_date: '', school_district: '', school_name: '', start_time: '', stop_time: '', start_time_2: '', stop_time_2: '', substitute_name: ''
  });

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const fetchData = async () => {
    try {
      const [tasksRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/tasks?search=${search}`, authHeader),
        axios.get(`${API_URL}/dashboard`, authHeader)
      ]);
      setTasks(tasksRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTaskId) {
        await axios.put(`${API_URL}/tasks/${editingTaskId}`, formData, authHeader);
      } else {
        await axios.post(`${API_URL}/tasks`, formData, authHeader);
      }
      setIsModalOpen(false);
      setEditingTaskId(null);
      setFormData({ title: 'Para-Educator', description: '', category: 'Work', priority: 'Medium', status: 'Pending', due_date: '', school_district: '', school_name: '', start_time: '', stop_time: '', start_time_2: '', stop_time_2: '', substitute_name: '' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/tasks/${id}`, authHeader);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (task) => {
    setEditingTaskId(task.TASK_ID);
    setFormData({
      title: task.TITLE || '',
      description: task.DESCRIPTION || '',
      category: task.CATEGORY || '',
      priority: task.PRIORITY || '',
      status: task.STATUS || 'Pending',
      due_date: task.DUE_DATE ? new Date(task.DUE_DATE).toISOString().split('T')[0] : '',
      school_district: task.SCHOOL_DISTRICT || '',
      school_name: task.SCHOOL_NAME || '',
      start_time: task.START_TIME || '',
      stop_time: task.STOP_TIME || '',
      start_time_2: task.START_TIME_2 || '',
      stop_time_2: task.STOP_TIME_2 || '',
      substitute_name: task.SUBSTITUTE_NAME || ''
    });
    setIsModalOpen(true);
  };

  const calculateTotalHours = (start1, stop1, start2, stop2) => {
    let totalMinutes = 0;
    try {
      if (start1 && stop1) {
        const [h1, m1] = start1.split(':').map(Number);
        const [h2, m2] = stop1.split(':').map(Number);
        totalMinutes += (h2 * 60 + m2) - (h1 * 60 + m1);
      }
      if (start2 && stop2) {
        const [h3, m3] = start2.split(':').map(Number);
        const [h4, m4] = stop2.split(':').map(Number);
        totalMinutes += (h4 * 60 + m4) - (h3 * 60 + m3);
      }
      if (totalMinutes <= 0) return null;
      const hours = Math.floor(totalMinutes / 60);
      const mins = totalMinutes % 60;
      return `${hours}h ${mins > 0 ? mins + 'm' : ''}`.trim();
    } catch (e) {
      return null;
    }
  };

  return (
    <div>


      {/* Task Controls */}
      <div className="task-controls">
        <div style={{ flex: 1 }}>
          <select 
            className="glass-input" 
            style={{ marginBottom: 0 }} 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          >
            <option value="">All Districts</option>
            <option value="CVUSD">CVUSD</option>
            <option value="SLZUSD">SLZUSD</option>
          </select>
        </div>
        <button className="glass-button" style={{ width: 'auto', display: 'flex', gap: '0.5rem', alignItems: 'center' }} onClick={() => {
          setEditingTaskId(null);
          setFormData({ title: 'Para-Educator', description: '', category: '', priority: 'Medium', status: 'Pending', due_date: '', school_district: '', school_name: '', start_time: '', stop_time: '', start_time_2: '', stop_time_2: '', substitute_name: '' });
          setIsModalOpen(true);
        }}>
          <PlusCircle size={20} /> Add Task
        </button>
      </div>

      {/* Task List */}
      <div className="task-list">
        {tasks.map(task => (
          <div key={task.TASK_ID} className="glass-container task-item">
            <div style={{ flex: 1 }}>
              <div className="task-details" style={{ marginTop: '0.5rem' }}>
                {task.DUE_DATE && <span><strong>Date:</strong> {new Date(task.DUE_DATE).toLocaleDateString('en-US', { timeZone: 'UTC' })}</span>}
                {task.SCHOOL_DISTRICT && <span><strong>District:</strong> {task.SCHOOL_DISTRICT}</span>}
                {task.SCHOOL_NAME && <span><strong>School:</strong> {task.SCHOOL_NAME}</span>}
                {task.SUBSTITUTE_NAME && <span><strong>Substitute:</strong> {task.SUBSTITUTE_NAME}</span>}
                {task.CATEGORY && <span><strong>Work Type:</strong> {task.CATEGORY}</span>}
                {task.START_TIME && <span><strong>Morning Shift:</strong> {task.START_TIME} - {task.STOP_TIME}</span>}
                {task.START_TIME_2 && <span><strong>Afternoon Shift:</strong> {task.START_TIME_2} - {task.STOP_TIME_2}</span>}
                {(task.START_TIME || task.START_TIME_2) && <span><strong>Total Hours Worked:</strong> {calculateTotalHours(task.START_TIME, task.STOP_TIME, task.START_TIME_2, task.STOP_TIME_2) || '0h'}</span>}
              </div>
            </div>
            
            <div className="task-actions" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
              <button onClick={() => handleEdit(task)} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <Edit2 size={16} />
                <span style={{ fontSize: '0.8rem' }}>Edit</span>
              </button>
              <button onClick={() => handleDelete(task.TASK_ID)} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}>
                <Trash2 size={16} />
                <span style={{ fontSize: '0.8rem' }}>Delete</span>
              </button>
            </div>
          </div>
        ))}
        {tasks.length === 0 && <div className="glass-container" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No tasks found. Create one to get started!</div>}
      </div>

      {/* Create Task Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 50, padding: '1rem' }}>
          <div className="glass-container" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', background: 'white' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>{editingTaskId ? "Edit Task" : "Create Paraprofessional Task"}</h2>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              
              <div style={{ gridColumn: 'span 2' }}>
                <label>Date</label>
                <input type="date" className="glass-input" value={formData.due_date} onChange={e => setFormData({...formData, due_date: e.target.value})} />
              </div>

              <div>
                <label>School District</label>
                <select className="glass-input" value={formData.school_district} onChange={e => setFormData({...formData, school_district: e.target.value})}>
                  <option value="">Select District</option>
                  <option value="SLZUSD">SLZUSD</option>
                  <option value="CVUSD">CVUSD</option>
                </select>
              </div>
              
              <div>
                <label>School Name</label>
                <input type="text" className="glass-input" value={formData.school_name} onChange={e => setFormData({...formData, school_name: e.target.value})} />
              </div>
              
              <div>
                <label>Substitute's Name</label>
                <input type="text" className="glass-input" placeholder="e.g. John Doe" value={formData.substitute_name} onChange={e => setFormData({...formData, substitute_name: e.target.value})} />
              </div>

              <div>
                <label>Work Type</label>
                <input type="text" className="glass-input" placeholder="e.g. Para-Educator, SpEd" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
              </div>

              <div>
                <label>Morning Start Time</label>
                <input type="time" className="glass-input" value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} />
              </div>
              
              <div>
                <label>Morning Stop Time</label>
                <input type="time" className="glass-input" value={formData.stop_time} onChange={e => setFormData({...formData, stop_time: e.target.value})} />
              </div>

              <div>
                <label>Afternoon Start Time</label>
                <input type="time" className="glass-input" value={formData.start_time_2} onChange={e => setFormData({...formData, start_time_2: e.target.value})} />
              </div>
              
              <div>
                <label>Afternoon Stop Time</label>
                <input type="time" className="glass-input" value={formData.stop_time_2} onChange={e => setFormData({...formData, stop_time_2: e.target.value})} />
              </div>

              <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="glass-button secondary" onClick={() => { setIsModalOpen(false); setEditingTaskId(null); }}>Cancel</button>
                <button type="submit" className="glass-button">Save Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
