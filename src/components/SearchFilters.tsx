'use client';

import React, { useState } from 'react';

interface SearchFiltersProps {
  onFiltersChange: (filters: SearchFilters) => void;
  isLoading?: boolean;
}

export interface SearchFilters {
  query: string;
  city: string;
  degree: string;
  specialties: string;
  minExperience: string;
  maxExperience: string;
  sortBy: 'firstName' | 'lastName' | 'yearsOfExperience' | 'city';
  sortOrder: 'asc' | 'desc';
}

const SearchFiltersComponent: React.FC<SearchFiltersProps> = ({
  onFiltersChange,
  isLoading = false
}) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    city: '',
    degree: '',
    specialties: '',
    minExperience: '',
    maxExperience: '',
    sortBy: 'firstName',
    sortOrder: 'asc'
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters: SearchFilters = {
      query: '',
      city: '',
      degree: '',
      specialties: '',
      minExperience: '',
      maxExperience: '',
      sortBy: 'firstName',
      sortOrder: 'asc'
    };
    setFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  const commonDegrees = ['MD', 'PhD', 'MSW', 'LCSW', 'LMFT', 'PsyD'];
  const sortOptions = [
    { value: 'firstName', label: 'First Name' },
    { value: 'lastName', label: 'Last Name' },
    { value: 'yearsOfExperience', label: 'Experience' },
    { value: 'city', label: 'City' }
  ];

  const filterSuggestions = [
    'Depression',
    'Trauma & PTSD',
    'Men\'s issues',
    'Women\'s issues',
    'Relationship Issues',
    'Substance use/abuse',
    'LGBTQ',
    'Bipolar'
  ];

  const handleSuggestionClick = (suggestion: string) => {
    const newFilters = { ...filters, specialties: suggestion };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  return (
    <div className="bg-white rounded-xl shadow-solace border border-gray-100 p-6 mb-8">
      {/* Main search */}
      <div className="mb-4">
        <label htmlFor="search" className="block text-sm font-medium text-solace-dark mb-2">
          Search Advocates
        </label>
        <div className="relative">
          <input
            id="search"
            type="text"
            value={filters.query}
            onChange={(e) => handleFilterChange('query', e.target.value)}
            placeholder="Search by name, city, degree, or specialties..."
            disabled={isLoading}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-solace-primary focus:border-solace-primary disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors duration-200"
            aria-label="Search advocates"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Advanced filters toggle and suggestions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center text-sm text-solace-primary hover:text-solace-secondary font-medium"
          aria-expanded={showAdvanced}
          aria-controls="advanced-filters"
        >
          <span>{showAdvanced ? 'Hide' : 'Show'} advanced filters</span>
          <svg
            className={`ml-1 h-4 w-4 transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Filter suggestions - only show when advanced filters are hidden */}
        {!showAdvanced && (
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-gray-500 font-light mr-2">Quick filters:</span>
              {filterSuggestions.map((suggestion, index) => {
                const isActive = filters.specialties.toLowerCase() === suggestion.toLowerCase();
                return (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    disabled={isLoading}
                    className={`px-3 py-1 text-xs font-medium border rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${isActive
                        ? 'bg-solace-primary text-white border-solace-primary'
                        : 'bg-solace-light text-solace-primary border-solace-primary/20 hover:bg-solace-primary hover:text-white'
                      }`}
                  >
                    {suggestion}
                  </button>
                );
              })}
            </div>
            {/* Clear filters button - only show when there are active filters */}
            {(filters.specialties || filters.city || filters.degree || filters.minExperience || filters.maxExperience || filters.query) && (
              <div className="flex justify-end">
                <button
                  onClick={handleReset}
                  disabled={isLoading}
                  className="px-3 py-1 text-xs font-medium text-gray-500 hover:text-solace-primary transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Advanced filters */}
      {showAdvanced && (
        <div id="advanced-filters" className="space-y-4 pt-4 border-t border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* City filter */}
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-600 mb-1">
                City
              </label>
              <input
                id="city"
                type="text"
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
                placeholder="e.g., New York"
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-solace-primary focus:border-solace-primary disabled:bg-gray-50 transition-colors duration-200"
              />
            </div>

            {/* Degree filter */}
            <div>
              <label htmlFor="degree" className="block text-sm font-medium text-gray-600 mb-1">
                Degree
              </label>
              <select
                id="degree"
                value={filters.degree}
                onChange={(e) => handleFilterChange('degree', e.target.value)}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-solace-primary focus:border-solace-primary disabled:bg-gray-50 transition-colors duration-200"
              >
                <option value="">All degrees</option>
                {commonDegrees.map(degree => (
                  <option key={degree} value={degree}>{degree}</option>
                ))}
              </select>
            </div>

            {/* Specialties filter */}
            <div>
              <label htmlFor="specialties" className="block text-sm font-medium text-gray-600 mb-1">
                Specialties
              </label>
              <input
                id="specialties"
                type="text"
                value={filters.specialties}
                onChange={(e) => handleFilterChange('specialties', e.target.value)}
                placeholder="e.g., PTSD, anxiety"
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-solace-primary focus:border-solace-primary disabled:bg-gray-50 transition-colors duration-200"
              />
            </div>
          </div>

          {/* Experience range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="minExperience" className="block text-sm font-medium text-gray-600 mb-1">
                Minimum Experience (years)
              </label>
              <input
                id="minExperience"
                type="number"
                min="0"
                max="50"
                value={filters.minExperience}
                onChange={(e) => handleFilterChange('minExperience', e.target.value)}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-solace-primary focus:border-solace-primary disabled:bg-gray-50 transition-colors duration-200"
              />
            </div>
            <div>
              <label htmlFor="maxExperience" className="block text-sm font-medium text-gray-600 mb-1">
                Maximum Experience (years)
              </label>
              <input
                id="maxExperience"
                type="number"
                min="0"
                max="50"
                value={filters.maxExperience}
                onChange={(e) => handleFilterChange('maxExperience', e.target.value)}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-solace-primary focus:border-solace-primary disabled:bg-gray-50 transition-colors duration-200"
              />
            </div>
          </div>

          {/* Sort options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="sortBy" className="block text-sm font-medium text-gray-600 mb-1">
                Sort by
              </label>
              <select
                id="sortBy"
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value as SearchFilters['sortBy'])}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-solace-primary focus:border-solace-primary disabled:bg-gray-50 transition-colors duration-200"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-600 mb-1">
                Sort order
              </label>
              <select
                id="sortOrder"
                value={filters.sortOrder}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value as 'asc' | 'desc')}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-solace-primary focus:border-solace-primary disabled:bg-gray-50 transition-colors duration-200"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>

          {/* Reset button */}
          <div className="flex justify-end pt-4">
            <button
              onClick={handleReset}
              disabled={isLoading}
              className="px-6 py-2 text-sm font-medium text-solace-dark bg-gray-50 hover:bg-gray-100 rounded-lg disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFiltersComponent;