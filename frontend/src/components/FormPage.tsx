import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Plus,
  Trash2,
  Save,
  Send,
  CheckCircle,
  Building2,
  FileText,
  FlaskConical,
  Settings,
  Search,
  ChevronDown,
  Loader2,
  Sparkles,
  Shield,
  Lock,
  Check,
  ArrowLeft,
} from "lucide-react";

interface FormPageProps {
  onBack: () => void;
  _formId?: string;
}

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

interface FormData {
  clientDetails: ClientDetails;
  sampleData: SampleData;
}

// --- NEW/UPDATED: Shared Static List Management ---
const MASTER_LIST_KEY = "allFormsMasterList";

interface FormDetails extends FormData {
  id: string;
  ref_no: string;
  client_name: string; // Added for easier dashboard listing
  sample_name: string; // Added for easier dashboard listing
  sample_type: string; // Added for easier dashboard listing
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
}

const initialFormData: FormData = {
  clientDetails: {
    clientName: "",
    address: "",
    pinCode: "",
    gstNo: "",
    contactPersonName: "",
    contactPersonPhone: "",
  },
  sampleData: {
    sampleName: "",
    sampleType: "",
    parameters: [],
  },
};

function getAllForms(): FormDetails[] {
    const listString = localStorage.getItem(MASTER_LIST_KEY);
    return listString ? JSON.parse(listString) : [];
}

function getFormById(id: string): FormDetails | undefined {
    const allForms = getAllForms();
    return allForms.find(f => f.id === id);
}

function saveForm(newForm: FormDetails): void {
    const allForms = getAllForms();
    const existingIndex = allForms.findIndex(f => f.id === newForm.id);

    if (existingIndex > -1) {
        // Update existing form
        allForms[existingIndex] = newForm;
    } else {
        // Add new form
        allForms.push(newForm);
    }

    localStorage.setItem(MASTER_LIST_KEY, JSON.stringify(allForms));
}
// --- END Shared Static List Management ---


const mockClients = [
  {
    name: "Acme Pharmaceuticals Ltd.",
    address: "123 Industrial Area, Sector 5",
    pinCode: "110001",
    gstNo: "07AAAAA0000A1Z5",
  },
  {
    name: "BioTech Solutions Pvt Ltd",
    address: "456 Tech Park, Phase 2",
    pinCode: "560037",
    gstNo: "29BBBBB1111B2Z6",
  },
  {
    name: "Global Manufacturing Corp",
    address: "789 Export Zone, Block A",
    pinCode: "400001",
    gstNo: "27CCCCC2222C3Z7",
  },
  {
    name: "Zenith Chemicals Inc.",
    address: "321 Science City, Tower B",
    pinCode: "500032",
    gstNo: "36DDDDD3333D4Z8",
  },
];

const mockContacts = [
  {
    clientName: "Acme Pharmaceuticals Ltd.",
    name: "Dr. Rajesh Kumar",
    phone: "+91 98765 43210",
  },
  {
    clientName: "Acme Pharmaceuticals Ltd.",
    name: "Ms. Priya Sharma",
    phone: "+91 98765 43211",
  },
  {
    clientName: "BioTech Solutions Pvt Ltd",
    name: "Mr. Amit Patel",
    phone: "+91 98765 43212",
  },
  {
    clientName: "Global Manufacturing Corp",
    name: "Dr. Sarah Johnson",
    phone: "+91 98765 43213",
  },
  {
    clientName: "Zenith Chemicals Inc.",
    name: "Mr. Vikram Singh",
    phone: "+91 98765 43214",
  },
];

const mockRegulations = [
  "ISO 17025",
  "FDA 21 CFR",
  "ICH Q7",
  "USP",
  "EP",
  "BP",
  "ASTM",
  "AOAC",
];
const mockMethods = [
  "HPLC",
  "GC-MS",
  "UV-Vis",
  "FTIR",
  "Karl Fischer",
  "Dissolution",
  "ICP-MS",
  "LC-MS/MS",
];
const mockInstruments = [
  "Agilent 1260",
  "Shimadzu GCMS-QP2020",
  "Waters Alliance",
  "Perkin Elmer FTIR",
  "Thermo Fisher ICP-MS",
];
const mockLabs = [
  "Analytical Lab 1",
  "Analytical Lab 2",
  "Microbiology Lab",
  "Physical Testing Lab",
  "Chromatography Lab",
];
const mockSampleTypes = [
  "Raw Material",
  "Finished Product",
  "Intermediate",
  "Stability Sample",
  "R&D Sample",
];

