import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, Search, Trash2, CheckCircle, Clock } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function Dashboard({ token }) {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  
  const [formData, setFormData] = useState({
    title: 'Para-Educator', description: '', category: 'Work', priority: 'Medium', status: 'Pending',
    due_date: '', school_district: '', school_name: '', start_time: '', stop_time: '', start_time_2: '', stop_time_2: ''
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
      await axios.post(`${API_URL}/tasks`, formData, authHeader);
      setIsModalOpen(false);
      setFormData({ title: 'Para-Educator', description: '', category: 'Work', priority: 'Medium', status: 'Pending', due_date: '', school_district: '', school_name: '', start_time: '', stop_time: '', start_time_2: '', stop_time_2: '' });
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

  const handleStatusChange = async (task) => {
    const newStatus = task.STATUS === 'Completed' ? 'Pending' : 'Completed';
    try {
      await axios.put(`${API_URL}/tasks/${task.TASK_ID}`, { status: newStatus }, authHeader);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDuplicate = async (task) => {
    const newTask = {
      title: task.TITLE,
      description: task.DESCRIPTION,
      category: task.CATEGORY,
      priority: task.PRIORITY,
      status: 'Pending',
      due_date: new Date().toISOString().split('T')[0],
      school_district: task.SCHOOL_DISTRICT,
      school_name: task.SCHOOL_NAME,
      start_time: task.START_TIME,
      stop_time: task.STOP_TIME,
      start_time_2: task.START_TIME_2,
      stop_time_2: task.STOP_TIME_2
    };
    try {
      await axios.post(`${API_URL}/tasks`, newTask, authHeader);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const calculateLunchBreak = (stop1, start2) => {
    if (!stop1 || !start2) return null;
    try {
      const [h1, m1] = stop1.split(':').map(Number);
      const [h2, m2] = start2.split(':').map(Number);
      let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
      return diff > 0 ? diff : 0;
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
        <button className="glass-button" style={{ width: 'auto', display: 'flex', gap: '0.5rem', alignItems: 'center' }} onClick={() => setIsModalOpen(true)}>
          <PlusCircle size={20} /> Add Task
        </button>
      </div>

      {/* Task List */}
      <div className="task-list">
        {tasks.map(task => (
          <div key={task.TASK_ID} className="glass-container task-item">
            <div style={{ flex: 1 }}>
              <div className="task-header">
                <h3 style={{ textDecoration: task.STATUS === 'Completed' ? 'line-through' : 'none' }}>{task.TITLE}</h3>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{task.DESCRIPTION}</p>
              
              <div className="task-details">
                {task.SCHOOL_DISTRICT && <span><strong>District:</strong> {task.SCHOOL_DISTRICT}</span>}
                {task.SCHOOL_NAME && <span><strong>School:</strong> {task.SCHOOL_NAME}</span>}
                {task.START_TIME && <span><strong>Morning Shift:</strong> {task.START_TIME} - {task.STOP_TIME}</span>}
                {task.START_TIME_2 && <span><strong>Afternoon Shift:</strong> {task.START_TIME_2} - {task.STOP_TIME_2}</span>}
                {task.STOP_TIME && task.START_TIME_2 && <span><strong>Lunch Break:</strong> {calculateLunchBreak(task.STOP_TIME, task.START_TIME_2)} mins</span>}
                {task.DUE_DATE && <span><strong>Date:</strong> {new Date(task.DUE_DATE).toLocaleDateString()}</span>}
              </div>
            </div>
            
            <div className="task-actions" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
              <button onClick={() => handleStatusChange(task)} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'none', border: 'none', cursor: 'pointer', color: task.STATUS === 'Completed' ? 'var(--secondary)' : 'var(--text-muted)' }}>
                {task.STATUS === 'Completed' ? <CheckCircle size={16} /> : <Clock size={16} />}
                <span style={{ fontSize: '0.8rem' }}>{task.STATUS === 'Completed' ? 'Done' : 'Pending'}</span>
              </button>
              <button onClick={() => handleDuplicate(task)} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)' }}>
                <PlusCircle size={16} />
                <span style={{ fontSize: '0.8rem' }}>Add Copy</span>
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
            <h2 style={{ marginBottom: '1.5rem' }}>Create Paraprofessional Task</h2>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              
              <div style={{ gridColumn: 'span 2' }}>
                <label>Title *</label>
                <input type="text" className="glass-input" required readOnly value={formData.title} style={{ backgroundColor: 'rgba(255,255,255,0.3)', cursor: 'not-allowed' }} />
              </div>
              
              <div style={{ gridColumn: 'span 2' }}>
                <label>Description</label>
                <input type="text" className="glass-input" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <hr style={{ margin: '1rem 0', borderColor: '#eee' }}/>
                <h4>Paraprofessional Details</h4>
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

              <div>
                <label>Date</label>
                <input type="date" className="glass-input" value={formData.due_date} onChange={e => setFormData({...formData, due_date: e.target.value})} />
              </div>

              <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="glass-button secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
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
