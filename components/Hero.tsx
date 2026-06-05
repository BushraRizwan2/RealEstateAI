/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { HomeIcon, BuildingOfficeIcon, ChartBarIcon, UsersIcon, Cog6ToothIcon, ArrowLeftOnRectangleIcon, DocumentChartBarIcon, ClockIcon } from '@heroicons/react/24/outline';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSignOut?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onSignOut }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: ChartBarIcon },
    { id: 'listings', label: 'Properties', icon: BuildingOfficeIcon },
    { id: 'crm', label: 'CRM', icon: UsersIcon },
    { id: 'reports', label: 'Reports', icon: DocumentChartBarIcon },
    { id: 'activity_log', label: 'Activity Log', icon: ClockIcon },
    { id: 'settings', label: 'Settings', icon: Cog6ToothIcon },
  ];

  return (
    <div className="w-72 h-full bg-white border-r border-slate-200 flex flex-col shrink-0 transition-all duration-300 z-20 relative">
      <div className="p-8 flex items-center gap-3.5">
        <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
            <HomeIcon className="w-6 h-6" />
        </div>
        <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none">Estate<span className="text-blue-600">AI</span></h1>
            <p className="text-[10px] text-slate-500 font-medium tracking-wide mt-1 uppercase">Enterprise ERP</p>
        </div>
      </div>

      <div className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4 px-4 font-sans">Menu</div>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
              activeTab === item.id 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <item.icon className={`w-5 h-5 transition-colors ${activeTab === item.id ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      <div className="p-6 border-t border-slate-100">
        <button 
          onClick={onSignOut}
          className="flex items-center space-x-3 text-slate-500 hover:text-red-600 hover:bg-red-50 text-sm font-medium transition-all px-4 py-3 w-full rounded-xl group"
        >
            <ArrowLeftOnRectangleIcon className="w-5 h-5 text-slate-400 group-hover:text-red-500" />
            <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};