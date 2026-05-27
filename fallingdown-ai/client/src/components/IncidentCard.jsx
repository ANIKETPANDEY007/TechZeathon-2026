import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Clock, MapPin, WarningCircle, Trash, X } from '@phosphor-icons/react';
import AlertBadge from './AlertBadge';
import { getImageUrl, deleteIncidentImage, deleteIncident } from '../api/fallingdown';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const IncidentCard = ({ id, timestamp, movement_status, location, image_filename, is_critical, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [imageDeleted, setImageDeleted] = useState(false);

  const handleDeleteIncident = async (e) => {
    e.stopPropagation();
    try {
      await deleteIncident(id);
      toast.success('Incident log deleted');
      if (onDelete) {
        onDelete(id);
      }
    } catch (err) {
      toast.error('Failed to delete incident log');
    }
  };

  useEffect(() => {
    if (hasError) {
      const timer = setTimeout(() => setHasError(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [hasError]);

  const handleDeleteImage = async (e) => {
    e.stopPropagation();
    try {
      await deleteIncidentImage(id);
      setImageDeleted(true);
      setIsModalOpen(false);
      toast.success('Image deleted successfully');
    } catch (err) {
      toast.error('Failed to delete image');
    }
  };

  const parseTimestamp = (str) => {
    if (!str) return null;
    const isoStr = str.includes(' ') ? str.replace(' ', 'T') : str;
    const d = new Date(isoStr);
    return isNaN(d.getTime()) ? null : d;
  };

  const parsedDate = parseTimestamp(timestamp);
  const formattedTime = parsedDate ? format(parsedDate, 'HH:mm:ss') : 'Unknown Time';
  const formattedDate = parsedDate ? format(parsedDate, 'MMM dd, yyyy') : '';

  const getBorderColor = () => {
    if (movement_status === 'fall_detected' || is_critical) return 'border-red-500/50 pulse-border-red';
    if (movement_status === 'moderate_fall') return 'border-orange-500/50';
    if (movement_status === 'audio_only') return 'border-purple-500/50';
    return 'border-white/10';
  };

  const displayStatus = movement_status === 'fall_detected' ? 'CRITICAL' 
                      : movement_status === 'moderate_fall' ? 'WARNING'
                      : movement_status === 'audio_only' ? 'AUDIO DISTRESS'
                      : 'NORMAL';

  return (
    <div className={`glass-panel p-4 flex flex-col gap-3 transition-all ${getBorderColor()}`}>
      <div className="flex justify-between items-start">
        <AlertBadge status={displayStatus} />
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-mono text-slate-300 flex items-center gap-1 justify-end">
              <Clock size={14} /> {formattedTime}
            </div>
            <div className="text-xs text-slate-500">{formattedDate}</div>
          </div>
          <button
            onClick={handleDeleteIncident}
            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/30 text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 transition-all cursor-pointer self-start"
            title="Delete Incident Log"
          >
            <Trash size={15} />
          </button>
        </div>
      </div>
      
      <div className="flex items-center gap-2 text-sm text-slate-400 mt-2">
        <MapPin size={16} className="text-teal-400" />
        {location || 'Unknown Location'}
      </div>
      
      {image_filename && !imageDeleted && (
        <div className="mt-2 rounded-lg overflow-hidden border border-white/5 cursor-pointer relative group" onClick={() => setIsModalOpen(true)}>
          {hasError ? (
            <div className="h-24 bg-white/5 flex items-center justify-center text-xs text-slate-500 gap-2">
              <WarningCircle size={16} className="text-orange-400" />
              <span>Image loading...</span>
            </div>
          ) : (
            <>
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                <span className="text-white text-xs bg-black/60 px-2 py-1 rounded">
                  Click to view full image
                </span>
              </div>
              <button
                onClick={handleDeleteImage}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/80 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer shadow-md"
                title="Delete Image"
              >
                <Trash size={14} weight="bold" />
              </button>
              <img 
                src={getImageUrl(image_filename)} 
                alt="Incident snapshot" 
                className="w-full h-24 object-cover hover:scale-105 transition-transform duration-300"
                onError={() => setHasError(true)}
              />
            </>
          )}
        </div>
      )}

      {/* Lightbox Modal */}
      {isModalOpen && createPortal(
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 cursor-zoom-out animate-[fadeIn_0.2s_ease-out]"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="relative max-w-4xl w-full bg-navy-950/95 border border-white/10 rounded-2xl overflow-hidden shadow-2xl cursor-default flex flex-col sm:flex-row"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image Section */}
            <div className="flex-1 bg-black flex items-center justify-center min-h-[300px]">
              <img 
                src={getImageUrl(image_filename)} 
                alt="Expanded incident snapshot" 
                className="max-h-[70vh] object-contain w-full"
              />
            </div>
            
            {/* Info Sidebar Section */}
            <div className="w-full sm:w-80 bg-navy-900/80 border-t sm:border-t-0 sm:border-l border-white/10 p-6 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-6">
                  <AlertBadge status={displayStatus} />
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <X size={20} weight="bold" />
                  </button>
                </div>
                
                <h3 className="text-lg font-bold text-white mb-4">Incident Snapshot</h3>
                
                <div className="space-y-4 text-sm">
                  <div className="flex items-center gap-3 text-slate-300">
                    <MapPin size={18} className="text-teal-400" />
                    <div>
                      <div className="font-semibold text-white">Location</div>
                      <div className="text-xs text-slate-400">{location || 'Camera 01'}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 text-slate-300">
                    <Clock size={18} className="text-teal-400" />
                    <div>
                      <div className="font-semibold text-white">Time & Date</div>
                      <div className="text-xs text-slate-400">{formattedDate} at {formattedTime}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-white/5 flex gap-3">
                <button 
                  onClick={handleDeleteIncident}
                  className="flex-1 py-2.5 px-4 bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Delete entire incident log"
                >
                  <Trash size={14} /> Delete Log
                </button>
                <a 
                  href={getImageUrl(image_filename)} 
                  download={`incident_${id}.jpg`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2.5 px-4 bg-teal-400 hover:bg-teal-500 text-navy-950 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-center"
                >
                  Download
                </a>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default IncidentCard;
