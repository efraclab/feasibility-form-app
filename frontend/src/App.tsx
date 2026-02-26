import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import Dashboard from './components/Dashboard';
import FormPage from './components/FormPage';
import MasterAndLogsViewer from './components/MasterAndLogsViewer';
import ParameterUploader from './components/ParameterUploader';
import ParameterReview from './components/ParameterReview';
import BatchReview from './components/BatchReview';
import Login from './components/LogIn';


const isTokenExpired = (token: string) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const decoded = JSON.parse(jsonPayload);
    if (!decoded?.exp) return true;
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};


interface AuthenticatedAppProps {
  employeeId: string;
  role: string;
  username: string;
  department: string;
  onLogout: () => void;
}

interface WrapperProps {
  employeeId: string;
  username: string;
  role: string;
}


const DashboardWrapper = ({ onLogout, username, department, employeeId, role }: AuthenticatedAppProps) => {
  const navigate = useNavigate();
  
  const handleNavigation = (screen: "form" | "master" | "parameters" | "review", id?: string) => {
    if (screen === "master") {
      navigate('/master');
    } else if (screen === "parameters") {
      navigate('/parameters');
    } else if (screen === "review") {
      navigate('/review');
    } else if (id) {
      navigate(`/form/${id}`);
    } else {
      navigate('/form');
    }
  };
  
  return (
    <Dashboard 
      onNavigate={handleNavigation}
      onLogout={onLogout}
      username={username}
      department={department}
      employeeId={employeeId}
      role={role}
    />
  );
};

const FormPageWrapper = () => {
  const navigate = useNavigate();
  const pathParts = window.location.pathname.split('/');
  const id = pathParts[pathParts.length - 1] !== 'form' ? pathParts[pathParts.length - 1] : undefined;
  
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

const ParameterUploaderWrapper = ({ employeeId, username, role }: WrapperProps) => {
  const navigate = useNavigate();
  
  return <ParameterUploader onBack={() => navigate('/')} employeeId={employeeId} username={username} role={role} />;
};

const ParameterReviewWrapper = ({ employeeId, username, role }: WrapperProps) => {
  const navigate = useNavigate();
  
  return (
    <ParameterReview 
      onBack={() => navigate('/')} 
      onBatchSelect={(batchId) => navigate(`/review/${batchId}`)}
      employeeId={employeeId}
      username={username}
      role={role}
    />
  );
};

const BatchReviewWrapper = ({ employeeId, username, role }: WrapperProps) => {
  const navigate = useNavigate();
  const pathParts = window.location.pathname.split('/');
  const batchId = parseInt(pathParts[pathParts.length - 1], 10);
  
  if (isNaN(batchId)) {
    return <Navigate to="/review" replace />;
  }
  
  return (
    <BatchReview 
      batchId={batchId}
      onBack={() => navigate('/review')}
      employeeId={employeeId}
      username={username}
      role={role}
    />
  );
};


function AuthenticatedApp({
  employeeId,
  role,
  username,
  department,
  onLogout,
}: AuthenticatedAppProps) {
  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={
            <DashboardWrapper 
              employeeId={employeeId}
              role={role}
              username={username}
              department={department}
              onLogout={onLogout}
            />
          } 
        />
        
        <Route path="/form" element={<FormPageWrapper />} />
        <Route path="/form/:id" element={<FormPageWrapper />} />
        
        <Route path="/master" element={<MasterAndLogsWrapper />} />
        
        <Route path="/parameters" element={<ParameterUploaderWrapper employeeId={employeeId} username={username} role={role} />} />
        
        <Route path="/review" element={<ParameterReviewWrapper employeeId={employeeId} username={username} role={role} />} />
        <Route path="/review/:batchId" element={<BatchReviewWrapper employeeId={employeeId} username={username} role={role} />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}


export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionKey, setSessionKey] = useState(Date.now());

  const clearAuthData = () => {
    localStorage.clear();
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token && !isTokenExpired(token)) {
      setIsAuthenticated(true);
    } else {
      clearAuthData();
    }
    setIsLoading(false);
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setSessionKey(Date.now());
  };

  const handleLogout = () => {
    clearAuthData();
    setIsAuthenticated(false);
    setSessionKey(Date.now());
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
      </div>
    );
  }

  const username = localStorage.getItem("Username") || "Unknown";
  const department = localStorage.getItem("Department") || "Unknown";
  const employeeId = localStorage.getItem("EmployeeId") || "Unknown";
  const role = localStorage.getItem("Role") || "Unknown";

  return isAuthenticated ? (
    <AuthenticatedApp
      key={sessionKey}
      employeeId={employeeId}
      role={role}
      username={username}
      department={department}
      onLogout={handleLogout}
    />
  ) : (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={<Login onLoginSuccess={handleLoginSuccess} />}
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}