
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Hero'; 
import { PropertyUploader } from './components/InputArea'; 
import { ListingCard, PropertyDetailModal } from './components/LivePreview'; 
import { analyzeProperty, PropertyAnalysis } from './services/gemini';
import { CRM, Lead } from './components/CRM';
import { Dashboard } from './components/Dashboard';
import { Reports } from './components/Reports';
import { Settings } from './components/Settings';
import { ActivityLog, LogEntry } from './components/ActivityLog';
import { PlusIcon, MagnifyingGlassIcon, FunnelIcon, Cog6ToothIcon, SparklesIcon, CheckIcon, BellIcon, UserCircleIcon, XMarkIcon, PhotoIcon, TrashIcon, CameraIcon, HomeIcon, LockClosedIcon, Bars3Icon } from '@heroicons/react/24/outline';

export interface Property extends PropertyAnalysis {
  id: string;
  image: string;
  status: 'Active' | 'Pending' | 'Sold';
  dateAdded: Date;
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [properties, setProperties] = useState<Property[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | 'Sale' | 'Rent'>('All');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isShortcutsHelpOpen, setIsShortcutsHelpOpen] = useState(false);
  const [commandPaletteSearch, setCommandPaletteSearch] = useState('');
  const [draggedPropertyId, setDraggedPropertyId] = useState<string | null>(null);
  const [dragOverPropertyId, setDragOverPropertyId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Activity Logs State
  const [activityLogs, setActivityLogs] = useState<LogEntry[]>([
      {
          id: 'log-1',
          type: 'upload',
          action: 'AI Scan: Modern Sunset Villa',
          details: 'Successfully uploaded photo and parsed description, category, condition, and pricing estimates via Gemini-3.5-Flash model.',
          timestamp: new Date(Date.now() - 1000 * 60 * 12), // 12 min ago
          user: 'Agent Smith'
      },
      {
          id: 'log-2',
          type: 'lead',
          action: 'Lead Status Changed',
          details: 'Prospect Sarah Connor was progressed to Negotiation following a property viewing at Sunset Villa.',
          timestamp: new Date(Date.now() - 1000 * 60 * 120), // 2 hrs ago
          user: 'Agent Smith'
      },
      {
          id: 'log-3',
          type: 'property',
          action: 'Created Property Listing',
          details: 'Suburban Family Home listing was launched live on the portal.',
          timestamp: new Date(Date.now() - 1000 * 60 * 360), // 6 hrs ago
          user: 'Agent Smith'
      },
      {
          id: 'log-4',
          type: 'system',
          action: 'System Database Seeding',
          details: 'Loaded default portfolio lists including 6 properties and 4 crm lead profiles into the ERP.',
          timestamp: new Date(Date.now() - 1000 * 60 * 1440), // 1 day ago
          user: 'Senior Broker Engine'
      },
      {
          id: 'log-5',
          type: 'settings',
          action: 'Profile Photo Configured',
          details: 'Configured new professional profile avatar under Account Panel preferences.',
          timestamp: new Date(Date.now() - 1000 * 60 * 2880), // 2 days ago
          user: 'Agent Smith'
      }
  ]);

  // User & Profile State
  const [userAvatar, setUserAvatar] = useState<string | null>('https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80');
  const [agentName, setAgentName] = useState('Agent Smith');
  const [agentRole, setAgentRole] = useState('Senior Broker');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const commandPaletteInputRef = useRef<HTMLInputElement>(null);

  // Swipe gesture tracking for mobile view drawer navigation
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const deltaX = touchEndX - touchStartX.current;
    const deltaY = touchEndY - touchStartY.current;
    
    // Ensure gesture is horizontal and meets threshold (60px)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 60) {
      if (deltaX > 60) {
        // Swiped Right - Open the sidebar drawer menu
        setIsMobileMenuOpen(true);
      } else if (deltaX < -60) {
        // Swiped Left - Close the sidebar drawer menu
        setIsMobileMenuOpen(false);
      }
    }
    
