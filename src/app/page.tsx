"use client";

import { useEffect, useState } from "react";

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

export default function Home() {
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  const [filteredAdvocates, setFilteredAdvocates] = useState<Advocate[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdvocates = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log("fetching advocates...");
        
        const response = await fetch("/api/advocates");
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const jsonResponse = await response.json();
        
        if (!jsonResponse.data || !Array.isArray(jsonResponse.data)) {
          throw new Error('Invalid response format');
        }
        
        setAdvocates(jsonResponse.data);
        setFilteredAdvocates(jsonResponse.data);
      } catch (err) {
        console.error('Failed to fetch advocates:', err);
        setError(err instanceof Error ? err.message : 'Failed to load advocates');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAdvocates();
  }, []);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value.toLowerCase();
    setSearchTerm(newSearchTerm);

    console.log("filtering advocates...");
    const filtered = advocates.filter((advocate) => {
      // Safely convert all searchable fields to lowercase strings
      const firstName = advocate.firstName?.toLowerCase() || '';
      const lastName = advocate.lastName?.toLowerCase() || '';
      const city = advocate.city?.toLowerCase() || '';
      const degree = advocate.degree?.toLowerCase() || '';
      const specialtiesText = advocate.specialties?.join(' ').toLowerCase() || '';
      const experienceText = advocate.yearsOfExperience?.toString() || '';
      
      return (
        firstName.includes(newSearchTerm) ||
        lastName.includes(newSearchTerm) ||
        city.includes(newSearchTerm) ||
        degree.includes(newSearchTerm) ||
        specialtiesText.includes(newSearchTerm) ||
        experienceText.includes(newSearchTerm)
      );
    });

    setFilteredAdvocates(filtered);
  };

  const onReset = () => {
    console.log(advocates);
    setSearchTerm('');
    setFilteredAdvocates(advocates);
  };

  return (
    <main style={{ margin: "24px" }}>
      <h1>Solace Advocates</h1>
      <br />
      <br />
      <div>
        <p>Search</p>
        <p>
          Searching for: <span>{searchTerm}</span>
        </p>
        <input 
          style={{ border: "1px solid black" }} 
          value={searchTerm}
          onChange={onChange}
          placeholder="Search advocates..."
          aria-label="Search advocates"
        />
        <button onClick={onReset}>Reset Search</button>
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
          ) : filteredAdvocates.length === 0 && advocates.length > 0 ? (
            <tr>
              <td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>
                No advocates found matching your search.
              </td>
            </tr>
          ) : (
            filteredAdvocates.map((advocate, index) => {
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
    </main>
  );
}
