"use client";

/**
 * 데이터 업로드 페이지 - Excel 또는 Google Sheets를 통해 활동 데이터를 가져오고 관리하는 기능을 제공
 */

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
  
  const [persistentData, setPersistentData] = useState<any[]>([]);

  useEffect(() => {
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
      
      const updated = [...persistentData, ...previewData];
      setPersistentData(updated);
      localStorage.setItem('pcf_persistent_data', JSON.stringify(updated));

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
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(ws, { defval: "" });
        
        const cleaned = (json as any[]).map(row => ({
          '일자': row['일자'] || row['일자(원본)'] || '',
          '활동 유형': row['활동 유형'] || row['활동유형'] || '',
          '설명': row['설명'] || '',
          '량': row['량'] || 0,
          '단위': row['단위'] || ''
        })).filter(d => d['일자'] && d['활동 유형']);

        setPreviewData(cleaned);
      } catch (err) {
        setError('파일을 해석하는 중 오류가 발생했습니다.');
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
      if (!sheetIdMatch) throw new Error('올바르지 않은 구글 시트 URL입니다.');

      const gidMatch = sheetUrl.match(/gid=([0-9]+)/);
      const gid = gidMatch ? `&gid=${gidMatch[1]}` : '';

      const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetIdMatch[1]}/export?format=csv${gid}`;
      const response = await fetch(exportUrl);
      if (!response.ok) throw new Error('시트 데이터를 가져오지 못했습니다. 링크 공유 설정을 확인해 주세요.');

      const text = await response.text();
      const wb = XLSX.read(text, { type: 'string' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" }) as any[][];
      
      let headerRowIndex = -1;
      for (let i = 0; i < Math.min(rows.length, 20); i++) {
        const rowStr = rows[i].join('|');
        if (rowStr.includes('일자') || rowStr.includes('활동')) {
          headerRowIndex = i;
          break;
        }
      }

      if (headerRowIndex === -1) throw new Error('시트에서 데이터 테이블(일자, 활동 유형 등)을 찾을 수 없습니다.');

      const headers = rows[headerRowIndex].map(h => String(h).trim());
      const dataRows = rows.slice(headerRowIndex + 1);
      
      const finalData = dataRows.filter(r => r.some(cell => cell !== "")).map(r => {
        const item: any = {};
        headers.forEach((h, idx) => { if (h) item[h] = r[idx]; });
        return {
          '일자': item['일자(원본)'] || item['일자'] || '',
          '활동 유형': item['활동 유형'] || item['활동유형'] || '',
          '설명': item['설명'] || '',
          '량': item['량'] || 0,
          '단위': item['단위'] || ''
        };
      }).filter(d => d['일자'] && d['활동 유형']);

      if (finalData.length === 0) throw new Error('표시할 유효한 데이터가 없습니다.');

      setPreviewData(finalData);
      setFileName('Google Sheet Data');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatExcelDate = (val: any) => {
    if (!val) return '-';
    if (val instanceof Date) return val.toISOString().split('T')[0];
    if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}/.test(val)) return val.split(' ')[0];
    if (typeof val === 'number') {
      const date = new Date((val - 25569) * 86400 * 1000);
      return date.toISOString().split('T')[0];
    }
    return String(val);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Data Management</h1>
          <p className="text-zinc-500 mt-1">Upload activity records or manage existing data.</p>
        </div>
        
        <div className="flex bg-zinc-100 p-1 rounded-xl border border-zinc-200">
          <button onClick={() => setMode('FILE')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${mode === 'FILE' ? 'bg-white shadow-sm text-emerald-600' : 'text-zinc-500'}`}><FileSpreadsheet size={16} /> File Upload</button>
          <button onClick={() => setMode('LINK')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${mode === 'LINK' ? 'bg-white shadow-sm text-emerald-600' : 'text-zinc-500'}`}><LinkIcon size={16} /> Google Sheets</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-zinc-900 mb-4 flex items-center gap-2"><Upload size={18} className="text-emerald-500" /> Quick Import</h3>
            
            {mode === 'FILE' ? (
              <div 
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFileUpload(e.dataTransfer.files[0]); }}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${isDragging ? 'border-emerald-500 bg-emerald-50' : 'border-zinc-100'}`}
              >
                <FileSpreadsheet size={32} className="mx-auto text-zinc-300 mb-4" />
                <p className="text-xs text-zinc-500 mb-4">Click to browse or drag & drop</p>
                <label className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-xs font-bold cursor-pointer hover:bg-zinc-800">Select File<input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])} /></label>
              </div>
            ) : (
              <div className="space-y-3">
                <input type="text" placeholder="구글 시트 URL을 입력하세요" className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all" value={sheetUrl} onChange={(e) => setSheetUrl(e.target.value)} />
                <button onClick={handleFetchSheet} disabled={isLoading || !sheetUrl} className="w-full bg-zinc-900 text-white py-3 rounded-xl text-sm font-bold disabled:opacity-50 hover:bg-zinc-800 transition-all">
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
                
                <div className="mb-6 max-h-[300px] overflow-y-auto border border-zinc-100 rounded-xl bg-zinc-50 p-2">
                  <table className="w-full text-[10px] text-left">
                    <thead className="text-zinc-400 font-bold uppercase">
                      <tr><th className="p-1">일자</th><th className="p-1">유형</th><th className="p-1 text-right">량</th></tr>
                    </thead>
                    <tbody>
                      {previewData.slice(0, 15).map((row, i) => (
                        <tr key={i} className="border-t border-zinc-100">
                          <td className="p-1">{formatExcelDate(row['일자'])}</td>
                          <td className="p-1">{row['활동 유형']}</td>
                          <td className="p-1 text-right font-bold">{row['량']}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button onClick={handleImport} disabled={isSyncing || isSuccess} className={`w-full text-white py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg transition-all ${isSuccess ? 'bg-zinc-900' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
                  {isSyncing ? <><Loader2 size={18} className="animate-spin" /> Syncing...</> : isSuccess ? <><CheckCircle2 size={18} /> Sync Complete</> : <>Complete Import <ArrowRight size={18} /></>}
                </button>
              </div>
            )}
            
            {error && <p className="text-red-500 text-[10px] mt-4 font-bold flex items-center gap-1 bg-red-50 p-2 rounded-lg"><AlertCircle size={10}/> {error}</p>}
          </div>

          <div className="bg-zinc-900 text-white rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-500 opacity-10 rounded-full blur-2xl"></div>
            <h4 className="text-sm font-bold mb-2 flex items-center gap-2 relative z-10"><Database size={16} className="text-emerald-400" /> Storage Info</h4>
            <p className="text-[11px] text-zinc-500 leading-relaxed relative z-10">All uploaded data is synchronized with your central PCF repository. Once synced, you can see the results on the main dashboard.</p>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
              <div><h3 className="font-bold text-zinc-900 flex items-center gap-2"><TableIcon size={18} className="text-emerald-500" /> Activity History</h3><p className="text-xs text-zinc-500 mt-1">Showing all persistent records from your repository.</p></div>
              <button onClick={handleClearAllData} disabled={isDeleting || persistentData.length === 0} className="text-[10px] font-bold text-zinc-400 hover:text-red-500 disabled:opacity-30 transition-colors uppercase tracking-widest flex items-center gap-1">{isDeleting && <Loader2 size={10} className="animate-spin" />} Delete All Data</button>
            </div>
            
            <div className="overflow-x-auto max-h-[600px]">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-10 bg-white">
                  <tr className="bg-zinc-50 text-zinc-500 text-[10px] font-bold uppercase tracking-widest border-b border-zinc-200">
                    <th className="px-6 py-4">일자</th><th className="px-6 py-4">활동 유형</th><th className="px-6 py-4">설명</th><th className="px-6 py-4">량</th><th className="px-6 py-4">단위</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {persistentData.map((row, i) => (
                    <tr key={i} className="hover:bg-zinc-50 transition-colors group">
                      <td className="px-6 py-4 text-sm font-medium text-zinc-900">{formatExcelDate(row['일자'])}</td>
                      <td className="px-6 py-4"><span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded text-[10px] font-bold">{row['활동 유형'] || '기타'}</span></td>
                      <td className="px-6 py-4 text-sm text-zinc-500 truncate max-w-[200px]">{row['설명']}</td>
                      <td className="px-6 py-4 text-sm font-bold text-zinc-900">{row['량']}</td>
                      <td className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase">{row['단위']}</td>
                    </tr>
                  ))}
                  {persistentData.length === 0 && (<tr><td colSpan={5} className="px-6 py-12 text-center text-zinc-400 text-sm">No activity records found. Please upload data.</td></tr>)}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
