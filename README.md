# CSE 135 HW1 - Team Site

## Overview
This is the repository for our CSE 135 Homework 1 Team Site. It contains the main landing page and individual member pages.

## Deployment Method
We use a Git-based deployment workflow.

1. **Local Development**: We develop locally using VS Code.
2. **Push to GitHub**: Changes are committed and pushed to the `main` branch.
   ```bash
   git add .
   git commit -m "Update site content"
   git push origin main
   ```
3. **Deployment**:
   - We have set up a post-receive hook on our Digital Ocean Droplet (or use a GitHub Action).
   - When code is pushed to the remote repo, the files are automatically copied to `/var/www/html`.

## File Structure
- `index.html`: Main entry point.
- `style.css`: Shared styles.
- `members/`: Directory for individual member pages.
- `robots.txt`: Search engine instructions.

## Authors
- Jay Gao
