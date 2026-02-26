import { useState, useEffect } from "react";
import {
  ChevronLeft,
  Loader2,
  Search,
  AlertCircle,
  ClipboardCheck,
  Clock,
  CheckCircle2,
  XOctagon,
  Calendar,
  User,
  Hash,
  Eye,
  Upload,
  Database,
  Check,
  X,
  Info,
  AlertTriangle,
  RefreshCcw,
  ChevronRight,
} from "lucide-react";
import { searchParameters, uploadToMaster } from "../services/ParameterService";
import type { ParameterData } from "../models/ParameterData";
import { FiLayers } from "react-icons/fi";

interface ParameterReviewProps {
  employeeId: string;
  username: string;
  role: string;
  onBack: () => void;
  onBatchSelect: (batchId: number) => void;
}

interface BatchGroup {
  batchId: number;
  totalCount: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  uploadedAt: Date | null;
  uploadedBy: string;
  fileName: string;
}

interface Toast {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
}

interface ConfirmationDialog {
  isOpen: boolean;
  batchId: number | null;
  approvedCount: number;
  title: string;
  message: string;
  confirmText: string;
  onConfirm: () => void;
}

// Custom Toast Component
function ToastContainer({
  toasts,
  removeToast,
}: {
  toasts: Toast[];
  removeToast: (id: string) => void;
}) {
  return (
    <div className="fixed top-4 right-4 z-[10000] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          toast={toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

function Toast({ toast, onClose }: { toast: Toast; onClose: () => void }) {
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
      bgColor: "bg-gradient-to-r from-emerald-500 to-emerald-600",
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
        <p className="flex-1 text-sm font-medium leading-snug">
          {toast.message}
        </p>
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

export default function ParameterReview({
  employeeId,
  username,
  role,
  onBack,
  onBatchSelect,
}: ParameterReviewProps) {
  const [batches, setBatches] = useState<BatchGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [uploadingBatch, setUploadingBatch] = useState<number | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmationDialog>({
    isOpen: false,
    batchId: null,
    approvedCount: 0,
    title: "",
    message: "",
    confirmText: "",
    onConfirm: () => {},
  });

  // Helper function to check if user is a CRM user
  const isReviewer = () => {
    return ["EC57285", "EC56887"].includes(employeeId);
  };

  // Toast functions
  const showToast = (type: Toast["type"], message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Helper function to parse date
  const parseDate = (
    dateValue: string | Date | null | undefined,
  ): Date | null => {
    if (!dateValue) return null;
    if (dateValue instanceof Date) return dateValue;
    try {
      const parsed = new Date(dateValue);
      return isNaN(parsed.getTime()) ? null : parsed;
    } catch {
      return null;
    }
  };

  // Helper function to format date
  const formatDate = (dateValue: Date | null): string => {
    if (!dateValue) return "N/A";
    try {
      return dateValue.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  };

  // Helper function to get parameter status
  const getParameterStatus = (param: ParameterData): string => {
    if (param.status === "Uploaded") return "Uploaded";
    if (param.status === "Rejected") return "Rejected";
    if (param.status === "Approved") return "Approved";
    return "Pending";
  };

  // Load all batches on mount
  useEffect(() => {
    loadBatches();
  }, []);

  const loadBatches = async () => {
    try {
      setLoading(true);
      const allParams = await searchParameters(
        employeeId,
        role,
        searchTerm,
        1,
        100, // Increased to get all parameters
      );

      const batchMap = new Map<number, BatchGroup>();

      allParams.forEach((param) => {
        if (param.batchId) {
          const status = getParameterStatus(param);

          // Skip parameters with 'Uploaded' status
          if (status === "Uploaded") return;

          if (!batchMap.has(param.batchId)) {
            batchMap.set(param.batchId, {
              batchId: param.batchId,
              totalCount: 0,
              pendingCount: 0,
              approvedCount: 0,
              rejectedCount: 0,
              uploadedAt: parseDate(param.uploadedAt),
              uploadedBy: param.uploadedBy || "Unknown",
              fileName: `Batch ${param.batchId}`,
            });
          }

          const batch = batchMap.get(param.batchId)!;
          batch.totalCount++;

          if (status === "Pending") batch.pendingCount++;
          else if (status === "Approved") batch.approvedCount++;
          else if (status === "Rejected") batch.rejectedCount++;
        }
      });

      const batchesArray = Array.from(batchMap.values()).sort(
        (a, b) => b.batchId - a.batchId,
      );

      setBatches(batchesArray);
    } catch (error) {
      console.error("Error loading batches:", error);
      showToast("error", "Failed to load batches. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const openUploadDialog = (batch: BatchGroup) => {
    if (batch.approvedCount === 0) {
      showToast("warning", "No approved parameters to upload.");
      return;
    }

    setConfirmDialog({
      isOpen: true,
      batchId: batch.batchId,
      approvedCount: batch.approvedCount,
      title: "Upload to Master Database",
      message: `Are you sure you want to upload ${batch.approvedCount} approved parameter(s) from Batch #${batch.batchId} to the master database? This will insert them into 5 master tables.`,
      confirmText: "Upload to Master",
      onConfirm: () => handleUploadToMaster(batch.batchId),
    });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({
      isOpen: false,
      batchId: null,
      approvedCount: 0,
      title: "",
      message: "",
      confirmText: "",
      onConfirm: () => {},
    });
  };

  /**
   * Handle upload to master tables
   */
  const handleUploadToMaster = async (batchId: number) => {
    try {
      setUploadingBatch(batchId);

      // Call the API to upload to master
      const response = await uploadToMaster(batchId, username);

      // Close the dialog
      closeConfirmDialog();

      // Show success/partial/failure message based on response
      if (response.status === "Success") {
        showToast(
          "success",
          `✅ Successfully uploaded ${response.successfulRows} of ${response.totalRows} parameters to master tables!`,
        );
      } else if (response.status === "Partial") {
        showToast(
          "warning",
          `⚠️ Partially uploaded: ${response.successfulRows} successful, ${response.failedRows} failed. Check logs for details.`,
        );
      } else {
        showToast(
          "error",
          `❌ Upload failed: ${response.message || "Unknown error"}`,
        );
      }

      // Reload batches to reflect updated status
      await loadBatches();
    } catch (error: any) {
      console.error("Error uploading to master:", error);
      closeConfirmDialog();
      showToast(
        "error",
        `Failed to upload: ${error.message || "Unknown error occurred"}`,
      );
    } finally {
      setUploadingBatch(null);
    }
  };

  const filteredBatches = batches.filter((batch) => {
    const searchLower = searchTerm.toLowerCase();
    const uploadDate = formatDate(batch.uploadedAt).toLowerCase();
    return (
      batch.batchId.toString().includes(searchLower) ||
      batch.uploadedBy.toLowerCase().includes(searchLower) ||
      uploadDate.includes(searchLower)
    );
  });

  const totalParameters = batches.reduce((sum, b) => sum + b.totalCount, 0);
  const totalPending = batches.reduce((sum, b) => sum + b.pendingCount, 0);
  const totalApproved = batches.reduce((sum, b) => sum + b.approvedCount, 0);
  const totalRejected = batches.reduce((sum, b) => sum + b.rejectedCount, 0);

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
                onClick={onBack}
                className="p-2 hover:bg-slate-100 rounded-lg transition-all duration-200 transform hover:scale-102 active:scale-98"
              >
                <ChevronLeft className="w-5 h-5 text-slate-700" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg transform transition-transform hover:scale-110">
                  <ClipboardCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">
                    Parameter Review
                  </h1>
                  <p className="text-sm text-slate-600">
                    {isReviewer() ? "CRM Reviewer Mode" : "User Mode"}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={loadBatches}
              disabled={loading}
              className="px-5 py-2.5 rounded-lg bg-white border-2 border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-all duration-200 disabled:opacity-50 flex items-center gap-2 transform hover:scale-102 active:scale-98 shadow-sm"
            >
              <RefreshCcw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-6 py-6">
        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6 animate-fadeIn">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by batch ID, user, or date..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full outline-none pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
            />
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Parameters
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {totalParameters}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <FiLayers className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Pending
                </p>
                <p className="text-2xl font-bold text-amber-900">
                  {totalPending}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Approved
                </p>
                <p className="text-2xl font-bold text-emerald-900">
                  {totalApproved}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Rejected
                </p>
                <p className="text-2xl font-bold text-red-900">
                  {totalRejected}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                <XOctagon className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Batches List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
              <p className="text-slate-600 font-medium">Loading batches...</p>
            </div>
          </div>
        ) : filteredBatches.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-lg font-semibold text-slate-700 mb-2">
              No Batches Found
            </p>
            <p className="text-sm text-slate-500">
              {searchTerm
                ? "Try adjusting your search criteria"
                : "Upload some parameters to get started"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredBatches.map((batch) => {
              const isUploading = uploadingBatch === batch.batchId;

              return (
                <div
                  key={batch.batchId}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 group relative"
                >
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 shimmer-effect pointer-events-none" />

                  <div className="p-5">
                    {/* Batch Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                          <Hash className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-slate-900">
                            Batch #{batch.batchId}
                          </h3>
                          <p className="text-xs text-slate-500">
                            {batch.totalCount} parameters
                          </p>
                        </div>
                      </div>
                      <button
                        className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center"
                        onClick={() => onBatchSelect(batch.batchId)}
                      >
                        <ChevronRight className="w-4 h-4 text-slate-600" />
                      </button>
                    </div>

                    {/* Upload Info */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-xs">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-slate-600 font-medium">
                          {batch.uploadedBy}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-slate-600">
                          {formatDate(batch.uploadedAt)}
                        </span>
                      </div>
                    </div>

                    {/* Status Counts */}
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 mb-4">
                      <div className="grid grid-cols-3 gap-2">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Clock className="w-3 h-3 text-amber-600" />
                          </div>
                          <p className="text-xs font-bold text-amber-900">
                            {batch.pendingCount}
                          </p>
                          <p className="text-[9px] text-amber-600 uppercase tracking-wide">
                            Pending
                          </p>
                        </div>

                        <div className="text-center border-l border-r border-slate-300">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          </div>
                          <p className="text-xs font-bold text-emerald-900">
                            {batch.approvedCount}
                          </p>
                          <p className="text-[9px] text-emerald-600 uppercase tracking-wide">
                            Approved
                          </p>
                        </div>

                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <XOctagon className="w-3 h-3 text-red-600" />
                          </div>
                          <p className="text-xs font-bold text-red-900">
                            {batch.rejectedCount}
                          </p>
                          <p className="text-[9px] text-red-600 uppercase tracking-wide">
                            Rejected
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <button
                        onClick={() => onBatchSelect(batch.batchId)}
                        className="w-full px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors duration-200 flex items-center justify-center gap-2 shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Review Parameters
                      </button>

                      {isReviewer() && batch.approvedCount > 0 && (
                        <button
                          onClick={() => openUploadDialog(batch)}
                          disabled={isUploading}
                          className="w-full px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
                        >
                          {isUploading ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="w-3.5 h-3.5" />
                              Upload to Master ({batch.approvedCount})
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upload Confirmation Dialog */}
      {confirmDialog.isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeConfirmDialog();
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scaleIn">
            <div className="px-6 py-5 bg-gradient-to-r from-emerald-500 to-emerald-600">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shadow-md transform transition-transform hover:scale-110">
                  <Database className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {confirmDialog.title}
                  </h3>
                  <p className="text-sm text-white/90 mt-0.5">
                    This action cannot be undone
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-6">
              <div className="mb-6">
                <p className="text-slate-700 text-sm leading-relaxed mb-4">
                  {confirmDialog.message}
                </p>

                <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200 animate-slideDown">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm transform transition-transform hover:scale-110">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs text-emerald-700 font-medium mb-1">
                        Parameters to Upload
                      </p>
                      <p className="text-sm font-semibold text-emerald-900">
                        {confirmDialog.approvedCount} approved parameter(s)
                      </p>
                      <p className="text-xs text-emerald-600 mt-1">
                        Will be inserted into 5 master tables
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={closeConfirmDialog}
                  disabled={uploadingBatch !== null}
                  className="flex-1 px-5 py-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-all duration-200 disabled:opacity-50 transform hover:scale-102 active:scale-98"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDialog.onConfirm}
                  disabled={uploadingBatch !== null}
                  className="flex-1 px-5 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 shadow-md transform hover:scale-102 active:scale-98"
                >
                  {uploadingBatch !== null ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      {confirmDialog.confirmText}
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

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
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

        .shimmer-effect {
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.4),
            transparent
          );
          animation: shimmer 2s infinite;
          opacity: 0;
          transition: opacity 0.3s;
        }

        .group:hover .shimmer-effect {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}
