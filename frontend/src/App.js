import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PublicView from './pages/PublicView';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* La vista de los estudiantes */}
        <Route path="/" element={<PublicView />} /> 
        
        {/* Tu nuevo panel de administración */}
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;