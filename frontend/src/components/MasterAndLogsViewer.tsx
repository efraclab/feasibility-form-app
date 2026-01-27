import { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import {
  Search,
  Filter,
  ChevronDown,
  Loader2,
  FileText,
  Beaker,
  Building2,
  Shield,
  ChevronLeft,
  ChevronRight,
  Package,
  Grid3x3,
  AlertCircle,
  X,
  ArrowLeft,
  Layers,
  History,
  Clock,
  Database,
} from "lucide-react";
import {
  fetchCommodityDetails,
  fetchCommodityOptions,
  fetchCommodityGroupOptions,
  fetchLabOptions,
  fetchRegulationOptions,
  fetchVerticalOptions,
  buildCommodityRequest,
} from "../services/MasterService";
import { fetchLogs } from "../services/LogService";
import type { CommodityDetail } from "../models/CommodityDetail";
import type { DropdownOption } from "../models/DropdownOption";
import type { FilterState } from "../models/FilterState";
import type { PaginationState } from "../models/PaginationState";
import type { LogResponse } from "../models/LogResponse";

interface CustomDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (code: string) => void;
  placeholder: string;
  disabled?: boolean;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface MasterViewerProps {
  onBack: () => void;
}

interface ParsedChange {
  field: string;
  oldValue: string;
  newValue: string;
}

const parseUpdationInfo = (updationInfo: string): ParsedChange[] => {
  if (!updationInfo) return [];

  const changes: ParsedChange[] = [];
  const parts = updationInfo.split(/Old /g).filter(Boolean);
  
  parts.forEach(part => {
    const match = part.match(/^(.+?):\s*(.+?)\s+to\s+New\s+\1:\s*(.+?)(?=Old |$)/s);
    if (match) {
      const [, field, oldValue, newValue] = match;
      changes.push({
        field: field.trim(),
        oldValue: oldValue.trim(),
        newValue: newValue.trim(),
      });
    }
  });

  return changes;
};

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder,
  disabled = false,
  label,
  icon: Icon,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [cachedDisplayValue, setCachedDisplayValue] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.code === value);
  
  // Update cached display value when we find a matching option
  useEffect(() => {
    if (selectedOption) {
      setCachedDisplayValue(selectedOption.name);
    } else if (!value) {
      // Clear cache only when value is explicitly cleared
      setCachedDisplayValue("");
    }
  }, [selectedOption, value]);
  
  // Use cached value if option not found but value exists, otherwise use current option name
  const displayValue = selectedOption ? selectedOption.name : (value ? cachedDisplayValue : "");

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(
    (opt) =>
      opt.name.toLowerCase().includes(search.toLowerCase()) ||
      opt.code.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSelect = (code: string) => {
    // Cache the display name immediately before onChange triggers data fetch
    const selected = options.find(opt => opt.code === code);
    if (selected) {
      setCachedDisplayValue(selected.name);
    }
    onChange(code);
    setIsOpen(false);
    setSearch("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCachedDisplayValue(""); // Clear cache when user clears selection
    onChange("");
    setSearch("");
  };

  return (
    <div
      ref={dropdownRef}
      className={`relative group ${
        disabled ? "opacity-60 pointer-events-none" : ""
      }`}
    >
      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-2">
        <Icon className="w-3.5 h-3.5 text-emerald-600" />
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          value={displayValue}
          onFocus={() => !disabled && setIsOpen(true)}
          disabled={disabled}
          readOnly
          className={`w-full px-4 py-2.5 text-sm border rounded-lg transition-all duration-300 placeholder-gray-400 cursor-pointer
            ${
              disabled
                ? "bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed"
                : value
                  ? "bg-emerald-50/50 border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  : "bg-white border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            }`}
          placeholder={placeholder}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {value && !disabled && (
            <button
              onClick={handleClear}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-3 h-3 text-gray-400 hover:text-gray-600" />
            </button>
          )}
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-all duration-300 pointer-events-none ${
              isOpen ? "rotate-180 text-emerald-500" : ""
            }`}
          />
        </div>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-emerald-200 rounded-lg shadow-xl overflow-hidden animate-slideDown">
          <div className="p-2.5 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full pl-9 pr-3 py-2 rounded-md text-sm bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all duration-200"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto custom-scrollbar">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-400">
                No options found
              </div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option.code}
                  onClick={() => handleSelect(option.code)}
                  className="px-4 py-2.5 text-sm hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 cursor-pointer transition-all duration-200 text-gray-700 hover:text-emerald-700 border-b border-gray-50 last:border-0 flex items-center justify-between"
                >
                  <span className="font-medium">{option.name}</span>
                  <span className="text-xs text-gray-400 font-mono">
                    {option.code}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default function MasterViewer({ onBack }: MasterViewerProps) {
  // Tab state
  const [activeTab, setActiveTab] = useState<"master" | "logs">("master");

  // Master Viewer States
  const [filters, setFilters] = useState<FilterState>({
    commodity: "",
    commodityGroup: "",
    regulation: "",
    vertical: "",
    searchFilter: "",
  });

  const [allCommodityData, setAllCommodityData] = useState<CommodityDetail[]>([]); // Store ALL data
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Store all fetched options from API
  const [allCommodityOptions, setAllCommodityOptions] = useState<DropdownOption[]>([]);
  const [allCommodityGroupOptions, setAllCommodityGroupOptions] = useState<DropdownOption[]>([]);
  const [allLabOptions, setAllLabOptions] = useState<DropdownOption[]>([]);
  const [allRegulationOptions, setAllRegulationOptions] = useState<DropdownOption[]>([]);
  const [allVerticalOptions, setAllVerticalOptions] = useState<DropdownOption[]>([]);

  const [pagination, setPagination] = useState<PaginationState>({
    pageNumber: 1,
    pageSize: 20,
    hasMore: false,
  });

  // Audit Logs States
  const [logs, setLogs] = useState<LogResponse[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsError, setLogsError] = useState<string | null>(null);
  const [logsPage, setLogsPage] = useState(1);
  const logsPageSize = 20;

  const tableTopRef = useRef<HTMLDivElement>(null);

  // Calculate derived values from all data
  const totalCount = allCommodityData.length;
  const totalPages = Math.ceil(totalCount / pagination.pageSize);
  
  // Get current page's data slice
  const startIndex = (pagination.pageNumber - 1) * pagination.pageSize;
  const endIndex = startIndex + pagination.pageSize;
  const commodityData = allCommodityData.slice(startIndex, endIndex);

  // Load dropdown options on mount
  useEffect(() => {
    loadDropdownOptions();
  }, []);

  const loadDropdownOptions = async () => {
    try {
      const [commodity, commodityGroup, lab, regulation, vertical] =
        await Promise.all([
          fetchCommodityOptions(),
          fetchCommodityGroupOptions(),
          fetchLabOptions(),
          fetchRegulationOptions(),
          fetchVerticalOptions(),
        ]);

      setAllCommodityOptions(commodity);
      setAllCommodityGroupOptions(commodityGroup);
      setAllLabOptions(lab);
      setAllRegulationOptions(regulation);
      setAllVerticalOptions(vertical);
    } catch (err) {
      console.error("Error loading dropdown options:", err);
    }
  };

  // Load master data when filters change (not pagination)
  useEffect(() => {
    if (activeTab === "master") {
      loadCommodityData();
    }
  }, [filters, activeTab]); // Removed pagination.pageNumber from dependencies

  // Load logs when logs tab is active
  useEffect(() => {
    if (activeTab === "logs") {
      loadLogs();
    }
  }, [logsPage, activeTab]);

  const loadCommodityData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const request = buildCommodityRequest(
        filters,
      );

      const response = await fetchCommodityDetails(request);

      if (response && Array.isArray(response.data)) {
        setAllCommodityData(response.data); // Store ALL data
        setPagination((prev) => ({ 
          ...prev, 
          pageNumber: 1, // Reset to page 1 when data changes
          hasMore: false 
        }));
      } else {
        setAllCommodityData([]);
        setPagination((prev) => ({ ...prev, pageNumber: 1, hasMore: false }));
      }
    } catch (err) {
      console.error("Error loading commodity data:", err);
      setError("Failed to load data. Please try again.");
      setAllCommodityData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadLogs = async () => {
    setLogsLoading(true);
    setLogsError(null);

    try {
      const response = await fetchLogs({
        pageNumber: logsPage,
        pageSize: logsPageSize,
      });

      setLogs(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error("Error loading logs:", err);
      setLogsError("Failed to load audit logs. Please try again.");
      setLogs([]);
    } finally {
      setLogsLoading(false);
    }
  };

  // Helper function to check if any filter is selected
  const hasAnyFilterSelected = () => {
    return !!(
      filters.commodity ||
      filters.commodityGroup ||
      filters.regulation ||
      filters.vertical ||
      filters.searchFilter
    );
  };

  // Helper function to extract unique options from current data
  const getUniqueOptionsFromData = (field: keyof CommodityDetail): DropdownOption[] => {
    const uniqueMap = new Map<string, string>();
    
    allCommodityData.forEach((item) => {
      let code = "";
      let name = "";
      
      switch (field) {
        case "commodityCode":
          code = item.commodityCode;
          name = item.commodityName;
          break;
        case "commodityGroupCode":
          code = item.commodityGroupCode;
          name = item.commodityGroupName;
          break;
        case "regulationCode":
          code = item.regulationCode;
          name = item.regulationName;
          break;
        case "verticalName":
          code = item.verticalName; // Use name as code for vertical
          name = item.verticalName;
          break;
      }
      
      if (code && name) {
        uniqueMap.set(code, name);
      }
    });
    
    return Array.from(uniqueMap.entries()).map(([code, name]) => ({
      code,
      name,
    }));
  };

  // Get filtered options based on whether filters are selected
  const getFilteredOptions = (
    allOptions: DropdownOption[],
    field: keyof CommodityDetail
  ): DropdownOption[] => {
    if (!hasAnyFilterSelected()) {
      // No filters selected - show all options from API
      return allOptions;
    } else {
      // Filters selected - show only options present in current data
      return getUniqueOptionsFromData(field);
    }
  };

  // Get options for each dropdown
  const commodityOptions = getFilteredOptions(allCommodityOptions, "commodityCode");
  const commodityGroupOptions = getFilteredOptions(allCommodityGroupOptions, "commodityGroupCode");
  const regulationOptions = getFilteredOptions(allRegulationOptions, "regulationCode");
  const verticalOptions = getFilteredOptions(allVerticalOptions, "verticalName");

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, pageNumber: 1 }));
  };

  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({ ...prev, searchFilter: value }));
    setPagination((prev) => ({ ...prev, pageNumber: 1 }));
  };

  const handleClearAllFilters = () => {
    setFilters({
      commodity: "",
      commodityGroup: "",
      regulation: "",
      vertical: "",
      searchFilter: "",
    });
    setPagination((prev) => ({ ...prev, pageNumber: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPagination((prev) => ({ ...prev, pageNumber: newPage }));
      if (tableTopRef.current) {
        tableTopRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }
  };

  const handleLogsPageChange = (newPage: number) => {
    setLogsPage(newPage);
    if (tableTopRef.current) {
      tableTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const exportToExcel = () => {
    if (commodityData.length === 0) {
      alert("No data to export");
      return;
    }

    const exportData = commodityData.map((item, index) => ({
      "#": index + 1,
      "Commodity Name": item.commodityName,
      "Commodity Code": item.commodityCode,
      "Commodity Group": item.commodityGroupName,
      "Commodity Group Code": item.commodityGroupCode,
      "Parameter Name": item.parameterName,
      "Parameter Code": item.parameterCode,
      "Parameter Group": item.parameterGroupName,
      "Parameter Group Code": item.parameterGroupCode,
      TAT: item.tat,
      "Lab Name": item.labName,
      "Lab Code": item.labCode,
      "NABL Scope": item.nablScope ? "Yes" : "No",
      Regulation: item.regulationName,
      Vertical: item.verticalName,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Commodity Master");

    const colWidths = [
      { wch: 5 },
      { wch: 30 },
      { wch: 15 },
      { wch: 30 },
      { wch: 20 },
      { wch: 30 },
      { wch: 15 },
      { wch: 30 },
      { wch: 20 },
      { wch: 10 },
      { wch: 30 },
      { wch: 15 },
      { wch: 12 },
      { wch: 20 },
      { wch: 20 },
    ];
    worksheet["!cols"] = colWidths;

    XLSX.writeFile(workbook, "commodity_master_data.xlsx");
  };

  const formatValue = (value: string) => {
    if (!value) return <span className="text-slate-400 italic text-sm">Empty</span>;
    
    if (value.includes('<') && value.includes('>')) {
      return (
        <div 
          className="text-sm text-slate-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: value }}
        />
      );
    }
    
    return <span className="text-sm text-slate-700 leading-relaxed">{value}</span>;
  };

  const logsWithChanges = logs.map(log => ({
    ...log,
    changes: parseUpdationInfo(log.updationInfo)
  })).filter(log => log.changes.length > 0);

  // Pagination Component for Logs - Matching Master Viewer Style
  const LogsPaginationControls = () => (
    <div className="flex items-center justify-between">
      <div className="text-sm text-slate-600">
        Showing{" "}
        <span className="font-semibold text-slate-800">
          {(logsPage - 1) * logsPageSize + 1}
        </span>{" "}
        to{" "}
        <span className="font-semibold text-slate-800">
          {Math.min(logsPage * logsPageSize, (logsPage - 1) * logsPageSize + logsWithChanges.length)}
        </span>{" "}
        of page{" "}
        <span className="font-semibold text-emerald-700">
          {logsPage}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => handleLogsPageChange(Math.max(1, logsPage - 1))}
          disabled={logsPage === 1}
          className="px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4 text-slate-600" />
          <span className="text-sm font-medium text-slate-600">
            Previous
          </span>
        </button>

        <div className="px-4 py-2 bg-emerald-50 border-2 border-emerald-200 rounded-lg">
          <span className="text-sm font-bold text-emerald-700">
            {logsPage}
          </span>
        </div>

        <button
          onClick={() => handleLogsPageChange(logsPage + 1)}
          disabled={logs.length < logsPageSize}
          className="px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
        >
          <span className="text-sm font-medium text-slate-600">
            Next
          </span>
          <ChevronRight className="w-4 h-4 text-slate-600" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-teal-50/30">
      <div className="max-w-[1800px] mx-auto px-8 py-10">
        {/* Header Section */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
            <div className="relative bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 px-8 py-8 overflow-hidden">
              {/* Decorative circles */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-400/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>

              <div className="relative">
                <button
                  onClick={onBack}
                  className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors duration-200 mb-6 text-sm font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Dashboard
                </button>

                <div className="flex items-center gap-4 mb-2">
                  <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                    <Database className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-1">
                      Master Data Viewer
                    </h1>
                    <p className="text-emerald-50 text-sm">
                      Browse and manage commodity master data
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-200 px-8">
              <div className="flex gap-6">
                <button
                  onClick={() => setActiveTab("master")}
                  className={`relative px-6 py-4 font-semibold text-sm transition-all duration-300 ${
                    activeTab === "master"
                      ? "text-emerald-600"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Layers className="w-4 h-4" />
                    Master Data
                  </div>
                  {activeTab === "master" && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-600"></div>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("logs")}
                  className={`relative px-6 py-4 font-semibold text-sm transition-all duration-300 ${
                    activeTab === "logs"
                      ? "text-emerald-600"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <History className="w-4 h-4" />
                    Audit Logs
                  </div>
                  {activeTab === "logs" && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-600"></div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Master Data Tab Content */}
        {activeTab === "master" && (
          <>
            {/* Filter Section */}
            <div className="mb-6 bg-white rounded-xl shadow-lg border border-slate-200 ">
              <div className="bg-gradient-to-r from-slate-50 to-white px-6 py-4 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
                      <Filter className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">
                      Filters
                    </h2>
                  </div>
                  <button
                    onClick={handleClearAllFilters}
                    className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-all duration-300"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Search Filter */}
                <div className="mb-6">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Search className="w-3.5 h-3.5 text-emerald-600" />
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" />
                    <input
                      type="text"
                      value={filters.searchFilter}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      placeholder="Search by commodity, parameter, lab, regulation, or vertical..."
                      className="w-full pl-12 pr-4 py-3 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Dropdown Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <CustomDropdown
                    label="Commodity"
                    icon={Package}
                    options={commodityOptions}
                    value={filters.commodity}
                    onChange={(value) => handleFilterChange("commodity", value)}
                    placeholder="Select Commodity"
                  />
                  <CustomDropdown
                    label="Commodity Group"
                    icon={Grid3x3}
                    options={commodityGroupOptions}
                    value={filters.commodityGroup}
                    onChange={(value) =>
                      handleFilterChange("commodityGroup", value)
                    }
                    placeholder="Select Commodity Group"
                  />
                  <CustomDropdown
                    label="Regulation"
                    icon={Shield}
                    options={regulationOptions}
                    value={filters.regulation}
                    onChange={(value) => handleFilterChange("regulation", value)}
                    placeholder="Select Regulation"
                  />
                  <CustomDropdown
                    label="Vertical"
                    icon={Building2}
                    options={verticalOptions}
                    value={filters.vertical}
                    onChange={(value) => handleFilterChange("vertical", value)}
                    placeholder="Select Vertical"
                  />
                </div>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-red-900 text-sm">Error</h3>
                  <p className="text-red-700 text-sm mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Data Table */}
            <div
              ref={tableTopRef}
              className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-slate-50 via-emerald-50/30 to-teal-50/20 px-6 py-4 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">
                      Commodity Data
                    </h2>
                  </div>
                  <button
                    onClick={exportToExcel}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-all duration-300"
                  >
                    Export to Excel
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-24">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center mb-4 shadow-md">
                      <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                    </div>
                    <p className="text-base font-medium text-slate-600">
                      Loading data...
                    </p>
                  </div>
                ) : commodityData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24">
                    <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4 shadow-sm">
                      <AlertCircle className="w-8 h-8 text-amber-600" />
                    </div>
                    <p className="text-lg font-semibold text-slate-700 mb-2">
                      No Data Found
                    </p>
                    <p className="text-sm text-slate-500">
                      Try adjusting your filters or search criteria
                    </p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50">
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider border-b-2 border-emerald-200">
                          #
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider border-b-2 border-emerald-200">
                          Commodity
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider border-b-2 border-emerald-200">
                          Commodity Group
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider border-b-2 border-emerald-200">
                          Parameter
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider border-b-2 border-emerald-200">
                          Parameter Group
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider border-b-2 border-emerald-200">
                          TAT
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider border-b-2 border-emerald-200">
                          Lab
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider border-b-2 border-emerald-200">
                          NABL Scope
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider border-b-2 border-emerald-200">
                          Regulation
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider border-b-2 border-emerald-200">
                          Vertical
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {commodityData.map((item, index) => (
                        <tr
                          key={index}
                          className="border-b border-slate-100 hover:bg-gradient-to-r hover:from-emerald-50/30 hover:to-teal-50/20 transition-colors duration-150"
                        >
                          <td className="px-4 py-3 text-sm font-medium text-slate-600">
                            {(pagination.pageNumber - 1) * pagination.pageSize +
                              index +
                              1}
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-sm font-medium text-slate-700">
                                {item.commodityName}
                              </p>
                              <p className="text-xs text-slate-400 font-mono mt-0.5">
                                {item.commodityCode}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-sm font-medium text-slate-700">
                                {item.commodityGroupName}
                              </p>
                              <p className="text-xs text-slate-400 font-mono mt-0.5">
                                {item.commodityGroupCode}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-sm font-semibold text-emerald-700">
                                {item.parameterName}
                              </p>
                              <p className="text-xs text-slate-400 font-mono mt-0.5">
                                {item.parameterCode}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-sm font-medium text-slate-700">
                                {item.parameterGroupName}
                              </p>
                              <p className="text-xs text-slate-400 font-mono mt-0.5">
                                {item.parameterGroupCode}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm font-medium text-slate-700">
                              {item.tat}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center border border-emerald-100">
                                <Beaker className="w-3.5 h-3.5 text-emerald-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-700">
                                  {item.labName}
                                </p>
                                <p className="text-xs text-slate-400 font-mono">
                                  {item.labCode}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {item.nablScope ? (
                              <span className="inline-flex items-center px-2.5 py-1 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-full text-xs font-semibold text-green-700">
                                Yes
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-1 bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-full text-xs font-semibold text-gray-500">
                                No
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-full text-xs font-semibold text-amber-700">
                              <Shield className="w-3 h-3" />
                              {item.regulationName}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center justify-center min-w-[100px] gap-1.5 px-2.5 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-full text-xs font-semibold text-blue-700">
                              <Building2 className="w-3 h-3" />
                              {item.verticalName}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Pagination */}
              {!isLoading && commodityData.length > 0 && (
                <div className="px-6 py-4 border-t border-slate-100 bg-gradient-to-r from-slate-50/80 to-white">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-600">
                      Showing{" "}
                      <span className="font-semibold text-slate-800">
                        {(pagination.pageNumber - 1) * pagination.pageSize + 1}
                      </span>{" "}
                      to{" "}
                      <span className="font-semibold text-slate-800">
                        {Math.min(
                          pagination.pageNumber * pagination.pageSize,
                          totalCount,
                        )}
                      </span>{" "}
                      of{" "}
                      <span className="font-semibold text-emerald-700">
                        {totalCount}
                      </span>{" "}
                      parameters
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(pagination.pageNumber - 1)}
                        disabled={pagination.pageNumber === 1}
                        className="px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
                      >
                        <ChevronLeft className="w-4 h-4 text-slate-600" />
                        <span className="text-sm font-medium text-slate-600">
                          Previous
                        </span>
                      </button>

                      {/* Page Numbers */}
                      <div className="flex items-center gap-1">
                        {pagination.pageNumber > 2 && (
                          <>
                            <button
                              onClick={() => handlePageChange(1)}
                              className="px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all duration-200 text-sm font-medium text-slate-600"
                            >
                              1
                            </button>
                            {pagination.pageNumber > 3 && (
                              <span className="px-2 text-slate-400">...</span>
                            )}
                          </>
                        )}

                        {pagination.pageNumber > 1 && (
                          <button
                            onClick={() =>
                              handlePageChange(pagination.pageNumber - 1)
                            }
                            className="px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all duration-200 text-sm font-medium text-slate-600"
                          >
                            {pagination.pageNumber - 1}
                          </button>
                        )}

                        <div className="px-4 py-2 bg-emerald-50 border-2 border-emerald-200 rounded-lg">
                          <span className="text-sm font-bold text-emerald-700">
                            {pagination.pageNumber}
                          </span>
                        </div>

                        {pagination.pageNumber < totalPages && (
                          <button
                            onClick={() =>
                              handlePageChange(pagination.pageNumber + 1)
                            }
                            className="px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all duration-200 text-sm font-medium text-slate-600"
                          >
                            {pagination.pageNumber + 1}
                          </button>
                        )}

                        {pagination.pageNumber < totalPages - 1 && (
                          <>
                            {pagination.pageNumber < totalPages - 2 && (
                              <span className="px-2 text-slate-400">...</span>
                            )}
                            <button
                              onClick={() => handlePageChange(totalPages)}
                              className="px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all duration-200 text-sm font-medium text-slate-600"
                            >
                              {totalPages}
                            </button>
                          </>
                        )}
                      </div>

                      <button
                        onClick={() => handlePageChange(pagination.pageNumber + 1)}
                        disabled={pagination.pageNumber >= totalPages}
                        className="px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
                      >
                        <span className="text-sm font-medium text-slate-600">
                          Next
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-600" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Audit Logs Tab Content */}
        {activeTab === "logs" && (
          <>
            {/* Error Alert */}
            {logsError && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-red-900 text-sm">Error</h3>
                  <p className="text-red-700 text-sm mt-1">{logsError}</p>
                </div>
              </div>
            )}

            {/* Logs Table */}
            <div
              ref={tableTopRef}
              className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-slate-50 via-emerald-50/30 to-teal-50/20 px-6 py-4 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">
                      Change History
                    </h2>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg shadow-sm">
                      <span className="text-sm font-semibold text-white">
                        {logsWithChanges.length} Logs
                      </span>
                    </div>
                    <div className="px-4 py-2 bg-slate-100 rounded-lg">
                      <span className="text-sm font-semibold text-slate-700">
                        Page {logsPage}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Pagination */}
              {!logsLoading && logsWithChanges.length > 0 && (
                <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white">
                  <LogsPaginationControls />
                </div>
              )}

              {/* Table Container */}
              <div className="overflow-x-auto">
                {logsLoading ? (
                  <div className="flex flex-col items-center justify-center py-24">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center mb-4 shadow-md">
                      <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                    </div>
                    <p className="text-base font-medium text-slate-600">Loading audit logs...</p>
                  </div>
                ) : logsWithChanges.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24">
                    <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4 shadow-sm">
                      <AlertCircle className="w-8 h-8 text-amber-600" />
                    </div>
                    <p className="text-lg font-semibold text-slate-700 mb-2">No Changes Found</p>
                    <p className="text-sm text-slate-500">There are no audit logs with changes on this page</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50">
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider border-b-2 border-emerald-200">
                            #
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider border-b-2 border-emerald-200">
                            User
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider border-b-2 border-emerald-200">
                            Registration No
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider border-b-2 border-emerald-200">
                            Timestamp
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider border-b-2 border-emerald-200">
                            System
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider border-b-2 border-emerald-200">
                            Change Type
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider border-b-2 border-emerald-200 bg-slate-50">
                            Field Changed
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider border-b-2 border-emerald-200 bg-red-50/50">
                            Previous Value
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider border-b-2 border-emerald-200 bg-emerald-50/50">
                            Updated Value
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {logsWithChanges.flatMap((log, logIndex) => 
                          log.changes.map((change, changeIndex) => (
                            <tr 
                              key={`${logIndex}-${changeIndex}`} 
                              className="border-b border-slate-100 hover:bg-gradient-to-r hover:from-emerald-50/30 hover:to-teal-50/20 transition-colors duration-150"
                            >
                              {changeIndex === 0 && (
                                <>
                                  <td 
                                    className="px-6 py-4 text-sm font-medium text-slate-600 border-r border-slate-200/50"
                                    rowSpan={log.changes.length}
                                  >
                                    {(logsPage - 1) * logsPageSize + logIndex + 1}
                                  </td>
                                  <td 
                                    className="px-6 py-4 border-r border-slate-200/50"
                                    rowSpan={log.changes.length}
                                  >
                                    <div className="flex items-center gap-2.5">
                                      <span className="text-xs font-semibold text-slate-800">
                                        {log.username}
                                      </span>
                                    </div>
                                  </td>
                                  <td 
                                    className="px-6 py-4 border-r border-slate-200/50"
                                    rowSpan={log.changes.length}
                                  >
                                    <span className="text-xs font-mono text-slate-700 bg-slate-50 px-2 py-1.5 rounded-md">
                                      {log.regNo}
                                    </span>
                                  </td>
                                  <td 
                                    className="px-6 py-4 border-r border-slate-200/50"
                                    rowSpan={log.changes.length}
                                  >
                                    <div className="flex items-center gap-2">
                                      <Clock className="w-4 h-4 text-slate-400" />
                                      <span className="text-xs text-slate-600">
                                        {log.timestamp}
                                      </span>
                                    </div>
                                  </td>
                                  <td 
                                    className="px-6 py-4 border-r border-slate-200/50"
                                    rowSpan={log.changes.length}
                                  >
                                    <span className="inline-block text-xs text-slate-700 font-medium">
                                      {log.userSystem}
                                    </span>
                                  </td>
                                  <td 
                                    className="px-6 py-4 border-r border-slate-200/50"
                                    rowSpan={log.changes.length}
                                  >
                                    {log.change && (
                                      <span className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-emerald-700">
                                        {log.change}
                                      </span>
                                    )}
                                  </td>
                                </>
                              )}
                              <td className="px-6 py-4 bg-slate-50/80 border-r border-slate-200">
                                <span className="text-xs font-bold text-slate-800">
                                  {change.field}
                                </span>
                              </td>
                              <td className="px-6 py-4 bg-red-50/40 border-r border-red-100">
                                <div className="max-w-lg text-xs">
                                  {formatValue(change.oldValue)}
                                </div>
                              </td>
                              <td className="px-6 py-4 bg-emerald-50/40">
                                <div className="max-w-lg text-xs">
                                  {formatValue(change.newValue)}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Bottom Pagination */}
              {!logsLoading && logsWithChanges.length > 0 && (
                <div className="px-6 py-4 border-t border-slate-100 bg-gradient-to-r from-slate-50/80 to-white">
                  <LogsPaginationControls />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}