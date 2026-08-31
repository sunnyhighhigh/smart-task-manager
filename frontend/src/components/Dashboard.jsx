import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, Search, Trash2, CheckCircle, Clock } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

function Dashboard({ token }) {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  
  const [formData, setFormData] = useState({
    title: '', description: '', category: 'Work', priority: 'Medium', status: 'Pending',
    due_date: '', school_district: '', school_name: '', start_time: '', stop_time: '', lunch_break_minutes: ''
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
      setFormData({ title: '', description: '', category: 'Work', priority: 'Medium', status: 'Pending', due_date: '', school_district: '', school_name: '', start_time: '', stop_time: '', lunch_break_minutes: '' });
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

  return (
    <div>
      {/* Analytics Dashboard */}
      <div className="dashboard-grid">
        <div className="glass-container stat-card">
          <h3>Total Tasks</h3>
          <p>{stats.TOTAL_TASKS || 0}</p>
        </div>
        <div className="glass-container stat-card">
          <h3>Completed</h3>
          <p>{stats.COMPLETED_TASKS || 0}</p>
        </div>
        <div className="glass-container stat-card">
          <h3>Pending</h3>
          <p>{stats.PENDING_TASKS || 0}</p>
        </div>
        <div className="glass-container stat-card">
          <h3>In Progress</h3>
          <p>{stats.IN_PROGRESS_TASKS || 0}</p>
        </div>
      </div>

      {/* Task Controls */}
      <div className="task-controls">
        <div style={{ position: 'relative', flex: 1 }}>
          <Search style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--text-muted)' }} size={20} />
          <input 
            type="text" 
            className="glass-input" 
            style={{ paddingLeft: '40px', marginBottom: 0 }} 
            placeholder="Search tasks..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
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
                <span className={`task-badge ${task.PRIORITY === 'High' ? 'badge-high' : task.PRIORITY === 'Medium' ? 'badge-medium' : 'badge-low'}`}>
                  {task.PRIORITY}
                </span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{task.DESCRIPTION}</p>
              
              <div className="task-details">
                {task.SCHOOL_DISTRICT && <span><strong>District:</strong> {task.SCHOOL_DISTRICT}</span>}
                {task.SCHOOL_NAME && <span><strong>School:</strong> {task.SCHOOL_NAME}</span>}
                {task.START_TIME && <span><strong>Hours:</strong> {task.START_TIME} - {task.STOP_TIME}</span>}
                {task.LUNCH_BREAK_MINUTES && <span><strong>Lunch:</strong> {task.LUNCH_BREAK_MINUTES} mins</span>}
                {task.DUE_DATE && <span><strong>Due:</strong> {new Date(task.DUE_DATE).toLocaleDateString()}</span>}
              </div>
            </div>
            
            <div className="task-actions">
              <button onClick={() => handleStatusChange(task)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: task.STATUS === 'Completed' ? 'var(--secondary)' : 'var(--text-muted)' }}>
                {task.STATUS === 'Completed' ? <CheckCircle /> : <Clock />}
              </button>
              <button onClick={() => handleDelete(task.TASK_ID)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}>
                <Trash2 />
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
                <input type="text" className="glass-input" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              
              <div style={{ gridColumn: 'span 2' }}>
                <label>Description</label>
                <input type="text" className="glass-input" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>

              <div>
                <label>Category</label>
                <select className="glass-input" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                  <option>Work</option><option>Personal</option><option>Learning</option><option>Meetings</option>
                </select>
              </div>

              <div>
                <label>Priority</label>
                <select className="glass-input" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}>
                  <option>Low</option><option>Medium</option><option>High</option>
                </select>
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <hr style={{ margin: '1rem 0', borderColor: '#eee' }}/>
                <h4>Paraprofessional Details</h4>
              </div>

              <div>
                <label>School District</label>
                <input type="text" className="glass-input" value={formData.school_district} onChange={e => setFormData({...formData, school_district: e.target.value})} />
              </div>
              
              <div>
                <label>School Name</label>
                <input type="text" className="glass-input" value={formData.school_name} onChange={e => setFormData({...formData, school_name: e.target.value})} />
              </div>

              <div>
                <label>Start Time (HH:MM)</label>
                <input type="time" className="glass-input" value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} />
              </div>
              
              <div>
                <label>Stop Time (HH:MM)</label>
                <input type="time" className="glass-input" value={formData.stop_time} onChange={e => setFormData({...formData, stop_time: e.target.value})} />
              </div>

              <div>
                <label>Lunch Break (minutes)</label>
                <input type="number" className="glass-input" value={formData.lunch_break_minutes} onChange={e => setFormData({...formData, lunch_break_minutes: e.target.value})} />
              </div>

              <div>
                <label>Due Date</label>
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
