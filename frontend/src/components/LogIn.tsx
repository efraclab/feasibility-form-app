import { useState } from "react";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
  LogIn,
  FileText,
  Database,
  Upload,
  ClipboardCheck,
  FlaskConical,
} from "lucide-react";

import { login } from "../services/AuthService";

interface LoginProps {
  onLoginSuccess: () => void;
}

interface LoginFormData {
  employeeId: string;
  password: string;
}

interface ValidationErrors {
  employeeId?: string;
  password?: string;
}

const decodeAndStoreUserData = (token: string): boolean => {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) {
      console.error("Invalid token format");
      return false;
    }
    
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = atob(base64);
    const decoded = JSON.parse(jsonPayload);

    if (decoded) {
      localStorage.setItem("EmployeeId", decoded.EmployeeId || "");
      localStorage.setItem("Username", decoded.Username || "");
      localStorage.setItem("Department", decoded.Department || "");
      localStorage.setItem("Role", decoded.Role || "");
      return true;
    }
    return false;
  } catch (error) {
    console.error("Token decoding error:", error);
    return false;
  }
};

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState<LoginFormData>({
    employeeId: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name as keyof ValidationErrors]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    if (!formData.employeeId.trim()) errors.employeeId = "Employee ID is required";
    if (!formData.password.trim()) errors.password = "Password is required";
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setApiError(null);
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const res: any = await login({
        employeeId: formData.employeeId.trim(),
        password: formData.password.trim(),
      });

      if (res && res.token) {
        localStorage.setItem("authToken", res.token);
        
        const isUserDataStored = decodeAndStoreUserData(res.token);

        if (isUserDataStored) {
          setSuccess(true);
          setTimeout(() => onLoginSuccess(), 800);
        } else {
          throw new Error("Login failed due to token decoding issue.");
        }
      } else {
        throw new Error(res?.message || "Invalid credentials. Please try again.");
      }
    } catch (err: any) {
      let errorMessage = err.message || "Login failed. Please try again.";
      if (
        errorMessage.includes("401") ||
        errorMessage.includes("Unauthorized") ||
        errorMessage.includes("invalid credentials")
      ) {
        errorMessage = "Invalid Employee ID or Password. Please check your credentials.";
      }
      setApiError(errorMessage);
      setSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading && !success) {
      const button = document.getElementById('submit-button') as HTMLButtonElement;
      if (button) button.click();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-fadeInUp { animation: fadeInUp 0.6s ease-out; }
        .shimmer-bg {
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%);
          background-size: 200% 100%;
          animation: shimmer 3s ease-in-out infinite;
        }
        .feature-card {
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .feature-card:hover {
          transform: translateX(6px);
        }
        .input-focus {
          transition: all 0.3s ease;
        }
        .input-focus:focus {
          transform: translateY(-2px);
        }
      `}</style>

      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* LEFT SIDE - Minimal Brand Section */}
        <div className="lg:w-1/2 relative bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 p-8 lg:p-12 flex flex-col justify-center overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3"></div>
          <div className="absolute top-1/3 right-1/4 w-32 h-32 bg-white/10 rounded-full animate-float"></div>
          
          <div className="shimmer-bg absolute inset-0 opacity-20"></div>

          <div className="relative z-10 max-w-lg mx-auto w-full">
            {/* Logo and Title */}
            <div className="flex items-center justify-center lg:justify-start gap-4 mb-10 animate-fadeInUp">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-white/30 rounded-2xl blur-xl"></div>
                <div className="relative p-3 rounded-2xl bg-white/20 backdrop-blur-sm shadow-2xl border border-white/30">
                  <FileText className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
                </div>
              </div>
              <div className="text-left">
                <h1 className="text-2xl lg:text-3xl font-bold text-white leading-tight">
                  Feasibility Worksheet
                </h1>
                <p className="text-emerald-100 text-sm font-medium mt-1">
                  Sample Analysis Management
                </p>
              </div>
            </div>

            {/* Key Features - Minimal */}
            <div className="space-y-4 animate-fadeInUp" style={{ animationDelay: "0.2s" }}>
              {[
                {
                  icon: FlaskConical,
                  title: "Feasibility Management",
                  description: "Create and track sample feasibility worksheets",
                },
                {
                  icon: Database,
                  title: "Master & Logs",
                  description: "Access complete records and historical data",
                },
                {
                  icon: Upload,
                  title: "Parameter Upload",
                  description: "Bulk import and manage parameters",
                },
                {
                  icon: ClipboardCheck,
                  title: "Parameter Review",
                  description: "Review and approve parameter batches",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="feature-card flex items-center gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15"
                  style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                >
                  <div className="p-2.5 rounded-lg bg-white/20 flex-shrink-0">
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm mb-0.5">{feature.title}</h3>
                    <p className="text-emerald-100 text-xs">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Copyright */}
            <div className="hidden lg:block mt-12 pt-6 border-t border-white/20 text-center lg:text-left animate-fadeInUp" style={{ animationDelay: "0.7s" }}>
              <p className="text-emerald-100 text-xs">© 2025 EFRAC. All rights reserved.</p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - Enhanced Login Form */}
        <div className="lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-white">
          <div className="w-full max-w-md animate-fadeInUp" style={{ animationDelay: "0.2s" }}>
            {/* Form Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg">
                  <LogIn className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-800">Welcome Back</h2>
                  <p className="text-sm text-slate-500 mt-0.5">Sign in to your account</p>
                </div>
              </div>
              <p className="text-slate-600 text-sm">
                Enter your credentials to access the Feasibility Worksheet Management System
              </p>
            </div>

            <div className="space-y-5" onKeyPress={handleKeyPress}>
              {/* Employee ID */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Employee ID <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User
                      className={`w-5 h-5 ${
                        validationErrors.employeeId ? "text-red-400" : "text-slate-400"
                      }`}
                    />
                  </div>
                  <input
                    type="text"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleChange}
                    className={`input-focus w-full pl-11 pr-4 py-3 border rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all bg-slate-50 ${
                      validationErrors.employeeId
                        ? "border-red-300 focus:ring-red-500 focus:bg-red-50"
                        : "border-slate-200 focus:ring-emerald-500 focus:bg-white focus:border-emerald-500"
                    }`}
                    placeholder="Enter your employee ID"
                  />
                </div>
                {validationErrors.employeeId && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    {validationErrors.employeeId}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock
                      className={`w-5 h-5 ${
                        validationErrors.password ? "text-red-400" : "text-slate-400"
                      }`}
                    />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`input-focus w-full pl-11 pr-12 py-3 border rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all bg-slate-50 ${
                      validationErrors.password
                        ? "border-red-300 focus:ring-red-500 focus:bg-red-50"
                        : "border-slate-200 focus:ring-emerald-500 focus:bg-white focus:border-emerald-500"
                    }`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {validationErrors.password && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    {validationErrors.password}
                  </p>
                )}
              </div>

              {/* API Error */}
              {apiError && (
                <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-200 animate-fadeInUp">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 font-medium">{apiError}</p>
                </div>
              )}

              {/* Success */}
              {success && (
                <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-lg border border-emerald-200 animate-fadeInUp">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-emerald-700 font-medium">Login successful! Redirecting...</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                id="submit-button"
                type="button"
                onClick={handleSubmit}
                disabled={isLoading || success}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl hover:from-emerald-700 hover:to-emerald-600 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : success ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Success!</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                    <span>Sign In</span>
                  </>
                )}
              </button>

              {/* Help Link */}
              <div className="pt-4 border-t border-slate-200">
                <p className="text-center text-sm text-slate-600">
                  Having trouble signing in?{" "}
                  <button
                    type="button"
                    className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
                  >
                    Contact Support
                  </button>
                </p>
              </div>
            </div>

            {/* Mobile Copyright */}
            <div className="lg:hidden mt-8 pt-6 border-t border-slate-200">
              <p className="text-slate-500 text-xs text-center">
                © 2025 EFRAC. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;