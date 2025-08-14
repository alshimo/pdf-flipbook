import * as pdfjsLib from 'pdfjs-dist';
import { PageFlip } from 'page-flip';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.js';

let pageFlip = null;
let currentPage = 0;
let totalPages = 0;

// Global functions for HTML onclick handlers
window.loadPDF = loadPDF;
window.loadExample = loadExample;
window.previousPage = previousPage;
window.nextPage = nextPage;

async function loadPDF() {
    const urlInput = document.getElementById('pdfUrl');
    const url = urlInput.value.trim();
    
    if (!url) {
        showError('Please enter a PDF URL');
        return;
    }
    
    await processPDF(url);
}

async function loadExample(url) {
    document.getElementById('pdfUrl').value = url;
    await processPDF(url);
}

async function processPDF(pdfUrl) {
    showLoading(true);
    hideError();
    
    try {
        // Load the PDF
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        
        totalPages = pdf.numPages;
        console.log(`PDF loaded with ${totalPages} pages`);
        
        // Convert PDF pages to images
        const pages = [];
        for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const viewport = page.getViewport({ scale: 1.5 });
            
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            
            const renderContext = {
                canvasContext: context,
                viewport: viewport
            };
            
            await page.render(renderContext).promise;
            
            // Convert canvas to image
            const img = new Image();
            img.src = canvas.toDataURL();
            await new Promise(resolve => {
                img.onload = resolve;
            });
            
            pages.push(img);
        }
        
        // Create flipbook
        createFlipbook(pages);
        
    } catch (error) {
        console.error('Error loading PDF:', error);
        showError(`Failed to load PDF: ${error.message}`);
    } finally {
        showLoading(false);
    }
}

function createFlipbook(pages) {
    const flipbookElement = document.getElementById('flipbook');
    flipbookElement.innerHTML = '';
    
    // Create page elements
    pages.forEach((page, index) => {
        const pageElement = document.createElement('div');
        pageElement.className = 'page';
        pageElement.style.width = '100%';
        pageElement.style.height = '100%';
        pageElement.style.display = 'flex';
        pageElement.style.justifyContent = 'center';
        pageElement.style.alignItems = 'center';
        pageElement.style.backgroundColor = '#f5f5f5';
        
        const img = document.createElement('img');
        img.src = page.src;
        img.style.maxWidth = '100%';
        img.style.maxHeight = '100%';
        img.style.objectFit = 'contain';
        
        pageElement.appendChild(img);
        flipbookElement.appendChild(pageElement);
    });
    
    // Initialize PageFlip
    pageFlip = new PageFlip(flipbookElement, {
        width: 550,
        height: 733,
        size: 'stretch',
        minWidth: 315,
        maxWidth: 1000,
        minHeight: 400,
        maxHeight: 1533,
        maxShadowOpacity: 0.5,
        showCover: true,
        mobileScrollSupport: false
    });
    
    // Add pages to flipbook
    pageFlip.loadFromHTML(document.querySelectorAll('.page'));
    
    // Add event listeners
    pageFlip.on('flip', (e) => {
        currentPage = e.data + 1;
        updatePageInfo();
        updateControls();
    });
    
    // Update initial state
    currentPage = 1;
    updatePageInfo();
    updateControls();
}

function previousPage() {
    if (pageFlip && currentPage > 1) {
        pageFlip.flipPrev();
    }
}

function nextPage() {
    if (pageFlip && currentPage < totalPages) {
        pageFlip.flipNext();
    }
}

function updatePageInfo() {
    const pageInfo = document.getElementById('pageInfo');
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
}

function updateControls() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    prevBtn.disabled = currentPage <= 1;
    nextBtn.disabled = currentPage >= totalPages;
}

function showLoading(show) {
    const loading = document.getElementById('loading');
    const loadBtn = document.getElementById('loadBtn');
    
    if (show) {
        loading.style.display = 'block';
        loadBtn.disabled = true;
        loadBtn.textContent = 'Loading...';
    } else {
        loading.style.display = 'none';
        loadBtn.disabled = false;
        loadBtn.textContent = 'Load PDF';
    }
}

function showError(message) {
    const error = document.getElementById('error');
    error.textContent = message;
    error.style.display = 'block';
}

function hideError() {
    const error = document.getElementById('error');
    error.style.display = 'none';
}

// Handle URL parameters
function handleUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const pdfUrl = urlParams.get('pdf');
    
    if (pdfUrl) {
        document.getElementById('pdfUrl').value = pdfUrl;
        processPDF(pdfUrl);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', handleUrlParams);

// Handle Enter key in input
document.getElementById('pdfUrl').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        loadPDF();
    }
});
