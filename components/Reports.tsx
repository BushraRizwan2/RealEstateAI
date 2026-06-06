/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useMemo } from 'react';
import { 
    DocumentArrowDownIcon, 
    ArrowDownTrayIcon, 
    CalendarIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    CurrencyDollarIcon,
    UserGroupIcon,
    BuildingOffice2Icon
} from '@heroicons/react/24/outline';
import { jsPDF } from 'jspdf';
import { Property } from '../App';
import { Lead } from './CRM';

interface ReportsProps {
    properties?: Property[];
    leads?: Lead[];
}

export const Reports: React.FC<ReportsProps> = ({ properties = [], leads = [] }) => {
    const [dateRange, setDateRange] = useState('Last 30 Days');

    // Default properties data list if empty
    const propertiesList = useMemo(() => {
        if (properties && properties.length > 0) return properties;
        return [
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
        ] as Property[];
    }, [properties]);

    // Default leads data list if empty
    const leadsList = useMemo(() => {
        if (leads && leads.length > 0) return leads;
        return [
            { id: 'l1', name: 'Sarah Connor', email: 'sarah.c@example.com', phone: '+1 (555) 012-3456', status: 'Negotiation', type: 'Buyer', budget: '$1.5M - $2M', lastContact: new Date(), dateAdded: new Date(), owner: 'Jane Doe' },
            { id: 'l2', name: 'John Wick', email: 'j.wick@continental.com', phone: '+1 (555) 999-8888', status: 'New', type: 'Seller', budget: '$850k', lastContact: new Date(), dateAdded: new Date(), owner: 'Agent Smith' },
            { id: 'l3', name: 'Ellen Ripley', email: 'ripley@nostromo.inc', phone: '+1 (555) 426-1979', status: 'Qualified', type: 'Renter', budget: '$3,000/mo', lastContact: new Date(), dateAdded: new Date() },
            { id: 'l4', name: 'Tony Stark', email: 'tony@stark.com', phone: '+1 (555) 100-0001', status: 'Closed', type: 'Buyer', budget: '$15M+', lastContact: new Date(), dateAdded: new Date(), notes: 'Requires helicopter pad.' }
        ] as Lead[];
    }, [leads]);

    const formatCurrency = (value: number) => {
        if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
        return `$${value}`;
    };

    // Calculate Dynamic Stats
    const stats = useMemo(() => {
        const activeProperties = propertiesList.filter(p => p.status === 'Active');
        
        const totalValue = activeProperties.reduce((acc, curr) => {
            const priceStr = curr.priceEstimate.split('-')[0].replace(/[^0-9.]/g, '');
            let val = parseFloat(priceStr);
            if (curr.priceEstimate.toUpperCase().includes('M')) val *= 1000000;
            else if (curr.priceEstimate.toUpperCase().includes('K')) val *= 1000;
            if (curr.priceEstimate.toLowerCase().includes('/mo')) val = val * 12 * 20; 
            return acc + (val || 0);
        }, 0);

        const saleProperties = propertiesList.filter(p => p.type === 'Sale');
        let avgSalePriceNumeric = 845000;
        if (saleProperties.length > 0) {
            const sumSale = saleProperties.reduce((acc, curr) => {
                const priceStr = curr.priceEstimate.split('-')[0].replace(/[^0-9.]/g, '');
                let val = parseFloat(priceStr);
                if (curr.priceEstimate.toUpperCase().includes('M')) val *= 1000000;
                else if (curr.priceEstimate.toUpperCase().includes('K')) val *= 1000;
                return acc + (val || 0);
            }, 0);
            avgSalePriceNumeric = sumSale / saleProperties.length;
        }

        return {
            totalRevenue: totalValue > 0 ? totalValue : 482500,
            totalLeads: leadsList.length,
            avgSalePrice: avgSalePriceNumeric
        };
    }, [propertiesList, leadsList]);

    // Inventory Category Breakdown
    const categoryPercentages = useMemo(() => {
        const categories = ['House', 'Apartment', 'Commercial', 'Land'] as const;
        const counts = propertiesList.reduce((acc, curr) => {
            const cat = curr.category;
            const mappedCat = (categories as readonly string[]).includes(cat) ? cat : 'House';
            acc[mappedCat] = (acc[mappedCat] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const total = propertiesList.length || 1;
        return categories.map(cat => ({
            category: cat,
            count: counts[cat] || 0,
            percentage: Math.round(((counts[cat] || 0) / total) * 100)
        }));
    }, [propertiesList]);

    // Generate and Download PDF Report
    const handlePDFExport = () => {
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        let currentPage = 1;
        let currentY = 15;

        // Custom function to check paging limits
        const checkPageBreak = (neededHeight: number) => {
            if (currentY + neededHeight > 265) {
                doc.addPage();
                currentPage++;
                
                // Write standard header on subsequent pages
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8);
                doc.setTextColor(148, 163, 184); // Slate 400
                doc.text('ESTATEAI PORTFOLIO ANALYSIS & MARKET INTELLIGENCE', 14, 12);
                doc.setDrawColor(226, 232, 240); // Slate 200
                doc.setLineWidth(0.3);
                doc.line(14, 14.5, 196, 14.5);
                
                currentY = 22;
            }
        };

        // --- PAGE 1: Branding Header & Metadata ---
        doc.setFillColor(37, 99, 235); // Blue 600
        doc.rect(14, 15, 8, 8, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(15, 23, 42); // Slate 900
        doc.text('EstateAI', 24, 21);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(100, 116, 139); // Slate 500
        doc.text('PORTFOLIO INTELLIGENCE & ANALYTICS', 196, 20.5, { align: 'right' });

        // Header divider
        doc.setDrawColor(203, 213, 225); // Slate 300
        doc.setLineWidth(0.5);
        doc.line(14, 25.5, 196, 25.5);

        // Document specs
        currentY = 32;
        doc.setFontSize(8.5);
        doc.setTextColor(71, 85, 105); // Slate 600
        doc.text(`Report Period: ${dateRange}`, 14, currentY);
        doc.text(`Date Generated: ${new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}`, 196, currentY, { align: 'right' });

        currentY += 4;
        doc.text(`Operator: Senior Broker Intelligence Engine`, 14, currentY);
        doc.text('Classification: Highly Confidential', 196, currentY, { align: 'right' });

        // Performance Metrics Cards Row
        currentY += 8;
        doc.setFillColor(248, 250, 252); // Slate 50
        doc.rect(14, currentY, 182, 22, 'F');
        doc.setDrawColor(226, 232, 240); // Slate 200
        doc.setLineWidth(0.3);
        doc.rect(14, currentY, 182, 22, 'S');

        // Total Portfolio Values
        doc.setFontSize(7.5);
        doc.setTextColor(100, 116, 139);
        doc.text('ACTIVE PORTFOLIO VALUE', 18, currentY + 6.5);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(37, 99, 235); // Blue 600
        doc.text(formatCurrency(stats.totalRevenue), 18, currentY + 14.5);

        // Saved Property counts
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(100, 116, 139);
        doc.text('TOTAL DECLARED LISTINGS', 82, currentY + 6.5);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(15, 23, 42); // Slate 900
        doc.text(`${propertiesList.length} Active System Listings`, 82, currentY + 14.5);

        // Registered CRM Leads
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(100, 116, 139);
        doc.text('CRM ASSIGNED LEADS', 142, currentY + 6.5);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(13, 148, 136); // Teal 600
        doc.text(`${stats.totalLeads} Sales Leads`, 142, currentY + 14.5);

        // Section 1: Inventory dynamics
        currentY += 30;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42);
        doc.text('I. Portfolio Inventory & Market Share Analysis', 14, currentY);
        currentY += 5;

        categoryPercentages.forEach((stat) => {
            checkPageBreak(7);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8.5);
            doc.setTextColor(71, 85, 105);
            doc.text(`${stat.category}`, 16, currentY + 4);
            
            doc.setFont('helvetica', 'bold');
            doc.text(`${stat.percentage}%  (${stat.count} properties)`, 65, currentY + 4);

            // Progress bar
            doc.setFillColor(241, 245, 249);
            doc.rect(98, currentY + 1.2, 85, 3.5, 'F');
            if (stat.percentage > 0) {
                doc.setFillColor(37, 99, 235);
                doc.rect(98, currentY + 1.2, (85 * stat.percentage) / 100, 3.5, 'F');
            }
            currentY += 6.5;
        });

        // Section 2: Property details table
        currentY += 5;
        checkPageBreak(25);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42);
        doc.text('II. Property Portfolio Registry Details', 14, currentY);
        currentY += 5.5;

        // Header
        doc.setFillColor(15, 23, 42); // Slate 900
        doc.rect(14, currentY, 182, 8, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(255, 255, 255);
        doc.text('Listing Title / Name', 18, currentY + 5.2);
        doc.text('Intent', 100, currentY + 5.2);
        doc.text('Category', 118, currentY + 5.2);
        doc.text('Valuation / Pricing', 142, currentY + 5.2);
        doc.text('Status', 174, currentY + 5.2);
        currentY += 8;

        // Details rows
        propertiesList.forEach((prop, idx) => {
            checkPageBreak(7.5);
            
            // Zebra striping
            if (idx % 2 === 0) {
                doc.setFillColor(248, 250, 252);
            } else {
                doc.setFillColor(255, 255, 255);
            }
            doc.rect(14, currentY, 182, 7, 'F');

            doc.setDrawColor(241, 245, 249);
            doc.line(14, currentY + 7, 196, currentY + 7);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7.5);
            doc.setTextColor(15, 23, 42);

            const safeTitle = doc.splitTextToSize(prop.title, 80)[0] || '';
            doc.text(safeTitle, 18, currentY + 4.5);
            doc.text(prop.type, 100, currentY + 4.5);
            doc.text(prop.category, 118, currentY + 4.5);
            doc.text(prop.priceEstimate, 142, currentY + 4.5);
            
            // Status marker
            if (prop.status === 'Active') {
                doc.setTextColor(22, 101, 52); // green-800
                doc.setFont('helvetica', 'bold');
            } else if (prop.status === 'Pending') {
                doc.setTextColor(180, 83, 9); // amber-700
                doc.setFont('helvetica', 'bold');
            } else {
                doc.setTextColor(71, 85, 105);
            }
            doc.text(prop.status, 174, currentY + 4.5);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(15, 23, 42);

            currentY += 7;
        });

        // Section 3: CRM Leads Details table
        currentY += 6;
        checkPageBreak(25);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42);
        doc.text('III. Assigned CRM Leads & Financial Intent', 14, currentY);
        currentY += 5.5;

        // Leads table header
        doc.setFillColor(71, 85, 105); // Slate 600
        doc.rect(14, currentY, 182, 8, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(255, 255, 255);
        doc.text('Prospect Name', 18, currentY + 5.2);
        doc.text('Contact Address', 65, currentY + 5.2);
        doc.text('Intent Type', 115, currentY + 5.2);
        doc.text('Capital Budget', 138, currentY + 5.2);
        doc.text('Workflow Status', 165, currentY + 5.2);
        currentY += 8;

        leadsList.forEach((lead, idx) => {
            checkPageBreak(7.5);

            if (idx % 2 === 0) {
                doc.setFillColor(248, 250, 252);
            } else {
                doc.setFillColor(255, 255, 255);
            }
            doc.rect(14, currentY, 182, 7, 'F');

            doc.setDrawColor(241, 245, 249);
            doc.line(14, currentY + 7, 196, currentY + 7);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7.5);
            doc.setTextColor(15, 23, 42);

            doc.text(lead.name, 18, currentY + 4.5);
            doc.text(lead.email || lead.phone || 'No Address', 65, currentY + 4.5);
            doc.text(lead.type, 115, currentY + 4.5);
            doc.text(lead.budget || 'N/A', 138, currentY + 4.5);
            doc.text(lead.status, 165, currentY + 4.5);

            currentY += 7;
        });

        // Loop pagination through all generated pages and write accurate footers
        const totalPages = currentPage;
        for (let idx = 1; idx <= totalPages; idx++) {
            doc.setPage(idx);
            
            // Footer divider
            doc.setDrawColor(226, 232, 240);
            doc.setLineWidth(0.3);
            doc.line(14, 280, 196, 280);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7.5);
            doc.setTextColor(148, 163, 184); // Slate 400

            doc.text(`Page ${idx} of ${totalPages}`, 98, 285, { align: 'center' });
            doc.text('Report generated by EstateAI Intelligence Engine', 14, 285);
            doc.text('Confidential - Restrict Distribution', 196, 285, { align: 'right' });
        }

        doc.save(`estateai_market_report_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    // Export raw data as robust CSV directly
    const handleCSVExport = () => {
        let csvContent = 'data:text/csv;charset=utf-8,';
        csvContent += 'ID,Property Title,Marketing Type,Category,Price Estimate,Status,Date Tagged\n';

        propertiesList.forEach((prop) => {
            const row = [
                prop.id,
                `"${prop.title.replace(/"/g, '""')}"`,
                prop.type,
                prop.category,
                `"${prop.priceEstimate}"`,
                prop.status,
                new Date(prop.dateAdded).toLocaleDateString()
            ].join(',');
            csvContent += row + '\n';
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `estate_inventory_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-12">
            
            {/* Header section with Export controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Market Intelligence & Reports</h1>
                    <p className="text-gray-500 text-sm mt-1">Comprehensive analytics on portfolio performance and market trends.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <CalendarIcon className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <select 
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="bg-white border border-gray-300 rounded-lg pl-9 pr-8 py-2 text-sm focus:outline-none focus:border-blue-500 appearance-none text-gray-700 shadow-sm"
                        >
                            <option>Last 7 Days</option>
                            <option>Last 30 Days</option>
                            <option>Last Quarter</option>
                            <option>Year to Date</option>
                        </select>
                    </div>
                    <button 
                        onClick={handlePDFExport}
                        className="flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2 border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold transition-all shadow-sm shrink-0"
                        id="btn-export-pdf"
                        title="Export PDF"
                    >
                        <DocumentArrowDownIcon className="w-5 h-5 text-blue-600" />
                        <span className="hidden sm:inline">Export PDF</span>
                    </button>
                    <button 
                        onClick={handleCSVExport}
                        className="flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all shadow-sm shrink-0"
                        id="btn-export-csv"
                        title="Export CSV"
                    >
                        <ArrowDownTrayIcon className="w-5 h-5" />
                        <span className="hidden sm:inline">Export CSV</span>
                    </button>
                </div>
            </div>

            {/* Executive Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm" id="card-total-revenue">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Total Portfolio Value</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats.totalRevenue)}</h3>
                        </div>
                        <div className="p-2 bg-green-100 rounded-lg">
                            <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-green-600">
                        <ArrowTrendingUpIcon className="w-3 h-3" />
                        <span>Portfolio estimation value based on active items</span>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm" id="card-lead-acquisition">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Active Leads</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.totalLeads} Leads</h3>
                        </div>
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <UserGroupIcon className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-blue-600">
                        <ArrowTrendingUpIcon className="w-3 h-3" />
                        <span>Current client advisory network density</span>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm" id="card-avg-sale-price">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Avg. Listing Price</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(Math.round(stats.avgSalePrice))}</h3>
                        </div>
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <BuildingOffice2Icon className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-emerald-600">
                        <ArrowTrendingUpIcon className="w-3 h-3" />
                        <span>Average pricing across all sales listings</span>
                    </div>
                </div>
            </div>

            {/* Detailed Analysis Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Market Inventory Stats */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm" id="sec-inventory-analysis">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Inventory Share Analysis</h3>
                    <div className="space-y-6">
                        {categoryPercentages.map((item) => (
                            <div className="space-y-2" key={item.category}>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 font-medium">{item.category} ({item.count})</span>
                                    <span className="text-gray-900 font-bold">{item.percentage}%</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full transition-all duration-500 ${
                                            item.category === 'House' ? 'bg-blue-500' :
                                            item.category === 'Apartment' ? 'bg-purple-500' :
                                            item.category === 'Commercial' ? 'bg-emerald-500' : 'bg-amber-500'
                                        }`} 
                                        style={{ width: `${item.percentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sales Velocity Table */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 overflow-hidden shadow-sm" id="sec-recent-activity">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Activity Registry</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase border-b border-gray-200 bg-gray-55">
                                <tr>
                                    <th className="pb-3 font-semibold text-slate-500">Property</th>
                                    <th className="pb-3 font-semibold text-slate-500">Type</th>
                                    <th className="pb-3 font-semibold text-slate-500 text-right">Value</th>
                                    <th className="pb-3 font-semibold text-slate-500 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {propertiesList.slice(0, 5).map((prop) => (
                                    <tr key={prop.id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="py-3 text-slate-900 font-bold max-w-[150px] truncate">
                                            {prop.title}
                                        </td>
                                        <td className="py-3 text-gray-500 font-medium">{prop.type} / {prop.category}</td>
                                        <td className="py-3 text-right font-mono text-slate-800 font-semibold">
                                            {prop.priceEstimate}
                                        </td>
                                        <td className="py-3 text-right">
                                            <span className={`text-[10px] uppercase tracking-wide font-bold px-2 py-0.5 rounded border ${
                                                prop.status === 'Active' ? 'bg-green-100 text-green-700 border-green-200' :
                                                prop.status === 'Pending' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                                'bg-slate-100 text-slate-600 border-slate-200'
                                            }`}>
                                                {prop.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Generated Footer */}
            <div className="pt-8 border-t border-gray-200 text-center text-xs text-gray-400">
                <p>Report generated by EstateAI Intelligence Engine on {new Date().toLocaleDateString()}</p>
                <p className="mt-1">Confidential - For Internal Use Only</p>
            </div>
        </div>
    );
};
