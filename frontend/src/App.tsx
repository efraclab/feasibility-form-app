import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import FormPage from './components/FormPage';
import MasterViewer from './components/MasterViewer';

// Wrapper component to inject the navigate function into Dashboard
const DashboardWrapper = () => {
  const navigate = useNavigate();
  
  const handleNavigation = (screen: "form" | "master", id?: string) => {
    if (screen === "master") {
      navigate('/master');
    } else if (id) {
      navigate(`/form/${id}`);
    } else {
      navigate('/form');
    }
  };
  
  return <Dashboard onNavigate={handleNavigation} />;
};

// Wrapper component to inject navigation and params into FormPage
const FormPageWrapper = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Grabs the ID from the URL (e.g., /form/123)
  
  return (
    <FormPage 
      onBack={() => navigate(-1)} // Tells browser to go back one step in history
      _formId={id} 
    />
  );
};

// Wrapper component for MasterView
const MasterViewWrapper = () => {
  const navigate = useNavigate();
  
  return <MasterViewer onBack={() => navigate('/')} />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Route 1: The Dashboard (Home) */}
        <Route path="/" element={<DashboardWrapper />} />
        
        {/* Route 2: New Form (No ID) */}
        <Route path="/form" element={<FormPageWrapper />} />
        
        {/* Route 3: Edit Form (With ID) */}
        <Route path="/form/:id" element={<FormPageWrapper />} />
        
        {/* Route 4: Master View */}
        <Route path="/master" element={<MasterViewWrapper />} />
      </Routes>
    </BrowserRouter>
  );
}