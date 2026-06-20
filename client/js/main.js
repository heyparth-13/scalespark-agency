// Custom Cursor removed per user request

// Magnetic Buttons
const magneticWraps = document.querySelectorAll('.magnetic-wrap');
magneticWraps.forEach(wrap => {
  const btn = wrap.querySelector('.magnetic-btn');
  if (!btn) return;
  
  wrap.addEventListener('mousemove', (e) => {
    const position = wrap.getBoundingClientRect();
    const x = e.clientX - position.left - position.width / 2;
    const y = e.clientY - position.top - position.height / 2;
    
    // Move the inner button relative to the stable wrapper
    btn.style.transform = `translate(${x * 0.3}px, ${y * 0.5}px)`;
  });

  wrap.addEventListener('mouseleave', () => {
    btn.style.transform = `translate(0px, 0px)`;
  });
});

// Header Scroll Effect
const header = document.querySelector('header');
if (header) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

// ScrollReveal Removed for stability
const portfolioPreviewContainer = document.getElementById('portfolioPreviewContainer');
const portfolioContainer = document.getElementById('portfolioContainer'); // Added for portfolio.html grid

const mockPortfolios = [
  { title: "Fintech Startup", category: "Web Development", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80" },
  { title: "Luxury Retailer", category: "E-Commerce", image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80" },
  { title: "B2B SaaS Growth", category: "Digital Marketing", image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&q=80" },
  { title: "Organic Skincare", category: "Branding", image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=800&q=80" },
  { title: "Hyperlocal Delivery", category: "App Design", image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80" },
  { title: "Global Logistics", category: "Web Development", image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80" },
  { title: "Artisan Coffee", category: "E-Commerce", image: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=800&q=80" },
  { title: "Next-Gen AI Platform", category: "Branding", image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80" }
];

const renderPortfolios = (container, data, limit = data.length) => {
  container.innerHTML = '';
  data.slice(0, limit).forEach(p => {
    const el = document.createElement('div');
    el.className = 'portfolio-item reveal view-trigger';
    el.addEventListener('mouseenter', () => cursor && cursor.classList.add('view-mode'));
    el.addEventListener('mouseleave', () => cursor && cursor.classList.remove('view-mode'));
    
    el.innerHTML = `
      <div class="portfolio-img-container">
        <img src="${p.image}" alt="${p.title}">
      </div>
      <div class="portfolio-info">
        <div>
          <h3>${p.title}</h3>
          <div class="portfolio-category">${p.category}</div>
        </div>
        <a href="portfolio.html" style="color: var(--text-primary); border-bottom: 1px solid var(--text-primary);">Explore</a>
      </div>
    `;
    container.appendChild(el);
  });
  if (typeof ScrollReveal !== 'undefined') ScrollReveal().sync();
};

if (portfolioPreviewContainer || portfolioContainer) {
  const loadPortfolios = async () => {
    try {
      const res = await fetch('/api/portfolios');
      if (!res.ok) throw new Error('Database connection failed');
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error('Invalid data format');
      
      if (portfolioPreviewContainer) renderPortfolios(portfolioPreviewContainer, data, 4);
      if (portfolioContainer) renderPortfolios(portfolioContainer, data);
    } catch (err) {
      console.warn('Falling back to mock portfolio data:', err.message);
      if (portfolioPreviewContainer) renderPortfolios(portfolioPreviewContainer, mockPortfolios, 4);
      if (portfolioContainer) renderPortfolios(portfolioContainer, mockPortfolios);
    }
  };
  loadPortfolios();
}

// Fetch Reviews
const reviewsContainer = document.getElementById('reviewsContainer');
const fullReviewsContainer = document.getElementById('fullReviewsContainer'); // For reviews.html

const mockReviews = [
  { clientName: "Sarah Jenkins", businessName: "TechFlow Inc.", rating: 5, review: "ScaleSpark completely transformed our digital presence. Our lead volume tripled in 60 days.", clientImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80" },
  { clientName: "Marcus Thorne", businessName: "Thorne Luxury", rating: 5, review: "The level of bespoke craftsmanship is unmatched. Our custom e-commerce store is blazingly fast.", clientImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80" },
  { clientName: "Elena Rodriguez", businessName: "Sol Health", rating: 5, review: "Their marketing strategies are purely data-driven. We lowered our CPA by 40% while scaling ad spend.", clientImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80" }
];

const renderReviews = (container, data, limit = data.length) => {
  container.innerHTML = '';
  data.slice(0, limit).forEach(r => {
    const el = document.createElement('div');
    el.className = 'review-card-bespoke reveal';
    el.innerHTML = `
      <div class="quote-mark">"</div>
      <p>"${r.review}"</p>
      <div style="display: flex; align-items: center; gap: 1rem; margin-top: 2rem;">
        <img src="${r.clientImage}" alt="${r.clientName}" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover;">
        <div>
          <h4 style="font-size: 1rem; margin-bottom: 0;">${r.clientName}</h4>
          <span style="font-size: 0.8rem; color: var(--text-muted);">${r.businessName}</span>
        </div>
      </div>
    `;
    container.appendChild(el);
  });
  if (typeof ScrollReveal !== 'undefined') ScrollReveal().sync();
};

if (reviewsContainer || fullReviewsContainer) {
  const loadReviews = async () => {
    try {
      const res = await fetch('/api/reviews');
      if (!res.ok) throw new Error('Database connection failed');
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error('Invalid data format');
      
      if (reviewsContainer) renderReviews(reviewsContainer, data, 3);
      if (fullReviewsContainer) renderReviews(fullReviewsContainer, data);
    } catch (err) {
      console.warn('Falling back to mock review data:', err.message);
      if (reviewsContainer) renderReviews(reviewsContainer, mockReviews, 3);
      if (fullReviewsContainer) renderReviews(fullReviewsContainer, mockReviews);
    }
  };
  loadReviews();
}

// FAQ Accordion
const faqItems = document.querySelectorAll('.faq-item');
faqItems.forEach(item => {
  const question = item.querySelector('.faq-question');
  if (question) {
    question.addEventListener('click', () => {
      const activeItem = document.querySelector('.faq-item.active');
      if (activeItem && activeItem !== item) {
        activeItem.classList.remove('active');
      }
      item.classList.toggle('active');
    });
  }
});

// Contact Form Submit
const leadForm = document.getElementById('leadForm');
if (leadForm) {
  leadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = leadForm.querySelector('button');
    const msg = document.getElementById('formMessage');
    
    btn.textContent = 'Sending...';
    btn.disabled = true;

    const payload = {
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value,
      businessName: document.getElementById('businessName').value,
      serviceRequired: document.getElementById('serviceRequired').value,
      budget: document.getElementById('budget').value,
      projectDetails: document.getElementById('projectDetails').value
    };

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        msg.style.color = 'green';
        msg.textContent = 'Inquiry submitted successfully. We will be in touch soon.';
        leadForm.reset();
      } else {
        throw new Error('Server Error');
      }
    } catch (err) {
      msg.style.color = 'red';
      msg.textContent = 'Failed to submit inquiry. Please try again.';
    } finally {
      btn.textContent = 'Submit Inquiry';
      btn.disabled = false;
    }
  });
}
