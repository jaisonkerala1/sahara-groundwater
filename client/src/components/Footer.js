import React from 'react';
import { Phone, Mail, MapPin, Zap, Facebook, Instagram, Twitter } from 'lucide-react';

function Footer() {
  return (
    <footer className="purple-gradient-bg border-t border-white border-opacity-10">
      <div className="container mx-auto px-6 py-12">
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <img 
                src="https://saharagroundwater.com/wp-content/uploads/2025/08/illpxmckwd.png" 
                alt="Sahara Groundwater Kerala Logo" 
                className="h-10 w-auto"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              {/* Fallback icon */}
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-2xl items-center justify-center hidden">
                <Zap className="w-5 h-5 text-secondary-yellow" />
              </div>
              <h3 className="text-xl font-bold text-white">Sahara Groundwater Kerala</h3>
            </div>
            
            <p className="text-white text-opacity-80 mb-6 max-w-md">
              Kerala's leading groundwater survey and borewell services company. 
              We use advanced scientific methods and AI technology to locate water sources with 95% accuracy.
            </p>
            
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-white bg-opacity-10 rounded-full flex items-center justify-center hover:bg-secondary-yellow hover:text-primary-purple transition-all duration-300">
                <Facebook className="w-5 h-5 text-white" />
              </a>
              <a href="#" className="w-10 h-10 bg-white bg-opacity-10 rounded-full flex items-center justify-center hover:bg-secondary-yellow hover:text-primary-purple transition-all duration-300">
                <Instagram className="w-5 h-5 text-white" />
              </a>
              <a href="#" className="w-10 h-10 bg-white bg-opacity-10 rounded-full flex items-center justify-center hover:bg-secondary-yellow hover:text-primary-purple transition-all duration-300">
                <Twitter className="w-5 h-5 text-white" />
              </a>
            </div>
          </div>
          
          {/* Services */}
          <div>
            <h4 className="text-white font-bold text-lg mb-4">Our Services</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-white text-opacity-80 hover:text-secondary-yellow transition-colors">Groundwater Survey</a></li>
              <li><a href="#" className="text-white text-opacity-80 hover:text-secondary-yellow transition-colors">Borewell Drilling</a></li>
              <li><a href="#" className="text-white text-opacity-80 hover:text-secondary-yellow transition-colors">Open Well Construction</a></li>
              <li><a href="#" className="text-white text-opacity-80 hover:text-secondary-yellow transition-colors">Water Quality Testing</a></li>
              <li><a href="#" className="text-white text-opacity-80 hover:text-secondary-yellow transition-colors">Geological Consultation</a></li>
              <li><a href="#" className="text-white text-opacity-80 hover:text-secondary-yellow transition-colors">AI Analysis Reports</a></li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h4 className="text-white font-bold text-lg mb-4">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-secondary-yellow" />
                <span className="text-white text-opacity-80">+91 98470 12345</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-secondary-yellow" />
                <span className="text-white text-opacity-80">info@saharagroundwater.com</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-secondary-yellow mt-1" />
                <span className="text-white text-opacity-80">
                  Sahara Complex,<br />
                  Kochi, Kerala 682001
                </span>
              </div>
            </div>
            
            {/* Emergency Contact */}
            <div className="mt-6 p-4 bg-secondary-red rounded-2xl">
              <h5 className="text-white font-bold text-sm mb-2">24/7 Emergency</h5>
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-white" />
                <span className="text-white font-bold">+91 98470 99999</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-white border-opacity-10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white text-opacity-60 text-sm">
            © 2024 Sahara Groundwater Kerala. All rights reserved.
          </p>
          
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-white text-opacity-60 hover:text-secondary-yellow text-sm transition-colors">Privacy Policy</a>
            <a href="#" className="text-white text-opacity-60 hover:text-secondary-yellow text-sm transition-colors">Terms of Service</a>
            <a href="#" className="text-white text-opacity-60 hover:text-secondary-yellow text-sm transition-colors">Disclaimer</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
