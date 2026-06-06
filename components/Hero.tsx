/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { HomeIcon, BuildingOfficeIcon, ChartBarIcon, UsersIcon, Cog6ToothIcon, ArrowLeftOnRectangleIcon, DocumentChartBarIcon, ClockIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSignOut?: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  onSignOut,
  isOpenMobile = false,
  onCloseMobile
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: ChartBarIcon },
    { id: 'listings', label: 'Properties', icon: BuildingOfficeIcon },
    { id: 'crm', label: 'CRM', icon: UsersIcon },
    { id: 'reports', label: 'Reports', icon: DocumentChartBarIcon },
    { id: 'activity_log', label: 'Activity Log', icon: ClockIcon },
    { id: 'settings', label: 'Settings', icon: Cog6ToothIcon },
  ];

  return (
    <>
      {/* Mobile Sidebar Backdrop */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-150"
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 h-full bg-white border-r border-slate-200 flex flex-col shrink-0 transition-transform duration-300
        md:relative md:translate-x-0 md:flex
        ${isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
                <HomeIcon className="w-6 h-6" />
            </div>
            <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none font-sans">Estate<span className="text-blue-600 font-sans">AI</span></h1>
                <p className="text-[10px] text-slate-500 font-medium tracking-wide mt-1 uppercase font-mono">Enterprise ERP</p>
            </div>
          </div>
          
          {/* Close button inside mobile version */}
          {onCloseMobile && (
            <button 
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg border border-slate-100 hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-all md:hidden cursor-pointer"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="flex-1 px-4 py-3 space-y-1.5 overflow-hidden">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4 px-4 font-sans">Menu</div>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                onCloseMobile?.();
              }}
              className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group cursor-pointer ${
                activeTab === item.id 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon className={`w-5 h-5 transition-colors ${activeTab === item.id ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
              <span className="font-sans">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="p-6 border-t border-slate-100">
          <button 
            onClick={onSignOut}
            className="flex items-center space-x-3 text-slate-500 hover:text-red-600 hover:bg-red-50 text-sm font-medium transition-all px-4 py-3 w-full rounded-xl group cursor-pointer"
          >
              <ArrowLeftOnRectangleIcon className="w-5 h-5 text-slate-400 group-hover:text-red-500" />
              <span className="font-sans">Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
};