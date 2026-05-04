"use client";
import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  BarChart3, 
  Settings, 
  FileSpreadsheet,
  Globe
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: Package, label: 'Products', href: '/products' },
  { icon: BarChart3, label: 'Emissions', href: '/emissions' },
  { icon: FileSpreadsheet, label: 'Data Upload', href: '/upload' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-zinc-900 text-white min-h-screen p-4 flex flex-col">
      <div className="flex items-center gap-2 px-2 py-6 mb-8 border-b border-zinc-800">
        <div className="bg-emerald-500 p-1.5 rounded-lg">
          <Globe size={24} className="text-white" />
        </div>
        <span className="text-xl font-bold tracking-tight">HanaLoop</span>
      </div>

      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-emerald-600 text-white' 
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="pt-6 border-t border-zinc-800 mt-auto px-2 pb-4 text-xs text-zinc-500">
        © 2026 HanaLoop PCF v1.0
      </div>
    </div>
  );
};
