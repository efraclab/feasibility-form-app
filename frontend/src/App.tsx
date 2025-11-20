import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import FormPage from './components/FormPage';

// Wrapper component to inject the navigate function into Dashboard
const DashboardWrapper = () => {
  const navigate = useNavigate();
  return <Dashboard onNavigate={(screen, id) => navigate(id ? `/form/${id}` : '/form')} />;
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
      </Routes>
    </BrowserRouter>
  );
}