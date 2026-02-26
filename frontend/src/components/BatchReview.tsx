import { useState, useEffect } from "react";
import {
  ChevronLeft,
  Save,
  X,
  Loader2,
  Edit3,
  Table as TableIcon,
  Clock,
  CheckCircle,
  Ban,
  AlertTriangle,
  FileText,
  CheckCircle2,
  XOctagon,
  Check,
  AlertCircle,
  Info,
  RefreshCw,
  Send,
} from "lucide-react";
import { searchParameters, updateParameters } from "../services/ParameterService";
import type { ParameterData } from "../models/ParameterData";
import type { ParameterUpdateRequest } from '../models/ParameterUpdateRequest';

/**
 * NOTE: The ParameterData interface should include the following field:
 * reasonForRejection?: string;
 * 
 * This field stores the reason when a parameter is rejected and is displayed
 * in the "Remarks" column in the Rejected parameters table.
 */

interface BatchReviewProps {
  employeeId: string,
  username: string,
  role: string,
  batchId: number;
  onBack: () => void;
}

interface ConfirmationDialog {
  isOpen: boolean;
  type: "approve" | "reject" | "save" | "cancel" | "resubmit" | null;
  title: string;
  message: string;
  confirmText: string;
  onConfirm: () => void;
}

interface Toast {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
}

type ParameterStatus = "Pending" | "Approved" | "Rejected";

const COLUMN_HEADERS = [
  { key: "parameterName", label: "Parameter Name" },
  { key: "parameterCode", label: "Parameter Code" },
  { key: "parameterGroup", label: "Parameter Group" },
  { key: "parameterGroupCode", label: "Parameter Group Code" },
  { key: "parameterSubGroup", label: "Parameter Sub-Group" },
  { key: "parameterSubGroupCode", label: "Parameter Sub-Group Code" },
  { key: "commodityName", label: "Commodity Name" },
  { key: "commodityCode", label: "Commodity Code" },
  { key: "commodityGroup", label: "Commodity Group" },
  { key: "commodityGroupCode", label: "Commodity Group Code" },
  { key: "nonFssaiFssaiDrug", label: "Non FSSAI/FSSAI/Drug" },
  { key: "nonFssaiFssaiDrugCode", label: "Non FSSAI/FSSAI/Drug Code" },
  { key: "regulationName", label: "Regulation Name" },
  { key: "regulationCode", label: "Regulation Code" },
  { key: "parameterLabDistribution", label: "Parameter Lab Distribution" },
  { key: "labCode", label: "Lab Code" },
  { key: "tatDays", label: "TAT Days" },
  { key: "parameterSequence", label: "Parameter Sequence" },
  { key: "outsourceYN", label: "Outsource Y/N" },
  { key: "sampleQuantityAnalysis", label: "Sample Quantity Analysis" },
  { key: "sampleQuantityRetention", label: "Sample Quantity Retention" },
  { key: "requiredSampleQuantityUnit", label: "Required Sample Quantity Unit" },
  { key: "unitCode", label: "Unit Code" },
  { key: "nablScopeStatus", label: "NABL Scope Status" },
  { key: "methodName", label: "Method Name" },
  { key: "methodCode", label: "Method Code" },
  { key: "specificationName", label: "Specification Name" },
  { key: "specificationCode", label: "Specification Code" },
  { key: "fssaiCategoryNo", label: "FSSAI Category No" },
  { key: "subClause", label: "Sub Clause" },
  { key: "testUnit", label: "Test Unit" },
  { key: "testCode", label: "Test Code" },
  { key: "instrument", label: "Instrument" },
  { key: "loq", label: "LOQ" },
  { key: "parameterIndividualRate", label: "Parameter Individual Rate" },
  { key: "regulatoryRateDrug", label: "Regulatory Rate Drug" },
  { key: "addInfo", label: "Additional Info" },
];

