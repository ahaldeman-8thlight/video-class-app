import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { ClassCreate, ClassResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface TeacherDashboardProps {
  teacherId: number;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ teacherId }) => {
  const [classes, setClasses] = useState<ClassResponse[]>([]);
  const [newClass, setNewClass] = useState<ClassCreate>({
    title: '',
    description: '',
    scheduled_time: '',
    duration_minutes: 60
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await axios.get<ClassResponse[]>(`${API_URL}/api/classes/`);
      setClasses(response.data);
      setError('');
    } catch (err) {
      const error = err as AxiosError;
      console.error('Error fetching classes:', error);
      setError('Failed to fetch classes');
    } finally {
      setLoading(false);
    }
  };

  const createClass = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.post<ClassResponse>(
        `${API_URL}/api/classes/?teacher_id=${teacherId}`,
        newClass
      );
      setClasses([...classes, response.data]);
      setNewClass({ 
        title: '', 
        description: '', 
        scheduled_time: '', 
        duration_minutes: 60 
      });
      setError('');
    } catch (err) {
      const error = err as AxiosError;
      console.error('Error creating class:', error);
      setError('Failed to create class');
    } finally {
      setLoading(false);
    }
  };

  const startClass = async (classId: number): Promise<void> => {
    try {
      await axios.post(`${API_URL}/api/classes/${classId}/start?teacher_id=${teacherId}`);
      fetchClasses(); // Refresh the list
    } catch (err) {
      const error = err as AxiosError;
      console.error('Error starting class:', error);
      setError('Failed to start class');
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target;
    setNewClass(prev => ({
      ...prev,
      [name]: name === 'duration_minutes' ? parseInt(value) || 60 : value
    }));
  };

  return (
    <div className="teacher-dashboard">
      <h2>Teacher Dashboard</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="create-class-form">
        <h3>Create New Class</h3>
        <form onSubmit={createClass}>
          <input
            type="text"
            name="title"
            placeholder="Class Title"
            value={newClass.title}
            onChange={handleInputChange}
            required
            disabled={loading}
          />
          <textarea
            name="description"
            placeholder="Description"
            value={newClass.description || ''}
            onChange={handleInputChange}
            disabled={loading}
          />
          <input
            type="datetime-local"
            name="scheduled_time"
            value={newClass.scheduled_time || ''}
            onChange={handleInputChange}
            disabled={loading}
          />
          <input
            type="number"
            name="duration_minutes"
            placeholder="Duration (minutes)"
            value={newClass.duration_minutes}
            onChange={handleInputChange}
            min="1"
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Class'}
          </button>
        </form>
      </div>

      <div className="classes-list">
        <h3>Your Classes</h3>
        {loading && classes.length === 0 ? (
          <div>Loading classes...</div>
        ) : (
          classes.map((cls) => (
            <div key={cls.id} className="class-card">
              <h4>{cls.title}</h4>
              <p>{cls.description}</p>
              <p>Join Link: <a href={cls.join_link}>{cls.join_link}</a></p>
              <button 
                onClick={() => startClass(cls.id)}
                disabled={cls.is_active || loading}
              >
                {cls.is_active ? 'Active' : 'Start Class'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
