import {
  useEffect,
  useRef,
  useState,
} from "react";

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
  ChevronDown,
} from "lucide-react";

import {
  getDropdownOptions,
  getUploadLogs,
  getWorkflowTracker,
  searchParameters,
  submitToLab,
  submitToReviewer,
  submitToAdmin,
  uploadToMaster,
  updateParameters,
} from "../services/ParameterService";

import type {
  DropdownOption,
  ParameterDropdownOptions,
} from "../services/ParameterService";

import type {
  ParameterData,
} from "../models/ParameterData";

import type {
  ParameterUpdateRequest,
} from "../models/ParameterUpdateRequest";


type TrackerStageName =
  | "Quotation"
  | "Lab"
  | "Reviewer"
  | "Admin";

interface TrackerStageView {
  stage: TrackerStageName;
  status: "Completed" | "Current" | "Waiting";
  userId?: string;
  userName?: string;
  actionAt?: string;
}

const TRACKER_STAGE_ORDER: TrackerStageName[] = [
  "Quotation",
  "Lab",
  "Reviewer",
  "Admin",
];

const formatTrackerDate = (value?: string) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};


interface BatchReviewProps {
  employeeId: string;
  username: string;
  role: string;
  batchId: number;
  onBack: () => void;
}


interface ConfirmationDialog {
  isOpen: boolean;
  type:
  | "approve"
  | "reject"
  | "save"
  | "cancel"
  | "resubmit"
  | "submitLab"
  | "submitReviewer"
  | "submitAdmin"
  | "uploadMaster"
  | null;
  title: string;
  message: string;
  confirmText: string;
  onConfirm: () => void;
}


interface Toast {
  id: string;
  type:
  | "success"
  | "error"
  | "warning"
  | "info";
  message: string;
}


type ParameterStatus =
  | "Pending"
  | "Approved"
  | "Rejected";


const EMPTY_DROPDOWN_OPTIONS: ParameterDropdownOptions = {
  parameterCodes: [],
  parameterGroupCodes: [],
  parameterSubGroupCodes: [],
  commodityCodes: [],
  commodityGroupCodes: [],
  nonFssaiFssaiDrugCodes: [],
  regulationCodes: [],
  labCodes: [],
  unitCodes: [],
  methodCodes: [],
  specificationCodes: [],
  testCodes: [],
};


const COLUMN_HEADERS = [
  {
    key: "parameterName",
    label: "Parameter Name",
  },
  {
    key: "parameterCode",
    label: "Parameter Code",
  },
  {
    key: "parameterGroup",
    label: "Parameter Group",
  },
  {
    key: "parameterGroupCode",
    label: "Parameter Group Code",
  },
  {
    key: "parameterSubGroup",
    label: "Parameter Sub-Group",
  },
  {
    key: "parameterSubGroupCode",
    label: "Parameter Sub-Group Code",
  },
  {
    key: "commodityName",
    label: "Commodity Name *",
  },
  {
    key: "commodityCode",
    label: "Commodity Code",
  },
  {
    key: "commodityGroup",
    label: "Commodity Group",
  },
  {
    key: "commodityGroupCode",
    label: "Commodity Group Code",
  },
  {
    key: "nonFssaiFssaiDrug",
    label: "Non FSSAI/FSSAI/Drug",
  },
  {
    key: "nonFssaiFssaiDrugCode",
    label: "Non FSSAI/FSSAI/Drug Code",
  },
  {
    key: "regulationName",
    label: "Regulation Name *",
  },
  {
    key: "regulationCode",
    label: "Regulation Code",
  },
  {
    key: "parameterLabDistribution",
    label: "Lab Name *",
  },
  {
    key: "labCode",
    label: "Lab Code",
  },
  {
    key: "tatDays",
    label: "TAT Days",
  },
  {
    key: "parameterSequence",
    label: "Parameter Sequence",
  },
  {
    key: "outsourceYN",
    label: "Outsource Y/N",
  },
  {
    key: "sampleQuantityAnalysis",
    label: "Sample Quantity Analysis",
  },
  {
    key: "sampleQuantityRetention",
    label: "Sample Quantity Retention",
  },
  {
    key: "requiredSampleQuantityUnit",
    label: "Required Sample Quantity Unit",
  },
  {
    key: "unitCode",
    label: "Unit Code",
  },
  {
    key: "nablScopeStatus",
    label: "NABL Scope Status",
  },
  {
    key: "methodName",
    label: "Method Name",
  },
  {
    key: "methodCode",
    label: "Method Code",
  },
  {
    key: "specificationName",
    label: "Specification Name",
  },
  {
    key: "specificationCode",
    label: "Specification Code",
  },
  {
    key: "fssaiCategoryNo",
    label: "FSSAI Category No",
  },
  {
    key: "subClause",
    label: "Sub Clause",
  },
  {
    key: "testUnit",
    label: "Test Unit",
  },
  {
    key: "testCode",
    label: "Test Code",
  },
  {
    key: "instrument",
    label: "Instrument",
  },
  {
    key: "loq",
    label: "LOQ",
  },
  {
    key: "parameterIndividualRate",
    label: "Parameter Individual Rate",
  },
  {
    key: "regulatoryRateDrug",
    label: "Regulatory Rate Drug",
  },
  {
    key: "addInfo",
    label: "Additional Info",
  },
] as const;


const DROPDOWN_CONFIG = {
  parameterCode: {
    optionsKey: "parameterCodes",
    nameField: "parameterName",
  },

  parameterGroupCode: {
    optionsKey: "parameterGroupCodes",
    nameField: "parameterGroup",
  },

  parameterSubGroupCode: {
    optionsKey:
      "parameterSubGroupCodes",
    nameField:
      "parameterSubGroup",
  },

  commodityCode: {
    optionsKey: "commodityCodes",
    nameField: "commodityName",
  },

  commodityGroupCode: {
    optionsKey:
      "commodityGroupCodes",
    nameField: "commodityGroup",
  },

  regulationCode: {
    optionsKey: "regulationCodes",
    nameField: "regulationName",
  },

  labCode: {
    optionsKey: "labCodes",
    nameField:
      "parameterLabDistribution",
  },

  unitCode: {
    optionsKey: "unitCodes",
    nameField:
      "requiredSampleQuantityUnit",
  },

  methodCode: {
    optionsKey: "methodCodes",
    nameField: "methodName",
  },

  specificationCode: {
    optionsKey:
      "specificationCodes",
    nameField:
      "specificationName",
  },

  testCode: {
    optionsKey: "testCodes",
    nameField: "testUnit",
  },
  nonFssaiFssaiDrugCode: {
    optionsKey: "nonFssaiFssaiDrugCodes",
    nameField: "nonFssaiFssaiDrug",
  },
} as const;


type DropdownField =
  keyof typeof DROPDOWN_CONFIG;


const AUTO_FILLED_FIELDS = new Set<string>([
  "commodityGroup",
  "nonFssaiFssaiDrug",
]);

// Quotation users can edit only these six business fields.
// Commodity/Lab/Regulation codes are filled automatically from the selected name.
const QUOTATION_EDITABLE_FIELDS = new Set<string>([
  "commodityName",
  "parameterName",
  "parameterLabDistribution",
  "regulationName",
  "parameterIndividualRate",
  "regulatoryRateDrug",
]);

// Lab users (ROLE000006 / ROLE000007) edit the NAME/value side.
// The paired CODE is filled automatically from the selected master value.
// Required Sample Quantity Unit remains a normal text input.
const REVIEWER_ADMIN_EDITABLE_FIELDS = new Set<string>([
  "parameterName",
  "parameterCode",
  "parameterGroup",
  "parameterGroupCode",
  "parameterSubGroup",
  "parameterSubGroupCode",
  "commodityName",
  "commodityCode",
  "commodityGroup",
  "commodityGroupCode",
  "nonFssaiFssaiDrug",
  "nonFssaiFssaiDrugCode",
  "regulationName",
  "regulationCode",
  "labName",
  "labCode",
  "tatDays",
  "parameterSequence",
  "outsourceYN",
  "sampleQuantityAnalysis",
  "sampleQuantityRetention",
  "requiredSampleQuantityUnit",
  "unitCode",
  "nablScopeStatus",
  "methodName",
  "methodCode",
  "specificationName",
  "specificationCode",
  "subClause",
  "testUnit",
  "testCode",
  "instrument",
  "loq",
  "parameterIndividualRate",
  "regulatoryRateDrug",
  "addInfo",
]);

const LAB_EDITABLE_FIELDS = new Set<string>([
  "parameterGroup",
  "parameterSubGroup",
  "methodName",
  "specificationName",
  "testUnit",
  "loq",
  "sampleQuantityAnalysis",
  "sampleQuantityRetention",
  "requiredSampleQuantityUnit",
  "nablScopeStatus",
  "nonFssaiFssaiDrug",
  "fssaiCategoryNo",
  "subClause",
  "instrument",
  "addInfo",
]);

const LAB_NAME_DROPDOWNS = {
  parameterGroup: {
    optionsKey: "parameterGroupCodes",
    codeField: "parameterGroupCode",
  },
  parameterSubGroup: {
    optionsKey: "parameterSubGroupCodes",
    codeField: "parameterSubGroupCode",
  },
  methodName: {
    optionsKey: "methodCodes",
    codeField: "methodCode",
  },
  specificationName: {
    optionsKey: "specificationCodes",
    codeField: "specificationCode",
  },
  testUnit: {
    optionsKey: "testCodes",
    codeField: "testCode",
  },
} as const;

type LabNameDropdownField = keyof typeof LAB_NAME_DROPDOWNS;

const LAB_AUTO_CODE_FIELDS = new Set<string>([
  "parameterGroupCode",
  "parameterSubGroupCode",
  "methodCode",
  "specificationCode",
  "testCode",
  "unitCode",
]);

const QUOTATION_NAME_DROPDOWNS = {
  commodityName: {
    optionsKey: "commodityCodes",
    codeField: "commodityCode",
  },
  parameterLabDistribution: {
    optionsKey: "labCodes",
    codeField: "labCode",
  },
  regulationName: {
    optionsKey: "regulationCodes",
    codeField: "regulationCode",
  },
} as const;

type QuotationNameDropdownField = keyof typeof QUOTATION_NAME_DROPDOWNS;



