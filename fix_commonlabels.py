#!/usr/bin/env python3
import os
import re

# Find all dev, qa, preprod kustomization files
root = "services"
count = 0

for dirpath, dirnames, filenames in os.walk(root):
    if "overlays" in dirpath:
        env = dirpath.split("/")[-1]
        if env in ["dev", "qa", "preprod"]:
            kustomization_file = os.path.join(dirpath, "kustomization.yaml")
            if os.path.exists(kustomization_file):
                with open(kustomization_file, 'r') as f:
                    content = f.read()
                
                # Check if it has commonLabels
                if "commonLabels:" in content:
                    # Remove commonLabels section (2 lines: "commonLabels:" and "  environment: X")
                    new_content = re.sub(r'^commonLabels:\n  environment:.*\n', '', content, flags=re.MULTILINE)
                    
                    with open(kustomization_file, 'w') as f:
                        f.write(new_content)
                    print(f"Fixed: {kustomization_file}")
                    count += 1

print(f"\nTotal files fixed: {count}")
