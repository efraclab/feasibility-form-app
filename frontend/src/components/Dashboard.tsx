import { useState, useEffect } from "react";
import {
  Search,
  FlaskConical,
  FileText,
  ChevronRight,
  Loader2,
  Building2,
  Filter,
  RefreshCw,
  Plus,
  Clock,
  CheckCircle2,
  FileEdit,
  Database,
  Upload,
  ClipboardCheck,
  User,
  LogOut,
  ChevronDown,
} from "lucide-react";

const MASTER_LIST_KEY = "allFormsMasterList";

interface ClientDetails {
  clientName: string;
  address: string;
  pinCode: string;
  gstNo: string;
  contactPersonName: string;
  contactPersonPhone: string;
}

interface Parameter {
  id: string;
  parameterName: string;
  regulation: string;
  method: string;
  specification: string;
  instrument: string;
  isNABL: boolean;
  lab: string;
  isFeasible: boolean;
  verifiedAt?: string;
}

interface SampleData {
  sampleName: string;
  sampleType: string;
  parameters: Parameter[];
}

interface Form {
  id: string;
  ref_no: string;
  client_name: string;
  sample_name: string;
  sample_type: string;
  status: "Draft" | "Published";
  created_at: string;
  updated_at: string;
}

interface FormDetails extends Form {
  clientDetails: ClientDetails;
  sampleData: SampleData;
}

