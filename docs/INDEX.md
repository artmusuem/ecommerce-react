# Documentation Index

## SSR-Safe State Persistence

Complete documentation for the localStorage persistence architecture using React 18's `useSyncExternalStore` pattern.

### Quick Links

| Document | Description | Audience |
|----------|-------------|----------|
| [Architecture](./architecture/ARCHITECTURE.md) | System design, data flow, decisions | Senior engineers, architects |
| [Guide](./guides/SSR-PERSISTENCE-GUIDE.md) | Step-by-step implementation walkthrough | All developers |
| [API Reference](./api/API.md) | Complete API documentation | Implementers |
| [Changelog](./CHANGELOG.md) | Decision log, version history, errors | Maintainers |
| [Verification](./VERIFICATION.md) | Build verification, test results, screenshots | QA, DevOps |

### Source Code Documentation

| Location | Description |
|----------|-------------|
| [src/lib/README.md](../src/lib/README.md) | Utility library overview |
| [src/context/README.md](../src/context/README.md) | Context providers overview |

---

## Document Purposes

### Architecture (`architecture/`)
High-level system design documentation. Covers:
- Problem statement and constraints
- Solution architecture and patterns
- Component relationships
- Data flow diagrams
- Performance characteristics
- Security considerations

**When to read:** Planning new features, onboarding, code review

### Guides (`guides/`)
Educational content that walks through implementation. Covers:
- Conceptual explanations
- Step-by-step tutorials
- Code examples with commentary
- Common pitfalls and solutions
- Testing strategies

**When to read:** Learning the codebase, implementing similar features

### API Reference (`api/`)
Comprehensive function and type documentation. Covers:
- Function signatures
- Parameter descriptions
- Return types
- Usage examples
- Error handling

**When to read:** Day-to-day development, debugging

### Changelog
Historical record of changes and decisions. Covers:
- Version history
- Breaking changes
- Migration guides
- Error resolution log
- Lessons learned

**When to read:** Upgrading, troubleshooting, understanding "why"

---

## Key Files

```
ecommerce-react-shopify/
├── docs/
│   ├── INDEX.md                          ← You are here
│   ├── CHANGELOG.md                      ← Version history
│   ├── VERIFICATION.md                   ← Build verification & test results
│   ├── architecture/
│   │   └── ARCHITECTURE.md               ← System design
│   ├── guides/
│   │   └── SSR-PERSISTENCE-GUIDE.md      ← Tutorial
│   ├── api/
│   │   └── API.md                        ← API reference
│   └── screenshots/
│       ├── homepage.png                  ← Production homepage
│       └── product-page.png              ← Product detail page
│
└── src/
    ├── lib/
    │   ├── README.md                     ← Library overview
    │   └── createPersistedStore.ts       ← Store factory
    ├── context/
    │   ├── README.md                     ← Context overview
    │   └── CartContext.tsx               ← Cart implementation
    └── types/
        └── index.ts                      ← Type definitions
```

---

## Contributing to Documentation

### Standards

1. **Markdown format** with GitHub-flavored extensions
2. **Code examples** must be valid TypeScript
3. **Tables** for structured data
4. **Diagrams** use ASCII art for portability

### Locations

| Content Type | Location |
|--------------|----------|
| Architecture decisions | `docs/architecture/` |
| Tutorials and guides | `docs/guides/` |
| API documentation | `docs/api/` |
| Module-specific docs | `src/[module]/README.md` |

### Review Checklist

- [ ] Code examples compile
- [ ] Links work (relative paths)
- [ ] No outdated information
- [ ] Consistent terminology
- [ ] Appropriate audience targeting
