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

interface AdvocateModalProps {
  advocate: Advocate | null;
  isOpen: boolean;
  onClose: () => void;
  onContact: (advocate: Advocate) => void;
}

const AdvocateModal: React.FC<AdvocateModalProps> = ({
  advocate,
  isOpen,
  onClose,
  onContact
}) => {
  if (!isOpen || !advocate) return null;

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
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-solace-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 id="modal-title" className="text-xl font-medium text-solace-dark">
              {advocate.firstName} {advocate.lastName}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-solace-primary focus:outline-none focus:ring-2 focus:ring-solace-primary rounded-md p-1"
              aria-label="Close modal"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Basic info */}
            <div className="mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Degree</h3>
                  <p className="text-solace-primary font-medium">{advocate.degree}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Location</h3>
                  <p className="text-solace-dark">{advocate.city}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Experience</h3>
                  <p className="text-solace-dark">{getExperienceLabel(advocate.yearsOfExperience)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Phone</h3>
                  <p className="text-solace-dark">{formatPhoneNumber(advocate.phoneNumber)}</p>
                </div>
              </div>
            </div>

            {/* All specialties */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-solace-dark mb-3">All Specialties</h3>
              <div className="flex flex-wrap gap-2">
                {advocate.specialties.map((specialty, index) => (
                  <span
                    key={index}
                    className="inline-block px-3 py-1 text-sm font-medium bg-solace-light text-solace-primary rounded-full border border-solace-primary/20"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>

            {/* Additional info section */}
            <div className="bg-solace-light rounded-lg p-4 mb-6">
              <h3 className="text-sm font-medium text-solace-dark mb-2">About This Advocate</h3>
              <p className="text-sm text-solace-dark font-light">
                {advocate.firstName} is a qualified mental health advocate with {getExperienceLabel(advocate.yearsOfExperience)} of experience 
                specializing in {advocate.specialties.length} areas of care. Based in {advocate.city}, they hold a {advocate.degree} degree 
                and are ready to provide the support you need.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
            <button
              onClick={onClose}
              className="px-6 py-2 text-sm font-medium text-solace-dark bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              Close
            </button>
            <button
              onClick={() => {
                onContact(advocate);
                onClose();
              }}
              className="px-6 py-2 text-sm font-medium text-white bg-solace-primary hover:bg-solace-secondary rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-solace-primary focus:ring-offset-2"
            >
              Contact {advocate.firstName}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvocateModal;