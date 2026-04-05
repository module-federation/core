# Claude Task Parallelization & Development Guidelines

## Core Principles

### Maximum Parallelization Strategy
- **ALWAYS PARALLELIZE**: Break down ANY task into multiple parallel sub-tasks
- **IMMEDIATE EXECUTION**: Launch parallel Task agents immediately without asking questions
- **NO CLARIFICATION**: Skip asking about implementation details unless absolutely critical
- **CONTEXT EFFICIENCY**: Each task handles only its specific scope to minimize token usage

## Universal Parallel Task Patterns

### For Any Codebase Task
Analyze the request and immediately split into parallel tasks based on:

1. **File Type Separation**
   - Source code files
   - Test files
   - Configuration files
   - Documentation files
   - Build/deployment files

2. **Functional Separation**
   - Core implementation
   - Helper/utility functions
   - Integration points
   - Data models/schemas
   - External interfaces

3. **Directory-Based Separation**
   - Different modules/packages
   - Frontend vs backend
   - Library vs application code
   - Public vs private APIs

### Dynamic Task Allocation Examples

#### Example 1: Feature Implementation (5-7 parallel tasks)
- Task 1: Core feature logic
- Task 2: Supporting utilities/helpers
- Task 3: Tests (if applicable)
- Task 4: Integration with existing code
- Task 5: Configuration updates
- Task 6: Type definitions (if typed language)
- Task 7: Remaining changes and coordination

#### Example 2: Bug Investigation (3-10 parallel tasks)
- Task 1: Search for error patterns in logs/code
- Task 2: Analyze related test files
- Task 3: Check recent commits/changes
- Task 4: Investigate similar issues in codebase
- Task 5: Review documentation/comments

#### Example 3: Refactoring (4-6 parallel tasks)
- Task 1: Identify all usage locations
- Task 2: Plan new structure
- Task 3: Update core implementations
- Task 4: Update dependent code
- Task 5: Update tests
- Task 6: Verify no breaking changes

#### Example 4: Codebase Analysis (5-8 parallel tasks)
- Task 1: Analyze file structure
- Task 2: Review core business logic
- Task 3: Map dependencies
- Task 4: Identify patterns/conventions
- Task 5: Review configuration
- Task 6: Analyze build system
- Task 7: Check documentation
- Task 8: Security/performance patterns

### Adaptive Parallelization Rules
1. **Minimum 3 tasks**: Even simple requests should use at least 3 parallel tasks
2. **Maximum 10 tasks**: Avoid over-fragmentation; combine related work
3. **File count based**: 
   - 1-5 files: 3-4 tasks
   - 6-20 files: 5-7 tasks
   - 20+ files: 7-10 tasks
4. **Complexity based**:
   - Simple changes: 3-4 tasks
   - Medium complexity: 5-7 tasks
   - High complexity: 7-10 tasks

### Post-Execution Coordination
Always include a final review task that:
- Synthesizes findings from all parallel tasks
- Resolves any conflicts or overlaps
- Runs verification commands (lint, test, build)
- Provides unified summary of changes

## Context Optimization Strategies

### Code Reading Rules
- **STRIP COMMENTS**: Remove all comments when analyzing existing code
- **FOCUSED SCOPE**: Each task reads ONLY files relevant to its specific responsibility
- **MINIMIZE CONTEXT**: Avoid loading unnecessary files to preserve token efficiency

### File Management
- **PREFER MODIFICATION**: Always edit existing files over creating new ones
- **MINIMAL CHANGES**: Make the smallest possible changes to achieve functionality
- **PRESERVE PATTERNS**: Maintain existing code style and architectural patterns

## Implementation Guidelines

### Critical Rules
1. **PRESERVE ARCHITECTURE**: Never change existing patterns without explicit request
2. **FOLLOW CONVENTIONS**: Match existing naming, file organization, and code style
3. **REUSE COMPONENTS**: Use existing utilities, hooks, and components before creating new ones
4. **ATOMIC CHANGES**: Each task makes self-contained, non-conflicting modifications
5. **TEST COVERAGE**: Maintain or improve test coverage with changes
6. **BACKWARDS COMPATIBILITY**: Ensure changes don't break existing functionality
7. **PERFORMANCE AWARE**: Consider performance implications of changes
8. **SECURITY CONSCIOUS**: Never introduce security vulnerabilities

