# 📖 PDF Flipbook

A modern web application that transforms any PDF into an interactive flipbook experience. Built with PDF.js and PageFlip library.

## ✨ Features

- **PDF URL Support**: Load PDFs directly from URLs
- **Interactive Flipbook**: Smooth page-turning animations
- **Responsive Design**: Works on desktop and mobile devices
- **URL Parameters**: Load PDFs via URL parameters
- **Modern UI**: Beautiful, intuitive interface
- **Touch Support**: Swipe gestures on mobile devices

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd pdf-flipbook
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 📖 Usage

### Method 1: Manual Input
1. Enter a PDF URL in the input field
2. Click "Load PDF" or press Enter
3. Wait for the PDF to load and convert to flipbook

### Method 2: URL Parameters
Load a PDF directly via URL parameter:
```
http://localhost:3000?pdf=https://example.com/document.pdf
```

### Method 3: Example PDFs
Click on any of the example PDF links to test the application.

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Project Structure

```
pdf-flipbook/
├── src/
│   └── main.js          # Main application logic
├── index.html           # Main HTML file
├── package.json         # Dependencies and scripts
├── vite.config.js       # Vite configuration
└── README.md           # This file
```

## 🚀 Deployment

### Railway Deployment

This project is configured for Railway deployment:

1. **Connect to Railway**
   ```bash
   railway login
   railway link
   ```

2. **Deploy**
   ```bash
   railway up
   ```

3. **Set environment variables** (if needed)
   ```bash
   railway variables set NODE_ENV=production
   ```

### Other Platforms

The built application can be deployed to any static hosting service:
- Vercel
- Netlify
- GitHub Pages
- AWS S3
- etc.

## 🔧 Configuration

### PDF.js Worker
The application uses a CDN-hosted PDF.js worker. To use a local worker:

1. Install the worker package:
   ```bash
   npm install pdfjs-dist
   ```

2. Update the worker source in `src/main.js`:
   ```javascript
   pdfjsLib.GlobalWorkerOptions.workerSrc = '/node_modules/pdfjs-dist/build/pdf.worker.min.js';
   ```

### PageFlip Options
Customize the flipbook behavior by modifying the PageFlip configuration in `src/main.js`:

```javascript
pageFlip = new PageFlip(flipbookElement, {
    width: 550,           // Book width
    height: 733,          // Book height
    size: 'stretch',      // Size mode
    minWidth: 315,        // Minimum width
    maxWidth: 1000,       // Maximum width
    minHeight: 400,       // Minimum height
    maxHeight: 1533,      // Maximum height
    maxShadowOpacity: 0.5, // Shadow opacity
    showCover: true,      // Show cover page
    mobileScrollSupport: false // Mobile scroll support
});
```

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure the PDF URL allows cross-origin requests
2. **Large PDFs**: Very large PDFs may take time to load and convert
3. **Mobile Performance**: Some mobile devices may struggle with large PDFs

### Debug Mode

Enable debug logging by opening the browser console and looking for detailed error messages.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

If you encounter any issues or have questions, please open an issue on GitHub.

## 🙏 Acknowledgments

- [PDF.js](https://mozilla.github.io/pdf.js/) - PDF rendering library
- [PageFlip](https://nodlik.github.io/storybook/) - Flipbook library
- [Vite](https://vitejs.dev/) - Build tool
