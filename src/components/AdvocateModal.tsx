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
        <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 id="modal-title" className="text-xl font-semibold text-gray-900">
              {advocate.firstName} {advocate.lastName}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md p-1"
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
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Degree</h3>
                  <p className="text-blue-600 font-medium">{advocate.degree}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Location</h3>
                  <p className="text-gray-900">{advocate.city}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Experience</h3>
                  <p className="text-gray-900">{getExperienceLabel(advocate.yearsOfExperience)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Phone</h3>
                  <p className="text-gray-900">{formatPhoneNumber(advocate.phoneNumber)}</p>
                </div>
              </div>
            </div>

            {/* All specialties */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">All Specialties</h3>
              <div className="flex flex-wrap gap-2">
                {advocate.specialties.map((specialty, index) => (
                  <span
                    key={index}
                    className="inline-block px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded-full"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>

            {/* Additional info section */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-medium text-blue-900 mb-2">About This Advocate</h3>
              <p className="text-sm text-blue-800">
                {advocate.firstName} is a qualified mental health advocate with {getExperienceLabel(advocate.yearsOfExperience)} of experience 
                specializing in {advocate.specialties.length} areas of care. Based in {advocate.city}, they hold a {advocate.degree} degree 
                and are ready to provide the support you need.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200"
            >
              Close
            </button>
            <button
              onClick={() => {
                onContact(advocate);
                onClose();
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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