    touchStartX.current = null;
    touchStartY.current = null;
  };

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setTimeout(() => {
        commandPaletteInputRef.current?.focus();
      }, 80);
    } else {
      setCommandPaletteSearch('');
    }
  }, [isCommandPaletteOpen]);

  // Authentication & Mock Login States
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [loginEmail, setLoginEmail] = useState('agent@estateai.com');
  const [loginPassword, setLoginPassword] = useState('••••••••');
  const [loginName, setLoginName] = useState('Agent Smith');
  const [loginRole, setLoginRole] = useState('Senior Broker');

  const handleSignOut = () => {
      setIsAuthenticated(false);
      logActivity('system', 'User Authentication', `Broker profile "${agentName}" successfully signed out of EstateAI.`);
  };

  const handleSignIn = (e: React.FormEvent) => {
      e.preventDefault();
      setAgentName(loginName);
      setAgentRole(loginRole);
      setIsAuthenticated(true);
      
      const newLog: LogEntry = {
          id: 'log-' + Math.random().toString(36).substring(2, 11),
          type: 'system',
          action: 'User Authentication',
          details: `Successfully authenticated custom profile for "${loginName}" with the role "${loginRole}".`,
          timestamp: new Date(),
          user: loginName
      };
      setActivityLogs(prev => [newLog, ...prev]);
  };

  const logActivity = (type: LogEntry['type'], action: string, details: string) => {
      const newLog: LogEntry = {
          id: 'log-' + Math.random().toString(36).substring(2, 11),
          type,
          action,
          details,
          timestamp: new Date(),
          user: agentName || 'Agent Smith'
      };
      setActivityLogs(prev => [newLog, ...prev]);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (activeEl) {
        const tagName = activeEl.tagName;
        const isContentEditable = (activeEl as HTMLElement).isContentEditable;
        if (
          tagName === 'INPUT' || 
          tagName === 'TEXTAREA' || 
          tagName === 'SELECT' || 
          isContentEditable
        ) {
          if (e.key === 'Escape') {
            setIsCommandPaletteOpen(false);
            setIsShortcutsHelpOpen(false);
            return;
          }
          if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            setIsCommandPaletteOpen(prev => !prev);
          }
          return;
        }
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
        return;
      }

      if (e.key === 'Escape') {
        setIsCommandPaletteOpen(false);
        setIsShortcutsHelpOpen(false);
        setSelectedProperty(null);
        setIsProfileOpen(false);
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'n':
          e.preventDefault();
          handleAddManualProperty();
          setActiveTab('listings');
          break;
        case 'd':
          e.preventDefault();
          setActiveTab('dashboard');
          break;
        case 'p':
          e.preventDefault();
          setActiveTab('listings');
          break;
        case 'c':
          e.preventDefault();
          setActiveTab('crm');
          break;
        case 'r':
          e.preventDefault();
          setActiveTab('reports');
          break;
        case 's':
          e.preventDefault();
          setActiveTab('settings');
          break;
        case 'a':
          e.preventDefault();
          setActiveTab('activity_log');
          break;
        case 'h':
        case '?':
          e.preventDefault();
          setIsShortcutsHelpOpen(prev => !prev);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [properties, leads, agentName]);

  // Notification State
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
      { id: 1, title: 'New Lead Assigned', message: 'Sarah Connor was assigned to you.', time: '2 min ago', unread: true, target: 'crm' },
      { id: 2, title: 'Price Update', message: 'Sunset Villa estimate increased by 5%.', time: '1 hr ago', unread: false, target: 'listings' },
      { id: 3, title: 'System', message: 'Monthly report is ready for download.', time: '4 hrs ago', unread: false, target: 'reports' },
  ]);

  // Seed Data
  useEffect(() => {
    if (properties.length === 0) {
        setProperties([
            {
                id: '1',
                title: 'Modern Sunset Villa',
                description: 'A stunning modern villa with panoramic sunset views, featuring floor-to-ceiling windows and an infinity pool.',
                priceEstimate: '$2.5M - $2.8M',
                type: 'Sale',
                category: 'House',
                amenities: ['Pool', 'Garage', 'Smart Home', 'Garden'],
                condition: 'New',
                status: 'Active',
                image: 'https://images.unsplash.com/photo-1600596542815-2495db9a9cf6?q=80&w=800&auto=format&fit=crop',
                dateAdded: new Date()
            },
            {
                id: '2',
                title: 'Downtown Loft Space',
                description: 'Industrial chic loft in the heart of the city. Exposed brick, high ceilings, and walking distance to transit.',
                priceEstimate: '$3,500/mo',
                type: 'Rent',
                category: 'Apartment',
                amenities: ['Elevator', 'Gym', 'Concierge'],
                condition: 'Excellent',
                status: 'Active',
                image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=800&auto=format&fit=crop',
                dateAdded: new Date()
            },
            {
                id: '3',
                title: 'Suburban Family Home',
                description: 'Cozy family residence with a large backyard and renovated kitchen.',
                priceEstimate: '$650k - $700k',
                type: 'Sale',
                category: 'House',
                amenities: ['Backyard', 'Fireplace', 'School District'],
                condition: 'Good',
                status: 'Pending',
                image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=800&auto=format&fit=crop',
                dateAdded: new Date()
            },
            {
                id: '4',
                title: 'Seaside Cottage',
                description: 'Charming 2-bedroom cottage with direct beach access and a large wrap-around porch.',
                priceEstimate: '$850k - $900k',
                type: 'Sale',
                category: 'House',
                amenities: ['Beach Access', 'Porch', 'Ocean View'],
                condition: 'Good',
                status: 'Active',
                image: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=800&auto=format&fit=crop',
                dateAdded: new Date()
            },
            {
                id: '5',
                title: 'Modern Tech Office',
                description: 'Open plan office space suitable for startups. High-speed internet infrastructure included.',
                priceEstimate: '$5,000/mo',
                type: 'Rent',
                category: 'Commercial',
                amenities: ['Meeting Rooms', 'Kitchen', 'Server Room'],
                condition: 'Excellent',
                status: 'Active',
                image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&auto=format&fit=crop',
                dateAdded: new Date()
            },
            {
                id: '6',
                title: 'Mountain Cabin',
                description: 'Secluded cabin in the woods. Perfect for getaways. Features a wood-burning stove.',
                priceEstimate: '$450k',
                type: 'Sale',
                category: 'House',
                amenities: ['Fireplace', 'Deck', 'Forest View'],
                condition: 'Fair',
                status: 'Sold',
                image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=800&auto=format&fit=crop',
                dateAdded: new Date()
            }
        ]);
    }

    if (leads.length === 0) {
        setLeads([
            { id: 'l1', name: 'Sarah Connor', email: 'sarah.c@example.com', phone: '+1 (555) 012-3456', status: 'Negotiation', type: 'Buyer', budget: '$1.5M - $2M', lastContact: new Date(Date.now() - 1000 * 60 * 60 * 2), dateAdded: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), notes: 'Interested in modern properties with high security.', owner: 'Jane Doe' },
            { id: 'l2', name: 'John Wick', email: 'j.wick@continental.com', phone: '+1 (555) 999-8888', status: 'New', type: 'Seller', budget: '$850k', lastContact: new Date(Date.now() - 1000 * 60 * 60 * 24), dateAdded: new Date(Date.now() - 1000 * 60 * 60 * 48), notes: 'Looking to sell quickly.', owner: 'Agent Smith' },
            { id: 'l3', name: 'Ellen Ripley', email: 'ripley@nostromo.inc', phone: '+1 (555) 426-1979', status: 'Qualified', type: 'Renter', budget: '$3,000/mo', lastContact: new Date(Date.now() - 1000 * 60 * 60 * 48), dateAdded: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10) },
            { id: 'l4', name: 'Tony Stark', email: 'tony@stark.com', phone: '+1 (555) 100-0001', status: 'Closed', type: 'Buyer', budget: '$15M+', lastContact: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), dateAdded: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30), notes: 'Requires helicopter pad.' }
        ]);
    }
  }, []);

  const handleUpload = async (file: File) => {
    setIsAnalyzing(true);
    try {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            const base64 = (reader.result as string).split(',')[1];
            try {
                const analysis = await analyzeProperty(base64, file.type);
                const newProperty: Property = {
                    ...analysis,
                    id: Date.now().toString(),
                    image: reader.result as string,
                    status: 'Active',
                    dateAdded: new Date()
                };
                setProperties(prev => [newProperty, ...prev]);
                logActivity('upload', 'AI Scan Completed', `Successfully uploaded "${file.name}" and generated draft listing: "${analysis.title}"`);
                setSelectedProperty(newProperty);
                setIsEditMode(true); 
                setActiveTab('listings');
            } catch (err) {
                console.error(err);
                alert("AI Analysis failed.");
            } finally {
                setIsAnalyzing(false);
            }
        };
    } catch (e) {
        setIsAnalyzing(false);
    }
  };

  const handleUpdateLeadStatus = (id: string, status: Lead['status']) => {
      setLeads(prev => prev.map(lead => {
          if (lead.id === id) {
              logActivity('lead', 'Lead Status Updated', `Prospect "${lead.name}" status was updated to "${status}"`);
              return { ...lead, status };
          }
          return lead;
      }));
  };

  const handleUpdateLeadNotes = (id: string, notes: string) => {
      setLeads(prev => prev.map(lead => {
          if (lead.id === id) {
              logActivity('lead', 'Lead Notes Appended', `Status journal/notes modified for prospect "${lead.name}"`);
              return { ...lead, notes };
          }
          return lead;
      }));
  };

  const handleRecordCommunication = (id: string, subject: string) => {
      setLeads(prev => prev.map(lead => {
          if (lead.id === id) {
              logActivity('lead', 'Email Template Sent', `Sent template email "${subject}" to "${lead.name}" (${lead.email}).`);
              return { ...lead, lastContact: new Date() };
          }
          return lead;
      }));
  };

  const handleAddLead = (leadData: Omit<Lead, 'id' | 'lastContact' | 'status' | 'dateAdded'>) => {
      const id = Date.now().toString();
      logActivity('lead', 'Created CRM Prospect', `Added new client lead profile for "${leadData.name}"`);
      setLeads(prev => [{ ...leadData, id, status: 'New', lastContact: new Date(), dateAdded: new Date() }, ...prev]);
  };

  const handleUpdateProperty = (updated: Property) => {
      setProperties(prev => {
          const exists = prev.some(p => p.id === updated.id);
          logActivity('property', exists ? 'Updated Listing Details' : 'Created Manual Listing', `Property listing for "${updated.title}" was ${exists ? 'updated with new details' : 'added live to portal'}`);
          return exists ? prev.map(p => p.id === updated.id ? updated : p) : [updated, ...prev];
      });
      setSelectedProperty(updated);
  };

  const handleReorderProperties = (draggedId: string, targetId: string) => {
      const draggedIndex = properties.findIndex(p => p.id === draggedId);
      const targetIndex = properties.findIndex(p => p.id === targetId);
      if (draggedIndex === -1 || targetIndex === -1 || draggedIndex === targetIndex) return;

      const reordered = [...properties];
      const [draggedItem] = reordered.splice(draggedIndex, 1);
      reordered.splice(targetIndex, 0, draggedItem);
      
      setProperties(reordered);
      logActivity('property', 'Properties Prioritized', `Broker updated portfolio ordering via drag and drop to highlight "${draggedItem.title}" at the top of the dashboard.`);
  };

  const handleAddManualProperty = () => {
      const newProperty: Property = { 
          id: Date.now().toString(), 
          title: 'New Listing', 
          description: 'Enter description...', 
          priceEstimate: '$0', 
          type: 'Sale', 
          category: 'House', 
          amenities: ['Feature 1'], 
          condition: 'New', 
          status: 'Active', 
          image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=800&auto=format&fit=crop', 
          dateAdded: new Date() 
      };
      logActivity('property', 'Created Listing Draft', 'Started manual entry draft details for a new listing form');
      setSelectedProperty(newProperty);
      setIsEditMode(true); 
  };

  const handleBulkDelete = (ids: string[]) => {
      logActivity('lead', 'CRM Bulk Lead Removal', `Purged ${ids.length} selected lead records from the database`);
      setLeads(prev => prev.filter(lead => !ids.includes(lead.id)));
  };

  const handleBulkStatusChange = (ids: string[], status: Lead['status']) => {
      logActivity('lead', 'CRM Bulk Status Update', `Transitioned ${ids.length} leads to status: "${status}"`);
      setLeads(prev => prev.map(lead => ids.includes(lead.id) ? { ...lead, status } : lead));
  };

  const handleBulkAssignOwner = (ids: string[], owner: string) => {
      logActivity('lead', 'CRM Bulk Owner Assignment', `Reassigned stewardship of ${ids.length} leads to "${owner}"`);
      setLeads(prev => prev.map(lead => ids.includes(lead.id) ? { ...lead, owner } : lead));
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setUserAvatar(reader.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  const handleRemoveAvatar = () => {
      setUserAvatar(null);
  };

  const handleNotificationClick = (id: number) => {
    const notif = notifications.find(n => n.id === id);
    if (notif) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
        if (notif.target) {
            setActiveTab(notif.target);
        }
    }
    setShowNotifications(false);
  };

  const filteredProperties = properties.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = typeFilter === 'All' || p.type === typeFilter;
    return matchesSearch && matchesFilter;
  });

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen bg-slate-50 items-center justify-center p-6 relative overflow-hidden font-sans">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -ml-32 -mb-32"></div>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 max-w-md w-full p-10 relative z-10 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 text-white mb-4">
              <HomeIcon className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-none mb-2">
              Estate<span className="text-blue-600">AI</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Enterprise ERP Portal</p>
          </div>

          <form onSubmit={handleSignIn} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Broker Name</label>
              <input
                type="text"
                required
                value={loginName}
                onChange={(e) => setLoginName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
                placeholder="Agent Smith"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Role / Designation</label>
              <select
                value={loginRole}
                onChange={(e) => setLoginRole(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-medium cursor-pointer"
              >
                <option value="Senior Broker">Senior Broker</option>
                <option value="Associate Agent">Associate Agent</option>
                <option value="Managing Director">Managing Director</option>
                <option value="Commercial Advisor">Commercial Advisor</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Workplace Email</label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
                placeholder="agent@estateai.com"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Credentials Code</label>
                <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-md">Passcode Optional</span>
              </div>
              <div className="relative">
                <LockClosedIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 transition-all active:scale-95 flex items-center justify-center gap-2 mt-4"
            >
              Sign In to Environment
            </button>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-5 text-center text-[11px] text-slate-400 leading-normal">
            For evaluation or mock sessions, select any values above to instantly seed your profile context safely.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden relative"
    >
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onSignOut={handleSignOut} 
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-20 border-b border-slate-200 bg-white/80 backdrop-blur-xl flex items-center justify-between px-4 sm:px-8 shrink-0 z-30 sticky top-0 gap-4">
            <div className="flex items-center gap-3 min-w-0">
                <button 
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="p-2 -ml-1 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors md:hidden cursor-pointer shrink-0"
                    title="Open Navigation Menu"
                >
                    <Bars3Icon className="w-6 h-6" />
                </button>
                <h2 className="text-lg sm:text-xl font-bold capitalize text-slate-800 tracking-tight truncate">
                    {activeTab === 'crm' ? 'Lead Management' : activeTab === 'listings' ? 'Property Portfolio' : activeTab === 'activity_log' ? 'Activity Log' : activeTab}
                </h2>
            </div>
            <div className="flex items-center gap-2 sm:gap-6 shrink-0">
                {activeTab !== 'dashboard' && activeTab !== 'reports' && activeTab !== 'settings' && (
                    <div className="relative group">
                        <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-blue-500 transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Filter active tab..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-slate-100/50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500 w-64 transition-all focus:bg-white focus:shadow-sm"
                        />
                    </div>
                )}
                
                <button 
                    onClick={() => setIsCommandPaletteOpen(true)}
                    className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 transition-all border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-700 cursor-pointer shadow-xs group"
                    title="Open Command Search Palette (⌘K or Ctrl+K)"
                >
                    <MagnifyingGlassIcon className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                    <span className="hidden sm:inline">Search / Commands</span>
                    <span className="bg-white border border-slate-300 text-[10px] text-slate-400 font-mono px-1.5 py-0.5 rounded-md shadow-2xs flex items-center gap-0.5 font-bold">
                        <span>⌘</span>K
                    </span>
                </button>

                <div className="h-6 w-px bg-slate-200"></div>
                
                {/* Notifications */}
                <div className="relative">
                    <button 
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`relative p-2 rounded-full hover:bg-slate-100 transition-colors ${showNotifications ? 'bg-blue-50 text-blue-600' : 'text-slate-500'}`}
                    >
                        <BellIcon className="w-6 h-6" />
                        {notifications.some(n => n.unread) && (
                            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                        )}
                    </button>
                    {showNotifications && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
                            <div className="absolute top-full right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                    <h3 className="font-bold text-slate-900 text-sm">Notifications</h3>
                                    <button onClick={() => setNotifications(prev => prev.map(n => ({...n, unread: false})))} className="text-xs text-blue-600 font-medium hover:text-blue-700">Mark all read</button>
                                </div>
                                <div className="max-h-64 overflow-y-auto">
                                    {notifications.length === 0 ? (
                                        <div className="p-8 text-center text-slate-400 text-sm">No new notifications</div>
                                    ) : (
                                        notifications.map(notification => (
                                            <div 
                                                key={notification.id} 
                                                onClick={() => handleNotificationClick(notification.id)}
                                                className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer ${notification.unread ? 'bg-blue-50/30' : ''}`}
                                            >
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className={`font-bold text-sm ${notification.unread ? 'text-blue-900' : 'text-slate-700'}`}>{notification.title}</span>
                                                    <span className="text-[10px] text-slate-400">{notification.time}</span>
                                                </div>
                                                <p className="text-xs text-slate-500">{notification.message}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* User Profile */}
                <div className="flex items-center gap-3 pl-2">
                    <div className="text-right hidden sm:block leading-tight">
                        <div className="text-sm font-bold text-slate-900">{agentName}</div>
                        <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">{agentRole}</div>
                    </div>
                    <div 
                        onClick={() => setIsProfileOpen(true)}
                        className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-md cursor-pointer hover:shadow-lg transition-all overflow-hidden hover:ring-2 hover:ring-blue-500/20"
                    >
                        {userAvatar ? (
                            <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600">
                                <UserCircleIcon className="w-6 h-6" />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-8 scroll-smooth relative z-0">
            {activeTab === 'dashboard' && (
                <Dashboard 
                    properties={properties} 
                    leads={leads} 
                    onNavigate={setActiveTab}
                    onAddProperty={handleAddManualProperty}
                    onViewProperty={(p) => { setSelectedProperty(p); setIsEditMode(false); }}
                />
            )}
            {activeTab === 'reports' && <Reports properties={properties} leads={leads} />}
            {activeTab === 'listings' && (
                <div className="animate-in fade-in duration-500 space-y-10 pb-12">
                     <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 shadow-xl shadow-blue-500/20 flex flex-col md:flex-row items-center gap-12 relative overflow-hidden text-white">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl -ml-20 -mb-20"></div>
                        
                        <div className="flex-1 space-y-4 relative z-10">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-white/20 backdrop-blur rounded-lg">
                                    <SparklesIcon className="w-6 h-6 text-blue-100" />
                                </div>
                                <h2 className="text-2xl font-extrabold tracking-tight">AI Listing Generator</h2>
                            </div>
                            <p className="text-blue-100 leading-relaxed text-lg max-w-xl font-medium">
                                Drag and drop property photos to instantly generate professional listings. Our AI analyzes amenities, condition, and value in seconds.
                            </p>
                            <div className="flex flex-wrap items-center gap-3 pt-2">
                                {['Auto-Description', 'Price Estimation', 'Amenity Detection'].map(feat => (
                                    <span key={feat} className="flex items-center gap-2 text-xs font-bold text-white bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                                        <CheckIcon className="w-3.5 h-3.5"/> {feat}
                                    </span>
                                ))}
                                <span className="flex items-center gap-2 text-xs font-bold text-blue-100 bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 shadow-inner animate-pulse">
                                    👋 Drag & drop listings below to reorder priority
                                </span>
                            </div>
                        </div>
                        <div className="w-full md:w-1/2 lg:w-5/12 relative z-10 h-64 bg-white/10 backdrop-blur-sm rounded-2xl p-2 border border-white/20">
                            <PropertyUploader onUpload={handleUpload} isAnalyzing={isAnalyzing} />
                        </div>
                    </div>

                     <div className="flex items-center justify-between">
                        <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                            {['All', 'Sale', 'Rent'].map((type) => (
                                <button 
                                    key={type}
                                    onClick={() => setTypeFilter(type as any)}
                                    className={`px-5 py-2 text-sm rounded-lg transition-all font-bold ${typeFilter === type ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
                                >
                                    {type === 'All' ? 'All Properties' : `For ${type}`}
                                </button>
                            ))}
                        </div>
                        <button 
                            onClick={handleAddManualProperty}
                            className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-sm font-bold transition-all shadow-sm hover:border-slate-300"
                        >
                            <PlusIcon className="w-4 h-4" />
                            <span>Manual Entry</span>
                        </button>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {filteredProperties.map((property) => {
                            const isDragged = property.id === draggedPropertyId;
                            const isDragOver = property.id === dragOverPropertyId;
                            return (
                                <div 
                                    key={property.id} 
                                    draggable
                                    onDragStart={(e) => {
                                        setDraggedPropertyId(property.id);
                                        e.dataTransfer.effectAllowed = "move";
                                        e.dataTransfer.setData("text/plain", property.id);
                                    }}
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        if (draggedPropertyId !== property.id) {
                                            setDragOverPropertyId(property.id);
                                        }
                                    }}
                                    onDragEnter={(e) => {
                                        e.preventDefault();
                                        if (draggedPropertyId !== property.id) {
                                            setDragOverPropertyId(property.id);
                                        }
                                    }}
                                    onDragLeave={() => {
                                        if (dragOverPropertyId === property.id) {
                                            setDragOverPropertyId(null);
                                        }
                                    }}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        const draggedId = e.dataTransfer.getData("text/plain") || draggedPropertyId;
                                        if (draggedId && draggedId !== property.id) {
                                            handleReorderProperties(draggedId, property.id);
                                        }
                                        setDraggedPropertyId(null);
                                        setDragOverPropertyId(null);
                                    }}
                                    onDragEnd={() => {
                                        setDraggedPropertyId(null);
                                        setDragOverPropertyId(null);
                                    }}
                                    className={`h-[420px] transition-all duration-300 relative group cursor-grab active:cursor-grabbing ${
                                        isDragged ? 'opacity-40 scale-95 duration-150 rotate-1' : ''
                                    } ${
                                        isDragOver ? 'border-2 border-dashed border-blue-500 bg-blue-50/10 rounded-2xl p-1 scale-102 ring-4 ring-blue-500/10 transition-all duration-150 shadow-md translate-y-[-4px]' : ''
                                    }`}
                                >
                                    {/* Drag Gripper Floating Indicator on Hover */}
                                    <div className="absolute top-4 left-1/2 -translate-x-1/2 -mt-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/80 backdrop-blur text-white py-1 px-2.5 rounded-lg text-[10px] font-bold flex items-center gap-1 z-30 shadow-md pointer-events-none tracking-wide">
                                        <span>⋮⋮</span> Drag to Prioritize
                                    </div>
                                    <ListingCard 
                                        data={property} 
                                        onClick={() => { setSelectedProperty(property); setIsEditMode(false); }}
                                        onEdit={() => { setSelectedProperty(property); setIsEditMode(true); }}
                                    />
                                </div>
                            );
                        })}
                     </div>
                </div>
            )}
            
            {activeTab === 'crm' && (
                <CRM 
                    leads={leads} 
                    onUpdateStatus={handleUpdateLeadStatus} 
                    onAddLead={handleAddLead} 
                    onUpdateNotes={handleUpdateLeadNotes}
                    onBulkDelete={handleBulkDelete}
                    onBulkStatusChange={handleBulkStatusChange}
                    onBulkAssignOwner={handleBulkAssignOwner}
                    onRecordCommunication={handleRecordCommunication}
                    agentName={agentName}
                    initialViewingLeadId={selectedLeadId}
                    onClearViewingLead={() => setSelectedLeadId(null)}
                />
            )}

            {activeTab === 'activity_log' && (
                <ActivityLog 
                    logs={activityLogs} 
                    onClearLogs={() => setActivityLogs([])} 
                    onAddMockActivities={() => {
                        setActivityLogs([
                            {
                                id: 'log-m1',
                                type: 'upload',
                                action: 'AI Scan: Beachside Cottage',
                                details: 'Processed photograph and generated high-converting Seaside Cottage description and amenity flags.',
                                timestamp: new Date(Date.now() - 1000 * 60 * 45),
                                user: agentName || 'Agent Smith'
                            },
                            {
                                id: 'log-m2',
                                type: 'lead',
                                action: 'Lead Assigned to Agent',
                                details: 'Assigned high-value lead Tony Stark to agent portfolio.',
                                timestamp: new Date(Date.now() - 1000 * 60 * 90),
                                user: 'Senior Broker Engine'
                            },
                            {
                                id: 'log-m3',
                                type: 'property',
                                action: 'Listing Price Negotiated',
                                details: 'Revisted the pricing estimate guidelines for the Downtown Loft Space.',
                                timestamp: new Date(Date.now() - 1000 * 60 * 180),
                                user: agentName || 'Agent Smith'
                            }
                        ]);
                    }}
                />
            )}

            {activeTab === 'settings' && (
                <Settings 
                    userAvatar={userAvatar}
                    setUserAvatar={setUserAvatar}
                    agentName={agentName}
                    setAgentName={setAgentName}
                    agentRole={agentRole}
                    setAgentRole={setAgentRole}
                    onLogActivity={logActivity}
                />
            )}
        </main>

        {selectedProperty && (
            <PropertyDetailModal 
                property={selectedProperty} 
                onClose={() => setSelectedProperty(null)} 
                onSave={handleUpdateProperty}
                initialEditMode={isEditMode || !properties.some(p => p.id === selectedProperty.id)}
            />
        )}

        {/* Profile Management Modal */}
        {isProfileOpen && (
             <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 relative">
                    <button onClick={() => setIsProfileOpen(false)} className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                    
                    <div className="p-8 flex flex-col items-center">
                        <div className="w-32 h-32 rounded-full ring-4 ring-slate-100 shadow-xl mb-6 overflow-hidden relative group bg-slate-100">
                             {userAvatar ? (
                                <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                                    <UserCircleIcon className="w-16 h-16" />
                                </div>
                            )}
                        </div>
                        
                        <h2 className="text-xl font-bold text-slate-900">{agentName}</h2>
                        <p className="text-sm text-slate-500 mb-8">{agentRole}</p>

                        <div className="w-full space-y-3">
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*"
                                onChange={handleAvatarFileChange} 
                            />
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                            >
                                <CameraIcon className="w-5 h-5" />
                                {userAvatar ? 'Replace Photo' : 'Upload Photo'}
                            </button>
                            
                            {userAvatar && (
                                <button 
                                    onClick={handleRemoveAvatar}
                                    className="w-full py-3 bg-white border border-slate-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-slate-600 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                                >
                                    <TrashIcon className="w-5 h-5" />
                                    Remove Photo
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Global Command Palette Search Modal */}
        {isCommandPaletteOpen && (
             <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 md:p-12 bg-slate-900/60 backdrop-blur-sm pt-[8vh] animate-in fade-in duration-150">
                 <div className="fixed inset-0" onClick={() => setIsCommandPaletteOpen(false)}></div>
                 <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[500px] animate-in slide-in-from-top-4 duration-200 relative z-10 font-sans">
                     
                     {/* Search bar row */}
                     <div className="p-4 border-b border-slate-100 flex items-center gap-3 shrink-0">
                         <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 shrink-0" />
                         <input 
                             type="text" 
                             ref={commandPaletteInputRef}
                             placeholder="Search listings, CRM leads, views, or settings..." 
                             value={commandPaletteSearch}
                             onChange={(e) => setCommandPaletteSearch(e.target.value)}
                             className="w-full text-base font-semibold text-slate-900 bg-transparent placeholder-slate-400 focus:outline-none focus:ring-0"
                         />
                         <button 
                             onClick={() => setIsCommandPaletteOpen(false)}
                             className="text-xs font-bold text-slate-400 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer shrink-0"
                         >
                             ESC
                         </button>
                     </div>

                     {/* Scrollable Results content */}
                     <div className="flex-1 overflow-y-auto p-4 space-y-5 min-h-0 bg-slate-50/10">
                         {commandPaletteSearch.trim() === '' ? (
                             <>
                                 {/* Navigation Shortcuts */}
                                 <div>
                                     <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">Jump to View</h3>
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-1 bg-slate-50/50 p-1.5 rounded-xl border border-slate-100">
                                         {[
                                             { key: 'D', label: '📊 Executive Dashboard', tab: 'dashboard' },
                                             { key: 'P', label: '🏠 Property Portfolio', tab: 'listings' },
                                             { key: 'C', label: '👥 Lead Management (CRM)', tab: 'crm' },
                                             { key: 'R', label: '📈 Reports & Analytics', tab: 'reports' },
                                             { key: 'S', label: '⚙️ Settings & Account', tab: 'settings' },
                                             { key: 'A', label: '📜 Activity Logs Panel', tab: 'activity_log' },
                                         ].map(item => (
                                             <button 
                                                 key={item.key}
                                                 onClick={() => {
                                                     setActiveTab(item.tab);
                                                     setIsCommandPaletteOpen(false);
                                                 }}
                                                 className="w-full text-left p-2.5 rounded-lg hover:bg-white hover:shadow-2xs border border-transparent hover:border-slate-100 transition-all flex items-center justify-between group cursor-pointer text-xs font-bold text-slate-750 hover:text-blue-600"
                                             >
                                                 <span>{item.label}</span>
                                                 <span className="bg-slate-200/60 group-hover:bg-blue-50 text-slate-500 group-hover:text-blue-600 border border-slate-200/40 rounded-md font-mono text-[10px] px-1.5 py-0.5 font-bold transition-colors shadow-3xs">{item.key}</span>
                                             </button>
                                         ))}
                                     </div>
                                 </div>

                                 {/* Quick Actions */}
                                 <div>
                                     <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">Instant Action Commands</h3>
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-1 bg-slate-50/50 p-1.5 rounded-xl border border-slate-100">
                                         <button 
                                             onClick={() => {
                                                 handleAddManualProperty();
                                                 setActiveTab('listings');
                                                 setIsCommandPaletteOpen(false);
                                             }}
                                             className="w-full text-left p-2.5 rounded-lg hover:bg-white hover:shadow-2xs border border-transparent hover:border-slate-100 transition-all flex items-center justify-between group cursor-pointer text-xs font-bold text-slate-750 hover:text-blue-600"
                                         >
                                             <span>➕ Create Manual Property Listing</span>
                                             <span className="bg-slate-200/60 group-hover:bg-blue-50 text-slate-500 group-hover:text-blue-600 border border-slate-200/40 rounded-md font-mono text-[10px] px-1.5 py-0.5 font-bold transition-colors shadow-3xs">N</span>
                                         </button>
                                         <button 
                                             onClick={() => {
                                                 setIsShortcutsHelpOpen(true);
                                                 setIsCommandPaletteOpen(false);
                                             }}
                                             className="w-full text-left p-2.5 rounded-lg hover:bg-white hover:shadow-2xs border border-transparent hover:border-slate-100 transition-all flex items-center justify-between group cursor-pointer text-xs font-bold text-slate-750 hover:text-blue-600"
                                         >
                                             <span>❓ Open Keyboard Shortcuts Guide</span>
                                             <span className="bg-slate-200/60 group-hover:bg-blue-50 text-slate-500 group-hover:text-blue-600 border border-slate-200/40 rounded-md font-mono text-[10px] px-1.5 py-0.5 font-bold transition-colors shadow-3xs">H</span>
                                         </button>
                                     </div>
                                 </div>
                             </>
                         ) : (() => {
                             const searchLower = commandPaletteSearch.toLowerCase().trim();
                             
                             // Search properties
                             const matchedProps = properties.filter(p => 
                                 p.title.toLowerCase().includes(searchLower) || 
                                 p.category.toLowerCase().includes(searchLower) ||
                                 p.description.toLowerCase().includes(searchLower)
                             );

                             // Search leads
                             const matchedLeads = leads.filter(l => 
                                 l.name.toLowerCase().includes(searchLower) || 
                                 l.email.toLowerCase().includes(searchLower) ||
                                 (l.notes && l.notes.toLowerCase().includes(searchLower))
                             );

                             // Search navigation tabs
                             const matchedTabs = [
                                 { name: '📊 Dashboard Index', keywords: 'dashboard stats graphs charts analytics log logs', tab: 'dashboard' },
                                 { name: '🏠 Property listings Portfolio', keywords: 'properties rentals listings house apartment buy rent sales values pricing uploader upload', tab: 'listings' },
                                 { name: '👥 CRM Lead Management', keywords: 'prospects contacts customers pipeline deals leads buyers sellers renter template emails', tab: 'crm' },
                                 { name: '📈 Financial Reports & Projections', keywords: 'charts reports analytics forecasting revenue projections commissions broker listings', tab: 'reports' },
                                 { name: '⚙️ Settings Configuration', keywords: 'settings configure account edit username agent broker role user avatar password profile logout', tab: 'settings' },
                                 { name: '📜 Full Activity Logs File', keywords: 'activity raw audit log trace event events logbook history database seed', tab: 'activity_log' },
                             ].filter(t => t.name.toLowerCase().includes(searchLower) || t.keywords.includes(searchLower));

                             const hasResults = matchedProps.length > 0 || matchedLeads.length > 0 || matchedTabs.length > 0;

                             if (!hasResults) {
                                 return (
                                     <div className="p-8 text-center text-slate-400 text-sm font-medium">
                                         No matching properties, CRM leads, or views found.
                                     </div>
                                 );
                             }

                             return (
                                 <div className="space-y-4">
                                     {/* Navigation matches */}
                                     {matchedTabs.length > 0 && (
                                         <div>
                                             <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-1.5">Matched Views</h4>
                                             <div className="space-y-1">
                                                 {matchedTabs.map(item => (
                                                     <button 
                                                         key={item.tab}
                                                         onClick={() => {
                                                             setActiveTab(item.tab);
                                                             setIsCommandPaletteOpen(false);
                                                         }}
                                                         className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer flex justify-between items-center"
                                                     >
                                                         <span>{item.name}</span>
                                                         <span className="text-[10px] text-slate-450 font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200 uppercase">navigate</span>
                                                     </button>
                                                 ))}
                                             </div>
                                         </div>
                                     )}

                                     {/* Property matches */}
                                     {matchedProps.length > 0 && (
                                         <div>
                                             <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-1.5">Matching Properties ({matchedProps.length})</h4>
                                             <div className="space-y-1">
                                                 {matchedProps.map(prop => (
                                                     <button 
                                                         key={prop.id}
                                                         onClick={() => {
                                                             setSelectedProperty(prop);
                                                             setIsEditMode(false);
                                                             setActiveTab('listings');
                                                             setIsCommandPaletteOpen(false);
                                                         }}
                                                         className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer flex justify-between items-center"
                                                     >
                                                         <div className="flex items-center gap-2">
                                                             <img src={prop.image} className="w-6 h-6 object-cover rounded-md border border-slate-200" referrerPolicy="no-referrer" />
                                                             <span>{prop.title}</span>
                                                         </div>
                                                         <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 font-mono font-bold">{prop.priceEstimate}</span>
                                                     </button>
                                                 ))}
                                             </div>
                                         </div>
                                     )}

                                     {/* Lead matches */}
                                     {matchedLeads.length > 0 && (
                                         <div>
                                             <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-1.5">Matching CRM Leads ({matchedLeads.length})</h4>
                                             <div className="space-y-1">
                                                 {matchedLeads.map(lead => (
                                                     <button 
                                                         key={lead.id}
                                                         onClick={() => {
                                                             setSelectedLeadId(lead.id);
                                                             setActiveTab('crm');
                                                             setIsCommandPaletteOpen(false);
                                                         }}
                                                         className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer flex justify-between items-center"
                                                     >
                                                         <div className="flex flex-col">
                                                             <span className="font-bold text-slate-900">{lead.name}</span>
                                                             <span className="text-[10px] text-slate-400 font-medium">{lead.email}</span>
                                                         </div>
                                                         <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 font-bold">{lead.status}</span>
                                                     </button>
                                                 ))}
                                             </div>
                                         </div>
                                     )}
                                 </div>
                             );
                         })()}
                     </div>

                     {/* Footer with helpful controls info */}
                     <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-semibold shrink-0">
                         <div className="flex items-center gap-1.5">
                             <span>Type keywords or search lists</span>
                             <span>•</span>
                             <span className="bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-3xs font-mono font-bold text-slate-550">ESC</span> to Exit
                         </div>
                         <div className="flex gap-4">
                             <div><strong>D, P, C, R, S, A</strong> navigate</div>
                             <div><strong>N</strong> manual new listing</div>
                         </div>
                     </div>
                 </div>
             </div>
        )}

        {/* Global Keyboard Shortcuts Cheat Sheet modal */}
        {isShortcutsHelpOpen && (
             <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
                 <div className="fixed inset-0" onClick={() => setIsShortcutsHelpOpen(false)}></div>
                 <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 relative z-10 font-sans p-6 text-slate-900">
                     <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
                         <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-1.5">
                             <span>⌨️ Keyboard Shortcuts Guide</span>
                         </h3>
                         <button 
                             onClick={() => setIsShortcutsHelpOpen(false)}
                             className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-full transition-colors cursor-pointer"
                         >
                             <XMarkIcon className="w-5 h-5" />
                         </button>
                     </div>

                     <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                         <div>
                             <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">Global Searches</h4>
                             <div className="space-y-2">
                                 <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                                     <span>Command Search Palette</span>
                                     <span className="bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded font-mono text-[10px] shadow-3xs font-bold font-mono">⌘ + K / Ctrl + K</span>
                                 </div>
                             </div>
                         </div>

                         <div className="border-t border-slate-100 pt-3">
                             <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">Jump to Tab View</h4>
                             <div className="space-y-2">
                                 {[
                                     { key: 'D', label: 'Executive Dashboard' },
                                     { key: 'P', label: 'Property Portfolio' },
                                     { key: 'C', label: 'Lead Management (CRM)' },
                                     { key: 'R', label: 'Reports & Analytics' },
                                     { key: 'S', label: 'Settings & Profiles' },
                                     { key: 'A', label: 'Activity Logs' },
                                 ].map(item => (
                                     <div key={item.key} className="flex items-center justify-between text-xs font-semibold text-slate-700">
                                         <span>{item.label}</span>
                                         <span className="bg-slate-100 border border-slate-200 w-6 h-6 flex items-center justify-center rounded font-mono text-[10px] shadow-3xs font-bold font-mono uppercase">{item.key}</span>
                                     </div>
                                 ))}
                             </div>
                         </div>

                         <div className="border-t border-slate-100 pt-3">
                             <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">Portfolio Actions</h4>
                             <div className="space-y-2">
                                 <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                                     <span>Create Manual Listing</span>
                                     <span className="bg-slate-100 border border-slate-200 w-6 h-6 flex items-center justify-center rounded font-mono text-[10px] shadow-3xs font-bold font-mono uppercase">N</span>
                                 </div>
                             </div>
                         </div>

                         <div className="border-t border-slate-100 pt-3">
                             <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">General Utilities</h4>
                             <div className="space-y-2">
                                 <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                                     <span>Help Guides / Legend</span>
                                     <span className="bg-slate-100 border border-slate-200 w-6 h-6 flex items-center justify-center rounded font-mono text-[10px] shadow-3xs font-bold font-mono">? / H</span>
                                 </div>
                                 <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                                     <span>Close Active Modal</span>
                                     <span className="bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded font-mono text-[10px] shadow-3xs font-bold font-mono">ESC</span>
                                 </div>
                             </div>
                         </div>
                     </div>

                     <button 
                         onClick={() => setIsShortcutsHelpOpen(false)}
                         className="w-full mt-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                     >
                         Got it, dismiss
                     </button>
                 </div>
             </div>
        )}
      </div>
    </div>
  );
};

export default App;
