import React, { useState } from 'react';
import { 
  Droplets, 
  Gauge, 
  MapPin, 
  AlertTriangle, 
  TrendingUp, 
  Globe,
  CheckCircle,
  Download,
  Share2,
  Star,
  Target,
  Info,
  Award,
  Layers
} from 'lucide-react';

function GroundwaterAnalysis({ analysis }) {
  const [showAdvancedInfo, setShowAdvancedInfo] = useState(false);
  const [selectedTab, setSelectedTab] = useState('survey');

  const {
    // Customer Details
    customerName,
    bookingId,
    bookingDate,
    surveyDate,
    phoneNumber,
    district,
    location,
    
    // Geophysical Survey Results
    pointNumber,
    rockDepth,
    maximumDepth,
    percentageChance,
    chanceLevel,
    suggestedSourceType,
    latitude,
    longitude,
    
    // Summary
    geologicalAnalysis,
    resistivityFindings,
    waterZoneAssessment,
    recommendations,
    validityPeriod,
    
    // Technical Details
    surveyMethod,
    equipmentUsed,
    soilProfile,
    porosity,
    permeabilityFactors,
    
    // Legacy fields (fallback)
    surveyLocation,
    probabilityOfWater,
    suggestedDrillingDepth,
    geologicalInterpretation,
    waterQualityPrediction,
    recommendedWellType,
    warnings,
    estimatedYield,
    costEstimate,
    surveyConfidenceLevel
  } = analysis;

  const getWellTypeIcon = (type) => {
    if (type?.toLowerCase().includes('borewell')) {
      return <Gauge className="w-5 h-5 text-chart-blue" />;
    }
    return <Droplets className="w-5 h-5 text-primary-brand" />;
  };

  const getWellTypeColor = (type) => {
    if (type?.toLowerCase().includes('borewell')) {
      return 'text-chart-blue';
    }
    return 'text-primary-brand';
  };

  // Calculate water potential score using professional format
  const calculateWaterScore = () => {
    const probability = parseInt(percentageChance || probabilityOfWater) || 70; // Default to 70%
    const level = chanceLevel || 'Good'; // Default to Good instead of Medium
    
    // Use professional level if available, otherwise calculate from percentage
    if (level === 'High' || probability >= 75) return { score: probability, grade: level || 'High', color: 'text-status-success' };
    if (level === 'Good' || level === 'Medium' || probability >= 50) return { score: probability, grade: level || 'Good', color: 'text-primary-purple' };
    if (level === 'Low' || probability >= 25) return { score: probability, grade: level || 'Low', color: 'text-secondary-warning' };
    return { score: probability, grade: 'Very Low', color: 'text-status-error' };
  };

  const waterScore = calculateWaterScore();

  const renderRecommendations = () => {
    if (!recommendations) return 'No specific recommendations available';
    
    if (Array.isArray(recommendations)) {
      return (
        <ul className="space-y-2">
          {recommendations.map((recommendation, index) => (
            <li key={index} className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-status-success mt-0.5 flex-shrink-0" />
              <span className="text-body2 text-neutral-gray700">{recommendation}</span>
            </li>
          ))}
        </ul>
      );
    }
    
    return recommendations;
  };

  const renderWarnings = () => {
    if (!warnings) return 'No warnings identified';
    
    if (Array.isArray(warnings)) {
      return (
        <ul className="space-y-2">
          {warnings.map((warning, index) => (
            <li key={index} className="flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-secondary-warning mt-0.5 flex-shrink-0" />
              <span className="text-body2 text-neutral-gray700">{warning}</span>
            </li>
          ))}
        </ul>
      );
    }
    
    return warnings;
  };

  const exportData = () => {
    const dataStr = JSON.stringify(analysis, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${surveyLocation || 'groundwater'}-survey-analysis.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const shareAnalysis = () => {
    if (navigator.share) {
      navigator.share({
        title: `Groundwater Survey: ${surveyLocation}`,
        text: `Water Probability: ${probabilityOfWater}% - Drilling Depth: ${suggestedDrillingDepth}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(`Groundwater Survey: ${surveyLocation} - Water Probability: ${probabilityOfWater}%`);
      alert('Survey analysis copied to clipboard!');
    }
  };

  const tabs = [
    { id: 'customer', name: 'Customer Details', icon: Info },
    { id: 'survey', name: 'Survey Results', icon: Layers },
    { id: 'technical', name: 'Technical Analysis', icon: Gauge },
    { id: 'recommendations', name: 'Summary & Recommendations', icon: TrendingUp },
    { id: 'export', name: 'Export Report', icon: Download }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Professional Header */}
      <div className="purple-gradient-bg rounded-3xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Droplets className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-h2 text-white">{location || district || customerName || surveyLocation || 'Groundwater Survey Analysis'}</h2>
              <div className="flex items-center space-x-4 opacity-90">
                <span className="text-body2">👤 {customerName || 'Professional Survey'}</span>
                <span className="text-body2">📞 {phoneNumber || 'Contact Available'}</span>
                <span className="text-body2">🆔 {bookingId || 'Survey ID Available'}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{waterScore.grade}</div>
            <div className="text-body2 opacity-90">Water Potential</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-3xl shadow-xl p-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-2xl">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl transition-all ${
                  selectedTab === tab.id
                    ? 'bg-white text-primary-purple shadow-lg'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-body2 font-medium">{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      {selectedTab === 'customer' && (
        <div className="space-y-6">
          {/* Customer Information */}
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Info className="w-6 h-6 text-primary-purple mr-2" />
              Customer Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Customer Name</label>
                  <p className="text-lg font-semibold text-gray-900">{customerName || 'Professional Customer'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone Number</label>
                  <p className="text-lg text-gray-900">{phoneNumber || '+91 XXXXXXXXXX'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">District</label>
                  <p className="text-lg text-gray-900">{district || 'Kerala District'}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Booking ID</label>
                  <p className="text-lg font-mono text-primary-purple font-semibold">{bookingId || 'XXXXXXXXX'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Survey Date</label>
                  <p className="text-lg text-gray-900">{surveyDate || bookingDate || new Date().toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Location</label>
                  <p className="text-lg text-gray-900">{location || 'Kerala Location'}</p>
                </div>
              </div>
            </div>
            
            {validityPeriod && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <p className="text-sm text-yellow-800">
                  <strong>Validity Period:</strong> {validityPeriod}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {selectedTab === 'survey' && (
        <div className="space-y-6">
          {/* Water Potential Score Card */}
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-h3 text-neutral-gray900">Water Potential Assessment</h3>
              <Award className="w-6 h-6 text-primary-purple" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className={`text-4xl font-bold ${waterScore.color}`}>
                  {waterScore.score}%
                </div>
                <div className="text-caption text-neutral-gray500">Probability</div>
              </div>
              <div className="text-center">
                <div className={`text-4xl font-bold ${waterScore.color}`}>
                  {waterScore.grade}
                </div>
                <div className="text-caption text-neutral-gray500">Rating</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto relative">
                  <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#E5E7EB"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke={waterScore.color === 'text-status-success' ? '#10B981' : 
                              waterScore.color === 'text-primary-brand' ? '#7ED321' :
                              waterScore.color === 'text-secondary-warning' ? '#F59E0B' : '#EF4444'}
                      strokeWidth="3"
                      strokeDasharray={`${waterScore.score}, 100`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-sm font-bold ${waterScore.color}`}>
                      {waterScore.score}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Drilling Depth */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-primary-purple bg-opacity-20 rounded-full flex items-center justify-center">
                  <Target className="w-5 h-5 text-primary-purple" />
                </div>
                <div>
                  <h3 className="text-metric text-neutral-gray900">Drilling Depth</h3>
                  <p className="text-caption text-neutral-gray500">Recommended</p>
                </div>
              </div>
              <div className="text-number text-neutral-gray900">
                {suggestedDrillingDepth || 'TBD'}
              </div>
            </div>

            {/* Estimated Yield */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Droplets className="w-5 h-5 text-status-success" />
                </div>
                <div>
                  <h3 className="text-metric text-neutral-gray900">Water Yield</h3>
                  <p className="text-caption text-neutral-gray500">Estimated</p>
                </div>
              </div>
              <div className="text-number text-neutral-gray900">
                {estimatedYield || 'TBD'}
              </div>
            </div>
          </div>

          {/* Survey Confidence */}
          {surveyConfidenceLevel && (
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h3 className="text-h3 text-neutral-gray900 mb-4">Survey Confidence</h3>
              <div className="flex items-center space-x-4">
                <div className="flex-1 bg-neutral-gray200 rounded-full h-3">
                  <div 
                    className="bg-primary-purple h-3 rounded-full transition-all duration-800"
                    style={{ width: `${surveyConfidenceLevel || 0}%` }}
                  ></div>
                </div>
                <span className="text-body1 font-semibold text-neutral-gray900">
                  {surveyConfidenceLevel}%
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {selectedTab === 'geological' && (
        <div className="space-y-6">
          {/* Geological Interpretation */}
          {geologicalInterpretation && (
            <div className="card-primary">
              <h3 className="text-h3 text-neutral-gray900 mb-4">Geological Interpretation</h3>
              <div className="text-body1 text-neutral-gray700">
                {geologicalInterpretation}
              </div>
            </div>
          )}

          {/* Water Quality Prediction */}
          {waterQualityPrediction && (
            <div className="card-primary">
              <h3 className="text-h3 text-neutral-gray900 mb-4">Water Quality Prediction</h3>
              <div className="text-body1 text-neutral-gray700">
                {waterQualityPrediction}
              </div>
            </div>
          )}

          {/* Cost Estimate */}
          {costEstimate && (
            <div className="card-primary">
              <div className="flex items-center space-x-2 mb-4">
                <Globe className="w-5 h-5 text-chart-green" />
                <h3 className="text-h3 text-neutral-gray900">Cost Estimate</h3>
              </div>
              <div className="text-body1 text-neutral-gray700">
                {costEstimate}
              </div>
            </div>
          )}
        </div>
      )}

      {selectedTab === 'recommendations' && (
        <div className="space-y-6">
          {/* Warnings */}
          {warnings && (
            <div className="card-primary">
              <div className="flex items-center space-x-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-secondary-warning" />
                <h3 className="text-h3 text-neutral-gray900">Warnings & Precautions</h3>
              </div>
              <div className="text-body1 text-neutral-gray700">
                {renderWarnings()}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {recommendations && (
            <div className="card-primary">
              <div className="flex items-center space-x-2 mb-4">
                <TrendingUp className="w-5 h-5 text-chart-green" />
                <h3 className="text-h3 text-neutral-gray900">Professional Recommendations</h3>
              </div>
              <div className="text-body1 text-neutral-gray700">
                {renderRecommendations()}
              </div>
            </div>
          )}

          {/* Well Type Recommendation */}
          <div className="card-primary">
            <div className="flex items-center space-x-2 mb-4">
              <Gauge className="w-5 h-5 text-chart-blue" />
              <h3 className="text-h3 text-neutral-gray900">Recommended Well Type</h3>
            </div>
            <div className="text-body1 text-neutral-gray700">
              {recommendedWellType || 'To be determined based on further analysis'}
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'export' && (
        <div className="space-y-6">
          {/* Export Options */}
          <div className="card-primary">
            <h3 className="text-h3 text-neutral-gray900 mb-4">Export & Share Survey</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={exportData}
                className="flex items-center justify-center space-x-2 p-4 border-2 border-neutral-gray200 rounded-lg hover:border-blue-600 transition-colors"
              >
                <Download className="w-6 h-6 text-blue-600" />
                <span className="text-body1 font-medium text-neutral-gray900">Export Report</span>
              </button>
              
              <button
                onClick={shareAnalysis}
                className="flex items-center justify-center space-x-2 p-4 border-2 border-neutral-gray200 rounded-lg hover:border-blue-600 transition-colors"
              >
                <Share2 className="w-6 h-6 text-blue-600" />
                <span className="text-body1 font-medium text-neutral-gray900">Share Results</span>
              </button>
            </div>
          </div>

          {/* Survey Summary */}
          <div className="card-primary">
            <h3 className="text-h3 text-neutral-gray900 mb-4">Survey Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-body2 text-neutral-gray600">Survey Date</span>
                <span className="text-body2 font-medium text-neutral-gray900">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-body2 text-neutral-gray600">Analysis Method</span>
                <span className="text-body2 font-medium text-neutral-gray900">AI-Enhanced Geological Analysis</span>
              </div>
              <div className="flex justify-between">
                <span className="text-body2 text-neutral-gray600">Confidence Level</span>
                <span className="text-body2 font-medium text-status-success">{surveyConfidenceLevel || 'High'}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-body2 text-neutral-gray600">Location</span>
                <span className="text-body2 font-medium text-neutral-gray900">{surveyLocation || 'Not specified'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      <div className="progress-card text-center">
        <CheckCircle className="w-16 h-16 text-white mx-auto mb-4" />
        <h3 className="text-h3 text-white mb-2">Survey Analysis Complete!</h3>
        <p className="text-body1 text-white opacity-90">
          Your groundwater survey has been analyzed using advanced AI technology and geological expertise. 
          Use these insights to make informed decisions about borewell drilling and water resource development.
        </p>
      </div>
    </div>
  );
}

export default GroundwaterAnalysis;
