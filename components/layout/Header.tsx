"use client";
import React from 'react';
import { Bell, Search, User, Upload } from 'lucide-react';
import Link from 'next/link';

export const Header = () => {
  return (
    <header className="h-16 border-b bg-white border-zinc-200 px-8 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-4 bg-zinc-100 px-3 py-1.5 rounded-full w-96">
        <Search size={18} className="text-zinc-400" />
        <input 
          type="text" 
          placeholder="Search PCF data..." 
          className="bg-transparent border-none outline-none text-sm w-full"
        />
      </div>

      <div className="flex items-center gap-6">
        <Link 
          href="/upload"
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
        >
          <Upload size={16} />
          Upload Data
        </Link>
        
        <div className="flex items-center gap-4 border-l pl-6 border-zinc-200">
          <button className="p-2 text-zinc-500 hover:bg-zinc-100 rounded-full transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          
          <div className="flex items-center gap-3 cursor-pointer hover:bg-zinc-50 p-1.5 rounded-lg transition-colors">
            <div className="w-8 h-8 bg-zinc-200 rounded-full flex items-center justify-center overflow-hidden">
              <User size={20} className="text-zinc-500" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-zinc-900">Admin User</p>
              <p className="text-xs text-zinc-500">Managing Director</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
