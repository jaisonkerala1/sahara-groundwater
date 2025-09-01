import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';

function Footer() {
  return (
    <footer className="bg-white">
      <div className="container mx-auto px-6 py-12">
        
        {/* Main Footer Content - Three Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Address Section */}
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <MapPin className="w-8 h-8 text-primary-purple" />
            </div>
            <h4 className="text-gray-900 font-bold text-lg mb-4">Address</h4>
            <div className="text-gray-700 space-y-1">
              <p>EEP-15/614-A, Kadumeni,</p>
              <p>Chittarikkal, Bheemanady,</p>
              <p>Kasaragod,</p>
              <p>Kerala, 671533</p>
            </div>
          </div>
          
          {/* Call Us Section */}
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Phone className="w-8 h-8 text-primary-purple" />
            </div>
            <h4 className="text-gray-900 font-bold text-lg mb-4">Call Us</h4>
            <div className="text-gray-700">
              <p>+917012051937</p>
            </div>
          </div>
          
          {/* Email Us Section */}
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Mail className="w-8 h-8 text-primary-purple" />
            </div>
            <h4 className="text-gray-900 font-bold text-lg mb-4">Email Us</h4>
            <div className="text-gray-700 space-y-1">
              <p>support@saharagroundwater.com</p>
              <p>contact@saharagroundwater.com</p>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-gray-200 mt-12 pt-8 text-center">
          <p className="text-gray-600 text-sm">
            © 2024 Sahara Groundwater Kerala. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
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
