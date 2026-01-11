# Claude Code Task: Enhance & Publish Shopify Protected Customer Data Guide

## Overview

We've created a guide documenting how to enable Protected Customer Data access for Shopify apps. This guide needs to be enhanced with the full context of our app setup journey, then pushed to the GitHub repository.

---

## File Locations

The guide and images are located at:

```
C:\xampp\htdocs\ecommerce-react-shopify\docs\Shopify Protected Customer Data Access Guide\SHOPIFY-PROTECTED-CUSTOMER-DATA-GUIDE.md

C:\xampp\htdocs\ecommerce-react-shopify\docs\Shopify Protected Customer Data Access Guide\images\
```

### Current Folder Structure:
```
Shopify Protected Customer Data Access Guide/
├── SHOPIFY-PROTECTED-CUSTOMER-DATA-GUIDE.md    # The main guide (rename to README.md)
└── images/
    ├── 01-partners-home.png
    ├── 02-app-overview.png
    ├── 03-api-access-requests.png
    ├── 04-protected-customer-data-section.png
    ├── 05-request-access-form.png
    ├── 06-select-reasons.png
    ├── 07-name-field.png
    ├── 08-email-field.png
    ├── 09-phone-field.png
    └── 10-address-field.png
```

---

## Task 1: Enhance the Guide

The current guide covers the Protected Customer Data access steps, but it needs to be **enhanced** to include the FULL journey of setting up a Shopify app from scratch. This is critical for developers who are new to Shopify development.

### What "Enhancing" Means:

Add comprehensive documentation covering:

1. **Prerequisites & Initial Setup**
   - Creating a Shopify Partner account
   - Setting up a development store
   - Understanding the difference between Partner Dashboard vs Dev Dashboard vs Store Admin

2. **App Creation Process**
   - How to create a new app in Shopify Partners
   - Configuring app settings (name, URLs, etc.)
   - Understanding app distribution models (custom app vs public app)

3. **App Installation on Dev Store**
   - How to install your app on a development store
   - The OAuth flow and what happens during installation
   - Verifying the app is installed correctly

4. **API Configuration**
   - Setting up Admin API access
   - Setting up Storefront API access (if needed)
   - Understanding API scopes and what each scope allows
   - Where to find API credentials (Admin API token, Storefront API token)

5. **The Protected Customer Data Section** (existing content)
   - Keep the current step-by-step with screenshots
   - This is the core of the guide

6. **Testing & Verification**
   - How to verify your app has proper access
   - Common GraphQL queries to test access
   - Using Shopify's GraphiQL explorer

7. **Troubleshooting Section** (expand existing)
   - Common errors we encountered
   - ACCESS_DENIED errors and how to fix them
   - Scope issues
   - Token issues

8. **Integration with MCP/Claude Code**
   - How this relates to building MCP servers for Shopify
   - Using these credentials in automation tools

### Screenshot Context:

The screenshots document our actual journey through the Shopify Partner Dashboard:

| Image | What It Shows |
|-------|---------------|
| `01-partners-home.png` | Shopify Partners home with getting started checklist (4/5 complete) |
| `02-app-overview.png` | Our "Ecomm-react" app overview page in Partner Dashboard |
| `03-api-access-requests.png` | API access requests page showing sales channel & Storefront API options |
| `04-protected-customer-data-section.png` | The Protected Customer Data section with "Request access" button |
| `05-request-access-form.png` | The form that appears after clicking Request access |
| `06-select-reasons.png` | Selecting all the data use reasons (checkboxes) |
| `07-name-field.png` | Configuring Name field access with reasons |
| `08-email-field.png` | Configuring Email field access with reasons |
| `09-phone-field.png` | Configuring Phone field access with reasons |
| `10-address-field.png` | Configuring Address field access with reasons |

Use these screenshots in the guide with proper image references like:
```markdown
![Shopify Partners Home](images/01-partners-home.png)
```

---

## Task 2: Organize for GitHub

After enhancing, organize the files for the repository:

### Target Location in Repo:
```
docs/guides/shopify-protected-customer-data/
├── README.md           # The enhanced guide (renamed from SHOPIFY-PROTECTED-CUSTOMER-DATA-GUIDE.md)
└── images/
    └── (all 10 images)
```

### Steps:
1. Read the current guide at the Windows path
2. Enhance it with the full setup journey
3. Create the proper folder structure in the repo
4. Copy/move all images
5. Rename the guide to README.md

---

## Task 3: Update Project README

Add a reference to this guide in the main project README.md:

```markdown
## Documentation

### Guides
- [Shopify Protected Customer Data Access](docs/guides/shopify-protected-customer-data/README.md) - Complete guide to enabling customer data access for Shopify apps
```

Also add it to any documentation index if one exists.

---

## Task 4: Commit and Push

```bash
git add docs/guides/shopify-protected-customer-data/
git add README.md  # if updated
git commit -m "docs: Add comprehensive Shopify Protected Customer Data access guide

- Complete walkthrough from Partner account to API access
- 10 annotated screenshots of the setup process
- Troubleshooting section for common errors
- GraphQL examples for testing access
- Integration notes for MCP/automation tools"

git push origin main
```

---

## Context: Why This Guide Exists

We were building draft order functionality and kept hitting `ACCESS_DENIED` errors when trying to access customer data (names, emails, addresses). After debugging, we discovered that Shopify requires explicit Protected Customer Data access to be configured in the Partner Dashboard.

This guide documents the exact steps we took to resolve this, so other developers don't have to spend hours figuring it out.

### The Problem We Solved:
- App was installed on dev store ✓
- API scopes included `read_customers`, `write_orders` ✓
- But GraphQL queries for customer data returned ACCESS_DENIED ✗

### The Solution:
- Navigate to Partner Dashboard → App → API access requests
- Enable Protected Customer Data access
- Select specific fields (Name, Email, Phone, Address)
- Select reasons for each field
- Save

This guide makes that process crystal clear with screenshots.

---

## Quality Standards

The enhanced guide should:
- Be beginner-friendly (assume reader is new to Shopify development)
- Include all screenshots with proper markdown image syntax
- Have a clear table of contents
- Include copy-pasteable code examples
- Have a troubleshooting section
- Be professional enough to share publicly

---

## Summary Checklist

- [ ] Read existing guide from Windows path
- [ ] Enhance with full Shopify app setup journey
- [ ] Add context for each screenshot
- [ ] Create proper folder structure in repo
- [ ] Rename guide to README.md
- [ ] Update project README with link to guide
- [ ] Commit with descriptive message
- [ ] Push to GitHub

---

**Repository:** nathanmcmullendev/ecommerce-react-shopify (or appropriate repo)

**Priority:** High - This documentation helps future developers avoid the same debugging journey we went through.
