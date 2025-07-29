"use client";

import { motion } from 'framer-motion';
import { mockContacts } from '@/data/mockContacts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';

interface CompanyDetailPanelProps {
  companyName: string;
  onClose: () => void;
}

export const CompanyDetailPanel = ({ companyName, onClose }: CompanyDetailPanelProps) => {
  // Para la demo, tomamos el primer contacto que coincida con el nombre de la empresa
  const companyInfo = mockContacts.find(c => c.company === companyName);

  if (!companyInfo) return null;

  return (
    <motion.div
      initial={{ x: '-100%' }}
      animate={{ x: 0 }}
      exit={{ x: '-100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      // Reactivamos los clics también para este panel
      className="fixed top-0 left-0 h-full w-full max-w-md bg-white shadow-2xl pointer-events-auto"
    >
      <Card className="h-full w-full flex flex-col rounded-none border-r">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Company Details</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="w-4 h-4" /></Button>
        </CardHeader>
        <CardContent className="overflow-y-auto">
          <p className="font-bold text-lg">{companyInfo.company}</p>
          <p>Industry: {companyInfo.industry}</p>
          {/* Aquí iría toda la información detallada de la empresa */}
        </CardContent>
      </Card>
    </motion.div>
  );
};