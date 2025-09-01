import React from 'react';
import { Zap } from 'lucide-react';

function Header() {
  return (
    <header className="purple-gradient-bg">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Company Name */}
          <div className="flex items-center space-x-4">
            <img 
              src="https://saharagroundwater.com/wp-content/uploads/2022/02/cropped-logo.png" 
              alt="Sahara Groundwater Kerala Logo" 
              className="h-12 w-auto"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            {/* Fallback icon if logo fails to load */}
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-2xl items-center justify-center hidden">
              <Zap className="w-6 h-6 text-secondary-yellow" />
            </div>
            
            <div>
              <h1 className="text-2xl font-bold text-white">Sahara Groundwater Kerala</h1>
              <p className="text-white text-opacity-90 text-sm">
                Professional Groundwater Survey & Borewell Services
              </p>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#services" className="text-white hover:text-secondary-yellow transition-colors">Services</a>
            <a href="#about" className="text-white hover:text-secondary-yellow transition-colors">About</a>
            <a href="#contact" className="text-white hover:text-secondary-yellow transition-colors">Contact</a>
            <button className="book-now-button flex items-center space-x-2">
              <Zap className="w-4 h-4" />
              <span>Book Now</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;
