import { Building, MapPin, Star, Users, Sparkles, TrendingUp, Phone, Mail, Linkedin, Twitter, Plus, UserPlus, Search, AlertCircle, ExternalLink, Loader2, CheckCircle, Clock, X, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { motion } from 'framer-motion';
import { useMeetingParticipants, type MeetingParticipantWithContact } from '@/hooks/useMeetingParticipants';
import { useSupabaseContacts } from '@/hooks/useSupabaseContacts';
import type { Contact } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import { apiCall } from '@/lib/api-client';
import { useState, useEffect } from 'react';

interface ParticipantCardsProps {
  meetingId: string | null;
  selectedParticipant: string | null;
  onParticipantSelect: (participantId: string) => void;
  onContactAdded?: (contactId: string) => void;
}

interface ParticipantCardProps {
  participant: MeetingParticipantWithContact;
  isSelected: boolean;
  onClick: () => void;
  onAddToContacts: (participantId: string) => void;
  onLinkToContact: (participantId: string, contactId: string) => void;
  onEnrichParticipant: (participantId: string, linkedinUrl?: string) => void;
  contacts: Contact[]; // Add contacts prop
}

interface AddToContactsModalProps {
  participant: MeetingParticipantWithContact | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: {
    fullName: string;
    email: string;
    roleTitle?: string;
    companyName?: string;
    phone?: string;
    linkedinUrl?: string;
  }) => void;
  loading?: boolean;
}

const roleColors = {
  'accepted': 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200',
  'declined': 'bg-gradient-to-r from-red-100 to-pink-100 text-red-700 border-red-200',
  'tentative': 'bg-gradient-to-r from-yellow-50 to-orange-50 text-yellow-700 border-yellow-200',
  'needsAction': 'bg-gray-50 text-gray-600 border-gray-200'
};

const enrichmentColors = {
  'enriched': 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200',
  'matched': 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border-blue-200',
  'pending': 'bg-gradient-to-r from-yellow-50 to-amber-50 text-amber-700 border-amber-200',
  'unknown': 'bg-gray-50 text-gray-600 border-gray-200'
};

