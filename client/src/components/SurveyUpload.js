import React, { useState, useRef } from 'react';
import { Upload, Camera, X, FileText, Zap, MapPin, TrendingUp } from 'lucide-react';

function SurveyUpload({ onSurveyFileSelect }) {
  const [dragActive, setDragActive] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState(null);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (file) => {
    if (file.type.startsWith('image/') || file.type === 'application/pdf') {
      setPreviewFile(file);
      onSurveyFileSelect(file);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      setShowCamera(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0);
      
      canvas.toBlob((blob) => {
        const file = new File([blob], 'survey-photo.jpg', { type: 'image/jpeg' });
        handleFile(file);
        stopCamera();
      });
    }
  };

  const removeFile = () => {
    setPreviewFile(null);
    onSurveyFileSelect(null);
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <img 
            src="https://saharagroundwater.com/wp-content/uploads/2022/02/cropped-logo.png"
            alt="Sahara Groundwater Kerala"
            className="w-16 h-16 object-contain rounded-2xl"
          />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Upload Survey Report</h2>
        <p className="text-gray-600">Upload PDF reports, images, or field data for AI analysis</p>
      </div>

      {!showCamera ? (
        <>
          {/* Upload Area */}
          <div 
            className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
              dragActive 
                ? 'border-primary-purple bg-primary-purple bg-opacity-5' 
                : 'border-gray-300 hover:border-primary-purple hover:bg-gray-50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {previewFile ? (
              /* File Preview */
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  {previewFile.type === 'application/pdf' ? (
                    <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center">
                      <FileText className="w-10 h-10 text-red-600" />
                    </div>
                  ) : (
                    <img 
                      src={URL.createObjectURL(previewFile)} 
                      alt="Preview" 
                      className="w-32 h-32 object-cover rounded-2xl"
                    />
                  )}
                </div>
                
                <div className="text-center">
                  <p className="font-medium text-gray-900">{previewFile.name}</p>
                  <p className="text-sm text-gray-500">{(previewFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>

                <button 
                  onClick={removeFile}
                  className="mx-auto flex items-center space-x-2 text-red-600 hover:text-red-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>Remove File</span>
                </button>
              </div>
            ) : (
              /* Upload Interface */
              <div className="space-y-6">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
                    <Upload className="w-8 h-8 text-gray-400" />
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Drop your survey files here
                  </h3>
                  <p className="text-gray-500 mb-4">
                    or click to browse from your device
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button 
                    onClick={openFileDialog}
                    className="bg-primary-purple hover:bg-primary-purpleDark text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
                  >
                    <Upload className="w-5 h-5" />
                    <span>Choose Files</span>
                  </button>

                  <button 
                    onClick={startCamera}
                    className="border-2 border-primary-purple text-primary-purple hover:bg-primary-purple hover:text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-300 flex items-center space-x-2"
                  >
                    <Camera className="w-5 h-5" />
                    <span>Take Photo</span>
                  </button>
                </div>

                <p className="text-sm text-gray-400">
                  Supports: PDF, JPG, PNG up to 25MB
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              multiple={false}
              onChange={handleFileInput}
              accept="image/*,.pdf"
              className="hidden"
            />
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-secondary-yellow bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-secondary-yellow" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">AI Analysis</h4>
              <p className="text-sm text-gray-600">Advanced AI processes your survey data for accurate water detection</p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-primary-purple bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <MapPin className="w-6 h-6 text-primary-purple" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Location Mapping</h4>
              <p className="text-sm text-gray-600">Precise geological mapping specific to Kerala's terrain</p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-secondary-red bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-secondary-red" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Success Rate</h4>
              <p className="text-sm text-gray-600">95% success rate in water discovery across Kerala</p>
            </div>
          </div>
        </>
      ) : (
        /* Camera Interface */
        <div className="space-y-6">
          <div className="relative">
            <video 
              ref={videoRef}
              autoPlay 
              playsInline 
              className="w-full rounded-2xl"
            />
          </div>

          <div className="flex justify-center space-x-4">
            <button 
              onClick={capturePhoto}
              className="book-now-button flex items-center space-x-2"
            >
              <Camera className="w-5 h-5" />
              <span>Capture Photo</span>
            </button>

            <button 
              onClick={stopCamera}
              className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-3 px-6 rounded-2xl transition-all duration-300 flex items-center space-x-2"
            >
              <X className="w-5 h-5" />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SurveyUpload;