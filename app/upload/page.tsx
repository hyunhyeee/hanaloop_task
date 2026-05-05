"use client";

import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { 
  Upload, 
  AlertCircle, 
  ArrowRight, 
  Link as LinkIcon, 
  FileSpreadsheet,
  Loader2,
  CheckCircle2,
  Table as TableIcon,
  Database
} from 'lucide-react';
import { useRouter } from 'next/navigation';

type UploadMode = 'FILE' | 'LINK';

export default function UploadPage() {
  const router = useRouter();
  const [mode, setMode] = useState<UploadMode>('FILE');
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [sheetUrl, setSheetUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isSyncing, setIsSyncing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Persistent activity data fetched from DB
  const [persistentData, setPersistentData] = useState<any[]>([]);

  // Fetch existing data on mount
  const fetchExistingData = async () => {
    try {
      const response = await fetch('/api/dashboard');
      const data = await response.json();
      if (response.ok) {
        // We can use products list to show some activity if needed, 
        // but for the history view, we might need a separate endpoint.
        // For now, let's keep the mock/local logic but fix the UI trigger.
      }
    } catch (err) {
      console.error('Failed to fetch persistent data');
    }
  };

  useEffect(() => {
    fetchExistingData();
    const saved = localStorage.getItem('pcf_persistent_data');
    if (saved) {
      setPersistentData(JSON.parse(saved));
    }
  }, []);

  const handleClearAllData = async () => {
    if (!confirm('정말로 모든 업로드 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없으며, 기초 수치(배출계수)는 유지됩니다.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch('/api/import/clear', { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete data from server');
      
      localStorage.removeItem('pcf_persistent_data');
      setPersistentData([]);
      alert('모든 데이터가 성공적으로 삭제되었습니다.');
    } catch (err: any) {
      alert('삭제 중 오류가 발생했습니다: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleImport = async () => {
    if (previewData.length === 0) return;
    setIsSyncing(true);
    setError(null);

    try {
      const response = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(previewData),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to sync data');

      setIsSuccess(true);
      
      // Update persistent view
      const updated = [...persistentData, ...previewData];
      setPersistentData(updated);
      localStorage.setItem('pcf_persistent_data', JSON.stringify(updated));

      // Redirect to dashboard after short delay
      setTimeout(() => {
        router.push('/');
      }, 1500);
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
        setPreviewData(json);
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
    setPreviewData([]);

    try {
      const sheetIdMatch = sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (!sheetIdMatch) throw new Error('Invalid Google Sheets URL.');

      const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetIdMatch[1]}/export?format=csv`;
      const response = await fetch(exportUrl);
      if (!response.ok) throw new Error('Could not fetch the sheet.');

      const blob = await response.blob();
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const bstr = e.target?.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
          const json = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: "" });
          setPreviewData(json);
          setFileName('Google Sheet Data');
          setIsLoading(false);
        } catch (err: any) {
          setError('Failed to parse data.');
          setIsLoading(false);
        }
      };
      reader.readAsBinaryString(blob);
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Data Management</h1>
          <p className="text-zinc-500 mt-1">Upload new activity records or manage existing sustainability data.</p>
        </div>
        
        <div className="flex bg-zinc-100 p-1 rounded-xl border border-zinc-200">
          <button 
            onClick={() => setMode('FILE')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              mode === 'FILE' ? 'bg-white shadow-sm text-emerald-600' : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            <FileSpreadsheet size={16} />
            File Upload
          </button>
          <button 
            onClick={() => setMode('LINK')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              mode === 'LINK' ? 'bg-white shadow-sm text-emerald-600' : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            <LinkIcon size={16} />
            Google Sheets
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Upload Section */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-zinc-900 mb-4 flex items-center gap-2">
              <Upload size={18} className="text-emerald-500" />
              Quick Import
            </h3>
            
            {mode === 'FILE' ? (
              <div 
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  handleFileUpload(e.dataTransfer.files[0]);
                }}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                  isDragging ? 'border-emerald-500 bg-emerald-50' : 'border-zinc-100'
                }`}
              >
                <FileSpreadsheet size={32} className="mx-auto text-zinc-300 mb-4" />
                <p className="text-xs text-zinc-500 mb-4">Click to browse or drag & drop</p>
                <label className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-xs font-bold cursor-pointer hover:bg-zinc-800">
                  Select File
                  <input 
                    type="file" 
                    className="hidden" 
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])} 
                  />
                </label>
              </div>
            ) : (
              <div className="space-y-3">
                <input 
                  type="url"
                  placeholder="Google Sheets URL"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  value={sheetUrl}
                  onChange={(e) => setSheetUrl(e.target.value)}
                />
                <button 
                  onClick={handleFetchSheet}
                  disabled={isLoading || !sheetUrl}
                  className="w-full bg-zinc-900 text-white py-3 rounded-xl text-sm font-bold disabled:opacity-50 hover:bg-zinc-800 transition-all"
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Fetch Data'}
                </button>
              </div>
            )}

            {previewData.length > 0 && (
              <div className="mt-6 pt-6 border-t border-zinc-100 animate-in slide-in-from-top-2">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-bold text-zinc-500">{previewData.length} rows detected</span>
                  {isSuccess && <span className="text-emerald-500 text-xs font-bold flex items-center gap-1"><CheckCircle2 size={12}/> Success!</span>}
                </div>
                <button 
                  onClick={handleImport}
                  disabled={isSyncing || isSuccess}
                  className={`w-full text-white py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg transition-all ${
                    isSuccess ? 'bg-zinc-900 shadow-zinc-200' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
                  }`}
                >
                  {isSyncing ? (
                    <><Loader2 size={18} className="animate-spin" /> Syncing...</>
                  ) : isSuccess ? (
                    <><CheckCircle2 size={18} /> Sync Complete</>
                  ) : (
                    <>Complete Import <ArrowRight size={18} /></>
                  )}
                </button>
                <p className="text-[10px] text-zinc-400 text-center mt-3">Clicking will sync to dashboard</p>
              </div>
            )}
            
            {error && <p className="text-red-500 text-[10px] mt-4 font-bold flex items-center gap-1"><AlertCircle size={10}/> {error}</p>}
          </div>

          <div className="bg-zinc-900 text-white rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-500 opacity-10 rounded-full blur-2xl"></div>
            <h4 className="text-sm font-bold mb-2 flex items-center gap-2 relative z-10">
              <Database size={16} className="text-emerald-400" />
              Storage Info
            </h4>
            <p className="text-[11px] text-zinc-500 leading-relaxed relative z-10">
              All uploaded data is synchronized with your central PCF repository. Once synced, you can see the results on the main dashboard.
            </p>
          </div>
        </div>

        {/* Right: Persistent Data View */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-zinc-900 flex items-center gap-2">
                  <TableIcon size={18} className="text-emerald-500" />
                  Activity History
                </h3>
                <p className="text-xs text-zinc-500 mt-1">Showing all persistent records from your repository.</p>
              </div>
              <button 
                onClick={handleClearAllData}
                disabled={isDeleting || persistentData.length === 0}
                className="text-[10px] font-bold text-zinc-400 hover:text-red-500 disabled:opacity-30 transition-colors uppercase tracking-widest flex items-center gap-1"
              >
                {isDeleting ? <Loader2 size={10} className="animate-spin" /> : null}
                Delete All Data
              </button>
            </div>
            
            <div className="overflow-x-auto max-h-[600px]">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-10 bg-white">
                  <tr className="bg-zinc-50 text-zinc-500 text-[10px] font-bold uppercase tracking-widest border-b border-zinc-200">
                    <th className="px-6 py-4">일자</th>
                    <th className="px-6 py-4">활동 유형</th>
                    <th className="px-6 py-4">설명</th>
                    <th className="px-6 py-4">량</th>
                    <th className="px-6 py-4">단위</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {persistentData.map((row, i) => (
                    <tr key={i} className="hover:bg-zinc-50 transition-colors group">
                      <td className="px-6 py-4 text-sm font-medium text-zinc-900">{row['일자'] || row['일자(원본)'] || '-'}</td>
                      <td className="px-6 py-4">
                        <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded text-[10px] font-bold">
                          {row['활동 유형'] || row['활동유형'] || '기타'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-500 truncate max-w-[200px]">{row['설명']}</td>
                      <td className="px-6 py-4 text-sm font-bold text-zinc-900">{row['량']}</td>
                      <td className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase">{row['단위']}</td>
                    </tr>
                  ))}
                  {persistentData.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-zinc-400 text-sm">
                        No activity records found. Please upload data to populate this table.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
