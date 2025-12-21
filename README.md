# Receipt Image Generator

Web tool that generates fake receipt images. Primary use case is testing apps that rely on capturing receipt images with a camera.

<img width="1301" alt="Screenshot 2025-03-14 at 10 23 48 AM" src="https://github.com/user-attachments/assets/1d35a5bf-d70c-417b-bb17-8e7877d7991a" />

## Overview

Receipt Image Generator is a flexible, browser-based utility for creating realistic receipt images with customizable content, formatting, and visual characteristics. Whether you're developing OCR software, testing receipt scanning functionality, or need sample receipts for demos, this tool eliminates the need to create physical receipts for testing purposes.

## Features

- **Custom Receipt Creation**: Generate receipts with customizable store names, dates, items, prices, and totals
- **Realistic Formatting Options**: Configure receipt width, fonts, spacing, and overall appearance
- **Visual Effects**: Add realistic imperfections like skewing, rotation, shadows, and noise to simulate camera-captured receipts
- **Preset Templates**: Use built-in templates for common receipt styles (grocery, restaurant, retail, etc.)
- **Batch Generation**: Create multiple receipts with varying parameters for comprehensive testing
- **Mobile-Friendly Interface**: Create and preview receipts directly on mobile devices
- **User Accounts**: Save and manage receipts with user authentication
- **Receipt Management**: Save, edit, favorite, and organize your generated receipts

## Benefits

- **Accelerated Development**: Quickly generate test images without needing physical receipts
- **Consistent Test Data**: Create controlled test cases with specific receipt characteristics
- **Edge Case Testing**: Simulate difficult-to-capture receipts with various imperfections
- **Environmentally Friendly**: Reduce paper waste by using digital mock receipts
- **Time and Cost Savings**: Eliminate manual receipt creation and photography
- **Improved Testing Coverage**: Test with a wider variety of receipt formats than would be practical to collect physically

## Use Cases

- Testing receipt scanning applications and OCR systems
- Developing expense tracking and management software
- Creating demonstration materials for financial applications
- QA testing for point-of-sale and inventory management systems
- Training machine learning models for receipt analysis
- Simulating receipt captures in various lighting and angle conditions

## Getting Started

1. Access the tool via your web browser (no installation required)
2. Choose a receipt template or start from scratch
3. Customize the receipt content, format, and appearance
4. Apply visual effects to simulate camera capture if desired
5. Preview the generated receipt

## Example Usage

- Generate receipts with specific totals to test expense limit functionality
- Create receipts with particular items to test categorization features
- Simulate poorly captured receipts to test the robustness of your OCR system
- Generate receipts in multiple languages to test international support

## Technical Details

This is a full-stack web application built with React (frontend) and Netlify Functions (backend). Receipt generation happens client-side, while user authentication, receipt storage, and data management are handled by the backend API. The application uses Supabase (PostgreSQL) for data persistence and custom session-based authentication.

## License

MIT

---

*Note: This tool is intended for testing and development purposes only. Generated receipts should not be used for fraudulent purposes or to mislead others about actual purchases.*