### Efficiency Practices
- Launch all tasks in a single message using multiple tool invocations
- Each task should have clear, non-overlapping responsibilities
- Consolidate small related changes into Task 7 to prevent over-fragmentation

### Error Handling
- Each task should handle its own errors gracefully
- If a task encounters blockers, it should document them clearly
- The review task should identify and resolve integration issues
- Always provide actionable error messages
- Suggest fixes for common errors encountered
- Log errors with context for debugging
- Fail fast but provide recovery options

## Parallelization Examples

### Example: "Fix the login bug"
```
Claude: [Launches 5 parallel tasks immediately]
- Task 1: Search for login-related code and error patterns
- Task 2: Check recent commits touching authentication
- Task 3: Analyze login tests and error logs
- Task 4: Review auth configuration and dependencies
- Task 5: Investigate similar issues and edge cases
```

### Example: "Add a new API endpoint"
```
Claude: [Launches 6 parallel tasks immediately]
- Task 1: Create endpoint handler/controller
- Task 2: Add data models/validation
- Task 3: Write tests for the endpoint
- Task 4: Update routing configuration
- Task 5: Add necessary middleware/auth
- Task 6: Update API documentation
```

### Example: "Analyze this Python codebase"
```
Claude: [Launches 7 parallel tasks immediately]
- Task 1: Map project structure and entry points
- Task 2: Analyze core business logic modules
- Task 3: Review data models and database schema
- Task 4: Check dependencies and requirements
- Task 5: Analyze test coverage and patterns
- Task 6: Review configuration and deployment
- Task 7: Identify coding standards and patterns
```

### Example: "Optimize database queries"
```
Claude: [Launches 5 parallel tasks immediately]
- Task 1: Find all database query locations
- Task 2: Analyze query performance patterns
- Task 3: Review indexes and schema design
- Task 4: Check for N+1 and inefficient queries
- Task 5: Research caching opportunities
```

### Task Independence Principle
- Each task must be completely independent
- No task should wait for another's output
- All tasks read original state of codebase
- Coordination happens only in final review task

## Best Practices

### Do's
- ✓ ALWAYS use multiple parallel tasks (minimum 3)
- ✓ Launch all tasks in a single message immediately
- ✓ Break down even simple tasks into parallel subtasks
- ✓ Keep each task focused on specific scope/files
- ✓ Use more tasks for complex or multi-file operations
- ✓ Include a coordination/review task at the end
- ✓ Adapt task count based on request complexity
- ✓ Verify changes with tests and linting
- ✓ Follow existing code patterns and conventions
- ✓ Provide clear summaries of changes made
- ✓ Use TodoWrite to track progress on complex tasks

### Don'ts
- ✗ Use a single task when multiple would be faster
- ✗ Ask for clarification before launching tasks
- ✗ Make tasks dependent on each other
- ✗ Load entire codebase into a single task
- ✗ Create documentation unless specifically requested
- ✗ Limit parallelization to specific languages/frameworks
- ✗ Make breaking changes without user consent
- ✗ Ignore existing architectural patterns
- ✗ Skip running tests after changes
- ✗ Create new files when existing ones can be modified

## Performance Optimization

### Context Management
- Each task loads minimal necessary files
- Strip comments when analyzing code
- Focus on specific patterns/directories per task
- Avoid redundant file reads across tasks
- Use glob patterns to efficiently find relevant files
- Prioritize reading only the sections of files needed
- Use line offset/limit for large files
- Cache file structure understanding across tasks

### Parallel Execution Benefits
- 3-10x faster execution through parallelization
- Reduced total token usage via distributed context
- Better coverage through specialized tasks
- Easier debugging through isolated task outputs
- More thorough analysis via diverse perspectives

## Key Parallelization Triggers

