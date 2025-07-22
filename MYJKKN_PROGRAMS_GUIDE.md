# MyJKKN Programs API Integration Guide

## Overview

This feature provides a complete integration with the MyJKKN API system to fetch and display programs data. It includes API authentication, data fetching with pagination, search and filtering capabilities, and a clean, accessible UI.

## 🏗️ **Architecture Overview**

### API Service Layer (`lib/myjkkn-api.ts`)
- **Purpose**: Handles all API communication with the MyJKKN Admin system
- **Base URL**: `https://myadmin.jkkn.ac.in/api`
- **Authentication**: Bearer token using API key format `jk_xxxxx_xxxxx`
- **Features**:
  - Automatic API key validation
  - Comprehensive error handling
  - Support for pagination, search, and filtering
  - TypeScript type safety

### React Hook (`hooks/usePrograms.ts`)
- **Purpose**: Provides a clean interface for React components to interact with programs data
- **Features**:
  - Automatic loading and error states
  - Pagination management
  - Search and filtering
  - Real-time API configuration detection

### UI Components
- **MyJkknApiConfig**: API credential configuration
- **ProgramsList**: Programs display with search, filter, and pagination
- **ProgramCard**: Individual program display component

## 🚀 **Getting Started**

### 1. **Access the Programs Page**
Navigate to `/programs` in your application or click "Programs" in the sidebar.

### 2. **Configure API Credentials**
1. Click "Configure API" in the API Status card
2. Enter your MyJKKN API key (format: `jk_xxxxx_xxxxx`)
3. Click "Test Connection" to verify
4. Click "Save & Apply" to save configuration

### 3. **Start Using the Features**
Once configured, you can:
- Browse all programs with pagination
- Search programs by name
- Filter by active/inactive status
- Refresh data in real-time

## 🔧 **API Endpoints Used**

### Primary Endpoint
```
GET /api-management/organizations/programs
```

### Parameters
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `search`: Search query (optional)
- `is_active`: Filter by status (optional)

### Response Format
```json
{
  "data": [
    {
      "id": "uuid",
      "program_id": "string",
      "program_name": "string",
      "institution_id": "string",
      "department_id": "string",
      "degree_id": "string",
      "is_active": boolean,
      "created_at": "ISO date string",
      "updated_at": "ISO date string"
    }
  ],
  "metadata": {
    "page": 1,
    "totalPages": 5,
    "total": 124
  }
}
```

## 💻 **Code Examples**

### Using the API Service Directly
```typescript
import { myJkknApi } from '@/lib/myjkkn-api'

// Configure API key
myJkknApi.setCredentials('jk_your_api_key_here')

// Fetch programs
const response = await myJkknApi.getPrograms(1, 20)
if (response.success) {
  console.log('Programs:', response.data?.data)
  console.log('Pagination:', response.data?.metadata)
}

// Search programs
const searchResponse = await myJkknApi.searchPrograms('Computer Science', 1, 20)

// Filter by status
const activePrograms = await myJkknApi.getProgramsByStatus(true, 1, 20)
```

### Using the React Hook
```typescript
import { usePrograms } from '@/hooks/usePrograms'

function MyComponent() {
  const {
    programs,           // Current programs data
    loading,           // Loading state
    error,             // Error message
    pagination,        // Pagination info
    searchPrograms,    // Search function
    filterByStatus,    // Filter function
    goToPage,         // Navigation function
    refresh           // Refresh function
  } = usePrograms()

  const handleSearch = (query: string) => {
    searchPrograms(query)
  }

  const handleFilter = (isActive: boolean) => {
    filterByStatus(isActive)
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      {programs.map(program => (
        <div key={program.id}>
          <h3>{program.program_name}</h3>
          <p>Status: {program.is_active ? 'Active' : 'Inactive'}</p>
        </div>
      ))}
      
      <button onClick={() => goToPage(pagination.currentPage + 1)}>
        Next Page
      </button>
    </div>
  )
}
```

### Creating Custom API Calls
```typescript
import { myJkknApi } from '@/lib/myjkkn-api'

// Get a specific program
const getProgramDetails = async (programId: string) => {
  const response = await myJkknApi.getProgramById(programId)
  return response
}

// Advanced search with multiple parameters
const advancedSearch = async () => {
  const response = await myJkknApi.searchPrograms('Engineering', 1, 10)
  if (response.success) {
    // Process search results
    const programs = response.data?.data || []
    return programs.filter(p => p.is_active)
  }
  return []
}
```

## 🎯 **Features**

### ✅ **Implemented Features**
- **API Authentication**: Secure Bearer token authentication
- **Data Fetching**: Paginated data fetching with loading states
- **Search**: Real-time search by program name
- **Filtering**: Filter by active/inactive status
- **Pagination**: Full pagination with navigation controls
- **Error Handling**: Comprehensive error handling and user feedback
- **Responsive Design**: Mobile-friendly UI components
- **Type Safety**: Full TypeScript support
- **Local Storage**: Persistent API configuration
- **Real-time Updates**: Refresh and reload capabilities

