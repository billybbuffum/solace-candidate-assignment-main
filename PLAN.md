# Solace Engineering Assignment - Development Plan

## 🎯 **Assignment Overview**
Fix bugs, improve UI/UX, and optimize performance for an advocate search application. **Time limit: 2 hours**

## 🔍 **Current Issues Identified**
From analyzing the codebase, I found several critical problems:

### Critical Bugs:
- **Line 32 in page.tsx**: `advocate.yearsOfExperience.includes(searchTerm)` will crash (number doesn't have includes method)
- Missing React `key` props in table rows
- Direct DOM manipulation with `getElementById` (anti-pattern)
- No error handling around fetch operations

### Performance Issues:
- Client-side filtering instead of server-side search
- No debouncing on search input
- Database not being used (commented out)
- No pagination for large datasets
- Missing loading states

### UI/UX Problems:
- Basic unstyled table interface
- Poor accessibility (no ARIA labels)
- No responsive design
- Poor search experience

## 📋 **Development Plan - 5 Focused PRs**

### **PR 1: Critical Bug Fixes & Anti-patterns** (Priority: HIGH)
**Branch**: `fix/critical-bugs`
**Estimated time**: 20 minutes

**Tasks**:
- Fix `yearsOfExperience.includes()` bug in search logic  
- Add missing React `key` props to table rows
- Replace `getElementById` with proper React state management
- Add try/catch error handling around fetch operations
- Fix TypeScript typing issues
- Add basic input validation

**Impact**: Prevents crashes, follows React best practices

---

### **PR 2: Backend Performance & Database Integration** (Priority: HIGH)
**Branch**: `feat/backend-performance`
**Estimated time**: 30 minutes

**Tasks**:
- Enable database usage (uncomment and configure)
- Create `/api/advocates/search` endpoint with query parameters
- Add pagination support (`?page=1&limit=20`)
- Add server-side filtering by specialties, city, experience
- Add input sanitization and validation
- Add database indexes for search performance

**Impact**: Enables searching hundreds of thousands of advocates efficiently

---

### **PR 3: Frontend Performance Improvements** (Priority: HIGH)
**Branch**: `feat/frontend-performance`  
**Estimated time**: 25 minutes

**Tasks**:
- Implement debounced search input (300ms delay)
- Add loading states and error boundaries
- Replace client-side filtering with server-side API calls
- Add proper React hooks patterns (useCallback, useMemo)
- Implement pagination UI components
- Add proper TypeScript types

**Impact**: Smooth user experience, proper React patterns

---

### **PR 4: UI/UX Design Overhaul** (Priority: HIGH)
**Branch**: `feat/ui-redesign`
**Estimated time**: 35 minutes

**Tasks**:
- Create modern, responsive design with Tailwind CSS
- Replace table with card-based layout for better mobile experience
- Add advanced search filters (specialties dropdown, experience range)
- Implement sorting options (name, experience, location)
- Add proper ARIA labels and semantic HTML
- Add empty states and error messaging
- Improve typography and spacing

**Impact**: Professional UI that matches Solace's design values

---

### **PR 5: Additional Features** (Priority: MEDIUM - Time Permitting)
**Branch**: `feat/enhancements`
**Estimated time**: 10 minutes

**Tasks**:
- Add search suggestions/autocomplete
- Implement favorites/bookmarking
- Add advocate profile modals
- Performance monitoring setup
- Additional accessibility improvements

**Impact**: Enhanced user experience beyond basic requirements

---

## 🔄 **Git Workflow Strategy**

1. **Create feature branches** from `main` for each PR
2. **Independent, focused commits** with clear messages
3. **PR descriptions** will explain the problem, solution, and impact
4. **Sequential merging** - critical fixes first, then features
5. **Clean commit history** with logical groupings

## 🎨 **Design Approach**

Since Solace values design heavily, the UI overhaul will focus on:
- **Patient-centered design**: Easy advocate discovery and comparison
- **Accessibility**: WCAG compliance for inclusive access
- **Mobile-first responsive design**: Works on all devices
- **Modern aesthetics**: Clean, professional interface using Tailwind
- **Clear information hierarchy**: Easy scanning of advocate details

## ⚡ **Performance Strategy**

For hundreds of thousands of advocates:
- **Backend**: Database pagination, indexed searches, query optimization
- **Frontend**: Debounced inputs, virtual scrolling considerations, efficient re-renders
- **Network**: Minimal API payloads, proper caching headers

## 📝 **Success Metrics**

- ✅ All critical bugs fixed
- ✅ App works with database enabled
- ✅ Search performs well with large datasets
- ✅ Modern, accessible UI design
- ✅ Proper React/TypeScript patterns
- ✅ Clear, reviewable PRs with good descriptions

This plan balances fixing immediate issues with delivering meaningful improvements within the 2-hour constraint while demonstrating both frontend and backend expertise.