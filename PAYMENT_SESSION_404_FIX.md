# 🚨 Payment Session 404 Error - Quick Fix

## 🔍 **Issue Identified:**
```
HDFC API Error: 404 - 
POST /api/payment/session 500
```

## 🚨 **Root Cause:**
The API is calling the wrong URL. Based on your HDFC documentation:

**Current Implementation (Wrong):**
- Base URL: `https://smartgatewayuat.hdfcbank.com`
- API Call: `https://smartgatewayuat.hdfcbank.com/session` ❌

**HDFC Documentation (Correct):**
- Session URL: `https://smartgatewayuat.hdfcbank.com/session`
- Order Status URL: `https://smartgatewayuat.hdfcbank.com/orders/{order_id}`

## ✅ **The Fix:**

### **Option 1: Environment Variables (Recommended)**
Add to your `.env.local`:
```bash
# HDFC Sandbox (include full endpoint URLs)
HDFC_SANDBOX_URL=https://smartgatewayuat.hdfcbank.com
HDFC_PRODUCTION_URL=https://smartgateway.hdfcbank.com

# Test the endpoints manually:
# Session: POST https://smartgatewayuat.hdfcbank.com/session
# Status: GET https://smartgatewayuat.hdfcbank.com/orders/{order_id}
```

### **Option 2: Verify API Endpoints**
The 404 error suggests:
1. **Wrong URL**: The `/session` endpoint doesn't exist at that URL
2. **Authentication**: Invalid API credentials
3. **Environment**: Wrong sandbox/production URL

## 🧪 **Quick Debug Steps:**

### **1. Test HDFC URL Manually**
```bash
# Test if the endpoint exists (should return 401/403, not 404)
curl -X POST https://smartgatewayuat.hdfcbank.com/session \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic test" \
  -d '{"test": "data"}'

# If you get 404 -> Wrong URL
# If you get 401/403 -> URL correct, auth issue
```

### **2. Check Environment Variables**
Add console logging to verify what URL is being called:
```typescript
console.log('HDFC API URL being called:', `${this.config.baseUrl}/session`);
console.log('HDFC Environment:', process.env.HDFC_ENVIRONMENT);
console.log('HDFC API Key exists:', !!process.env.HDFC_API_KEY);
```

### **3. Test With Mock Mode First**
If HDFC sandbox is down or credentials are wrong, temporarily enable mock mode:
```typescript
// In lib/hdfc-payment.ts - add this check
if (!process.env.HDFC_API_KEY || process.env.HDFC_ENVIRONMENT === 'mock') {
  // Return mock response for testing
  return {
    session_id: `mock_${Date.now()}`,
    order_id: sessionData.order_id,
    payment_links: {
      web: `http://localhost:3000/payment/mock-gateway?order_id=${sessionData.order_id}`
    }
  };
}
```

## 🔧 **Immediate Fix (Apply This)**

Update your `.env.local` with correct HDFC URLs:
```bash
# Try these exact URLs from HDFC docs
HDFC_SANDBOX_URL=https://smartgatewayuat.hdfcbank.com
HDFC_PRODUCTION_URL=https://smartgateway.hdfcbank.com

# Verify your credentials are correct
HDFC_API_KEY=your_actual_hdfc_api_key
HDFC_MERCHANT_ID=your_actual_merchant_id
HDFC_RESPONSE_KEY=your_actual_response_key
HDFC_ENVIRONMENT=sandbox
```

## 🚀 **Next Steps:**

1. **Update environment variables** with correct URLs
2. **Restart development server**: `npm run dev`
3. **Test payment again** in `/student` portal
4. **Check console** for the exact URL being called
5. **Contact HDFC support** if 404 persists (URL might be wrong in docs)

## 📞 **If Still Getting 404:**

The 404 error means either:
1. **Wrong base URL** - Contact HDFC for correct sandbox URL
2. **Missing endpoint** - `/session` endpoint doesn't exist at that domain
3. **Account not activated** - Your HDFC sandbox account might not be active

**Try the fix above and let me know if the 404 error persists!** 🔧 