// Custom Toast Component
function ToastContainer({ toasts, removeToast }: { toasts: Toast[], removeToast: (id: string) => void }) {
  return (
    <div className="fixed top-4 right-4 z-[10000] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function Toast({ toast, onClose }: { toast: Toast, onClose: () => void }) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onClose, 300);
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const config = {
    success: {
      bgColor: "bg-gradient-to-r from-emerald-500 to-teal-600",
      icon: Check,
      borderColor: "border-emerald-400",
    },
    error: {
      bgColor: "bg-gradient-to-r from-red-500 to-rose-600",
      icon: AlertCircle,
      borderColor: "border-red-400",
    },
    warning: {
      bgColor: "bg-gradient-to-r from-amber-500 to-orange-600",
      icon: AlertTriangle,
      borderColor: "border-amber-400",
    },
    info: {
      bgColor: "bg-gradient-to-r from-blue-500 to-indigo-600",
      icon: Info,
      borderColor: "border-blue-400",
    },
  };

  const { bgColor, icon: Icon, borderColor } = config[toast.type];

  return (
    <div
      className={`${bgColor} text-white rounded-xl shadow-2xl border-2 ${borderColor} overflow-hidden pointer-events-auto transform transition-all duration-300 ${
        isExiting ? "translate-x-full opacity-0" : "translate-x-0 opacity-100"
      }`}
      style={{ animation: isExiting ? "" : "slideIn 0.3s ease-out" }}
    >
      <div className="flex items-center gap-3 px-4 py-3 min-w-[320px] max-w-md">
        <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5" />
        </div>
        <p className="flex-1 text-sm font-medium leading-snug">{toast.message}</p>
        <button
          onClick={() => {
            setIsExiting(true);
            setTimeout(onClose, 300);
          }}
          className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function BatchReview({ employeeId, username, role, batchId, onBack }: BatchReviewProps) {
  const [batchData, setBatchData] = useState<ParameterData[]>([]);
  const [editedData, setEditedData] = useState<ParameterData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState<ParameterStatus>("Pending");
  const [confirmDialog, setConfirmDialog] = useState<ConfirmationDialog>({
    isOpen: false,
    type: null,
    title: "",
    message: "",
    confirmText: "",
    onConfirm: () => {},
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [toasts, setToasts] = useState<Toast[]>([]);

  const isReviewer = () => {
    return ["EC57285", "EC56887"].includes(employeeId);
  };


  const showToast = (type: Toast["type"], message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Helper function to get parameter status from addInfo
  const getParameterStatus = (param: ParameterData): ParameterStatus => {
    if (param.status === 'Rejected') return "Rejected";
    if (param.status === 'Approved') return "Approved";
    return "Pending";
  };

  // Filter parameters by status
  const getParametersByStatus = (status: ParameterStatus) => {
    return editedData.filter(param => getParameterStatus(param) === status);
  };

  const pendingParams = getParametersByStatus("Pending");
  const approvedParams = getParametersByStatus("Approved");
  const rejectedParams = getParametersByStatus("Rejected");

  const statusCounts = {
    Pending: pendingParams.length,
    Approved: approvedParams.length,
    Rejected: rejectedParams.length,
  };

  // Helper function to get indices of parameters in the current active tab
  const getCurrentTabIndices = () => {
    return editedData
      .map((param, idx) => getParameterStatus(param) === activeTab ? idx : -1)
      .filter(idx => idx !== -1);
  };

  // Helper function to count selected parameters in current tab
  const getSelectedCountInCurrentTab = () => {
    const currentTabIndices = getCurrentTabIndices();
    return currentTabIndices.filter(idx => selectedRows.has(idx)).length;
  };

  // Helper function to check if current tab/parameter can be edited
  const canEdit = (status: ParameterStatus) => {
    if (isReviewer()) {
      // CRM users can edit all statuses
      return true;
    } else {
      // Non-CRM users can only edit rejected parameters
      return status === "Rejected";
    }
  };



  const canApprove = (status: ParameterStatus) => {
    if (!isReviewer()) return false;
    return status === "Pending" || status === "Rejected";
  };

  const canReject = (status: ParameterStatus) => {
    if (!isReviewer()) return false;
    return status === "Pending" || status === "Approved";
  };

  useEffect(() => {
    loadBatchData();
  }, [batchId]);

  useEffect(() => {
    const selectAllCheckbox = document.getElementById('select-all-checkbox') as HTMLInputElement;
    if (selectAllCheckbox) {
      const currentTabIndices = getCurrentTabIndices();
      const selectedFromCurrentTab = getSelectedCountInCurrentTab();
      const totalCount = currentTabIndices.length;
      
      if (selectedFromCurrentTab > 0 && selectedFromCurrentTab < totalCount) {
        selectAllCheckbox.indeterminate = true;
      } else {
        selectAllCheckbox.indeterminate = false;
      }
    }
  }, [selectedRows, activeTab, pendingParams.length, approvedParams.length, rejectedParams.length, editedData]);

  const loadBatchData = async () => {
    try {
      setLoading(true);
      const allParams = await searchParameters(employeeId, role, "", 1, 100);
      const filtered = allParams.filter((p) => p.batchId === batchId);
      
      setBatchData(filtered);
      setEditedData(JSON.parse(JSON.stringify(filtered)));
      setHasChanges(false);
      setIsEditMode(false);
      setSelectedRows(new Set());
      
      // Set default tab based on availability of pending parameters
      // For both reviewers and non-reviewers: show Pending first if available, otherwise Approved
      const hasPending = filtered.some(p => getParameterStatus(p) === "Pending");
      setActiveTab(hasPending ? "Pending" : "Approved");
    } catch (error) {
      console.error("Error loading batch data:", error);
      showToast("error", "Failed to load batch data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCellEdit = (rowIndex: number, field: keyof ParameterData, value: string) => {
    const updated = [...editedData];
    updated[rowIndex] = {
      ...updated[rowIndex],
      [field]: value,
    };
    setEditedData(updated);
    setHasChanges(true);
  };

  const handleEditMode = () => {
    setIsEditMode(true);
    setSelectedRows(new Set());
  };

  const openConfirmDialog = (
    type: "approve" | "reject" | "save" | "cancel" | "resubmit",
    onConfirm: () => void
  ) => {
    const configs = {
      approve: {
        title: "Approve Parameters",
        message: `Are you sure you want to approve ${selectedRows.size} parameter(s)?`,
        confirmText: "Approve Parameters",
      },
      reject: {
        title: "Reject Parameters",
        message: `Are you sure you want to reject ${selectedRows.size} parameter(s)?`,
        confirmText: "Reject Parameters",
      },
      save: {
        title: "Save Changes",
        message: "Are you sure you want to save all the changes?",
        confirmText: "Save Changes",
      },
      cancel: {
        title: "Discard Changes",
        message: "You have unsaved changes. Are you sure you want to discard them?",
        confirmText: "Discard Changes",
      },
      resubmit: {
        title: "Resubmit for Review",
        message: "Are you sure you want to save changes and resubmit these parameters for review?",
        confirmText: "Resubmit for Review",
      },
    };

    const config = configs[type];
    setConfirmDialog({
      isOpen: true,
      type,
      title: config.title,
      message: config.message,
      confirmText: config.confirmText,
      onConfirm,
    });
    // Don't reset rejectReason here - only reset when dialog closes
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({
      isOpen: false,
      type: null,
      title: "",
      message: "",
      confirmText: "",
      onConfirm: () => {},
    });
    setRejectReason("");
    setActionLoading(false);
  };

  const handleCancelEdit = () => {
    if (hasChanges) {
      openConfirmDialog("cancel", () => {
        setEditedData(JSON.parse(JSON.stringify(batchData)));
        setHasChanges(false);
        setIsEditMode(false);
        closeConfirmDialog();
      });
    } else {
      setIsEditMode(false);
    }
  };

  const handleSaveEdit = () => {
    // For non-CRM users editing rejected parameters, change status to Pending
    if (!isReviewer() && activeTab === "Rejected") {
      openConfirmDialog("resubmit", async () => {
        try {
          setActionLoading(true);
          
          // Update the edited parameters' status to Pending
          const updatedParams = editedData.map(param => {
            if (getParameterStatus(param) === "Rejected") {
              return {
                ...param,
                status: "Pending",
                reasonForRejection: undefined, // Clear rejection reason
              };
            }
            return param;
          });
          
          const request: ParameterUpdateRequest = {
            parameters: updatedParams.filter(p => getParameterStatus(p) === "Rejected" || p.status === "Pending"),
            updatedBy: employeeId,
          };
          
          await updateParameters(request);
          
          setBatchData(updatedParams);
          setHasChanges(false);
          setIsEditMode(false);
          
          closeConfirmDialog();
          showToast("success", "Changes saved and resubmitted for review successfully!");
          
          await loadBatchData();
        } catch (error) {
          console.error("Error saving changes:", error);
          showToast("error", "Failed to save changes. Please try again.");
        } finally {
          setActionLoading(false);
        }
      });
    } else {
      // For CRM users, normal save
      openConfirmDialog("save", async () => {
        try {
          setActionLoading(true);
          
          const request: ParameterUpdateRequest = {
            parameters: editedData,
            updatedBy: employeeId,
          };
          
          await updateParameters(request);
          
          setBatchData(editedData);
          setHasChanges(false);
          setIsEditMode(false);
          
          closeConfirmDialog();
          showToast("success", "Changes saved successfully!");
          
          await loadBatchData();
        } catch (error) {
          console.error("Error saving changes:", error);
          showToast("error", "Failed to save changes. Please try again.");
        } finally {
          setActionLoading(false);
        }
      });
    }
  };

  const handleRowSelection = (index: number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRows(newSelected);
  };

  const handleSelectAll = () => {
    // Get indices of current tab's parameters
    const currentTabIndices = getCurrentTabIndices();
    
    // Check if all current tab parameters are selected
    const allCurrentTabSelected = currentTabIndices.every(idx => selectedRows.has(idx));
    
    if (allCurrentTabSelected && currentTabIndices.length > 0) {
      // Deselect all from current tab
      const newSelected = new Set(selectedRows);
      currentTabIndices.forEach(idx => newSelected.delete(idx));
      setSelectedRows(newSelected);
    } else {
      // Select all from current tab
      const newSelected = new Set(selectedRows);
      currentTabIndices.forEach(idx => newSelected.add(idx));
      setSelectedRows(newSelected);
    }
  };

  const handleApprove = () => {
    if (selectedRows.size === 0) {
      showToast("warning", "Please select at least one parameter to approve.");
      return;
    }

    openConfirmDialog("approve", async () => {
      try {
        setActionLoading(true);
        
        const selectedParams = editedData
          .filter((_, idx) => selectedRows.has(idx))
          .map(param => ({
            ...param,
            status: "Approved",
            reasonForRejection: undefined, // Clear rejection reason if any
          }));
        
        const request: ParameterUpdateRequest = {
          parameters: selectedParams,
          reviewedBy: employeeId,
        };
        
        await updateParameters(request);
        
        setSelectedRows(new Set());
        closeConfirmDialog();
        showToast("success", `${selectedParams.length} parameter(s) approved successfully!`);
        
        await loadBatchData();
      } catch (error) {
        console.error("Error approving parameters:", error);
        showToast("error", "Failed to approve parameters. Please try again.");
        setActionLoading(false);
      }
    });
  };

  const handleReject = () => {
    if (selectedRows.size === 0) {
      showToast("warning", "Please select at least one parameter to reject.");
      return;
    }

    openConfirmDialog("reject", () => {});
  };

  const handleConfirmReject = async () => {
    try {
      setActionLoading(true);
      
      const selectedParams = editedData
        .filter((_, idx) => selectedRows.has(idx))
        .map(param => ({
          ...param,
          status: 'Rejected',
        }));
      
      const request: ParameterUpdateRequest = {
        parameters: selectedParams,
        reviewedBy: employeeId,
        remarks: rejectReason.trim()
      };
      
      console.log('Rejection Request:', request); // Debug log
      
      await updateParameters(request);
      
      setSelectedRows(new Set());
      closeConfirmDialog();
      showToast("success", `${selectedParams.length} parameter(s) rejected successfully!`);
      
      await loadBatchData();
    } catch (error) {
      console.error("Error rejecting parameters:", error);
      showToast("error", "Failed to reject parameters. Please try again.");
      setActionLoading(false);
    }
  };

  const handleSubmitRevised = () => {
    if (selectedRows.size === 0) {
      showToast("warning", "Please select at least one parameter to resubmit.");
      return;
    }

    openConfirmDialog("resubmit", async () => {
      try {
        setActionLoading(true);
        
        const selectedParams = editedData
          .filter((_, idx) => selectedRows.has(idx))
          .map(param => ({
            ...param,
            status: "Pending",
            reasonForRejection: undefined, // Clear rejection reason
          }));
        
        const request: ParameterUpdateRequest = {
          parameters: selectedParams,
          updatedBy: employeeId,
        };
        
        await updateParameters(request);
        
        setSelectedRows(new Set());
        closeConfirmDialog();
        showToast("success", `${selectedParams.length} parameter(s) resubmitted for review successfully!`);
        
        await loadBatchData();
      } catch (error) {
        console.error("Error resubmitting parameters:", error);
        showToast("error", "Failed to resubmit parameters. Please try again.");
        setActionLoading(false);
      }
    });
  };

  const handleCloseBatch = () => {
    if (hasChanges) {
      openConfirmDialog("cancel", () => {
        closeConfirmDialog();
        onBack();
      });
    } else {
      onBack();
    }
  };

  const renderTable = (parameters: ParameterData[], status: ParameterStatus) => {
    if (parameters.length === 0) return null;

    const statusConfig = {
      Pending: { icon: Clock, color: "amber", label: "Pending" },
      Approved: { icon: CheckCircle2, color: "emerald", label: "Approved" },
      Rejected: { icon: XOctagon, color: "red", label: "Rejected" },
    };

    const config = statusConfig[status];
    const StatusIcon = config.icon;

    // Check if this table can be edited
    const isEditable = canEdit(status);
    // CRM users: show checkboxes when not in edit mode
    // Non-CRM users: show checkboxes on Rejected tab always (even in edit mode)
    const showCheckboxes = isReviewer() 
      ? !isEditMode 
      : status === "Rejected";

    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6 animate-fadeIn">
        {/* Table Header */}
        <div className={`px-5 py-4 border-b ${
          status === "Pending" ? "bg-amber-50 border-amber-200" :
          status === "Approved" ? "bg-emerald-50 border-emerald-200" :
          "bg-red-50 border-red-200"
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-sm transform transition-transform hover:scale-110 ${
                status === "Pending" ? "bg-amber-500" :
                status === "Approved" ? "bg-emerald-500" :
                "bg-red-500"
              }`}>
                <StatusIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{config.label} Parameters</h3>
                <p className="text-xs text-slate-600">{parameters.length} parameter{parameters.length !== 1 ? 's' : ''}</p>
              </div>
            </div>

            {showCheckboxes && getSelectedCountInCurrentTab() > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-200 font-semibold">
                  {getSelectedCountInCurrentTab()} selected
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {showCheckboxes && (
                  <th className="px-4 py-3 text-left w-12">
                    <div className="flex items-center justify-center">
                      <input
                        id="select-all-checkbox"
                        type="checkbox"
                        checked={(() => {
                          const currentTabIndices = getCurrentTabIndices();
                          const selectedFromCurrentTab = getSelectedCountInCurrentTab();
                          return selectedFromCurrentTab === currentTabIndices.length && currentTabIndices.length > 0;
                        })()}
                        onChange={handleSelectAll}
                        className="w-5 h-5 rounded outline-none border-2 border-slate-300 text-emerald-600 focus:ring-1 focus:ring-emerald-500 focus:ring-offset-0 cursor-pointer transition-all hover:border-emerald-400 checked:bg-emerald-600 checked:border-emerald-600"
                        title="Select all parameters"
                      />
                    </div>
                  </th>
                )}
                {COLUMN_HEADERS.map((header) => (
                  <th key={header.key} className="px-4 py-3 text-left whitespace-nowrap">
                    <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      {header.label}
                    </span>
                  </th>
                ))}
                {status === "Rejected" && (
                  <th className="px-4 py-3 text-left whitespace-nowrap">
                    <span className="text-xs font-semibold text-red-600 uppercase tracking-wider">
                      Remarks
                    </span>
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {parameters.map((param) => {
                const originalIndex = editedData.findIndex(p => p.id === param.id);
                const isSelected = selectedRows.has(originalIndex);
                
                return (
                  <tr
                    key={param.id}
                    className={`transition-all duration-200 ${
                      isSelected ? "bg-emerald-50/70 hover:bg-emerald-50" : "hover:bg-slate-50"
                    }`}
                  >
                    {showCheckboxes && (
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleRowSelection(originalIndex)}
                            className="w-5 h-5 rounded border-2 border-slate-300 text-emerald-600 focus:ring-1 focus:ring-emerald-500 focus:ring-offset-0 cursor-pointer transition-all hover:border-emerald-400 checked:bg-emerald-600 checked:border-emerald-600"
                          />
                        </div>
                      </td>
                    )}
                    {COLUMN_HEADERS.map((header) => (
                      <td key={header.key} className="px-4 py-3 whitespace-nowrap">
                        {isEditMode && isEditable ? (
                          <input
                            type="text"
                            value={String(param[header.key as keyof ParameterData] || "")}
                            onChange={(e) =>
                              handleCellEdit(originalIndex, header.key as keyof ParameterData, e.target.value)
                            }
                            className="w-full px-2 py-1 text-sm outline-none border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                          />
                        ) : (
                          <span className="text-sm text-slate-700">
                            {String(param[header.key as keyof ParameterData] || "")}
                          </span>
                        )}
                      </td>
                    ))}
                    {status === "Rejected" && (
                      <td className="px-4 py-3">
                        <div className="">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-slate-700 break-words">
                              {param.remarks || "No reason provided"}
                            </span>
                          </div>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Get visible tabs based on user role
  const getVisibleTabs = (): ParameterStatus[] => {
    if (isReviewer()) {
      return ["Pending", "Approved", "Rejected"];
    } else {
      return ["Pending", "Approved", "Rejected"];
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50 backdrop-blur-sm bg-white/95">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleCloseBatch}
                className="p-2 hover:bg-slate-100 rounded-lg transition-all duration-200 transform hover:scale-102 active:scale-98"
              >
                <ChevronLeft className="w-5 h-5 text-slate-700" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg transform transition-transform hover:scale-110">
                  <TableIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">Batch Review #{batchId}</h1>
                  <p className="text-sm text-slate-600">
                    {isReviewer() ? "CRM Reviewer Mode" : "User Mode"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isEditMode ? (
                <>
                  <button
                    onClick={handleCancelEdit}
                    disabled={saving}
                    className="px-5 py-2.5 rounded-lg bg-white border-2 border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-all duration-200 disabled:opacity-50 transform hover:scale-102 active:scale-98 shadow-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={!hasChanges || saving}
                    className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 flex items-center gap-2 transform hover:scale-102 active:scale-98 shadow-lg"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </>
              ) : (
                <>
                  {/* Show Edit button only when no parameters are selected */}
                  {selectedRows.size === 0 && canEdit(activeTab) && (
                    <button
                      onClick={handleEditMode}
                      disabled={getParametersByStatus(activeTab).length === 0}
                      className="px-5 py-2.5 rounded-lg bg-white border-2 border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-all duration-200 disabled:opacity-50 flex items-center gap-2 transform hover:scale-102 active:scale-98 shadow-sm"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit Mode
                    </button>
                  )}
                  
                  {/* Show Approve button for CRM users when parameters are selected and approve is allowed for current tab */}
                  {canApprove(activeTab) && selectedRows.size > 0 && (
                    <button
                      onClick={handleApprove}
                      className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 flex items-center gap-2 transform hover:scale-102 active:scale-98 shadow-lg animate-fadeIn"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                  )}
                  
                  {/* Show Reject button for CRM users when parameters are selected and reject is allowed for current tab */}
                  {canReject(activeTab) && selectedRows.size > 0 && (
                    <button
                      onClick={handleReject}
                      className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-red-500 to-rose-600 text-white font-semibold hover:from-red-600 hover:to-rose-700 transition-all duration-200 flex items-center gap-2 transform hover:scale-102 active:scale-98 shadow-lg animate-fadeIn"
                    >
                      <Ban className="w-4 h-4" />
                      Reject
                    </button>
                  )}

                  {/* Show Submit Revised button for non-CRM users on Rejected tab when parameters are selected */}
                  {!isReviewer() && activeTab === "Rejected" && selectedRows.size > 0 && (
                    <button
                      onClick={handleSubmitRevised}
                      className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 flex items-center gap-2 transform hover:scale-102 active:scale-98 shadow-lg animate-fadeIn"
                    >
                      <Send className="w-4 h-4" />
                      Submit Revised Parameters
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-6 py-6">
        {/* Status Tabs */}
        <div className="mb-6 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2">
            <div className="flex gap-2">
              {getVisibleTabs().map((status) => {
                const isActive = activeTab === status;
                const count = statusCounts[status];

                if (count === 0) return null;

                const configs = {
                  Pending: { color: "amber", icon: Clock },
                  Approved: { color: "emerald", icon: CheckCircle2 },
                  Rejected: { color: "red", icon: XOctagon },
                };
                const config = configs[status];
                const StatusIcon = config.icon;

                return (
                  <button
                    key={status}
                    onClick={() => {
                      setActiveTab(status);
                      setSelectedRows(new Set());
                      setIsEditMode(false);
                    }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 transform hover:scale-102 active:scale-98 ${
                      isActive
                        ? status === "Pending"
                          ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md"
                          : status === "Approved"
                          ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md"
                          : "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-md"
                        : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    <StatusIcon className="w-4 h-4" />
                    <span className="capitalize">{status}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold transition-all ${
                      isActive ? "bg-white/25 text-white" : "bg-slate-100 text-slate-700"
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-16 flex flex-col items-center justify-center animate-fadeIn">
            <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
            <p className="text-slate-700 font-medium text-lg">Loading batch data...</p>
            <p className="text-slate-500 text-sm mt-2">Please wait</p>
          </div>
        ) : (
          <>
            {activeTab === "Pending" && renderTable(pendingParams, "Pending")}
            {activeTab === "Approved" && renderTable(approvedParams, "Approved")}
            {activeTab === "Rejected" && renderTable(rejectedParams, "Rejected")}
          </>
        )}
      </div>

      {/* Confirmation Dialog */}
      {confirmDialog.isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeConfirmDialog();
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scaleIn">
            <div
              className={`px-6 py-5 ${
                confirmDialog.type === "approve"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600"
                  : confirmDialog.type === "reject"
                  ? "bg-gradient-to-r from-red-500 to-rose-600"
                  : confirmDialog.type === "save" || confirmDialog.type === "resubmit"
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600"
                  : "bg-gradient-to-r from-slate-600 to-slate-700"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shadow-md transform transition-transform hover:scale-110">
                  {confirmDialog.type === "approve" && <CheckCircle className="w-6 h-6 text-white" />}
                  {confirmDialog.type === "reject" && <Ban className="w-6 h-6 text-white" />}
                  {(confirmDialog.type === "save" || confirmDialog.type === "resubmit") && <Save className="w-6 h-6 text-white" />}
                  {confirmDialog.type === "cancel" && <AlertTriangle className="w-6 h-6 text-white" />}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{confirmDialog.title}</h3>
                  <p className="text-sm text-white/90 mt-0.5">Please confirm your action</p>
                </div>
              </div>
            </div>

            <div className="px-6 py-6">
              <div className="mb-6">
                <p className="text-slate-700 text-sm leading-relaxed mb-4">
                  {confirmDialog.message}
                </p>

                {confirmDialog.type === "reject" && (
                  <div className="mt-4 animate-slideDown">
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">
                      Rejection Reason <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Provide a detailed reason for rejection..."
                      rows={4}
                      className="w-full px-4 py-3 outline-none border-2 border-slate-300 rounded-lg focus:ring-1 focus:ring-red-500 focus:border-red-500 text-sm resize-none transition-all hover:border-slate-400"
                      autoFocus
                    />
                    {rejectReason.trim() === "" && (
                      <p className="text-xs text-red-500 mt-2 flex items-center gap-1 animate-fadeIn">
                        <AlertCircle className="w-3 h-3" />
                        Please provide a reason to proceed
                      </p>
                    )}
                    {rejectReason.trim() !== "" && (
                      <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1 animate-fadeIn">
                        <Check className="w-3 h-3" />
                        Reason provided ({rejectReason.length} characters)
                      </p>
                    )}
                  </div>
                )}

                {(confirmDialog.type === "approve" || confirmDialog.type === "save" || confirmDialog.type === "resubmit") && (
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 mt-4 animate-slideDown">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm transform transition-transform hover:scale-110">
                        <FileText className="w-5 h-5 text-slate-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium mb-1">
                          {confirmDialog.type === "approve" ? "Parameters Selected" : confirmDialog.type === "resubmit" ? "Action" : "Changes Made"}
                        </p>
                        <p className="text-sm font-semibold text-slate-900">
                          {confirmDialog.type === "approve"
                            ? `${selectedRows.size} parameter(s)`
                            : confirmDialog.type === "resubmit"
                            ? "Status will change to Pending"
                            : "Multiple fields updated"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={closeConfirmDialog}
                  disabled={actionLoading}
                  className="flex-1 px-5 py-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-all duration-200 disabled:opacity-50 transform hover:scale-102 active:scale-98"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (confirmDialog.type === "reject") {
                      handleConfirmReject();
                    } else {
                      confirmDialog.onConfirm();
                    }
                  }}
                  disabled={actionLoading || (confirmDialog.type === "reject" && !rejectReason.trim())}
                  className={`flex-1 px-5 py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 shadow-md transform hover:scale-102 active:scale-98 ${
                    confirmDialog.type === "approve"
                      ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
                      : confirmDialog.type === "reject"
                      ? "bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white"
                      : (confirmDialog.type === "save" || confirmDialog.type === "resubmit")
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                      : "bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white"
                  }`}
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {confirmDialog.type === "approve" && (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          {confirmDialog.confirmText}
                        </>
                      )}
                      {confirmDialog.type === "reject" && (
                        <>
                          <Ban className="w-5 h-5" />
                          {confirmDialog.confirmText}
                        </>
                      )}
                      {(confirmDialog.type === "save" || confirmDialog.type === "resubmit") && (
                        <>
                          {confirmDialog.type === "resubmit" ? <RefreshCw className="w-5 h-5" /> : <Save className="w-5 h-5" />}
                          {confirmDialog.confirmText}
                        </>
                      )}
                      {confirmDialog.type === "cancel" && (
                        <>
                          <X className="w-5 h-5" />
                          {confirmDialog.confirmText}
                        </>
                      )}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }

        /* Custom Checkbox Styles for Emerald Theme */
        input[type="checkbox"] {
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          position: relative;
          cursor: pointer;
        }

        input[type="checkbox"]:checked {
          background-color: #10b981;
          border-color: #10b981;
          background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e");
          background-size: 100% 100%;
          background-position: center;
          background-repeat: no-repeat;
        }

        input[type="checkbox"]:hover {
          border-color: #34d399;
        }

        input[type="checkbox"]:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
        }

        input[type="checkbox"]:checked:hover {
          background-color: #059669;
          border-color: #059669;
        }

        input[type="checkbox"]:indeterminate {
          background-color: #10b981;
          border-color: #10b981;
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 16 16'%3e%3cpath stroke='white' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M4 8h8'/%3e%3c/svg%3e");
          background-size: 100% 100%;
          background-position: center;
          background-repeat: no-repeat;
        }
      `}</style>
    </div>
  );
}