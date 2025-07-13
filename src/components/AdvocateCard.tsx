'use client';

import React from 'react';

interface Advocate {
  id?: number;
  firstName: string;
  lastName: string;
  city: string;
  degree: string;
  specialties: string[];
  yearsOfExperience: number;
  phoneNumber: number;
}

interface AdvocateCardProps {
  advocate: Advocate;
  onContact?: (advocate: Advocate) => void;
  onViewDetails?: (advocate: Advocate) => void;
}

const AdvocateCard: React.FC<AdvocateCardProps> = ({ advocate, onContact, onViewDetails }) => {
  const formatPhoneNumber = (phone: number): string => {
    const phoneStr = phone.toString();
    if (phoneStr.length === 10) {
      return `(${phoneStr.slice(0, 3)}) ${phoneStr.slice(3, 6)}-${phoneStr.slice(6)}`;
    }
    return phoneStr;
  };

  const getExperienceLabel = (years: number): string => {
    if (years === 1) return '1 year';
    return `${years} years`;
  };

  return (
    <div className="bg-white rounded-xl shadow-solace hover:shadow-solace-lg hover:border-solace-primary/40 transition-all duration-300 p-6 border border-solace-primary/20 h-full flex flex-col">
      {/* Header with name and degree */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-medium text-solace-dark mb-1">
            {advocate.firstName} {advocate.lastName}
          </h3>
          <p className="text-sm text-solace-primary font-medium">{advocate.degree}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-solace-dark">{advocate.city}</p>
          <p className="text-sm text-gray-500 font-light">
            {getExperienceLabel(advocate.yearsOfExperience)} experience
          </p>
        </div>
      </div>

      {/* Specialties */}
      <div className="mb-4 flex-grow">
        <h4 className="text-sm font-medium text-solace-dark mb-3">Specialties</h4>
        <div className="flex flex-wrap gap-2">
          {advocate.specialties.slice(0, 4).map((specialty, index) => (
            <span
              key={index}
              className="inline-block px-3 py-1 text-xs font-medium bg-solace-light text-solace-primary rounded-full border border-solace-primary/20"
            >
              {specialty}
            </span>
          ))}
          {advocate.specialties.length > 4 && (
            <span className="inline-block px-3 py-1 text-xs font-medium bg-gray-50 text-gray-500 rounded-full">
              +{advocate.specialties.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Contact information and actions */}
      <div className="pt-4 border-t border-gray-50 mt-auto">
        <div className="flex justify-between items-center mb-3">
          <div>
            <p className="text-sm text-gray-500 font-light">Contact</p>
            <p className="text-sm font-medium text-solace-dark">
              {formatPhoneNumber(advocate.phoneNumber)}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => onViewDetails?.(advocate)}
            className="flex-1 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-solace-dark text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-solace-primary focus:ring-offset-2"
            aria-label={`View details for ${advocate.firstName} ${advocate.lastName}`}
          >
            View Details
          </button>
          <button
            onClick={() => onContact?.(advocate)}
            className="flex-1 px-4 py-2 bg-solace-primary hover:bg-solace-secondary text-white text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-solace-primary focus:ring-offset-2"
            aria-label={`Contact ${advocate.firstName} ${advocate.lastName}`}
          >
            Contact
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvocateCard;