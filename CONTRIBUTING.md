# Contributing to ClaudeDeck

Thank you for your interest in contributing to ClaudeDeck! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:
- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive criticism
- Respect differing viewpoints and experiences

## How to Contribute

### Reporting Issues

Before creating an issue, please:
1. Check existing issues to avoid duplicates
2. Use the issue search to see if it's already been reported
3. Update to the latest version to see if it's been fixed

When creating an issue:
- Use a clear, descriptive title
- Provide detailed steps to reproduce
- Include system information (OS, version, etc.)
- Add screenshots if applicable
- Mention the version of ClaudeDeck you're using

### Suggesting Features

We love feature suggestions! Please:
1. Check the roadmap and existing issues first
2. Provide a clear use case
3. Explain why this would benefit other users
4. Be open to discussion and feedback

### Pull Requests

#### Development Workflow

1. **Fork and Clone**
   ```bash
   git clone https://github.com/yourusername/claudedeck.git
   cd claudedeck
   npm install
   ```

2. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-description
   ```

3. **Make Changes**
   - Write clean, readable code
   - Follow the existing code style
   - Add tests for new functionality
   - Update documentation as needed

4. **Test Your Changes**
   ```bash
   # Run the development server
   npm run tauri dev
   
   # Run tests
   npm test
   cd src-tauri && cargo test
   
   # Check linting
   npm run lint
   npm run typecheck
   ```

5. **Commit Your Changes**
   - Use clear, descriptive commit messages
   - Follow conventional commits format:
     ```
     type(scope): description
     
     [optional body]
     
     [optional footer]
     ```
   - Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
   - Example: `feat(dashboard): add export to PDF functionality`

6. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```
   - Create a pull request from your fork
   - Fill out the PR template completely
   - Link related issues

#### PR Requirements

Your pull request should:
- Pass all CI checks
- Include tests for new features
- Update documentation if needed
- Follow the code style guidelines
- Have a clear description of changes
- Reference any related issues

### Code Style Guidelines

#### TypeScript/React

- Use TypeScript strict mode
- Prefer functional components with hooks
- Use meaningful variable and function names
- Keep components small and focused
- Document complex logic with comments

```typescript
// Good
interface UserData {
  id: string;
  name: string;
  usage: number;
}

const UserCard: React.FC<{ user: UserData }> = ({ user }) => {
  const formattedUsage = formatTokenCount(user.usage);
  
  return (
    <Card>
      <h3>{user.name}</h3>
      <p>Usage: {formattedUsage}</p>
    </Card>
  );
};
```

#### Rust

- Follow Rust naming conventions
- Use `clippy` for linting
- Handle errors appropriately
- Document public APIs

```rust
/// Loads usage entries from the Claude data directory
/// 
/// # Arguments
/// * `since_date` - Optional date to filter entries from
/// 
/// # Returns
/// * `Result<Vec<String>, String>` - Vector of JSONL entries or error
#[tauri::command]
pub fn load_usage_entries(
    since_date: Option<String>
) -> Result<Vec<String>, String> {
    // Implementation
}
```

#### CSS/Styling

- Use Tailwind CSS utilities when possible
- Follow mobile-first responsive design
- Maintain consistent spacing and sizing
- Use CSS variables for theme values

### Testing Guidelines

#### Frontend Tests

- Write unit tests for utilities and hooks
- Use React Testing Library for components
- Mock external dependencies
- Test both happy and error paths

```typescript
describe('formatTokenCount', () => {
  it('formats large numbers with commas', () => {
    expect(formatTokenCount(1234567)).toBe('1,234,567');
  });
  
  it('handles zero correctly', () => {
    expect(formatTokenCount(0)).toBe('0');
  });
});
```

#### Backend Tests

- Write unit tests for core functions
- Test error handling
- Mock file system operations
- Verify command outputs

```rust
#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_parse_claude_path() {
        let path = parse_claude_config_path();
        assert!(path.is_some());
    }
}
```

### Documentation

When adding new features or changing existing ones:
- Update the README if needed
- Add inline documentation
- Update API documentation
- Include examples where helpful

### Development Tips

1. **Use the Development Tools**
   - React DevTools for component debugging
   - Rust Analyzer for IDE support
   - Tauri DevTools for backend debugging

2. **Performance Considerations**
   - Avoid unnecessary re-renders
   - Use memoization for expensive computations
   - Lazy load large data sets
   - Profile before optimizing

3. **Common Pitfalls**
   - Don't use inline object selectors with Zustand
   - Remember Tailwind v4 differences
   - Handle async Tauri commands properly
   - Test on all target platforms

## Getting Help

If you need help:
1. Check the [documentation](docs/)
2. Look through existing issues
3. Ask in discussions
4. Reach out to maintainers

## Recognition

Contributors will be:
- Listed in the project README
- Mentioned in release notes
- Given credit in commit messages

Thank you for contributing to ClaudeDeck!