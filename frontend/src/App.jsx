import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Home, Login, Admin } from './pages';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('srew_token');
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
