// src/data/enhancedMockContacts.ts
import { enhancedMockContactsPart1 } from './enhancedMockContacts-part1';
import { enhancedMockContactsPart2 } from './enhancedMockContacts-part2';
import { enhancedMockContactsPart3 } from './enhancedMockContacts-part3';
import { Contact } from '@/data/mockContacts';

// Combined enhanced contacts array
export const enhancedMockContacts: Contact[] = [
  ...enhancedMockContactsPart1,
  ...enhancedMockContactsPart2,
  ...enhancedMockContactsPart3
];

// Export individual parts if needed
export { enhancedMockContactsPart1, enhancedMockContactsPart2, enhancedMockContactsPart3 };

// Utility functions for working with enhanced contacts
export const getContactById = (id: string): Contact | undefined => {
  return enhancedMockContacts.find(contact => contact.id === id);
};

export const getContactsByCompany = (companyName: string): Contact[] => {
  return enhancedMockContacts.filter(contact => contact.company === companyName);
};

export const getContactsByStatus = (status: 'hot' | 'warm' | 'cold'): Contact[] => {
  return enhancedMockContacts.filter(contact => contact.status === status);
};

export const getContactsBySentiment = (sentiment: 'very-positive' | 'positive' | 'neutral' | 'negative' | 'very-negative'): Contact[] => {
  return enhancedMockContacts.filter(contact => contact.sentiment.overall === sentiment);
};

export const getHighValueContacts = (minValue: number = 50000): Contact[] => {
  return enhancedMockContacts.filter(contact => {
    const value = parseInt(contact.value.replace(/[^0-9]/g, ''));
    return value >= minValue;
  });
};

export const getActiveContacts = (): Contact[] => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  return enhancedMockContacts.filter(contact => {
    // Simple activity check based on lastActivity string
    return contact.lastActivity.includes('hour') || 
           contact.lastActivity.includes('day') || 
           contact.lastActivity === '3 days ago';
  });
};

// Search function for contacts
export const searchContacts = (query: string): Contact[] => {
  const lowercaseQuery = query.toLowerCase();
  
  return enhancedMockContacts.filter(contact => 
    contact.name.toLowerCase().includes(lowercaseQuery) ||
    contact.company.toLowerCase().includes(lowercaseQuery) ||
    contact.role.toLowerCase().includes(lowercaseQuery) ||
    contact.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
    contact.interests.some(interest => interest.toLowerCase().includes(lowercaseQuery))
  );
};