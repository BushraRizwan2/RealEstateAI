/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useMemo } from 'react';
import { 
    UserIcon, 
    PhoneIcon, 
    EnvelopeIcon, 
    CurrencyDollarIcon,
    MagnifyingGlassIcon,
    PlusIcon,
    CheckCircleIcon,
    ClockIcon,
    XMarkIcon,
    DocumentTextIcon,
    ArrowDownTrayIcon,
    TrashIcon,
    UserPlusIcon,
    TagIcon,
    PaperAirplaneIcon,
    ChartPieIcon,
    ListBulletIcon,
    ViewColumnsIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export interface Lead {
    id: string;
    name: string;
    email: string;
    phone: string;
    status: 'New' | 'Contacted' | 'Qualified' | 'Negotiation' | 'Closed' | 'Lost';
    type: 'Buyer' | 'Seller' | 'Renter' | 'Landlord';
    budget: string;
    lastContact: Date;
    dateAdded: Date;
    avatar?: string;
    notes?: string;
    owner?: string;
}

interface CRMProps {
    leads: Lead[];
    onUpdateStatus: (id: string, status: Lead['status']) => void;
    onAddLead: (lead: Omit<Lead, 'id' | 'lastContact' | 'status' | 'dateAdded'>) => void;
    onUpdateNotes: (id: string, notes: string) => void;
    onBulkDelete?: (ids: string[]) => void;
    onBulkStatusChange?: (ids: string[], status: Lead['status']) => void;
    onBulkAssignOwner?: (ids: string[], owner: string) => void;
    agentName?: string;
}

export const CRM: React.FC<CRMProps> = ({ 
    leads, 
    onUpdateStatus, 
    onAddLead, 
    onUpdateNotes,
    onBulkDelete,
    onBulkStatusChange,
    onBulkAssignOwner,
    agentName
}) => {
    const [viewMode, setViewMode] = useState<'list' | 'analytics' | 'kanban'>('list');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('All');
    const [typeFilter, setTypeFilter] = useState<string>('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Selection State
    const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
    
    // Notes Modal State
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [noteContent, setNoteContent] = useState('');
    
    // Delete Confirmation State
    const [deleteConfirmation, setDeleteConfirmation] = useState<{ show: boolean, ids: string[] }>({ show: false, ids: [] });
    
    // Notification / Email Service State
    const [notification, setNotification] = useState<{show: boolean, title: string, message: string} | null>(null);

    // New Lead Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        type: 'Buyer' as Lead['type'],
        budget: '',
        owner: 'Auto'
    });

    // Compute active workload for each registered agent
    const activeLeadsByAgent = useMemo(() => {
        const list = [agentName || 'Agent Smith', 'Jane Doe', 'Alice Vance', 'Bob Miller'];
        return list.map(agent => {
            const openCount = leads.filter(l => l.owner === agent && l.status !== 'Closed' && l.status !== 'Lost').length;
            return { name: agent, openCount };
        });
    }, [leads, agentName]);

    const suggestedAgent = useMemo(() => {
        if (activeLeadsByAgent.length === 0) return null;
        const sorted = [...activeLeadsByAgent].sort((a, b) => a.openCount - b.openCount);
        return sorted[0];
    }, [activeLeadsByAgent]);

    const filteredLeads = leads.filter(lead => {
        const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              lead.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || lead.status === statusFilter;
        const matchesType = typeFilter === 'All' || lead.type === typeFilter;
        return matchesSearch && matchesStatus && matchesType;
    });

    useEffect(() => {
        setSelectedLeads(new Set());
    }, [searchTerm, statusFilter, typeFilter]);

    useEffect(() => {
        if (notification?.show) {
            const timer = setTimeout(() => {
                setNotification(prev => prev ? { ...prev, show: false } : null);
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const sendEmail = (to: string, subject: string, body: string) => {
        // Simulate API call to email service with detailed logging
        console.group('📧 Mock Email Service');
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(`Body: ${body}`);
        console.log(`Timestamp: ${new Date().toISOString()}`);
        console.groupEnd();

        setNotification({
            show: true,
            title: 'Email Sent Successfully',
            message: `Subject: ${subject} • To: ${to}`
        });
    };

    const getStatusColor = (status: Lead['status']) => {
        switch (status) {
            case 'New': return 'bg-sky-50 text-sky-700 border-sky-100 ring-sky-500/10'; 
            case 'Contacted': return 'bg-indigo-50 text-indigo-700 border-indigo-100 ring-indigo-500/10';
            case 'Qualified': return 'bg-purple-50 text-purple-700 border-purple-100 ring-purple-500/10';
            case 'Negotiation': return 'bg-amber-50 text-amber-700 border-amber-100 ring-amber-500/10';
            case 'Closed': return 'bg-emerald-50 text-emerald-700 border-emerald-100 ring-emerald-500/10';
            case 'Lost': return 'bg-rose-50 text-rose-700 border-rose-100 ring-rose-500/10';
            default: return 'bg-gray-50 text-gray-700 border-gray-100';
        }
    };

    const analyticsData = useMemo(() => {
        const statusCounts = leads.reduce((acc, lead) => {
            acc[lead.status] = (acc[lead.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        const statusData = ['New', 'Contacted', 'Qualified', 'Negotiation', 'Closed', 'Lost'].map(status => ({
            label: status,
            value: statusCounts[status] || 0,
            color: getStatusColor(status as Lead['status']).split(' ')[1].replace('text-', '')
        }));

        const typeCounts = leads.reduce((acc, lead) => {
            acc[lead.type] = (acc[lead.type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        const typeData = Object.entries(typeCounts).map(([label, value]) => ({ label, value }));

        const budgetBuckets = {
            'Rentals': 0,
            'Under $1M': 0,
            '$1M - $5M': 0,
            'Luxury $5M+': 0
        };

        leads.forEach(lead => {
            const b = lead.budget.toLowerCase();
            if (b.includes('/mo') || lead.type === 'Renter') {
                budgetBuckets['Rentals']++;
            } else {
                let val = parseFloat(b.replace(/[^0-9.]/g, ''));
                if (b.includes('k')) val *= 1000;
                if (b.includes('m')) val *= 1000000;
                
                if (!val) {
                     if (lead.type === 'Buyer') budgetBuckets['Under $1M']++;
                } else {
                    if (val < 1000000) budgetBuckets['Under $1M']++;
                    else if (val < 5000000) budgetBuckets['$1M - $5M']++;
                    else budgetBuckets['Luxury $5M+']++;
                }
            }
        });
        const budgetData = Object.entries(budgetBuckets).map(([label, value]) => ({ label, value }));

        return { statusData, typeData, budgetData };
    }, [leads]);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        let assignedOwner = formData.owner;
        let detailsMsg = '';
        if (assignedOwner === 'Auto') {
            assignedOwner = suggestedAgent ? suggestedAgent.name : (agentName || 'Agent Smith');
            detailsMsg = `Auto-assigned based on workload algorithm (${assignedOwner} has the lowest open workload of ${suggestedAgent ? suggestedAgent.openCount : 0} active leads).`;
        } else {
            const currentWorkload = leads.filter(l => l.owner === assignedOwner && l.status !== 'Closed' && l.status !== 'Lost').length;
            detailsMsg = `Manually assigned to ${assignedOwner} (workload: ${currentWorkload} active leads).`;
        }

        const newLead = {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            type: formData.type,
            budget: formData.budget,
            owner: assignedOwner,
            notes: detailsMsg
        };

        onAddLead(newLead);
        sendEmail(
            assignedOwner === (agentName || 'Agent Smith') ? 'admin@estateai.com' : 'agent@estateai.com', 
            'New Lead Assignment', 
            `A new ${formData.type} lead (${formData.name}) has been assigned to ${assignedOwner}. ${detailsMsg}`
        );
        setIsModalOpen(false);
        setFormData({ name: '', email: '', phone: '', type: 'Buyer', budget: '', owner: 'Auto' });
    };

    const openNoteModal = (lead: Lead) => {
        setEditingNoteId(lead.id);
        setNoteContent(lead.notes || '');
    };

    const handleSaveNote = () => {
        if (editingNoteId) {
            onUpdateNotes(editingNoteId, noteContent);
            setEditingNoteId(null);
            setNoteContent('');
        }
    };

    const handleStatusChange = (lead: Lead, newStatus: Lead['status']) => {
        onUpdateStatus(lead.id, newStatus);
        const recipient = lead.owner || 'Admin';
        sendEmail(recipient, `Lead Status Update: ${lead.name}`, `The status for ${lead.name} has been changed to ${newStatus}.`);
    };

    const handleDragStart = (e: React.DragEvent, leadId: string) => {
        e.dataTransfer.setData("leadId", leadId);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = (e: React.DragEvent, status: Lead['status']) => {
        e.preventDefault();
        const leadId = e.dataTransfer.getData("leadId");
        const lead = leads.find(l => l.id === leadId);
        if (lead && lead.status !== status) {
            handleStatusChange(lead, status);
        }
    };

    const handleExportCSV = () => {
        if (filteredLeads.length === 0) return;
        alert("Exporting CSV...");
    };

    const toggleSelectAll = () => {
        if (selectedLeads.size === filteredLeads.length) {
            setSelectedLeads(new Set());
        } else {
            setSelectedLeads(new Set(filteredLeads.map(l => l.id)));
        }
    };

    const toggleSelectLead = (id: string) => {
        const newSelected = new Set(selectedLeads);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedLeads(newSelected);
    };

    const handleDeleteClick = (id: string) => {
        setDeleteConfirmation({ show: true, ids: [id] });
    };

    const executeDelete = () => {
        if (onBulkDelete && deleteConfirmation.ids.length > 0) {
            onBulkDelete(deleteConfirmation.ids);
            setSelectedLeads(prev => {
                const newSet = new Set(prev);
                deleteConfirmation.ids.forEach(id => newSet.delete(id));
                return newSet;
            });
            setDeleteConfirmation({ show: false, ids: [] });
            setNotification({ show: true, title: 'Deleted', message: 'Leads deleted successfully.' });
        }
    };

    const handleBulkAction = (action: 'delete' | 'status' | 'owner', value?: string) => {
        if (selectedLeads.size === 0) return;
        const ids = Array.from(selectedLeads);
        
        if (action === 'delete') {
            setDeleteConfirmation({ show: true, ids });
        } else if (action === 'status' && onBulkStatusChange && value) {
            onBulkStatusChange(ids, value as Lead['status']);
            sendEmail('Admin', 'Bulk Status Update', `${ids.length} leads had their status updated to ${value}.`);
            setSelectedLeads(new Set());
        } else if (action === 'owner' && onBulkAssignOwner && value) {
            onBulkAssignOwner(ids, value);
            sendEmail(value, 'Bulk Lead Assignment', `${ids.length} leads have been assigned to you.`);
            setSelectedLeads(new Set());
        }
    };

    const kanbanColumns: Lead['status'][] = ['New', 'Contacted', 'Qualified', 'Negotiation', 'Closed', 'Lost'];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative h-full flex flex-col">
            
            {/* Notification Toast */}
            {notification && notification.show && (
                <div className="fixed bottom-8 right-8 z-[60] bg-white border border-slate-200 shadow-xl rounded-xl p-4 max-w-sm flex items-start gap-4 animate-in slide-in-from-right duration-300">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                        <PaperAirplaneIcon className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-slate-900">{notification.title}</h4>
                        <p className="text-xs text-slate-500 mt-1">{notification.message}</p>
                    </div>
                    <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-700">
                        <XMarkIcon className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirmation.show && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in zoom-in-95">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Lead{deleteConfirmation.ids.length > 1 ? 's' : ''}?</h3>
                            <p className="text-sm text-slate-500 mb-6">
                                Action cannot be undone.
                            </p>
                            <div className="flex gap-3 w-full">
                                <button onClick={() => setDeleteConfirmation({ show: false, ids: [] })} className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                                <button onClick={executeDelete} className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium text-white shadow-lg shadow-red-500/20">Delete</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Add Lead Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="text-lg font-bold text-slate-900">Add New Lead</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Full Name</label>
                                <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" placeholder="e.g. Jane Doe" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Email</label>
                                    <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 transition-all" placeholder="jane@example.com" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Phone</label>
                                    <input type="tel" name="phone" required value={formData.phone} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 transition-all" placeholder="(555) 000-0000" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Type</label>
                                    <select name="type" value={formData.type} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 transition-all">
                                        <option value="Buyer">Buyer</option>
                                        <option value="Seller">Seller</option>
                                        <option value="Renter">Renter</option>
                                        <option value="Landlord">Landlord</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Budget</label>
                                    <input type="text" name="budget" required value={formData.budget} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 transition-all" placeholder="$500k" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Assign Owner (Agent)</label>
                                <select name="owner" value={formData.owner} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 transition-all font-medium">
                                    <option value="Auto">✨ Auto-Assign (Suggested Agent)</option>
                                    {activeLeadsByAgent.map(agent => (
                                        <option key={agent.name} value={agent.name}>
                                            {agent.name} ({agent.openCount} active lead{agent.openCount === 1 ? '' : 's'})
                                        </option>
                                    ))}
                                </select>
                                {formData.owner === 'Auto' && suggestedAgent && (
                                    <div className="mt-2.5 p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 flex flex-col gap-1 animate-in slide-in-from-top-1 duration-200">
                                        <p className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                            Recommended Agent: <span className="font-bold">{suggestedAgent.name}</span>
                                        </p>
                                        <p className="text-[11px] text-emerald-600 leading-normal">
                                            This agent holds the lowest open workload with only <span className="font-bold">{suggestedAgent.openCount}</span> open lead{suggestedAgent.openCount === 1 ? '' : 's'}. Assigning ensures optimal broker response time.
                                        </p>
                                    </div>
                                )}
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
                                <button type="submit" className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl text-sm font-medium text-white shadow-lg shadow-blue-500/20 transition-all">Add Lead</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Note Editor Modal */}
            {editingNoteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="text-lg font-bold text-slate-900">Lead Notes</h3>
                            <button onClick={() => setEditingNoteId(null)} className="text-slate-400 hover:text-slate-600"><XMarkIcon className="w-6 h-6" /></button>
                        </div>
                        <div className="p-6">
                            <textarea value={noteContent} onChange={(e) => setNoteContent(e.target.value)} className="w-full h-48 bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-900 focus:outline-none focus:border-blue-500 resize-none mb-4" placeholder="Enter notes here..."></textarea>
                            <div className="flex justify-end gap-3">
                                <button onClick={() => setEditingNoteId(null)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                                <button onClick={handleSaveNote} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium text-white shadow-lg shadow-blue-500/20">Save Notes</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Header Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between shrink-0">
                <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                    <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}><ListBulletIcon className="w-5 h-5" /></button>
                    <button onClick={() => setViewMode('kanban')} className={`p-2 rounded-lg transition-all ${viewMode === 'kanban' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}><ViewColumnsIcon className="w-5 h-5" /></button>
                    <button onClick={() => setViewMode('analytics')} className={`p-2 rounded-lg transition-all ${viewMode === 'analytics' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}><ChartPieIcon className="w-5 h-5" /></button>
                </div>

                <div className="flex flex-col md:flex-row gap-4 flex-1 justify-end w-full md:w-auto">
                    {viewMode !== 'analytics' && (
                        <div className="relative w-full md:w-64">
                            <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input type="text" placeholder="Search leads..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 shadow-sm transition-all" />
                        </div>
                    )}
                    <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-slate-900/10">
                        <PlusIcon className="w-4 h-4" />
                        <span className="hidden md:inline">Add Lead</span>
                    </button>
                </div>
            </div>
            
            {/* View Content */}
            {viewMode === 'list' ? (
                <div className="overflow-auto flex-1 flex flex-col gap-6 pb-4">
                    {/* Stats Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
                        <div className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center gap-4 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
                            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center"><UserIcon className="w-6 h-6 text-blue-600" /></div>
                            <div><div className="text-2xl font-bold text-slate-900">{leads.length}</div><div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Total Leads</div></div>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center gap-4 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center"><CheckCircleIcon className="w-6 h-6 text-emerald-600" /></div>
                            <div><div className="text-2xl font-bold text-slate-900">{leads.filter(l => l.status === 'Closed').length}</div><div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Closed</div></div>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center gap-4 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
                            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center"><ClockIcon className="w-6 h-6 text-amber-600" /></div>
                            <div><div className="text-2xl font-bold text-slate-900">{leads.filter(l => l.status === 'Negotiation').length}</div><div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Negotiation</div></div>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center gap-4 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
                            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center"><CurrencyDollarIcon className="w-6 h-6 text-purple-600" /></div>
                            <div><div className="text-2xl font-bold text-slate-900">$4.2M</div><div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Value</div></div>
                        </div>
                    </div>

                    {/* Leads Table */}
                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex-1 shadow-sm">
                        <div className="overflow-x-auto h-full">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b border-slate-200 sticky top-0 z-10 backdrop-blur-sm">
                                    <tr>
                                        <th className="px-6 py-4 font-bold tracking-wider">Lead Name</th>
                                        <th className="px-6 py-4 font-bold tracking-wider">Contact</th>
                                        <th className="px-6 py-4 font-bold tracking-wider">Type</th>
                                        <th className="px-6 py-4 font-bold tracking-wider">Budget</th>
                                        <th className="px-6 py-4 font-bold tracking-wider">Date Added</th>
                                        <th className="px-6 py-4 font-bold tracking-wider">Assigned Agent</th>
                                        <th className="px-6 py-4 font-bold tracking-wider">Status</th>
                                        <th className="px-6 py-4 font-bold tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredLeads.map((lead) => (
                                        <tr key={lead.id} className="hover:bg-slate-50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-500 border border-slate-200">
                                                        {lead.name.charAt(0)}
                                                    </div>
                                                    <div className="font-semibold text-slate-900">{lead.name}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2 text-slate-500 text-xs">
                                                        <EnvelopeIcon className="w-3.5 h-3.5" /> {lead.email}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-slate-500 text-xs">
                                                        <PhoneIcon className="w-3.5 h-3.5" /> {lead.phone}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4"><span className="px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-600 border border-slate-200">{lead.type}</span></td>
                                            <td className="px-6 py-4 font-mono text-slate-700 font-medium">{lead.budget}</td>
                                            <td className="px-6 py-4 text-slate-500 font-medium">{new Date(lead.dateAdded).toLocaleDateString()}</td>
                                            <td className="px-6 py-4">
                                                <select 
                                                    value={lead.owner || 'Unassigned'} 
                                                    onChange={(e) => onBulkAssignOwner?.([lead.id], e.target.value)} 
                                                    className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-semibold focus:outline-none focus:border-blue-500 cursor-pointer hover:bg-slate-100 transition-colors"
                                                >
                                                    <option value="Unassigned">Unassigned</option>
                                                    {[agentName || 'Agent Smith', 'Jane Doe', 'Alice Vance', 'Bob Miller'].map(name => {
                                                        const count = leads.filter(l => l.owner === name && l.status !== 'Closed' && l.status !== 'Lost').length;
                                                        return (
                                                            <option key={name} value={name}>
                                                                {name} ({count} active)
                                                            </option>
                                                        );
                                                    })}
                                                </select>
                                            </td>
                                            <td className="px-6 py-4">
                                                <select value={lead.status} onChange={(e) => handleStatusChange(lead, e.target.value as Lead['status'])} className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${getStatusColor(lead.status)}`}>
                                                    {kanbanColumns.map(s => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => openNoteModal(lead)} className={`p-2 rounded-lg transition-colors ${lead.notes ? 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}><DocumentTextIcon className="w-5 h-5" /></button>
                                                    <button onClick={() => handleDeleteClick(lead.id)} className="text-slate-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"><TrashIcon className="w-5 h-5" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : viewMode === 'kanban' ? (
                <div className="flex-1 overflow-x-auto pb-6">
                    <div className="flex gap-6 min-w-max h-full px-2">
                        {kanbanColumns.map((status) => {
                             const columnLeads = filteredLeads.filter(l => l.status === status);
                             const colorClass = getStatusColor(status);
                             
                             return (
                                 <div key={status} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, status)} className="w-80 flex flex-col h-full bg-slate-100/50 rounded-2xl border border-slate-200">
                                     <div className="p-4 flex items-center justify-between sticky top-0 rounded-t-2xl z-10 bg-slate-100/50 backdrop-blur-sm">
                                         <div className="flex items-center gap-2">
                                             <div className={`w-2.5 h-2.5 rounded-full ${colorClass.includes('sky') ? 'bg-sky-500' : colorClass.includes('indigo') ? 'bg-indigo-500' : colorClass.includes('emerald') ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
                                             <h3 className="font-bold text-slate-800 text-sm">{status}</h3>
                                         </div>
                                         <span className="text-xs font-bold text-slate-400 bg-white px-2 py-0.5 rounded-md shadow-sm border border-slate-200">{columnLeads.length}</span>
                                     </div>
                                     <div className="p-3 space-y-3 flex-1 overflow-y-auto">
                                         {columnLeads.map(lead => (
                                             <div key={lead.id} draggable onDragStart={(e) => handleDragStart(e, lead.id)} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-grab active:cursor-grabbing group">
                                                 <div className="flex items-start justify-between mb-3">
                                                     <div className="flex items-center gap-3">
                                                         <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 border border-slate-300">
                                                             {lead.name.charAt(0)}
                                                         </div>
                                                         <div>
                                                             <h4 className="text-sm font-bold text-slate-900">{lead.name}</h4>
                                                             <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">{lead.type}</p>
                                                         </div>
                                                     </div>
                                                 </div>
                                                 <div className="space-y-1.5 mb-3 bg-slate-50 p-2.5 rounded-lg">
                                                     <div className="flex justify-between text-xs"><span className="text-slate-500">Budget</span><span className="text-slate-900 font-mono font-medium">{lead.budget}</span></div>
                                                     <div className="flex justify-between text-xs"><span className="text-slate-500">Last Contact</span><span className="text-slate-900">{new Date(lead.lastContact).toLocaleDateString()}</span></div>
                                                 </div>
                                                 <div className="flex justify-between items-center pt-2.5 border-t border-slate-100 text-xs">
                                                     <div className="flex items-center gap-1.5 text-slate-500 font-semibold select-none">
                                                         <span className="text-[11px] bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md flex items-center gap-1 text-slate-600">
                                                             👤 {lead.owner || 'Unassigned'}
                                                         </span>
                                                     </div>
                                                     <button onClick={() => openNoteModal(lead)} className={`text-slate-400 hover:text-blue-600 transition-colors ${lead.notes ? 'text-blue-500' : ''}`}><DocumentTextIcon className="w-4 h-4" /></button>
                                                 </div>
                                             </div>
                                         ))}
                                     </div>
                                 </div>
                             );
                        })}
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-500">
                    <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 mb-6">Pipeline Status</h3>
                        <div className="space-y-5">
                            {analyticsData.statusData.map((item) => (
                                <div key={item.label}>
                                    <div className="flex justify-between text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">
                                        <span>{item.label}</span>
                                        <span>{item.value}</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                        <div className={`h-full rounded-full bg-${item.color}-500`} style={{ width: `${leads.length > 0 ? (item.value / leads.length) * 100 : 0}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};