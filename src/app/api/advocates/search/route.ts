import { advocates } from "../../../../db/schema";
import db from "../../../../db";
import { advocateData } from "../../../../db/seed/advocates";
import { like, or, sql, desc, asc } from "drizzle-orm";
import { NextRequest } from "next/server";
import { searchCache, generateCacheKey } from "../../../../lib/cache";
import { apiRateLimiter, getClientId } from "../../../../lib/rateLimit";

interface SearchParams {
  q?: string;
  page?: string;
  limit?: string;
  city?: string;
  degree?: string;
  specialties?: string;
  minExperience?: string;
  maxExperience?: string;
  sortBy?: 'firstName' | 'lastName' | 'yearsOfExperience' | 'city';
  sortOrder?: 'asc' | 'desc';
}

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientId = getClientId(request);
    const rateLimitResult = apiRateLimiter.check(clientId);
    
    if (!rateLimitResult.allowed) {
      return Response.json(
        { 
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later.',
          resetTime: rateLimitResult.resetTime
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '100',
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
          }
        }
      );
    }

    const { searchParams } = new URL(request.url);
    
    // Extract and validate query parameters
    const params: SearchParams = {
      q: searchParams.get('q') || undefined,
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
      city: searchParams.get('city') || undefined,
      degree: searchParams.get('degree') || undefined,
      specialties: searchParams.get('specialties') || undefined,
      minExperience: searchParams.get('minExperience') || undefined,
      maxExperience: searchParams.get('maxExperience') || undefined,
      sortBy: (searchParams.get('sortBy') as SearchParams['sortBy']) || 'firstName',
      sortOrder: (searchParams.get('sortOrder') as SearchParams['sortOrder']) || 'asc'
    };
    
    // Validate and sanitize inputs
    const page = Math.max(1, parseInt(params.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(params.limit) || 20));
    const offset = (page - 1) * limit;
    
    // Input sanitization
    const sanitizeInput = (input: string | undefined): string | undefined => {
      return input?.trim().substring(0, 100); // Limit length and trim
    };
    
    const searchQuery = sanitizeInput(params.q);
    const cityFilter = sanitizeInput(params.city);
    const degreeFilter = sanitizeInput(params.degree);
    const specialtiesFilter = sanitizeInput(params.specialties);
    
    // Check cache first
    const cacheKey = generateCacheKey(params);
    const cachedResult = searchCache.get(cacheKey);
    
    if (cachedResult) {
      return Response.json({
        ...cachedResult,
        cached: true
      }, {
        headers: {
          'X-RateLimit-Limit': '100',
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-Cache': 'HIT'
        }
      });
    }
    
    let data;
    let total = 0;
    
    try {
      // Try database first
      let query = db.select().from(advocates);
      const conditions = [];
      
      // Build search conditions
      if (searchQuery) {
        const searchTerm = `%${searchQuery.toLowerCase()}%`;
        conditions.push(
          or(
            like(sql`LOWER(${advocates.firstName})`, searchTerm),
            like(sql`LOWER(${advocates.lastName})`, searchTerm),
            like(sql`LOWER(${advocates.city})`, searchTerm),
            like(sql`LOWER(${advocates.degree})`, searchTerm),
            like(sql`LOWER(CAST(${advocates.specialties} AS TEXT))`, searchTerm)
          )
        );
      }
      
      if (cityFilter) {
        conditions.push(like(sql`LOWER(${advocates.city})`, `%${cityFilter.toLowerCase()}%`));
      }
      
      if (degreeFilter) {
        conditions.push(like(sql`LOWER(${advocates.degree})`, `%${degreeFilter.toLowerCase()}%`));
      }
      
      if (specialtiesFilter) {
        conditions.push(like(sql`LOWER(CAST(${advocates.specialties} AS TEXT))`, `%${specialtiesFilter.toLowerCase()}%`));
      }
      
      // Experience range filters
      if (params.minExperience) {
        const minExp = parseInt(params.minExperience);
        if (!isNaN(minExp) && minExp >= 0) {
          conditions.push(sql`${advocates.yearsOfExperience} >= ${minExp}`);
        }
      }
      
      if (params.maxExperience) {
        const maxExp = parseInt(params.maxExperience);
        if (!isNaN(maxExp) && maxExp >= 0) {
          conditions.push(sql`${advocates.yearsOfExperience} <= ${maxExp}`);
        }
      }
      
      // Apply WHERE conditions
      if (conditions.length > 0) {
        query = query.where(sql`${conditions.reduce((acc, condition, index) => 
          index === 0 ? condition : sql`${acc} AND ${condition}`, sql``)}`
        );
      }
      
      // Apply sorting
      const sortColumn = advocates[params.sortBy] || advocates.firstName;
      query = query.orderBy(params.sortOrder === 'desc' ? desc(sortColumn) : asc(sortColumn));
      
      // Apply pagination
      query = query.limit(limit).offset(offset);
      
      data = await query;
      
      // Optimized count query using window function for better performance
      const countQuery = db.select({ 
        count: sql<number>`count(*) OVER()` 
      }).from(advocates);
      
      if (conditions.length > 0) {
        const countConditions = conditions.reduce((acc, condition, index) => 
          index === 0 ? condition : sql`${acc} AND ${condition}`, sql``);
        countQuery.where(countConditions);
      }
      
      const countResult = await countQuery.limit(1);
      total = countResult[0]?.count || 0;
      
    } catch (dbError) {
      console.log('Database not available, using mock data');
      
      // Fallback to mock data
      let filteredData = [...advocateData];
      
      // Apply filters to mock data
      if (searchQuery) {
        const searchTerm = searchQuery.toLowerCase();
        filteredData = filteredData.filter(advocate => 
          advocate.firstName.toLowerCase().includes(searchTerm) ||
          advocate.lastName.toLowerCase().includes(searchTerm) ||
          advocate.city.toLowerCase().includes(searchTerm) ||
          advocate.degree.toLowerCase().includes(searchTerm) ||
          advocate.specialties.some(s => s.toLowerCase().includes(searchTerm)) ||
          advocate.yearsOfExperience.toString().includes(searchTerm)
        );
      }
      
      if (cityFilter) {
        filteredData = filteredData.filter(advocate => 
          advocate.city.toLowerCase().includes(cityFilter.toLowerCase())
        );
      }
      
      if (degreeFilter) {
        filteredData = filteredData.filter(advocate => 
          advocate.degree.toLowerCase().includes(degreeFilter.toLowerCase())
        );
      }
      
      if (specialtiesFilter) {
        filteredData = filteredData.filter(advocate => 
          advocate.specialties.some(s => s.toLowerCase().includes(specialtiesFilter.toLowerCase()))
        );
      }
      
      if (params.minExperience) {
        const minExp = parseInt(params.minExperience);
        if (!isNaN(minExp)) {
          filteredData = filteredData.filter(advocate => advocate.yearsOfExperience >= minExp);
        }
      }
      
      if (params.maxExperience) {
        const maxExp = parseInt(params.maxExperience);
        if (!isNaN(maxExp)) {
          filteredData = filteredData.filter(advocate => advocate.yearsOfExperience <= maxExp);
        }
      }
      
      // Apply sorting
      filteredData.sort((a, b) => {
        let aVal: any, bVal: any;
        
        switch (params.sortBy) {
          case 'yearsOfExperience':
            aVal = a.yearsOfExperience;
            bVal = b.yearsOfExperience;
            break;
          case 'lastName':
            aVal = a.lastName;
            bVal = b.lastName;
            break;
          case 'city':
            aVal = a.city;
            bVal = b.city;
            break;
          default:
            aVal = a.firstName;
            bVal = b.firstName;
        }
        
        if (typeof aVal === 'string') {
          const comparison = aVal.localeCompare(bVal);
          return params.sortOrder === 'desc' ? -comparison : comparison;
        } else {
          const comparison = aVal - bVal;
          return params.sortOrder === 'desc' ? -comparison : comparison;
        }
      });
      
      total = filteredData.length;
      data = filteredData.slice(offset, offset + limit);
    }
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    const responseData = {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage
      },
      filters: {
        query: searchQuery,
        city: cityFilter,
        degree: degreeFilter,
        specialties: specialtiesFilter,
        minExperience: params.minExperience,
        maxExperience: params.maxExperience,
        sortBy: params.sortBy,
        sortOrder: params.sortOrder
      }
    };
    
    // Cache the result (cache for 5 minutes for search results)
    searchCache.set(cacheKey, responseData, 300000);
    
    return Response.json(responseData, {
      headers: {
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-Cache': 'MISS'
      }
    });
    
  } catch (error) {
    console.error('Error in search API:', error);
    return Response.json(
      { 
        error: 'Search failed',
        message: 'Unable to search advocates at this time',
        data: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false }
      },
      { status: 500 }
    );
  }
}