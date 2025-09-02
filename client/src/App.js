import React, { useState, useRef, useCallback } from 'react';
import { 
  Upload, 
  FileText, 
  Image, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  MapPin,
  Phone,
  Mail,
  Menu,
  X,
  Sparkles,
  Zap,
  Shield,
  Download
} from 'lucide-react';
import './App.css';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const fileInputRef = useRef(null);

  // Ripple effect utility
  const createRipple = useCallback((event) => {
    const button = event.currentTarget;
    const ripple = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    ripple.style.width = ripple.style.height = `${diameter}px`;
    ripple.style.left = `${event.clientX - button.getBoundingClientRect().left - radius}px`;
    ripple.style.top = `${event.clientY - button.getBoundingClientRect().top - radius}px`;
    ripple.classList.add('ripple');

    button.appendChild(ripple);
    window.setTimeout(() => ripple.remove(), 600);
  }, []);

  const handleFileSelect = useCallback((file) => {
    if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
      setSelectedFile(file);
    setError(null);
      setAnalysisResult(null);
    } else {
      setError('Please select a valid image or PDF file.');
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  }, [handleFileSelect]);

  const handleFileInputChange = useCallback((e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  }, [handleFileSelect]);

  const handleAnalyze = async () => {
    if (!selectedFile || isUploading) return;

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('surveyFile', selectedFile);

    // Add a hard timeout so the UI doesn't hang forever
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s

    try {
      const response = await fetch('/api/analyze-survey', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      let data;
      try {
        data = await response.json();
      } catch (e) {
        throw new Error('Invalid server response');
      }

      if (response.ok && data && data.success) {
        setAnalysisResult(data.surveyAnalysis);
      } else {
        setError((data && data.error) || `Analysis failed (status ${response.status}). Please try again.`);
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('The analysis is taking longer than expected. Please try again or retry with a smaller/clearer file.');
      } else {
        setError(err.message || 'Network error. Please check your connection and try again.');
      }
    } finally {
      clearTimeout(timeoutId);
      setIsUploading(false);
    }
  };

  const handleStartOver = () => {
    setSelectedFile(null);
    setAnalysisResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file) => {
    if (file.type === 'application/pdf') {
      return <FileText className="w-8 h-8 text-red-500" />;
    }
    return <Image className="w-8 h-8 text-blue-500" />;
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20 sm:h-20">
            <div className="flex items-center space-x-2">
              <img 
                src="https://saharagroundwater.com/wp-content/uploads/2022/02/cropped-logo.png" 
                alt="Sahara Groundwater Logo"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg object-contain"
              />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Sahara Groundwater
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a href="https://saharagroundwater.com/" className="text-gray-700 hover:text-blue-600 transition-colors">
                Home
              </a>
              <a href="https://saharagroundwater.com/booking/" className="text-gray-700 hover:text-blue-600 transition-colors">
                Book Now
              </a>
              <a href="https://saharagroundwater.com/kerala-groundwater-survey-assistant/" className="text-gray-700 hover:text-blue-600 transition-colors">
                Contact
              </a>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>
              </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-gray-100"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            </div>
          </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-4 space-y-4">
              <a href="https://saharagroundwater.com/" className="block text-gray-700 hover:text-blue-600 transition-colors">Home</a>
              <a href="https://saharagroundwater.com/booking/" className="block text-gray-700 hover:text-blue-600 transition-colors">Book Now</a>
              <a href="https://saharagroundwater.com/kerala-groundwater-survey-assistant/" className="block text-gray-700 hover:text-blue-600 transition-colors">Contact</a>
            <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
            >
                <span>{isDarkMode ? '☀️' : '🌙'}</span>
                <span>Toggle Dark Mode</span>
            </button>
          </div>
              </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent animate-gradient">
                AI-Powered Groundwater
              </span>
              <br />
              <span className="text-gray-900 dark:text-white">Survey Analysis</span>
              </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Transform your groundwater survey reports into actionable insights with advanced AI analysis. 
              Get instant, professional assessments in seconds.
            </p>
            </div>
              
          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-4 mb-12">
            <div className="flex items-center space-x-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-4 py-2 rounded-full">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">Secure & Private</span>
              </div>
            <div className="flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-4 py-2 rounded-full">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-medium">Instant Results</span>
              </div>
            <div className="flex items-center space-x-2 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 px-4 py-2 rounded-full">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">AI-Powered</span>
              </div>
            </div>
          </div>
      </section>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Scroll observer script for animate-on-scroll */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            const options={threshold:0.1, rootMargin:'0px 0px -50px 0px'};
            const obs=new IntersectionObserver((entries)=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('animate-in');}})}, options);
            document.querySelectorAll('.animate-on-scroll').forEach(el=>obs.observe(el));
          })();
        `}} />
        {!analysisResult ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upload Section */}
            <div className="space-y-6">
          <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Upload Survey Report
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Drag and drop your file or click to browse
                </p>
          </div>

              <div
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
                  isDragOver
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-105'
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileInputChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                
                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                    <Upload className="w-8 h-8 text-white" />
              </div>
              
                  <div>
                    <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      {isDragOver ? 'Drop your file here' : 'Choose a file or drag it here'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Supports PDF, PNG, JPG up to 25MB (PDFs use Anthropic Claude AI for better extraction)
                    </p>
                    </div>
                </div>
              </div>
              {/* Download report link for users without a report - placed outside clickable input area */}
              <div className="mt-3 text-center">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Don't have a report? </span>
                <a
                  href="https://saharagroundwater.com/groundwater-survey-report/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-xs sm:text-sm text-blue-600 hover:text-blue-700 underline underline-offset-2"
                >
                  Download your report here
                </a>
              </div>
              
              {selectedFile && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-4">
                    {getFileIcon(selectedFile)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatFileSize(selectedFile.size)}
                      </p>
                </div>
                    <button
                      onClick={handleStartOver}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
              </div>
            </div>
          )}

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <p className="text-red-700 dark:text-red-400">{error}</p>
              </div>
            </div>
          )}
                  </div>
                  
            {/* Analysis Section */}
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Ready for Analysis
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Our AI will extract and analyze your survey data
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8 border border-blue-200 dark:border-blue-800">
            <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      AI Analysis Features
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700 dark:text-gray-300">Extract customer details</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700 dark:text-gray-300">Analyze survey coordinates</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700 dark:text-gray-300">Calculate water probability</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700 dark:text-gray-300">Generate recommendations</span>
                    </div>
                    </div>
                    
                  <button
                      onClick={handleAnalyze}
                    onMouseDown={createRipple}
                    disabled={!selectedFile || isUploading}
                    className="btn w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center space-x-2 touchable"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                      <Zap className="w-5 h-5" />
                        <span>Analyze Survey Report</span>
                      </>
                    )}
                  </button>
                </div>
                          </div>
                        </div>
                      </div>
                    ) : (
          /* Analysis Results */
          <div className="space-y-12 results-container bg-white">
            {/* Hero Success Section */}
            <div className="text-center relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-3xl blur-3xl opacity-50"></div>
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 via-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-pulse shadow-2xl">
                  <CheckCircle className="w-10 h-10 text-white animate-bounce" />
                </div>
                <div className="text-center mb-4">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Analysis Complete!
                  </h2>
                </div>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
                  Great news! We've successfully analyzed your groundwater survey. 
                  <span className="font-semibold text-blue-600 dark:text-blue-400"> Here's what we discovered about your land's water potential.</span>
                </p>
              </div>
            </div>

            {/* Main Water Potential Showcase */}
            <div className="analysis-card bg-white rounded-3xl p-8 md:p-12 border border-gray-200 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-50 to-purple-50 rounded-full blur-2xl"></div>
              
              <div className="relative">
                <div className="text-center mb-8">
                  <h3 className="heading-primary text-3xl md:text-4xl font-bold text-[#1A202C] mb-2">
                    <span className="inline-block mr-2 text-[#2563EB]">💧</span> Water Potential Analysis
                  </h3>
                  <p className="text-[#64748B] text-lg">Your land's groundwater prospects</p>
                </div>

                <div className="flex flex-col lg:flex-row items-center justify-center gap-12">
                  {/* Animated Circular Progress */}
                  <div className="relative">
                    <div className="w-48 h-48 relative">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="8"
                          className="text-gray-100"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="url(#waterGradient)"
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray={`${(parseInt(analysisResult.percentageChance) || 75) * 2.51} 251`}
                          className="transition-all duration-2000 ease-out"
                        />
                        <defs>
                          <linearGradient id="waterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#3B82F6" />
                            <stop offset="100%" stopColor="#8B5CF6" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <span className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            {analysisResult.percentageChance || '80%'}
                          </span>
                          <p className="text-sm font-medium text-[#64748B] mt-1">
                            Success Rate
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Water Quality Indicators */}
                  <div className="grid grid-cols-2 gap-6 w-full max-w-md">
                    <div className="metric-card bg-[#F8FAFC] rounded-2xl p-6 text-center border border-[#E2E8F0]">
                      <div className="w-10 h-10 mx-auto mb-3 rounded-full flex items-center justify-center" style={{background:'#FEE2E2'}}>
                        <span className="text-xl" style={{color:'#EF4444'}}>🎯</span>
                      </div>
                      <p className="font-semibold text-lg text-gray-900">
                        {analysisResult.chanceLevel || 'High'}
                      </p>
                      <p className="text-sm text-[#64748B]">Potential Rating</p>
                    </div>
                    <div className="metric-card bg-[#F8FAFC] rounded-2xl p-6 text-center border border-[#E2E8F0]">
                      <div className="w-10 h-10 mx-auto mb-3 rounded-full flex items-center justify-center" style={{background:'#FEF3C7'}}>
                        <span className="text-xl" style={{color:'#F59E0B'}}>⚡</span>
                      </div>
                      <p className="font-semibold text-lg text-gray-900">
                        {analysisResult.suggestedSourceType || 'Borewell'}
                      </p>
                      <p className="text-sm text-[#64748B]">Recommended Type</p>
                    </div>
                    <div className="metric-card bg-[#F8FAFC] rounded-2xl p-6 text-center border border-[#E2E8F0]">
                      <div className="w-10 h-10 mx-auto mb-3 rounded-full flex items-center justify-center bg-blue-100">
                        <span className="text-xl" style={{color:'#3B82F6'}}>📏</span>
                      </div>
                      <p className="font-semibold text-lg text-gray-900">
                        {analysisResult.maximumDepth || '40m'}
                      </p>
                      <p className="text-sm text-[#64748B]">Max Depth</p>
                    </div>
                    <div className="metric-card bg-[#F8FAFC] rounded-2xl p-6 text-center border border-[#E2E8F0]">
                      <div className="w-10 h-10 mx-auto mb-3 rounded-full flex items-center justify-center bg-blue-100">
                        <span className="text-xl" style={{color:'#3B82F6'}}>🗺️</span>
                      </div>
                      <p className="font-semibold text-lg text-gray-900">
                        Point {analysisResult.pointNumber || '5'}
                      </p>
                      <p className="text-sm text-[#64748B]">Survey Point</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer & Location Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Customer Profile Card */}
              <div className="rounded-3xl p-8 border border-gray-200 bg-white shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-400/20 to-blue-400/20 rounded-full blur-2xl"></div>
                <div className="relative">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center mr-4">
                      <span className="text-2xl">👤</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-[#1A202C]">
                        Customer Profile
                      </h3>
                      <p className="text-[#64748B] font-medium">Survey Report Details</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100">
                      <div className="flex items-center">
                        <span className="text-xl mr-3">🏷️</span>
                        <div>
                          <p className="text-sm font-medium text-[#64748B]">Customer Name</p>
                          <p className="font-bold text-[#1A202C] text-lg">
                            {analysisResult.customerName || 'Not specified'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100">
                      <div className="flex items-center">
                        <span className="text-xl mr-3">📍</span>
                        <div>
                          <p className="text-sm font-medium text-[#64748B]">Location</p>
                          <p className="font-bold text-[#1A202C] text-lg">
                            {analysisResult.location || 'Not specified'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100">
                      <div className="flex items-center">
                        <span className="text-xl mr-3">🗺️</span>
                        <div>
                          <p className="text-sm font-medium text-[#64748B]">District</p>
                          <p className="font-bold text-[#1A202C] text-lg">
                            {analysisResult.district || 'Kerala'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                  </div>
                  
              {/* Technical Survey Data */}
              <div className="rounded-3xl p-8 border border-gray-200 bg-white shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 rounded-full blur-2xl"></div>
                <div className="relative">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-2xl flex items-center justify-center mr-4">
                      <span className="text-2xl">🔬</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-[#1A202C]">
                        Technical Data
                      </h3>
                      <p className="text-[#64748B] font-medium">Survey Measurements</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100">
                      <div className="flex items-center">
                        <span className="text-xl mr-3">🎯</span>
                        <div>
                          <p className="text-sm font-medium text-[#64748B]">Survey Point</p>
                          <p className="font-bold text-[#1A202C] text-lg">
                            Point {analysisResult.pointNumber || '5'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100">
                      <div className="flex items-center">
                        <span className="text-xl mr-3">🪨</span>
                        <div>
                          <p className="text-sm font-medium text-[#64748B]">Rock Layer Depth</p>
                          <p className="font-bold text-[#1A202C] text-lg">
                            {analysisResult.rockDepth || '4 meter'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100">
                      <div className="flex items-center">
                        <span className="text-xl mr-3">⬇️</span>
                        <div>
                          <p className="text-sm font-medium text-[#64748B]">Maximum Drilling Depth</p>
                          <p className="font-bold text-[#1A202C] text-lg">
                            {analysisResult.maximumDepth || '40 meter'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Geological Story Section */}
            <div className="rounded-3xl p-8 md:p-12 border border-gray-200 bg-white shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-tl from-red-400/20 to-pink-400/20 rounded-full blur-2xl"></div>
              
              <div className="relative">
                <div className="flex items-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl flex items-center justify-center mr-6 shadow-2xl">
                    <span className="text-3xl">🌍</span>
                  </div>
                  <div>
                    <h3 className="text-3xl md:text-4xl font-bold text-[#1A202C] mb-2">
                      Geological Story
                    </h3>
                    <p className="text-[#64748B] text-lg font-medium">What lies beneath your land</p>
                  </div>
                    </div>
                    
                <div className="rounded-3xl p-8 border border-gray-100 bg-white">
                  <div className="prose prose-lg dark:prose-invert max-w-none">
                    <p className="text-[#1A202C] leading-relaxed text-lg font-medium">
                      {analysisResult.geologicalAnalysis || 'The geological analysis indicates the presence of a deep aquifer system with favorable hydrogeological conditions. The rock depth is within the recommended range, and the maximum depth suggests a high potential for groundwater extraction.'}
                    </p>
                  </div>
                  </div>
                </div>
              </div>

            {/* Expert Recommendations */}
            <div className="rounded-3xl p-8 md:p-12 border border-gray-200 bg-white shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-400/20 to-green-400/20 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-teal-400/20 to-cyan-400/20 rounded-full blur-2xl"></div>
              
              <div className="relative">
                <div className="flex items-center mb-8">
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mr-6 shadow-2xl ring-1 ring-white/40">
                    <span className="text-2xl md:text-3xl">💡</span>
                  </div>
                  <div>
                    <h3 className="text-3xl md:text-4xl font-bold text-[#1A202C] mb-2">
                      Expert Recommendations
                    </h3>
                    <p className="text-[#64748B] text-lg font-medium">Your next steps to success</p>
                  </div>
                </div>

                <div className="rounded-3xl p-8 border border-gray-100 bg-white">
                  <div className="prose prose-lg dark:prose-invert max-w-none">
                    <p className="text-[#1A202C] leading-relaxed text-lg font-medium mb-6">
                      {analysisResult.recommendations || 'Based on the survey findings, we recommend proceeding with a borewell at the identified location. The geological conditions are favorable, and the water potential is high. Consider implementing rainwater harvesting systems to enhance groundwater recharge.'}
                    </p>
                    
                    {/* Action Items */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                      <div className="bg-[#ECFDF5] rounded-2xl p-6 text-center border border-[#D1FAE5]">
                        <div className="text-3xl mb-3">🎯</div>
                        <h4 className="font-bold text-[#1A202C] mb-2">High Success Rate</h4>
                        <p className="text-sm text-[#64748B]">
                          {(parseInt(analysisResult.percentageChance) || 80) >= 70 ? 'Excellent prospects' : 'Good prospects'} for finding water
                        </p>
                      </div>
                      <div className="bg-[#DBEAFE] rounded-2xl p-6 text-center border border-[#BFDBFE]">
                        <div className="text-3xl mb-3">⚡</div>
                        <h4 className="font-bold text-[#1A202C] mb-2">Optimal Depth</h4>
                        <p className="text-sm text-[#64748B]">
                          Target depth: {analysisResult.maximumDepth || '40 meters'}
                        </p>
                      </div>
                      <div className="bg-[#F3E8FF] rounded-2xl p-6 text-center border border-[#E9D5FF]">
                        <div className="text-3xl mb-3">🛠️</div>
                        <h4 className="font-bold text-[#1A202C] mb-2">Recommended Method</h4>
                        <p className="text-sm text-[#64748B]">
                          {analysisResult.suggestedSourceType || 'Borewell'} installation
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Call-to-Action Section */}
            <div className="bg-white rounded-3xl p-8 md:p-12 border border-gray-200 shadow-lg text-center">
              <div className="mb-8">
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  🚀 Ready for the Next Step?
                </h3>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                  Your groundwater analysis is complete! Choose your next action to move forward with confidence.
                  </p>
                </div>

              <div className="flex flex-col lg:flex-row gap-6 justify-center max-w-4xl mx-auto">
                <button
                  onClick={handleStartOver}
                  onMouseDown={createRipple}
                  className="btn group bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700 font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center justify-center space-x-3 min-w-64 touchable"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-lg font-bold">Analyze Another Report</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Upload a new survey</div>
                  </div>
                </button>
                
                <a
                  href="https://saharagroundwater.com/groundwater-survey-report/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseDown={createRipple}
                  className="btn group bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 hover:from-emerald-700 hover:via-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center justify-center space-x-3 min-w-64 touchable"
                >
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all">
                    <Download className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-lg font-bold">Download Another Report</div>
                    <div className="text-sm text-white/80">Open Report Hub</div>
                  </div>
                </a>
              </div>

              {/* Contact CTA */}
              <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200">
                <p className="text-gray-700 font-medium mb-4">
                  Need expert consultation about your results?
                </p>
                <a 
                  href="tel:+917012051937"
                  onMouseDown={createRipple}
                  className="btn inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 touchable"
                >
                  <span>Talk to an Expert</span>
                  <span className="text-lg">📞</span>
                </a>
              </div>
            </div>
            </div>
          )}
      </main>
      
      {/* Footer */}
      <footer id="contact" className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <img
                  src="https://saharagroundwater.com/wp-content/uploads/2022/02/cropped-logo.png"
                  alt="Sahara Groundwater Logo"
                  className="w-8 h-8 rounded-lg object-contain"
                />
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Sahara Groundwater
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Professional groundwater survey analysis powered by advanced AI technology.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Links
              </h3>
              <ul className="space-y-2">
                <li>
                  <a href="https://saharagroundwater.com/" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Home</a>
                </li>
                <li>
                  <a href="https://saharagroundwater.com/booking/" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Book Now</a>
                </li>
                <li>
                  <a href="https://saharagroundwater.com/kerala-groundwater-survey-assistant/" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Contact</a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Contact Info
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-600 dark:text-gray-300">Kerala, India</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-blue-600" />
                  <a href="tel:+917012051937" className="text-gray-600 dark:text-gray-300 hover:text-blue-600">+91 70120 51937</a>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-600 dark:text-gray-300">info@saharagroundwater.com</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              © 2024 Sahara Groundwater Kerala. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
