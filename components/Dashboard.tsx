
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
    CurrencyDollarIcon, 
    UserGroupIcon, 
    ArrowTrendingUpIcon, 
    MapPinIcon,
    EllipsisHorizontalIcon,
    PlusIcon,
    BuildingOfficeIcon,
    KeyIcon,
    ChevronRightIcon
} from '@heroicons/react/24/outline';
import { Property } from './LivePreview';
import { Lead } from './CRM';

interface DashboardProps {
    properties: Property[];
    leads: Lead[];
    onNavigate: (tab: string) => void;
    onAddProperty: () => void;
    onViewProperty: (property: Property) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
    properties, 
    leads, 
    onNavigate, 
    onAddProperty,
    onViewProperty
}) => {
    const [hoveredDataPoint, setHoveredDataPoint] = useState<{x: number, y: number, value: string, label: string} | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);
    
    // Calculate Stats
    const stats = useMemo(() => {
        const activeProperties = properties.filter(p => p.status === 'Active');
        const totalValue = activeProperties.reduce((acc, curr) => {
            const priceStr = curr.priceEstimate.split('-')[0].replace(/[^0-9.]/g, '');
            let val = parseFloat(priceStr);
            if (curr.priceEstimate.toUpperCase().includes('M')) val *= 1000000;
            else if (curr.priceEstimate.toUpperCase().includes('K')) val *= 1000;
            if (curr.priceEstimate.includes('/mo')) val = val * 12 * 20; 
            return acc + (val || 0);
        }, 0);

        const activeRentals = activeProperties.filter(p => p.type === 'Rent');
        const rentalRevenue = activeRentals.reduce((acc, curr) => {
            const priceStr = curr.priceEstimate.split('-')[0].replace(/[^0-9.]/g, '');
            return acc + (parseFloat(priceStr) || 0);
        }, 0);

        const activeSales = activeProperties.filter(p => p.type === 'Sale');
        const salesRevenue = activeSales.reduce((acc, curr) => {
            const priceStr = curr.priceEstimate.split('-')[0].replace(/[^0-9.]/g, '');
            let val = parseFloat(priceStr) || 0;
            if (curr.priceEstimate.toUpperCase().includes('M')) val *= 1000000;
            else if (curr.priceEstimate.toUpperCase().includes('K')) val *= 1000;
            return acc + val;
        }, 0);

        // assume standard 2.5% commission on listing sales, closing cycle estimated at 12 months average
        const salesRevenueMonthly = (salesRevenue * 0.025) / 12;

        const pendingNegotiationLeads = leads.filter(l => l.status === 'Negotiation');
        const avgActiveSalePrice = activeSales.length > 0 ? (salesRevenue / activeSales.length) : 650000;
        // assume leads under negotiation have a 60% probability of closing with a 2.5% commission, projected over 3 months
        const negotiationRevenueMonthly = pendingNegotiationLeads.length * (avgActiveSalePrice * 0.025 * 0.60) / 3;

        const monthlyProjectedRevenue = rentalRevenue + salesRevenueMonthly + negotiationRevenueMonthly;

        return {
            totalListings: properties.length,
            activeListings: activeProperties.length,
            totalLeads: leads.length,
            portfolioValue: totalValue,
            pendingDeals: pendingNegotiationLeads.length,
            monthlyProjectedRevenue,
            rentalRevenue,
            salesRevenueMonthly,
            negotiationRevenueMonthly
        };
    }, [properties, leads]);

    const formatCurrency = (value: number) => {
        if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
        return `$${value}`;
    };

    // Mock Chart Data Points
    const chartPoints = [
        { x: 0, y: 45, label: 'Jan', value: '$240k' },
        { x: 30, y: 25, label: 'Mar', value: '$450k' },
        { x: 60, y: 20, label: 'May', value: '$520k' },
        { x: 100, y: 5, label: 'Jul', value: '$680k' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-10">
            
            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard Overview</h1>
                    <p className="text-slate-500 mt-2 font-medium">Real-time insights into your real estate portfolio.</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={onAddProperty}
                        className="group flex items-center justify-center gap-2 px-3 py-2.5 sm:px-5 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-500/30 active:scale-95 hover:-translate-y-0.5 shrink-0"
                        title="New Listing"
                    >
                        <PlusIcon className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                        <span className="hidden sm:inline">New Listing</span>
                    </button>
                </div>
            </div>

            {/* Hero Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { 
                        label: 'Active Listings', 
                        value: stats.activeListings, 
                        sub: `/ ${stats.totalListings} total properties`, 
                        icon: BuildingOfficeIcon, 
                        color: 'purple', 
                        trend: 'Active',
                        target: 'listings' 
                    },
                    { 
                        label: 'Total Leads', 
                        value: stats.totalLeads, 
                        sub: 'Registered prospects', 
                        icon: UserGroupIcon, 
                        color: 'emerald', 
                        trend: '3 New',
                        target: 'crm' 
                    },
                    { 
                        label: 'Pending Negotiations', 
                        value: stats.pendingDeals, 
                        sub: 'High-intent pipeline', 
                        icon: ArrowTrendingUpIcon, 
                        color: 'amber', 
                        trend: 'In Progress',
                        target: 'crm' 
                    },
                    { 
                        label: 'Monthly Projected Revenue', 
                        value: formatCurrency(stats.monthlyProjectedRevenue), 
                        sub: `Rent: ${formatCurrency(stats.rentalRevenue)} | Sales: ${formatCurrency(stats.salesRevenueMonthly)}`, 
                        icon: CurrencyDollarIcon, 
                        color: 'blue', 
                        trend: 'Dynamic',
                        target: 'reports' 
                    }
                ].map((stat, idx) => (
                    <motion.button 
                        key={stat.label} 
                        onClick={() => onNavigate(stat.target)}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -4, scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        transition={{ duration: 0.4, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
                        className={`relative group text-left w-full border p-6 rounded-2xl shadow-sm transition-all duration-300 cursor-pointer overflow-hidden
                        ${stat.color === 'blue' ? 'bg-blue-50/80 border-blue-100 hover:bg-blue-50 hover:border-blue-300 hover:shadow-blue-500/20' : ''}
                        ${stat.color === 'purple' ? 'bg-purple-50/80 border-purple-100 hover:bg-purple-50 hover:border-purple-300 hover:shadow-purple-500/20' : ''}
                        ${stat.color === 'emerald' ? 'bg-emerald-50/80 border-emerald-100 hover:bg-emerald-50 hover:border-emerald-300 hover:shadow-emerald-500/20' : ''}
                        ${stat.color === 'amber' ? 'bg-amber-50/80 border-amber-100 hover:bg-amber-50 hover:border-amber-300 hover:shadow-amber-500/20' : ''}
                        `}
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-10 transition-opacity duration-500 transform translate-x-4 -translate-y-4">
                            <stat.icon className={`w-24 h-24 ${
                                stat.color === 'blue' ? 'text-blue-600/20' : ''
                            }${
                                stat.color === 'purple' ? 'text-purple-600/20' : ''
                            }${
                                stat.color === 'emerald' ? 'text-emerald-600/20' : ''
                            }${
                                stat.color === 'amber' ? 'text-amber-600/20' : ''
                            }`} />
                        </div>
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className={`p-2.5 bg-white rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-sm ring-1 ${
                                stat.color === 'blue' ? 'text-blue-600 ring-blue-100' : ''
                            }${
                                stat.color === 'purple' ? 'text-purple-600 ring-purple-100' : ''
                            }${
                                stat.color === 'emerald' ? 'text-emerald-600 ring-emerald-100' : ''
                            }${
                                stat.color === 'amber' ? 'text-amber-600 ring-amber-100' : ''
                            }`}>
                                 <stat.icon className="w-6 h-6" />
                            </div>
                            {stat.trend && (
                                <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full group-hover:bg-white ${
                                    stat.color === 'blue' ? 'text-blue-700 bg-blue-100/60' : ''
                                }${
                                    stat.color === 'purple' ? 'text-purple-700 bg-purple-100/60' : ''
                                }${
                                    stat.color === 'emerald' ? 'text-emerald-700 bg-emerald-100/60' : ''
                                }${
                                    stat.color === 'amber' ? 'text-amber-700 bg-amber-100/60' : ''
                                }`}>
                                    {stat.color === 'blue' && <ArrowTrendingUpIcon className="w-3 h-3" />}
                                    {stat.trend}
                                </span>
                            )}
                        </div>
                        <div className={`text-sm font-medium mb-1 relative z-10 ${
                            stat.color === 'blue' ? 'text-blue-900/60' : ''
                        }${
                            stat.color === 'purple' ? 'text-purple-900/60' : ''
                        }${
                            stat.color === 'emerald' ? 'text-emerald-900/60' : ''
                        }${
                            stat.color === 'amber' ? 'text-amber-900/60' : ''
                        }`}>{stat.label}</div>
                        <div className="flex items-baseline gap-2 relative z-10">
                            <div className={`text-2xl font-bold tracking-tight ${
                                stat.color === 'blue' ? 'text-blue-900' : ''
                            }${
                                stat.color === 'purple' ? 'text-purple-900' : ''
                            }${
                                stat.color === 'emerald' ? 'text-emerald-900' : ''
                            }${
                                stat.color === 'amber' ? 'text-amber-900' : ''
                            }`}>{stat.value}</div>
                            {stat.sub && (
                                <span className={`text-xs font-medium truncate max-w-full ${
                                    stat.color === 'blue' ? 'text-blue-700/80' : ''
                                }${
                                    stat.color === 'purple' ? 'text-purple-700/80' : ''
                                }${
                                    stat.color === 'emerald' ? 'text-emerald-700/80' : ''
                                }${
                                    stat.color === 'amber' ? 'text-amber-700/80' : ''
                                }`}>{stat.sub}</span>
                            )}
                        </div>
                    </motion.button>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Column: Charts & Listings */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* Performance Chart Section */}
                    <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300 relative group">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Sales Analytics</h3>
                                <p className="text-sm text-slate-500">Revenue performance over time</p>
                            </div>
                            <select className="bg-slate-50 border-transparent text-sm font-medium text-slate-600 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500/20 cursor-pointer hover:bg-slate-100 transition-colors outline-none">
                                <option>Last 6 Months</option>
                                <option>This Year</option>
                            </select>
                        </div>
                        
                        {/* Interactive SVG Area Chart */}
                        <div className="w-full h-72 relative">
                            {hoveredDataPoint && (
                                <div 
                                    className="absolute z-20 bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-xl pointer-events-none transform -translate-x-1/2 -translate-y-full mb-2 transition-all duration-200"
                                    style={{ left: `${hoveredDataPoint.x}%`, top: `${hoveredDataPoint.y}%` }}
                                >
                                    {hoveredDataPoint.value}
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 border-4 border-transparent border-t-slate-900"></div>
                                </div>
                            )}

                            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 50" preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                                    </linearGradient>
                                    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                                        <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#3b82f6" floodOpacity="0.2"/>
                                    </filter>
                                </defs>
                                {/* Grid Lines */}
                                {[10, 20, 30, 40].map(y => (
                                    <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#f1f5f9" strokeWidth="0.5" strokeDasharray="2 2" />
                                ))}
                                
                                {/* Smooth Curve */}
                                <path 
                                    d="M0,45 C15,42 20,35 30,25 S 50,30 60,20 S 80,10 100,5" 
                                    fill="none" 
                                    stroke="#3b82f6" 
                                    strokeWidth="2" 
                                    strokeLinecap="round"
                                    vectorEffect="non-scaling-stroke"
                                    filter="url(#shadow)"
                                    className="drop-shadow-sm"
                                />
                                {/* Area Fill */}
                                <path 
                                    d="M0,45 C15,42 20,35 30,25 S 50,30 60,20 S 80,10 100,5 L100,50 L0,50 Z" 
                                    fill="url(#chartGradient)" 
                                    className="opacity-0 animate-[fadeIn_1s_ease-out_forwards]"
                                />
                                
                                {/* Interactive Points */}
                                {chartPoints.map((point, i) => (
                                    <g key={i} onMouseEnter={() => setHoveredDataPoint(point)} onMouseLeave={() => setHoveredDataPoint(null)}>
                                        <circle 
                                            cx={point.x} 
                                            cy={point.y} 
                                            r="2" 
                                            className="fill-white stroke-blue-500 stroke-2 hover:r-4 hover:stroke-[3px] transition-all duration-300 cursor-pointer shadow-sm" 
                                        />
                                        <circle 
                                            cx={point.x} 
                                            cy={point.y} 
                                            r="8" 
                                            className="fill-transparent cursor-pointer" 
                                        />
                                    </g>
                                ))}
                            </svg>
                            
                            {/* X-Axis Labels */}
                            <div className="flex justify-between text-xs font-medium text-slate-400 mt-4 px-1">
                                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map(m => (
                                    <span key={m} className="hover:text-blue-600 transition-colors cursor-default">{m}</span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Recent Properties Horizontal Scroll */}
                    <div>
                        <div className="flex items-center justify-between mb-4 px-1">
                            <h3 className="text-lg font-bold text-slate-900">Recent Listings</h3>
                            <button 
                                onClick={() => onNavigate('listings')}
                                className="group flex items-center text-sm text-blue-600 hover:text-blue-700 font-bold transition-colors"
                            >
                                View All
                                <ChevronRightIcon className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                        <div className="flex gap-5 overflow-x-auto pb-6 scrollbar-hide snap-x px-1">
                            {properties.slice(0, 5).map((property, idx) => (
                                <motion.div 
                                    key={property.id}
                                    onClick={() => onViewProperty(property)}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    whileHover={{ y: -6, scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    transition={{ duration: 0.4, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                                    className="min-w-[280px] bg-white border border-slate-100 rounded-2xl overflow-hidden cursor-pointer hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 snap-start group"
                                >
                                    <div className="h-44 overflow-hidden relative">
                                        <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors z-10 duration-500" />
                                        <img 
                                            src={property.image} 
                                            alt={property.title} 
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
                                            loading="lazy"
                                        />
                                        <div className="absolute top-3 right-3 z-20">
                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide backdrop-blur-md shadow-sm border border-white/10 ${
                                                property.status === 'Active' ? 'bg-green-500/90 text-white' : 'bg-slate-500/90 text-white'
                                            }`}>
                                                {property.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-5">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-bold text-slate-900 truncate flex-1 group-hover:text-blue-600 transition-colors">{property.title}</h4>
                                        </div>
                                        <p className="text-sm text-slate-500 font-medium mb-3">{property.priceEstimate}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-semibold px-2 py-1 rounded bg-slate-100 text-slate-600 uppercase tracking-wide group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                                {property.type}
                                            </span>
                                            <span className="text-[10px] font-semibold px-2 py-1 rounded bg-slate-100 text-slate-600 uppercase tracking-wide group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                                {property.category}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            
                            {/* Add New Card */}
                            <div 
                                onClick={onAddProperty}
                                className="min-w-[280px] flex flex-col items-center justify-center bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-300 group snap-start"
                            >
                                <div className="p-4 bg-white rounded-full shadow-sm mb-3 group-hover:scale-110 group-hover:shadow-md group-hover:text-blue-600 text-slate-400 border border-slate-200 transition-all duration-300">
                                    <PlusIcon className="w-8 h-8" />
                                </div>
                                <span className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">Add Property</span>
                                <span className="text-xs text-slate-500 mt-1">Manual or AI Upload</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Schedule & Tasks */}
                <div className="space-y-8">
                    
                    {/* Schedule Widget */}
                    <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-lg font-bold text-slate-900">Today's Agenda</h3>
                            <button className="p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                                <EllipsisHorizontalIcon className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="space-y-8 relative before:absolute before:inset-y-0 before:left-2 before:w-0.5 before:bg-slate-100">
                            {/* Timeline Items */}
                            {[
                                { time: '09:00 AM', title: 'Client Meeting', subtitle: 'Starbucks, Downtown', icon: MapPinIcon, color: 'blue' },
                                { time: '11:30 AM', title: 'Open House', subtitle: 'Sunset Villa', icon: BuildingOfficeIcon, color: 'purple' },
                                { time: '02:00 PM', title: 'Contract Prep', subtitle: 'Tony Stark Listing', icon: null, color: 'slate' }
                            ].map((item, i) => (
                                <div key={i} className="relative pl-8 group cursor-default">
                                    <div className={`absolute left-0 top-1.5 w-4 h-4 rounded-full bg-white border-4 border-${item.color}-500 shadow-sm z-10 group-hover:scale-125 transition-transform duration-300`}></div>
                                    <div className={`mb-1 text-xs font-bold text-${item.color}-600 uppercase tracking-wide group-hover:translate-x-1 transition-transform`}>{item.time}</div>
                                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{item.title}</h4>
                                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                                        {item.icon && <item.icon className="w-3.5 h-3.5" />}
                                        {item.subtitle}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Market Pulse / Quick Stats */}
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 shadow-xl shadow-blue-500/20 text-white relative overflow-hidden group">
                        {/* Decorative Circles */}
                        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-colors duration-700"></div>
                        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors duration-700"></div>
                        
                        <h3 className="text-sm font-bold text-blue-100 uppercase tracking-wider mb-6 relative z-10">Market Pulse</h3>
                        <div className="space-y-6 relative z-10">
                            <div className="group/bar">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-blue-100 font-medium">Avg. Days on Market</span>
                                    <span className="text-lg font-bold">24 Days</span>
                                </div>
                                 <div className="w-full bg-black/20 rounded-full h-1.5 overflow-hidden">
                                    <div 
                                        className="h-full bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-1000 ease-out" 
                                        style={{ width: mounted ? '60%' : '0%' }}
                                    ></div>
                                </div>
                            </div>
                            <div className="group/bar">
                                <div className="flex items-center justify-between mb-2 pt-2">
                                    <span className="text-sm text-blue-100 font-medium">Conversion Rate</span>
                                    <span className="text-lg font-bold">3.2%</span>
                                </div>
                                <div className="w-full bg-black/20 rounded-full h-1.5 overflow-hidden">
                                    <div 
                                        className="h-full bg-indigo-300 rounded-full transition-all duration-1000 ease-out delay-150"
                                        style={{ width: mounted ? '32%' : '0%' }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={() => onNavigate('reports')}
                            className="w-full mt-8 py-3 bg-white hover:bg-blue-50 text-blue-600 rounded-xl text-xs font-bold uppercase tracking-wide transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 relative z-10"
                        >
                            View Full Report
                        </button>
                    </div>

                </div>
            </div>

            <style>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>
        </div>
    );
};
