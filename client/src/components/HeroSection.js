import React from 'react';
import { Zap, ArrowRight, Play } from 'lucide-react';

function HeroSection() {
  return (
    <section className="purple-gradient-bg relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent transform -skew-y-12"></div>
      </div>
      
      <div className="container mx-auto px-6 py-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Content */}
          <div className="text-left space-y-6">
            {/* Malayalam Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              കിണറുകൾക്ക് ഇനി<br />
              ശാസ്ത്രീയമായി<br />
              <span className="yellow-highlight flex items-center">
                സ്‌നാനം കണ്ടെത്താം
                <Zap className="w-8 h-8 ml-2 text-secondary-yellow animate-pulse" />
              </span>
            </h1>
            
            {/* English Subheading */}
            <p className="text-xl md:text-2xl text-white text-opacity-90 font-medium">
              Now discover water sources scientifically with Sahara Groundwater Kerala.
            </p>
            
            {/* Features List */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-white">
                <Zap className="w-5 h-5 text-secondary-yellow" />
                <span>AI-Powered Geological Analysis</span>
              </div>
              <div className="flex items-center space-x-3 text-white">
                <Zap className="w-5 h-5 text-secondary-yellow" />
                <span>15+ Years Experience in Kerala</span>
              </div>
              <div className="flex items-center space-x-3 text-white">
                <Zap className="w-5 h-5 text-secondary-yellow" />
                <span>95% Success Rate in Water Discovery</span>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button className="book-now-button flex items-center justify-center space-x-2 text-lg">
                <Zap className="w-5 h-5" />
                <span>Book Survey Now</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              
              <button className="flex items-center justify-center space-x-2 text-white border-2 border-white border-opacity-30 px-6 py-3 rounded-2xl hover:bg-white hover:bg-opacity-10 transition-all duration-300">
                <Play className="w-5 h-5" />
                <span>Watch Demo</span>
              </button>
            </div>
          </div>
          
          {/* Right Content - Groundwater Machine Image */}
          <div className="relative">
            <div className="relative z-10">
              {/* Placeholder for groundwater machine image */}
              <div className="bg-white bg-opacity-10 rounded-3xl p-8 backdrop-blur-sm border border-white border-opacity-20">
                <div className="aspect-square bg-white bg-opacity-20 rounded-2xl flex items-center justify-center">
                  {/* You can replace this with an actual groundwater machine image */}
                  <div className="text-center text-white">
                    <div className="w-24 h-24 mx-auto bg-secondary-yellow rounded-full flex items-center justify-center mb-4">
                      <Zap className="w-12 h-12 text-primary-purple" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Advanced Equipment</h3>
                    <p className="text-white text-opacity-80">Professional groundwater detection technology</p>
                  </div>
                  
                  {/* If you have an actual image, use this instead: */}
                  {/* <img 
                    src="/path-to-groundwater-machine-image.jpg" 
                    alt="Groundwater Detection Machine" 
                    className="w-full h-full object-cover rounded-2xl"
                  /> */}
                </div>
              </div>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-secondary-yellow rounded-full flex items-center justify-center animate-bounce">
              <Zap className="w-8 h-8 text-primary-purple" />
            </div>
            
            <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-secondary-yellow rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white text-opacity-60">
        <div className="flex flex-col items-center space-y-2">
          <span className="text-sm">Scroll to explore</span>
          <div className="w-6 h-10 border-2 border-white border-opacity-30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white bg-opacity-60 rounded-full mt-2 animate-bounce"></div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
