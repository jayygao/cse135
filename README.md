# CSE 135 HW1 - Team Site

## Overview
This is the repository for our CSE 135 Homework 1 Team Site. It contains the main landing page and individual member pages.

## Deployment Method
We use a Git-based deployment workflow.

1. **Droplet Development**: We built the site via DigitalOcean droplet, but you can also git clone.
2. **Push to GitHub**: Changes are committed and pushed to the `main` branch.
   ```bash
   git add .
   git commit -m "Update site content"
   git push origin main
   ```
3. **Deployment**:
   - We have set up a Github action on github for deployment on our droplet whenever we have changes.
   - When code is pushed to the remote repo, the files are automatically copied to `/var/www/tidydata.online/cse135`.

## File Structure
- `index.html`: Main entry point.
- `style.css`: Shared styles.
- `members/`: Directory for individual member pages.
- `robots.txt`: Search engine instructions.

## Authors
- Jay Gao
- Jesse Huang