### 🔍 **Search Capabilities**
- Search by program name
- Real-time search as you type
- Clear search functionality
- Search state persistence

### 📄 **Pagination Features**
- Page navigation (Previous/Next)
- Direct page number input
- First/Last page navigation
- Results count display
- Configurable page size

### 🎨 **UI Features**
- Clean, accessible design
- Loading states with spinners
- Error states with retry options
- Empty states with helpful messages
- Status badges for active/inactive programs
- Responsive grid layout
- Hover effects and transitions

## 🛠️ **Configuration Options**

### API Configuration
```typescript
interface MyJKKNApiConfig {
  baseUrl: string        // API base URL
  apiKey: string        // Your API key (jk_xxxxx_xxxxx format)
}
```

### Hook Options
```typescript
interface UseProgramsOptions {
  initialPage?: number   // Starting page (default: 1)
  pageSize?: number     // Items per page (default: 20)
  autoFetch?: boolean   // Auto-fetch on mount (default: true)
}

// Usage
const programs = usePrograms({
  initialPage: 1,
  pageSize: 10,
  autoFetch: true
})
```

## 🔒 **Security Considerations**

### API Key Management
- API keys are stored in localStorage (browser-only)
- Keys are validated for correct format before use
- No API keys are exposed in client-side code
- Consider using environment variables for production

### Best Practices
```typescript
// ✅ Good: Validate API key format
const isValidKey = /^jk_[a-zA-Z0-9]+_[a-zA-Z0-9]+$/.test(apiKey)

// ✅ Good: Handle errors gracefully
try {
  const response = await myJkknApi.getPrograms()
  if (response.success) {
    // Handle success
  } else {
    // Handle API error
  }
} catch (error) {
  // Handle network error
}

// ✅ Good: Check configuration before making calls
if (myJkknApi.isConfigured()) {
  await myJkknApi.getPrograms()
}
```

## 🐛 **Troubleshooting**

### Common Issues

1. **"API key is required" Error**
   - Ensure you've configured your API key
   - Check the key format: `jk_xxxxx_xxxxx`
   - Verify the key is saved properly

2. **"Failed to fetch" Error**
   - Check network connectivity
   - Verify the API server is accessible
   - Check for CORS issues

3. **"Authentication failed" Error**
   - Verify your API key is correct
   - Check if the key has expired
   - Ensure proper permissions

4. **"Invalid API key format" Error**
   - API key must follow format: `jk_xxxxx_xxxxx`
   - No spaces or special characters allowed
   - Contact administrator for correct key

### Debug Mode
```typescript
// Enable console logging for API calls
localStorage.setItem('myjkkn_debug', 'true')

// Check current configuration
console.log(myJkknApi.getConfigInfo())

// Test connection
const test = await myJkknApi.testConnection()
console.log('Connection test:', test)
```

## 📈 **Performance Considerations**

### Optimization Tips
- Use pagination to limit data transfer
- Implement debouncing for search inputs
- Cache API responses when appropriate
- Use proper loading states to improve UX

### Example: Debounced Search
```typescript
import { useMemo, useState } from 'react'
import { debounce } from 'lodash'

function useDebounceSearch() {
  const [searchQuery, setSearchQuery] = useState('')
  
  const debouncedSearch = useMemo(
    () => debounce((query: string) => {
      // Perform search
      searchPrograms(query)
    }, 300),
    []
  )
  
  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    debouncedSearch(query)
  }
  
  return { searchQuery, handleSearchChange }
}
```

## 🔄 **Updates and Maintenance**

### Adding New Features
1. **New API Endpoints**: Add methods to `MyJKKNApiService` class
2. **New Data Fields**: Update TypeScript interfaces
3. **New UI Features**: Extend the `usePrograms` hook and components

### Example: Adding New Endpoint
```typescript
// In lib/myjkkn-api.ts
async getProgramsByDepartment(
  departmentId: string,
  page: number = 1,
  limit: number = 20
): Promise<ApiResponse<PaginatedResponse<ProgramData>>> {
  return this.makeRequest<PaginatedResponse<ProgramData>>('/api-management/organizations/programs', {
    method: 'GET',
    params: { 
      department_id: departmentId,
      page: page.toString(), 
      limit: limit.toString() 
    }
  });
}

// In hooks/usePrograms.ts
const filterByDepartment = useCallback((departmentId: string) => {
  // Implementation
}, [])
```

## 📝 **API Documentation Reference**

### Base URL
```
https://myadmin.jkkn.ac.in/api
```

### Authentication Header
```
Authorization: Bearer jk_xxxxx_xxxxx
```

### Content Type
```
Content-Type: application/json
Accept: application/json
```

### Rate Limiting
- Respect any rate limits imposed by the API
- Implement exponential backoff for failed requests
- Monitor API usage and optimize calls

---

## 🎉 **Conclusion**

This MyJKKN Programs API integration provides a robust, scalable solution for managing programs data with a focus on user experience, performance, and maintainability. The modular architecture makes it easy to extend and customize for specific needs.

For additional support or feature requests, refer to the source code documentation or contact the development team. 