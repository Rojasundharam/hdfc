# MyJKKN API Proxy Mode Setup Guide

## 🚀 **What is Proxy Mode?**

Proxy Mode routes your API requests through your Next.js backend instead of directly from the browser, completely bypassing CORS restrictions while using the real MyJKKN API.

## ✅ **Fixed Issues**

### ❌ **Previous Error:**
```
TypeError: Failed to construct 'URL': Invalid URL
```

### ✅ **Solution Applied:**
- Fixed URL construction for proxy mode using relative paths
- Proper handling of query parameters for both proxy and direct modes
- Enhanced error handling and validation

## 🔧 **How Proxy Mode Works**

```
Browser → Your Next.js App → Next.js API Route → MyJKKN API
```

1. **Browser**: Makes request to `/api/myjkkn/api-management/organizations/programs`
2. **Next.js API Route**: Receives request and forwards to `https://myadmin.jkkn.ac.in/api/api-management/organizations/programs`
3. **MyJKKN API**: Processes request and returns data
4. **Next.js API Route**: Returns data to browser with CORS headers

## 📋 **Setup Instructions**

### 1. **Enable Proxy Mode**
1. Go to `/programs` page
2. Click "Configure API" 
3. Toggle "Proxy Mode" to **ON** (green)
4. Toggle "Mock Mode" to **OFF**
5. Enter your real API key (`jk_xxxxx_xxxxx`)
6. Click "Test Connection"
7. Click "Save & Apply"

### 2. **Verify Setup**
- **API Status** should show "Proxy Mode"
- **Base URL** shows: `https://myadmin.jkkn.ac.in/api`
- **Mode** badge shows: "Proxy Mode"

## 🛠️ **Technical Details**

### **API Route Location**
```
app/api/myjkkn/[...path]/route.ts
```

### **How URLs are Constructed**

#### Proxy Mode:
```typescript
// Browser request
/api/myjkkn/api-management/organizations/programs?page=1&limit=20

// Forwarded to
https://myadmin.jkkn.ac.in/api/api-management/organizations/programs?page=1&limit=20
```

#### Direct Mode:
```typescript
// Browser request (blocked by CORS)
https://myadmin.jkkn.ac.in/api/api-management/organizations/programs?page=1&limit=20
```

### **Request Headers Added by Proxy**
```
Authorization: Bearer jk_xxxxx_xxxxx
Content-Type: application/json
Accept: application/json
User-Agent: MyJKKN-ServicePortal/1.0
```

### **Response Headers Added by Proxy**
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type, Accept
```

## 🎯 **When to Use Each Mode**

### **Mock Mode** 🔧
- ✅ Development and testing
- ✅ No API key required
- ✅ Fastest setup
- ✅ No network dependencies
- ❌ Not real data

### **Proxy Mode** 🚀
- ✅ Real API data
- ✅ Bypasses CORS issues
- ✅ Production-ready
- ✅ Full API functionality
- ⚠️ Requires valid API key

### **Direct Mode** 🔗
- ✅ Fastest performance
- ✅ Direct connection
- ❌ Blocked by CORS (currently)
- ⏳ Waiting for server CORS config

## 🐛 **Troubleshooting**

### **Common Issues & Solutions**

#### 1. **"Invalid URL" Error**
- ✅ **Fixed**: Updated URL construction for proxy mode
- **Solution**: Update to latest code version

#### 2. **"Authorization header required"**
- **Cause**: No API key provided
- **Solution**: Enter valid API key in configuration

#### 3. **"Invalid API key format"**
- **Cause**: Wrong key format
- **Solution**: Use format `jk_xxxxx_xxxxx`

#### 4. **"Proxy request failed"**
- **Cause**: Network connectivity to MyJKKN API
- **Solution**: Check server status, API key validity

#### 5. **"MyJKKN API Error: 401"**
- **Cause**: Invalid or expired API key
- **Solution**: Get new API key from administrator

#### 6. **"MyJKKN API Error: 403"**
- **Cause**: API key lacks permissions
- **Solution**: Request proper permissions from administrator

## 📊 **Performance Comparison**

| Mode | Speed | Setup | Real Data | CORS Issues |
|------|-------|-------|-----------|-------------|
| Mock | ⚡ Fastest | ⚡ Instant | ❌ No | ✅ None |
| Proxy | 🔄 Medium | 🔧 API Key | ✅ Yes | ✅ None |
| Direct | ⚡ Fast | 🔧 API Key | ✅ Yes | ❌ Blocked |

## 🔄 **Switching Between Modes**

You can switch modes anytime:

1. **Mock → Proxy**: Toggle Mock off, Proxy on, add API key
2. **Proxy → Mock**: Toggle Proxy off, Mock on (API key optional)
3. **Proxy → Direct**: Toggle Proxy off (when CORS is fixed)

## 🎉 **Success Indicators**

When Proxy Mode is working correctly:

- ✅ Configuration shows "Proxy Mode" badge
- ✅ Test connection succeeds
- ✅ Programs list loads with real data
- ✅ Search and pagination work
- ✅ Console shows: `🔗 MyJKKN API: GET /api/myjkkn/...`

## 🛡️ **Security Notes**

- API key is sent from Next.js server, not browser
- API key is not exposed in browser network requests
- Next.js API route acts as secure middleware
- Consider environment variables for production deployment

## 📞 **Support**

If you encounter issues:

1. Check browser console for detailed error messages
2. Verify API key format and validity
3. Test with Mock Mode first to isolate API issues
4. Review CORS troubleshooting guide at `/programs/cors-help`

---

**✅ Proxy Mode is now fully functional and ready for production use!** 