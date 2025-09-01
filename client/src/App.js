import React, { useState } from 'react';
import SurveyUpload from './components/SurveyUpload';
import GroundwaterAnalysis from './components/GroundwaterAnalysis';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import Footer from './components/Footer';
import { BarChart3, Clock, Target, TrendingUp, Award, Users, Zap } from 'lucide-react';

function App() {
  const [selectedSurveyFile, setSelectedSurveyFile] = useState(null);
  const [surveyAnalysis, setSurveyAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [surveyHistory, setSurveyHistory] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);

  const handleSurveyFileSelect = (file) => {
    setSelectedSurveyFile(file);
    setSurveyAnalysis(null);
    setError(null);
  };

  const handleAnalysisComplete = (result) => {
    setSurveyAnalysis(result);
    setIsLoading(false);
    setError(null);
    
    // Add to history
    const newSurveyAnalysis = {
      ...result,
      id: Date.now(),
      timestamp: new Date().toISOString(),
      surveyFile: selectedSurveyFile
    };
    setSurveyHistory(prev => [newSurveyAnalysis, ...prev.slice(0, 9)]); // Keep last 10
  };

  const handleError = (errorMessage) => {
    setError(errorMessage);
    setIsLoading(false);
  };

  const handleAnalyze = async () => {
    if (!selectedSurveyFile) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('surveyFile', selectedSurveyFile);

      const response = await fetch('/api/analyze-survey', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze survey report');
      }

      const result = await response.json();
      handleAnalysisComplete(result.surveyAnalysis);
    } catch (err) {
      handleError(err.message || 'Could not analyze this survey report');
    }
  };

  const resetApp = () => {
    setSelectedSurveyFile(null);
    setSurveyAnalysis(null);
    setError(null);
  };

  const getDashboardStats = () => {
    const totalSurveys = surveyHistory.length;
    const todaySurveys = surveyHistory.filter(item => {
      const today = new Date().toDateString();
      const itemDate = new Date(item.timestamp).toDateString();
      return today === itemDate;
    }).length;
    
    const avgWaterProbability = totalSurveys > 0 
      ? Math.round(surveyHistory.reduce((sum, item) => sum + (parseInt(item.percentageChance || item.probabilityOfWater) || 70), 0) / totalSurveys)
      : 75; // Default to 75% for good results

    return { totalSurveys, todaySurveys, avgWaterProbability };
  };

  const stats = getDashboardStats();

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="py-8">
        <div className="container mx-auto px-6 max-w-6xl space-y-8">
          
          {/* Simple Header like Food App */}
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center space-x-4">
              <img 
                src="https://saharagroundwater.com/wp-content/uploads/2025/08/illpxmckwd.png" 
                alt="Sahara Groundwater Kerala Logo" 
                className="h-16 w-auto"
                onError={(e) => {
                  // Fallback to icon if logo fails to load
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              {/* Fallback icon */}
              <div className="w-16 h-16 bg-gradient-to-br from-primary-purple to-primary-purpleDark rounded-full items-center justify-center hidden">
                <Zap className="w-8 h-8 text-secondary-yellow" />
              </div>
              <h1 className="text-5xl font-bold text-gray-900">
                Sahara Groundwater Kerala
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Professional groundwater survey and borewell analysis services. 
              Get expert insights on water availability, drilling recommendations, and geological 
              conditions with AI-powered survey report analysis.
            </p>
            
            {/* Professional Badges */}
            <div className="flex justify-center items-center space-x-4 mt-6">
              <div className="flex items-center space-x-2 px-4 py-2 bg-primary-purple bg-opacity-10 rounded-full">
                <Award className="w-5 h-5 text-primary-purple" />
                <span className="text-sm font-medium text-primary-purple">Kerala Certified</span>
              </div>
              <div className="flex items-center space-x-2 px-4 py-2 bg-secondary-red bg-opacity-10 rounded-full">
                <Users className="w-5 h-5 text-secondary-red" />
                <span className="text-sm font-medium text-secondary-red">15+ Years Experience</span>
              </div>
              <div className="flex items-center space-x-2 px-4 py-2 bg-secondary-yellow bg-opacity-20 rounded-full">
                <TrendingUp className="w-5 h-5 text-secondary-yellowDark" />
                <span className="text-sm font-medium text-secondary-yellowDark">AI-Enhanced</span>
              </div>
            </div>
          </div>

          {/* Dashboard Toggle */}
          <div className="text-center">
            <button
              onClick={() => setShowDashboard(!showDashboard)}
              className="bg-white border-2 border-primary-purple text-primary-purple hover:bg-primary-purple hover:text-white font-semibold py-3 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 mx-auto"
            >
              <BarChart3 className="w-5 h-5" />
              <span>{showDashboard ? 'Hide Dashboard' : 'Show Survey Dashboard'}</span>
            </button>
          </div>

          {/* Professional Dashboard */}
          {showDashboard && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-3xl shadow-xl p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-purple to-primary-purpleDark rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stats.totalSurveys}</div>
                <div className="text-gray-600">Total Surveys</div>
              </div>
              
              <div className="bg-white rounded-3xl shadow-xl p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-secondary-red to-secondary-redDark rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stats.todaySurveys}</div>
                <div className="text-gray-600">Today's Surveys</div>
              </div>
              
              <div className="bg-white rounded-3xl shadow-xl p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-secondary-yellow to-secondary-yellowDark rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stats.avgWaterProbability}%</div>
                <div className="text-gray-600">Avg Water Probability</div>
              </div>
            </div>
          )}

          {/* Survey History */}
          {showDashboard && surveyHistory.length > 0 && (
            <div className="card-primary">
              <h3 className="text-h3 text-neutral-gray900 mb-4">Recent Surveys</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {surveyHistory.slice(0, 6).map((item) => (
                  <div key={item.id} className="p-3 bg-neutral-gray50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-body2 font-medium text-neutral-gray900 truncate">
                        {item.surveyLocation || 'Survey Location'}
                      </span>
                      <span className="text-caption text-neutral-gray500">
                        {new Date(item.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-body2 text-neutral-gray700">
                      {item.probabilityOfWater || 'N/A'}% Water Probability
                    </div>
                    <div className="text-caption text-neutral-gray500">
                      {item.recommendedWellType || 'Well type not specified'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Survey File Upload Section */}
          {!selectedSurveyFile && (
            <SurveyUpload onSurveyFileSelect={handleSurveyFileSelect} />
          )}

          {/* Survey File Preview and Analysis */}
          {selectedSurveyFile && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Selected Survey File</h2>
                  <button
                    onClick={resetApp}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-xl transition-all duration-200"
                  >
                    Choose Different File
                  </button>
                </div>
                
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    {selectedSurveyFile.type === 'application/pdf' ? (
                      <div className="w-full h-64 bg-gray-100 rounded-2xl flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <div className="text-2xl">📄</div>
                          </div>
                          <div className="text-lg font-medium text-gray-900">PDF Survey Report</div>
                          <div className="text-sm text-gray-500 mt-1">{selectedSurveyFile.name}</div>
                        </div>
                      </div>
                    ) : (
                      <img
                        src={URL.createObjectURL(selectedSurveyFile)}
                        alt="Survey report or groundwater reading"
                        className="w-full h-64 object-cover rounded-2xl"
                      />
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        Ready for Groundwater Analysis
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        Our AI-powered system will analyze your survey report to provide 
                        water probability assessment, drilling recommendations, and geological insights.
                      </p>
                    </div>
                    
                    <button
                      onClick={handleAnalyze}
                      disabled={isLoading}
                      className="w-full bg-primary-purple hover:bg-primary-purpleDark disabled:bg-gray-300 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      <Zap className="w-5 h-5" />
                      <span>{isLoading ? 'Analyzing Survey...' : 'Analyze Survey Report'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="bg-white rounded-3xl shadow-xl p-12 text-center border border-gray-100">
                  <LoadingSpinner />
                  <p className="text-lg text-gray-700 mt-6 font-medium">
                    Analyzing groundwater survey report...
                  </p>
                  <p className="text-gray-500 mt-2">
                    Processing geological data and water probability assessment
                  </p>
                </div>
              )}

              {/* Error State */}
              {error && (
                <ErrorMessage 
                  message={error} 
                  onRetry={handleAnalyze}
                  onReset={resetApp}
                />
              )}

              {/* Survey Analysis Results */}
              {surveyAnalysis && (
                <GroundwaterAnalysis analysis={surveyAnalysis} />
              )}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export default App;
