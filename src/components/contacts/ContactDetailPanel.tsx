"use client";

import { motion } from 'framer-motion';
import { mockContacts, type Contact } from '@/data/mockContacts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';

interface ContactDetailPanelProps {
  contactId: string;
  onClose: () => void;
}

export const ContactDetailPanel = ({ contactId, onClose }: ContactDetailPanelProps) => {
  const contact = mockContacts.find(c => c.id === contactId);

  if (!contact) return null;

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      // La clase pointer-events-auto reactiva los clics para este panel
      className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl pointer-events-auto"
    >
      <Card className="h-full w-full flex flex-col rounded-none border-l">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Contact Details</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="w-4 h-4" /></Button>
        </CardHeader>
        <CardContent className="overflow-y-auto">
          <p className="font-bold text-lg">{contact.name}</p>
          <p>{contact.role} at {contact.company}</p>
          {/* Aquí iría toda la información detallada del contacto */}
        </CardContent>
      </Card>
    </motion.div>
  );
};