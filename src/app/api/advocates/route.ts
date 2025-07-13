import db from "../../../db";
import { advocates } from "../../../db/schema";
import { advocateData } from "../../../db/seed/advocates";
import { like, or, sql, desc, asc } from "drizzle-orm";
import { NextRequest } from "next/server";

interface SearchParams {
  q?: string;
  page?: string;
  limit?: string;
  city?: string;
  degree?: string;
  minExperience?: string;
  maxExperience?: string;
  sortBy?: 'firstName' | 'lastName' | 'yearsOfExperience' | 'city';
  sortOrder?: 'asc' | 'desc';
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract and validate query parameters
    const params: SearchParams = {
      q: searchParams.get('q') || undefined,
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
      city: searchParams.get('city') || undefined,
      degree: searchParams.get('degree') || undefined,
      minExperience: searchParams.get('minExperience') || undefined,
      maxExperience: searchParams.get('maxExperience') || undefined,
      sortBy: (searchParams.get('sortBy') as SearchParams['sortBy']) || 'firstName',
      sortOrder: (searchParams.get('sortOrder') as SearchParams['sortOrder']) || 'asc'
    };
    
    // Validate and sanitize inputs
    const page = Math.max(1, parseInt(params.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(params.limit) || 20)); // Cap at 100 per page
    const offset = (page - 1) * limit;
    
    // Try to use database first, fallback to mock data
    let data;
    let total = 0;
    
    try {
      // Check if database is available by testing connection
      const testQuery = await db.select().from(advocates).limit(1);
      
      // Build dynamic query with filters
      let query = db.select().from(advocates);
      const conditions = [];
      
      // Text search across multiple fields
      if (params.q && params.q.trim()) {
        const searchTerm = `%${params.q.toLowerCase().trim()}%`;
        conditions.push(
          or(
            like(sql`LOWER(${advocates.firstName})`, searchTerm),
            like(sql`LOWER(${advocates.lastName})`, searchTerm),
            like(sql`LOWER(${advocates.city})`, searchTerm),
            like(sql`LOWER(${advocates.degree})`, searchTerm),
            like(sql`LOWER(CAST(${advocates.specialties} AS TEXT))`, searchTerm),
            like(sql`CAST(${advocates.yearsOfExperience} AS TEXT)`, searchTerm)
          )
        );
      }
      
      // City filter
      if (params.city) {
        conditions.push(like(sql`LOWER(${advocates.city})`, `%${params.city.toLowerCase()}%`));
      }
      
      // Degree filter
      if (params.degree) {
        conditions.push(like(sql`LOWER(${advocates.degree})`, `%${params.degree.toLowerCase()}%`));
      }
      
      // Experience range filter
      if (params.minExperience) {
        const minExp = parseInt(params.minExperience);
        if (!isNaN(minExp)) {
          conditions.push(sql`${advocates.yearsOfExperience} >= ${minExp}`);
        }
      }
      
      if (params.maxExperience) {
        const maxExp = parseInt(params.maxExperience);
        if (!isNaN(maxExp)) {
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
      
      // Optimized count query using window function
      const countQuery = db.select({ 
        count: sql<number>`count(*) OVER()` 
      }).from(advocates);
      
      // Apply same WHERE conditions as main query for accurate count
      if (conditions.length > 0) {
        const countConditions = conditions.reduce((acc, condition, index) => 
          index === 0 ? condition : sql`${acc} AND ${condition}`, sql``);
        countQuery.where(countConditions);
      }
      
      const countResult = await countQuery.limit(1);
      total = countResult[0]?.count || 0;
      
    } catch (dbError) {
      console.log('Database not available, using mock data:', dbError);
      
      // Fallback to mock data with client-side filtering
      let filteredData = [...advocateData];
      
      // Apply search filter
      if (params.q && params.q.trim()) {
        const searchTerm = params.q.toLowerCase().trim();
        filteredData = filteredData.filter(advocate => 
          advocate.firstName.toLowerCase().includes(searchTerm) ||
          advocate.lastName.toLowerCase().includes(searchTerm) ||
          advocate.city.toLowerCase().includes(searchTerm) ||
          advocate.degree.toLowerCase().includes(searchTerm) ||
          advocate.specialties.some(s => s.toLowerCase().includes(searchTerm)) ||
          advocate.yearsOfExperience.toString().includes(searchTerm)
        );
      }
      
      // Apply other filters
      if (params.city) {
        filteredData = filteredData.filter(advocate => 
          advocate.city.toLowerCase().includes(params.city!.toLowerCase())
        );
      }
      
      if (params.degree) {
        filteredData = filteredData.filter(advocate => 
          advocate.degree.toLowerCase().includes(params.degree!.toLowerCase())
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
      
      // Apply pagination
      data = filteredData.slice(offset, offset + limit);
    }
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    return Response.json({
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
        query: params.q,
        city: params.city,
        degree: params.degree,
        minExperience: params.minExperience,
        maxExperience: params.maxExperience,
        sortBy: params.sortBy,
        sortOrder: params.sortOrder
      }
    });
    
  } catch (error) {
    console.error('Error in advocates API:', error);
    return Response.json(
      { 
        error: 'Internal server error',
        data: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false }
      },
      { status: 500 }
    );
  }
}
