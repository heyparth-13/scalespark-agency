const mongoose = require('mongoose');

const PortfolioSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  clientName: {
    type: String,
    required: true
  },
  industry: {
    type: String,
    required: true
  },
  techUsed: [String],
  resultsAchieved: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Web Development', 'E-Commerce', 'Digital Marketing', 'Branding', 'Content Creation'],
    required: true
  },
  image: {
    type: String,
    default: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Portfolio', PortfolioSchema);
