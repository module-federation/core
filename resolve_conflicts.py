#!/usr/bin/env python3

import sys
import re

def resolve_conflicts(content):
    """
    Resolve git conflicts in pnpm-lock.yaml by choosing the origin/main version
    """
    lines = content.split('\n')
    result_lines = []
    in_conflict = False
    in_origin_section = False
    
    for line in lines:
        if line.startswith('<<<<<<< HEAD'):
            in_conflict = True
            continue
        elif line.startswith('======='):
            in_origin_section = True
            continue
        elif line.startswith('>>>>>>> origin/main'):
            in_conflict = False
            in_origin_section = False
            continue
        
        # When in conflict, only keep lines from origin/main section
        if in_conflict:
            if in_origin_section:
                result_lines.append(line)
            # Skip lines from HEAD section
        else:
            result_lines.append(line)
    
    return '\n'.join(result_lines)

if __name__ == '__main__':
    with open('pnpm-lock.yaml', 'r') as f:
        content = f.read()
    
    resolved_content = resolve_conflicts(content)
    
    with open('pnpm-lock.yaml', 'w') as f:
        f.write(resolved_content)
    
    print("Conflicts resolved successfully!")