### Always Parallelize When:
1. **Multiple files involved** - Different tasks for different files/directories
2. **Multiple aspects** - Separate tasks for logic, tests, config, docs
3. **Investigation needed** - Parallel search strategies
4. **Complex changes** - Break into logical subtasks
5. **Analysis requested** - Different angles of analysis
6. **Performance issues** - Parallel investigation paths
7. **Refactoring** - Separate tasks for finding and updating
8. **Debugging** - Multiple hypotheses to investigate simultaneously
9. **Feature implementation** - Core logic, tests, integration, configuration
10. **Code review** - Architecture, performance, security, maintainability
11. **Migration tasks** - Old code analysis, new implementation, testing
12. **Optimization** - Identify bottlenecks, implement fixes, verify improvements

### Parallelization Mindset
- Think "How can I split this?" not "Should I split this?"
- Default to MORE tasks rather than fewer
- Every request deserves parallel execution
- Speed and thoroughness come from parallelization
- Independent tasks = maximum efficiency
- Each task should complete in under 30 seconds ideally
- Tasks should have clear, measurable outcomes
- Consider task dependencies only in the review phase

## Tool Usage Guidelines

### Package Manager
- **ALWAYS use pnpm**: Never use npm, always use pnpm for all package operations
- Commands: `pnpm install`, `pnpm add`, `pnpm run`, etc.
- If pnpm is not available, inform the user to install it
- Check package.json for existing scripts before creating new ones

### Testing & Quality
- **Run tests after changes**: Always run the project's test suite after making modifications
- **Lint & Format**: Run linting and formatting tools (eslint, prettier, etc.) to ensure code quality
- **Build verification**: Verify the project builds successfully after changes
- **Type checking**: Run TypeScript compiler or type checker if applicable

### Git Best Practices
- **Small, focused commits**: Make atomic commits with clear messages
- **Branch management**: Create feature branches for significant changes
- **Review changes**: Always review git diff before committing
- **Commit message format**: Follow project's commit message conventions

## Development Best Practices

### Code Quality Standards
- **Clean Code**: Write self-documenting code with meaningful variable names
- **DRY Principle**: Don't Repeat Yourself - extract common logic
- **SOLID Principles**: Follow when applicable to the language/framework
- **Comments**: Only add when code intent isn't clear from reading

### Performance Considerations
- **Lazy Loading**: Implement where appropriate for better initial load
- **Memoization**: Use for expensive computations
- **Bundle Size**: Be mindful of import sizes and tree-shaking
- **Async Operations**: Properly handle promises and avoid blocking

### Security Guidelines
- **Input Validation**: Always validate user inputs
- **Sanitization**: Sanitize data before rendering or storing
- **Dependencies**: Keep dependencies up to date
- **Secrets**: Never commit secrets or API keys

## Communication Guidelines

### Progress Updates
- Provide concise updates after each major step
- Use TodoWrite for complex multi-step tasks
- Summarize findings clearly at the end
- Highlight any blockers or issues encountered

Avaliable pnpm commands in workspace, can run with pnpm [script] -w

