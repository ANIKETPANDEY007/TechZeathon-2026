import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Clock, MapPin, WarningCircle, Trash, X, ImageSquare, MagnifyingGlassPlus, DownloadSimple } from '@phosphor-icons/react';
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

  const getTone = () => {
    if (movement_status === 'fall_detected' || is_critical) return 'critical';
    if (movement_status === 'moderate_fall') return 'warning';
    if (movement_status === 'audio_only') return 'audio';
    return 'normal';
  };

  const displayStatus = movement_status === 'fall_detected' ? 'CRITICAL' 
                      : movement_status === 'moderate_fall' ? 'WARNING'
                      : movement_status === 'audio_only' ? 'AUDIO DISTRESS'
                      : 'NORMAL';

  const tone = getTone();

  return (
    <div className={`incident-card ${tone}`}>
      <div className="incident-card-top">
        <div>
          <AlertBadge status={displayStatus} />
          <div className="incident-location">
            <MapPin size={16} />
            <span>{location || 'Unknown Location'}</span>
          </div>
        </div>

        <div className="incident-meta">
          <div className="incident-time">
            <Clock size={15} /> {formattedTime}
          </div>
          <div className="incident-date">{formattedDate}</div>
          <button
            onClick={handleDeleteIncident}
            className="icon-action danger"
            title="Delete incident log"
            aria-label="Delete incident log"
          >
            <Trash size={16} />
          </button>
        </div>
      </div>

      {image_filename && !imageDeleted && (
        <div className="incident-snapshot group" onClick={() => setIsModalOpen(true)}>
          {hasError ? (
            <div className="incident-image-fallback">
              <WarningCircle size={16} className="text-orange-400" />
              <span>Image loading...</span>
            </div>
          ) : (
            <>
              <div className="incident-snapshot-overlay">
                <span>
                  <MagnifyingGlassPlus size={15} />
                  View snapshot
                </span>
              </div>
              <div className="incident-image-label">
                <ImageSquare size={14} />
                Evidence
              </div>
              <button
                onClick={handleDeleteImage}
                className="icon-action danger floating"
                title="Delete image"
                aria-label="Delete image"
              >
                <Trash size={14} weight="bold" />
              </button>
              <img 
                src={getImageUrl(image_filename)} 
                alt="Incident snapshot" 
                className="incident-image"
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
            className="incident-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image Section */}
            <div className="incident-modal-image">
              <img 
                src={getImageUrl(image_filename)} 
                alt="Expanded incident snapshot" 
                className="max-h-[70vh] object-contain w-full"
              />
            </div>
            
            {/* Info Sidebar Section */}
            <div className="incident-modal-side">
              <div>
                <div className="flex justify-between items-start mb-6">
                  <AlertBadge status={displayStatus} />
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="icon-action"
                    aria-label="Close snapshot"
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
                  className="incident-modal-button danger"
                  title="Delete entire incident log"
                >
                  <Trash size={14} /> Delete Log
                </button>
                <a 
                  href={getImageUrl(image_filename)} 
                  download={`incident_${id}.jpg`}
                  target="_blank"
                  rel="noreferrer"
                  className="incident-modal-button primary"
                >
                  <DownloadSimple size={14} /> Download
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
