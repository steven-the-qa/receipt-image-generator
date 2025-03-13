# Deployment Guide

This document provides instructions for deploying the Receipt Image Generator app to GitHub Pages and ensuring paths work correctly in both development and production environments.

## Environment-Specific Configuration

The app is configured to work in two environments:
- **Development**: http://localhost:3000/
- **Production**: https://steven-the-qa.github.io/receipt-image-generator/

## Key Components of the Solution

1. **BrowserRouter with Dynamic Basename**:
   - In `src/index.js`, the app detects the environment and sets the appropriate basename
   - This ensures all routes are prefixed with `/receipt-image-generator` in production

2. **Asset Path Resolution**:
   - `src/utils/pathResolver.js` provides a utility to resolve asset paths correctly
   - All image paths in the store registry use this resolver

3. **404 Page Redirect**:
   - `public/404.html` catches all 404 errors and redirects to the main app
   - The `RedirectHandler` component in `App.js` handles these redirects

4. **GitHub Pages Configuration**:
   - `package.json` includes the correct `homepage` field

## Deployment Steps

1. Ensure all changes are committed to your repository
2. Run the deploy command: `npm run deploy`
3. This will build the app and publish it to the `gh-pages` branch
4. Your app will be available at https://steven-the-qa.github.io/receipt-image-generator/

## Troubleshooting

If you encounter issues with paths:

1. **Image Loading Issues**:
   - Check browser console for network errors
   - Verify image paths in the Network tab
   - Ensure images exist in the correct location in `public/images/stores/`

2. **Routing Issues**:
   - Check that the RedirectHandler is working properly
   - Verify you're using React Router's `Link` component for navigation

3. **404 Page Not Working**:
   - Make sure the 404.html file is in the root of the `build` directory
   - Check the redirect script in the 404.html file

## Local Development

The path resolver and router configuration automatically handle the difference between development and production, so you should be able to run `npm start` and have everything work at `http://localhost:3000/` without the `/receipt-image-generator` prefix. 