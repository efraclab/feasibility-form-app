import { useState, useCallback } from "react";
import {
  Upload,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileSpreadsheet,
  Loader2,
  Download,
  RefreshCw,
  Table,
  Eye,
  AlertTriangle,
  Grid3x3,
  ListChecks,
  Info,
  ClipboardList,
  ChevronLeft,
  DatabaseZap,
  User,
  Send,
} from "lucide-react";
import * as XLSX from "xlsx";
import {
  uploadParameters,
  convertExcelRowToParameter,
} from "../services/ParameterService";
import type { ParameterUploadRequest } from '../models/ParameterUploadRequest';

interface ValidationError {
  type: "error" | "warning" | "success";
  message: string;
}

interface ParameterRow {
  [key: string]: any;
}

interface ParameterUploaderProps {
  employeeId: string;
  username: string;
  role: string;
  onBack: () => void;
}

interface ConfirmationDialog {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  onConfirm: () => void;
}

const REQUIRED_HEADERS = [
  "PARAMETER NAME",
  "PARAMETER CODE",
  "PARAMETER GROUP",
  "PARAMETER GROUP CODE",
  "PARAMETER SUB-GROUP",
  "PARAMETER SUB-GROUP CODE",
  "COMMODITY NAME",
  "COMMODITY CODE",
  "COMMODITY GROUP",
  "COMMODITY GROUP CODE",
  "NON FSSAI/FSSAI/DRUG",
  "NON FSSAI/FSSAI/DRUG CODE",
  "REGULATION NAME",
  "REGULATION CODE",
  "PARAMETER LAB DISTRIBUTION (FDS/MT/RA/MB/WTR/ENV/GAS)",
  "LAB CODE",
  "TAT DAYS",
  "PARAMETER SEQUENCE",
  "OUTSOURCE Y/N",
  "SAMPLE QUANTITY REQUIRED-FOR ANALYSIS",
  "SAMPLE QUANTITY REQUIRED-FOR RETENTION",
  "REQUIRED SAMPLE QUANTITY (UNIT)",
  "UNIT CODE",
  "NABL SCOPE STATUS",
  "METHOD NAME",
  "METHOD CODE",
  "SPECIFICATION NAME ",
  "SPECIFICATION CODE",
  "FSSAICatagoryNo",
  "SubClause",
  "Test_Unit",
  "Test_Code",
  "INSTRUMENT",
  "LOQ",
  "PARAMETER INDIVIDUAL RATE",
  "REGULATORY RATE (FOR DRUG)",
  "UploadDate",
  "ADD_INFO",
];

const MAX_ROWS = 50000;

