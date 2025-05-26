# 🤝 Contributing to omniverse.AI Voice Shopping Marketplace

Thank you for your interest in contributing to omniverse.AI! This document provides guidelines and information for contributors.

## 📋 **Table of Contents**

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Submitting Changes](#submitting-changes)
- [Issue Reporting](#issue-reporting)
- [Feature Requests](#feature-requests)

## 📜 **Code of Conduct**

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [itisaddy7@gmail.com](mailto:itisaddy7@gmail.com).

## 🚀 **Getting Started**

### **Prerequisites**

```bash
Node.js >= 18.0.0
npm >= 9.0.0
Git
```

### **Development Setup**

```bash
# 1. Fork the repository on GitHub
# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/omniverse-ai-voice-marketplace.git
cd omniverse-ai-voice-marketplace

# 3. Add upstream remote
git remote add upstream https://github.com/original-owner/omniverse-ai-voice-marketplace.git

# 4. Install dependencies
npm install

# 5. Start development servers
npm run dev:server  # API server (port 3001)
npm run dev         # Frontend (port 5174)
```

### **Project Structure**

```
src/
├── components/     # Reusable React components
├── pages/         # Page components
├── context/       # React Context providers
├── hooks/         # Custom React hooks
├── services/      # API and external services
├── utils/         # Utility functions
├── types/         # TypeScript type definitions
└── data/          # Mock data and constants
```

## 🔄 **Development Workflow**

### **1. Create a Feature Branch**

```bash
# Update your main branch
git checkout main
git pull upstream main

# Create a feature branch
git checkout -b feature/amazing-feature
```

### **2. Make Your Changes**

- Follow the coding standards below
- Write tests for new functionality
- Update documentation as needed
- Ensure accessibility compliance

### **3. Test Your Changes**

```bash
# Run all tests
npm run test

# Run specific test suites
npm run test:accessibility
npm run test:performance
npm run lint

# Build and preview
npm run build
npm run preview
```

### **4. Commit Your Changes**

We use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Examples of good commit messages
git commit -m "feat: add voice command for product filtering"
git commit -m "fix: resolve mobile touch interaction issues"
git commit -m "docs: update API documentation"
git commit -m "test: add accessibility tests for voice components"
```

**Commit Types:**

- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

## 📏 **Coding Standards**

### **TypeScript Guidelines**

```typescript
// ✅ Good: Use explicit types
interface ProductProps {
  id: string;
  name: string;
  price: number;
  onSelect: (product: Product) => void;
}

// ✅ Good: Use proper naming conventions
const handleVoiceSearchResult = (result: SearchResult): void => {
  // Implementation
};

// ❌ Avoid: Any types
const handleResult = (result: any) => {
  // Avoid this
};
```

### **React Component Guidelines**

```tsx
// ✅ Good: Functional components with proper TypeScript
interface VoiceSearchProps {
  onResult: (result: SearchResult) => void;
  isListening?: boolean;
  className?: string;
}

const VoiceSearch: React.FC<VoiceSearchProps> = ({
  onResult,
  isListening = false,
  className = "",
}) => {
  // Use hooks properly
  const [isActive, setIsActive] = useState(false);

  // Memoize expensive calculations
  const processedResults = useMemo(() => {
    return expensiveCalculation(results);
  }, [results]);

  return (
    <motion.div
      className={`voice-search ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Component content */}
    </motion.div>
  );
};
```

### **CSS/Tailwind Guidelines**

```tsx
// ✅ Good: Use Tailwind classes with proper organization
<button className="
  px-4 py-2
  bg-blue-500 hover:bg-blue-600
  text-white font-medium
  rounded-lg shadow-md
  transition-colors duration-200
  focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
  disabled:opacity-50 disabled:cursor-not-allowed
">
  Voice Search
</button>

// ✅ Good: Use CSS custom properties for complex styles
<div className="voice-indicator" style={{
  '--pulse-color': isListening ? '#10b981' : '#6b7280'
}}>
```

### **Accessibility Guidelines**

```tsx
// ✅ Always include proper ARIA labels
<button
  aria-label="Start voice search"
  aria-pressed={isListening}
  onClick={handleVoiceSearch}
>
  🎤
</button>

// ✅ Provide keyboard navigation
<div
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
>
```

## 🧪 **Testing Guidelines**

### **Unit Tests**

```typescript
// Example test structure
describe("VoiceSearch Component", () => {
  it("should start listening when button is clicked", async () => {
    const onResult = jest.fn();
    render(<VoiceSearch onResult={onResult} />);

    const button = screen.getByLabelText("Start voice search");
    fireEvent.click(button);

    expect(button).toHaveAttribute("aria-pressed", "true");
  });

  it("should be accessible", async () => {
    const { container } = render(<VoiceSearch onResult={jest.fn()} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### **Integration Tests**

```typescript
// Test complete user flows
describe("Voice Shopping Flow", () => {
  it("should complete voice search to purchase flow", async () => {
    // Test the complete user journey
    await voiceSearch("Find Nike shoes under 10000");
    await selectProduct("Nike Air Force 1");
    await addToCart();
    await proceedToCheckout();

    expect(screen.getByText("Order Summary")).toBeInTheDocument();
  });
});
```

### **Performance Tests**

```typescript
// Test performance metrics
describe("Performance", () => {
  it("should load products within 2 seconds", async () => {
    const startTime = performance.now();
    await loadProducts();
    const endTime = performance.now();

    expect(endTime - startTime).toBeLessThan(2000);
  });
});
```

## 📝 **Submitting Changes**

### **Pull Request Process**

1. **Update Documentation**: Ensure README, CHANGELOG, and relevant docs are updated
2. **Add Tests**: Include tests for new functionality
3. **Check Accessibility**: Run accessibility tests and manual checks
4. **Performance Check**: Verify no performance regressions
5. **Create Pull Request**: Use the PR template

### **Pull Request Template**

```markdown
## 📋 Description

Brief description of changes

## 🎯 Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## 🧪 Testing

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Accessibility tests passing
- [ ] Performance tests passing

## 📱 Mobile Testing

- [ ] Tested on mobile devices
- [ ] Touch interactions working
- [ ] Responsive design verified

## ♿ Accessibility

- [ ] ARIA labels added
- [ ] Keyboard navigation working
- [ ] Screen reader compatible
- [ ] Color contrast verified

## 📊 Performance

- [ ] Bundle size impact checked
- [ ] Animation performance verified
- [ ] Core Web Vitals maintained

## 📸 Screenshots

Include screenshots for UI changes
```

## 🐛 **Issue Reporting**

### **Bug Reports**

Use the bug report template:

```markdown
**Bug Description**
Clear description of the bug

**Steps to Reproduce**

1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected Behavior**
What you expected to happen

**Screenshots**
Add screenshots if applicable

**Environment**

- OS: [e.g. iOS]
- Browser: [e.g. chrome, safari]
- Version: [e.g. 22]
- Device: [e.g. iPhone6]
```

## 💡 **Feature Requests**

### **Feature Request Template**

```markdown
**Feature Description**
Clear description of the feature

**Problem Statement**
What problem does this solve?

**Proposed Solution**
How should this feature work?

**Alternatives Considered**
Other solutions you've considered

**Additional Context**
Any other context or screenshots
```

## 🏷️ **Labels and Milestones**

### **Issue Labels**

- `bug`: Something isn't working
- `enhancement`: New feature or request
- `documentation`: Improvements or additions to documentation
- `good first issue`: Good for newcomers
- `help wanted`: Extra attention is needed
- `accessibility`: Accessibility-related issues
- `performance`: Performance-related issues
- `mobile`: Mobile-specific issues

### **Priority Labels**

- `priority: low`: Low priority
- `priority: medium`: Medium priority
- `priority: high`: High priority
- `priority: critical`: Critical priority

## 🎯 **Areas for Contribution**

### **High Priority Areas**

1. **Voice Recognition Improvements**

   - Multi-language support enhancement
   - Noise cancellation algorithms
   - Accent recognition improvements

2. **Accessibility Enhancements**

   - Screen reader optimizations
   - Keyboard navigation improvements
   - High contrast mode support

3. **Mobile Experience**

   - Touch gesture improvements
   - Performance optimizations
   - PWA features

4. **Testing & Quality**
   - Automated testing expansion
   - Performance testing
   - Cross-browser testing

### **Documentation Needs**

- API documentation improvements
- Component documentation
- Tutorial creation
- Video guides

## 🎉 **Recognition**

Contributors will be recognized in:

- README.md contributors section
- Release notes
- Project documentation
- Annual contributor highlights

## 📞 **Getting Help**

- 💬 [GitHub Discussions](https://github.com/your-username/omniverse-ai-voice-marketplace/discussions)
- 📧 [Email Support](mailto:itisaddy7@gmail.com)
- 📚 [Documentation](https://github.com/your-username/omniverse-ai-voice-marketplace/wiki)

## 📄 **License**

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to omniverse.AI! 🚀**
