# Claude Task Parallelization Guidelines

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

#### Example 2: Bug Investigation (3-5 parallel tasks)
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

### Efficiency Practices
- Launch all tasks in a single message using multiple tool invocations
- Each task should have clear, non-overlapping responsibilities
- Consolidate small related changes into Task 7 to prevent over-fragmentation

### Error Handling
- Each task should handle its own errors gracefully
- If a task encounters blockers, it should document them clearly
- The review task should identify and resolve integration issues

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

### Don'ts
- ✗ Use a single task when multiple would be faster
- ✗ Ask for clarification before launching tasks
- ✗ Make tasks dependent on each other
- ✗ Load entire codebase into a single task
- ✗ Create documentation unless specifically requested
- ✗ Limit parallelization to specific languages/frameworks

## Performance Optimization

### Context Management
- Each task loads minimal necessary files
- Strip comments when analyzing code
- Focus on specific patterns/directories per task
- Avoid redundant file reads across tasks
- Use glob patterns to efficiently find relevant files

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

### Parallelization Mindset
- Think "How can I split this?" not "Should I split this?"
- Default to MORE tasks rather than fewer
- Every request deserves parallel execution
- Speed and thoroughness come from parallelization
- Independent tasks = maximum efficiency

## Tool Preferences

### Package Manager
- **ALWAYS use pnpm**: Never use npm, always use pnpm for all package operations
- Commands: `pnpm install`, `pnpm add`, `pnpm run`, etc.
- If pnpm is not available, inform the user to install it

### Code Search Optimization
- **Prefer ast-grep**: Use `mcp__ast-grep__ast_grep_search` for structural code searches
- ast-grep is superior for finding code patterns, function definitions, and structural elements
- Use ast-grep when searching for:
  - Function/class definitions
  - Specific code patterns
  - Variable usage across files
  - Structural code elements
  - Refactoring targets
- Fall back to Grep only for simple text searches or when ast-grep isn't suitable

### Example ast-grep Usage
```
# Instead of using Grep for finding function definitions:
# Bad: Grep for "function getUserData"
# Good: ast-grep search for function definition pattern

# Finding all React components:
pattern: "const $COMPONENT = () => { $$$ }"

# Finding specific function calls:
pattern: "getUserData($$$)"
```

This system ensures Claude always leverages parallel task execution, modern tools, and efficient search methods for maximum speed and efficiency across any codebase or request type.