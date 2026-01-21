# Headless Shopify Starter Kit - Enhancement Plan

**Goal:** Transform this from a working demo into a production-ready headless Shopify starter kit with:
- Complete product catalog (from Smithsonian JSON)
- Essential Shopify plugin integrations (Klaviyo, etc.)
- Clean navigation and UX
- Comprehensive documentation for cloning

---

## Current State

- **Products in Shopify:** ~19 art products with variants
- **JSON Source:** 1,000 Smithsonian artworks (C:\xampp\htdocs\smithsonian-art-gallery.json)
- **Top Artists in JSON:**
  - Mary Vaux Walcott: 189 works
  - George Catlin: 93 works
  - William Henry Holmes: 25 works
  - Cass Gilbert: 20 works
  - Henry Ossawa Tanner: 16 works
  - Edward Mitchell Bannister: 15 works
  - And more...

---

## Phase 1: Repository Cleanup & Documentation

### 1.1 Clean Up Legacy Docs
- [x] Move .docs-internal/ to archive (already in .gitignore)
- [ ] Update README.md with final starter kit instructions
- [ ] Create .env.example with all required variables
- [ ] Update CLAUDE.md with current project state

### 1.2 Create Starter Kit Documentation
- [ ] docs/SETUP.md - Step-by-step clone & deploy guide
- [ ] docs/INTEGRATIONS.md - How to enable each plugin
- [ ] docs/CUSTOMIZATION.md - Branding, products, collections

---

## Phase 2: Bulk Product Import to Shopify

### 2.1 Strategy
- Select artists with 5+ works for meaningful collections
- Create collections per artist
- Create products with proper variants (16 per product: 4 sizes × 4 frames)
- Set inventory policy to CONTINUE (allow oversell)
- Upload images from Smithsonian URLs

### 2.2 Target Collections (Artists with 5+ Works)
| Artist | Works | Collection Handle |
|--------|-------|------------------|
| Mary Vaux Walcott | 189 | mary-vaux-walcott |
| George Catlin | 93 | george-catlin |
| William Henry Holmes | 25 | william-henry-holmes |
| Henry Ossawa Tanner | 16 | henry-ossawa-tanner |
| Edward Mitchell Bannister | 15 | edward-mitchell-bannister |
| Alice Pike Barney | 13 | alice-pike-barney |
| Abbott Handerson Thayer | 12 | abbott-handerson-thayer |
| Carl Moon | 9 | carl-moon |
| H. Lyman Saÿen | 9 | h-lyman-sayen |
| Albert Pinkham Ryder | 6 | albert-pinkham-ryder |
| Thomas Wilmer Dewing | 6 | thomas-wilmer-dewing |

### 2.3 Product Creation Process
1. Parse JSON file, group by artist
2. For each selected artist:
   - Create collection if doesn't exist
   - For each artwork:
     - Create product with title, description, vendor (artist)
     - Add to artist collection
     - Create 16 variants (Size × Frame)
     - Set pricing per variant
     - Upload image from Smithsonian URL
     - Set inventory policy to CONTINUE
     - Add metafields (accession_number, museum, year_created)

### 2.4 Variant Pricing Matrix
| Size | Unframed | Black Frame | White Frame | Natural Wood |
|------|----------|-------------|-------------|--------------|
| 8×10 | $45 | $75 | $75 | $85 |
| 11×14 | $55 | $95 | $95 | $105 |
| 16×20 | $65 | $125 | $125 | $135 |
| 24×36 | $85 | $165 | $165 | $175 |

---

## Phase 3: Navigation Update

### 3.1 Desktop Navigation
**Current:** Collections dropdown with artists
**Target:** Simple "Collection" link to /collections page (no dropdown)

**File:** `src/components/layout/Header.tsx`
- Remove dropdown state and logic for desktop
- Replace with simple Link to /collections
- Keep mobile hamburger menu with artist links

### 3.2 Collections Page Enhancement
- Ensure /collections page shows all artist collections
- Grid layout with artist thumbnails
- Product count per artist

---

## Phase 4: Klaviyo Integration (Primary Email Plugin)

