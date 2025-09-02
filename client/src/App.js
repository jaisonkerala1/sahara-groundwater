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
    if (!selectedFile) return;
    
    setIsUploading(true);
    setError(null);
    
      const formData = new FormData();
    formData.append('surveyFile', selectedFile);

    try {
      const response = await fetch('/api/analyze-survey', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setAnalysisResult(data.surveyAnalysis);
      } else {
        setError(data.error || 'Analysis failed. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
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
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <img
                src="https://saharagroundwater.com/wp-content/uploads/2022/02/cropped-logo.png"
                alt="Sahara Groundwater Logo"
                className="w-8 h-8 rounded-lg object-contain"
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
                    disabled={!selectedFile || isUploading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
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
          <div className="space-y-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Analysis Complete!
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Your groundwater survey has been successfully analyzed
              </p>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Water Potential */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Water Potential
                  </h3>
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-white">
                      {analysisResult.percentageChance || '75%'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {analysisResult.chanceLevel || 'Good'} Rating
                  </p>
                </div>
                  </div>
                  
              {/* Customer Details */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Customer Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {analysisResult.customerName || 'Not specified'}
                    </p>
                  </div>
                    <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {analysisResult.location || 'Not specified'}
                      </p>
                    </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">District</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {analysisResult.district || 'Not specified'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Survey Details */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Survey Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Point Number</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {analysisResult.pointNumber || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Rock Depth</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {analysisResult.rockDepth || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Max Depth</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {analysisResult.maximumDepth || 'Not specified'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Analysis Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Analysis Summary
              </h3>
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {analysisResult.geologicalAnalysis || 'Detailed geological analysis will be provided here based on your survey data.'}
                  </p>
                </div>
            </div>

            {/* Recommendations */}
            <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-2xl p-8 border border-green-200 dark:border-green-800">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Recommendations
              </h3>
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {analysisResult.recommendations || 'Professional recommendations will be provided based on the analysis of your survey data.'}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleStartOver}
                className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold py-3 px-8 rounded-xl transition-colors flex items-center justify-center space-x-2"
              >
                <Upload className="w-5 h-5" />
                <span>Analyze Another Report</span>
              </button>
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2">
                <Download className="w-5 h-5" />
                <span>Download Report</span>
              </button>
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
                  <span className="text-gray-600 dark:text-gray-300">+91 123 456 7890</span>
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