// Add to Contacts Modal
const AddToContactsModal = ({ participant, isOpen, onClose, onConfirm, loading = false }: AddToContactsModalProps) => {
  const [formData, setFormData] = useState({
    fullName: participant?.display_name || '',
    email: participant?.email || '',
    roleTitle: '',
    companyName: '',
    phone: '',
    linkedinUrl: ''
  });

  useEffect(() => {
    if (participant) {
      setFormData({
        fullName: participant.display_name || '',
        email: participant.email || '',
        roleTitle: '',
        companyName: '',
        phone: '',
        linkedinUrl: ''
      });
    }
  }, [participant]);

  if (!isOpen || !participant) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center mb-4">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-2 mr-3">
            <UserPlus className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Add to Contacts</h3>
            <p className="text-sm text-gray-600">Create a contact from meeting participant</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <Input
              value={formData.fullName}
              onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
              placeholder="Enter full name"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <Input
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Enter email"
              className="w-full"
              disabled
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role/Title</label>
            <Input
              value={formData.roleTitle}
              onChange={(e) => setFormData(prev => ({ ...prev, roleTitle: e.target.value }))}
              placeholder="Enter role or job title"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
            <Input
              value={formData.companyName}
              onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
              placeholder="Enter company name"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone (Optional)</label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="Enter phone number"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL (Optional)</label>
            <Input
              value={formData.linkedinUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, linkedinUrl: e.target.value }))}
              placeholder="https://linkedin.com/in/..."
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Providing LinkedIn URL will enable automatic profile enrichment
            </p>
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={() => onConfirm(formData)}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            disabled={!formData.fullName || !formData.email || loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Add Contact
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Enhanced ParticipantCard component with new functionality
const ParticipantCard = ({ participant, isSelected, onClick, onAddToContacts, onLinkToContact, onEnrichParticipant, contacts }: ParticipantCardProps) => {
  const [showLinkOptions, setShowLinkOptions] = useState(false);
  const [enrichmentInProgress, setEnrichmentInProgress] = useState(false);
  
  const getInitials = (name: string) => {
    if (!name) return '?';
    return name.split(' ').map(part => part[0]).join('').toUpperCase();
  };

  const isUnknownParticipant = participant.enrichment_status === 'pending' || participant.enrichment_status === 'unknown';
  const hasContact = participant.contact;

  // Find potential matches in existing contacts - prioritize exact email matches
  const potentialMatches = contacts
    .filter(c => {
      const emailMatch = c.email?.toLowerCase() === participant.email.toLowerCase();
      const nameMatch = participant.display_name && c.full_name?.toLowerCase().includes(participant.display_name.toLowerCase());
      return emailMatch || nameMatch;
    })
    .sort((a, b) => {
      // Exact email matches first
      const aEmailMatch = a.email?.toLowerCase() === participant.email.toLowerCase();
      const bEmailMatch = b.email?.toLowerCase() === participant.email.toLowerCase();
      if (aEmailMatch && !bEmailMatch) return -1;
      if (!aEmailMatch && bEmailMatch) return 1;
      return 0;
    })
    .slice(0, 3);
  
  // Auto-match if exact email match exists
  useEffect(() => {
    if (!hasContact && potentialMatches.length > 0) {
      const exactEmailMatch = potentialMatches.find(c => 
        c.email?.toLowerCase() === participant.email.toLowerCase()
      );
      if (exactEmailMatch) {
        // Auto-link the exact email match
        onLinkToContact(participant.id, exactEmailMatch.id);
      }
    }
  }, [potentialMatches.length, hasContact, participant.id, participant.email]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={`
        rounded-xl transition-all duration-300 cursor-pointer relative
        ${isSelected 
          ? 'bg-gradient-to-br from-purple-500 to-pink-500 p-0.5 shadow-xl shadow-purple-500/20' 
          : 'bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 hover:shadow-lg'
        }
      `}
      onClick={onClick}
    >
      <div className={`rounded-xl p-4 h-full ${
        isSelected 
          ? 'bg-white/95 backdrop-blur-sm' 
          : 'bg-white/80 backdrop-blur-sm'
      }`}>
        
        {/* Header with avatar and basic info */}
        <div className="flex items-start space-x-3 mb-3">
          <div className="relative">
            <Avatar className="w-12 h-12 ring-2 ring-white/50">
              {participant.contact?.avatar_url ? (
                <img src={participant.contact.avatar_url} alt={participant.display_name} />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-purple-100 to-pink-100 text-purple-700 font-bold">
                  {getInitials(participant.display_name || participant.email)}
                </AvatarFallback>
              )}
            </Avatar>
            {participant.is_organizer && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-2.5 h-2.5 text-white" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-gray-900 mb-1 truncate">
              {hasContact ? participant.contact.full_name : (participant.display_name || 'Unknown')}
            </h4>
            <p className="text-xs text-gray-600 mb-1 truncate">
              {hasContact ? participant.contact.role_title : participant.email}
            </p>
            {hasContact && participant.contact.company && (
              <div className="flex items-center text-xs text-gray-500 mb-2">
                <Building className="w-3 h-3 mr-1" />
                <span className="truncate">{participant.contact.company.name}</span>
              </div>
            )}
          </div>
          
          <div className="text-right">
            {hasContact && (
              <>
                <div className="flex items-center text-xs text-gray-500 mb-1">
                  <Star className="w-3 h-3 mr-1 text-yellow-500 fill-current" />
                  <span className="font-medium">{participant.contact.score}</span>
                </div>
                <Badge 
                  variant="outline" 
                  className={`text-xs px-2 py-0.5 ${
                    participant.contact.status === 'hot' ? 'bg-red-100 text-red-700 border-red-200' :
                    participant.contact.status === 'warm' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                    'bg-blue-100 text-blue-700 border-blue-200'
                  }`}
                >
                  {participant.contact.status.toUpperCase()}
                </Badge>
              </>
            )}
          </div>
        </div>

        {/* Contact info or add to contacts section */}
        {hasContact ? (
          <>
            {/* See in contacts button */}
            <div className="flex items-center justify-end mb-3">
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  // Navigate to contacts page or open in new tab
                  window.open(`/contacts?id=${participant.contact.id}`, '_blank');
                }}
                className="h-6 px-2 text-xs bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"
              >
                <Eye className="w-3 h-3 mr-1" />
                See in contacts
              </Button>
            </div>
            
            {/* Contact metrics */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="text-center bg-blue-50 rounded-lg py-2">
                <div className="text-xs font-bold text-blue-600">{participant.contact.probability || 0}%</div>
                <div className="text-xs text-blue-500">Probability</div>
              </div>
              <div className="text-center bg-green-50 rounded-lg py-2">
                <div className="text-xs font-bold text-green-600">
                  ${participant.contact.deal_value ? (participant.contact.deal_value / 1000).toFixed(0) : 0}K
                </div>
                <div className="text-xs text-green-500">Deal Value</div>
              </div>
              <div className="text-center bg-purple-50 rounded-lg py-2">
                <div className="text-xs font-bold text-purple-600">
                  {participant.contact.pipeline_stage?.replace('-', ' ') || 'lead'}
                </div>
                <div className="text-xs text-purple-500">Stage</div>
              </div>
            </div>

            {/* AI Insights if available */}
            {participant.contact.ai_insights && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-3 mb-3">
                <div className="flex items-center mb-1">
                  <Sparkles className="w-3 h-3 mr-1 text-purple-600" />
                  <span className="text-xs font-medium text-purple-800">AI Insight</span>
                </div>
                <p className="text-xs text-purple-700 leading-relaxed line-clamp-2">
                  {typeof participant.contact.ai_insights === 'string' 
                    ? participant.contact.ai_insights 
                    : participant.contact.ai_insights.summary || 'Analyzing contact profile...'}
                </p>
              </div>
            )}
          </>
        ) : (
          /* Add to contacts section for unknown participants */
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-3 mb-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                {participant.enrichment_status === 'pending' ? (
                  <Clock className="w-3 h-3 mr-1 text-amber-600" />
                ) : (
                  <AlertCircle className="w-3 h-3 mr-1 text-amber-600" />
                )}
                <span className="text-xs font-medium text-amber-800">
                  {participant.enrichment_status === 'pending' ? 'Processing...' : 'Unknown Participant'}
                </span>
              </div>
              
              <div className="flex items-center space-x-1">
                {/* Enrich from LinkedIn button */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEnrichmentInProgress(true);
                    onEnrichParticipant(participant.id);
                  }}
                  disabled={enrichmentInProgress || participant.enrichment_status === 'pending'}
                  className="h-6 px-2 text-xs bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"
                >
                  {enrichmentInProgress ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Linkedin className="w-3 h-3" />
                  )}
                </Button>

                {/* Add to contacts manually button */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToContacts(participant.id);
                  }}
                  className="h-6 px-2 text-xs bg-white/50 hover:bg-white border-amber-200 text-amber-700"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add
                </Button>
              </div>
            </div>
            
            {potentialMatches.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-amber-600 mb-1">Potential matches:</p>
                <div className="space-y-1">
                  {potentialMatches.map(match => (
                    <button
                      key={match.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onLinkToContact(participant.id, match.id);
                      }}
                      className="w-full text-left p-1.5 rounded text-xs text-amber-700 hover:bg-white/50 transition-colors"
                    >
                      <div className="font-medium">{match.full_name}</div>
                      <div className="text-amber-600">{match.email} • {match.company?.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Status badges */}
        <div className="border-t border-gray-200/50 pt-3">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <div className="flex items-center">
              <Mail className="w-3 h-3 mr-1" />
              <span className="truncate">{participant.email}</span>
            </div>
            <div className="flex items-center space-x-2">
              {hasContact && participant.contact.social_profiles?.linkedin && (
                <Linkedin className="w-3 h-3 text-blue-600" />
              )}
              {participant.meeting_platform === 'google-meet' && (
                <div className="w-3 h-3 bg-blue-600 rounded-full" />
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-1">
            <Badge 
              variant="outline" 
              className={`text-xs px-2 py-0.5 ${roleColors[participant.response_status]}`}
            >
              {participant.response_status}
            </Badge>
            <Badge 
              variant="outline" 
              className={`text-xs px-2 py-0.5 ${enrichmentColors[participant.enrichment_status]}`}
            >
              {participant.enrichment_status === 'pending' && enrichmentInProgress ? (
                <div className="flex items-center">
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  enriching
                </div>
              ) : (
                participant.enrichment_status
              )}
            </Badge>
            {participant.is_organizer && (
              <Badge 
                variant="outline" 
                className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 border-purple-200"
              >
                organizer
              </Badge>
            )}
            {participant.auto_match_confidence && participant.auto_match_confidence > 0.7 && (
              <Badge 
                variant="outline" 
                className="text-xs px-2 py-0.5 bg-green-100 text-green-700 border-green-200"
              >
                {Math.round(participant.auto_match_confidence * 100)}% match
              </Badge>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export function ParticipantCards({ meetingId, selectedParticipant, onParticipantSelect, onContactAdded }: ParticipantCardsProps) {
  const { getParticipantsForMeeting, linkToContact, enrichParticipant } = useMeetingParticipants(meetingId);
  const { contacts } = useSupabaseContacts(); // Move the hook here, called once for all participants
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedForAdd, setSelectedForAdd] = useState<MeetingParticipantWithContact | null>(null);
  const [addContactLoading, setAddContactLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!meetingId) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-8 border border-white/20">
          <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium mb-2">No Meeting Selected</p>
          <p className="text-sm">Select a meeting to view participants</p>
        </div>
      </div>
    );
  }

  const participants = getParticipantsForMeeting(meetingId);

  if (participants.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No participants found for this meeting</p>
        </div>
      </div>
    );
  }

  const handleAddToContacts = (participantId: string) => {
    const participant = participants.find(p => p.id === participantId);
    if (participant) {
      setSelectedForAdd(participant);
      setShowAddModal(true);
    }
  };

  const handleLinkToContact = async (participantId: string, contactId: string) => {
    try {
      await linkToContact(participantId, contactId);
      if (onContactAdded) {
        onContactAdded(contactId);
      }
    } catch (error) {
      console.error('Failed to link participant to contact:', error);
    }
  };

  const handleEnrichParticipant = async (participantId: string, linkedinUrl?: string) => {
    try {
      await enrichParticipant(participantId, 'linkedin', linkedinUrl);
    } catch (error) {
      console.error('Failed to enrich participant:', error);
    }
  };

  const handleConfirmAddContact = async (data: any) => {
    if (!selectedForAdd) return;

    try {
      setAddContactLoading(true);
      setErrorMessage(null);

      // Create contact via API
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No authenticated session');
      }

      const response = await apiCall('/api/contacts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: data.email,
          fullName: data.fullName,
          roleTitle: data.roleTitle,
          companyName: data.companyName,
          phone: data.phone,
          linkedinUrl: data.linkedinUrl,
          source: 'meeting_participant'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create contact');
      }

      const result = await response.json();
      
      // Link the participant to the new contact
      await linkToContact(selectedForAdd.id, result.contact.id);
      
      // If LinkedIn URL is provided, trigger enrichment
      if (data.linkedinUrl) {
        await handleEnrichParticipant(selectedForAdd.id, data.linkedinUrl);
      }
      
      // SUCCESS: Close modal and show success message
      setShowAddModal(false);
      setSelectedForAdd(null);
      setSuccessMessage(`Contact "${result.contact.full_name}" created successfully!`);
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
      
      if (onContactAdded) {
        onContactAdded(result.contact.id);
      }
    } catch (error) {
      console.error('Failed to add participant to contacts:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to create contact. Please try again.');
      // Modal stays open so user can retry
    } finally {
      setAddContactLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-4">
        {/* Enhanced header with stats */}
        <div className="flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2 shadow-sm border border-white/20"
          >
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-1.5 mr-3">
              <Users className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-800">
                Meeting Participants
              </h3>
              <p className="text-xs text-gray-600">
                {participants.length} participant{participants.length !== 1 ? 's' : ''} • 
                {participants.filter(p => p.contact).length} known contacts
              </p>
            </div>
          </motion.div>

          {participants.filter(p => !p.contact).length > 0 && (
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
              {participants.filter(p => !p.contact).length} unknown
            </Badge>
          )}
        </div>
        
        {/* Participant cards */}
        <div className="space-y-3">
          {participants.map((participant, index) => (
            <motion.div
              key={participant.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <ParticipantCard
                participant={participant}
                isSelected={selectedParticipant === participant.id}
                onClick={() => onParticipantSelect(participant.id)}
                onAddToContacts={handleAddToContacts}
                onLinkToContact={handleLinkToContact}
                onEnrichParticipant={handleEnrichParticipant}
                contacts={contacts}
              />
            </motion.div>
          ))}
        </div>
      </div>

      <AddToContactsModal
        participant={selectedForAdd}
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setSelectedForAdd(null);
          setErrorMessage(null);
        }}
        onConfirm={handleConfirmAddContact}
        loading={addContactLoading}
      />
      
      {/* Success/Error Messages */}
      {(successMessage || errorMessage) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
            successMessage 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}
        >
          <div className="flex items-center">
            {successMessage ? (
              <CheckCircle className="w-4 h-4 mr-2" />
            ) : (
              <AlertCircle className="w-4 h-4 mr-2" />
            )}
            <span className="text-sm font-medium">
              {successMessage || errorMessage}
            </span>
            <button
              onClick={() => {
                setSuccessMessage(null);
                setErrorMessage(null);
              }}
              className="ml-4 text-current opacity-70 hover:opacity-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </>
  );
}