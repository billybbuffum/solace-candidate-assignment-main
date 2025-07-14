"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useDebounce } from '../hooks/useDebounce';
import AdvocateCard from '../components/AdvocateCard';
import SearchFiltersComponent, { SearchFilters } from '../components/SearchFilters';
import Pagination from '../components/Pagination';
import AdvocateModal from '../components/AdvocateModal';

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
  const [allAdvocates, setAllAdvocates] = useState<Advocate[]>([]); // Store all advocates
  const [filteredAdvocates, setFilteredAdvocates] = useState<Advocate[]>([]); // Filtered results
  const [advocates, setAdvocates] = useState<Advocate[]>([]); // Displayed advocates (for compatibility)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [selectedAdvocate, setSelectedAdvocate] = useState<Advocate | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
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
  
  // AbortController to cancel pending requests
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Legacy fetch function (kept for compatibility but no longer used)
  const fetchAdvocates = useCallback(async (searchFilters: SearchFilters, page: number = 1, showLoadingState: boolean = true) => {
    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new AbortController for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    try {
      if (showLoadingState) {
        setIsLoading(true);
      } else {
        setIsSearching(true);
      }
      setError(null);
      
      console.log(`Fetching advocates - Page: ${page}`, searchFilters);
      
      const url = buildSearchUrl(searchFilters, page);
      const response = await fetch(url, {
        signal: abortController.signal
      });
      
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
      
      // Remove all automatic scrolling - user stays at current position
      
    } catch (err) {
      // Don't update state if request was aborted
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      
      console.error('Failed to fetch advocates:', err);
      setError(err instanceof Error ? err.message : 'Failed to load advocates');
      setAdvocates([]);
      setPagination(null);
    } finally {
      // Only update loading state if request wasn't aborted
      if (!abortController.signal.aborted) {
        setIsLoading(false);
        setIsSearching(false);
      }
    }
  }, [buildSearchUrl]);
  
  // Load all advocates once and apply client-side filtering
  const loadAllAdvocates = useCallback(async () => {
    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new AbortController for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Loading all advocates for client-side filtering');
      
      // Load all advocates (limit 100 to be safe)
      const url = `/api/advocates/search?page=1&limit=100&sortBy=firstName&sortOrder=asc`;
      const response = await fetch(url, {
        signal: abortController.signal
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const jsonResponse: ApiResponse = await response.json();
      
      if (!jsonResponse.data || !Array.isArray(jsonResponse.data)) {
        throw new Error('Invalid response format');
      }
      
      setAllAdvocates(jsonResponse.data);
      console.log(`Loaded ${jsonResponse.data.length} advocates for client-side filtering`);
      
    } catch (err) {
      // Don't update state if request was aborted
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      
      console.error('Failed to load advocates:', err);
      setError(err instanceof Error ? err.message : 'Failed to load advocates');
      setAllAdvocates([]);
    } finally {
      // Only update loading state if request wasn't aborted
      if (!abortController.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, []);
  
  // Client-side filtering
  useEffect(() => {
    if (allAdvocates.length === 0) return;
    
    setIsSearching(true);
    
    // Apply filters
    let filtered = [...allAdvocates];
    
    // Query filter
    if (debouncedFilters.query.trim()) {
      const query = debouncedFilters.query.toLowerCase().trim();
      filtered = filtered.filter(advocate => 
        advocate.firstName.toLowerCase().includes(query) ||
        advocate.lastName.toLowerCase().includes(query) ||
        advocate.city.toLowerCase().includes(query) ||
        advocate.degree.toLowerCase().includes(query) ||
        advocate.specialties.some(specialty => specialty.toLowerCase().includes(query))
      );
    }
    
    // City filter
    if (debouncedFilters.city.trim()) {
      const city = debouncedFilters.city.toLowerCase().trim();
      filtered = filtered.filter(advocate => 
        advocate.city.toLowerCase().includes(city)
      );
    }
    
    // Degree filter
    if (debouncedFilters.degree.trim()) {
      filtered = filtered.filter(advocate => 
        advocate.degree === debouncedFilters.degree
      );
    }
    
    // Specialties filter
    if (debouncedFilters.specialties.trim()) {
      const specialty = debouncedFilters.specialties.toLowerCase().trim();
      filtered = filtered.filter(advocate => 
        advocate.specialties.some(s => s.toLowerCase().includes(specialty))
      );
    }
    
    // Experience filters
    if (debouncedFilters.minExperience.trim()) {
      const min = parseInt(debouncedFilters.minExperience);
      if (!isNaN(min)) {
        filtered = filtered.filter(advocate => advocate.yearsOfExperience >= min);
      }
    }
    
    if (debouncedFilters.maxExperience.trim()) {
      const max = parseInt(debouncedFilters.maxExperience);
      if (!isNaN(max)) {
        filtered = filtered.filter(advocate => advocate.yearsOfExperience <= max);
      }
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[debouncedFilters.sortBy as keyof Advocate];
      const bValue = b[debouncedFilters.sortBy as keyof Advocate];
      
      let comparison = 0;
      if (aValue < bValue) comparison = -1;
      if (aValue > bValue) comparison = 1;
      
      return debouncedFilters.sortOrder === 'desc' ? -comparison : comparison;
    });
    
    // Create pagination
    const itemsPerPage = 12;
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageData = filtered.slice(startIndex, endIndex);
    
    setAdvocates(pageData);
    setPagination({
      page: currentPage,
      limit: itemsPerPage,
      total: filtered.length,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1
    });
    
    setIsSearching(false);
    
    console.log(`Filtered ${filtered.length} advocates, showing ${pageData.length} on page ${currentPage}`);
  }, [allAdvocates, debouncedFilters, currentPage]);
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedFilters]);
  
  // Initial load
  useEffect(() => {
    loadAllAdvocates();
  }, []); // Only run on mount
  
  // Cleanup AbortController on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: SearchFilters) => {
    setFilters(newFilters);
  }, []);

  // Handle pagination
  const handlePageChange = useCallback((newPage: number) => {
    if (newPage >= 1 && pagination && newPage <= pagination.totalPages) {
      // Capture current scroll position
      const currentScrollY = window.scrollY;
      setCurrentPage(newPage);
      
      // Restore scroll position after state update
      setTimeout(() => {
        window.scrollTo(0, currentScrollY);
      }, 0);
    }
  }, [pagination]);

  // Handle view details action
  const handleViewDetails = useCallback((advocate: Advocate) => {
    setSelectedAdvocate(advocate);
    setIsModalOpen(true);
  }, []);

  // Handle modal close
  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setSelectedAdvocate(null);
  }, []);

  // Handle contact action
  const handleContact = useCallback((advocate: Advocate) => {
    // In a real app, this would open a contact modal or navigate to contact page
    alert(`Contacting ${advocate.firstName} ${advocate.lastName} at ${advocate.phoneNumber}`);
  }, []);

  return (
    <div className="min-h-screen bg-solace-light">
      {/* Header */}
      <header className="bg-solace-primary shadow-solace">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-hero md:text-hero-lg font-mollie text-white mb-4">
              Find Your Perfect Advocate
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto font-light leading-relaxed">
              Connect with qualified mental health advocates who understand your needs and can provide the support you deserve.
            </p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search filters */}
        <SearchFiltersComponent 
          onFiltersChange={handleFiltersChange}
          isLoading={isLoading || isSearching}
        />

        {/* Results section */}
        <div className="mb-6" data-results-section>
          {/* Loading state */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-solace-primary"></div>
              <p className="mt-4 text-solace-dark">Loading advocates...</p>
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
                  className="mt-4 px-6 py-3 bg-solace-primary text-white rounded-lg hover:bg-solace-secondary transition-colors duration-200 font-medium"
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
                className="px-6 py-3 bg-solace-primary text-white rounded-lg hover:bg-solace-secondary transition-colors duration-200 font-medium"
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
                <div className="flex items-center justify-center mb-4 text-solace-primary">
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-solace-primary mr-2"></div>
                  <span className="text-sm font-medium">Updating results...</span>
                </div>
              )}

              {/* Results grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr">
                {advocates.map((advocate, index) => {
                  // Use a unique key - prefer id if available, otherwise use index with content
                  const key = advocate.id || `${advocate.firstName}-${advocate.lastName}-${index}`;
                  
                  return (
                    <AdvocateCard
                      key={key}
                      advocate={advocate}
                      onContact={handleContact}
                      onViewDetails={handleViewDetails}
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
      <footer className="bg-white border-t border-gray-100 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center text-solace-dark">
            <p className="font-light text-lg">&copy; 2024 Solace. Connecting you with the care you deserve.</p>
          </div>
        </div>
      </footer>

      {/* Advocate Details Modal */}
      <AdvocateModal
        advocate={selectedAdvocate}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onContact={handleContact}
      />
    </div>
  );
}