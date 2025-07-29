import { Mail, Building2, Star, MoreHorizontal, Clock } from 'lucide-react';
import { statusConfig, type Contact } from '@/data/mockContacts'
interface ContactCardProps {
  contact: Contact;
  onSelect: (contact: Contact) => void;
}

export const ContactCard = ({ contact, onSelect }: ContactCardProps) => {
  const statusInfo = statusConfig[contact.status as keyof typeof statusConfig];
  const StatusIcon = statusInfo.icon;

  return (
    <div
      className="bg-white rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-300 cursor-pointer group"
      onClick={() => onSelect(contact)}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <img src={contact.avatar} alt={contact.name} className="w-12 h-12 rounded-full object-cover" />
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">{contact.name}</h3>
              <p className="text-xs text-gray-600">{contact.role}</p>
            </div>
          </div>
          <div className={`px-2 py-1 rounded-full border text-xxs font-medium flex items-center ${statusInfo.color}`}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {statusInfo.label}
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <div className="flex items-center">
            <Building2 className="w-3 h-3 mr-1.5" />
            <span>{contact.company}</span>
          </div>
          <div className="flex items-center">
            <Star className="w-3 h-3 mr-1 text-yellow-400 fill-current" />
            <span className="font-semibold text-gray-700">{contact.score}</span>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-1.5 rounded-full" style={{ width: `${contact.probability}%` }} />
        </div>
        <div className="flex items-center justify-between text-xxs text-gray-400 mt-1">
          <span>{contact.pipeline}</span>
          <span>{contact.probability}%</span>
        </div>
      </div>
    </div>
  );
};