interface SearchableNameDropdownProps {
  value: string;
  options: DropdownOption[];
  placeholder: string;
  disabled?: boolean;
  onSelect: (name: string) => void;
}

function SearchableNameDropdown({
  value,
  options,
  placeholder,
  disabled = false,
  onSelect,
}: SearchableNameDropdownProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [searchText, setSearchText] = useState(value || "");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setSearchText(value || "");
  }, [value]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);

        // If the user typed text but did not choose a valid option,
        // restore the actual saved/selected value.
        if (searchText !== value) {
          setSearchText(value || "");
        }
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [searchText, value]);

  const normalizedSearch = searchText.trim().toLowerCase();

  const filteredOptions = options
    .filter((option) => {
      if (!normalizedSearch) {
        return true;
      }

      return (
        option.name.toLowerCase().includes(normalizedSearch) ||
        option.code.toLowerCase().includes(normalizedSearch)
      );
    })
    .slice(0, 100);

  return (
    <div
      ref={wrapperRef}
      className="relative min-w-[240px] w-full"
    >
      <div className="relative">
        <input
          type="text"
          value={searchText}
          disabled={disabled}
          placeholder={placeholder}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            const nextValue = e.target.value;
            setSearchText(nextValue);
            setIsOpen(true);

            if (nextValue === "") {
              onSelect("");
            }
          }}
          className="w-full px-2 py-1 pr-8 text-sm outline-none border rounded-md bg-white border-slate-300 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-slate-100"
        />

        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          onClick={() => setIsOpen((current) => !current)}
          className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-slate-500 hover:text-slate-700 disabled:cursor-not-allowed"
        >
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-[80] left-0 right-0 mt-1 max-h-64 overflow-y-auto overflow-x-hidden rounded-md border border-slate-200 bg-white shadow-xl">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <button
                key={`${option.code}-${option.name}`}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setSearchText(option.name);
                  setIsOpen(false);
                  onSelect(option.name);
                }}
                className="w-full px-3 py-2 text-left whitespace-normal break-words hover:bg-emerald-50 border-b border-slate-100 last:border-b-0"
              >
                <div className="text-sm font-medium text-slate-800">
                  {option.name}
                </div>

                <div className="text-xs text-slate-500">
                  Code: {option.code}
                </div>
              </button>
            ))
          ) : (
            <div className="px-3 py-3 text-sm text-slate-500">
              No matching result found
            </div>
          )}
        </div>
      )}
    </div>
  );
}


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
        <ToastMessage
          key={toast.id}
          toast={toast}
          onClose={() =>
            removeToast(toast.id)
          }
        />
      ))}
    </div>
  );
}


function ToastMessage({
  toast,
  onClose,
}: {
  toast: Toast;
  onClose: () => void;
}) {
  const [isExiting, setIsExiting] =
    useState(false);


  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);

      setTimeout(
        onClose,
        300
      );
    }, 4000);


    return () => clearTimeout(timer);
  }, [onClose]);


  const config = {
    success: {
      bgColor:
        "bg-gradient-to-r from-emerald-500 to-teal-600",
      icon: Check,
      borderColor:
        "border-emerald-400",
    },

    error: {
      bgColor:
        "bg-gradient-to-r from-red-500 to-rose-600",
      icon: AlertCircle,
      borderColor:
        "border-red-400",
    },

    warning: {
      bgColor:
        "bg-gradient-to-r from-amber-500 to-orange-600",
      icon: AlertTriangle,
      borderColor:
        "border-amber-400",
    },

    info: {
      bgColor:
        "bg-gradient-to-r from-blue-500 to-indigo-600",
      icon: Info,
      borderColor:
        "border-blue-400",
    },
  };


  const {
    bgColor,
    icon: Icon,
    borderColor,
  } = config[toast.type];


  return (
    <div
      className={`
        ${bgColor}
        text-white
        rounded-xl
        shadow-2xl
        border-2
        ${borderColor}
        overflow-hidden
        pointer-events-auto
        transform
        transition-all
        duration-300
        ${isExiting
          ? "translate-x-full opacity-0"
          : "translate-x-0 opacity-100"
        }
      `}
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

            setTimeout(
              onClose,
              300
            );
          }}
          className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}


