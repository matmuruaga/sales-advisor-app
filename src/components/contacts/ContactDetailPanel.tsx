"use client";

import { motion } from 'framer-motion';
import { mockContacts } from '@/data/mockContacts';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardFooter 
} from '@/components/ui/card';
import { 
  X, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Building, 
  Briefcase, 
  Clock, 
  MessageSquare, 
  FileText,
  Star,
  Share2
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';

interface ContactDetailPanelProps {
  contactId: string;
  onClose: () => void;
}

export const ContactDetailPanel = ({ contactId, onClose }: ContactDetailPanelProps) => {
  const contact = mockContacts.find(c => c.id === contactId);

  if (!contact) return null;

  // Función para generar iniciales del nombre
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  // Función para formatear fechas (asumiendo que tenemos fechas en el objeto contact)
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl pointer-events-auto z-50"
    >
      <Card className="h-full w-full flex flex-col rounded-none border-l">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-semibold">Contact Details</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close panel">
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <ScrollArea className="flex-1">
          <CardContent className="pt-4 pb-8">
            {/* Header section with avatar and primary info */}
            <div className="flex items-start space-x-4 mb-6">
              <Avatar className="h-16 w-16">
                {contact.avatarUrl ? (
                  <AvatarImage src={contact.avatarUrl} alt={contact.name} />
                ) : (
                  <AvatarFallback className="text-lg bg-primary/10 text-primary">
                    {getInitials(contact.name)}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="space-y-1 flex-1">
                <h2 className="text-xl font-bold">{contact.name}</h2>
                <div className="flex items-center text-muted-foreground">
                  <Briefcase className="w-3.5 h-3.5 mr-1.5" />
                  <span className="text-sm">{contact.role}</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Building className="w-3.5 h-3.5 mr-1.5" />
                  <span className="text-sm">{contact.company}</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {contact.tags?.map((tag, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact info section */}
            <div className="space-y-4 mb-6">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Contact Information
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {contact.email && (
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-3 text-muted-foreground" />
                    <a href={`mailto:${contact.email}`} className="text-sm hover:underline">
                      {contact.email}
                    </a>
                  </div>
                )}
                {contact.phone && (
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-3 text-muted-foreground" />
                    <a href={`tel:${contact.phone}`} className="text-sm hover:underline">
                      {contact.phone}
                    </a>
                  </div>
                )}
                {contact.location && (
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-3 text-muted-foreground" />
                    <span className="text-sm">{contact.location}</span>
                  </div>
                )}
              </div>
            </div>
            
            <Separator className="my-6" />
            
            {/* Additional info section */}
            <div className="space-y-4 mb-6">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Background Details
              </h3>
              <div className="space-y-4">
                {contact.industry && (
                  <div>
                    <h4 className="text-xs text-muted-foreground mb-1">Industry</h4>
                    <p className="text-sm">{contact.industry}</p>
                  </div>
                )}
                
                {contact.leadSource && (
                  <div>
                    <h4 className="text-xs text-muted-foreground mb-1">Lead Source</h4>
                    <p className="text-sm">{contact.leadSource}</p>
                  </div>
                )}
                
                {contact.status && (
                  <div>
                    <h4 className="text-xs text-muted-foreground mb-1">Status</h4>
                    <div>
                      <Badge 
                        variant={
                          contact.status === 'Active' ? 'default' : 
                          contact.status === 'Cold' ? 'secondary' : 
                          'outline'
                        }
                      >
                        {contact.status}
                      </Badge>
                    </div>
                  </div>
                )}
                
                {contact.createdAt && (
                  <div className="flex items-center">
                    <div>
                      <h4 className="text-xs text-muted-foreground mb-1">Customer Since</h4>
                      <div className="flex items-center">
                        <Calendar className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                        <span className="text-sm">{formatDate(contact.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {contact.notes && (
              <>
                <Separator className="my-6" />
                <div className="space-y-4 mb-6">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Notes
                  </h3>
                  <div className="bg-secondary/20 p-3 rounded-md">
                    <p className="text-sm whitespace-pre-line">{contact.notes}</p>
                  </div>
                </div>
              </>
            )}
            
            {/* Recent activity section - can be expanded based on your data model */}
            {contact.recentActivity && (
              <>
                <Separator className="my-6" />
                <div className="space-y-4 mb-6">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center">
                    Recent Activity
                  </h3>
                  <div className="space-y-3">
                    {contact.recentActivity.map((activity, index) => (
                      <div key={index} className="flex space-x-3">
                        <div className="mt-0.5">
                          {activity.type === 'email' ? (
                            <Mail className="w-4 h-4 text-muted-foreground" />
                          ) : activity.type === 'meeting' ? (
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                          ) : activity.type === 'call' ? (
                            <Phone className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <MessageSquare className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm">{activity.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {activity.date && formatDate(activity.date)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </ScrollArea>
        <CardFooter className="border-t px-6 py-4">
          <div className="flex justify-between w-full">
            <Button variant="outline" size="sm" className="w-[48%]">
              <MessageSquare className="w-4 h-4 mr-2" />
              Message
            </Button>
            <Button size="sm" className="w-[48%]">
              <FileText className="w-4 h-4 mr-2" />
              View History
            </Button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};