import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';

function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-50 to-white border-t border-gray-200">
      <div className="container mx-auto px-8 py-16">
        
        {/* Main Footer Content - Three Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          
          {/* Address Section */}
          <div className="text-center group">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-purple to-primary-purpleDark rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                <MapPin className="w-8 h-8 text-white" />
              </div>
            </div>
            <h4 className="text-gray-900 font-bold text-xl mb-4 tracking-wide">Address</h4>
            <div className="text-gray-600 space-y-2 leading-relaxed">
              <p className="font-medium">EEP-15/614-A, Kadumeni,</p>
              <p>Chittarikkal, Bheemanady,</p>
              <p>Kasaragod,</p>
              <p className="font-semibold text-gray-700">Kerala, 671533</p>
            </div>
          </div>
          
          {/* Call Us Section */}
          <div className="text-center group">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-purple to-primary-purpleDark rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                <Phone className="w-8 h-8 text-white" />
              </div>
            </div>
            <h4 className="text-gray-900 font-bold text-xl mb-4 tracking-wide">Call Us</h4>
            <div className="text-gray-600">
              <p className="text-lg font-semibold text-primary-purple hover:text-primary-purpleDark transition-colors duration-300 cursor-pointer">
                +918050381803
              </p>
            </div>
          </div>
          
          {/* Email Us Section */}
          <div className="text-center group">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-purple to-primary-purpleDark rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                <Mail className="w-8 h-8 text-white" />
              </div>
            </div>
            <h4 className="text-gray-900 font-bold text-xl mb-4 tracking-wide">Email Us</h4>
            <div className="text-gray-600 space-y-2">
              <p className="text-primary-purple hover:text-primary-purpleDark transition-colors duration-300 cursor-pointer">
                support@saharagroundwater.com
              </p>
              <p className="text-primary-purple hover:text-primary-purpleDark transition-colors duration-300 cursor-pointer">
                support@saharagroundwater.com
              </p>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-gray-200 pt-8">
          <div className="text-center">
            <p className="text-gray-500 text-sm font-medium">
              © 2024 Sahara Groundwater Kerala. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
