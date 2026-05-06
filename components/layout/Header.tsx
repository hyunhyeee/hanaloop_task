"use client";
// 상단 헤더 컴포넌트
import { Upload } from 'lucide-react';
import Link from 'next/link';

export const Header = () => {
  return (
    <header className="h-16 border-b bg-white border-zinc-200 px-8 flex items-center justify-end sticky top-0 z-10">
      <Link 
        href="/upload"
        className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
      >
        <Upload size={16} />
        Upload Data
      </Link>
    </header>
  );
};
