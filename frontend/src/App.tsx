import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TeacherDashboard from './components/TeacherDashboard';
import VideoCall from './components/VideoCall';
import StudentView from './components/StudentView';

const App: React.FC = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<div>Home Page - Choose your role</div>} />
          <Route 
            path="/teacher/:teacherId" 
            element={<TeacherDashboard teacherId={1} />} 
          />
          <Route path="/student" element={<StudentView />} />
          <Route path="/join/:callId" element={<VideoCall />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
