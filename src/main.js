import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker
try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
} catch (error) {
    console.warn('Failed to set local worker, using CDN fallback');
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs';
}

let turnBook = null;
let currentPage = 1;
let totalPages = 0;
let currentPDF = null;

// Global functions for HTML onclick handlers
window.loadPDF = loadPDF;
window.previousPage = previousPage;
window.nextPage = nextPage;
window.downloadPDF = downloadPDF;


async function loadPDF() {
    const urlInput = document.getElementById('pdfUrl');
    const url = urlInput.value.trim();
    
    if (!url) {
        showError('Please enter a PDF URL');
        return;
    }
    
    // Validate URL
    try {
        new URL(url);
    } catch (e) {
        showError('Please enter a valid URL');
        return;
    }
    
    await processPDF(url);
}

async function processPDF(pdfUrl) {
    showLoading(true);
    hideError();
    clearFlipbook();
    
    try {
        console.log('Loading PDF from:', pdfUrl);
        
        const loadingTask = pdfjsLib.getDocument({
            url: pdfUrl,
            withCredentials: false,
            disableAutoFetch: false,
            disableStream: false
        });
        
        currentPDF = await loadingTask.promise;
        totalPages = currentPDF.numPages;
        console.log(`PDF loaded with ${totalPages} pages`);
        
        // Convert PDF pages to images
        const pages = [];
        
        for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
            const page = await currentPDF.getPage(pageNum);
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
        
        // Create flipbook with turn.js
        createFlipbook(pages);
        
    } catch (error) {
        console.error('Error loading PDF:', error);
        
        let errorMessage = 'Failed to load PDF';
        
        if (error.name === 'PasswordException') {
            errorMessage = 'This PDF is password protected';
        } else if (error.name === 'InvalidPDFException') {
            errorMessage = 'Invalid PDF file';
        } else if (error.message.includes('CORS')) {
            errorMessage = 'CORS error: PDF server doesn\'t allow cross-origin requests';
        } else if (error.message.includes('404')) {
            errorMessage = 'PDF file not found (404 error)';
        } else if (error.message.includes('fetch')) {
            errorMessage = 'Network error: Unable to fetch PDF. Check the URL and try again.';
        } else {
            errorMessage = `Failed to load PDF: ${error.message}`;
        }
        
        showError(errorMessage);
    } finally {
        showLoading(false);
    }
}

function createFlipbook(pages) {
    console.log('Creating flipbook with', pages.length, 'pages');
    
    const flipbookElement = document.getElementById('flipbook');
    flipbookElement.innerHTML = '';
    
    // Create page elements for turn.js
    pages.forEach((page, index) => {
        const pageElement = document.createElement('div');
        pageElement.className = 'page';
        pageElement.setAttribute('data-page', index + 1);
        
        const img = document.createElement('img');
        img.src = page.src;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'contain';
        img.alt = `Page ${index + 1}`;
        
        pageElement.appendChild(img);
        flipbookElement.appendChild(pageElement);
        
        console.log('Created page element:', index + 1, pageElement);
    });
    
    console.log('Page elements created, initializing turn.js...');
    console.log('Total page elements:', flipbookElement.children.length);
    
    // Initialize turn.js after a short delay to ensure DOM is ready
    setTimeout(() => {
        try {
            console.log('Initializing turn.js with', pages.length, 'pages');
            console.log('Flipbook element:', flipbookElement);
            console.log('jQuery element:', $('#flipbook'));
            
            // Initialize turn.js
            turnBook = $('#flipbook').turn({
                
                autoCenter: true,
                acceleration: true,
                elevation: 50,
                gradients: true,
                display: 'double',
                duration: 600,
                autoSize: true,
                disableFlipByClick: false,
                swipeDistance: 30,
                clickEventForward: true,
                useMouseEvents: true,
                renderWhileFlipping: true,
                allowTouch: true,
                allowManual: true,
                corners: 'forward',
                cornerSize: 100,
                when: {
                    turning: function(event, page, view) {
                        console.log('Turning to page:', page);
                        currentPage = page;
                        updatePageInfo();
                        updateControls();
                    },
                    turned: function(event, page, view) {
                        console.log('Turned to page:', page);
                        currentPage = page;
                        updatePageInfo();
                        updateControls();
                    },
                    start: function(event, pageObject, corner) {
                        console.log('Start event:', pageObject, corner);
                    },
                    missing: function(event, pages) {
                        console.log('Missing pages:', pages);
                    }
                }
            });
            
            console.log('Turn.js instance created:', turnBook);
            

            
            // Update initial state
            currentPage = 1;
            updatePageInfo();
            updateControls();
            

            
            console.log('Turn.js flipbook initialized successfully');
        } catch (error) {
            console.error('Error initializing turn.js:', error);
            showError('Failed to initialize flipbook. Please try again.');
        }
    }, 100);
}

function clearFlipbook() {
    const flipbookElement = document.getElementById('flipbook');
    flipbookElement.innerHTML = '';
    if (turnBook) {
        try {
            turnBook.turn('destroy');
        } catch (error) {
            console.warn('Error destroying turn.js instance:', error);
        }
        turnBook = null;
    }
    currentPage = 1;
    totalPages = 0;
    updatePageInfo();
    updateControls();
}

function previousPage() {
    if (turnBook && currentPage > 1) {
        try {
            turnBook.turn('previous');
        } catch (error) {
            console.error('Error turning to previous page:', error);
        }
    }
}

function nextPage() {
    if (turnBook && currentPage < totalPages) {
        try {
            turnBook.turn('next');
        } catch (error) {
            console.error('Error turning to next page:', error);
        }
    }
}

async function downloadPDF() {
    if (!currentPDF) {
        showError('No PDF loaded to download');
        return;
    }
    
    try {
        const url = document.getElementById('pdfUrl').value;
        const link = document.createElement('a');
        link.href = url;
        link.download = 'document.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        showError('Failed to download PDF');
    }
}

function updatePageInfo() {
    const pageInfo = document.getElementById('pageInfo');
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
}

function updateControls() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    
    const hasPages = totalPages > 0;
    
    prevBtn.disabled = !hasPages || currentPage <= 1;
    nextBtn.disabled = !hasPages || currentPage >= totalPages;
    downloadBtn.disabled = !hasPages;
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
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        error.style.display = 'none';
    }, 5000);
}

function hideError() {
    const error = document.getElementById('error');
    error.style.display = 'none';
}

// Handle URL parameters
function handleUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const pdfUrl = urlParams.get('pdf');
    const urlInputContainer = document.getElementById('urlInputContainer');
    
    if (pdfUrl) {
        // PDF URL provided - hide input and load PDF
        document.getElementById('pdfUrl').value = pdfUrl;
        processPDF(pdfUrl);
    } else {
        // No PDF URL - show input container
        urlInputContainer.classList.add('show');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded');
    console.log('PDF.js worker source:', pdfjsLib.GlobalWorkerOptions.workerSrc);
    console.log('jQuery version:', $.fn.jquery);
    console.log('Turn.js available:', typeof $.fn.turn !== 'undefined');
    
    handleUrlParams();
});

// Handle Enter key in input
document.getElementById('pdfUrl').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        loadPDF();
    }
});

// Add keyboard navigation
document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowLeft') {
        previousPage();
    } else if (e.key === 'ArrowRight') {
        nextPage();
    }
});
