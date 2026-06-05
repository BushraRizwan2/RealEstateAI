
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { MapPinIcon, HomeIcon, CurrencyDollarIcon, TagIcon, XMarkIcon, CalendarIcon, CheckBadgeIcon, PencilSquareIcon, CheckIcon, PlusIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { PropertyAnalysis } from '../services/gemini';

// Interface matching the Property type in App.tsx
export interface Property extends PropertyAnalysis {
  id: string;
  image: string;
  status: 'Active' | 'Pending' | 'Sold';
  dateAdded: Date;
}

interface ListingCardProps {
  data: Property;
  onClick?: () => void;
  onEdit?: () => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({ data, onClick, onEdit }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div 
        onClick={onClick}
        className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300 group shadow-sm cursor-pointer flex flex-col h-full relative"
    >
      {/* Image Header */}
      <div className="relative h-56 overflow-hidden bg-slate-100 shrink-0">
        <div className={`absolute inset-0 bg-slate-200 animate-pulse transition-opacity duration-500 ${isLoaded ? 'opacity-0' : 'opacity-100'}`} />
        
        <img 
            src={data.image} 
            alt={data.title} 
            loading="lazy"
            decoding="async"
            onLoad={() => setIsLoaded(true)}
            className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out ${isLoaded ? 'opacity-100' : 'opacity-0'}`} 
        />
        
        <div className="absolute top-4 left-4 z-10 flex gap-2">
            <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide border shadow-sm backdrop-blur-md ${
                data.status === 'Active' ? 'bg-green-500/90 text-white border-green-500/20' :
                data.status === 'Pending' ? 'bg-amber-500/90 text-white border-amber-500/20' :
                'bg-slate-500/90 text-white border-slate-500/20'
            }`}>
                {data.status}
            </span>
        </div>

        <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    if(onEdit) onEdit();
                }}
                className="p-2.5 bg-white hover:bg-blue-600 text-slate-700 hover:text-white rounded-xl backdrop-blur-md shadow-lg transition-colors border border-slate-100"
                title="Edit Listing"
            >
                <PencilSquareIcon className="w-4 h-4" />
            </button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-900/80 to-transparent flex gap-2 pt-12">
            <span className="px-2 py-1 bg-white/20 backdrop-blur-md rounded-lg text-[10px] font-bold text-white uppercase tracking-wide border border-white/10">
                {data.category}
            </span>
             <span className="px-2 py-1 bg-blue-600/80 backdrop-blur-md rounded-lg text-[10px] font-bold text-white uppercase tracking-wide border border-blue-400/20">
                {data.type}
            </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="mb-2">
            <h3 className="text-slate-900 font-bold text-lg truncate group-hover:text-blue-600 transition-colors">{data.title}</h3>
        </div>
        
        <div className="flex items-center text-slate-800 font-bold text-lg mb-4 font-mono">
            {data.priceEstimate}
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
            {data.amenities.slice(0, 3).map((amenity, i) => (
                <span key={i} className="text-[10px] px-2 py-1 rounded-md bg-slate-50 text-slate-600 border border-slate-200 font-medium">
                    {amenity}
                </span>
            ))}
            {data.amenities.length > 3 && (
                <span className="text-[10px] px-2 py-1 rounded-md bg-slate-50 text-slate-400 border border-slate-200 font-medium">
                    +{data.amenities.length - 3}
                </span>
            )}
        </div>

        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium">
            <div className="flex items-center">
                <MapPinIcon className="w-3.5 h-3.5 mr-1" />
                <span>Downtown</span>
            </div>
            <div className="flex items-center">
                <TagIcon className="w-3.5 h-3.5 mr-1" />
                {data.condition}
            </div>
        </div>
      </div>
    </div>
  );
};

interface PropertyDetailModalProps {
    property: Property;
    onClose: () => void;
    onSave?: (updatedProperty: Property) => void;
    initialEditMode?: boolean;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({ property, onClose, onSave, initialEditMode = false }) => {
    const [isEditing, setIsEditing] = useState(initialEditMode);
    const [formData, setFormData] = useState<Property>(property);
    const [imageLoaded, setImageLoaded] = useState(false);
    
    // Gallery State
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [galleryImages, setGalleryImages] = useState<string[]>([]);

    useEffect(() => {
        setFormData(property);
        setIsEditing(initialEditMode);
        
        // Mock gallery generation since we only have single images in DB
        // In a real app, this would come from property.images array
        const mockGallery = [
            property.image,
            'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=800&q=80', // Living Room
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80', // Kitchen
            'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80', // Bedroom
            'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80'  // Bathroom/Other
        ];
        setGalleryImages(mockGallery);
        setActiveImageIndex(0);
        setImageLoaded(false);
    }, [property, initialEditMode]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        if (onSave) onSave(formData);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setFormData(property);
        setIsEditing(false);
    }

    const handleAmenityChange = (index: number, value: string) => {
        const newAmenities = [...formData.amenities];
        newAmenities[index] = value;
        setFormData(prev => ({ ...prev, amenities: newAmenities }));
    };

    const handleAddAmenity = () => setFormData(prev => ({ ...prev, amenities: [...prev.amenities, ""] }));
    const handleRemoveAmenity = (index: number) => setFormData(prev => ({ ...prev, amenities: prev.amenities.filter((_, i) => i !== index) }));

    const nextImage = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (galleryImages.length <= 1) return;
        setImageLoaded(false);
        setActiveImageIndex((prev) => (prev + 1) % galleryImages.length);
    };

