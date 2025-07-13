"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useDebounce } from '../hooks/useDebounce';

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
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  
  // Debounce search term to avoid excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Memoized function to build search URL
  const buildSearchUrl = useCallback((searchQuery: string, page: number = 1) => {
    const params = new URLSearchParams();
    
    if (searchQuery.trim()) {
      params.set('q', searchQuery.trim());
    }
    params.set('page', page.toString());
    params.set('limit', '20');
    params.set('sortBy', 'firstName');
    params.set('sortOrder', 'asc');
    
    return `/api/advocates/search?${params.toString()}`;
  }, []);
  
  // Fetch advocates with search and pagination
  const fetchAdvocates = useCallback(async (searchQuery: string = '', page: number = 1, showLoadingState: boolean = true) => {
    try {
      if (showLoadingState) {
        setIsLoading(true);
      } else {
        setIsSearching(true);
      }
      setError(null);
      
      console.log(`Fetching advocates - Query: "${searchQuery}", Page: ${page}`);
      
      const url = buildSearchUrl(searchQuery, page);
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
    fetchAdvocates('', 1, true);
  }, [fetchAdvocates]);
  
  // Search when debounced term changes
  useEffect(() => {
    if (debouncedSearchTerm !== searchTerm) return; // Only trigger when debounce is complete
    
    setCurrentPage(1); // Reset to first page on new search
    fetchAdvocates(debouncedSearchTerm, 1, false);
  }, [debouncedSearchTerm, fetchAdvocates]);
  
  // Handle page changes
  useEffect(() => {
    if (currentPage === 1) return; // Skip initial load
    fetchAdvocates(debouncedSearchTerm, currentPage, false);
  }, [currentPage, debouncedSearchTerm, fetchAdvocates]);

  // Handle search input changes
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    // Debouncing happens automatically via useDebounce hook
  }, []);

  // Handle search reset
  const handleReset = useCallback(() => {
    setSearchTerm('');
    setCurrentPage(1);
    // This will trigger the useEffect and fetch all advocates
  }, []);
  
  // Handle pagination
  const handlePageChange = useCallback((newPage: number) => {
    if (newPage >= 1 && pagination && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
    }
  }, [pagination]);
  
  // Memoized pagination component
  const PaginationComponent = useMemo(() => {
    if (!pagination || pagination.totalPages <= 1) return null;
    
    return (
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <button 
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={!pagination.hasPrevPage || isSearching}
          style={{ 
            margin: '0 5px', 
            padding: '8px 12px',
            disabled: !pagination.hasPrevPage || isSearching ? 'opacity: 0.5' : undefined
          }}
        >
          Previous
        </button>
        
        <span style={{ margin: '0 15px' }}>
          Page {pagination.page} of {pagination.totalPages} 
          ({pagination.total} advocates)
        </span>
        
        <button 
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={!pagination.hasNextPage || isSearching}
          style={{ 
            margin: '0 5px', 
            padding: '8px 12px',
            opacity: !pagination.hasNextPage || isSearching ? 0.5 : 1
          }}
        >
          Next
        </button>
      </div>
    );
  }, [pagination, currentPage, isSearching, handlePageChange]);

  return (
    <main style={{ margin: "24px" }}>
      <h1>Solace Advocates</h1>
      <br />
      <br />
      <div>
        <p>Search</p>
        {searchTerm && (
          <p>
            Searching for: <span>{searchTerm}</span>
            {isSearching && <span style={{ marginLeft: '10px', fontStyle: 'italic' }}>Searching...</span>}
          </p>
        )}
        <input 
          style={{ border: "1px solid black", padding: '8px', width: '300px' }} 
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search advocates by name, city, degree, or specialties..."
          aria-label="Search advocates"
          disabled={isLoading}
        />
        <button 
          onClick={handleReset}
          disabled={isLoading || (!searchTerm && currentPage === 1)}
          style={{ marginLeft: '10px', padding: '8px 12px' }}
        >
          Reset Search
        </button>
      </div>
      <br />
      <br />
      <table>
        <thead>
          <th>First Name</th>
          <th>Last Name</th>
          <th>City</th>
          <th>Degree</th>
          <th>Specialties</th>
          <th>Years of Experience</th>
          <th>Phone Number</th>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>
                Loading advocates...
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan={7} style={{ textAlign: 'center', padding: '20px', color: 'red' }}>
                Error: {error}
              </td>
            </tr>
          ) : advocates.length === 0 && !isLoading && !error ? (
            <tr>
              <td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>
                No advocates found matching your search.
              </td>
            </tr>
          ) : (
            advocates.map((advocate, index) => {
              // Use a unique key - prefer id if available, otherwise use index with content
              const key = advocate.id || `${advocate.firstName}-${advocate.lastName}-${index}`;
              
              return (
                <tr key={key}>
                  <td>{advocate.firstName}</td>
                  <td>{advocate.lastName}</td>
                  <td>{advocate.city}</td>
                  <td>{advocate.degree}</td>
                  <td>
                    {advocate.specialties?.map((specialty, specialtyIndex) => (
                      <div key={`${key}-specialty-${specialtyIndex}`}>{specialty}</div>
                    ))}
                  </td>
                  <td>{advocate.yearsOfExperience}</td>
                  <td>{advocate.phoneNumber}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
      
      {PaginationComponent}
    </main>
  );
}
