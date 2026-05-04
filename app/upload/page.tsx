"use client";

import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { 
  Upload, 
  FileText, 
  AlertCircle, 
  ArrowRight, 
  Link as LinkIcon, 
  FileSpreadsheet,
  Loader2,
  CheckCircle2
} from 'lucide-react';

type UploadMode = 'FILE' | 'LINK';

export default function UploadPage() {
  const [mode, setMode] = useState<UploadMode>('FILE');
  const [data, setData] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [sheetUrl, setSheetUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isSyncing, setIsSyncing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleImport = async () => {
    if (data.length === 0) return;
    setIsSyncing(true);
    setError(null);

    try {
      const response = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to sync data');

      setIsSuccess(true);
      setTimeout(() => {
        window.location.href = '/'; // Redirect to dashboard after success
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleFileUpload = (file: File) => {
    if (!file) return;
    setError(null);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const bstr = e.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const json = XLSX.utils.sheet_to_json(ws);
        setData(json);
      } catch (err) {
        setError('Failed to parse file. Please ensure it is a valid Excel or CSV file.');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleFetchSheet = async () => {
    if (!sheetUrl) return;
    setIsLoading(true);
    setError(null);
    setData([]);

    try {
      // Convert standard sharing link to export link
      // Example: https://docs.google.com/spreadsheets/d/{ID}/edit... -> /export?format=csv
      const sheetIdMatch = sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (!sheetIdMatch) {
        throw new Error('Invalid Google Sheets URL. Please check the format.');
      }

      const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetIdMatch[1]}/export?format=csv`;
      
      const response = await fetch(exportUrl);
      const contentType = response.headers.get('content-type');
      
      if (!response.ok || (contentType && contentType.includes('text/html'))) {
        throw new Error('Could not fetch the sheet. This usually happens if the sheet is NOT public. Please set sharing to "Anyone with the link can view".');
      }

      const blob = await response.blob();
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const bstr = e.target?.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          
          // Use 'defval' to handle empty cells and avoid "strange" shifts
          const json = XLSX.utils.sheet_to_json(ws, { defval: "" });
          
          if (json.length === 0) {
            throw new Error('The sheet appears to be empty.');
          }

          setData(json);
          setFileName('Google Sheet Data');
          setIsLoading(false);
        } catch (err: any) {
          setError('Failed to parse the data. The file might not be in a supported format.');
          setIsLoading(false);
        }
      };
      reader.readAsBinaryString(blob);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching the data.');
      setIsLoading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileUpload(file);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Data Import</h1>
          <p className="text-zinc-500">Choose your preferred method to import PCF inventory data.</p>
        </div>
        
        <div className="flex bg-zinc-100 p-1 rounded-xl border border-zinc-200">
          <button 
            onClick={() => { setMode('FILE'); setData([]); setError(null); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              mode === 'FILE' ? 'bg-white shadow-sm text-emerald-600' : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            <FileSpreadsheet size={16} />
            File Upload
          </button>
          <button 
            onClick={() => { setMode('LINK'); setData([]); setError(null); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              mode === 'LINK' ? 'bg-white shadow-sm text-emerald-600' : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            <LinkIcon size={16} />
            Google Sheets
          </button>
        </div>
      </div>

      {/* Mode Content */}
      <div className="min-h-[300px]">
        {mode === 'FILE' ? (
          <div 
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            className={`border-2 border-dashed rounded-2xl p-16 text-center transition-all animate-in fade-in duration-300 ${
              isDragging ? 'border-emerald-500 bg-emerald-50' : 'border-zinc-200 bg-white'
            }`}
          >
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
                <Upload size={40} />
              </div>
              <h3 className="text-xl font-bold text-zinc-900">
                {fileName && mode === 'FILE' ? fileName : 'Click or drag Excel/CSV file here'}
              </h3>
              <p className="text-sm text-zinc-500 mt-2 mb-8 max-w-xs mx-auto">
                Securely upload your local PCF data for immediate processing.
              </p>
              
              <label className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold cursor-pointer hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200">
                Browse Files
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".xlsx, .xls, .csv" 
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])} 
                />
              </label>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-zinc-200 rounded-2xl p-12 text-center animate-in fade-in duration-300">
            <div className="flex flex-col items-center max-w-xl mx-auto">
              <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6">
                <LinkIcon size={40} />
              </div>
              <h3 className="text-xl font-bold text-zinc-900">Connect Google Sheets</h3>
              <p className="text-sm text-zinc-500 mt-2 mb-8">
                Paste your Google Sheets URL below. Ensure the sheet is set to <strong>"Anyone with the link can view"</strong>.
              </p>
              
              <div className="flex gap-2 w-full">
                <input 
                  type="url"
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={sheetUrl}
                  onChange={(e) => setSheetUrl(e.target.value)}
                />
                <button 
                  onClick={handleFetchSheet}
                  disabled={isLoading || !sheetUrl}
                  className="bg-zinc-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-zinc-800 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Fetch Data'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-center gap-3 text-red-700 animate-in shake duration-300">
          <AlertCircle size={20} />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Preview Section */}
      {data.length > 0 && (
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500 p-1.5 rounded-lg text-white">
                <CheckCircle2 size={18} />
              </div>
              <div>
                <h3 className="font-bold text-zinc-900">Ready to Sync</h3>
                <p className="text-xs text-zinc-500">{data.length} valid rows detected from {fileName}</p>
              </div>
            </div>
            <button 
              onClick={handleImport}
              disabled={isSyncing || isSuccess}
              className={`text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg ${
                isSuccess ? 'bg-zinc-900 shadow-zinc-200' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
              } disabled:opacity-70`}
            >
              {isSyncing ? (
                <><Loader2 size={18} className="animate-spin" /> Syncing...</>
              ) : isSuccess ? (
                <><CheckCircle2 size={18} /> Import Complete!</>
              ) : (
                <>Complete Import <ArrowRight size={18} /></>
              )}
            </button>
          </div>
          
          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10">
                <tr className="bg-zinc-50 text-zinc-500 text-[10px] font-bold uppercase tracking-widest border-b border-zinc-200">
                  {Object.keys(data[0]).map((key) => (
                    <th key={key} className="px-6 py-4">{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {data.map((row, i) => (
                  <tr key={i} className="hover:bg-zinc-50 transition-colors">
                    {Object.values(row).map((val: any, j) => (
                      <td key={j} className="px-6 py-4 text-sm text-zinc-600 whitespace-nowrap">
                        {val?.toString() || '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
