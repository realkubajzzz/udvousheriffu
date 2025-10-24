// Reviews management JavaScript

// Helper function to get Supabase client
async function getSupabaseClient() {
    // If client is already created by main.js
    if (window.__sheriff_supabase_client) {
        return window.__sheriff_supabase_client;
    }
    
    // Create client if not exists
    const cfg = window.SHERIFF_SUPABASE || {};
    if (!cfg.url || !cfg.key) {
        console.error('Supabase config not found');
        return null;
    }

    const createClient = window.createClient || (window.supabase && window.supabase.createClient) || (window.Supabase && window.Supabase.createClient);
    if (!createClient) {
        console.error('Supabase createClient not found');
        return null;
    }

    const client = createClient(cfg.url, cfg.key);
    window.__sheriff_supabase_client = client;
    return client;
}

let currentPage = 0;
const reviewsPerPage = 12;
let allReviews = [];
let filteredReviews = [];
let currentFilter = 'all';

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadReviews();
    setupEventListeners();
});

function setupEventListeners() {
    const ratingFilter = document.getElementById('ratingFilter');
    const loadMoreBtn = document.getElementById('loadMoreBtn');

    ratingFilter.addEventListener('change', function() {
        currentFilter = this.value;
        filterReviews();
        displayReviews(true); // Reset display
    });

    loadMoreBtn.addEventListener('click', function() {
        displayReviews(false); // Load more
    });
}

async function loadReviews() {
    try {
        // Get Supabase client (wait for it to be available)
        const supabase = await getSupabaseClient();
        if (!supabase) {
            console.error('Supabase client not available');
            return;
        }

        const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .eq('is_approved', true)
            .order('date_created', { ascending: false });

        if (error) throw error;

        allReviews = data || [];
        filterReviews();
        displayReviews(true);
        updateStats();

    } catch (err) {
        console.error('Error loading reviews:', err);
        showError('Chyba při načítání recenzí');
    }
}

function filterReviews() {
    if (currentFilter === 'all') {
        filteredReviews = [...allReviews];
    } else {
        const rating = parseInt(currentFilter);
        filteredReviews = allReviews.filter(review => review.rating === rating);
    }
    currentPage = 0; // Reset pagination
}

function displayReviews(reset = false) {
    const container = document.getElementById('reviewsContainer');
    const loadMoreBtn = document.getElementById('loadMoreBtn');

    if (reset) {
        container.innerHTML = '';
        currentPage = 0;
    }

    if (filteredReviews.length === 0) {
        if (reset) {
            container.innerHTML = '<div class="no-reviews"><p>Zatím žádné recenze.</p></div>';
        }
        loadMoreBtn.style.display = 'none';
        return;
    }

    const startIndex = currentPage * reviewsPerPage;
    const endIndex = Math.min(startIndex + reviewsPerPage, filteredReviews.length);
    const reviewsToShow = filteredReviews.slice(startIndex, endIndex);

    reviewsToShow.forEach(review => {
        const reviewCard = createReviewCard(review);
        container.appendChild(reviewCard);
    });

    currentPage++;

    // Show/hide load more button
    if (endIndex >= filteredReviews.length) {
        loadMoreBtn.style.display = 'none';
    } else {
        loadMoreBtn.style.display = 'block';
    }
}

function createReviewCard(review) {
    const card = document.createElement('div');
    card.className = 'review-card';
    
    const reviewDate = new Date(review.date_created).toLocaleDateString('sk-SK', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const stars = generateStars(review.rating);

    card.innerHTML = `
        <div class="review-header">
            <div class="customer-info">
                <div class="customer-avatar">
                    ${review.customer_name.charAt(0).toUpperCase()}
                </div>
                <div class="customer-details">
                    <h4 class="customer-name">${escapeHtml(review.customer_name)}</h4>
                    <div class="review-rating">${stars}</div>
                </div>
            </div>
            <div class="review-date">${reviewDate}</div>
        </div>
        <div class="review-content">
            <p>${escapeHtml(review.review_text)}</p>
        </div>
    `;

    return card;
}

function generateStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '<span class="star filled">★</span>';
        } else {
            stars += '<span class="star">☆</span>';
        }
    }
    return stars;
}

function updateStats() {
    const totalReviewsEl = document.getElementById('totalReviews');
    const averageRatingEl = document.getElementById('averageRating');
    const averageStarsEl = document.getElementById('averageStars');

    const totalReviews = allReviews.length;
    totalReviewsEl.textContent = totalReviews;

    if (totalReviews > 0) {
        const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = (totalRating / totalReviews).toFixed(1);
        
        averageRatingEl.textContent = averageRating;
        averageStarsEl.innerHTML = generateStars(Math.round(averageRating));
    } else {
        averageRatingEl.textContent = '0.0';
        averageStarsEl.innerHTML = generateStars(0);
    }
}

// Utility function to escape HTML
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

function showError(message) {
    const container = document.getElementById('reviewsContainer');
    container.innerHTML = `<div class="error-message"><p>${message}</p></div>`;
}

// Function to get 5-star reviews for homepage (will be used by main.js)
async function getFiveStarReviews(limit = 3) {
    try {
        // Get Supabase client
        const supabase = await getSupabaseClient();
        if (!supabase) {
            console.error('Supabase client not available');
            return [];
        }

        const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .eq('is_approved', true)
            .eq('rating', 5)
            .order('date_created', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data || [];
    } catch (err) {
        console.error('Error loading 5-star reviews:', err);
        return [];
    }
}

// Export function for use in other scripts
window.getFiveStarReviews = getFiveStarReviews;