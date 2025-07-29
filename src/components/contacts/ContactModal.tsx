import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Phone, MapPin, Building2, Star, Clock, Edit, Calendar } from 'lucide-react';
import { statusConfig, type Contact } from '@/data/mockContacts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
                <img src={contact.avatar} alt={contact.name} className="w-16 h-16 rounded-full object-cover" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{contact.name}</h2>
                  <p className="text-gray-600">{contact.role} at <span className="font-medium">{contact.company}</span></p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full"><X className="w-4 h-4" /></Button>
            </div>
            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Aquí iría todo el contenido detallado del modal */}
                <p className="text-sm text-gray-600">Details for {contact.name} will be displayed here...</p>
            </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};