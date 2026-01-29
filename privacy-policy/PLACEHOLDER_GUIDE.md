# Privacy Policy Placeholder Guide

This document lists all placeholders in the Privacy Policy that need to be replaced with actual values before publication.

## Required Placeholders (MUST be filled)

### Developer & Company Information
- `[DEVELOPER_NAME]` - The name of the developer or company (appears multiple times)
- `[SUPPORT_EMAIL]` - Primary contact email for privacy inquiries (appears multiple times)
- `[WEBSITE_URL]` - Main website URL (appears multiple times)

### Dates
- `[EFFECTIVE_DATE]` - The date this privacy policy becomes effective (e.g., "January 29, 2026")
- `[LAST_UPDATED_DATE]` - The date this privacy policy was last updated (e.g., "January 29, 2026")

### Account Deletion
- `[ACCOUNT_DELETION_URL]` - Web URL for account deletion requests (appears multiple times)
- `[ACCOUNT_DELETION_TIMELINE_DAYS]` - Number of days to complete account deletion (e.g., "30")

### Data Retention
- `[RETENTION_PERIOD]` - How long logs/diagnostics are kept (e.g., "90 days", "6 months")

## Optional Placeholders (Fill if applicable)

### Company Information
- `[COMPANY_LEGAL_NAME_OPTIONAL]` - Full legal company name (can be removed if not applicable)
- `[ADDRESS_OPTIONAL]` - Physical address (can be removed if not providing)

### Payment Information (if app has purchases)
- `[REFUND_TIMELINE_DAYS]` - Days to process refund requests (e.g., "7", "14")
- `[PAYMENT_PROCESSOR_1_NAME]` - Name of additional payment processor (or remove section)
- `[PAYMENT_PROCESSOR_1_PRIVACY_URL]` - Privacy policy URL for processor 1
- `[PAYMENT_PROCESSOR_2_NAME]` - Name of second payment processor (or remove section)
- `[PAYMENT_PROCESSOR_2_PRIVACY_URL]` - Privacy policy URL for processor 2

## HTML TODO Comments to Review

The HTML file contains hidden TODO comments that indicate areas needing confirmation:
- Account creation fields (email/phone/username)
- Support attachment handling
- Device/technical data collection specifics
- Analytics and crash reporting tools
- In-app account deletion path
- Payment processor details
- DNS persistence after uninstall
- Security measures (encryption, standards)

## How to Replace Placeholders

Use find-and-replace in your editor:
1. Open `index.html`
2. Search for `[PLACEHOLDER_NAME]`
3. Replace all instances with the actual value

## Validation

After replacing placeholders, verify:
- No `[PLACEHOLDER]` text remains visible on the page
- All email links work (mailto:)
- All URLs are valid and accessible
- Dates are in readable format
- Account deletion URL is accessible

## Testing Checklist

- [ ] Replace all required placeholders
- [ ] Review and update HTML TODO comments
- [ ] Test account deletion URL
- [ ] Verify support email receives messages
- [ ] Check all external links (payment processors, etc.)
- [ ] Validate mobile responsiveness
- [ ] Test Print functionality
- [ ] Test Copy Link functionality
- [ ] Spell check all content
