# Schema
```
[type]([scope]): [subject] 
[body] 
```

### Type
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code restructuring
- `perf`: Performance improvement
- `style`: Code style changes
- `test`: Adding or correcting tests
- `docs`: Documentation changes
- `build`: Build-related changes
- `ops`: Operational changes
- `chore`: Miscellaneous

### Scope
- Optional
- Project-specific

### Subject
- Mandatory
- Imperative, present tense
- No capitalization or ending dot
- must be short, but relavent 
- Do not use vague phrases such as: update files, code fixes, refactors and improvements

### Body
- Optional, preferred
- Imperative, present tense
- List changes in each file
- document API changes
- updates to functions
- provide examples of the updated implementation. If appropriate

#Examples

### Features
```
feat(api): add login endpoint
feat(ui): introduce dark mode toggle
```

```
fix(database): resolve connection issue
fix(auth): handle token expiration
fix(loader): improve string replacement on windows paths
```

```
refactor: move helpers to utils folder
refactor(api): optimize pagination
```

```
perf: improve page load speed
perf(api): optimize database query

perf: improve runtime complexity of X Y

A description about how the changes improve runtime complexity
```

```
style: reformat code with prettier
style: remove trailing spaces
style: fix typescript issues
```


```
test: add unit tests for new feature
test: correct failing integration test
```

```
docs: update README
docs(api): add swagger documentation

Documentation updates to data apis for user profile
```

```
build: update package dependencies
build: set up CI pipeline
build: update webpack,next,vite,rollup,esbuild,babel configs
```

```
ops: update server configuration
ops: set up backup routines
```

```
chore: update .gitignore
chore: clean up old logs
```

Only write information relative to the git diff code