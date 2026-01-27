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
  ArrowRight,
  Sparkles,
  Layers,
  TrendingUp,
  BarChart3,
} from "lucide-react";

// --- Shared Static List Management ---
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
  onNavigate: (screen: "form" | "master", id?: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [forms, setForms] = useState<Form[]>([]);
  const [filteredForms, setFilteredForms] = useState<Form[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulse-soft {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
        .animate-slideIn { animation: slideIn 0.5s ease-out; }
        .form-card { animation: fadeIn 0.3s ease-out backwards; }
        .stat-card { animation: fadeIn 0.4s ease-out backwards; }
        .card-hover { transition: all 0.3s ease; }
        .card-hover:hover { transform: translateY(-2px); box-shadow: 0 12px 24px -8px rgba(16, 185, 129, 0.15); }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>

      <div className="max-w-[1600px] mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
            <div className="relative bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 px-8 py-8 overflow-hidden">
              {/* Decorative circles */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-400/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>
              
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center shadow-xl border border-white/20">
                    <FlaskConical className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white mb-1">
                      Feasibility Dashboard
                    </h1>
                    <p className="text-emerald-50 text-sm flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Manage and track all feasibility forms
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={fetchForms}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-lg transition-all duration-200 text-white font-medium shadow-lg"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Graphics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Feasibility Section Card */}
          <div className="animate-fadeIn">
            <div className="bg-white rounded-xl shadow-lg border border-emerald-200 overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col">
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-5 border-b border-emerald-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-emerald-900">Feasibility Forms</h3>
                    <p className="text-xs text-emerald-600">Create and manage requests</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                <p className="text-sm text-slate-600 mb-auto leading-relaxed">
                  Create new feasibility forms for sample testing. Manage parameters, verify compliance, and track all your testing requests in one place.
                </p>

                {/* Action Button */}
                <button
                  onClick={() => onNavigate("form")}
                  className="w-full group flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg mt-6"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New Request</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              </div>
            </div>
          </div>

          {/* Master Viewer Section Card */}
          <div className="animate-fadeIn" style={{ animationDelay: "100ms" }}>
            <div className="bg-white rounded-xl shadow-lg border border-emerald-200 overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col">
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-5 border-b border-emerald-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
                    <Database className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-emerald-900">Master Data Viewer</h3>
                    <p className="text-xs text-emerald-600">View and analyze data</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                <p className="text-sm text-slate-600 mb-5 leading-relaxed">
                  Access comprehensive commodity parameters, regulations, and audit logs. Advanced filtering and search capabilities for master data analysis.
                </p>
                
                {/* Features List - Single Row */}
                <div className="grid grid-cols-3 gap-3 mb-auto">
                  <div className="flex flex-row items-center justify-center">
                    <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center border border-emerald-200">
                      <Layers className="w-3 h-3 text-emerald-600" />
                    </div>
                    <span className="text-xs text-slate-700 font-medium ml-2">Commodity Master Data</span>
                  </div>
                  <div className="flex flex-row items-center text-center">
                    <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center border border-emerald-200">
                      <BarChart3 className="w-3 h-3 text-emerald-600" />
                    </div>
                    <span className="text-xs text-slate-700 font-medium ml-2">Audit Logs & History</span>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => onNavigate("master")}
                  className="w-full group flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg mt-6"
                >
                  <Database className="w-4 h-4" />
                  <span>Visit Master Viewer</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Search & Filter Sidebar */}
          <div className="lg:col-span-1 animate-slideIn">
            <div className="bg-white rounded-xl shadow-lg border border-slate-200/80 p-5 sticky top-6">
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
            <div className="bg-white rounded-xl shadow-lg border border-slate-200/80 overflow-hidden">
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
                            className="form-card group flex items-center justify-between p-4 border border-slate-200 rounded-xl cursor-pointer transition-all duration-300 hover:border-emerald-200 card-hover bg-white"
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