```
  "commit": "cz",
  "docs": "typedoc",
  "f": "pnpm exec prettier --write .",
  "enhanced:jest": "pnpm build && cd packages/enhanced && NODE_OPTIONS=--experimental-vm-modules npx jest test/ConfigTestCases.basictest.js test/unit",
  "lint": "pnpm run lint:packages",
  "test": "pnpm exec turbo run test",
  "build": "pnpm run build:packages",
  "build:all": "pnpm exec turbo run build --concurrency=8",
  "build:packages": "pnpm exec turbo run build --filter=./packages/** --concurrency=10",
  "test:packages": "pnpm exec turbo run test --filter=./packages/** --concurrency=6",
  "lint-fix": "node tools/scripts/lint-fix.mjs",
  "trigger-release": "node -e 'import(\"open\").then(open => open.default(\"https://github.com/module-federation/core/actions/workflows/trigger-release.yml\"))'",
  "serve:next": "pnpm exec turbo run serve --filter=@module-federation/3000-home --filter=@module-federation/3001-shop --filter=@module-federation/3002-checkout --filter=app-router-4000 --filter=app-router-4001 --concurrency=20",
  "app:router:dev": "pnpm exec turbo run serve --filter=host --filter=host-v5 --filter=host-vue3 --filter=remote1 --filter=remote2 --filter=remote3 --filter=remote4 --filter=remote5 --filter=remote6 --concurrency=20",
  "app:next-router:dev": "pnpm exec turbo run serve --filter=app-router-4000 --filter=app-router-4001",
  "serve:website": "pnpm --filter website-new run serve",
  "build:website": "pnpm exec turbo run build --filter=website-new --concurrency=1",
  "extract-i18n:website": "pnpm --filter website-new run extract-i18n",
  "sync:pullMFTypes": "concurrently \"node ./packages/enhanced/pullts.js\"",
  "app:next:dev": "pnpm exec turbo run serve:development --filter=@module-federation/3000-home --filter=@module-federation/3001-shop --filter=@module-federation/3002-checkout",
  "app:next:build": "pnpm exec turbo run build:production --filter=@module-federation/3000-home --filter=@module-federation/3001-shop --filter=@module-federation/3002-checkout --concurrency=20",
  "app:next:prod": "pnpm run app:next:build && pnpm exec turbo run serve:production --filter=@module-federation/3000-home --filter=@module-federation/3001-shop --filter=@module-federation/3002-checkout",
  "app:node:dev": "pnpm exec turbo run serve:development --filter=node-host --filter=node-local-remote --filter=node-remote --filter=node-dynamic-remote-new-version --filter=node-dynamic-remote --concurrency=20",
  "app:runtime:dev": "pnpm exec turbo run serve:development --filter=runtime-host --filter=runtime-remote1 --filter=runtime-remote2",
  "app:manifest:dev": "pnpm exec turbo run serve:development --filter=3008-webpack-host --filter=3009-webpack-provider --filter=3010-rspack-provider --filter=3011-rspack-manifest-provider --filter=3012-rspack-js-entry-provider --concurrency=100",
  "app:manifest:prod": "pnpm exec turbo run serve:production --filter=3008-webpack-host --filter=3009-webpack-provider --filter=3010-rspack-provider --filter=3011-rspack-manifest-provider --filter=3012-rspack-js-entry-provider --concurrency=100",
  "app:ts:dev": "pnpm exec turbo run serve --filter=react-ts-host --filter=react-ts-nested-remote --filter=react-ts-remote",
  "app:component-data-fetch:dev": "pnpm exec turbo run dev --filter=modernjs-ssr-data-fetch-provider --filter=modernjs-ssr-data-fetch-provider-csr --filter=modernjs-ssr-data-fetch-host --concurrency=20",
  "app:modern:dev": "pnpm exec turbo run dev --filter=modernjs-ssr-dynamic-nested-remote --filter=modernjs-ssr-dynamic-remote --filter=modernjs-ssr-dynamic-remote-new-version --filter=modernjs-ssr-host --filter=modernjs-ssr-nested-remote --filter=modernjs-ssr-remote --filter=modernjs-ssr-remote-new-version --concurrency=20",
  "commitlint": "commitlint --edit",
  "prepare": "husky install",
  "changeset": "changeset",
  "changegen": "./changeset-gen.js --path ./packages/runtime && ./changeset-gen.js --path ./packages/runtime-core && ./changeset-gen.js --path ./packages/sdk &&./changeset-gen.js --path ./packages/cli --staged && ./changeset-gen.js --path ./packages/enhanced && ./changeset-gen.js --path ./packages/node && ./changeset-gen.js --path ./packages/data-prefetch && ./changeset-gen.js --path ./packages/nextjs-mf && ./changeset-gen.js --path ./packages/dts-plugin",
  "commitgen:staged": "./commit-gen.js --path ./packages --staged",
  "commitgen:main": "./commit-gen.js --path ./packages",
  "changeset:status": "changeset status",
  "generate:schema": "pnpm --filter @module-federation/enhanced run generate:schema && pnpm exec prettier --write ."
  ```
