import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { ClassResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const StudentView: React.FC = () => {
  const [classes, setClasses] = useState<ClassResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchActiveClasses();
  }, []);

  const fetchActiveClasses = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await axios.get<ClassResponse[]>(`${API_URL}/api/classes/`);
      // Filter only active classes for students
      setClasses(response.data.filter(cls => cls.is_active));
      setError('');
    } catch (err) {
      const error = err as AxiosError;
      console.error('Error fetching classes:', error);
      setError('Failed to fetch classes');
    } finally {
      setLoading(false);
    }
  };

  const joinClass = (joinLink: string): void => {
    window.location.href = joinLink;
  };

  return (
    <div className="student-view">
      <h2>Available Classes</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <div>Loading classes...</div>
      ) : (
        <div className="classes-grid">
          {classes.length === 0 ? (
            <div className="no-classes">No active classes available</div>
          ) : (
            classes.map((cls) => (
              <div key={cls.id} className="class-card">
                <h3>{cls.title}</h3>
                <p className="teacher">Teacher: {cls.teacher_name}</p>
                <p className="description">{cls.description}</p>
                {cls.scheduled_time && (
                  <p className="schedule">
                    Scheduled: {new Date(cls.scheduled_time).toLocaleString()}
                  </p>
                )}
                <button 
                  onClick={() => joinClass(cls.join_link)}
                  className="join-button"
                  disabled={!cls.is_active}
                >
                  {cls.is_active ? 'Join Class' : 'Class Not Active'}
                </button>
              </div>
            ))
          )}
        </div>
      )}
      
      <button onClick={fetchActiveClasses} disabled={loading}>
        {loading ? 'Refreshing...' : 'Refresh Classes'}
      </button>
    </div>
  );
};

export default StudentView;
