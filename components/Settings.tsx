
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { 
    UserCircleIcon, 
    BellIcon, 
    BuildingOfficeIcon, 
    CreditCardIcon, 
    CheckCircleIcon,
    CameraIcon,
    TrashIcon,
    ShieldCheckIcon,
    ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

interface SettingsProps {
    userAvatar: string | null;
    setUserAvatar: (url: string | null) => void;
    agentName: string;
    setAgentName: (name: string) => void;
    agentRole: string;
    setAgentRole: (role: string) => void;
    onLogActivity?: (type: 'property' | 'lead' | 'upload' | 'system' | 'settings', action: string, details: string) => void;
}

export const Settings: React.FC<SettingsProps> = ({
    userAvatar,
    setUserAvatar,
    agentName,
    setAgentName,
    agentRole,
    setAgentRole,
    onLogActivity
}) => {
    const [activeSection, setActiveSection] = useState('general');
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Local State for non-global settings
    const [email, setEmail] = useState('agent.smith@estateai.com');
    const [bio, setBio] = useState('Top-performing broker with 10+ years of experience in luxury real estate markets.');
    const [agencyName, setAgencyName] = useState('Prestige Realty Group');
    const [agencyAddress, setAgencyAddress] = useState('123 Market St, Suite 400, San Francisco, CA');
    
    // Notification State
    const [notifSettings, setNotifSettings] = useState({
        emailLeads: true,
        emailStatus: true,
        pushLeads: true,
        pushMessages: false,
        marketing: false
    });

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setUserAvatar(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            setShowSuccess(true);
            if (onLogActivity) {
                onLogActivity('settings', 'Saved Profile Changes', `Applied settings and configuration updates for executive account: ${agentName} (${agentRole})`);
            }
            setTimeout(() => setShowSuccess(false), 3000);
        }, 800);
    };

    const Toggle = ({ label, checked, onChange }: { label: string, checked: boolean, onChange: () => void }) => (
        <div className="flex items-center justify-between py-4 border-b border-slate-100 last:border-0">
            <span className="text-sm font-medium text-slate-700">{label}</span>
            <button 
                onClick={onChange}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${checked ? 'bg-blue-600' : 'bg-slate-200'}`}
            >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Account Settings</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage your profile, preferences, and subscription.</p>
                </div>
                {showSuccess && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-bold animate-in fade-in slide-in-from-top-2">
                        <CheckCircleIcon className="w-5 h-5" />
                        Changes Saved!
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-6">
                
                {/* Horizontal Navigation */}
                <div className="flex overflow-x-auto pb-1 gap-2 border-b border-slate-200 scrollbar-hide">
                    {[
                        { id: 'general', label: 'General', icon: UserCircleIcon },
                        { id: 'notifications', label: 'Notifications', icon: BellIcon },
                        { id: 'agency', label: 'Agency', icon: BuildingOfficeIcon },
                        { id: 'billing', label: 'Billing', icon: CreditCardIcon },
                        { id: 'security', label: 'Security', icon: ShieldCheckIcon },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveSection(item.id)}
                            className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap flex-shrink-0 ${
                                activeSection === item.id 
                                ? 'border-blue-600 text-blue-600 bg-blue-50/40' 
                                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </button>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 relative overflow-hidden min-h-[500px]">
                    
                    {/* General Section */}
                    {activeSection === 'general' && (
                        <div className="space-y-8 animate-in fade-in duration-300">
                            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">Personal Information</h2>
                            
                            {/* Avatar */}
                            <div className="flex items-center gap-6">
                                <div className="w-24 h-24 rounded-full bg-slate-100 ring-4 ring-slate-50 overflow-hidden relative group">
                                    {userAvatar ? (
                                        <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <UserCircleIcon className="w-full h-full text-slate-300 p-2" />
                                    )}
                                    <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                        <CameraIcon className="w-8 h-8 text-white" />
                                        <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                                    </label>
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900">Profile Photo</h3>
                                    <p className="text-xs text-slate-500 mt-1 max-w-xs">Recommended: Square JPG, PNG, or GIF. Max 2MB.</p>
                                    <div className="flex gap-3 mt-3">
                                        <label className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors shadow-sm">
                                            Upload New
                                            <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                                        </label>
                                        <button onClick={() => setUserAvatar(null)} className="px-3 py-1.5 bg-white border border-red-100 text-red-600 rounded-lg text-xs font-bold hover:bg-red-50 transition-colors">
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Form Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Full Name</label>
                                    <input 
                                        type="text" 
                                        value={agentName}
                                        onChange={(e) => setAgentName(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Job Title</label>
                                    <input 
                                        type="text" 
                                        value={agentRole}
                                        onChange={(e) => setAgentRole(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Email Address</label>
                                    <input 
                                        type="email" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Bio / Signature</label>
                                    <textarea 
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        className="w-full h-24 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none" 
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Notifications Section */}
                    {activeSection === 'notifications' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">Notification Preferences</h2>
                            
                            <div className="space-y-1">
                                <h3 className="text-sm font-bold text-slate-900 mb-4">Email Alerts</h3>
                                <Toggle 
                                    label="New Lead Assigned" 
                                    checked={notifSettings.emailLeads} 
                                    onChange={() => setNotifSettings(p => ({...p, emailLeads: !p.emailLeads}))} 
                                />
                                <Toggle 
                                    label="Lead Status Changes" 
                                    checked={notifSettings.emailStatus} 
                                    onChange={() => setNotifSettings(p => ({...p, emailStatus: !p.emailStatus}))} 
                                />
                                <Toggle 
                                    label="Marketing & Newsletter" 
                                    checked={notifSettings.marketing} 
                                    onChange={() => setNotifSettings(p => ({...p, marketing: !p.marketing}))} 
                                />
                            </div>

                            <div className="pt-6 space-y-1">
                                <h3 className="text-sm font-bold text-slate-900 mb-4">Push Notifications</h3>
                                <Toggle 
                                    label="New Lead Alerts" 
                                    checked={notifSettings.pushLeads} 
                                    onChange={() => setNotifSettings(p => ({...p, pushLeads: !p.pushLeads}))} 
                                />
                                <Toggle 
                                    label="Direct Messages" 
                                    checked={notifSettings.pushMessages} 
                                    onChange={() => setNotifSettings(p => ({...p, pushMessages: !p.pushMessages}))} 
                                />
                            </div>
                        </div>
                    )}

                    {/* Agency Section */}
                    {activeSection === 'agency' && (
                         <div className="space-y-6 animate-in fade-in duration-300">
                            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">Agency Details</h2>
                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Agency Name</label>
                                    <input 
                                        type="text" 
                                        value={agencyName}
                                        onChange={(e) => setAgencyName(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Headquarters Address</label>
                                    <input 
                                        type="text" 
                                        value={agencyAddress}
                                        onChange={(e) => setAgencyAddress(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Agency Logo</label>
                                    <div className="flex items-center gap-4 p-4 border-2 border-dashed border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                                        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                                            <BuildingOfficeIcon className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">Upload Logo</p>
                                            <p className="text-xs text-slate-500">SVG, PNG, JPG (Max 800x400)</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Billing Section */}
                    {activeSection === 'billing' && (
                         <div className="space-y-6 animate-in fade-in duration-300">
                            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">Billing & Plan</h2>
                            
                            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-lg">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold">Enterprise Plan</h3>
                                        <p className="text-slate-400 text-sm">Active since Jan 2023</p>
                                    </div>
                                    <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide">Active</span>
                                </div>
                                <div className="flex items-end gap-2">
                                    <span className="text-3xl font-bold">$199</span>
                                    <span className="text-slate-400 mb-1">/ month</span>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wide">Payment Method</h3>
                                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-slate-50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-7 bg-white border border-slate-200 rounded flex items-center justify-center">
                                            <div className="w-3 h-3 rounded-full bg-red-500/80 -mr-1"></div>
                                            <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">Mastercard ending in 4242</p>
                                            <p className="text-xs text-slate-500">Expires 12/25</p>
                                        </div>
                                    </div>
                                    <button className="text-sm font-bold text-blue-600 hover:text-blue-700">Edit</button>
                                </div>
                            </div>

                             <div>
                                <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wide">Invoice History</h3>
                                <div className="border border-slate-200 rounded-xl overflow-hidden">
                                    {[
                                        { date: 'Oct 1, 2023', id: 'INV-2023-001', amount: '$199.00' },
                                        { date: 'Sep 1, 2023', id: 'INV-2023-002', amount: '$199.00' },
                                        { date: 'Aug 1, 2023', id: 'INV-2023-003', amount: '$199.00' },
                                    ].map((inv, i) => (
                                        <div key={i} className="flex justify-between items-center p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50">
                                            <div>
                                                <p className="text-sm font-medium text-slate-900">{inv.date}</p>
                                                <p className="text-xs text-slate-500">{inv.id}</p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-sm font-bold text-slate-700">{inv.amount}</span>
                                                <button className="p-1 text-slate-400 hover:text-blue-600"><ArrowDownTrayIcon className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Security Section Placeholder */}
                    {activeSection === 'security' && (
                        <div className="text-center py-12 animate-in fade-in duration-300">
                            <ShieldCheckIcon className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-slate-900">Security Settings</h3>
                            <p className="text-slate-500 max-w-sm mx-auto">Two-factor authentication and password management are managed by your SSO provider.</p>
                        </div>
                    )}

                    {/* Footer Actions */}
                    <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-3">
                        <button className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
                        <button 
                            onClick={handleSave}
                            disabled={isLoading}
                            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Saving...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};