    const prevImage = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (galleryImages.length <= 1) return;
        setImageLoaded(false);
        setActiveImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-6xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-300 relative border border-slate-200/50">
                
                <button onClick={onClose} className="absolute top-5 right-5 z-40 p-2.5 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-colors">
                    <XMarkIcon className="w-5 h-5" />
                </button>

                {/* Hero Image / Gallery Section */}
                <div className="w-full md:w-1/2 h-80 md:h-auto bg-slate-900 relative group overflow-hidden flex flex-col">
                    <div className="relative flex-1 overflow-hidden bg-slate-900">
                        {galleryImages.length > 0 ? (
                            <img 
                                src={galleryImages[activeImageIndex]} 
                                alt={formData.title} 
                                className={`w-full h-full object-cover transition-opacity duration-500 ease-in-out ${imageLoaded ? 'opacity-100' : 'opacity-50'}`}
                                onLoad={() => setImageLoaded(true)}
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
                                <PhotoIcon className="w-16 h-16 mb-2 opacity-50" />
                                <span className="text-sm">No images available</span>
                            </div>
                        )}
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent z-10 pointer-events-none"></div>

                        {/* Navigation Controls */}
                        {galleryImages.length > 1 && (
                            <>
                                <button 
                                    onClick={prevImage}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all z-20"
                                >
                                    <ChevronLeftIcon className="w-6 h-6" />
                                </button>
                                <button 
                                    onClick={nextImage}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all z-20"
                                >
                                    <ChevronRightIcon className="w-6 h-6" />
                                </button>
                            </>
                        )}
                        