// UPDATED: Added disabled prop to CustomDropdown
const CustomDropdown: React.FC<{
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  allowCustom?: boolean;
  disabled?: boolean;
}> = ({
  options,
  value,
  onChange,
  placeholder,
  allowCustom = true,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [inputValue, setInputValue] = useState(value);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

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

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(search.toLowerCase())
  );

  const handleInputChange = (val: string) => {
    setInputValue(val);
    onChange(val);
    if (allowCustom) {
      setSearch(val);
    }
  };

  return (
    <div
      ref={dropdownRef}
      className={`relative group ${
        disabled ? "opacity-60 pointer-events-none" : ""
      }`}
    >
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => !disabled && setIsOpen(true)}
          disabled={disabled}
          className={`w-full px-4 py-2.5 text-sm border rounded-lg transition-all duration-300 placeholder-gray-400 
            ${
              disabled
                ? "bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-white border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:border-emerald-400 hover:shadow-sm"
            }`}
          placeholder={placeholder}
        />
        <ChevronDown
          className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-all duration-300 pointer-events-none ${
            isOpen ? "rotate-180 text-emerald-500" : ""
          }`}
        />
      </div>

      {isOpen && filteredOptions.length > 0 && !disabled && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-emerald-200 rounded-lg shadow-xl overflow-hidden animate-slideDown">
          <div className="p-2.5 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-emerald-200 rounded-md focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all duration-200"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto custom-scrollbar">
            {filteredOptions.map((option, idx) => (
              <div
                key={idx}
                onClick={() => {
                  onChange(option);
                  setInputValue(option);
                  setIsOpen(false);
                  setSearch("");
                }}
                className="px-4 py-2.5 text-sm hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 cursor-pointer transition-all duration-200 text-gray-700 hover:text-emerald-700 border-b border-gray-50 last:border-0"
              >
                {option}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const ParameterDetail: React.FC<{
  parameter: Parameter;
  onUpdate: (param: Parameter) => void;
  onDelete: () => void;
  index: number;
  showFeasibilityCheck: boolean;
  isFormPublished: boolean; // NEW PROP
}> = ({
  parameter,
  onUpdate,
  onDelete,
  index,
  showFeasibilityCheck,
  isFormPublished,
}) => {
  // Fully locked if verified by the final check
  const isFinalLocked = parameter.isFeasible && parameter.verifiedAt;

  // Row disabled if it is marked feasible OR fully locked
  const isRowDisabled = parameter.isFeasible || !!isFinalLocked;

  // Parameter Name is disabled if form is published OR row is disabled
  const isNameDisabled = isFormPublished || isRowDisabled;

  const handleFeasibilityToggle = async () => {
    if (!isFinalLocked) {
      onUpdate({ ...parameter, isFeasible: !parameter.isFeasible });
    }
  };

  return (
    <div
      className={`group p-6 rounded-xl border transition-all duration-300 animate-fadeIn relative
      ${
        parameter.isFeasible
          ? "bg-emerald-50/40 border-emerald-200"
          : "bg-gradient-to-br from-white to-emerald-50/30 border-gray-200 hover:border-emerald-300 hover:shadow-lg"
      }`}
    >
      <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
        <div
          className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br rounded-full -mr-16 -mt-16 transition-transform duration-500
          ${
            parameter.isFeasible
              ? "from-emerald-200/30 to-teal-200/30 scale-110"
              : "from-emerald-100/20 to-teal-100/20 group-hover:scale-150"
          }`}
        ></div>
      </div>

      <div className="flex justify-between items-center mb-5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-sm font-bold shadow-sm">
            {index + 1}
          </div>
          <h4 className="text-sm font-semibold text-gray-800">
            Test Parameter
          </h4>
          {/* Show Verified Badge only if fully locked by final submission */}
          {isFinalLocked && (
            <div className="flex items-center gap-1.5 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold">
              <Lock className="w-3 h-3" />
              Verified
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {showFeasibilityCheck && (
            <button
              onClick={handleFeasibilityToggle}
              disabled={!!isFinalLocked}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 shadow-sm hover:shadow-md
                ${
                  parameter.isFeasible
                    ? "bg-emerald-100 text-emerald-700 border border-emerald-200 hover:bg-emerald-200"
                    : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 transform hover:scale-102"
                } ${!!isFinalLocked ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {parameter.isFeasible ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Feasible
                </>
              ) : (
                <>
                  <Shield className="w-3.5 h-3.5" />
                  Make Feasible
                </>
              )}
            </button>
          )}
          {!isFormPublished && (
            <button
              onClick={onDelete}
              disabled={isRowDisabled} // Disable delete if marked feasible
              className={`text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all duration-200 ${
                isRowDisabled
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:scale-110"
              }`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div
        className={`grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10 ${
          isRowDisabled ? "opacity-75" : ""
        }`}
      >
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Parameter Name
          </label>
          <input
            value={parameter.parameterName}
            disabled={isNameDisabled} // Disabled if published OR row locked
            onChange={(e) =>
              onUpdate({ ...parameter, parameterName: e.target.value })
            }
            className={`w-full px-4 py-2.5 text-sm border rounded-lg transition-all duration-300 placeholder-gray-400
              ${
                isNameDisabled
                  ? "bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-white border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:border-emerald-400"
              }`}
            placeholder="Enter parameter name..."
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Regulation
          </label>
          <CustomDropdown
            options={mockRegulations}
            value={parameter.regulation}
            onChange={(val) => onUpdate({ ...parameter, regulation: val })}
            placeholder="Select or type..."
            disabled={isRowDisabled} // Disabled if row locked
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Method
          </label>
          <CustomDropdown
            options={mockMethods}
            value={parameter.method}
            onChange={(val) => onUpdate({ ...parameter, method: val })}
            placeholder="Select or type..."
            disabled={isRowDisabled}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Specification
          </label>
          <input
            value={parameter.specification}
            disabled={isRowDisabled}
            onChange={(e) =>
              onUpdate({ ...parameter, specification: e.target.value })
            }
            className={`w-full px-4 py-2.5 text-sm border rounded-lg transition-all duration-300 placeholder-gray-400
              ${
                isRowDisabled
                  ? "bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-white border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:border-emerald-400"
              }`}
            placeholder="Enter specification..."
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Instrument
          </label>
          <CustomDropdown
            options={mockInstruments}
            value={parameter.instrument}
            onChange={(val) => onUpdate({ ...parameter, instrument: val })}
            placeholder="Select or type..."
            disabled={isRowDisabled}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Lab
          </label>
          <CustomDropdown
            options={mockLabs}
            value={parameter.lab}
            onChange={(val) => onUpdate({ ...parameter, lab: val })}
            placeholder="Select or type..."
            disabled={isRowDisabled}
          />
        </div>

        <div className="flex items-end">
          <label
            className={`flex items-center gap-2.5 group/checkbox ${
              isRowDisabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
            }`}
          >
            <div className="relative">
              <input
                type="checkbox"
                checked={parameter.isNABL}
                disabled={isRowDisabled}
                onChange={(e) =>
                  onUpdate({ ...parameter, isNABL: e.target.checked })
                }
                className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 cursor-pointer transition-all duration-200 disabled:cursor-not-allowed"
              />
            </div>
            <span className="text-sm font-medium text-gray-700 group-hover/checkbox:text-emerald-600 transition-colors duration-200">
              NABL Accredited
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};

const ReferenceNumberBanner: React.FC<{
  referenceNo: string;
  onClose: () => void;
}> = ({ referenceNo, onClose }) => {
  return (
    <div className="bg-yellow-200 px-6 py-4 rounded-xl shadow-lg flex items-center justify-between animate-slideUp border-2 border-yellow-400">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full backdrop-blur-sm flex items-center justify-center">
          <CheckCircle className="w-6 h-6 text-yellow-600" />
        </div>
        <div>
          <p className="font-bold text-yellow-600 text-base flex items-center gap-2">
            <Sparkles className="w-5 h-5" /> Form Published Successfully!
          </p>
          <p className="text-sm mt-0.5 text-yellow-600">
            Reference No:{" "}
            <span className="font-bold tracking-wide">{referenceNo}</span>
          </p>
        </div>
      </div>
      <button
        onClick={onClose}
        className="hover:bg-white/30 p-2 rounded-lg transition-all duration-200"
      >
        <X className="w-5 h-5 text-yellow-900" />
      </button>
    </div>
  );
};

export default function FormPage({ onBack, _formId }: FormPageProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [showToast, setShowToast] = useState(false);
  const [referenceNo, setReferenceNo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [formId, setFormId] = useState<string | undefined>(_formId);
  const [createdAt, setCreatedAt] = useState(new Date().toISOString());

  useEffect(() => {
    if (_formId) {
      const savedForm = getFormById(_formId);
      if (savedForm) {
        setFormData({
          clientDetails: savedForm.clientDetails,
          sampleData: savedForm.sampleData,
        });
        setReferenceNo(savedForm.ref_no);
        setIsPublished(savedForm.status === 'published');
        setFormId(savedForm.id);
        setCreatedAt(savedForm.created_at);
      }
    } else {
      // New form logic: keep it empty or load from a temporary key if needed, 
      // but for simplicity, starting clean on no ID
      setFormData(initialFormData);
      setReferenceNo("");
      setIsPublished(false);
      setFormId(undefined);
      setCreatedAt(new Date().toISOString());
    }
  }, [_formId]);

  const handleClientSelect = (clientName: string) => {
    const client = mockClients.find((c) => c.name === clientName);
    if (client) {
      setFormData((prev) => ({
        ...prev,
        clientDetails: {
          ...prev.clientDetails,
          clientName: client.name,
          address: client.address,
          pinCode: client.pinCode,
          gstNo: client.gstNo,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        clientDetails: {
          ...prev.clientDetails,
          clientName: clientName,
        },
      }));
    }
  };

  const handleContactSelect = (contactName: string) => {
    const contact = mockContacts.find(
      (c) =>
        c.name === contactName &&
        c.clientName === formData.clientDetails.clientName
    );
    if (contact) {
      setFormData((prev) => ({
        ...prev,
        clientDetails: {
          ...prev.clientDetails,
          contactPersonName: contact.name,
          contactPersonPhone: contact.phone,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        clientDetails: {
          ...prev.clientDetails,
          contactPersonName: contactName,
        },
      }));
    }
  };

  const addParameter = () => {
    const newParam: Parameter = {
      id: Date.now().toString(),
      parameterName: "",
      regulation: "",
      method: "",
      specification: "",
      instrument: "",
      isNABL: false,
      lab: "",
      isFeasible: false,
    };
    setFormData((prev) => ({
      ...prev,
      sampleData: {
        ...prev.sampleData,
        parameters: [...prev.sampleData.parameters, newParam],
      },
    }));
  };

  const updateParameter = (id: string, updatedParam: Parameter) => {
    setFormData((prev) => ({
      ...prev,
      sampleData: {
        ...prev.sampleData,
        parameters: prev.sampleData.parameters.map((p) =>
          p.id === id ? updatedParam : p
        ),
      },
    }));
  };

  const deleteParameter = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      sampleData: {
        ...prev.sampleData,
        parameters: prev.sampleData.parameters.filter((p) => p.id !== id),
      },
    }));
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    // Simulate API/DB saving time
    await new Promise((resolve) => setTimeout(resolve, 800));

    const currentFormId = formId || Date.now().toString();
    const currentReferenceNo = referenceNo || `DRAFT-${currentFormId.substring(4)}`;
    const now = new Date().toISOString();

    const formToSave: FormDetails = {
      ...formData,
      id: currentFormId,
      ref_no: currentReferenceNo,
      client_name: formData.clientDetails.clientName,
      sample_name: formData.sampleData.sampleName,
      sample_type: formData.sampleData.sampleType,
      status: 'draft',
      created_at: createdAt,
      updated_at: now,
    };

    saveForm(formToSave); // Save to the master list
    
    setFormId(currentFormId);
    setReferenceNo(currentReferenceNo);
    setIsSaving(false)
    setIsPublished(false);
    setIsSubmitting(false);
    
    // Minor visual feedback for save
    alert(`Draft saved successfully! Ref: ${currentReferenceNo}`);
  };

  const handlePublish = async () => {
    setIsSubmitting(true);
    // Simulate API/DB publishing time
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const currentFormId = formId || Date.now().toString();
    // Generate a proper REF_NO only on publish if it wasn't there (new form)
    const currentReferenceNo = `REF-${currentFormId.slice(-4)}-${new Date().getFullYear()}`;
    const now = new Date().toISOString();

    const formToSave: FormDetails = {
      ...formData,
      id: currentFormId,
      ref_no: currentReferenceNo,
      client_name: formData.clientDetails.clientName,
      sample_name: formData.sampleData.sampleName,
      sample_type: formData.sampleData.sampleType,
      status: 'published',
      created_at: createdAt,
      updated_at: now,
    };

    saveForm(formToSave); // Save to the master list

    setFormId(currentFormId);
    setReferenceNo(currentReferenceNo);
    setIsPublished(true);
    setIsSubmitting(false);
    setShowToast(true);
  };
  
  // NEW FUNCTION: Handle updating a published form (e.g., parameter changes)
  const handleUpdatePublished = async () => {
    setIsSubmitting(true);
    // Simulate API/DB saving time
    await new Promise((resolve) => setTimeout(resolve, 800));

    const formToSave: FormDetails = {
        ...formData,
        id: formId!, // Must exist for an update
        ref_no: referenceNo,
        client_name: formData.clientDetails.clientName,
        sample_name: formData.sampleData.sampleName,
        sample_type: formData.sampleData.sampleType,
        status: 'published', // Keep status
        created_at: createdAt,
        updated_at: new Date().toISOString(), // Update timestamp
    };

    saveForm(formToSave);
    setIsSubmitting(false);
    alert(`Published Form ${referenceNo} updated successfully!`);
  };

  const handleVerifyFeasibility = async () => {
    setIsSubmitting(true);
    // Simulate API/DB verification time
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Simulate locking/verification: mark all feasible parameters as verified
    const updatedParameters = formData.sampleData.parameters.map((p) => {
      if (p.isFeasible && !p.verifiedAt) {
        return {
          ...p,
          verifiedAt: new Date().toISOString(),
        };
      }
      return p;
    });

    const newFormData: FormData = {
      ...formData,
      sampleData: {
        ...formData.sampleData,
        parameters: updatedParameters,
      },
    };
    setFormData(newFormData);

    // Resave the updated state to the master list
    const formToSave: FormDetails = {
      ...newFormData,
      id: formId!, // Must have an ID if it's published
      ref_no: referenceNo,
      client_name: newFormData.clientDetails.clientName,
      sample_name: newFormData.sampleData.sampleName,
      sample_type: newFormData.sampleData.sampleType,
      status: 'published',
      created_at: createdAt,
      updated_at: new Date().toISOString(),
    };
    saveForm(formToSave); // Update the master list

    setIsSubmitting(false);
    alert("Verified Parameters have been locked successfully!");
  };

  const isFormValid =
    formData.clientDetails.clientName.trim() !== "" &&
    formData.sampleData.sampleName.trim() !== "" &&
    formData.sampleData.parameters.length > 0;

  // NEW DERIVED STATE: Checks if there are any feasible parameters that haven't been verified yet
  const hasUnverifiedFeasibleParameters = formData.sampleData.parameters.some(
      (p) => p.isFeasible && !p.verifiedAt
  );

  const filteredContacts = mockContacts.filter(
    (c) => c.clientName === formData.clientDetails.clientName
  );
  const contactOptions = [
    ...new Set(filteredContacts.map((c) => c.name)),
  ] as string[];


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/20 py-12 px-6">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
        .animate-slideDown { animation: slideDown 0.25s ease-out; }
        .animate-slideUp { animation: slideUp 0.35s ease-out; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: linear-gradient(to bottom, #10b981, #14b8a6); border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: linear-gradient(to bottom, #059669, #0d9488); }
      `}</style>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
          <div className="relative bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 px-8 py-6 rounded-t-2xl">
            <div className="absolute inset-0 bg-grid-white/10"></div>
            <div className="relative z-10">
              {/* Back Button Row */}
              <div className="mb-4">
                <button
                  onClick={onBack}
                  className="flex items-center gap-2 text-white hover:text-white hover:bg-white/10 px-3 py-1.5 rounded-lg transition-all duration-200 text-sm font-medium w-fit"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Dashboard
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                    <FlaskConical className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                      {/* Dynamic Title based on _formId prop */}
                      {_formId ? "Edit Sample Form" : "New Sample Registration"}
                    </h1>
                    <p className="text-emerald-100 text-sm mt-0.5">
                      {_formId
                        ? "View and manage sample details"
                        : "Complete the form below to register a new sample"}
                    </p>
                  </div>
                </div>
                {isPublished && referenceNo && (
                  <div className="flex-row item-center justify-center bg-white/20 backdrop-blur-sm px-5 py-3 rounded-xl border border-white/30 animate-fadeIn">
                    <p className="text-emerald-100 text-xs font-medium">
                      Reference Number
                    </p>
                    <p className="text-white font-bold text-lg tracking-wider">
                      {referenceNo}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 p-8 space-y-10 animate-fadeIn">
            {/* Client Details Section */}
            <div>
              <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-3">
                <Building2 className="w-5 h-5 text-emerald-600" />
                <h2 className="text-xl font-bold text-gray-800">
                  Client Details
                </h2>
                {isPublished && (
                  <div className="flex items-center gap-1.5 bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-semibold">
                    <Lock className="w-3 h-3" />
                    Locked
                  </div>
                )}
              </div>
              <div
                className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${
                  isPublished ? "opacity-70 pointer-events-none" : ""
                }`}
              >
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Client Name
                  </label>
                  <CustomDropdown
                    options={mockClients.map((c) => c.name)}
                    value={formData.clientDetails.clientName}
                    onChange={handleClientSelect}
                    placeholder="Select or type client name..."
                    allowCustom={true}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Contact Person
                  </label>
                  <CustomDropdown
                    options={contactOptions}
                    value={formData.clientDetails.contactPersonName}
                    onChange={handleContactSelect}
                    placeholder="Select or type contact person..."
                    allowCustom={true}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Address
                  </label>
                  <input
                    type="text"
                    value={formData.clientDetails.address}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        clientDetails: {
                          ...prev.clientDetails,
                          address: e.target.value,
                        },
                      }))
                    }
                    className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all duration-300 placeholder-gray-400"
                    placeholder="Enter address..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={formData.clientDetails.contactPersonPhone}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        clientDetails: {
                          ...prev.clientDetails,
                          contactPersonPhone: e.target.value,
                        },
                      }))
                    }
                    className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all duration-300 placeholder-gray-400"
                    placeholder="Enter phone number..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Pin Code
                  </label>
                  <input
                    type="text"
                    value={formData.clientDetails.pinCode}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        clientDetails: {
                          ...prev.clientDetails,
                          pinCode: e.target.value,
                        },
                      }))
                    }
                    className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all duration-300 placeholder-gray-400"
                    placeholder="Enter pin code..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    GST No.
                  </label>
                  <input
                    type="text"
                    value={formData.clientDetails.gstNo}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        clientDetails: {
                          ...prev.clientDetails,
                          gstNo: e.target.value,
                        },
                      }))
                    }
                    className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all duration-300 placeholder-gray-400"
                    placeholder="Enter GST number..."
                  />
                </div>
              </div>
            </div>

            {/* Sample Details Section */}
            <div>
              <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-3">
                <FileText className="w-5 h-5 text-emerald-600" />
                <h2 className="text-xl font-bold text-gray-800">
                  Sample Details
                </h2>
              </div>
              <div
                className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${
                  isPublished ? "opacity-70 pointer-events-none" : ""
                }`}
              >
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Sample Name
                  </label>
                  <input
                    type="text"
                    value={formData.sampleData.sampleName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        sampleData: {
                          ...prev.sampleData,
                          sampleName: e.target.value,
                        },
                      }))
                    }
                    className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all duration-300 placeholder-gray-400"
                    placeholder="e.g., Aspirin Tablet Batch 101"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Sample Type
                  </label>
                  <CustomDropdown
                    options={mockSampleTypes}
                    value={formData.sampleData.sampleType}
                    onChange={(val) =>
                      setFormData((prev) => ({
                        ...prev,
                        sampleData: { ...prev.sampleData, sampleType: val },
                      }))
                    }
                    placeholder="Select sample type..."
                  />
                </div>
              </div>
            </div>

            {/* Parameter Details Section */}
            <div>
              <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-3">
                <div className="flex items-center gap-3">
                  <FlaskConical className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-xl font-bold text-gray-800">
                    Test Parameters ({formData.sampleData.parameters.length})
                  </h2>
                </div>
                {!isPublished && (
                  <button
                    onClick={addParameter}
                    className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500 text-white text-sm rounded-lg hover:bg-emerald-600 transition-all duration-300 shadow-md hover:shadow-lg font-semibold"
                  >
                    <Plus className="w-4 h-4" />
                    Add Parameter
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {formData.sampleData.parameters.map((param, index) => (
                  <ParameterDetail
                    key={param.id}
                    parameter={param}
                    onUpdate={(updatedParam) =>
                      updateParameter(param.id, updatedParam)
                    }
                    onDelete={() => deleteParameter(param.id)}
                    index={index}
                    showFeasibilityCheck={isPublished && !param.verifiedAt} // Show feasibility check only if published and not yet verified
                    isFormPublished={isPublished}
                  />
                ))}

                {formData.sampleData.parameters.length === 0 && (
                  <div className="text-center p-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <Settings className="w-6 h-6 mx-auto" />
                    <p className="mt-2 text-sm font-medium">
                      Add a new parameter to start defining the required tests.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions Footer - REFACTORED AND UNIFIED BLOCK */}
            <div className="flex gap-4 pt-8 border-t border-gray-200">
              
              {/* 1. Save Draft (Always available unless published) */}
              {!isPublished && (
                <button
                  onClick={handleSaveDraft}
                  disabled={isSaving}
                  className="flex-1 flex items-center justify-center gap-2.5 px-6 py-3 bg-white border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-all duration-300 shadow-md hover:shadow-lg font-semibold disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? "Saving Draft..." : "Save Draft"}
                </button>
              )}

              {/* 2. Primary Action Button (Publish, Lock, or Update) */}
              {!isPublished ? (
                // A. Draft state: Publish button
                <button
                  onClick={handlePublish}
                  disabled={isSubmitting || !isFormValid}
                  className="flex-1 relative flex items-center justify-center gap-2.5 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 shadow-md hover:shadow-lg font-semibold disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Publish
                    </>
                  )}
                </button>
              ) : hasUnverifiedFeasibleParameters ? (
                // B. Published state with UNVERIFIED feasible items: Lock button
                <button
                  onClick={handleVerifyFeasibility}
                  disabled={isSubmitting}
                  className="flex-1 relative flex items-center justify-center gap-2.5 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg font-semibold overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Lock Verified Parameters
                    </>
                  )}
                </button>
              ) : (
                // C. Published state with NO unverified feasible items: Update button
                <button
                    onClick={handleUpdatePublished}
                    disabled={isSubmitting}
                    className="flex-1 relative flex items-center justify-center gap-2.5 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 shadow-md hover:shadow-lg font-semibold disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    {isSubmitting ? (
                        <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Updating...
                        </>
                    ) : (
                        <>
                        <Send className="w-4 h-4" />
                        Update Changes
                        </>
                    )}
                </button>
              )}
            </div>
            {/* END Actions Footer */}

            {showToast && (
              <div className="pt-8 border-t border-gray-200">
                <ReferenceNumberBanner
                  referenceNo={referenceNo}
                  onClose={() => setShowToast(false)}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}