import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const { user } = useAuth();

  const [projectData, setProjectData] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [memberForm, setMemberForm] = useState({ email: '', role: 'MEMBER' });
  const [message, setMessage] = useState('');

  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    assigned_to: '',
    status: 'TODO',
    priority: 'MEDIUM',
    due_date: '',
  });

  useEffect(() => {
    fetchProject();
    fetchTasks();
  }, [projectId]);

  async function fetchProject() {
    const res = await api.get(`/projects/${projectId}`);
    setProjectData(res.data);
  }

  async function fetchTasks() {
    const res = await api.get(`/tasks/project/${projectId}`);
    setTasks(res.data);
  }

  async function handleAddMember(e) {
    e.preventDefault();
    setMessage('');
    try {
      const res = await api.post(`/projects/${projectId}/members`, memberForm);
      setMessage(`Member added: ${res.data.email} | User ID: ${res.data.userId}`);
      setMemberForm({ email: '', role: 'MEMBER' });
      fetchProject();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to add member');
    }
  }

  async function handleCreateTask(e) {
    e.preventDefault();
    try {
      await api.post(`/tasks/project/${projectId}`, taskForm);
      setTaskForm({
        title: '',
        description: '',
        assigned_to: '',
        status: 'TODO',
        priority: 'MEDIUM',
        due_date: '',
      });
      setShowTaskForm(false);
      fetchTasks();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to create task');
    }
  }

  async function handleUpdateTask(taskId, updates) {
    try {
      await api.patch(`/tasks/${taskId}`, updates);
      fetchTasks();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to update task');
    }
  }

  async function handleDeleteTask(taskId) {
    try {
      await api.delete(`/tasks/${taskId}`);
      fetchTasks();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to delete task');
    }
  }

  if (!projectData) return <p style={{ padding: '24px' }}>Loading project...</p>;

  const isProjectAdmin = projectData.currentUserRole === 'ADMIN';
  const members = projectData.members || [];

  return (
    <div style={styles.page}>
      <h1>{projectData.project.name}</h1>
      <p style={{ color: '#666' }}>{projectData.project.description}</p>
      <p style={{ marginTop: '8px', fontWeight: 600 }}>My Project Role: {projectData.currentUserRole}</p>

      {message && <p style={{ marginTop: '16px', color: '#01696f' }}>{message}</p>}

      <section style={styles.section}>
        <h2>Team Members</h2>
        <div style={{ marginTop: '16px', display: 'grid', gap: '12px' }}>
          {members.map((member) => (
            <div key={member.id} style={styles.memberCard}>
              <div>
                <strong>{member.user?.name}</strong>
                <p style={styles.smallText}>{member.user?.email}</p>
                <p style={styles.smallText}>User ID: {member.user?._id}</p>
              </div>
              <span style={styles.roleBadge}>{member.role}</span>
            </div>
          ))}
        </div>

        {isProjectAdmin && (
          <form onSubmit={handleAddMember} style={styles.form}>
            <h3>Add Member</h3>
            <input
              placeholder="Member email"
              value={memberForm.email}
              onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
              style={styles.input}
              required
            />
            <select
              value={memberForm.role}
              onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
              style={styles.input}
            >
              <option value="MEMBER">Member</option>
              <option value="ADMIN">Admin</option>
            </select>
            <button type="submit" style={styles.btn}>Add Member</button>
          </form>
        )}
      </section>

      <section style={styles.section}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Tasks</h2>
          {isProjectAdmin && (
            <button style={styles.btn} onClick={() => setShowTaskForm(!showTaskForm)}>
              + Add Task
            </button>
          )}
        </div>

        {showTaskForm && isProjectAdmin && (
          <form onSubmit={handleCreateTask} style={styles.form}>
            <input
              placeholder="Task title"
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              style={styles.input}
              required
            />
            <input
              placeholder="Description"
              value={taskForm.description}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              style={styles.input}
            />
            <select
              value={taskForm.assigned_to}
              onChange={(e) => setTaskForm({ ...taskForm, assigned_to: e.target.value })}
              style={styles.input}
            >
              <option value="">Unassigned</option>
              {members.map((member) => (
                <option key={member.user?._id} value={member.user?._id}>
                  {member.user?.name} ({member.user?.email})
                </option>
              ))}
            </select>
            <select
              value={taskForm.status}
              onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
              style={styles.input}
            >
              <option value="TODO">TODO</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="DONE">DONE</option>
            </select>
            <select
              value={taskForm.priority}
              onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
              style={styles.input}
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
            </select>
            <input
              type="date"
              value={taskForm.due_date}
              onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
              style={styles.input}
            />
            <button type="submit" style={styles.btn}>Create Task</button>
          </form>
        )}

        <div style={{ marginTop: '16px', display: 'grid', gap: '12px' }}>
          {tasks.map((task) => (
            <div key={task._id} style={styles.taskCard}>
              <div style={{ flex: 1 }}>
                <strong>{task.title}</strong>
                <p style={styles.smallText}>{task.description}</p>
                <p style={styles.smallText}>Priority: {task.priority}</p>
                <p style={styles.smallText}>Assigned To: {task.assigned_to ? `${task.assigned_to.name} (${task.assigned_to.email})` : 'Unassigned'}</p>
                <p style={styles.smallText}>Assigned User ID: {task.assigned_to?._id || '-'}</p>
                <p style={styles.smallText}>Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : '-'}</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '180px' }}>
                <select
                  value={task.status}
                  onChange={(e) => handleUpdateTask(task._id, { status: e.target.value })}
                  style={styles.input}
                >
                  <option value="TODO">TODO</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="DONE">DONE</option>
                </select>

                {isProjectAdmin && (
                  <>
                    <select
                      value={task.assigned_to?._id || ''}
                      onChange={(e) => handleUpdateTask(task._id, { assigned_to: e.target.value })}
                      style={styles.input}
                    >
                      <option value="">Unassigned</option>
                      {members.map((member) => (
                        <option key={member.user?._id} value={member.user?._id}>
                          {member.user?.name}
                        </option>
                      ))}
                    </select>

                    <button style={styles.deleteBtn} onClick={() => handleDeleteTask(task._id)}>
                      Delete Task
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={styles.section}>
        <h2>{user?.global_role === 'MEMBER' ? 'Member Info' : 'Admin Info'}</h2>
        <p>Your User ID: <strong>{user?.id}</strong></p>
      </section>
    </div>
  );
}

const styles = {
  page: { padding: '32px', maxWidth: '1000px', margin: '0 auto' },
  section: { background: '#f9f8f5', padding: '24px', borderRadius: '12px', marginTop: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  form: { display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px', maxWidth: '420px' },
  input: { padding: '10px 12px', borderRadius: '6px', border: '1px solid #d4d1ca', fontSize: '14px' },
  btn: { background: '#01696f', color: '#fff', padding: '9px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer' },
  deleteBtn: { background: '#a12c7b', color: '#fff', padding: '9px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer' },
  memberCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '14px', borderRadius: '8px', border: '1px solid #eee' },
  roleBadge: { background: '#01696f', color: '#fff', padding: '6px 10px', borderRadius: '20px', fontSize: '12px' },
  taskCard: { display: 'flex', gap: '16px', justifyContent: 'space-between', background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #eee' },
  smallText: { fontSize: '13px', color: '#666', marginTop: '4px' },
};