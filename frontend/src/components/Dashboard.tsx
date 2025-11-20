import React, { useState, useEffect } from "react";
import {
  Search,
  FlaskConical,
  Calendar,
  FileText,
  ChevronRight,
  Loader2,
  Package,
  Building2,
  Filter,
  RefreshCw,
  Plus,
  TrendingUp,
  Clock,
  CheckCircle2,
  FileEdit,
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
    status: 'draft' | 'published';
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
    return forms.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
}

interface DashboardProps {
    onNavigate: (screen: 'form', id?: string) => void; 
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
      // Simulate network delay for effect
      await new Promise((resolve) => setTimeout(resolve, 500));
      const allForms: FormDetails[] = getAllForms();
      
      const displayForms: Form[] = allForms.map(f => ({
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
    onNavigate('form', form.id);
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
      draft: "bg-amber-50 text-amber-700 border-amber-200",
      published: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
    return styles[status as keyof typeof styles] || styles.draft;
  };

  const getStatusIcon = (status: string) => {
    return status === 'published' ? CheckCircle2 : FileEdit;
  };

  // Calculate stats
  const stats = {
    total: forms.length,
    draft: forms.filter(f => f.status === 'draft').length,
    published: forms.filter(f => f.status === 'published').length,
  };

  return (
    <div className="min-h-screen bg-white"> 
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
        .animate-slideIn { animation: slideIn 0.4s ease-out; }
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: linear-gradient(to bottom, #10b9817a, #059669); /* Emerald Gradient */
          border-radius: 4px; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { 
          background: linear-gradient(to bottom, #059669, #047857); /* Darker Emerald Gradient */
        }
        .card-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .card-hover:hover {
          transform: translateY(-2px);
        }
        .gradient-border {
          position: relative;
          background: white;
        }
        .gradient-border::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 0.75rem;
          padding: 1px;
          background: linear-gradient(135deg, #10b981, #059669); /* Emerald Gradient */
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.3s;
        }
        .gradient-border:hover::before {
          opacity: 1;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-700 px-8 py-10">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center shadow-lg shadow-black/20">
                    <FlaskConical className="w-8 h-8 text-emerald-600" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                      Forms Dashboard
                    </h1>
                    <p className="text-emerald-200 text-sm mt-1.5">
                      Manage and track all sample registration forms
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={fetchForms} 
                    disabled={isLoading} // Disabled when loading
                    className="flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-300 font-medium text-sm shadow-lg hover:shadow-xl border border-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {/* Conditional class for spinning animation */}
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                  <button
                    onClick={() => onNavigate("form")}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-emerald-50 text-emerald-700 text-sm font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Plus className="w-4 h-4" />
                    New Sample Request
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6"> 
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm card-hover">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      Total Forms
                    </p>
                    <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 border border-amber-200 shadow-sm card-hover">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1">
                      Draft Forms
                    </p>
                    <p className="text-3xl font-bold text-amber-700">{stats.draft}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-amber-50 flex items-center justify-center">
                    <FileEdit className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 border border-emerald-200 shadow-sm card-hover">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">
                      Published Forms
                    </p>
                    <p className="text-3xl font-bold text-emerald-700">{stats.published}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
          {/* Search & Filter Sidebar */}
          <div className="lg:col-span-1 animate-slideIn">
            <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-6 sticky top-6"> 
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <Filter className="w-4 h-4 text-emerald-700" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">
                  Filters
                </h2>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value.trim())}
                      placeholder="Search forms..."
                      className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                    Status
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: "all", label: "All Forms", count: stats.total },
                      { value: "draft", label: "Draft", count: stats.draft },
                      { value: "published", label: "Published", count: stats.published }
                    ].map((status) => (
                      <button
                        key={status.value}
                        onClick={() => setStatusFilter(status.value)}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 border
                        ${
                          statusFilter === status.value
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                        }`}
                      >
                        <span>{status.label}</span>
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                          statusFilter === status.value 
                            ? "bg-emerald-100 text-emerald-700" 
                            : "bg-slate-100 text-slate-600"
                        }`}>
                          {status.count}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Forms List */}
          <div className="lg:col-span-3 animate-fadeIn">
            <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 bg-white"> 
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-emerald-700" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Forms List
                    </h2>
                  </div>
                  <div className="px-3 py-1 bg-emerald-50 rounded-full border border-emerald-200">
                    <span className="text-sm font-semibold text-emerald-700">
                      {filteredForms.length} {filteredForms.length === 1 ? 'form' : 'forms'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="max-h-[700px] overflow-y-auto custom-scrollbar pr-2"> 
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-16 text-slate-500">
                      <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
                      <p className="mt-4 text-sm font-medium">
                        Loading forms...
                      </p>
                    </div>
                  ) : filteredForms.length === 0 ? (
                    <div className="text-center p-16 text-slate-500 bg-emerald-50 rounded-xl border-2 border-dashed border-emerald-200">
                      <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-emerald-500" />
                      </div>
                      <p className="text-base font-semibold text-emerald-700 mb-1">
                        No forms found
                      </p>
                      <p className="text-sm text-emerald-500">
                        Try adjusting your search or filter criteria
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredForms.map((form, index) => {
                        const StatusIcon = getStatusIcon(form.status);
                        return (
                          <div
                            key={form.id}
                            onClick={() => handleFormClick(form)}
                            style={{ animationDelay: `${index * 50}ms` }}
                            className="gradient-border group flex items-center justify-between p-5 border border-slate-200 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg card-hover bg-white"
                          >
                            <div className="flex-1 min-w-0 mr-4">
                              <div className="flex items-center gap-3 mb-3">
                                <h3 className="text-base font-bold text-slate-900 truncate">
                                  {form.ref_no || "Draft Sample"}
                                </h3>
                                <div className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(form.status)}`}>
                                  <StatusIcon className="w-3 h-3" />
                                  {form.status}
                                </div>
                              </div>

                              <div className="space-y-2">
                                <div className="flex items-center gap-2.5">
                                  <FlaskConical className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                  <span className="text-sm font-medium text-slate-700 truncate">
                                    {form.sample_name || "Untitled Sample"}
                                  </span>
                                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-medium rounded">
                                    {form.sample_type}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                  <Building2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                  <span className="text-sm text-slate-600 truncate">
                                    {form.client_name || "No Client"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                  <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                  <span className="text-xs text-slate-500">
                                    Updated {formatDate(form.updated_at)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="w-10 h-10 rounded-lg bg-emerald-50 group-hover:bg-emerald-100 flex items-center justify-center transition-colors duration-300 border border-emerald-200 group-hover:border-emerald-300">
                                <ChevronRight className="w-5 h-5 text-emerald-600 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all duration-300" />
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