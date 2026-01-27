import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import FormPage from './components/FormPage';
import MasterAndLogsViewer from './components/MasterAndLogsViewer';

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

const FormPageWrapper = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  return (
    <FormPage 
      onBack={() => navigate(-1)}
      _formId={id} 
    />
  );
};

const MasterAndLogsWrapper = () => {
  const navigate = useNavigate();
  
  return <MasterAndLogsViewer onBack={() => navigate('/')} />;
};


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardWrapper />} />
        
        <Route path="/form" element={<FormPageWrapper />} />
        
        <Route path="/form/:id" element={<FormPageWrapper />} />
        
        <Route path="/master" element={<MasterAndLogsWrapper />} />
        
      </Routes>
    </BrowserRouter>
  );
}