import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Phone, MapPin, Building2, Star, Clock, Edit, Calendar } from 'lucide-react';
import { type Contact } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const statusConfig = {
  hot: {
    label: 'Hot',
    icon: Star,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
  warm: {
    label: 'Warm',
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
  },
  cold: {
    label: 'Cold',
    icon: Clock,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
};

interface ContactModalProps {
  contact: Contact | null;
  onClose: () => void;
}

export const ContactModal = ({ contact, onClose }: ContactModalProps) => {
  if (!contact) return null;

  const statusInfo = statusConfig[contact.status as keyof typeof statusConfig];
  const StatusIcon = statusInfo.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ... (Contenido del modal, similar al que proporcionaste) ... */}
          {/* Header */}
           <div className="p-6 border-b flex justify-between items-start">
              <div className="flex items-center space-x-4">
                {contact.avatar_url ? (
                  <img src={contact.avatar_url} alt={contact.full_name} className="w-16 h-16 rounded-full object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-xl">
                    {contact.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{contact.full_name}</h2>
                  <p className="text-gray-600">{contact.role_title || 'No role'} {contact.company?.name && <span>at <span className="font-medium">{contact.company.name}</span></span>}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full"><X className="w-4 h-4" /></Button>
            </div>
            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Contact Information */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">Contact Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{contact.email || 'No email'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{contact.phone || 'No phone'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{contact.location || 'No location'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{contact.company?.name || 'No company'}</span>
                    </div>
                  </div>
                </div>
                
                {/* Status and Score */}
                <div className="flex items-center gap-4">
                  <Badge className={`${statusInfo.bgColor} ${statusInfo.color} ${statusInfo.borderColor} border`}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {statusInfo.label}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="font-semibold">{contact.score}</span>
                  </div>
                  {contact.deal_value && (
                    <span className="text-sm text-gray-600">
                      Deal Value: ${contact.deal_value.toLocaleString()}
                    </span>
                  )}
                </div>
            </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};