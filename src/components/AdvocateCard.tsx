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
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border border-gray-200">
      {/* Header with name and degree */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-1">
            {advocate.firstName} {advocate.lastName}
          </h3>
          <p className="text-sm text-blue-600 font-medium">{advocate.degree}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">{advocate.city}</p>
          <p className="text-sm text-gray-500">
            {getExperienceLabel(advocate.yearsOfExperience)} experience
          </p>
        </div>
      </div>

      {/* Specialties */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Specialties</h4>
        <div className="flex flex-wrap gap-2">
          {advocate.specialties.slice(0, 4).map((specialty, index) => (
            <span
              key={index}
              className="inline-block px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full"
            >
              {specialty}
            </span>
          ))}
          {advocate.specialties.length > 4 && (
            <span className="inline-block px-3 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
              +{advocate.specialties.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Contact information and actions */}
      <div className="pt-4 border-t border-gray-100">
        <div className="flex justify-between items-center mb-3">
          <div>
            <p className="text-sm text-gray-600">Contact</p>
            <p className="text-sm font-medium text-gray-900">
              {formatPhoneNumber(advocate.phoneNumber)}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => onViewDetails?.(advocate)}
            className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            aria-label={`View details for ${advocate.firstName} ${advocate.lastName}`}
          >
            View Details
          </button>
          <button
            onClick={() => onContact?.(advocate)}
            className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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