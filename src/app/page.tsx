"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useDebounce } from '../hooks/useDebounce';
import AdvocateCard from '../components/AdvocateCard';
import SearchFiltersComponent, { SearchFilters } from '../components/SearchFilters';
import Pagination from '../components/Pagination';

// Define types for better type safety
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

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface ApiResponse {
  data: Advocate[];
  pagination: PaginationInfo;
  filters: Record<string, any>;
}

export default function Home() {
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
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
  
  // Debounce search term to avoid excessive API calls
  const debouncedFilters = useDebounce(filters, 300);

  // Memoized function to build search URL
  const buildSearchUrl = useCallback((searchFilters: SearchFilters, page: number = 1) => {
    const params = new URLSearchParams();
    
    if (searchFilters.query.trim()) {
      params.set('q', searchFilters.query.trim());
    }
    if (searchFilters.city.trim()) {
      params.set('city', searchFilters.city.trim());
    }
    if (searchFilters.degree.trim()) {
      params.set('degree', searchFilters.degree.trim());
    }
    if (searchFilters.specialties.trim()) {
      params.set('specialties', searchFilters.specialties.trim());
    }
    if (searchFilters.minExperience.trim()) {
      params.set('minExperience', searchFilters.minExperience.trim());
    }
    if (searchFilters.maxExperience.trim()) {
      params.set('maxExperience', searchFilters.maxExperience.trim());
    }
    
    params.set('page', page.toString());
    params.set('limit', '12'); // Show 12 cards per page for better layout
    params.set('sortBy', searchFilters.sortBy);
    params.set('sortOrder', searchFilters.sortOrder);
    
    return `/api/advocates/search?${params.toString()}`;
  }, []);
  
  // Fetch advocates with search and pagination
  const fetchAdvocates = useCallback(async (searchFilters: SearchFilters, page: number = 1, showLoadingState: boolean = true) => {
    try {
      if (showLoadingState) {
        setIsLoading(true);
      } else {
        setIsSearching(true);
      }
      setError(null);
      
      console.log(`Fetching advocates - Page: ${page}`, searchFilters);
      
      const url = buildSearchUrl(searchFilters, page);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const jsonResponse: ApiResponse = await response.json();
      
      if (!jsonResponse.data || !Array.isArray(jsonResponse.data)) {
        throw new Error('Invalid response format');
      }
      
      setAdvocates(jsonResponse.data);
      setPagination(jsonResponse.pagination);
      
      // Reset to page 1 if we're on a page that doesn't exist anymore
      if (jsonResponse.pagination.page > jsonResponse.pagination.totalPages && jsonResponse.pagination.totalPages > 0) {
        setCurrentPage(1);
      }
      
    } catch (err) {
      console.error('Failed to fetch advocates:', err);
      setError(err instanceof Error ? err.message : 'Failed to load advocates');
      setAdvocates([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  }, [buildSearchUrl]);
  
  // Initial load
  useEffect(() => {
    fetchAdvocates(filters, 1, true);
  }, []); // Only run on mount
  
  // Search when debounced filters change
  useEffect(() => {
    if (JSON.stringify(debouncedFilters) === JSON.stringify(filters)) {
      setCurrentPage(1); // Reset to first page on new search
      fetchAdvocates(debouncedFilters, 1, false);
    }
  }, [debouncedFilters, fetchAdvocates]);
  
  // Handle page changes
  useEffect(() => {
    if (currentPage === 1) return; // Skip initial load
    fetchAdvocates(debouncedFilters, currentPage, false);
  }, [currentPage, debouncedFilters, fetchAdvocates]);

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: SearchFilters) => {
    setFilters(newFilters);
  }, []);

  // Handle pagination
  const handlePageChange = useCallback((newPage: number) => {
    if (newPage >= 1 && pagination && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
      // Scroll to top when page changes
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [pagination]);

  // Handle contact action
  const handleContact = useCallback((advocate: Advocate) => {
    // In a real app, this would open a contact modal or navigate to contact page
    alert(`Contacting ${advocate.firstName} ${advocate.lastName} at ${advocate.phoneNumber}`);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Find Your Perfect Advocate
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Connect with qualified mental health advocates who understand your needs and can provide the support you deserve.
            </p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search filters */}
        <SearchFiltersComponent 
          onFiltersChange={handleFiltersChange}
          isLoading={isLoading || isSearching}
        />

        {/* Results section */}
        <div className="mb-6">
          {/* Loading state */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading advocates...</p>
            </div>
          )}

          {/* Error state */}
          {error && !isLoading && (
            <div className="text-center py-12">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                <svg className="h-12 w-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Advocates</h3>
                <p className="text-red-600">{error}</p>
                <button
                  onClick={() => fetchAdvocates(filters, currentPage, true)}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !error && advocates.length === 0 && (
            <div className="text-center py-12">
              <svg className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No advocates found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search criteria or filters to find more advocates.
              </p>
              <button
                onClick={() => setFilters({
                  query: '',
                  city: '',
                  degree: '',
                  specialties: '',
                  minExperience: '',
                  maxExperience: '',
                  sortBy: 'firstName',
                  sortOrder: 'asc'
                })}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                Clear All Filters
              </button>
            </div>
          )}

          {/* Advocates grid */}
          {!isLoading && !error && advocates.length > 0 && (
            <>
              {/* Search indicator */}
              {isSearching && (
                <div className="flex items-center justify-center mb-4 text-blue-600">
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  <span className="text-sm">Updating results...</span>
                </div>
              )}

              {/* Results grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {advocates.map((advocate, index) => {
                  // Use a unique key - prefer id if available, otherwise use index with content
                  const key = advocate.id || `${advocate.firstName}-${advocate.lastName}-${index}`;
                  
                  return (
                    <AdvocateCard
                      key={key}
                      advocate={advocate}
                      onContact={handleContact}
                    />
                  );
                })}
              </div>

              {/* Pagination */}
              {pagination && (
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  totalItems={pagination.total}
                  itemsPerPage={pagination.limit}
                  onPageChange={handlePageChange}
                  isLoading={isSearching}
                />
              )}
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 Solace. Connecting you with the care you deserve.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}