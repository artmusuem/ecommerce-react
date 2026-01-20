# Contributing to Gallery Store

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to this project.

## Code of Conduct

Be respectful, inclusive, and constructive in all interactions. We're all here to learn and build something great.

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- Git

### Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/ecommerce-react-shopify.git
   cd ecommerce-react-shopify
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env.local` file (see `.env.example`)
5. Start the dev server:
   ```bash
   npm run dev
   ```

## Development Workflow

### Branch Naming

Use descriptive branch names:

- `feature/add-wishlist` - New features
- `fix/cart-quantity-bug` - Bug fixes
- `refactor/checkout-flow` - Code refactoring
- `docs/api-reference` - Documentation updates
- `test/cart-context` - Test additions

### Making Changes

1. Create a new branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following our [code style guidelines](#code-style)

3. Run quality checks:
   ```bash
   npm run validate
   ```
   This runs: typecheck → lint → test → build

4. Commit your changes following [commit message guidelines](#commit-messages)

5. Push to your fork and create a pull request

## Code Style

### TypeScript

- **Strict mode required** - No `any` types
- Use explicit return types for public functions
- Prefer interfaces over types for object shapes
- Use discriminated unions for state machines

```typescript
// Good
interface CartItem {
  id: string
  quantity: number
  price: number
}

// Avoid
type CartItem = any
```

### React

- Use functional components with hooks
- Memoize expensive computations with `useMemo`
- Memoize callbacks with `useCallback` when passed to children
- Use `React.memo()` for pure presentation components

```typescript
// Good - memoized component
const ProductCard = memo(function ProductCard({ product }: Props) {
  // ...
})

// Good - memoized callback
const handleClick = useCallback(() => {
  // ...
}, [dependencies])
```

### CSS / Tailwind

- Use Tailwind utility classes
- Extract repeated patterns to CSS custom classes
- Follow mobile-first responsive design
- Use CSS variables for theme values

### File Organization

```
src/
├── components/           # Reusable UI components
│   ├── cart/            # Feature-specific components
│   ├── layout/          # Layout components
│   └── product/         # Product-related components
├── context/             # React Context providers
├── data/                # Data fetching and transforms
├── hooks/               # Custom React hooks
├── lib/                 # Utility libraries
├── schemas/             # Zod validation schemas
├── types/               # TypeScript types
└── utils/               # Helper functions
```

## Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style (formatting, semicolons, etc.)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvement
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
feat(cart): add quantity selector to cart items
fix(checkout): resolve payment intent race condition
docs(api): add Shopify integration guide
test(cart): add unit tests for CartContext
refactor(products): extract price calculation logic
```

## Testing

### Running Tests

```bash
# Run all tests in watch mode
npm test

# Run tests once (CI mode)
npm run test:run

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

### Writing Tests

- **Unit tests**: Test individual functions and utilities
- **Component tests**: Test React components in isolation
- **Integration tests**: Test component interactions
- **E2E tests**: Test complete user flows

```typescript
// Component test example
describe('ProductCard', () => {
  it('displays product title and price', () => {
    render(<ProductCard product={mockProduct} />)

    expect(screen.getByText('Test Product')).toBeInTheDocument()
    expect(screen.getByText('From $45')).toBeInTheDocument()
  })
})
```

### Test Coverage

- Minimum coverage thresholds:
  - Lines: 70%
  - Functions: 70%
  - Branches: 60%
  - Statements: 70%

## Pull Request Process

### Before Submitting

1. Ensure all tests pass: `npm run validate`
2. Update documentation if needed
3. Add tests for new functionality
4. Keep changes focused and atomic

### PR Template

PRs should include:

- Clear description of changes
- Link to related issue (if any)
- Screenshots for UI changes
- Test plan

### Review Process

1. All PRs require at least one approval
2. CI checks must pass
3. No merge conflicts with `main`
4. Squash commits when merging

## Questions?

- Open an issue for bugs or feature requests
- Start a discussion for questions or ideas

---

Thank you for contributing! Your efforts help make this project better for everyone.
