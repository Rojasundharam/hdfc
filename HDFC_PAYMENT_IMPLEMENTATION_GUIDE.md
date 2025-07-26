# HDFC SmartGateway Payment Integration Guide

This guide provides complete implementation details for integrating HDFC SmartGateway payments into your Next.js application.

## 📋 Prerequisites

1. **HDFC SmartGateway Account**: Obtain credentials from HDFC Bank
2. **Environment Variables**: Set up required environment variables
3. **SSL Certificate**: Ensure your domain has valid SSL for production

## 🚀 Quick Start

### 1. Environment Setup

Add these variables to your `.env.local` file:

```bash
# HDFC SmartGateway Configuration
HDFC_API_KEY=hdfc_xxxxx_xxxxx
HDFC_MERCHANT_ID=your_merchant_id
HDFC_RESPONSE_KEY=your_response_key
HDFC_ENVIRONMENT=sandbox

# Application URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Install Dependencies

The implementation uses existing dependencies in your project:
- `crypto` (Node.js built-in)
- `lucide-react` (for icons)
- Your existing UI components (`@/components/ui/*`)

### 3. Test the Integration

1. **Start Development Server**:
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

2. **Navigate to Payment Page**:
   ```
   http://localhost:3000/payment
   ```

3. **Test Payment Flow**:
   - Fill out the payment form
   - Submit to create a payment session
   - You'll be redirected to HDFC's payment gateway
   - Complete payment and return to your app

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Payment Form  │───▶│   API Routes    │───▶│  HDFC Gateway   │
│                 │    │                 │    │                 │
│ - Validation    │    │ - Session       │    │ - Payment Page  │
│ - Loading States│    │ - Status        │    │ - Processing    │
│ - Error Handling│    │ - Response      │    │ - Response      │
└─────────────────┘    │ - Refund        │    └─────────────────┘
                       └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │  Result Pages   │
                       │                 │
                       │ - Success       │
                       │ - Failure       │
                       │ - Error         │
                       └─────────────────┘
```

## 📁 File Structure

```
lib/
├── types/payment.ts          # TypeScript interfaces
├── hdfc-payment.ts           # Payment service library
app/
├── api/payment/
│   ├── session/route.ts      # Create payment session
│   ├── status/route.ts       # Check payment status
│   ├── response/route.ts     # Handle HDFC callbacks
│   └── refund/route.ts       # Process refunds
├── payment/
│   ├── page.tsx              # Main payment page
│   ├── success/page.tsx      # Success page
│   ├── failure/page.tsx      # Failure page
│   └── error/page.tsx        # Error page
components/
├── payments/
│   └── payment-form.tsx      # Payment form component
hooks/
└── usePayments.ts            # Payment hook
```

## 🔐 Security Features

### 1. Signature Verification
- **HMAC-SHA256** encryption for response validation
- **Automatic signature verification** on payment callbacks
- **Tamper-proof** payment response handling

### 2. Input Validation
- **Server-side validation** for all payment data
- **Email format** validation
- **Indian mobile number** validation
- **Amount range** validation (₹1 - ₹1,00,000)

### 3. Error Handling
- **Comprehensive error logging**
- **User-friendly error messages**
- **Graceful fallbacks** for failed operations

## 🧪 Testing

### Sandbox Testing

1. **Set Environment**:
   ```bash
   HDFC_ENVIRONMENT=sandbox
   ```

2. **Test Scenarios**:
   - ✅ Successful payment
   - ❌ Failed payment
   - ⏳ Pending payment
   - 🚫 Declined payment

### Production Deployment

1. **Update Environment**:
   ```bash
   HDFC_ENVIRONMENT=production
   HDFC_API_KEY=your_production_key
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   ```

2. **SSL Certificate**: Ensure valid SSL certificate
3. **Domain Verification**: Register your domain with HDFC
4. **Webhook URLs**: Update return URLs in HDFC dashboard

## 🔄 Payment Flow

### 1. User Initiates Payment
```typescript
// User fills payment form
const paymentData = {
  amount: 1000,
  customerName: "John Doe",
  customerEmail: "john@example.com",
  customerPhone: "+91 9876543210"
};
```

### 2. Create Payment Session
```typescript
// POST /api/payment/session
const session = await createPaymentSession(paymentData);
// Returns: { session_id, order_id, payment_links }
```

### 3. Redirect to HDFC
```typescript
// Redirect user to HDFC payment gateway
window.location.href = session.payment_links.web;
```

### 4. Handle Response
```typescript
// HDFC calls: /api/payment/response
// Verify signature and redirect user based on status
```

## 📊 Status Handling

| Status | Description | User Action |
|--------|-------------|-------------|
| `charged` | Payment successful | Show success page |
| `failed` | Payment failed | Show failure page with retry option |
| `pending` | Payment processing | Show pending status |
| `declined` | Payment declined by bank | Show failure page |

## 🛠️ Customization

### 1. Payment Form
Modify `components/payments/payment-form.tsx`:
- Add custom fields
- Change validation rules
- Update styling

### 2. Result Pages
Customize success/failure pages:
- Add custom branding
- Include additional information
- Integrate with your notification system

### 3. API Integration
Extend API routes for:
- Database logging
- Email notifications
- Analytics tracking

## 🐛 Troubleshooting

### Common Issues

1. **Invalid Signature Error**:
   - Check `HDFC_RESPONSE_KEY` is correct
   - Verify signature calculation matches HDFC spec

2. **API Authentication Failed**:
   - Verify `HDFC_API_KEY` format (hdfc_xxxxx_xxxxx)
   - Check environment (sandbox vs production)

3. **Phone Validation Fails**:
   - Ensure Indian mobile number format
   - Use +91 prefix or 10-digit number

4. **SSL Errors in Production**:
   - Verify SSL certificate is valid
   - Check return URL is HTTPS

### Debug Mode

Enable detailed logging:
```javascript
// In your API routes
console.log('Payment request:', paymentData);
console.log('HDFC response:', response);
console.log('Signature verification:', isValid);
```

## 📞 Support

### HDFC Support
- **Technical Support**: Contact your HDFC relationship manager
- **Integration Issues**: Use HDFC developer portal

### Application Support
- Check console logs for detailed error messages
- Verify environment variables are set correctly
- Test with HDFC sandbox environment first

## ⚡ Performance Tips

1. **Caching**: Implement caching for payment status checks
2. **Error Handling**: Use proper error boundaries
3. **Loading States**: Show loading indicators during API calls
4. **Validation**: Validate on both client and server side

## 🔄 Next Steps

1. **Database Integration**: Store payment records in your database
2. **Email Notifications**: Send payment confirmations
3. **Analytics**: Track payment success rates
4. **Webhooks**: Implement webhook handling for real-time updates
5. **Refunds**: Add refund management interface

## 📈 Monitoring

Monitor these metrics:
- Payment success rate
- Average payment time
- Error rates by type
- User drop-off points

This implementation provides a robust, secure, and user-friendly payment integration with HDFC SmartGateway. 