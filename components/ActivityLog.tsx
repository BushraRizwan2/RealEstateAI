/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useMemo } from 'react';
import { 
    ClockIcon, 
    BuildingOfficeIcon, 
    UsersIcon, 
    ArrowUpTrayIcon, 
    Cog6ToothIcon, 
    SparklesIcon, 
    MagnifyingGlassIcon, 
    TrashIcon, 
    ArrowDownTrayIcon, 
    FunnelIcon,
    CpuChipIcon,
    TagIcon,
    UserCircleIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

export interface LogEntry {
    id: string;
    type: 'property' | 'lead' | 'upload' | 'system' | 'settings';
    action: string;
    details: string;
    timestamp: Date;
    user: string;
}

interface ActivityLogProps {
    logs: LogEntry[];
    onClearLogs: () => void;
    onAddMockActivities: () => void;
}

export const ActivityLog: React.FC<ActivityLogProps> = ({ logs, onClearLogs, onAddMockActivities }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<'All' | 'property' | 'lead' | 'upload' | 'system' | 'settings'>('All');
    const [userFilter, setUserFilter] = useState('All');
    const [showConfirmClear, setShowConfirmClear] = useState(false);

    // Get unique list of operators/users for filter
    const usersList = useMemo(() => {
        const set = new Set<string>();
        logs.forEach(log => {
            if (log.user) set.add(log.user);
        });
        return Array.from(set);
    }, [logs]);

    // Calculate Dynamic Stats
    const stats = useMemo(() => {
        const result = {
            total: logs.length,
            uploads: 0,
            leads: 0,
            properties: 0,
            systems: 0
        };

        logs.forEach(log => {
            if (log.type === 'upload') result.uploads++;
            else if (log.type === 'lead') result.leads++;
            else if (log.type === 'property') result.properties++;
            else if (log.type === 'system' || log.type === 'settings') result.systems++;
        });

        return result;
    }, [logs]);

    // Filtered Logs
    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            const matchesSearch = 
                log.action.toLowerCase().includes(searchQuery.toLowerCase()) || 
                log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
                log.id.toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesType = typeFilter === 'All' || log.type === typeFilter;
            const matchesUser = userFilter === 'All' || log.user === userFilter;

            return matchesSearch && matchesType && matchesUser;
        });
    }, [logs, searchQuery, typeFilter, userFilter]);

    // Group filtered logs by date for clean section-by-section visualization
    const groupedLogs = useMemo(() => {
        const groups: Record<string, LogEntry[]> = {};
        
        filteredLogs.forEach(log => {
            const dateStr = new Date(log.timestamp).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            if (!groups[dateStr]) {
                groups[dateStr] = [];
            }
            groups[dateStr].push(log);
        });

        return Object.entries(groups).sort((a, b) => {
            // Sort dates descending
            return new Date(b[1][0].timestamp).getTime() - new Date(a[1][0].timestamp).getTime();
        });
    }, [filteredLogs]);

    const getIcon = (type: LogEntry['type']) => {
        switch (type) {
            case 'property':
                return <BuildingOfficeIcon className="w-5 h-5 text-blue-600" />;
            case 'lead':
                return <UsersIcon className="w-5 h-5 text-teal-600" />;
            case 'upload':
                return <ArrowUpTrayIcon className="w-5 h-5 text-indigo-600" />;
            case 'settings':
                return <Cog6ToothIcon className="w-5 h-5 text-amber-600" />;
            default:
                return <CpuChipIcon className="w-5 h-5 text-purple-600" />;
        }
    };

    const getBadgeStyle = (type: LogEntry['type']) => {
        switch (type) {
            case 'property':
                return 'bg-blue-50 text-blue-700 border-blue-100';
            case 'lead':
                return 'bg-teal-50 text-teal-700 border-teal-100';
            case 'upload':
                return 'bg-indigo-50 text-indigo-700 border-indigo-100';
            case 'settings':
                return 'bg-amber-50 text-amber-700 border-amber-100';
            default:
                return 'bg-purple-50 text-purple-700 border-purple-100';
        }
    };

    // Export raw logs to JSON backup
    const handleJSONExport = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `estateai_activity_logs_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    };

    // Export raw logs to CSV directly
    const handleCSVExport = () => {
        let csvContent = 'data:text/csv;charset=utf-8,';
        csvContent += 'Log ID,Timestamp,Category,Operator,Action Title,Details\n';

        logs.forEach(log => {
            const row = [
                log.id,
                log.timestamp.toISOString ? log.timestamp.toISOString() : new Date(log.timestamp).toISOString(),
                log.type.toUpperCase(),
                `"${log.user.replace(/"/g, '""')}"`,
                `"${log.action.replace(/"/g, '""')}"`,
                `"${log.details.replace(/"/g, '""')}"`
            ].join(',');
            csvContent += row + '\n';
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `estateai_activity_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    const highlightText = (text: string, highlight: string) => {
        if (!highlight.trim()) return <span>{text}</span>;
        
        const parts = text.split(new RegExp(`(${highlight.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi'));
        return (
            <span>
                {parts.map((part, i) => 
                    part.toLowerCase() === highlight.toLowerCase() 
                        ? <mark key={i} className="bg-yellow-100 text-yellow-900 px-0.5 rounded font-medium">{part}</mark> 
                        : part
                )}
            </span>
        );
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
            
            {/* Header section with overall Action Buttons */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Activity Log Database</h1>
                    <p className="text-slate-500 text-sm mt-1">Audit trail tracking property modifications, CRM actions, and file scan history.</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {logs.length === 0 && (
                        <button 
                            onClick={onAddMockActivities}
                            className="flex items-center gap-1.5 px-4 py-2 border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-bold transition-all shadow-sm"
                        >
                            <SparklesIcon className="w-4 h-4 text-blue-600" />
                            <span>Seed Mock Trail</span>
                        </button>
                    )}
                    <button 
                        onClick={handleCSVExport}
                        disabled={logs.length === 0}
                        className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-50 disabled:hover:bg-white rounded-xl text-xs font-bold transition-all shadow-sm"
                    >
                        <ArrowDownTrayIcon className="w-4 h-4 text-slate-400" />
                        <span>CSV Export</span>
                    </button>
                    <button 
                        onClick={handleJSONExport}
                        disabled={logs.length === 0}
                        className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-50 disabled:hover:bg-white rounded-xl text-xs font-bold transition-all shadow-sm"
                    >
                        <ArrowDownTrayIcon className="w-4 h-4 text-slate-400" />
                        <span>JSON Backup</span>
                    </button>
                    <button 
                        onClick={() => setShowConfirmClear(true)}
                        disabled={logs.length === 0}
                        className="flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 disabled:opacity-50 disabled:hover:bg-red-50 rounded-xl text-xs font-bold transition-all shadow-sm"
                    >
                        <TrashIcon className="w-4 h-4 text-red-600" />
                        <span>Clear Logs</span>
                    </button>
                </div>
            </div>

            {/* Overall Activity Statistics Metrics Row */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm text-left">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Actions</p>
                    <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.total}</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-medium">In complete feed</p>
                </div>
                <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm text-left">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">AI Photos Scanned</p>
                    <h3 className="text-2xl font-black text-blue-600 mt-1">{stats.uploads}</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-medium">From file uploads</p>
                </div>
                <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm text-left">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Client Logs</p>
                    <h3 className="text-2xl font-black text-teal-600 mt-1">{stats.leads}</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-medium">CRM state triggers</p>
                </div>
                <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm text-left">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Property Edits</p>
                    <h3 className="text-2xl font-black text-indigo-600 mt-1">{stats.properties}</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-medium font-sans">Listings updated</p>
                </div>
                <div className="col-span-2 lg:col-span-1 bg-white border border-slate-200 p-4 rounded-2xl shadow-sm text-left">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Config Saves</p>
                    <h3 className="text-2xl font-black text-amber-600 mt-1">{stats.systems}</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-medium">System preference steps</p>
                </div>
            </div>

            {/* Filter controls panel */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                
                {/* Search */}
                <div className="relative flex-1">
                    <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Filter activities by action, title, keyword or log ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500 shadow-inner"
                    />
                </div>

                {/* Dropdowns */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <FunnelIcon className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Type:</span>
                    </div>
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value as any)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-700 font-medium focus:outline-none focus:border-blue-500"
                    >
                        <option value="All">All Categories</option>
                        <option value="property">Properties</option>
                        <option value="lead">CRM Leads</option>
                        <option value="upload">AI Upload Scans</option>
                        <option value="settings">Settings / Preferences</option>
                        <option value="system">Systems Logs</option>
                    </select>

                    <select
                        value={userFilter}
                        onChange={(e) => setUserFilter(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-700 font-medium focus:outline-none focus:border-blue-500"
                    >
                        <option value="All">All Operators</option>
                        {usersList.map(u => (
                            <option key={u} value={u}>{u}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Confirm Clear Modal overlay background */}
            {showConfirmClear && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center border border-slate-100 animate-in zoom-in-95 duration-150">
                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mx-auto mb-4">
                            <TrashIcon className="w-6 h-6" />
                        </div>
                        <h3 className="text-base font-bold text-slate-900">Clear Activity logs?</h3>
                        <p className="text-xs text-slate-500 mt-2">Are you sure? This will wipe the local session audit trail memory completely. This cannot be undone.</p>
                        <div className="mt-6 flex justify-center gap-3">
                            <button 
                                onClick={() => setShowConfirmClear(false)}
                                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => {
                                    onClearLogs();
                                    setShowConfirmClear(false);
                                }}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold"
                            >
                                Clear All
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Timeline View */}
            {groupedLogs.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-sm">
                    <ClockIcon className="w-12 h-12 text-slate-300 mx-auto mb-4 stroke-1" />
                    <h3 className="text-base font-bold text-slate-800">No matching activity records</h3>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto mt-2">We couldn't find any log entry fitting your query filter parameters. Try checking your keyword queries.</p>
                </div>
            ) : (
                <div className="space-y-8 relative pl-2 lg:pl-4">
                    
                    {/* Vertical timeline line decor */}
                    <div className="absolute left-[21px] lg:left-[29px] top-6 bottom-6 w-0.5 bg-slate-200"></div>

                    {groupedLogs.map(([dateString, logArray]) => (
                        <div key={dateString} className="space-y-4">
                            
                            {/* Group Date Header */}
                            <div className="flex items-center gap-3 relative z-10">
                                <div className="w-2.5 h-2.5 rounded-full bg-slate-300 border-2 border-white ring-4 ring-slate-100 ml-[17px] lg:ml-[25px]"></div>
                                <h3 className="text-xs font-bold text-slate-500 tracking-wider uppercase font-sans">{dateString}</h3>
                            </div>

                            {/* Group Actions List */}
                            <div className="space-y-3.5 pl-8 lg:pl-10">
                                {logArray.map((log) => (
                                    <div 
                                        key={log.id} 
                                        className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex items-start gap-4 relative group"
                                        id={`log-row-${log.id}`}
                                    >
                                        {/* Colored circle around icon on timeline */}
                                        <div className="p-2.5 bg-slate-50 rounded-xl relative border border-slate-150 shadow-inner block">
                                            {getIcon(log.type)}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                                                <div className="flex items-center gap-2 flex-wrap text-left">
                                                    <h4 className="text-sm font-bold text-slate-900 leading-snug">
                                                        {highlightText(log.action, searchQuery)}
                                                    </h4>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border capitalize ${getBadgeStyle(log.type)}`}>
                                                        {log.type === 'settings' ? 'Preferences' : log.type}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium whitespace-nowrap self-start sm:self-center">
                                                    <ClockIcon className="w-3.5 h-3.5 text-slate-400" />
                                                    <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                                                </div>
                                            </div>

                                            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed text-left">
                                                {highlightText(log.details, searchQuery)}
                                            </p>

                                            {/* Subtitle/Metadata */}
                                            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-50 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                                                <span className="flex items-center gap-1">
                                                    <UserCircleIcon className="w-3.5 h-3.5 text-slate-300" />
                                                    <span>Operator: {log.user}</span>
                                                </span>
                                                <span>•</span>
                                                <span>ID: {log.id}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