export default function ParameterUploader({ employeeId, username, role, onBack }: ParameterUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    [],
  );
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [inputKey, setInputKey] = useState(0);
  const [previewData, setPreviewData] = useState<ParameterRow[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [validatedFileName, setValidatedFileName] = useState("");
  const [confirmDialog, setConfirmDialog] = useState<ConfirmationDialog>({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "",
    onConfirm: () => {},
  });
  const [actionLoading, setActionLoading] = useState(false);

  const resetUploader = () => {
    setFile(null);
    setUploading(false);
    setUploadProgress(0);
    setIsDragging(false);
    setInputKey((prevKey) => prevKey + 1);
    setPreviewData([]);
    setShowPreview(false);
    setValidatedFileName("");
    setValidationErrors([]);
  };

  const openConfirmDialog = (
    title: string,
    message: string,
    confirmText: string,
    onConfirm: () => void,
  ) => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      confirmText,
      onConfirm,
    });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({
      isOpen: false,
      title: "",
      message: "",
      confirmText: "",
      onConfirm: () => {},
    });
  };

  const validateFile = useCallback(
    async (selectedFile: File): Promise<boolean> => {
      setValidationErrors([]);
      const errors: ValidationError[] = [];

      const reader = new FileReader();

      return new Promise((resolve) => {
        reader.onload = (e) => {
          try {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: "binary" });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            const rawData: any[][] = XLSX.utils.sheet_to_json(worksheet, {
              header: 1,
              defval: "",
              raw: false,
            });

            if (rawData.length === 0) {
              errors.push({
                type: "error",
                message: "Excel file is empty. Please upload a file with data.",
              });
              setValidationErrors(errors);
              resolve(false);
              return;
            }

            const headerRow = rawData[0];

            if (headerRow.length !== REQUIRED_HEADERS.length) {
              errors.push({
                type: "error",
                message: `Invalid number of columns. Expected ${REQUIRED_HEADERS.length} columns, but found ${headerRow.length}. Please ensure your Excel file matches the required template exactly.`,
              });
            }

            // Smart header validation - normalize line breaks for comparison
            const normalizeHeader = (header: string) => {
              return header.replace(/\s+/g, " ").trim();
            };

            let headerMismatch = false;
            const mismatchedHeaders: string[] = [];

            for (let i = 0; i < REQUIRED_HEADERS.length; i++) {
              const expected = REQUIRED_HEADERS[i];
              const actual = headerRow[i] || "";

              // First try exact match
              if (actual === expected) {
                continue;
              }

              // If not exact, try normalized match (ignoring line breaks)
              const normalizedExpected = normalizeHeader(expected);
              const normalizedActual = normalizeHeader(actual);

              if (normalizedActual !== normalizedExpected) {
                headerMismatch = true;
                mismatchedHeaders.push(
                  `Column ${i + 1}: Expected "${expected}" but found "${actual}"`,
                );
              }
            }

            if (headerMismatch) {
              // Show first 3 mismatches to avoid overwhelming the user
              const displayErrors = mismatchedHeaders.slice(0, 3);
              displayErrors.forEach((msg) => {
                errors.push({
                  type: "error",
                  message: msg,
                });
              });

              if (mismatchedHeaders.length > 3) {
                errors.push({
                  type: "error",
                  message: `...and ${mismatchedHeaders.length - 3} more header mismatches. Please download the template for the exact format.`,
                });
              }
            }

            const dataRows = rawData.slice(1);
            const nonEmptyRows = dataRows.filter((row) =>
              row.some((cell) => cell !== ""),
            );

            if (nonEmptyRows.length === 0) {
              errors.push({
                type: "error",
                message:
                  "No data rows found. Please add data rows below the header row.",
              });
              setValidationErrors(errors);
              resolve(false);
              return;
            }

            if (nonEmptyRows.length > MAX_ROWS) {
              errors.push({
                type: "error",
                message: `Too many rows. Found ${nonEmptyRows.length.toLocaleString()} rows, but maximum allowed is ${MAX_ROWS.toLocaleString()} rows.`,
              });
            }

            let dataExtendsToFarColumn = false;
            let lastColumnWithData = 0;

            nonEmptyRows.forEach((row, rowIndex) => {
              for (let colIndex = REQUIRED_HEADERS.length; colIndex < row.length; colIndex++) {
                if (row[colIndex] && row[colIndex].toString().trim() !== "") {
                  dataExtendsToFarColumn = true;
                  lastColumnWithData = Math.max(lastColumnWithData, colIndex);
                }
              }
            });

            if (dataExtendsToFarColumn) {
              const colLetter = XLSX.utils.encode_col(lastColumnWithData);
              errors.push({
                type: "error",
                message: `Data found beyond column ${REQUIRED_HEADERS.length} (column ${colLetter}). Please ensure all data is within the first ${REQUIRED_HEADERS.length} columns.`,
              });
            }

            if (errors.length > 0) {
              setValidationErrors(errors);
              resolve(false);
              return;
            }

            // --- Field-level validation ---
            // Column index constants (0-based, matching REQUIRED_HEADERS order)
            const COL_PARAMETER_CODE = 1;       // "PARAMETER CODE"
            const COL_TAT_DAYS = 16;            // "TAT DAYS"
            const COL_PARAMETER_SEQUENCE = 17;  // "PARAMETER SEQUENCE"
            const COL_SAMPLE_QTY_ANALYSIS = 19; // "SAMPLE QUANTITY REQUIRED-FOR ANALYSIS"
            const COL_SAMPLE_QTY_RETENTION = 20;// "SAMPLE QUANTITY REQUIRED-FOR RETENTION"
            const COL_INSTRUMENT = 32;          // "INSTRUMENT"
            const COL_PARAM_INDIVIDUAL_RATE = 34; // "PARAMETER INDIVIDUAL RATE"
            const COL_REGULATORY_RATE_DRUG = 35;  // "REGULATORY RATE (FOR DRUG)"

            const isInteger = (val: string) => /^-?\d+$/.test(val.trim());
            const isFloat = (val: string) => /^-?\d+(\.\d+)?$/.test(val.trim());

            const fieldErrors: string[] = [];

            nonEmptyRows.forEach((row, idx) => {
              const rowNum = idx + 2; // +2: 1-based + skip header

              const paramCode = row[COL_PARAMETER_CODE]?.toString().trim() ?? "";
              if (paramCode !== "" && paramCode.length > 9) {
                fieldErrors.push(`Row ${rowNum}: PARAMETER CODE "${paramCode}" exceeds 9 characters (found ${paramCode.length}).`);
              }

              const instrument = row[COL_INSTRUMENT]?.toString().trim() ?? "";
              if (instrument !== "" && instrument.length > 50) {
                fieldErrors.push(`Row ${rowNum}: INSTRUMENT "${instrument}" exceeds 5 characters (found ${instrument.length}).`);
              }

              const tatDays = row[COL_TAT_DAYS]?.toString().trim() ?? "";
              if (tatDays !== "" && !isInteger(tatDays)) {
                fieldErrors.push(`Row ${rowNum}: TAT DAYS "${tatDays}" must be a whole number (integer).`);
              }

              const paramSeq = row[COL_PARAMETER_SEQUENCE]?.toString().trim() ?? "";
              if (paramSeq !== "" && !isInteger(paramSeq)) {
                fieldErrors.push(`Row ${rowNum}: PARAMETER SEQUENCE "${paramSeq}" must be a whole number (integer).`);
              }

              const sampleAnalysis = row[COL_SAMPLE_QTY_ANALYSIS]?.toString().trim() ?? "";
              if (sampleAnalysis !== "" && !isInteger(sampleAnalysis)) {
                fieldErrors.push(`Row ${rowNum}: SAMPLE QUANTITY (ANALYSIS) "${sampleAnalysis}" must be a whole number (integer).`);
              }

              const sampleRetention = row[COL_SAMPLE_QTY_RETENTION]?.toString().trim() ?? "";
              if (sampleRetention !== "" && !isInteger(sampleRetention)) {
                fieldErrors.push(`Row ${rowNum}: SAMPLE QUANTITY (RETENTION) "${sampleRetention}" must be a whole number (integer).`);
              }

              const indivRate = row[COL_PARAM_INDIVIDUAL_RATE]?.toString().trim() ?? "";
              if (indivRate !== "" && !isFloat(indivRate)) {
                fieldErrors.push(`Row ${rowNum}: PARAMETER INDIVIDUAL RATE "${indivRate}" must be a valid number (e.g. 12 or 12.50).`);
              }

              const regRate = row[COL_REGULATORY_RATE_DRUG]?.toString().trim() ?? "";
              if (regRate !== "" && !isFloat(regRate)) {
                fieldErrors.push(`Row ${rowNum}: REGULATORY RATE (FOR DRUG) "${regRate}" must be a valid number (e.g. 12 or 12.50).`);
              }
            });

            // Surface up to 10 field errors to avoid overwhelming the user
            const MAX_FIELD_ERRORS = 10;
            fieldErrors.slice(0, MAX_FIELD_ERRORS).forEach((msg) => {
              errors.push({ type: "error", message: msg });
            });
            if (fieldErrors.length > MAX_FIELD_ERRORS) {
              errors.push({
                type: "error",
                message: `...and ${fieldErrors.length - MAX_FIELD_ERRORS} more data validation error(s). Please fix the file and re-upload.`,
              });
            }

            if (errors.length > 0) {
              setValidationErrors(errors);
              resolve(false);
              return;
            }
            // --- End field-level validation ---

            const parsedData: ParameterRow[] = nonEmptyRows.map((row) => {
              const rowObj: ParameterRow = {};
              REQUIRED_HEADERS.forEach((header, index) => {
                rowObj[header] = row[index]?.toString() || "";
              });
              return rowObj;
            });

            setPreviewData(parsedData);
            setValidatedFileName(selectedFile.name);

            errors.push({
              type: "success",
              message: `Successfully validated ${parsedData.length.toLocaleString()} rows. Ready to upload!`,
            });
            setValidationErrors(errors);
            resolve(true);
          } catch (error) {
            errors.push({
              type: "error",
              message: `Failed to parse Excel file: ${error instanceof Error ? error.message : "Unknown error"}`,
            });
            setValidationErrors(errors);
            resolve(false);
          }
        };

        reader.onerror = () => {
          errors.push({
            type: "error",
            message: "Failed to read file. Please try again.",
          });
          setValidationErrors(errors);
          resolve(false);
        };

        reader.readAsBinaryString(selectedFile);
      });
    },
    [],
  );

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setShowPreview(false);
    await validateFile(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      await handleFileSelect(droppedFile);
    }
  };

  const performUpload = async () => {
    if (!file || previewData.length === 0) return;

    setActionLoading(true);
    setUploading(true);
    setUploadProgress(0);

    try {
      const parameters = previewData.map((row) =>
        convertExcelRowToParameter(row),
      );

      // Prepare upload request
      const uploadRequest: ParameterUploadRequest = {
        parameters: parameters,
        fileName: file.name!,
        uploadedBy: employeeId,
      };

      const response = await uploadParameters(uploadRequest);

      setUploadProgress(100);

      setValidationErrors([
        {
          type: "success",
          message: `Successfully uploaded ${response.successfulRows || previewData.length} parameter rows to the database!`,
        },
      ]);

      setTimeout(() => {
        resetUploader();
      }, 3000);
    } catch (error) {
      console.error("Upload error:", error);
      setValidationErrors([
        {
          type: "error",
          message: `Upload failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ]);
      setUploading(false);
    } finally {
      setActionLoading(false);
      closeConfirmDialog();
    }
  };

  const handleUpload = () => {
    openConfirmDialog(
      "Confirm Parameter Upload",
      `You are about to upload ${previewData.length.toLocaleString()} parameters to the database. This action cannot be undone. Do you want to proceed?`,
      "Upload Parameters",
      performUpload
    );
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([REQUIRED_HEADERS]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Parameters");
    XLSX.writeFile(wb, "Parameter_Upload_Template.xlsx");
  };

  const hasValidationSuccess = validationErrors.some(
    (err) => err.type === "success",
  );
  const hasValidationErrors = validationErrors.some(
    (err) => err.type === "error",
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header Section - Similar to BatchReview */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-102"
              >
                <ChevronLeft className="w-5 h-5 text-slate-700" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                  <DatabaseZap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-800">
                    Parameter Uploader
                  </h1>
                  <p className="text-sm text-slate-500">
                    Upload and manage parameter data in bulk
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-br from-slate-50 to-white rounded-lg border border-slate-200">
                <User className="w-4 h-4 text-slate-500" />
                <div className="text-right">
                  <div className="text-xs text-slate-500">Logged in as</div>
                  <div className="text-sm font-semibold text-slate-700">
                    {username}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1920px] mx-auto p-6">
        <div className={`grid grid-cols-1 ${!showPreview ? 'lg:grid-cols-3' : ''} gap-6`}>
          {/* Left Panel - Upload Section */}
          <div className={!showPreview ? "lg:col-span-2" : ""}>
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
              {!showPreview ? (
                <>
                  {/* Upload Header */}
                  <div className="bg-gradient-to-r from-slate-50 to-white px-6 py-5 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
                          <Upload className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-800">
                            Upload Excel File
                          </h3>
                          <p className="text-sm text-slate-500">
                            Select or drag & drop your parameter file
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={downloadTemplate}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-102"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download Template</span>
                      </button>
                    </div>
                  </div>

                  {/* Upload Area */}
                  <div className="p-6">
                    <div
                      className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
                        isDragging
                          ? "border-emerald-500 bg-emerald-50 scale-102"
                          : file
                            ? "border-emerald-300 bg-emerald-50"
                            : "border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50"
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      {!file ? (
                        <>
                          <div className="mb-6 flex justify-center">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                              <FileSpreadsheet className="w-10 h-10 text-emerald-600" />
                            </div>
                          </div>
                          <h3 className="text-xl font-bold text-slate-800 mb-2">
                            {isDragging
                              ? "Drop your file here"
                              : "Upload Excel File"}
                          </h3>
                          <p className="text-sm text-slate-500 mb-6">
                            Drag and drop your file here, or click to browse
                          </p>
                          <label className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold cursor-pointer transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-102">
                            <Upload className="w-5 h-5" />
                            <span>Browse Files</span>
                            <input
                              key={inputKey}
                              type="file"
                              accept=".xlsx,.xls"
                              onChange={(e) => {
                                const selectedFile = e.target.files?.[0];
                                if (selectedFile) handleFileSelect(selectedFile);
                              }}
                              className="hidden"
                            />
                          </label>
                        </>
                      ) : (
                        <>
                          <div className="mb-4 flex justify-center">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                              <FileSpreadsheet className="w-10 h-10 text-emerald-600" />
                            </div>
                          </div>
                          <h3 className="text-lg font-bold text-slate-800 mb-1">
                            {file.name}
                          </h3>
                          <p className="text-sm text-slate-500 mb-4">
                            {(file.size / 1024).toFixed(2)} KB
                          </p>
                        </>
                      )}
                    </div>

                    {/* Validation Messages */}
                    {validationErrors.length > 0 && (
                      <div className="mt-6 space-y-2">
                        {validationErrors.map((error, index) => (
                          <div
                            key={index}
                            className={`flex items-start gap-3 p-4 rounded-lg border-2 ${
                              error.type === "success"
                                ? "bg-emerald-50 border-emerald-200"
                                : error.type === "warning"
                                  ? "bg-amber-50 border-amber-200"
                                  : "bg-red-50 border-red-200"
                            }`}
                          >
                            {error.type === "success" ? (
                              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                            ) : error.type === "warning" ? (
                              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            )}
                            <p
                              className={`text-sm font-medium ${
                                error.type === "success"
                                  ? "text-emerald-700"
                                  : error.type === "warning"
                                    ? "text-amber-700"
                                    : "text-red-700"
                              }`}
                            >
                              {error.message}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Action Buttons */}
                    {hasValidationSuccess && !uploading && (
                      <div className="mt-6 flex gap-3">
                        <button
                          onClick={() => setShowPreview(true)}
                          disabled={uploading}
                          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-102 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Eye className="w-5 h-5" />
                          <span>Preview Data</span>
                        </button>
                        <button
                          onClick={handleUpload}
                          disabled={uploading}
                          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-102 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Upload className="w-5 h-5" />
                          <span>Upload to Database</span>
                        </button>
                      </div>
                    )}

                    {uploading && (
                      <div className="mt-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-slate-700">
                            Uploading...
                          </span>
                          <span className="text-sm font-bold text-emerald-600">
                            {uploadProgress}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 transition-all duration-300 rounded-full"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {file && !uploading && (
                      <button
                        onClick={resetUploader}
                        className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-all duration-200"
                      >
                        <RefreshCw className="w-5 h-5" />
                        <span>Upload Another File</span>
                      </button>
                    )}
                  </div>
                </>
              ) : (
                /* Preview Section */
                <div>
                  <div className="bg-gradient-to-r from-slate-50 to-white px-6 py-5 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
                          <Table className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-800">
                            Data Preview
                          </h3>
                          <p className="text-sm text-slate-500">
                            {validatedFileName} •{" "}
                            {previewData.length.toLocaleString()} rows
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowPreview(false)}
                        className="px-4 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-600 font-medium border-2 border-slate-200 hover:border-slate-300 transition-all duration-200"
                      >
                        Back to Upload
                      </button>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <div className="overflow-x-auto max-h-[600px] overflow-y-auto custom-scrollbar">
                        <table className="min-w-full divide-y divide-slate-200">
                          <thead className="bg-gradient-to-r from-slate-50 to-white sticky top-0">
                            <tr>
                              <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600 border-r border-slate-200">
                                #
                              </th>
                              {REQUIRED_HEADERS.map((header, idx) => (
                                <th
                                  key={idx}
                                  className="px-3 py-3 text-left text-xs font-semibold text-slate-600 border-r border-slate-200 min-w-[120px]"
                                >
                                  {header}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-slate-200">
                            {previewData.map((row, rowIdx) => (
                              <tr
                                key={rowIdx}
                                className="hover:bg-slate-50 transition-colors duration-150"
                              >
                                <td className="px-3 py-2 text-xs text-slate-500 border-r border-slate-200 font-medium">
                                  {rowIdx + 1}
                                </td>
                                {REQUIRED_HEADERS.map((header, colIdx) => (
                                  <td
                                    key={colIdx}
                                    className="px-3 py-2 text-xs text-slate-700 border-r border-slate-200"
                                  >
                                    {row[header]?.toString() || ""}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Info Panel - Only show when not in preview mode */}
          {!showPreview && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden sticky top-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-50 to-white px-6 py-4 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
                      <Info className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-800">
                        Important Guidelines
                      </h3>
                      <p className="text-xs text-slate-500">
                        Please read carefully
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200 hover:shadow-md transition-all duration-300">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0 border border-amber-200">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-bold text-amber-900 mb-1 text-sm">
                          Header Requirements
                        </p>
                        <p className="text-xs text-amber-700 leading-relaxed">
                          All 38 columns required. Headers are validated by text
                          content (line breaks handled automatically).
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 hover:shadow-md transition-all duration-300">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 border border-blue-200">
                        <Grid3x3 className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-bold text-blue-900 mb-1 text-sm">
                          Column Mapping
                        </p>
                        <p className="text-xs text-blue-700 leading-relaxed">
                          Data mapped by position, not name. Do not rearrange
                          columns.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200 hover:shadow-md transition-all duration-300">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0 border border-emerald-200">
                        <ListChecks className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-bold text-emerald-900 mb-1 text-sm">
                          Validation Rules
                        </p>
                        <ul className="text-xs text-emerald-700 space-y-1 leading-relaxed">
                          <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                            Max {MAX_ROWS.toLocaleString()} data rows
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                            No data beyond column 38
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                            Auto-removes blank rows
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                            TAT Days, Parameter Sequence, Sample Qty (Analysis &amp; Retention) must be integers
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                            Parameter Individual Rate &amp; Regulatory Rate must be numeric (float)
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                            Parameter Code ≤ 9 chars; Instrument ≤ 5 chars
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                            All fields above may be left blank (null)
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-200 hover:shadow-md transition-all duration-300">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0 border border-purple-200">
                        <ClipboardList className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-bold text-purple-900 mb-1 text-sm">
                          Preview Feature
                        </p>
                        <p className="text-xs text-purple-700 leading-relaxed">
                          Preview all rows before upload for verification.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-fadeIn">
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <Send className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {confirmDialog.title}
                  </h3>
                  <p className="text-sm text-emerald-50">
                    Please confirm your action
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <p className="text-slate-700 leading-relaxed">
                  {confirmDialog.message}
                </p>
              </div>

              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 mb-6 animate-slideDown">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                    <AlertCircle className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium mb-1">
                      Records to Upload
                    </p>
                    <p className="text-sm font-semibold text-slate-900">
                      {previewData.length.toLocaleString()} parameter(s)
                    </p>
                  </div>
                </div>
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
                  onClick={confirmDialog.onConfirm}
                  disabled={actionLoading}
                  className="flex-1 px-5 py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 shadow-md transform hover:scale-102 active:scale-98 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
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

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}