                        {/* Title Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-8 z-20 text-white pointer-events-none">
                            <div className="flex items-center gap-2 mb-3 pointer-events-auto">
                                {isEditing ? (
                                    <div className="flex gap-2">
                                        <select name="status" value={formData.status} onChange={handleInputChange} className="bg-white/90 text-slate-900 text-xs font-bold rounded-lg px-2 py-1 outline-none border-none focus:ring-2 focus:ring-blue-500">
                                            <option value="Active">Active</option>
                                            <option value="Pending">Pending</option>
                                            <option value="Sold">Sold</option>
                                        </select>
                                        <select name="type" value={formData.type} onChange={handleInputChange} className="bg-white/90 text-slate-900 text-xs font-bold rounded-lg px-2 py-1 outline-none border-none focus:ring-2 focus:ring-blue-500">
                                            <option value="Sale">For Sale</option>
                                            <option value="Rent">For Rent</option>
                                        </select>
                                    </div>
                                ) : (
                                    <>
                                        <span className={`px-3 py-1 backdrop-blur-md rounded-lg text-xs font-bold uppercase tracking-wide border border-white/20 ${formData.status === 'Active' ? 'bg-green-500/80' : 'bg-slate-500/80'}`}>{formData.status}</span>
                                        <span className="px-3 py-1 bg-blue-600/80 backdrop-blur-md rounded-lg text-xs font-bold uppercase tracking-wide border border-white/20">{formData.type === 'Sale' ? 'For Sale' : 'For Rent'}</span>
                                    </>
                                )}
                            </div>
                            
                            {isEditing ? (
                                <input type="text" name="title" value={formData.title} onChange={handleInputChange} className="w-full bg-black/40 border border-white/30 rounded-xl px-4 py-2 text-3xl font-extrabold text-white mb-2 backdrop-blur-md pointer-events-auto focus:outline-none focus:border-blue-500 placeholder-white/50" placeholder="Property Title" />
                            ) : (
                                <h2 className="text-3xl font-extrabold text-white mb-2 leading-tight shadow-sm drop-shadow-md">{formData.title}</h2>
                            )}
                            
                            <div className="flex items-center text-white/90 font-mono text-xl pointer-events-auto">
                                {isEditing ? (
                                    <div className="flex items-center gap-2 bg-black/40 border border-white/30 rounded-lg px-3 py-1 backdrop-blur-md">
                                        <span className="text-slate-300 text-sm">Price:</span>
                                        <input type="text" name="priceEstimate" value={formData.priceEstimate} onChange={handleInputChange} className="bg-transparent border-none text-white w-40 focus:outline-none font-mono" placeholder="$0.00" />
                                    </div>
                                ) : (
                                    <span className="drop-shadow-sm">{formData.priceEstimate}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Thumbnail Gallery Strip */}
                    {galleryImages.length > 1 && (
                        <div className="h-24 bg-slate-900/50 backdrop-blur-xl border-t border-white/10 flex items-center gap-3 px-6 overflow-x-auto scrollbar-hide z-30">
                            {galleryImages.map((img, idx) => (
                                <button 
                                    key={idx} 
                                    onClick={() => { setActiveImageIndex(idx); setImageLoaded(false); }}
                                    className={`relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 transition-all border-2 ${activeImageIndex === idx ? 'border-blue-500 scale-105 opacity-100 ring-2 ring-blue-500/50' : 'border-transparent opacity-60 hover:opacity-100 hover:border-white/50'}`}
                                >
                                    <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Details Section */}
                <div className="w-full md:w-1/2 overflow-y-auto bg-white relative z-10 flex flex-col">
                    <div className="p-8 space-y-8 flex-1">
                        
                        {/* Meta Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: 'Category', icon: HomeIcon, value: formData.category, name: 'category', options: ['House', 'Apartment', 'Commercial', 'Land'] },
                                { label: 'Condition', icon: TagIcon, value: formData.condition, name: 'condition', options: ['New', 'Excellent', 'Good', 'Fair'] },
                                { label: 'Listed On', icon: CalendarIcon, value: new Date(formData.dateAdded).toLocaleDateString(), readonly: true },
                                { label: 'AI Verified', icon: CheckBadgeIcon, value: 'Yes', readonly: true, color: 'text-green-500' }
                            ].map((item, idx) => (
                                <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="text-xs text-slate-500 font-bold uppercase tracking-wide mb-1.5">{item.label}</div>
                                    <div className="font-semibold text-slate-900 flex items-center gap-2">
                                        <item.icon className={`w-4 h-4 ${item.color || 'text-slate-400'}`} />
                                        {isEditing && !item.readonly && item.options ? (
                                            <select name={item.name} value={item.value as string} onChange={handleInputChange} className="bg-white text-slate-900 text-sm rounded-lg border border-slate-300 px-2 py-1 w-full focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none">{item.options.map(o => <option key={o} value={o}>{o}</option>)}</select>
                                        ) : (
                                            <span>{item.value as string}</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Description */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">About Property</h3>
                            {isEditing ? (
                                <textarea name="description" value={formData.description} onChange={handleInputChange} className="w-full h-40 bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none leading-relaxed" />
                            ) : (
                                <p className="text-slate-600 leading-relaxed text-sm">{formData.description}</p>
                            )}
                        </div>

                        {/* Amenities */}
                        <div>
                             <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Amenities</h3>
                             <div className="flex flex-wrap gap-2">
                                {formData.amenities.map((amenity, index) => (
                                    isEditing ? (
                                        <div key={index} className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-1 py-1 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500">
                                            <input type="text" value={amenity} onChange={(e) => handleAmenityChange(index, e.target.value)} className="bg-transparent border-none text-sm text-slate-900 focus:outline-none w-24" />
                                            <button onClick={() => handleRemoveAmenity(index)} className="p-1 hover:text-red-500 text-slate-400"><XMarkIcon className="w-3 h-3" /></button>
                                        </div>
                                    ) : (
                                        <span key={index} className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-sm font-medium text-slate-700 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                            {amenity}
                                        </span>
                                    )
                                ))}
                                {isEditing && (
                                    <button onClick={handleAddAmenity} className="px-3 py-1.5 rounded-lg border border-dashed border-slate-300 hover:border-blue-500 hover:text-blue-600 text-sm text-slate-500 flex items-center gap-2 transition-colors"><PlusIcon className="w-4 h-4" /> Add</button>
                                )}
                             </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 border-t border-slate-100 flex gap-4 bg-slate-50/50">
                        <button className="flex-1 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all shadow-lg shadow-slate-900/10 hidden md:block">Contact Agent</button>
                        {isEditing ? (
                            <div className="flex flex-1 gap-3">
                                <button onClick={handleCancel} className="flex-1 py-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold transition-all shadow-sm">Cancel</button>
                                <button onClick={handleSave} className="flex-[2] py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-green-500/20 flex items-center justify-center gap-2"><CheckIcon className="w-5 h-5" /> Save</button>
                            </div>
                        ) : (
                            <button onClick={() => setIsEditing(true)} className="flex-1 py-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold transition-all shadow-sm flex items-center justify-center gap-2"><PencilSquareIcon className="w-5 h-5" /> Edit Details</button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
