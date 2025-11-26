import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
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
  XCircle,
  Beaker,
  TestTube,
  Package,
} from "lucide-react";

import {
  fetchClients,
  fetchSampleTypes,
  fetchRegulations,
  fetchInstruments,
  fetchLabs,
  fetchMethods,
  fetchSpecifications,
  fetchChemicals,
  fetchColumns,
  fetchStandards,
} from "../services/api";
import { type ClientDetail } from "../models/ClientDetail";
import { BiLock } from "react-icons/bi";

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

interface Requirements {
  instruments: string[];
  chemicals: string[];
  standards: string[];
  columns: string[];
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
  remarks: string;
  requirements?: Requirements;
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

// --- Shared Static List Management ---
const MASTER_LIST_KEY = "allFormsMasterList";

interface FormDetails extends FormData {
  id: string;
  ref_no: string;
  client_name: string;
  sample_name: string;
  sample_type: string;
  status: "Draft" | "Published";
  created_at: string;
  updated_at: string;
}

interface ClientUnitDetail {
  address: string;
  city: string;
  pin: string;
  gstNo: string;
  contactPersonName: string;
  contactPersonPhone: string;
}

type AggregatedClientData = {
  [clientName: string]: ClientUnitDetail[];
};

interface UniqueContact {
  name: string;
  phone: string;
}

const initialClientDetails: ClientDetails = {
  clientName: "",
  address: "",
  pinCode: "",
  gstNo: "",
  contactPersonName: "",
  contactPersonPhone: "",
};

const initialFormData: FormData = {
  clientDetails: initialClientDetails,
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
  return allForms.find((f) => f.id === id);
}

function saveForm(newForm: FormDetails): void {
  const allForms = getAllForms();
  const existingIndex = allForms.findIndex((f) => f.id === newForm.id);

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

// --- Client Data Aggregation Function ---
function aggregateClientData(rawClients: ClientDetail[]): AggregatedClientData {
  const aggregated: AggregatedClientData = {};

  rawClients.forEach((client) => {
    const name = client.clientName.trim();
    if (!name) return;

    const unitDetail: ClientUnitDetail = {
      address: client.address || "",
      city: client.city || "",
      pin: client.pin || "",
      gstNo: client.gstNo || "",
      contactPersonName: client.contactPersonName || "",
      contactPersonPhone: client.contactPersonPhone || "",
    };

    if (aggregated[name]) {
      aggregated[name].push(unitDetail);
    } else {
      aggregated[name] = [unitDetail];
    }
  });

  return aggregated;
}

function extractUniqueContacts(
  aggregatedClients: AggregatedClientData
): UniqueContact[] {
  const contactsMap = new Map<string, UniqueContact>();

  Object.values(aggregatedClients)
    .flat()
    .forEach((unit) => {
      const { contactPersonName: name, contactPersonPhone: phone } = unit;

      const trimmedName = name.trim();
      const trimmedPhone = phone.trim();

      if (!trimmedName || trimmedName === "-") {
        return;
      }

      if (!contactsMap.has(trimmedName)) {
        contactsMap.set(trimmedName, {
          name: trimmedName,
          phone: trimmedPhone,
        });
      } else {
        const existingContact = contactsMap.get(trimmedName)!;
        if (!existingContact.phone && trimmedPhone) {
          contactsMap.set(trimmedName, {
            name: trimmedName,
            phone: trimmedPhone,
          });
        }
      }
    });

  return Array.from(contactsMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
}

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
                : "bg-white border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all"
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
                className="w-full pl-9 pr-3 py-2 rounded-md text-sm bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all duration-200"
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

// --- TOAST COMPONENT ---
interface ToastProps {
  message: string;
  type: "success" | "error" | "info";
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  const icon = {
    success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    info: <Sparkles className="w-5 h-5 text-indigo-500" />,
  }[type];

  const colorClasses = {
    success: "border-emerald-500",
    error: "border-red-500",
    info: "border-indigo-500",
  }[type];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-6 right-6 z-[100] transition-transform duration-300 ease-out ${
        isVisible ? "animate-toastIn" : "animate-toastOut"
      }`}
      onAnimationEnd={(e) => {
        if (
          e.animationName === "toastOut" ||
          e.animationName === "animate-toastOut"
        ) {
          onClose();
        }
      }}
    >
      <div
        className={`flex items-center w-full max-w-xs p-4 rounded-xl bg-white border-l-4 shadow-xl ${colorClasses}`}
        role="alert"
      >
        {icon}
        <div className="ml-3 text-sm font-medium text-gray-700">{message}</div>
        <button
          type="button"
          className="ml-auto -mx-1.5 -my-1.5 text-gray-400 hover:text-gray-900 rounded-lg p-1.5 hover:bg-gray-100 inline-flex h-8 w-8 transition-colors"
          onClick={() => setIsVisible(false)}
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// =============================================================================
// REQUIREMENT SELECTOR COMPONENT (Using Existing Dropdown Style)
// =============================================================================
interface RequirementSelectorProps {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  options: string[];
  selectedItems: string[];
  onAdd: (item: string) => void;
  onRemove: (item: string) => void;
  placeholder: string;
  isLoading: boolean;
  disabled: boolean;
  accentColor: string;
}

const RequirementSelector: React.FC<RequirementSelectorProps> = ({
  label,
  icon: Icon,
  options,
  selectedItems,
  onAdd,
  onRemove,
  placeholder,
  isLoading,
  disabled,
  accentColor,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const filteredOptions = options
    .filter((opt) => opt.toLowerCase().includes(search.toLowerCase()))
    .filter((opt) => !selectedItems.includes(opt));

  const handleAdd = (item: string) => {
    if (item.trim() && !selectedItems.includes(item.trim())) {
      onAdd(item.trim());
      setSearch("");
      setIsOpen(false);
    }
  };

  const showAddCustomOption =
    search.trim() &&
    !filteredOptions.some(
      (opt) => opt.toLowerCase() === search.toLowerCase()
    ) &&
    !selectedItems.includes(search.trim());

  return (
    <div
      ref={dropdownRef}
      className={`bg-white rounded-xl border border-emerald-100 shadow-sm hover:shadow-md transition-shadow duration-300 ${
        disabled ? "opacity-60 pointer-events-none" : ""
      }`}
    >
      {/* Card Header */}
      <div
        className={`flex items-center gap-3 px-4 py-3 bg-gradient-to-r ${accentColor} border-b border-emerald-100 rounded-t-xl`}
      >
        <div className="p-1.5 bg-white/80 rounded-lg">
          <Icon className="w-4 h-4 text-emerald-700" />
        </div>
        <span className="text-sm font-semibold text-emerald-900">{label}</span>
        <span className="ml-auto text-xs font-medium text-emerald-700 bg-white/60 px-2 py-0.5 rounded-full">
          {selectedItems.length} selected
        </span>
      </div>

      {/* Card Body */}
      <div className="p-4">
        {/* Selected Items */}
        <div className="flex flex-wrap gap-2 min-h-[32px] mb-3">
          {selectedItems.length === 0 ? (
            <span className="text-xs text-gray-400 italic">
              No items selected
            </span>
          ) : (
            selectedItems.map((item, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-800 text-[11px] font-medium rounded-md border border-emerald-200 group hover:bg-emerald-100 transition-colors"
              >
                <span className="truncate max-w-[120px]">{item}</span>
                {!disabled && (
                  <button
                    onClick={() => onRemove(item)}
                    className="p-0.5 hover:bg-emerald-200 rounded-full transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </span>
            ))
          )}
        </div>

        {/* Dropdown Input (Same style as CustomDropdown) */}
        {!disabled && (
          <div className="relative group">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => !isLoading && setIsOpen(true)}
                disabled={isLoading}
                className={`w-full px-4 py-2.5 text-sm border rounded-lg transition-all duration-300 placeholder-gray-400 
                  ${
                    isLoading
                      ? "bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all"
                  }`}
                placeholder={isLoading ? "Loading..." : placeholder}
              />
              <ChevronDown
                className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-all duration-300 pointer-events-none ${
                  isOpen ? "rotate-180 text-emerald-500" : ""
                }`}
              />
            </div>

            {/* Dropdown Options */}
            {isOpen &&
              !isLoading &&
              (filteredOptions.length > 0 || showAddCustomOption) && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-emerald-200 rounded-lg shadow-xl overflow animate-slideDown">
                  <div className="p-2.5 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search..."
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-md bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all duration-200"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  <div className="max-h-48 overflow-y-auto custom-scrollbar">
                    {/* Add Custom Option */}
                    {showAddCustomOption && (
                      <div
                        onClick={() => handleAdd(search)}
                        className="px-4 py-2.5 text-sm cursor-pointer transition-all duration-200 text-emerald-600 font-medium hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 border-b border-gray-50 flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add "{search}"
                      </div>
                    )}

                    {/* Existing Options */}
                    {filteredOptions.map((option, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleAdd(option)}
                        className="px-4 py-2.5 text-sm hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 cursor-pointer transition-all duration-200 text-gray-700 hover:text-emerald-700 border-b border-gray-50 last:border-0"
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
};

const ParameterDetail: React.FC<{
  parameter: Parameter;
  onUpdate: (param: Parameter) => void;
  onDelete: () => void;
  index: number;
  showFeasibilityCheck: boolean;
  isFormPublished: boolean;
  onLock: (paramId: string) => void;
  regulationOptions: string[];
  isRegulationsLoading: boolean;
  methodOptions: string[];
  isMethodsLoading: boolean;
  specificationOptions: string[];
  isSpecificationsLoading: boolean;
  instrumentOptions: string[];
  isInstrumentsLoading: boolean;
  labOptions: string[];
  isLabsLoading: boolean;
  chemicalOptions: string[];
  isChemicalsLoading: boolean;
  columnOptions: string[];
  isColumnsLoading: boolean;
  standardOptions: string[];
  isStandardsLoading: boolean;
}> = ({
  parameter,
  onUpdate,
  onDelete,
  index,
  showFeasibilityCheck,
  isFormPublished,
  onLock,
  regulationOptions,
  isRegulationsLoading,
  methodOptions,
  isMethodsLoading,
  specificationOptions,
  isSpecificationsLoading,
  instrumentOptions,
  isInstrumentsLoading,
  labOptions,
  isLabsLoading,
  chemicalOptions,
  isChemicalsLoading,
  columnOptions,
  isColumnsLoading,
  standardOptions,
  isStandardsLoading,
}) => {
  const isFinalLocked = !!parameter.verifiedAt;
  const isRowDisabled = isFinalLocked;
  const isNameDisabled = isFormPublished || isRowDisabled;
  const isFeasibilitySet = typeof parameter.isFeasible === "boolean";

  const requirements: Requirements = parameter.requirements || {
    instruments: [],
    chemicals: [],
    standards: [],
    columns: [],
  };

  const handleRequirementAdd = (category: keyof Requirements, item: string) => {
    const updatedRequirements = {
      ...requirements,
      [category]: [...requirements[category], item],
    };
    onUpdate({ ...parameter, requirements: updatedRequirements });
  };

  const handleRequirementRemove = (
    category: keyof Requirements,
    item: string
  ) => {
    const updatedRequirements = {
      ...requirements,
      [category]: requirements[category].filter((i) => i !== item),
    };
    onUpdate({ ...parameter, requirements: updatedRequirements });
  };

  return (
    <div
      className={`rounded-2xl border-2 shadow-xl transition-all duration-500 ${
        isFinalLocked
          ? parameter.isFeasible
            ? "border-emerald-300 bg-white"
            : "border-red-300 bg-white"
          : "border-emerald-200 bg-white hover:border-emerald-400 hover:shadow-2xl"
      }`}
    >
      {/* Header */}
      <div
        className={`px-4 py-3 rounded-t-2xl border-b-2 ${
          isFinalLocked
            ? parameter.isFeasible
              ? "bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 border-emerald-300"
              : "bg-gradient-to-r from-red-500 to-rose-500 border-red-300"
            : "bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 border-emerald-200"
        }`}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm text-white text-lg font-bold shadow-inner">
              {index + 1}
            </div>
            <div>
              <h4 className="text-md font-bold text-white">Test Parameter</h4>
              <p className="text-emerald-100 text-xs">
                Configure test specifications
              </p>
            </div>

            {isFinalLocked && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/20 text-white">
                <Lock className="w-3 h-4" />
                {parameter.isFeasible
                  ? "Feasible (Locked)"
                  : "Not Feasible (Locked)"}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {showFeasibilityCheck && !isFinalLocked && (
              <>
                {/* Feasibility Toggle - Compact & Classic */}
                <div className="flex rounded-lg overflow-hidden border border-white/40 shadow">
                  <button
                    onClick={() => onUpdate({ ...parameter, isFeasible: true })}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
                      parameter.isFeasible === true
                        ? "bg-white text-emerald-600"
                        : "bg-white/10 text-white/90 hover:bg-white/20"
                    }`}
                  >
                    <Check className="w-3 h-3" />
                    Feasible
                  </button>
                  <button
                    onClick={() =>
                      onUpdate({ ...parameter, isFeasible: false })
                    }
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold transition-all duration-200 border-l border-white/30 ${
                      parameter.isFeasible === false
                        ? "bg-white text-red-600"
                        : "bg-white/10 text-white/90 hover:bg-white/20"
                    }`}
                  >
                    <XCircle className="w-3 h-3" />
                    Not Feasible
                  </button>
                </div>

                {/* Lock Button - Compact & Classic */}
                {isFeasibilitySet && (
                  <button
                    onClick={() => onLock(parameter.id)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/95 text-emerald-700 text-xs rounded-lg hover:bg-white transition-all duration-200 shadow font-semibold"
                  >
                    <Shield className="w-3 h-3" />
                    Lock
                  </button>
                )}
              </>
            )}

            {/* Delete Button */}
            {!isFormPublished && (
              <motion.button
                onClick={onDelete}
                whileHover={{ scale: 1.1, rotate: 6 }}
                whileTap={{ scale: 0.9 }}
                disabled={isRowDisabled}
                className={`p-2.5 bg-white/10 text-white rounded-xl transition-all duration-300 ${
                  isRowDisabled ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <Trash2 className="w-4 h-4 text-white" />
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Form Fields */}
      <div className={`p-6 ${isFinalLocked ? "opacity-80" : ""}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Parameter Name */}
          <div className="group">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Parameter Name
            </label>
            <input
              value={parameter.parameterName}
              disabled={isNameDisabled}
              onChange={(e) =>
                onUpdate({ ...parameter, parameterName: e.target.value })
              }
              className={`w-full px-4 py-2.5 text-sm border rounded-lg duration-300 placeholder-gray-400 transition-all ${
                isNameDisabled
                  ? "bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed"
                  : "border-gray-200 bg-gray-50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
              }`}
              placeholder="Enter parameter name..."
            />
          </div>

          {/* Regulation */}
          <div className="group">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Regulation
            </label>
            <CustomDropdown
              options={regulationOptions}
              value={parameter.regulation}
              onChange={(val) => onUpdate({ ...parameter, regulation: val })}
              placeholder={
                isRegulationsLoading ? "Loading..." : "Select or type..."
              }
              disabled={isRowDisabled || isRegulationsLoading}
            />
          </div>

          {/* Method */}
          <div className="group">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Method
            </label>
            <CustomDropdown
              options={methodOptions}
              value={parameter.method}
              onChange={(val) => onUpdate({ ...parameter, method: val })}
              placeholder={
                isMethodsLoading ? "Loading..." : "Select or type..."
              }
              disabled={isRowDisabled || isMethodsLoading}
            />
          </div>

          {/* Specification */}
          <div className="group">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Specification
            </label>
            <CustomDropdown
              options={specificationOptions}
              value={parameter.specification}
              onChange={(val) => onUpdate({ ...parameter, specification: val })}
              placeholder={
                isSpecificationsLoading ? "Loading..." : "Select or type..."
              }
              disabled={isRowDisabled || isSpecificationsLoading}
            />
          </div>

          {/* Instrument */}
          <div className="group">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Instrument
            </label>
            <CustomDropdown
              options={instrumentOptions}
              value={parameter.instrument}
              onChange={(val) => onUpdate({ ...parameter, instrument: val })}
              placeholder={
                isInstrumentsLoading ? "Loading..." : "Select or type..."
              }
              disabled={isRowDisabled || isInstrumentsLoading}
            />
          </div>

          {/* Lab */}
          <div className="group">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Lab
            </label>
            <CustomDropdown
              options={labOptions}
              value={parameter.lab}
              onChange={(val) => onUpdate({ ...parameter, lab: val })}
              placeholder={isLabsLoading ? "Loading..." : "Select or type..."}
              disabled={isRowDisabled || isLabsLoading}
            />
          </div>

          {/* NABL Checkbox */}
          <div className="flex items-end">
            <label
              className={`flex items-center gap-3 cursor-pointer group ${
                isRowDisabled ? "cursor-not-allowed opacity-60" : ""
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
                  className="sr-only"
                />
                <div
                  className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                    parameter.isNABL
                      ? "bg-emerald-500 border-emerald-500"
                      : "border-gray-300 group-hover:border-emerald-400"
                  }`}
                >
                  {parameter.isNABL && <Check className="w-4 h-4 text-white" />}
                </div>
              </div>
              <span className="text-sm font-semibold text-gray-700 group-hover:text-emerald-600 transition-colors">
                NABL Accredited
              </span>
            </label>
          </div>

          {isFormPublished && (
            <>
              {/* Requirements Section */}
              <div className="md:col-span-2">
                <div className={`${isFinalLocked ? "opacity-80" : ""}`}>
                  <div className="border-t-2 border-emerald-100 pt-6">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg">
                        <Package className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h5 className="block text-sm font-bold text-gray-600 uppercase tracking-wider">
                          Test Requirements
                        </h5>
                        <p className="text-[11px] text-gray-500">
                          Configure required resources for this test
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {/* Instruments */}
                      <RequirementSelector
                        label="Instruments"
                        icon={TestTube}
                        options={instrumentOptions}
                        selectedItems={requirements.instruments}
                        onAdd={(item) =>
                          handleRequirementAdd("instruments", item)
                        }
                        onRemove={(item) =>
                          handleRequirementRemove("instruments", item)
                        }
                        placeholder="Add instrument..."
                        isLoading={isInstrumentsLoading}
                        disabled={isRowDisabled}
                        accentColor="from-emerald-50 to-teal-50"
                      />

                      {/* Chemicals */}
                      <RequirementSelector
                        label="Chemicals"
                        icon={Beaker}
                        options={chemicalOptions}
                        selectedItems={requirements.chemicals}
                        onAdd={(item) =>
                          handleRequirementAdd("chemicals", item)
                        }
                        onRemove={(item) =>
                          handleRequirementRemove("chemicals", item)
                        }
                        placeholder="Add chemical..."
                        isLoading={isChemicalsLoading}
                        disabled={isRowDisabled}
                        accentColor="from-teal-50 to-cyan-50"
                      />

                      {/* Standards */}
                      <RequirementSelector
                        label="Standards"
                        icon={FlaskConical}
                        options={standardOptions}
                        selectedItems={requirements.standards}
                        onAdd={(item) =>
                          handleRequirementAdd("standards", item)
                        }
                        onRemove={(item) =>
                          handleRequirementRemove("standards", item)
                        }
                        placeholder="Add standard..."
                        isLoading={isStandardsLoading}
                        disabled={isRowDisabled}
                        accentColor="from-emerald-50 to-green-50"
                      />

                      {/* Columns */}
                      <RequirementSelector
                        label="Columns"
                        icon={Settings}
                        options={columnOptions}
                        selectedItems={requirements.columns}
                        onAdd={(item) => handleRequirementAdd("columns", item)}
                        onRemove={(item) =>
                          handleRequirementRemove("columns", item)
                        }
                        placeholder="Add column..."
                        isLoading={isColumnsLoading}
                        disabled={isRowDisabled}
                        accentColor="from-cyan-50 to-sky-50"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Remarks */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Remarks
                </label>
                <textarea
                  value={parameter.remarks}
                  disabled={isRowDisabled}
                  onChange={(e) =>
                    onUpdate({ ...parameter, remarks: e.target.value })
                  }
                  rows={3}
                  className={`w-full px-4 py-3 text-sm border-2 rounded-xl transition-all resize-none ${
                    isRowDisabled
                      ? "bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed"
                      : "border-gray-200 bg-gray-50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                  }`}
                  placeholder="Add any specific instructions or remarks..."
                />
              </div>
            </>
          )}
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
  const [showPublishBanner, setShowPublishBanner] = useState(false);
  const [referenceNo, setReferenceNo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [formId, setFormId] = useState<string | undefined>(_formId);
  const [createdAt, setCreatedAt] = useState(new Date().toISOString());

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const showNotification = (
    message: string,
    type: "success" | "error" | "info" = "success"
  ) => {
    setToast({ message, type });
  };

  const closeNotification = () => {
    setToast(null);
  };

  const [masterClientData, setMasterClientData] =
    useState<AggregatedClientData>({});
  const [isClientDataLoading, setIsClientDataLoading] = useState(true);
  const [uniqueContacts, setUniqueContacts] = useState<UniqueContact[]>([]);

  const [regulationOptions, setRegulationOptions] = useState<string[]>([]);
  const [isRegulationsLoading, setIsRegulationsLoading] = useState(true);
  const [sampleTypeOptions, setSampleTypeOptions] = useState<string[]>([]);
  const [isSampleTypesLoading, setIsSampleTypesLoading] = useState(true);
  const [methodOptions, setMethodOptions] = useState<string[]>([]);
  const [isMethodsLoading, setIsMethodsLoading] = useState(true);
  const [specificationOptions, setSpecificationOptions] = useState<string[]>(
    []
  );
  const [isSpecificationsLoading, setIsSpecificationsLoading] = useState(true);
  const [instrumentOptions, setInstrumentOptions] = useState<string[]>([]);
  const [isInstrumentsLoading, setIsInstrumentsLoading] = useState(true);
  const [labOptions, setLabOptions] = useState<string[]>([]);
  const [isLabsLoading, setIsLabsLoading] = useState(true);

  // NEW: Requirements options states
  const [chemicalOptions, setChemicalOptions] = useState<string[]>([]);
  const [isChemicalsLoading, setIsChemicalsLoading] = useState(true);
  const [columnOptions, setColumnOptions] = useState<string[]>([]);
  const [isColumnsLoading, setIsColumnsLoading] = useState(true);
  const [standardOptions, setStandardOptions] = useState<string[]>([]);
  const [isStandardsLoading, setIsStandardsLoading] = useState(true);

  useEffect(() => {
    const loadClientData = async () => {
      setIsClientDataLoading(true);
      try {
        const rawClients = await fetchClients();
        const aggregated = aggregateClientData(rawClients);
        setMasterClientData(aggregated);

        const extractedContacts = extractUniqueContacts(aggregated);
        setUniqueContacts(extractedContacts);
      } catch (error) {
        console.error("Error fetching client data:", error);
        showNotification("Failed to load client data.", "error");
      } finally {
        setIsClientDataLoading(false);
      }
    };
    loadClientData();
  }, []);

  useEffect(() => {
    const loadLookupData = async () => {
      setIsSampleTypesLoading(true);
      setIsMethodsLoading(true);
      setIsSpecificationsLoading(true);
      setIsInstrumentsLoading(true);
      setIsLabsLoading(true);
      setIsRegulationsLoading(true);
      setIsChemicalsLoading(true);
      setIsColumnsLoading(true);
      setIsStandardsLoading(true);

      try {
        const [
          types,
          methods,
          specs,
          instruments,
          labs,
          regulations,
          chemicals,
          columns,
          standards,
        ] = await Promise.all([
          fetchSampleTypes(),
          fetchMethods(),
          fetchSpecifications(),
          fetchInstruments(),
          fetchLabs(),
          fetchRegulations(),
          fetchChemicals(),
          fetchColumns(),
          fetchStandards(),
        ]);

        setSampleTypeOptions(types);
        setMethodOptions(methods);
        setSpecificationOptions(specs);
        setInstrumentOptions(instruments);
        setLabOptions(labs);
        setRegulationOptions(regulations);
        setChemicalOptions(chemicals);
        setColumnOptions(columns);
        setStandardOptions(standards);
      } catch (error) {
        console.error("Error fetching lookup data:", error);
        showNotification("Failed to load lookup data.", "error");

        setSampleTypeOptions([]);
        setMethodOptions([]);
        setSpecificationOptions([]);
        setInstrumentOptions([]);
        setLabOptions([]);
        setRegulationOptions([]);
        setChemicalOptions([]);
        setColumnOptions([]);
        setStandardOptions([]);
      } finally {
        setIsSampleTypesLoading(false);
        setIsMethodsLoading(false);
        setIsSpecificationsLoading(false);
        setIsInstrumentsLoading(false);
        setIsLabsLoading(false);
        setIsRegulationsLoading(false);
        setIsChemicalsLoading(false);
        setIsColumnsLoading(false);
        setIsStandardsLoading(false);
      }
    };
    loadLookupData();
  }, []);

  useEffect(() => {
    if (_formId) {
      const savedForm = getFormById(_formId);
      if (savedForm) {
        setFormData({
          clientDetails: savedForm.clientDetails,
          sampleData: savedForm.sampleData,
        });
        setReferenceNo(savedForm.ref_no);
        setIsPublished(savedForm.status === "Published");
        setFormId(savedForm.id);
        setCreatedAt(savedForm.created_at);
      }
    } else {
      setFormData(initialFormData);
      setReferenceNo("");
      setIsPublished(false);
      setFormId(undefined);
      setCreatedAt(new Date().toISOString());
    }
  }, [_formId]);

  const handleClientSelect = (clientName: string) => {
    const units = masterClientData[clientName] || [];
    let selectedUnit: ClientUnitDetail | undefined;

    if (units.length > 0) {
      selectedUnit = units[0];
    }

    if (selectedUnit) {
      const fullAddress = [selectedUnit.address, selectedUnit.city]
        .filter(Boolean)
        .join(", ");

      setFormData((prev) => ({
        ...prev,
        clientDetails: {
          ...prev.clientDetails,
          clientName: clientName,
          address: fullAddress,
          pinCode: selectedUnit.pin,
          gstNo: selectedUnit.gstNo,
          contactPersonName: selectedUnit.contactPersonName,
          contactPersonPhone: selectedUnit.contactPersonPhone,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        clientDetails: {
          ...initialClientDetails,
          clientName: clientName,
        },
      }));
    }
  };

  const handleContactSelect = (contactName: string) => {
    const selectedContact = uniqueContacts.find((c) => c.name === contactName);

    if (selectedContact) {
      setFormData((prev) => ({
        ...prev,
        clientDetails: {
          ...prev.clientDetails,
          contactPersonName: selectedContact.name,
          contactPersonPhone: selectedContact.phone,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        clientDetails: {
          ...prev.clientDetails,
          contactPersonName: contactName,
          contactPersonPhone: "",
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
      remarks: "",
      requirements: {
        instruments: [],
        chemicals: [],
        standards: [],
        columns: [],
      },
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

  const handleSavePublished = async () => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    const formToSave: FormDetails = {
      ...formData,
      id: formId!,
      ref_no: referenceNo,
      client_name: formData.clientDetails.clientName,
      sample_name: formData.sampleData.sampleName,
      sample_type: formData.sampleData.sampleType,
      status: "Published",
      created_at: createdAt,
      updated_at: new Date().toISOString(),
    };

    saveForm(formToSave);
    setIsSubmitting(false);

    if (!toast) {
      showNotification(`Changes for ${referenceNo} saved successfully!`);
    }
  };

  const handleLockParameter = (paramId: string) => {
    if (!isPublished) {
      showNotification(
        "Form must be published before locking parameters.",
        "info"
      );
      return;
    }

    const parameterToLock = formData.sampleData.parameters.find(
      (p) => p.id === paramId
    );
    if (!parameterToLock || typeof parameterToLock.isFeasible !== "boolean") {
      showNotification("Please set feasibility before locking.", "info");
      return;
    }

    const updatedParameters = formData.sampleData.parameters.map((p) => {
      if (p.id === paramId) {
        return {
          ...p,
          verifiedAt: new Date().toISOString(),
        };
      }
      return p;
    });

    setFormData((prev) => ({
      ...prev,
      sampleData: {
        ...prev.sampleData,
        parameters: updatedParameters,
      },
    }));

    showNotification(
      `Parameter ${parameterToLock.parameterName} is locked. Saved to locked permanently.`
    );
    handleSavePublished();
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    const currentFormId = formId || Date.now().toString();
    const currentReferenceNo =
      referenceNo || `DRAFT-${currentFormId.substring(4)}`;
    const now = new Date().toISOString();

    const formToSave: FormDetails = {
      ...formData,
      id: currentFormId,
      ref_no: currentReferenceNo,
      client_name: formData.clientDetails.clientName,
      sample_name: formData.sampleData.sampleName,
      sample_type: formData.sampleData.sampleType,
      status: "Draft",
      created_at: createdAt,
      updated_at: now,
    };

    saveForm(formToSave);

    setFormId(currentFormId);
    setReferenceNo(currentReferenceNo);
    setIsSaving(false);
    setIsPublished(false);
    setIsSubmitting(false);

    showNotification(`Draft saved successfully! Ref: ${currentReferenceNo}`);
  };

  const handlePublish = async () => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const currentFormId = formId || Date.now().toString();
    const currentReferenceNo = `REF-${currentFormId.slice(
      -4
    )}-${new Date().getFullYear()}`;
    const now = new Date().toISOString();

    const formToSave: FormDetails = {
      ...formData,
      id: currentFormId,
      ref_no: currentReferenceNo,
      client_name: formData.clientDetails.clientName,
      sample_name: formData.sampleData.sampleName,
      sample_type: formData.sampleData.sampleType,
      status: "Published",
      created_at: createdAt,
      updated_at: now,
    };

    saveForm(formToSave);

    setFormId(currentFormId);
    setReferenceNo(currentReferenceNo);
    setIsPublished(true);
    setIsSubmitting(false);
    setShowPublishBanner(true);
  };

  const isFormValid =
    formData.clientDetails.clientName.trim() !== "" &&
    formData.sampleData.sampleName.trim() !== "" &&
    formData.sampleData.parameters.length > 0;

  const clientNameOptions = Object.keys(masterClientData);

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
        @keyframes toastIn {
            from { opacity: 0; transform: translateX(100%); }
            to { opacity: 1; transform: translateX(0); }
        }
        @keyframes toastOut {
            from { opacity: 1; transform: translateX(0); }
            to { opacity: 0; transform: translateX(100%); }
        }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
        .animate-slideDown { animation: slideDown 0.25s ease-out; }
        .animate-slideUp { animation: slideUp 0.35s ease-out; }
        .animate-toastIn { animation: toastIn 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
        .animate-toastOut { animation: toastOut 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: linear-gradient(to bottom, #10b981, #14b8a6); border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: linear-gradient(to bottom, #059669, #0d9488); }
      `}</style>

      {/* RENDER THE NEW TOAST COMPONENT */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={closeNotification}
        />
      )}
      {/* END TOAST RENDER */}

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

              {isClientDataLoading && (
                <div className="flex items-center gap-2 text-sm text-emerald-600 mb-6">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading client data...
                </div>
              )}

              <div
                className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${
                  isPublished ? "opacity-70 pointer-events-none" : ""
                }`}
              >
                {/* 1. Client Name Dropdown (Column 1, Row 1) */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Client Name
                  </label>
                  <CustomDropdown
                    options={clientNameOptions}
                    value={formData.clientDetails.clientName}
                    onChange={handleClientSelect}
                    placeholder="Select or type client name..."
                    allowCustom={true}
                    disabled={isClientDataLoading}
                  />
                </div>

                {/* 2. GST No. (Column 2, Row 1) */}
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
                    className="w-full px-4 py-2.5 text-sm border rounded-lg transition-all duration-300 placeholder-gray-400 bg-white border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all"
                    placeholder="Enter GST number..."
                  />
                </div>

                {/* 3. Address and City (Column 1, Row 2) */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Address and City
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
                    className="w-full px-4 py-2.5 text-sm border rounded-lg transition-all duration-300 placeholder-gray-400 bg-white border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all"
                    placeholder="Enter address including city..."
                  />
                </div>

                {/* 4. Pin Code (Column 2, Row 2) */}
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
                    className="w-full px-4 py-2.5 text-sm border rounded-lg transition-all duration-300 placeholder-gray-400 bg-white border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all"
                    placeholder="Enter pin code..."
                  />
                </div>

                {/* 5. Contact Person (Column 1, Row 3) - NOW A DROPDOWN (Name only) */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Contact Person
                  </label>
                  <CustomDropdown
                    options={uniqueContacts.map((c) => c.name)}
                    value={formData.clientDetails.contactPersonName}
                    onChange={handleContactSelect}
                    placeholder="Select or type contact person..."
                    allowCustom={true}
                    disabled={isClientDataLoading}
                  />
                </div>

                {/* 6. Contact Phone (Column 2, Row 3) - POPULATED BY DROPDOWN SELECTION */}
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
                    className="w-full px-4 py-2.5 text-sm border rounded-lg transition-all duration-300 placeholder-gray-400 bg-white border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all"
                    placeholder="Enter phone number..."
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
                    className="w-full px-4 py-2.5 text-sm border rounded-lg transition-all duration-300 placeholder-gray-400 bg-white border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all"
                    placeholder="e.g., Aspirin Tablet Batch 101"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Sample Type
                  </label>
                  <CustomDropdown
                    options={sampleTypeOptions}
                    value={formData.sampleData.sampleType}
                    onChange={(val) =>
                      setFormData((prev) => ({
                        ...prev,
                        sampleData: { ...prev.sampleData, sampleType: val },
                      }))
                    }
                    placeholder={
                      isSampleTypesLoading
                        ? "Loading sample types..."
                        : "Select sample type..."
                    }
                    disabled={isSampleTypesLoading}
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
                    onLock={handleLockParameter}
                    index={index}
                    showFeasibilityCheck={isPublished}
                    isFormPublished={isPublished}
                    regulationOptions={regulationOptions}
                    isRegulationsLoading={isRegulationsLoading}
                    methodOptions={methodOptions}
                    isMethodsLoading={isMethodsLoading}
                    specificationOptions={specificationOptions}
                    isSpecificationsLoading={isSpecificationsLoading}
                    instrumentOptions={instrumentOptions}
                    isInstrumentsLoading={isInstrumentsLoading}
                    labOptions={labOptions}
                    isLabsLoading={isLabsLoading}
                    chemicalOptions={chemicalOptions}
                    isChemicalsLoading={isChemicalsLoading}
                    columnOptions={columnOptions}
                    isColumnsLoading={isColumnsLoading}
                    standardOptions={standardOptions}
                    isStandardsLoading={isStandardsLoading}
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

            {/* Actions Footer - REFACTORED BLOCK */}
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

              {/* 2. Primary Action Button (Publish or Save Changes) */}
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
              ) : (
                // B. Published state: Single Save Changes button (replaces Lock/Update)
                <button
                  onClick={handleSavePublished}
                  disabled={isSubmitting}
                  className="flex-1 relative flex items-center justify-center gap-2.5 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 shadow-md hover:shadow-lg font-semibold disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              )}
            </div>
            {/* END Actions Footer */}

            {/* RENAMED: showToast -> showPublishBanner */}
            {showPublishBanner && (
              <div className="pt-8 border-t border-gray-200">
                <ReferenceNumberBanner
                  referenceNo={referenceNo}
                  onClose={() => setShowPublishBanner(false)}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
