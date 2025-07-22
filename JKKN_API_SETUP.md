# JKKN API Integration Setup Guide

## Overview

This application includes a complete integration with the JKKN API endpoints. You can configure your API keys directly through the admin dashboard and test all endpoints.

## 📋 Prerequisites

- JKKN API access credentials (API Key and optionally API Secret)
- JKKN API base URL (default: `https://api.jkkn.com`)

## 🔧 API Configuration

### Method 1: Through the Dashboard (Recommended)

1. **Access the Configuration**:
   - Login to your admin dashboard
   - Click the "Setup API" button in the header (top-right)
   - Or navigate to `/api-integration` page

2. **Enter Your Credentials**:
   - **API Key**: Your JKKN API key (required)
   - **API Secret**: Your JKKN API secret (optional)
   - **Base URL**: The JKKN API base URL (default: `https://api.jkkn.com`)

3. **Test Connection**:
   - Click "Test Connection" to verify your credentials
   - Click "Save & Apply" to save the configuration

### Method 2: Environment Variables

Create a `.env.local` file in your project root:

```env
# JKKN API Configuration
NEXT_PUBLIC_JKKN_API_BASE_URL=https://api.jkkn.com
JKKN_API_KEY=your_api_key_here
JKKN_API_SECRET=your_api_secret_here

# Existing Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🔗 Available API Endpoints

The integration includes all major JKKN API endpoints:

### Authentication & User Management
- `POST /auth/login` - User authentication
- `GET /users/:id` - Get user profile
- `PUT /users/:id` - Update user profile

### Service Management
- `GET /services` - List all services
- `GET /services/:id` - Get service details
- `POST /services` - Create new service
- `PUT /services/:id` - Update service
- `DELETE /services/:id` - Delete service

### Service Categories
- `GET /service-categories` - List categories
- `POST /service-categories` - Create category

### Service Requests
- `GET /service-requests` - List service requests
- `GET /service-requests/:id` - Get request details
- `POST /service-requests` - Create service request
- `PUT /service-requests/:id` - Update request
- `POST /service-requests/:id/approve` - Approve request
- `POST /service-requests/:id/reject` - Reject request

### Analytics & Dashboard
- `GET /dashboard/stats` - Dashboard statistics
- `GET /analytics` - Performance analytics

### Approval Workflows
- `GET /services/:id/approval-levels` - Get approval levels
- `POST /services/:id/approval-levels` - Set approval levels

### Notifications
- `GET /users/:id/notifications` - Get user notifications
- `PUT /notifications/:id/read` - Mark notification as read

### Reports
- `POST /reports/generate` - Generate reports
- `GET /reports` - List user reports

### File Upload
- `POST /upload` - Upload files

## 🧪 Testing the Integration

1. **Navigate to API Integration Page**:
   - Go to `/api-integration` in your dashboard
   - Or click "API Integration" in the sidebar

2. **Test Individual Endpoints**:
   - Each endpoint has a dedicated test button
   - Click "Test" to execute the API call
   - View the response data or error messages

3. **Monitor API Status**:
   - Green badge: API is configured and working
   - Red badge: API configuration issues

## 💻 Using the API in Your Code

### Import the Hook
```typescript
import { useJkknApi } from '@/hooks/useJkknApi'
```

### Basic Usage
```typescript
function MyComponent() {
  const { services, isConfigured, isLoading } = useJkknApi()

  const handleGetServices = async () => {
    const result = await services.getAll()
    if (result.success) {
      console.log('Services:', result.data)
    } else {
      console.error('Error:', result.error)
    }
  }

  if (!isConfigured) {
    return <div>Please configure your JKKN API credentials</div>
  }

  return (
    <button onClick={handleGetServices} disabled={isLoading}>
      {isLoading ? 'Loading...' : 'Get Services'}
    </button>
  )
}
```

### Advanced Usage
```typescript
// Create a new service
const createNewService = async () => {
  const serviceData = {
    name: 'New Service',
    description: 'Service description',
    category_id: 'category-uuid',
    // ... other fields
  }
  
  const result = await services.create(serviceData)
  if (result.success) {
    console.log('Service created:', result.data)
  }
}

// Get dashboard statistics
const getDashboardData = async () => {
  const stats = await dashboard.getStats()
  const analytics = await dashboard.getAnalytics('last-30-days')
  
  return { stats: stats.data, analytics: analytics.data }
}
```

## 🔒 Security Notes

- API keys are stored securely in localStorage (browser storage)
- For production environments, consider using more secure storage methods
- Never commit API keys to version control
- Use environment variables for production deployments

## 🐛 Troubleshooting

### Common Issues

1. **"API Not Configured" Error**:
   - Ensure you've entered your API key in the configuration modal
   - Check that the API key is valid

2. **"Connection Failed" Error**:
   - Verify the base URL is correct
   - Check your network connection
   - Ensure the JKKN API service is running

3. **"Authentication Failed" Error**:
   - Double-check your API key and secret
   - Ensure your API credentials haven't expired

4. **CORS Issues**:
   - Ensure the JKKN API server allows requests from your domain
   - Check CORS configuration on the API server

### Getting Help

1. Check the browser console for detailed error messages
2. Use the "Test Connection" feature to diagnose issues
3. Verify your API credentials with the JKKN API provider

## 📝 Next Steps

After setting up the API integration:

1. Configure your API credentials
2. Test the endpoints you plan to use
3. Integrate the API calls into your application logic
4. Monitor API usage and responses
5. Set up proper error handling for production use

The JKKN API integration is now ready to use throughout your application! 🚀