export default function BatchReview({
  employeeId,
  username,
  role,
  batchId,
  onBack,
}: BatchReviewProps) {
  void username;


  const [batchData, setBatchData] =
    useState<ParameterData[]>([]);

  const [editedData, setEditedData] =
    useState<ParameterData[]>([]);

  const [
    dropdownOptions,
    setDropdownOptions,
  ] =
    useState<ParameterDropdownOptions>(
      EMPTY_DROPDOWN_OPTIONS
    );

  const [
    dropdownLoading,
    setDropdownLoading,
  ] = useState(false);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [
    workflowStage,
    setWorkflowStage,
  ] = useState<string | null>(null);

  const [
    workflowStatus,
    setWorkflowStatus,
  ] = useState<string | null>(null);

  const [
    workflowLoading,
    setWorkflowLoading,
  ] = useState(false);

  const [
    workflowTracker,
    setWorkflowTracker,
  ] = useState<TrackerStageView[]>([]);

  const [
    submitToLabLoading,
    setSubmitToLabLoading,
  ] = useState(false);

  const [
    submitToReviewerLoading,
    setSubmitToReviewerLoading,
  ] = useState(false);

  const [
    submitToAdminLoading,
    setSubmitToAdminLoading,
  ] = useState(false);

  const [
    uploadToMasterLoading,
    setUploadToMasterLoading,
  ] = useState(false);

  const [
    hasChanges,
    setHasChanges,
  ] = useState(false);

  const [
    isEditMode,
    setIsEditMode,
  ] = useState(false);

  const [
    selectedRows,
    setSelectedRows,
  ] =
    useState<Set<number>>(
      new Set()
    );

  const [
    activeTab,
    setActiveTab,
  ] =
    useState<ParameterStatus>(
      "Pending"
    );

  const [
    actionLoading,
    setActionLoading,
  ] = useState(false);

  const [
    rejectReason,
    setRejectReason,
  ] = useState("");

  const [
    toasts,
    setToasts,
  ] = useState<Toast[]>([]);

  const [
    tableScrollWidth,
    setTableScrollWidth,
  ] = useState(0);


  const topScrollRef =
    useRef<HTMLDivElement>(null);

  const tableScrollRef =
    useRef<HTMLDivElement>(null);


  const [
    confirmDialog,
    setConfirmDialog,
  ] =
    useState<ConfirmationDialog>({
      isOpen: false,
      type: null,
      title: "",
      message: "",
      confirmText: "",
      onConfirm: () => { },
    });


  const isQuotation = () => {
    const normalizedRole = (role || "").trim().toUpperCase();

    return (
      normalizedRole === "ROLE000008" ||
      normalizedRole === "ROLE000020" ||
      normalizedRole === "QUOTATION" ||
      normalizedRole === "QUOTATION TEAM"
    );
  };

  const isLab = () => {
    const normalizedRole = (role || "").trim().toUpperCase();

    return (
      normalizedRole === "ROLE000006" ||
      normalizedRole === "ROLE000007"
    );
  };


  const isReviewer = () => {
    const normalizedEmployeeId = (employeeId || "").trim().toLowerCase();
    const normalizedRole = (role || "").trim().toUpperCase();

    return (
      normalizedEmployeeId === "reviewer1" ||
      normalizedRole === "REVIEWER"
    );
  };


  const isAdmin = () => {
    const normalizedEmployeeId = (employeeId || "").trim().toLowerCase();
    const normalizedRole = (role || "").trim().toUpperCase();

    return (
      normalizedEmployeeId === "admin" ||
      normalizedRole === "ADMIN"
    );
  };


  const showToast = (
    type: Toast["type"],
    message: string
  ) => {
    const id =
      `${Date.now()}-${Math.random()}`;

    setToasts((prev) => [
      ...prev,
      {
        id,
        type,
        message,
      },
    ]);
  };


  const removeToast = (
    id: string
  ) => {
    setToasts((prev) =>
      prev.filter(
        (toast) =>
          toast.id !== id
      )
    );
  };


  const getParameterStatus = (
    param: ParameterData
  ): ParameterStatus => {
    if (
      param.status === "Rejected"
    ) {
      return "Rejected";
    }

    if (
      param.status === "Approved"
    ) {
      return "Approved";
    }

    return "Pending";
  };


  const getParametersByStatus = (
    status: ParameterStatus
  ) => {
    return editedData.filter(
      (param) =>
        getParameterStatus(param) ===
        status
    );
  };


  const pendingParams =
    getParametersByStatus(
      "Pending"
    );

  const approvedParams =
    getParametersByStatus(
      "Approved"
    );

  const rejectedParams =
    getParametersByStatus(
      "Rejected"
    );


  const statusCounts = {
    Pending:
      pendingParams.length,
    Approved:
      approvedParams.length,
    Rejected:
      rejectedParams.length,
  };


  const getCurrentTabIndices =
    () => {
      return editedData
        .map((param, idx) =>
          getParameterStatus(
            param
          ) === activeTab
            ? idx
            : -1
        )
        .filter(
          (idx) => idx !== -1
        );
    };


  const getSelectedCountInCurrentTab =
    () => {
      const currentTabIndices =
        getCurrentTabIndices();

      return currentTabIndices
        .filter((idx) =>
          selectedRows.has(idx)
        )
        .length;
    };


  const canEdit = (
    status: ParameterStatus
  ) => {
    if (isReviewer()) {
      return (
        workflowStage === "Reviewer" &&
        workflowStatus === "Pending"
      );
    }

    if (isAdmin()) {
      return (
        workflowStage === "Admin" &&
        workflowStatus === "Pending"
      );
    }

    // Quotation owns its fields while the batch is being prepared.
    if (isQuotation()) {
      return (
        workflowStage === "Quotation" &&
        workflowStatus === "Draft" &&
        (status === "Pending" || status === "Rejected")
      );
    }

    // Lab can edit only while the batch is at Lab / Pending.
    if (isLab()) {
      return (
        workflowStage === "Lab" &&
        workflowStatus === "Pending" &&
        (status === "Pending" || status === "Rejected")
      );
    }

    return status === "Rejected";
  };


  const canApprove = (
    status: ParameterStatus
  ) => {
    if (!isReviewer()) {
      return false;
    }

    return (
      status === "Pending" ||
      status === "Rejected"
    );
  };


  const canReject = (
    status: ParameterStatus
  ) => {
    if (!isReviewer()) {
      return false;
    }

    return (
      status === "Pending" ||
      status === "Approved"
    );
  };


  const loadBatchData =
    async () => {
      try {
        setLoading(true);

        const allParams =
          await searchParameters(
            employeeId,
            role,
            "",
            1,
            100
          );


        const filtered =
          allParams.filter(
            (p) =>
              p.batchId ===
              batchId
          );


        setBatchData(
          filtered
        );

        setEditedData(
          JSON.parse(
            JSON.stringify(
              filtered
            )
          )
        );

        setHasChanges(false);
        setIsEditMode(false);

        setSelectedRows(
          new Set()
        );


        const hasPending =
          filtered.some(
            (p) =>
              getParameterStatus(
                p
              ) === "Pending"
          );


        setActiveTab(
          hasPending
            ? "Pending"
            : "Approved"
        );
      } catch (error) {
        console.error(
          "Error loading batch data:",
          error
        );

        showToast(
          "error",
          "Failed to load batch data. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };


  const loadWorkflowData =
    async () => {
      try {
        setWorkflowLoading(true);

        // Upload logs endpoint currently returns paged data.
        // For the quotation workflow we search the latest 100 batches.
        const logs =
          await getUploadLogs(
            1,
            100
          );

        const batchLog =
          logs.find(
            (log) =>
              log.batchId ===
              batchId
          );

        if (batchLog) {
          setWorkflowStage(
            batchLog.currentStage ||
            null
          );

          setWorkflowStatus(
            batchLog.workflowStatus ||
            null
          );
        } else {
          setWorkflowStage(null);
          setWorkflowStatus(null);
        }
      } catch (error) {
        console.error(
          "Error loading workflow information:",
          error
        );

        setWorkflowStage(null);
        setWorkflowStatus(null);
      } finally {
        setWorkflowLoading(false);
      }
    };


  const loadWorkflowTracker =
    async () => {
      try {
        const data =
          await getWorkflowTracker(batchId);

        const currentStage =
          (data.currentStage || "") as TrackerStageName;

        const completedMap =
          new Map<TrackerStageName, {
            userId?: string;
            userName?: string;
            actionAt?: string;
          }>();

        data.history.forEach((item) => {
          if (
            item.status === "Completed" &&
            TRACKER_STAGE_ORDER.includes(
              item.stage as TrackerStageName
            )
          ) {
            completedMap.set(
              item.stage as TrackerStageName,
              {
                userId: item.userId || undefined,
                userName: item.userName || undefined,
                actionAt: item.actionAt || undefined,
              }
            );
          }
        });

        const quotationStarted =
          [...data.history]
            .reverse()
            .find(
              (item) =>
                item.stage === "Quotation" &&
                item.change === "Upload"
            );

        const currentIndex =
          TRACKER_STAGE_ORDER.indexOf(
            currentStage
          );

        const tracker =
          TRACKER_STAGE_ORDER.map(
            (
              stage,
              index
            ): TrackerStageView => {
              const completed =
                completedMap.get(stage);

              if (completed) {
                return {
                  stage,
                  status: "Completed",
                  ...completed,
                };
              }

              if (stage === currentStage) {
                let currentUserId:
                  | string
                  | undefined;

                let currentUserName:
                  | string
                  | undefined;

                if (
                  stage === "Quotation" &&
                  quotationStarted
                ) {
                  currentUserId =
                    quotationStarted.userId ||
                    undefined;
                  currentUserName =
                    quotationStarted.userName ||
                    undefined;
                } else if (
                  (stage === "Quotation" &&
                    isQuotation()) ||
                  (stage === "Lab" &&
                    isLab()) ||
                  (stage === "Reviewer" &&
                    isReviewer()) ||
                  (stage === "Admin" &&
                    isAdmin())
                ) {
                  currentUserId =
                    employeeId || undefined;
                  currentUserName =
                    username || undefined;
                } else if (
                  stage === "Reviewer"
                ) {
                  currentUserId = "reviewer1";
                  currentUserName = "Reviewer 1";
                } else if (
                  stage === "Admin"
                ) {
                  currentUserId = "admin";
                  currentUserName = "Admin";
                }

                return {
                  stage,
                  status: "Current",
                  userId: currentUserId,
                  userName: currentUserName,
                };
              }

              return {
                stage,
                status:
                  currentIndex >= 0 &&
                  index < currentIndex
                    ? "Completed"
                    : "Waiting",
              };
            }
          );

        setWorkflowTracker(tracker);
      } catch (error) {
        console.error(
          "Error loading workflow tracker:",
          error
        );

        setWorkflowTracker(
          TRACKER_STAGE_ORDER.map(
            (stage) => ({
              stage,
              status:
                stage === workflowStage
                  ? "Current"
                  : "Waiting",
            })
          )
        );
      }
    };


  const loadDropdownData =
    async () => {
      try {
        setDropdownLoading(
          true
        );

        const data =
          await getDropdownOptions();


        setDropdownOptions(
          data
        );
      } catch (error) {
        console.error(
          "Error loading dropdown options:",
          error
        );

        showToast(
          "error",
          "Failed to load dropdown values from database."
        );
      } finally {
        setDropdownLoading(
          false
        );
      }
    };


  useEffect(() => {
    loadBatchData();
    loadDropdownData();
    loadWorkflowData();
    loadWorkflowTracker();
  }, [batchId]);


  useEffect(() => {
    const selectAllCheckbox =
      document.getElementById(
        "select-all-checkbox"
      ) as HTMLInputElement;


    if (
      selectAllCheckbox
    ) {
      const currentTabIndices =
        getCurrentTabIndices();

      const selectedFromCurrentTab =
        getSelectedCountInCurrentTab();

      const totalCount =
        currentTabIndices.length;


      selectAllCheckbox.indeterminate =
        selectedFromCurrentTab > 0 &&
        selectedFromCurrentTab <
        totalCount;
    }
  }, [
    selectedRows,
    activeTab,
    editedData,
  ]);


  useEffect(() => {
    const updateWidth =
      () => {
        if (
          tableScrollRef.current
        ) {
          setTableScrollWidth(
            tableScrollRef
              .current
              .scrollWidth
          );
        }
      };


    const timer =
      window.setTimeout(
        updateWidth,
        0
      );


    const resizeObserver =
      new ResizeObserver(
        updateWidth
      );


    if (
      tableScrollRef.current
    ) {
      resizeObserver.observe(
        tableScrollRef.current
      );
    }


    window.addEventListener(
      "resize",
      updateWidth
    );


    return () => {
      clearTimeout(timer);

      resizeObserver.disconnect();

      window.removeEventListener(
        "resize",
        updateWidth
      );
    };
  }, [
    editedData,
    isEditMode,
    activeTab,
    dropdownLoading,
  ]);


  const handleCellEdit = (
    rowIndex: number,
    field:
      keyof ParameterData,
    value: string
  ) => {
    const updated = [
      ...editedData,
    ];


    updated[rowIndex] = {
      ...updated[rowIndex],
      [field]: value,
    };


    setEditedData(updated);
    setHasChanges(true);
  };


  const isDropdownField = (
    field: string
  ): field is DropdownField => {
    return (
      field in
      DROPDOWN_CONFIG
    );
  };


  const handleDropdownChange =
    (
      rowIndex: number,
      codeField:
        DropdownField,
      value: string
    ) => {
      const config =
        DROPDOWN_CONFIG[
        codeField
        ];


      const options =
        dropdownOptions[
        config.optionsKey
        ];


      const selectedOption =
        options.find(
          (option) =>
            option.code ===
            value
        );


      const updated = [
        ...editedData,
      ];


      updated[rowIndex] = {
        ...updated[rowIndex],

        [codeField]:
          value || null,

        [config.nameField]:
          selectedOption?.name ||
          null,
      };


      setEditedData(
        updated
      );

      setHasChanges(true);
    };


  const isQuotationNameDropdown = (
    field: string
  ): field is QuotationNameDropdownField => {
    return field in QUOTATION_NAME_DROPDOWNS;
  };


  // Used by all roles for the common master name dropdowns.
  const handleQuotationNameChange = (
    rowIndex: number,
    nameField: QuotationNameDropdownField,
    selectedName: string
  ) => {
    const config = QUOTATION_NAME_DROPDOWNS[nameField];
    const options = dropdownOptions[config.optionsKey];

    const selectedOption = options.find(
      (option) => option.name === selectedName
    );

    const updated = [...editedData];

    updated[rowIndex] = {
      ...updated[rowIndex],
      [nameField]: selectedName || null,
      [config.codeField]: selectedOption?.code || null,
    };

    setEditedData(updated);
    setHasChanges(true);
  };


  const isLabNameDropdown = (
    field: string
  ): field is LabNameDropdownField => {
    return field in LAB_NAME_DROPDOWNS;
  };


  const handleLabNameChange = (
    rowIndex: number,
    nameField: LabNameDropdownField,
    selectedName: string
  ) => {
    const config = LAB_NAME_DROPDOWNS[nameField];
    const options = dropdownOptions[config.optionsKey];

    const selectedOption = options.find(
      (option) => option.name === selectedName
    );

    const updated = [...editedData];

    updated[rowIndex] = {
      ...updated[rowIndex],
      [nameField]: selectedName || null,
      [config.codeField]: selectedOption?.code || null,
    };

    setEditedData(updated);
    setHasChanges(true);
  };


  const validateQuotationRows = () => {
    if (!isQuotation()) {
      return true;
    }

    const errors: string[] = [];

    editedData.forEach((param, index) => {
      const row = index + 1;

      if (!String(param.commodityName ?? "").trim()) {
        errors.push(`Row ${row}: Commodity Name is required.`);
      }

      if (!String(param.parameterLabDistribution ?? "").trim()) {
        errors.push(`Row ${row}: Lab Name is required.`);
      }

      if (!String(param.regulationName ?? "").trim()) {
        errors.push(`Row ${row}: Regulation Name is required.`);
      }

      const drugCode = String(param.nonFssaiFssaiDrugCode ?? "")
        .trim()
        .toUpperCase();
      const drugName = String(param.nonFssaiFssaiDrug ?? "")
        .trim()
        .toUpperCase();
      const isDrugRow = drugCode === "003" || drugName === "DRUG";

      if (isDrugRow) {
        if (
          param.parameterIndividualRate === null ||
          param.parameterIndividualRate === undefined ||
          String(param.parameterIndividualRate).trim() === ""
        ) {
          errors.push(
            `Row ${row}: Parameter Individual Rate is required for Drug.`
          );
        }

        if (
          param.regulatoryRateDrug === null ||
          param.regulatoryRateDrug === undefined ||
          String(param.regulatoryRateDrug).trim() === ""
        ) {
          errors.push(
            `Row ${row}: Regulatory Rate Drug is required for Drug.`
          );
        }
      }
    });

    if (errors.length > 0) {
      showToast(
        "error",
        errors.length === 1
          ? errors[0]
          : `${errors[0]} (+${errors.length - 1} more validation error${
              errors.length - 1 === 1 ? "" : "s"
            })`
      );
      return false;
    }

    return true;
  };


  const handleEditMode =
    () => {
      setIsEditMode(true);

      setSelectedRows(
        new Set()
      );
    };


  const openConfirmDialog =
    (
      type:
        | "approve"
        | "reject"
        | "save"
        | "cancel"
        | "resubmit"
        | "submitLab"
        | "submitReviewer"
        | "submitAdmin"
        | "uploadMaster",
      onConfirm: () => void
    ) => {
      const configs = {
        approve: {
          title:
            "Approve Parameters",
          message:
            `Are you sure you want to approve ${selectedRows.size} parameter(s)?`,
          confirmText:
            "Approve Parameters",
        },

        reject: {
          title:
            "Reject Parameters",
          message:
            `Are you sure you want to reject ${selectedRows.size} parameter(s)?`,
          confirmText:
            "Reject Parameters",
        },

        save: {
          title:
            "Save Changes",
          message:
            "Are you sure you want to save all the changes?",
          confirmText:
            "Save Changes",
        },

        cancel: {
          title:
            "Discard Changes",
          message:
            "You have unsaved changes. Are you sure you want to discard them?",
          confirmText:
            "Discard Changes",
        },

        resubmit: {
          title:
            "Resubmit for Review",
          message:
            "Are you sure you want to save changes and resubmit these parameters for review?",
          confirmText:
            "Resubmit for Review",
        },

        submitLab: {
          title:
            "Submit to Lab",
          message:
            `Are you sure you want to submit Batch #${batchId} to the Lab? After submission, the batch will move from Quotation to Lab.`,
          confirmText:
            "Submit to Lab",
        },

        submitReviewer: {
          title:
            "Submit to Reviewer",
          message:
            `Are you sure you want to submit Batch #${batchId} to the Reviewer? After submission, the batch will move from Lab to Reviewer.`,
          confirmText:
            "Submit to Reviewer",
        },

        submitAdmin: {
          title:
            "Submit to Admin",
          message:
            `Are you sure you want to submit Batch #${batchId} to Admin? All parameters must be approved. After submission, the batch will move from Reviewer to Admin.`,
          confirmText:
            "Submit to Admin",
        },

        uploadMaster: {
          title:
            "Upload to Master",
          message:
            `Are you sure you want to perform the final upload for Batch #${batchId}? All approved parameter data will be written to the master tables and the workflow will be completed.`,
          confirmText:
            "Upload to Master",
        },
      };


      const config =
        configs[type];


      setConfirmDialog({
        isOpen: true,
        type,
        title: config.title,
        message:
          config.message,
        confirmText:
          config.confirmText,
        onConfirm,
      });
    };


  const closeConfirmDialog =
    () => {
      setConfirmDialog({
        isOpen: false,
        type: null,
        title: "",
        message: "",
        confirmText: "",
        onConfirm: () => { },
      });

      setRejectReason("");
      setActionLoading(false);
    };


  const handleCancelEdit =
    () => {
      if (hasChanges) {
        openConfirmDialog(
          "cancel",
          () => {
            setEditedData(
              JSON.parse(
                JSON.stringify(
                  batchData
                )
              )
            );

            setHasChanges(
              false
            );

            setIsEditMode(
              false
            );

            closeConfirmDialog();
          }
        );
      } else {
        setIsEditMode(
          false
        );
      }
    };


  const handleSaveEdit =
    () => {
      if (!validateQuotationRows()) {
        return;
      }

      if (
        !isReviewer() &&
        activeTab ===
        "Rejected"
      ) {
        openConfirmDialog(
          "resubmit",
          async () => {
            try {
              setActionLoading(
                true
              );

              setSaving(true);


              const updatedParams =
                editedData.map(
                  (param) => {
                    if (
                      getParameterStatus(
                        param
                      ) ===
                      "Rejected"
                    ) {
                      return {
                        ...param,
                        status:
                          "Pending",
                        remarks:
                          null,
                      };
                    }

                    return param;
                  }
                );


              const request:
                ParameterUpdateRequest =
              {
                parameters:
                  updatedParams.filter(
                    (p) =>
                      p.status ===
                      "Pending"
                  ),
                updatedBy:
                  employeeId,
              };


              await updateParameters(
                request
              );


              setBatchData(
                updatedParams
              );

              setHasChanges(
                false
              );

              setIsEditMode(
                false
              );


              closeConfirmDialog();

              showToast(
                "success",
                "Changes saved and resubmitted for review successfully!"
              );


              await loadBatchData();
            } catch (error) {
              console.error(
                "Error saving changes:",
                error
              );

              showToast(
                "error",
                "Failed to save changes. Please try again."
              );
            } finally {
              setSaving(false);

              setActionLoading(
                false
              );
            }
          }
        );

        return;
      }


      openConfirmDialog(
        "save",
        async () => {
          try {
            setActionLoading(
              true
            );

            setSaving(true);


            const request:
              ParameterUpdateRequest =
            {
              parameters:
                editedData,

              updatedBy:
                employeeId,
            };


            await updateParameters(
              request
            );


            setBatchData(
              editedData
            );

            setHasChanges(
              false
            );

            setIsEditMode(
              false
            );


            closeConfirmDialog();


            showToast(
              "success",
              "Changes saved successfully!"
            );


            await loadBatchData();
          } catch (error) {
            console.error(
              "Error saving changes:",
              error
            );

            showToast(
              "error",
              "Failed to save changes. Please try again."
            );
          } finally {
            setSaving(false);

            setActionLoading(
              false
            );
          }
        }
      );
    };


  const handleRowSelection =
    (index: number) => {
      const newSelected =
        new Set(
          selectedRows
        );


      if (
        newSelected.has(
          index
        )
      ) {
        newSelected.delete(
          index
        );
      } else {
        newSelected.add(
          index
        );
      }


      setSelectedRows(
        newSelected
      );
    };


  const handleSelectAll =
    () => {
      const currentTabIndices =
        getCurrentTabIndices();


      const allSelected =
        currentTabIndices.length >
        0 &&
        currentTabIndices.every(
          (idx) =>
            selectedRows.has(
              idx
            )
        );


      const newSelected =
        new Set(
          selectedRows
        );


      if (allSelected) {
        currentTabIndices.forEach(
          (idx) =>
            newSelected.delete(
              idx
            )
        );
      } else {
        currentTabIndices.forEach(
          (idx) =>
            newSelected.add(
              idx
            )
        );
      }


      setSelectedRows(
        newSelected
      );
    };


  const handleApprove =
    () => {
      if (
        selectedRows.size ===
        0
      ) {
        showToast(
          "warning",
          "Please select at least one parameter to approve."
        );

        return;
      }


      openConfirmDialog(
        "approve",
        async () => {
          try {
            setActionLoading(
              true
            );


            const selectedParams =
              editedData
                .filter(
                  (_, idx) =>
                    selectedRows.has(
                      idx
                    )
                )
                .map(
                  (param) => ({
                    ...param,
                    status:
                      "Approved",
                    remarks:
                      null,
                  })
                );


            const request:
              ParameterUpdateRequest =
            {
              parameters:
                selectedParams,

              reviewedBy:
                employeeId,
            };


            await updateParameters(
              request
            );


            setSelectedRows(
              new Set()
            );

            closeConfirmDialog();


            showToast(
              "success",
              `${selectedParams.length} parameter(s) approved successfully!`
            );


            await loadBatchData();
          } catch (error) {
            console.error(
              "Error approving parameters:",
              error
            );

            showToast(
              "error",
              "Failed to approve parameters. Please try again."
            );

            setActionLoading(
              false
            );
          }
        }
      );
    };


  const handleReject =
    () => {
      if (
        selectedRows.size ===
        0
      ) {
        showToast(
          "warning",
          "Please select at least one parameter to reject."
        );

        return;
      }


      openConfirmDialog(
        "reject",
        () => { }
      );
    };


  const handleConfirmReject =
    async () => {
      try {
        setActionLoading(
          true
        );


        const selectedParams =
          editedData
            .filter(
              (_, idx) =>
                selectedRows.has(
                  idx
                )
            )
            .map(
              (param) => ({
                ...param,
                status:
                  "Rejected",
              })
            );


        const request:
          ParameterUpdateRequest =
        {
          parameters:
            selectedParams,

          reviewedBy:
            employeeId,

          remarks:
            rejectReason.trim(),
        };


        await updateParameters(
          request
        );


        setSelectedRows(
          new Set()
        );

        closeConfirmDialog();


        showToast(
          "success",
          `${selectedParams.length} parameter(s) rejected successfully!`
        );


        await loadBatchData();
      } catch (error) {
        console.error(
          "Error rejecting parameters:",
          error
        );

        showToast(
          "error",
          "Failed to reject parameters. Please try again."
        );

        setActionLoading(false);
      }
    };


  const handleSubmitRevised =
    () => {
      if (
        selectedRows.size ===
        0
      ) {
        showToast(
          "warning",
          "Please select at least one parameter to resubmit."
        );

        return;
      }


      openConfirmDialog(
        "resubmit",
        async () => {
          try {
            setActionLoading(
              true
            );


            const selectedParams =
              editedData
                .filter(
                  (_, idx) =>
                    selectedRows.has(
                      idx
                    )
                )
                .map(
                  (param) => ({
                    ...param,
                    status:
                      "Pending",
                    remarks:
                      null,
                  })
                );


            const request:
              ParameterUpdateRequest =
            {
              parameters:
                selectedParams,

              updatedBy:
                employeeId,
            };


            await updateParameters(
              request
            );


            setSelectedRows(
              new Set()
            );

            closeConfirmDialog();


            showToast(
              "success",
              `${selectedParams.length} parameter(s) resubmitted for review successfully!`
            );


            await loadBatchData();
          } catch (error) {
            console.error(
              "Error resubmitting parameters:",
              error
            );

            showToast(
              "error",
              "Failed to resubmit parameters. Please try again."
            );

            setActionLoading(
              false
            );
          }
        }
      );
    };


  const canSubmitQuotationToLab =
    () => {
      return (
        isQuotation() &&
        !isEditMode &&
        !hasChanges &&
        !workflowLoading &&
        workflowStage === "Quotation" &&
        workflowStatus === "Draft"
      );
    };


  const handleSubmitToLab =
    () => {
      if (!canSubmitQuotationToLab()) {
        showToast(
          "warning",
          hasChanges
            ? "Please save your changes before submitting to Lab."
            : "This batch is not currently available for Quotation submission."
        );

        return;
      }

      openConfirmDialog(
        "submitLab",
        async () => {
          try {
            setActionLoading(true);
            setSubmitToLabLoading(true);

            const response =
              await submitToLab(
                batchId,
                {
                  userId:
                    employeeId,
                  remarks:
                    "Quotation completed and submitted to Lab",
                }
              );

            closeConfirmDialog();

            showToast(
              "success",
              response.message ||
              `Batch ${batchId} submitted to Lab successfully.`
            );

            await loadWorkflowData();
            await loadWorkflowTracker();
          } catch (error) {
            console.error(
              "Error submitting batch to Lab:",
              error
            );

            showToast(
              "error",
              error instanceof Error
                ? error.message
                : "Failed to submit batch to Lab."
            );

            setActionLoading(false);
          } finally {
            setSubmitToLabLoading(false);
          }
        }
      );
    };


  const validateLabMandatoryFields = () => {
    const missing: string[] = [];

    const isBlank = (value: unknown) =>
      value === null ||
      value === undefined ||
      String(value).trim() === "";

    editedData.forEach((row, index) => {
      const rowNo = index + 1;

      const requiredFields: Array<{
        label: string;
        value: unknown;
      }> = [
        { label: "Parameter Group", value: row.parameterGroup },
        { label: "Parameter Group Code", value: row.parameterGroupCode },
        { label: "Method Name", value: row.methodName },
        { label: "Specification Name", value: row.specificationName },
        { label: "Test Unit", value: row.testUnit },
        { label: "LOQ", value: row.loq },
        { label: "Sample Quantity Analysis", value: row.sampleQuantityAnalysis },
        { label: "Sample Quantity Retention", value: row.sampleQuantityRetention },
        { label: "Required Sample Quantity Unit", value: row.requiredSampleQuantityUnit },
        { label: "NABL Scope Status", value: row.nablScopeStatus },
        { label: "Non FSSAI/FSSAI/Drug", value: row.nonFssaiFssaiDrug },
        { label: "FSSAI Category No", value: row.fssaiCategoryNo },
        { label: "Sub Clause", value: row.subClause },
        { label: "Instrument", value: row.instrument },
      ];

      requiredFields.forEach(({ label, value }) => {
        if (isBlank(value)) {
          missing.push(`Row ${rowNo}: ${label} is required`);
        }
      });
    });

    return missing;
  };


  const canSubmitLabToReviewer =
    () => {
      return (
        isLab() &&
        !isEditMode &&
        !hasChanges &&
        !workflowLoading &&
        workflowStage === "Lab" &&
        workflowStatus === "Pending"
      );
    };


  const handleSubmitToReviewer =
    () => {
      if (!canSubmitLabToReviewer()) {
        showToast(
          "warning",
          hasChanges
            ? "Please save your changes before submitting to Reviewer."
            : "This batch is not currently available for Lab submission."
        );

        return;
      }

      const labValidationErrors =
        validateLabMandatoryFields();

      if (labValidationErrors.length > 0) {
        showToast(
          "warning",
          `Please complete all mandatory Lab fields. ${labValidationErrors
            .slice(0, 3)
            .join("; ")}${
              labValidationErrors.length > 3
                ? `; +${labValidationErrors.length - 3} more`
                : ""
            }`
        );
        return;
      }

      openConfirmDialog(
        "submitReviewer",
        async () => {
          try {
            setActionLoading(true);
            setSubmitToReviewerLoading(true);

            const response =
              await submitToReviewer(
                batchId,
                {
                  userId: employeeId,
                  remarks: "Lab completed and submitted to Reviewer",
                }
              );

            closeConfirmDialog();

            showToast(
              "success",
              response.message ||
              `Batch ${batchId} submitted to Reviewer successfully.`
            );

            await loadWorkflowData();
            await loadWorkflowTracker();
          } catch (error) {
            console.error(
              "Error submitting batch to Reviewer:",
              error
            );

            showToast(
              "error",
              error instanceof Error
                ? error.message
                : "Failed to submit batch to Reviewer."
            );

            setActionLoading(false);
          } finally {
            setSubmitToReviewerLoading(false);
          }
        }
      );
    };


  const canSubmitReviewerToAdmin =
    () => {
      const allApproved =
        editedData.length > 0 &&
        editedData.every(
          (param) =>
            getParameterStatus(param) === "Approved"
        );

      return (
        isReviewer() &&
        !isEditMode &&
        !hasChanges &&
        !workflowLoading &&
        workflowStage === "Reviewer" &&
        workflowStatus === "Pending" &&
        allApproved
      );
    };


  const handleSubmitToAdmin =
    () => {
      const notApprovedCount =
        editedData.filter(
          (param) =>
            getParameterStatus(param) !== "Approved"
        ).length;

      if (!canSubmitReviewerToAdmin()) {
        showToast(
          "warning",
          hasChanges
            ? "Please save your changes before submitting to Admin."
            : notApprovedCount > 0
              ? `Please approve all parameters first. ${notApprovedCount} parameter(s) are not approved.`
              : "This batch is not currently available for Reviewer submission."
        );

        return;
      }

      openConfirmDialog(
        "submitAdmin",
        async () => {
          try {
            setActionLoading(true);
            setSubmitToAdminLoading(true);

            const response =
              await submitToAdmin(
                batchId,
                {
                  userId: employeeId,
                  remarks:
                    "Reviewer completed and submitted to Admin",
                }
              );

            closeConfirmDialog();

            showToast(
              "success",
              response.message ||
              `Batch ${batchId} submitted to Admin successfully.`
            );

            await loadWorkflowData();
            await loadWorkflowTracker();
          } catch (error) {
            console.error(
              "Error submitting batch to Admin:",
              error
            );

            showToast(
              "error",
              error instanceof Error
                ? error.message
                : "Failed to submit batch to Admin."
            );

            setActionLoading(false);
          } finally {
            setSubmitToAdminLoading(false);
          }
        }
      );
    };


  const canUploadAdminToMaster =
    () => {
      const allApproved =
        editedData.length > 0 &&
        editedData.every(
          (param) =>
            getParameterStatus(param) === "Approved"
        );

      return (
        isAdmin() &&
        !isEditMode &&
        !hasChanges &&
        !workflowLoading &&
        workflowStage === "Admin" &&
        workflowStatus === "Pending" &&
        allApproved
      );
    };


  const handleUploadToMaster =
    () => {
      const notApprovedCount =
        editedData.filter(
          (param) =>
            getParameterStatus(param) !== "Approved"
        ).length;

      if (!canUploadAdminToMaster()) {
        showToast(
          "warning",
          hasChanges
            ? "Please save your changes before uploading to Master."
            : notApprovedCount > 0
              ? `Final upload is blocked because ${notApprovedCount} parameter(s) are not approved.`
              : "This batch is not currently available for final Admin upload."
        );

        return;
      }

      openConfirmDialog(
        "uploadMaster",
        async () => {
          try {
            setActionLoading(true);
            setUploadToMasterLoading(true);

            const response =
              await uploadToMaster(
                batchId,
                employeeId
              );

            closeConfirmDialog();

            showToast(
              "success",
              response.message ||
              `Batch ${batchId} uploaded to Master successfully.`
            );

            await loadWorkflowData();
            await loadWorkflowTracker();
            await loadBatchData();
          } catch (error) {
            console.error(
              "Error uploading batch to Master:",
              error
            );

            showToast(
              "error",
              error instanceof Error
                ? error.message
                : "Failed to upload batch to Master."
            );

            setActionLoading(false);
          } finally {
            setUploadToMasterLoading(false);
          }
        }
      );
    };


  const handleCloseBatch =
    () => {
      if (hasChanges) {
        openConfirmDialog(
          "cancel",
          () => {
            closeConfirmDialog();
            onBack();
          }
        );
      } else {
        onBack();
      }
    };


  const handleTopScroll =
    () => {
      if (
        !topScrollRef.current ||
        !tableScrollRef.current
      ) {
        return;
      }


      tableScrollRef.current.scrollLeft =
        topScrollRef.current.scrollLeft;
    };


  const handleBottomScroll =
    () => {
      if (
        !topScrollRef.current ||
        !tableScrollRef.current
      ) {
        return;
      }


      topScrollRef.current.scrollLeft =
        tableScrollRef.current.scrollLeft;
    };


  const renderEditableCell =
    (
      param: ParameterData,
      originalIndex: number,
      header: typeof COLUMN_HEADERS[number]
    ) => {
      const key = header.key as keyof ParameterData;
      const keyName = header.key as string;

      // ------------------------------------------------------------
      // PARAMETER CODE - NORMAL INPUT FOR ALL EDITABLE ROLES
      // No dropdown / master lookup.
      // ------------------------------------------------------------
      if (keyName === "parameterCode") {
        return (
          <input
            type="text"
            value={String(param[key] ?? "")}
            onChange={(e) =>
              handleCellEdit(
                originalIndex,
                key,
                e.target.value
              )
            }
            className="min-w-[170px] w-full px-2 py-1 text-sm outline-none border rounded-md bg-white border-slate-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        );
      }

      // ------------------------------------------------------------
      // COMMON SEARCHABLE MASTER DROPDOWNS - ALL USERS
      //
      // Commodity Name  -> CatagoryName / CatagoryCode
      // Regulation Name -> RegulationName / RegulationCode
      // Lab Name        -> CODEDESC / CODECD (CODETYPE = 'DM')
      //
      // This runs before the role-specific branches so Quotation,
      // Lab, Reviewer and Admin all get the same searchable dropdown.
      // ------------------------------------------------------------
      if (isQuotationNameDropdown(keyName)) {
        const config = QUOTATION_NAME_DROPDOWNS[keyName];
        const options = dropdownOptions[config.optionsKey];

        return (
          <SearchableNameDropdown
            value={String(param[key] ?? "")}
            options={options}
            disabled={dropdownLoading}
            placeholder={
              dropdownLoading
                ? "Loading..."
                : `Search ${header.label.replace(" *", "")}`
            }
            onSelect={(selectedName) =>
              handleQuotationNameChange(
                originalIndex,
                keyName,
                selectedName
              )
            }
          />
        );
      }

      // ------------------------------------------------------------
      // LAB MASTER SEARCH DROPDOWNS
      //
      // Reverse mapping:
      // Parameter Group     -> Parameter Group Code
      // Parameter Sub-Group -> Parameter Sub-Group Code
      // Method Name         -> Method Code
      // Specification Name  -> Specification Code
      // Test Unit           -> Test Code
      //
      // Lab, Reviewer and Admin use the same searchable NAME dropdown.
      // Code columns are auto-filled and read-only.
      // ------------------------------------------------------------
      if (
        (isLab() || isReviewer() || isAdmin()) &&
        isLabNameDropdown(keyName)
      ) {
        const config = LAB_NAME_DROPDOWNS[keyName];
        const options = dropdownOptions[config.optionsKey];

        return (
          <SearchableNameDropdown
            value={String(param[key] ?? "")}
            options={options}
            disabled={dropdownLoading}
            placeholder={
              dropdownLoading
                ? "Loading..."
                : `Search ${header.label}`
            }
            onSelect={(selectedName) =>
              handleLabNameChange(
                originalIndex,
                keyName,
                selectedName
              )
            }
          />
        );
      }

      // Auto-filled Lab code columns must not become code dropdowns.
      if (
        isLab() &&
        LAB_AUTO_CODE_FIELDS.has(keyName)
      ) {
        return (
          <input
            type="text"
            value={String(param[key] ?? "")}
            readOnly
            className="min-w-[170px] w-full px-2 py-1 text-sm outline-none border rounded-md bg-slate-100 text-slate-600 border-slate-200 cursor-not-allowed"
          />
        );
      }


      // ------------------------------------------------------------
      // QUOTATION MODE
      // Only the six Quotation fields are editable.
      // Commodity/Lab/Regulation are selected by NAME and their CODE
      // is filled automatically.
      // ------------------------------------------------------------
      if (isQuotation()) {
        const quotationEditable = QUOTATION_EDITABLE_FIELDS.has(keyName);

        return (
          <input
            type={
              keyName === "parameterIndividualRate" ||
              keyName === "regulatoryRateDrug"
                ? "number"
                : "text"
            }
            step={
              keyName === "parameterIndividualRate" ||
              keyName === "regulatoryRateDrug"
                ? "any"
                : undefined
            }
            value={String(param[key] ?? "")}
            readOnly={!quotationEditable}
            onChange={(e) =>
              quotationEditable &&
              handleCellEdit(originalIndex, key, e.target.value)
            }
            className={`
              min-w-[170px] w-full px-2 py-1 text-sm outline-none border rounded-md transition-all
              ${quotationEditable
                ? "bg-white border-slate-300 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                : "bg-slate-100 text-slate-600 border-slate-200 cursor-not-allowed"
              }
            `}
          />
        );
      }

      // ------------------------------------------------------------
      // LAB MODE
      // Searchable master fields are handled above.
      // Required Sample Quantity Unit is a normal input.
      // Paired code columns are auto-filled/read-only above.
      // ------------------------------------------------------------
      if (isLab()) {
        const labEditable = LAB_EDITABLE_FIELDS.has(keyName);

        return (
          <input
            type={
              keyName === "loq" ||
              keyName === "sampleQuantityAnalysis" ||
              keyName === "sampleQuantityRetention"
                ? "number"
                : "text"
            }
            step={
              keyName === "loq" ||
              keyName === "sampleQuantityAnalysis" ||
              keyName === "sampleQuantityRetention"
                ? "any"
                : undefined
            }
            value={String(param[key] ?? "")}
            readOnly={!labEditable}
            onChange={(e) =>
              labEditable &&
              handleCellEdit(originalIndex, key, e.target.value)
            }
            className={`
              min-w-[170px] w-full px-2 py-1 text-sm outline-none border rounded-md transition-all
              ${labEditable
                ? "bg-white border-slate-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                : "bg-slate-100 text-slate-600 border-slate-200 cursor-not-allowed"
              }
            `}
          />
        );
      }


      // ------------------------------------------------------------
      // REVIEWER / ADMIN - FULL EDIT ACCESS
      // Searchable name fields are handled above. Paired code columns
      // are intentionally editable for Reviewer and Admin.
      // ------------------------------------------------------------
      if (
        (isReviewer() || isAdmin()) &&
        REVIEWER_ADMIN_EDITABLE_FIELDS.has(keyName)
      ) {
        return (
          <input
            type={
              keyName === "loq" ||
              keyName === "tatDays" ||
              keyName === "parameterSequence" ||
              keyName === "sampleQuantityAnalysis" ||
              keyName === "sampleQuantityRetention" ||
              keyName === "parameterIndividualRate" ||
              keyName === "regulatoryRateDrug"
                ? "number"
                : "text"
            }
            step={
              keyName === "loq" ||
              keyName === "sampleQuantityAnalysis" ||
              keyName === "sampleQuantityRetention" ||
              keyName === "parameterIndividualRate" ||
              keyName === "regulatoryRateDrug"
                ? "any"
                : undefined
            }
            value={String(param[key] ?? "")}
            onChange={(e) =>
              handleCellEdit(originalIndex, key, e.target.value)
            }
            className="min-w-[170px] w-full px-2 py-1 text-sm outline-none border rounded-md bg-white border-slate-300 focus:ring-1 focus:ring-violet-500 focus:border-violet-500"
          />
        );
      }


      // ------------------------------------------------------------
      // EXISTING REVIEWER / OTHER MODE
      // Existing code-based dropdown behaviour is preserved.
      // ------------------------------------------------------------
      if (isDropdownField(keyName)) {
        const config = DROPDOWN_CONFIG[keyName];
        const options = dropdownOptions[config.optionsKey];

        return (
          <select
            value={String(param[key] ?? "")}
            onChange={(e) =>
              handleDropdownChange(
                originalIndex,
                keyName,
                e.target.value
              )
            }
            disabled={dropdownLoading}
            className="min-w-[190px] w-full px-2 py-1 text-sm outline-none border rounded-md bg-white border-slate-300 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-slate-100"
          >
            <option value="">
              {dropdownLoading ? "Loading..." : `Select ${header.label}`}
            </option>

            {options.map((option) => (
              <option key={option.code} value={option.code}>
                {option.code} - {option.name}
              </option>
            ))}
          </select>
        );
      }

      const isAutoFilled = AUTO_FILLED_FIELDS.has(keyName);

      return (
        <input
          type="text"
          value={String(param[key] ?? "")}
          readOnly={isAutoFilled}
          onChange={(e) =>
            handleCellEdit(
              originalIndex,
              key,
              e.target.value
            )
          }
          className={`
            min-w-[170px]
            w-full
            px-2
            py-1
            text-sm
            outline-none
            border
            rounded-md
            transition-all
            ${isAutoFilled
              ? "bg-slate-100 text-slate-600 border-slate-200 cursor-not-allowed"
              : "bg-white border-slate-300 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            }
          `}
        />
      );
    };


  const renderTable = (
    parameters:
      ParameterData[],
    status:
      ParameterStatus
  ) => {
    if (
      parameters.length ===
      0
    ) {
      return null;
    }


    const statusConfig = {
      Pending: {
        icon: Clock,
        label: "Pending",
      },

      Approved: {
        icon:
          CheckCircle2,
        label:
          "Approved",
      },

      Rejected: {
        icon:
          XOctagon,
        label:
          "Rejected",
      },
    };


    const config =
      statusConfig[status];

    const StatusIcon =
      config.icon;

    const isEditable =
      canEdit(status);


    const showCheckboxes =
      isReviewer()
        ? !isEditMode
        : isAdmin()
          ? false
          : status ===
            "Rejected";


    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6 animate-fadeIn">

        <div
          className={`px-5 py-4 border-b ${status ===
              "Pending"
              ? "bg-amber-50 border-amber-200"
              : status ===
                "Approved"
                ? "bg-emerald-50 border-emerald-200"
                : "bg-red-50 border-red-200"
            }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">

              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-sm ${status ===
                    "Pending"
                    ? "bg-amber-500"
                    : status ===
                      "Approved"
                      ? "bg-emerald-500"
                      : "bg-red-500"
                  }`}
              >
                <StatusIcon className="w-5 h-5 text-white" />
              </div>


              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {config.label} Parameters
                </h3>

                <p className="text-xs text-slate-600">
                  {parameters.length} parameter
                  {parameters.length !== 1
                    ? "s"
                    : ""}
                </p>
              </div>
            </div>


            {showCheckboxes &&
              getSelectedCountInCurrentTab() >
              0 && (
                <span className="text-sm text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-200 font-semibold">
                  {getSelectedCountInCurrentTab()} selected
                </span>
              )}
          </div>
        </div>


        {/* TOP HORIZONTAL SCROLLBAR */}
        <div
          ref={topScrollRef}
          onScroll={
            handleTopScroll
          }
          className="overflow-x-auto overflow-y-hidden border-b border-slate-200 bg-slate-50"
          style={{
            height: "18px",
          }}
        >
          <div
            style={{
              width:
                `${tableScrollWidth}px`,
              height: "1px",
            }}
          />
        </div>


        {/* MAIN TABLE + BOTTOM SCROLLBAR */}
        <div
          ref={
            tableScrollRef
          }
          onScroll={
            handleBottomScroll
          }
          className="overflow-x-auto"
        >
          <table className="min-w-max w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>

                {showCheckboxes && (
                  <th className="px-4 py-3 text-left w-12">
                    <div className="flex items-center justify-center">
                      <input
                        id="select-all-checkbox"
                        type="checkbox"
                        checked={(() => {
                          const indices =
                            getCurrentTabIndices();

                          const selected =
                            getSelectedCountInCurrentTab();

                          return (
                            indices.length >
                            0 &&
                            selected ===
                            indices.length
                          );
                        })()}
                        onChange={
                          handleSelectAll
                        }
                        className="w-5 h-5 rounded outline-none border-2 border-slate-300 text-emerald-600 cursor-pointer"
                      />
                    </div>
                  </th>
                )}


                {COLUMN_HEADERS.map(
                  (header) => (
                    <th
                      key={
                        header.key
                      }
                      className="px-4 py-3 text-left whitespace-nowrap"
                    >
                      <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        {
                          header.label
                        }
                      </span>
                    </th>
                  )
                )}


                {status ===
                  "Rejected" && (
                    <th className="px-4 py-3 text-left whitespace-nowrap">
                      <span className="text-xs font-semibold text-red-600 uppercase tracking-wider">
                        Remarks
                      </span>
                    </th>
                  )}
              </tr>
            </thead>


            <tbody className="divide-y divide-slate-100">

              {parameters.map(
                (param) => {
                  const originalIndex =
                    editedData.findIndex(
                      (p) =>
                        p.id ===
                        param.id
                    );


                  const isSelected =
                    selectedRows.has(
                      originalIndex
                    );


                  return (
                    <tr
                      key={
                        param.id
                      }
                      className={`transition-all duration-200 ${isSelected
                          ? "bg-emerald-50/70 hover:bg-emerald-50"
                          : "hover:bg-slate-50"
                        }`}
                    >

                      {showCheckboxes && (
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center">
                            <input
                              type="checkbox"
                              checked={
                                isSelected
                              }
                              onChange={() =>
                                handleRowSelection(
                                  originalIndex
                                )
                              }
                              className="w-5 h-5 rounded border-2 border-slate-300 text-emerald-600 cursor-pointer"
                            />
                          </div>
                        </td>
                      )}


                      {COLUMN_HEADERS.map(
                        (
                          header
                        ) => (
                          <td
                            key={
                              header.key
                            }
                            className="px-4 py-3 whitespace-nowrap"
                          >
                            {isEditMode &&
                              isEditable ? (
                              renderEditableCell(
                                param,
                                originalIndex,
                                header
                              )
                            ) : (
                              <span className="text-sm text-slate-700">
                                {String(
                                  param[
                                  header.key as keyof ParameterData
                                  ] ??
                                  ""
                                )}
                              </span>
                            )}
                          </td>
                        )
                      )}


                      {status ===
                        "Rejected" && (
                          <td className="px-4 py-3 max-w-[320px]">
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />

                              <span className="text-sm text-slate-700 break-words whitespace-normal">
                                {param.remarks ||
                                  "No reason provided"}
                              </span>
                            </div>
                          </td>
                        )}
                    </tr>
                  );
                }
              )}

            </tbody>
          </table>
        </div>
      </div>
    );
  };


  const getVisibleTabs =
    (): ParameterStatus[] => {
      return [
        "Pending",
        "Approved",
        "Rejected",
      ];
    };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">

      <ToastContainer
        toasts={toasts}
        removeToast={
          removeToast
        }
      />


      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 py-4">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-4">

              <button
                onClick={
                  handleCloseBatch
                }
                className="p-2 hover:bg-slate-100 rounded-lg transition-all"
              >
                <ChevronLeft className="w-5 h-5 text-slate-700" />
              </button>


              <div className="flex items-center gap-3">

                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                  <TableIcon className="w-6 h-6 text-white" />
                </div>


                <div>
                  <h1 className="text-xl font-bold text-slate-900">
                    Batch Review #{batchId}
                  </h1>

                  <p className="text-sm text-slate-600">
                    {isAdmin()
                      ? `Admin Mode${workflowStage ? ` • ${workflowStage} / ${workflowStatus ?? ""}` : ""}`
                      : isReviewer()
                        ? `Reviewer Mode${workflowStage ? ` • ${workflowStage} / ${workflowStatus ?? ""}` : ""}`
                        : isQuotation()
                          ? `Quotation Mode${workflowStage ? ` • ${workflowStage} / ${workflowStatus ?? ""}` : ""}`
                          : isLab()
                            ? `Lab Mode${workflowStage ? ` • ${workflowStage} / ${workflowStatus ?? ""}` : ""}`
                            : "User Mode"}
                  </p>
                </div>
              </div>
            </div>


            <div className="flex items-center gap-3">

              {isEditMode ? (
                <>
                  <button
                    onClick={
                      handleCancelEdit
                    }
                    disabled={
                      saving
                    }
                    className="px-5 py-2.5 rounded-lg bg-white border-2 border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>


                  <button
                    onClick={
                      handleSaveEdit
                    }
                    disabled={
                      !hasChanges ||
                      saving
                    }
                    className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold disabled:opacity-50 flex items-center gap-2 shadow-lg"
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

                  {selectedRows.size ===
                    0 &&
                    canEdit(
                      activeTab
                    ) && (
                      <button
                        onClick={
                          handleEditMode
                        }
                        disabled={
                          getParametersByStatus(
                            activeTab
                          ).length ===
                          0
                        }
                        className="px-5 py-2.5 rounded-lg bg-white border-2 border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 disabled:opacity-50 flex items-center gap-2 shadow-sm"
                      >
                        <Edit3 className="w-4 h-4" />
                        Edit Mode
                      </button>
                    )}


                  {isQuotation() &&
                    workflowStage === "Quotation" &&
                    workflowStatus === "Draft" &&
                    selectedRows.size === 0 && (
                      <button
                        onClick={
                          handleSubmitToLab
                        }
                        disabled={
                          submitToLabLoading ||
                          workflowLoading ||
                          hasChanges
                        }
                        title={
                          hasChanges
                            ? "Save changes before submitting to Lab"
                            : "Submit this Quotation batch to Lab"
                        }
                        className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
                      >
                        {submitToLabLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Submit to Lab
                          </>
                        )}
                      </button>
                    )}


                  {isLab() &&
                    workflowStage === "Lab" &&
                    workflowStatus === "Pending" &&
                    selectedRows.size === 0 && (
                      <button
                        onClick={
                          handleSubmitToReviewer
                        }
                        disabled={
                          submitToReviewerLoading ||
                          workflowLoading ||
                          hasChanges
                        }
                        title={
                          hasChanges
                            ? "Save changes before submitting to Reviewer"
                            : "Submit this Lab batch to Reviewer"
                        }
                        className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
                      >
                        {submitToReviewerLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Submit to Reviewer
                          </>
                        )}
                      </button>
                    )}


                  {isReviewer() &&
                    workflowStage === "Reviewer" &&
                    workflowStatus === "Pending" &&
                    selectedRows.size === 0 && (
                      <button
                        onClick={handleSubmitToAdmin}
                        disabled={
                          submitToAdminLoading ||
                          workflowLoading ||
                          hasChanges ||
                          isEditMode ||
                          editedData.length === 0 ||
                          editedData.some(
                            (param) =>
                              getParameterStatus(param) !== "Approved"
                          )
                        }
                        title={
                          editedData.some(
                            (param) =>
                              getParameterStatus(param) !== "Approved"
                          )
                            ? "Approve all parameters before submitting to Admin"
                            : "Submit this reviewed batch to Admin"
                        }
                        className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
                      >
                        {submitToAdminLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Submit to Admin
                          </>
                        )}
                      </button>
                    )}


                  {isAdmin() &&
                    workflowStage === "Admin" &&
                    workflowStatus === "Pending" &&
                    selectedRows.size === 0 && (
                      <button
                        onClick={handleUploadToMaster}
                        disabled={
                          uploadToMasterLoading ||
                          workflowLoading ||
                          hasChanges ||
                          isEditMode ||
                          editedData.length === 0 ||
                          editedData.some(
                            (param) =>
                              getParameterStatus(param) !== "Approved"
                          )
                        }
                        title={
                          editedData.some(
                            (param) =>
                              getParameterStatus(param) !== "Approved"
                          )
                            ? "All parameters must be approved before final upload"
                            : "Upload this Admin-approved batch to Master"
                        }
                        className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-green-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
                      >
                        {uploadToMasterLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Upload to Master
                          </>
                        )}
                      </button>
                    )}


                  {canApprove(
                    activeTab
                  ) &&
                    selectedRows.size >
                    0 && (
                      <button
                        onClick={
                          handleApprove
                        }
                        className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold flex items-center gap-2 shadow-lg"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                    )}


                  {canReject(
                    activeTab
                  ) &&
                    selectedRows.size >
                    0 && (
                      <button
                        onClick={
                          handleReject
                        }
                        className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-red-500 to-rose-600 text-white font-semibold flex items-center gap-2 shadow-lg"
                      >
                        <Ban className="w-4 h-4" />
                        Reject
                      </button>
                    )}


                  {!isReviewer() &&
                    activeTab ===
                    "Rejected" &&
                    selectedRows.size >
                    0 && (
                      <button
                        onClick={
                          handleSubmitRevised
                        }
                        className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold flex items-center gap-2 shadow-lg"
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


      <div className="max-w-[1600px] mx-auto px-6 pt-6">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
          <div className="mb-5">
            <h2 className="text-sm font-bold tracking-wide text-slate-800">
              WORKFLOW TRACKER
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Batch #{batchId} progress and user activity
            </p>
          </div>

          <div className="overflow-x-auto">
            <div className="grid min-w-[820px] grid-cols-4">
              {workflowTracker.map(
                (item, index) => {
                  const completed =
                    item.status === "Completed";
                  const current =
                    item.status === "Current";

                  return (
                    <div
                      key={item.stage}
                      className="relative px-4 text-center"
                    >
                      {index <
                        workflowTracker.length -
                          1 && (
                        <div
                          className={`absolute left-1/2 top-4 h-0.5 w-full ${
                            completed
                              ? "bg-emerald-400"
                              : "bg-slate-200"
                          }`}
                        />
                      )}

                      <div
                        className={`relative z-10 mx-auto flex h-8 w-8 items-center justify-center rounded-full border-2 bg-white ${
                          completed
                            ? "border-emerald-500"
                            : current
                              ? "border-blue-600"
                              : "border-slate-300"
                        }`}
                      >
                        {completed ? (
                          <Check className="h-4 w-4 text-emerald-600" />
                        ) : current ? (
                          <div className="h-3 w-3 rounded-full bg-blue-600" />
                        ) : (
                          <div className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                        )}
                      </div>

                      <div className="mt-2 text-sm font-bold text-slate-800">
                        {item.stage}
                      </div>

                      <div
                        className={`mt-1 text-xs font-semibold ${
                          completed
                            ? "text-emerald-600"
                            : current
                              ? "text-blue-600"
                              : "text-slate-400"
                        }`}
                      >
                        {item.status}
                      </div>

                      <div className="mt-3 min-h-[76px] text-xs leading-5">
                        {item.status ===
                        "Waiting" ? (
                          <div className="text-slate-400">
                            Waiting
                          </div>
                        ) : (
                          <>
                            <div className="font-semibold text-slate-700">
                              {item.userId ||
                                "Pending"}
                            </div>

                            <div className="text-slate-600">
                              {item.userName ||
                                "Pending"}
                            </div>

                            <div className="font-medium text-slate-500">
                              {item.stage}
                            </div>

                            {item.actionAt && (
                              <div className="text-slate-400">
                                {formatTrackerDate(
                                  item.actionAt
                                )}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </div>
      </div>


      <div className="max-w-[1600px] mx-auto px-6 py-6">

        <div className="mb-6">

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2">

            <div className="flex gap-2">

              {getVisibleTabs().map(
                (status) => {
                  const isActive =
                    activeTab ===
                    status;

                  const count =
                    statusCounts[
                    status
                    ];


                  if (
                    count === 0
                  ) {
                    return null;
                  }


                  const config = {
                    Pending: {
                      icon:
                        Clock,
                    },

                    Approved: {
                      icon:
                        CheckCircle2,
                    },

                    Rejected: {
                      icon:
                        XOctagon,
                    },
                  };


                  const StatusIcon =
                    config[
                      status
                    ].icon;


                  return (
                    <button
                      key={
                        status
                      }
                      onClick={() => {
                        setActiveTab(
                          status
                        );

                        setSelectedRows(
                          new Set()
                        );

                        setIsEditMode(
                          false
                        );
                      }}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${isActive
                          ? status ===
                            "Pending"
                            ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md"
                            : status ===
                              "Approved"
                              ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md"
                              : "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-md"
                          : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                        }`}
                    >
                      <StatusIcon className="w-4 h-4" />

                      <span>
                        {status}
                      </span>

                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${isActive
                            ? "bg-white/25 text-white"
                            : "bg-slate-100 text-slate-700"
                          }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                }
              )}

            </div>
          </div>
        </div>


        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-16 flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-4" />

            <p className="text-slate-700 font-medium text-lg">
              Loading batch data...
            </p>

            <p className="text-slate-500 text-sm mt-2">
              Please wait
            </p>
          </div>
        ) : (
          <>
            {activeTab ===
              "Pending" &&
              renderTable(
                pendingParams,
                "Pending"
              )}


            {activeTab ===
              "Approved" &&
              renderTable(
                approvedParams,
                "Approved"
              )}


            {activeTab ===
              "Rejected" &&
              renderTable(
                rejectedParams,
                "Rejected"
              )}
          </>
        )}
      </div>


      {confirmDialog.isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]"
          onClick={(e) => {
            if (
              e.target ===
              e.currentTarget
            ) {
              closeConfirmDialog();
            }
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">

            <div
              className={`px-6 py-5 ${confirmDialog.type ===
                  "approve"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600"
                  : confirmDialog.type ===
                    "reject"
                    ? "bg-gradient-to-r from-red-500 to-rose-600"
                    : confirmDialog.type ===
                      "save" ||
                      confirmDialog.type ===
                      "resubmit"
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600"
                      : confirmDialog.type ===
                        "submitLab"
                        ? "bg-gradient-to-r from-emerald-500 to-teal-600"
                        : confirmDialog.type ===
                          "submitReviewer"
                          ? "bg-gradient-to-r from-blue-500 to-indigo-600"
                        : "bg-gradient-to-r from-slate-600 to-slate-700"
                }`}
            >

              <div className="flex items-center gap-4">

                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  {confirmDialog.type ===
                    "approve" && (
                      <CheckCircle className="w-6 h-6 text-white" />
                    )}

                  {confirmDialog.type ===
                    "reject" && (
                      <Ban className="w-6 h-6 text-white" />
                    )}

                  {(confirmDialog.type ===
                    "save" ||
                    confirmDialog.type ===
                    "resubmit") && (
                      <Save className="w-6 h-6 text-white" />
                    )}

                  {(confirmDialog.type ===
                    "submitLab" ||
                    confirmDialog.type ===
                    "submitReviewer") && (
                      <Send className="w-6 h-6 text-white" />
                    )}

                  {confirmDialog.type ===
                    "cancel" && (
                      <AlertTriangle className="w-6 h-6 text-white" />
                    )}
                </div>


                <div>
                  <h3 className="text-xl font-bold text-white">
                    {
                      confirmDialog.title
                    }
                  </h3>

                  <p className="text-sm text-white/90 mt-0.5">
                    Please confirm your action
                  </p>
                </div>
              </div>
            </div>


            <div className="px-6 py-6">

              <p className="text-slate-700 text-sm leading-relaxed mb-4">
                {
                  confirmDialog.message
                }
              </p>


              {confirmDialog.type ===
                "reject" && (
                  <div className="mt-4">

                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">
                      Rejection Reason{" "}
                      <span className="text-red-500">
                        *
                      </span>
                    </label>


                    <textarea
                      value={
                        rejectReason
                      }
                      onChange={(e) =>
                        setRejectReason(
                          e.target.value
                        )
                      }
                      placeholder="Provide a detailed reason for rejection..."
                      rows={4}
                      className="w-full px-4 py-3 outline-none border-2 border-slate-300 rounded-lg focus:ring-1 focus:ring-red-500 focus:border-red-500 text-sm resize-none"
                      autoFocus
                    />


                    {!rejectReason.trim() && (
                      <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Please provide a reason to proceed
                      </p>
                    )}
                  </div>
                )}


              {(confirmDialog.type ===
                "approve" ||
                confirmDialog.type ===
                "save" ||
                confirmDialog.type ===
                "resubmit" ||
                confirmDialog.type ===
                "submitLab" ||
                confirmDialog.type ===
                "submitReviewer") && (
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 mt-4">

                    <div className="flex items-start gap-3">

                      <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                        <FileText className="w-5 h-5 text-slate-600" />
                      </div>


                      <div>
                        <p className="text-xs text-slate-500 font-medium mb-1">
                          {confirmDialog.type ===
                            "approve"
                            ? "Parameters Selected"
                            : confirmDialog.type ===
                              "resubmit"
                              ? "Action"
                              : confirmDialog.type ===
                                "submitLab" ||
                                confirmDialog.type ===
                                "submitReviewer"
                                ? "Workflow Action"
                                : "Changes Made"}
                        </p>


                        <p className="text-sm font-semibold text-slate-900">
                          {confirmDialog.type ===
                            "approve"
                            ? `${selectedRows.size} parameter(s)`
                            : confirmDialog.type ===
                              "resubmit"
                              ? "Status will change to Pending"
                              : confirmDialog.type ===
                                "submitLab"
                                ? "Quotation → Lab"
                                : confirmDialog.type ===
                                  "submitReviewer"
                                  ? "Lab → Reviewer"
                                  : "Multiple fields updated"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}


              <div className="flex gap-3 mt-6">

                <button
                  onClick={
                    closeConfirmDialog
                  }
                  disabled={
                    actionLoading
                  }
                  className="flex-1 px-5 py-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold disabled:opacity-50"
                >
                  Cancel
                </button>


                <button
                  onClick={() => {
                    if (
                      confirmDialog.type ===
                      "reject"
                    ) {
                      handleConfirmReject();
                    } else {
                      confirmDialog.onConfirm();
                    }
                  }}
                  disabled={
                    actionLoading ||
                    (confirmDialog.type ===
                      "reject" &&
                      !rejectReason.trim())
                  }
                  className={`flex-1 px-5 py-3 rounded-lg font-semibold disabled:opacity-50 flex items-center justify-center gap-2 shadow-md ${confirmDialog.type ===
                      "approve"
                      ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                      : confirmDialog.type ===
                        "reject"
                        ? "bg-gradient-to-r from-red-500 to-rose-600 text-white"
                        : confirmDialog.type ===
                          "save" ||
                          confirmDialog.type ===
                          "resubmit"
                          ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                          : confirmDialog.type ===
                            "submitLab"
                            ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                            : confirmDialog.type ===
                              "submitReviewer"
                              ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                            : "bg-gradient-to-r from-slate-600 to-slate-700 text-white"
                    }`}
                >

                  {actionLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {confirmDialog.type ===
                        "approve" && (
                          <CheckCircle className="w-5 h-5" />
                        )}

                      {confirmDialog.type ===
                        "reject" && (
                          <Ban className="w-5 h-5" />
                        )}

                      {confirmDialog.type ===
                        "save" && (
                          <Save className="w-5 h-5" />
                        )}

                      {confirmDialog.type ===
                        "resubmit" && (
                          <RefreshCw className="w-5 h-5" />
                        )}

                      {(confirmDialog.type ===
                        "submitLab" ||
                        confirmDialog.type ===
                        "submitReviewer") && (
                          <Send className="w-5 h-5" />
                        )}

                      {confirmDialog.type ===
                        "cancel" && (
                          <X className="w-5 h-5" />
                        )}

                      {
                        confirmDialog.confirmText
                      }
                    </>
                  )}

                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      <style>{`
        input[type="checkbox"] {
          accent-color: #10b981;
        }
      `}</style>

    </div>
  );
}