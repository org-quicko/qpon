### qpon-sheet-core

This package provides TypeScript objects for common sheet entities used in Qpon.

## Installation

```bash
npm install @org-quicko/qpon-sheet-core
```

## Usage

Import the required beans or types for your sheet:

```typescript
import { CampaignSummaryWorkbook } from '@org-quicko/qpon-sheet-core/campaign_summary_workbook/beans';
// ...use in your code
```

## Sheets Supported
- Campaign Summary
- Coupon Code
- Coupon Summary
- Offer
- Organization Summary
- Redemption Report
- Redemption

## Development
- Types and objects are auto-generated from source definitions
- Build and generate with:

```bash
npm run build
```