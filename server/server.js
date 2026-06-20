const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();

const User = require('./models/User');
const Lead = require('./models/Lead');
const Blog = require('./models/Blog');
const Portfolio = require('./models/Portfolio');
const Review = require('./models/Review');
const auth = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'scalespark_secret_key';

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../client')));

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/scalespark';
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB Connected Successfully to:', MONGODB_URI);
    seedAdminUser();
  })
  .catch(err => {
    console.error('MongoDB Connection Error:', err.message);
  });

// Seed default Admin User if not exists
async function seedAdminUser() {
  try {
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      const defaultAdmin = new User({
        username: 'admin',
        password: 'adminpassword123'
      });
      await defaultAdmin.save();
      console.log('---------------------------------------------------------');
      console.log('DEFAULT ADMIN USER CREATED:');
      console.log('Username: admin');
      console.log('Password: adminpassword123');
      console.log('Please change this credentials in your production environment.');
      console.log('---------------------------------------------------------');
    }
  } catch (err) {
    console.error('Seeding admin user failed:', err.message);
  }
}

// Nodemailer transporter helper
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: process.env.SMTP_PORT || 587,
    auth: {
      user: process.env.SMTP_USER || null,
      pass: process.env.SMTP_PASS || null
    }
  });
};

// API ROUTES

// Auth Login
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const payload = { user: { id: user.id } };
    jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' }, (err, token) => {
      if (err) throw err;
      // Set HttpOnly cookie
      res.cookie('token', token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });
      res.json({ token, user: { id: user.id, username: user.username } });
    });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Auth Logout
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ msg: 'Logged out successfully' });
});

// Verify Auth Token
app.get('/api/auth/verify', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Create Lead (Public endpoint)
app.post('/api/leads', async (req, res) => {
  const { name, email, phone, businessName, serviceRequired, budget, projectDetails } = req.body;
  try {
    const newLead = new Lead({
      name,
      email,
      phone,
      businessName,
      serviceRequired,
      budget,
      projectDetails
    });
    const lead = await newLead.save();

    // Send email notification (async)
    const transporter = createTransporter();
    const mailOptions = {
      from: process.env.SMTP_FROM || '"ScaleSpark Agency Notifications" <no-reply@scalespark.com>',
      to: process.env.ADMIN_NOTIFICATION_EMAIL || email, // Notify admin or fallback to customer
      subject: `New Lead Inquiry from ${name} - ScaleSpark`,
      text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nBusiness: ${businessName || 'N/A'}\nService: ${serviceRequired || 'N/A'}\nBudget: ${budget}\nDetails: ${projectDetails}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('SMTP email notify failed (ignoring, probably dummy credentials):', error.message);
      } else {
        console.log('Notification email sent successfully:', info.messageId);
      }
    });

    res.json({ success: true, lead });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Get all leads (Admin protected)
app.get('/api/leads', auth, async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });
    res.json(leads);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Update lead status (Admin protected)
app.put('/api/leads/:id', auth, async (req, res) => {
  const { status } = req.body;
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ msg: 'Lead not found' });

    lead.status = status;
    await lead.save();
    res.json(lead);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// GET Blogs (Public)
app.get('/api/blogs', async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// GET Blog detail (Public)
app.get('/api/blogs/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ msg: 'Blog post not found' });
    res.json(blog);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Create Blog (Admin protected)
app.post('/api/blogs', auth, async (req, res) => {
  const { title, content, summary, tags, image } = req.body;
  try {
    const newBlog = new Blog({ title, content, summary, tags, image });
    const blog = await newBlog.save();
    res.json(blog);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Update Blog (Admin protected)
app.put('/api/blogs/:id', auth, async (req, res) => {
  const { title, content, summary, tags, image } = req.body;
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ msg: 'Blog post not found' });

    if (title) blog.title = title;
    if (content) blog.content = content;
    if (summary) blog.summary = summary;
    if (tags) blog.tags = tags;
    if (image) blog.image = image;

    await blog.save();
    res.json(blog);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Delete Blog (Admin protected)
app.delete('/api/blogs/:id', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ msg: 'Blog post not found' });

    await blog.deleteOne();
    res.json({ msg: 'Blog post removed' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// GET Portfolios (Public)
app.get('/api/portfolios', async (req, res) => {
  try {
    const portfolios = await Portfolio.find().sort({ createdAt: -1 });
    res.json(portfolios);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Create Portfolio (Admin protected)
app.post('/api/portfolios', auth, async (req, res) => {
  const { title, clientName, industry, techUsed, resultsAchieved, description, category, image } = req.body;
  try {
    const newPortfolio = new Portfolio({
      title, clientName, industry, techUsed, resultsAchieved, description, category, image
    });
    const portfolio = await newPortfolio.save();
    res.json(portfolio);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Update Portfolio (Admin protected)
app.put('/api/portfolios/:id', auth, async (req, res) => {
  const { title, clientName, industry, techUsed, resultsAchieved, description, category, image } = req.body;
  try {
    const portfolio = await Portfolio.findById(req.params.id);
    if (!portfolio) return res.status(404).json({ msg: 'Portfolio project not found' });

    if (title) portfolio.title = title;
    if (clientName) portfolio.clientName = clientName;
    if (industry) portfolio.industry = industry;
    if (techUsed) portfolio.techUsed = techUsed;
    if (resultsAchieved) portfolio.resultsAchieved = resultsAchieved;
    if (description) portfolio.description = description;
    if (category) portfolio.category = category;
    if (image) portfolio.image = image;

    await portfolio.save();
    res.json(portfolio);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Delete Portfolio (Admin protected)
app.delete('/api/portfolios/:id', auth, async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);
    if (!portfolio) return res.status(404).json({ msg: 'Portfolio project not found' });

    await portfolio.deleteOne();
    res.json({ msg: 'Portfolio project removed' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// GET Reviews (Public)
app.get('/api/reviews', async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Create Review (Admin protected)
app.post('/api/reviews', auth, async (req, res) => {
  const { clientName, businessName, rating, review, clientImage } = req.body;
  try {
    const newReview = new Review({ clientName, businessName, rating, review, clientImage });
    const saved = await newReview.save();
    res.json(saved);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Delete Review (Admin protected)
app.delete('/api/reviews/:id', auth, async (req, res) => {
  try {
    const rev = await Review.findById(req.params.id);
    if (!rev) return res.status(404).json({ msg: 'Review not found' });

    await rev.deleteOne();
    res.json({ msg: 'Review removed' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// GET Analytics (Admin protected)
app.get('/api/analytics', auth, async (req, res) => {
  try {
    const leadsCount = await Lead.countDocuments();
    const activeLeadsCount = await Lead.countDocuments({ status: { $ne: 'Closed' } });
    const blogsCount = await Blog.countDocuments();
    const portfoliosCount = await Portfolio.countDocuments();

    // Group leads by month/date or get recent leads
    const recentLeads = await Lead.find().sort({ createdAt: -1 }).limit(5);

    res.json({
      leadsCount,
      activeLeadsCount,
      blogsCount,
      portfoliosCount,
      recentLeads
    });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Catch-all route to serve index.html for frontend routing or contact forms
app.get(/^\/(.*)/, (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
