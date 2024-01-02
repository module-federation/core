import os

def generate_readme(directory, output_file):
    ignored_files = ['CHANGELOG.md', 'yarn.lock', 'package-lock.json', 'tsconfig.json', 'tslint.json', 'LICENSE', '.gitignore']
    ignored_extensions = ['.snap', '.tsconfig.json', '.DS_Store', '.gitignore', '.npmignore', '.prettierrc', '.eslintrc', '.babelrc', '.travis.yml', '.editorconfig', '.stylelintrc', '.stylelintignore', '.gitattributes', '.gitmodules', '.gitkeep', '.npmrc', '.yarnrc', '.yarnclean', '.yarn-int']
    ignored_directories = ['node_modules', 'dist']

    def should_ignore(file_path):
        if file_path.startswith('.') or os.path.basename(file_path) in ignored_files or \
           any(file_path.endswith(ext) for ext in ignored_extensions) or \
           any(ignored_dir in file_path.split(os.path.sep) for ignored_dir in ignored_directories):
            return True
        return False

    files = []
    readme_file = None

    # Search for README.md in current directory and parent directory
    for search_directory in [directory, os.path.join(directory, '..')]:
        for dp, dn, filenames in os.walk(search_directory):
            for f in filenames:
                full_path = os.path.join(dp, f)
                if not should_ignore(full_path):
                    if f == 'README.md':
                        readme_file = full_path
                        break
                    if search_directory == directory:
                        files.append(full_path)
            if readme_file:
                break
        if readme_file:
            break

    # Splitting the files into 10 parts
    num_parts = 10
    files_per_part = max(1, len(files) // num_parts)
    file_parts = [files[i:i + files_per_part] for i in range(0, len(files), files_per_part)]

    with open(output_file, 'w') as md:
        # Writing README.md first, if it exists
        if readme_file:
            readme_relative_path = os.path.relpath(readme_file, directory)
            md.write(f'## {readme_relative_path}\n\n')
            with open(readme_file, 'r') as f:
                md.write('```markdown\n')
                md.write(f.read())
                md.write('\n```\n\n')

        # Writing other files in parts
        for part_index, part in enumerate(file_parts):
            md.write(f'## Part {part_index + 1}\n\n')
            for file in part:
                relative_path = os.path.relpath(file, directory)
                md.write(f'### {relative_path}\n\n')
                with open(file, 'r') as f:
                    md.write('```' + os.path.splitext(file)[1][1:] + '\n')
                    md.write(f.read())
                    md.write('\n```\n\n')

# Usage example:
generate_readme('packages/runtime/src', 'packages/runtime/_ai_readme.md')
generate_readme('packages/enhanced/src', 'packages/enhanced/_ai_readme.md')
generate_readme('packages/sdk/src', 'packages/sdk/_ai_readme.md')
generate_readme('packages/nextjs-mf/src', 'packages/nextjs-mf/_ai_readme.md')