### 4.1 Why Klaviyo?
- Most popular Shopify email marketing app
- 100,000+ merchants use it
- Deep Shopify integration
- Free tier available (up to 250 contacts)

### 4.2 Integration Points
1. **Newsletter Signup** - Already has API route (api.newsletter.ts)
   - Update to use Klaviyo Profiles API v3
   - Add subscriber to list with source tags

2. **Browse Abandonment** - Track viewed products
   - Add Klaviyo identify call on product view
   - Track viewed product for retargeting

3. **Cart Abandonment** - Track started checkouts
   - Identify user at checkout start
   - Track cart contents

4. **Purchase Events** - Post-purchase email triggers
   - Send "Ordered Product" event to Klaviyo on order creation
   - Include order details for email templates

### 4.3 Implementation
**Files to create/update:**
- `src/utils/klaviyo.ts` - Klaviyo client utility
- `app/routes/api.newsletter.ts` - Update subscription handler
- `app/routes/api.create-order.ts` - Add Klaviyo order event
- `src/pages/Product.tsx` - Track product views
- `src/pages/Checkout.tsx` - Track checkout starts

**Environment variables:**
```
KLAVIYO_PUBLIC_API_KEY=pk_xxx     # For client-side tracking
KLAVIYO_PRIVATE_API_KEY=pk_xxx   # For server-side API
KLAVIYO_LIST_ID=xxx              # Newsletter list
```

---

## Phase 5: Essential Shopify Plugins Support

### 5.1 Core Integrations (Included)
| Plugin | Purpose | Status |
|--------|---------|--------|
| Klaviyo | Email marketing | Phase 4 |
| Stripe | Payments | ✅ Done |
| Google Analytics 4 | Analytics | ✅ Done |
| Cloudinary | Image CDN | ✅ Done |

### 5.2 Ready-to-Enable Integrations
| Plugin | Purpose | Status |
|--------|---------|--------|
| Mailchimp | Email (alternative) | ✅ Code exists |
| Printful | Print fulfillment | ✅ Code exists |
| Judge.me | Reviews | Placeholder ready |

### 5.3 Documentation for Each
- Environment variables needed
- How to get API keys
- Code changes required (if any)

---

## Phase 6: Final Testing & Documentation

### 6.1 Testing Checklist
- [ ] Product import creates valid variants
- [ ] Collections show correct products
- [ ] Navigation works on desktop/mobile
- [ ] Checkout creates Shopify order
- [ ] Klaviyo receives events
- [ ] All tests pass (npm test)
- [ ] Build succeeds (npm run build)
- [ ] TypeScript passes (npm run typecheck)

### 6.2 Documentation Updates
- [ ] README.md - Final starter kit version
- [ ] .env.example - All environment variables
- [ ] docs/SETUP.md - Clone to deploy in < 1 hour
- [ ] docs/INTEGRATIONS.md - Plugin setup guides

---

## Execution Order

1. **Phase 2** - Bulk product import (most value)
2. **Phase 3** - Navigation update (quick win)
3. **Phase 4** - Klaviyo integration (key feature)
4. **Phase 1** - Documentation cleanup
5. **Phase 6** - Final testing

---

## Technical Notes

### Shopify Admin API Rate Limits
- 40 requests per second (bucket)
- Use batching for bulk operations
- Consider GraphQL bulk operations for large imports

### MCP Tools Available
- `mcp__shopify__createProduct` - Create products
- `mcp__shopify__productVariantCreate` - Create variants
- `mcp__shopify__uploadProductImage` - Upload images
- `mcp__shopify__executeGraphQL` - Raw GraphQL for collections

### Klaviyo API (v3)
- Profiles API for subscriptions
- Events API for tracking
- Lists API for segmentation

---

## Success Criteria

1. **Minimum 100 products** in Shopify with correct variants
2. **5+ artist collections** with proper categorization
3. **Klaviyo integration** working (subscribe + purchase events)
4. **Clean navigation** without redundant dropdowns
5. **Complete documentation** for 1-hour setup
6. **All tests passing** with 85%+ coverage
7. **Live demo** at jsartsy.com working end-to-end