function getAllForms(): FormDetails[] {
  const listString = localStorage.getItem(MASTER_LIST_KEY);
  const forms: FormDetails[] = listString ? JSON.parse(listString) : [];
  return forms.sort(
    (a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );
}

interface DashboardProps {
  onNavigate: (screen: "form" | "master" | "parameters" | "review", id?: string) => void;
  employeeId: string;
  username: string;
  department: string;
  role: string;
  onLogout: () => void;
}

export default function Dashboard({ 
  onNavigate,
  employeeId,
  username,
  department,
  role,
  onLogout 
}: DashboardProps) {
  const [forms, setForms] = useState<Form[]>([]);
  const [filteredForms, setFilteredForms] = useState<Form[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    fetchForms();
  }, []);

  useEffect(() => {
    filterForms();
  }, [searchQuery, forms, statusFilter]);

  const fetchForms = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const allForms: FormDetails[] = getAllForms();

      const displayForms: Form[] = allForms.map((f) => ({
        id: f.id,
        ref_no: f.ref_no,
        client_name: f.clientDetails.clientName,
        sample_name: f.sampleData.sampleName,
        sample_type: f.sampleData.sampleType,
        status: f.status,
        created_at: f.created_at,
        updated_at: f.updated_at,
      }));

      setForms(displayForms);
      setFilteredForms(displayForms);
    } catch (error) {
      console.error("Error fetching forms:", error);
      setForms([]);
      setFilteredForms([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterForms = () => {
    let filtered = forms;

    if (searchQuery) {
      filtered = filtered.filter(
        (form) =>
          form.ref_no?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          form.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          form.sample_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((form) => form.status === statusFilter);
    }

    setFilteredForms(filtered);
  };

  const handleFormClick = (form: Form) => {
    onNavigate("form", form.id);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      Draft: "bg-amber-50 text-amber-700 border-amber-200",
      Published: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
    return styles[status as keyof typeof styles] || styles.Draft;
  };

  const getStatusIcon = (status: string) => {
    return status === "Published" ? CheckCircle2 : FileEdit;
  };

  const stats = {
    total: forms.length,
    draft: forms.filter((f) => f.status === "Draft").length,
    published: forms.filter((f) => f.status === "Published").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-teal-50/30">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
        .animate-slideIn { animation: slideIn 0.5s ease-out forwards; }
        .form-card {
          animation: fadeIn 0.5s ease-out forwards;
          position: relative;
          overflow: hidden;
        }
        .form-card:hover { box-shadow: 0 8px 24px rgba(16, 185, 129, 0.15); }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>

      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Logo and Title */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-md">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-800">
                    Feasibility Worksheets
                  </h1>
                  <p className="text-xs text-slate-500">
                    Sample Analysis Management
                  </p>
                </div>
              </div>
            </div>

            {/* Right: User Menu and Actions */}
            <div className="flex items-center gap-3">
              {/* Refresh Button */}
              <button
                onClick={fetchForms}
                disabled={isLoading}
                className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all disabled:opacity-50"
                title="Refresh forms"
              >
                <RefreshCw
                  className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`}
                />
              </button>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left hidden md:block">
                    <p className="text-xs font-semibold text-slate-800">
                      {username}
                    </p>
                    <p className="text-[10px] text-slate-500">{department}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-600" />
                </button>

                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-20 animate-fadeIn">
                      <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border-b border-slate-200">
                        <p className="font-semibold text-slate-800">
                          {username}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          ID: {employeeId}
                        </p>
                        <p className="text-xs text-slate-500">
                          Role: {role}
                        </p>
                      </div>
                      <div className="p-2">
                        <button
                          onClick={onLogout}
                          className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto px-6 py-6">
        {/* Simplified Toolbar Hero Section */}
        <div className="mb-6 animate-fadeIn">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* Create New Form */}
              <button
                onClick={() => onNavigate("form")}
                className="group relative flex items-center gap-3 p-4 bg-gradient-to-br from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 rounded-xl border border-emerald-200 hover:border-emerald-300 transition-all shadow-sm hover:shadow-md"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-800">New Form</p>
                  <p className="text-xs text-slate-600">Create worksheet</p>
                </div>
              </button>

              {/* Master & Logs */}
              <button
                onClick={() => onNavigate("master")}
                className="group relative flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-xl border border-blue-200 hover:border-blue-300 transition-all shadow-sm hover:shadow-md"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <Database className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-800">Master & Logs</p>
                  <p className="text-xs text-slate-600">View all records</p>
                </div>
              </button>

              {/* Upload Parameters */}
              <button
                onClick={() => onNavigate("parameters")}
                className="group relative flex items-center gap-3 p-4 bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-xl border border-purple-200 hover:border-purple-300 transition-all shadow-sm hover:shadow-md"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <Upload className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-800">Upload Parameters</p>
                  <p className="text-xs text-slate-600">Bulk import data</p>
                </div>
              </button>

              {/* Review Batches */}
              <button
                onClick={() => onNavigate("review")}
                className="group relative flex items-center gap-3 p-4 bg-gradient-to-br from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 rounded-xl border border-amber-200 hover:border-amber-300 transition-all shadow-sm hover:shadow-md"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <ClipboardCheck className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-800">Review Batches</p>
                  <p className="text-xs text-slate-600">Check submissions</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Search & Filter Sidebar */}
          <div className="lg:col-span-1 animate-slideIn">
            <div className="bg-white rounded-xl shadow-md border border-slate-200 p-5 sticky top-6">
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center border border-emerald-100">
                  <Filter className="w-4 h-4 text-emerald-600" />
                </div>
                <h2 className="text-base font-bold text-slate-800">Filters</h2>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value.trim())}
                      placeholder="Search forms..."
                      className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all duration-200 bg-slate-50/50 hover:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Status
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: "all", label: "All Forms", count: stats.total, color: "slate" },
                      { value: "Draft", label: "Draft", count: stats.draft, color: "amber" },
                      { value: "Published", label: "Published", count: stats.published, color: "emerald" },
                    ].map((status) => (
                      <button
                        key={status.value}
                        onClick={() => setStatusFilter(status.value)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 border
                        ${statusFilter === status.value
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm"
                          : "bg-slate-50/50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                        }`}
                      >
                        <span>{status.label}</span>
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                          statusFilter === status.value
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-200 text-slate-600"
                        }`}>
                          {status.count}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Refresh Button */}
                <button
                  onClick={fetchForms}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 text-emerald-700 border border-emerald-200 rounded-lg font-semibold text-sm transition-all duration-200"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Forms List */}
          <div className="lg:col-span-3 animate-fadeIn">
            <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-emerald-600" />
                    </div>
                    <h2 className="text-base font-bold text-slate-800">Forms List</h2>
                  </div>
                  <div className="px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">
                    <span className="text-xs font-semibold text-emerald-700">
                      {filteredForms.length} {filteredForms.length === 1 ? "Form" : "Forms"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-5">
                <div className="max-h-[650px] overflow-y-auto custom-scrollbar pr-2">
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-16 text-slate-500">
                      <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                      </div>
                      <p className="text-sm font-medium text-slate-600">Loading forms...</p>
                    </div>
                  ) : filteredForms.length === 0 ? (
                    <div className="text-center p-12 text-slate-500 bg-gradient-to-br from-slate-50 to-emerald-50/30 rounded-xl border border-dashed border-slate-200">
                      <div className="w-16 h-16 rounded-full bg-emerald-100/50 flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-emerald-400" />
                      </div>
                      <p className="text-base font-semibold text-slate-700 mb-1">No forms found</p>
                      <p className="text-sm text-slate-500">Try adjusting your search or filter</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredForms.map((form, index) => {
                        const StatusIcon = getStatusIcon(form.status);
                        return (
                          <div
                            key={form.id}
                            onClick={() => handleFormClick(form)}
                            style={{ animationDelay: `${index * 40}ms` }}
                            className="form-card group flex items-center justify-between p-4 border border-slate-200 rounded-xl cursor-pointer transition-all duration-300 hover:border-emerald-200 bg-white"
                          >
                            <div className="flex-1 min-w-0 mr-4">
                              <div className="flex items-center gap-2.5 mb-2.5">
                                <h3 className="text-sm font-bold text-slate-800 truncate">
                                  {form.ref_no || "Draft Sample"}
                                </h3>
                                <div className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full border ${getStatusBadge(form.status)}`}>
                                  <StatusIcon className="w-2.5 h-2.5" />
                                  {form.status}
                                </div>
                              </div>

                              <div className="space-y-1.5">
                                <div className="flex items-center gap-2">
                                  <FlaskConical className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                                  <span className="text-xs font-medium text-slate-700 truncate">
                                    {form.sample_name || "Untitled Sample"}
                                  </span>
                                  {form.sample_type && (
                                    <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-medium rounded">
                                      {form.sample_type}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                  <span className="text-xs text-slate-500 truncate">
                                    {form.client_name || "No Client"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                  <span className="text-[11px] text-slate-400">
                                    Updated {formatDate(form.updated_at)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center">
                              <div className="w-9 h-9 rounded-lg bg-slate-50 group-hover:bg-emerald-50 flex items-center justify-center transition-all duration-300 border border-slate-200 group-hover:border-emerald-200">
                                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all duration-300" />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}