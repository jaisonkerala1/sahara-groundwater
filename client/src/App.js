import React, { useState, useRef, useCallback, useEffect } from 'react';
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
  const [user, setUser] = useState(null);
  const [subscriptionRequired, setSubscriptionRequired] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '', name: '' });
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

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Check for stored user info and fetch updated data
  useEffect(() => {
    // Check localStorage for existing user session
    const storedUser = localStorage.getItem('sahara_user');
    
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        
        // Fetch updated user access data from server
        if (userData.id) {
          checkUserAccess(userData.id).then(updatedAccess => {
            if (updatedAccess) {
              setUser({ ...userData, ...updatedAccess });
              // Update localStorage with fresh data
              localStorage.setItem('sahara_user', JSON.stringify({ ...userData, ...updatedAccess }));
            }
          }).catch(error => {
            console.error('Error fetching updated user data:', error);
          });
        }
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('sahara_user');
      }
    }
  }, []);

  // Check user access
  const checkUserAccess = async (userId) => {
    try {
      const response = await fetch(`/api/check-access/${userId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error checking user access:', error);
      return null;
    }
  };

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginForm.email,
          password: loginForm.password
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const userData = {
          id: data.user_id,
          email: data.email,
          name: data.name,
          subscription_status: data.subscription_status || '',
          analysis_count: data.analysis_count || 0,
          daily_limit: data.daily_limit || 1
        };
        setUser(userData);
        localStorage.setItem('sahara_user', JSON.stringify(userData));
        setShowLoginForm(false);
        setError(null);
      } else {
        setError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      setError('Login failed. Please try again.');
    }
  };

  // Handle registration
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginForm.email,
          password: loginForm.password,
          name: loginForm.name || loginForm.email.split('@')[0]
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const userData = {
          id: data.user_id,
          email: data.email,
          name: data.name,
          subscription_status: data.subscription_status || '',
          analysis_count: data.analysis_count || 0,
          daily_limit: data.daily_limit || 1
        };
        setUser(userData);
        localStorage.setItem('sahara_user', JSON.stringify(userData));
        setShowLoginForm(false);
        setError(null);
      } else {
        setError(data.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      setError('Registration failed. Please try again.');
    }
  };

  // Initiate Razorpay payment
  const initiateRazorpayPayment = () => {
    const options = {
      key: 'rzp_test_IuM7Ua6b27o2Vl', // Your Razorpay test key
      amount: subscriptionData?.price * 100, // Amount in paise
      currency: subscriptionData?.currency || 'INR',
      name: 'Sahara Groundwater',
      description: 'Monthly Subscription - Unlimited Analysis',
      image: '/logo.png',
      order_id: '', // This should come from your backend
      handler: function (response) {
        verifyPayment(response);
      },
      prefill: {
        name: user?.name || '',
        email: user?.email || '',
        contact: user?.phone || ''
      },
      theme: {
        color: '#3B82F6'
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  // Verify payment
  const verifyPayment = async (paymentResponse) => {
    try {
      // Send payment verification to local API
      const response = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          payment_id: paymentResponse.razorpay_payment_id,
          order_id: paymentResponse.razorpay_order_id,
          signature: paymentResponse.razorpay_signature
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Update user subscription status
        const updatedAccess = await checkUserAccess(user.id);
        setUser({ ...user, ...updatedAccess });
        setSubscriptionRequired(false);
        setError(null);
        alert('Subscription activated successfully! You now have unlimited access.');
      } else {
        setError(data.message || 'Payment verification failed. Please contact support.');
      }
    } catch (error) {
      setError('Payment verification failed. Please contact support.');
    }
  };

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

  // Dynamically load pdf.js (CDN) when needed
  const loadPdfJs = async () => {
    if (window.pdfjsLib) return window.pdfjsLib;
    await new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      s.onload = resolve;
      s.onerror = reject;
      document.body.appendChild(s);
    });
    // Worker (required by pdf.js)
    if (!window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }
    return window.pdfjsLib;
  };

  // Extract selectable text from a text-based PDF
  const extractTextFromPdf = async (file) => {
    try {
      const pdfjsLib = await loadPdfJs();
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i += 1) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const strings = content.items.map((it) => (typeof it.str === 'string' ? it.str : ''));
        fullText += strings.join(' ') + '\n';
      }
      return fullText.trim();
    } catch (err) {
      console.error('PDF text extraction failed', err);
      return '';
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile || isUploading) return;
    
    // Check if user is logged in
    if (!user) {
      setShowLoginForm(true);
      return;
    }
    
    setIsUploading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('surveyFile', selectedFile);
    formData.append('user_id', user.id);

    // If it's a PDF, extract text client-side (only for text-based PDFs)
    if (selectedFile.type === 'application/pdf') {
      try {
        const text = await extractTextFromPdf(selectedFile);
        if (text && text.length > 50) {
          formData.append('extractedText', text);
        }
      } catch {}
    }

    // Add a hard timeout so the UI doesn't hang forever
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s

    try {
      const response = await fetch('/api/analyze-survey', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      // Parse JSON if possible; otherwise surface raw text to help diagnose
      let data;
      let rawText;
      try {
        rawText = await response.text();
        try {
          data = JSON.parse(rawText);
        } catch (jsonErr) {
          throw new Error(rawText?.slice(0, 500) || 'Invalid server response');
        }
      } catch (e) {
        throw new Error(e?.message || 'Invalid server response');
      }

      if (response.ok && data && data.success) {
        setAnalysisResult(data.surveyAnalysis);
        // Update user access data after successful analysis
        const updatedAccess = await checkUserAccess(user.id);
        if (updatedAccess) {
          setUser({ ...user, ...updatedAccess });
        }
      } else {
        if (data.subscription_required) {
          setSubscriptionRequired(true);
          setSubscriptionData({
            price: data.price,
            currency: data.currency,
            reason: data.reason
          });
        } else {
          setError((data && data.error) || `Analysis failed (status ${response.status}). Please try again.`);
        }
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

  // Chatbot functionality
  useEffect(() => {
    // Session bootstrap (unique per browser)
    const KEY = "sahara_sid";
    function genId() {
      return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c/4).toString(16)
      );
    }
    let sid = localStorage.getItem(KEY);
    if (!sid) { 
      sid = genId(); 
      localStorage.setItem(KEY, sid); 
    }
    window.__SAHARA_SID__ = sid;

    // Chatbot initialization
    const webhookUrl = "https://console.opendream.in/webhook/5354ef92-537c-41be-b207-d810d2920c8c";
    const toggle = document.getElementById("chat-toggle");
    const windowBox = document.getElementById("chat-window");
    const inputContainer = document.getElementById("input-container");
    const userInput = document.getElementById("user-input");
    const sendButton = document.getElementById("send-button");

    if (toggle && windowBox && inputContainer && userInput && sendButton) {
      // Toggle chat window (Simple and Perfect)
      toggle.onclick = () => {
        const isHidden = windowBox.style.display === "none";
        if (isHidden) {
          // Show chat window
          windowBox.style.display = "flex";
          userInput.focus();
          const notificationDot = toggle.querySelector('div');
          if (notificationDot) notificationDot.style.display = 'none';
          isChatMinimized = false;
          
          // Update button appearance
          toggle.style.transform = 'scale(1)';
          toggle.style.boxShadow = '0 4px 20px rgba(128, 88, 248, 0.4)';
        } else {
          // Hide chat window (minimize to button)
          windowBox.style.display = "none";
          isChatMinimized = true;
          
          // Update button appearance when minimized
          toggle.style.transform = 'scale(0.95)';
          toggle.style.boxShadow = '0 2px 10px rgba(128, 88, 248, 0.6)';
        }
      };

      // Enable/disable send button based on input
      userInput.addEventListener('input', function() {
        if (this.value.trim()) {
          sendButton.style.opacity = '1';
          sendButton.style.pointerEvents = 'auto';
        } else {
          sendButton.style.opacity = '0.3';
          sendButton.style.pointerEvents = 'none';
        }
      });

      // Focus styles
      userInput.onfocus = () => {
        inputContainer.style.borderColor = "#8058F8";
        inputContainer.style.boxShadow = "0 0 0 3px rgba(128, 88, 248, 0.1)";
      };
      userInput.onblur = () => {
        inputContainer.style.borderColor = "#E5E7EB";
        inputContainer.style.boxShadow = "0 1px 2px rgba(0, 0, 0, 0.05)";
      };

      // Chat state management
      let isChatMinimized = false;
      
      // Simple drag variables for chat window only
      let isDragging = false;
      let startX, startY, initialX = 0, initialY = 0;

      const dragStart = (e) => {
        // Only allow dragging from the header
        const header = windowBox.querySelector('.chat-header');
        if (!header || !header.contains(e.target)) return;

        isDragging = true;
        windowBox.classList.add('dragging');

        if (e.type === "touchstart") {
          startX = e.touches[0].clientX;
          startY = e.touches[0].clientY;
        } else {
          startX = e.clientX;
          startY = e.clientY;
        }

        e.preventDefault();
        e.stopPropagation();
      };

      const dragEnd = (e) => {
        if (isDragging) {
          isDragging = false;
          windowBox.classList.remove('dragging');
        }
      };

      const drag = (e) => {
        if (!isDragging) return;
        
        e.preventDefault();
        e.stopPropagation();

        let currentX, currentY;
        
        if (e.type === "touchmove") {
          currentX = e.touches[0].clientX;
          currentY = e.touches[0].clientY;
        } else {
          currentX = e.clientX;
          currentY = e.clientY;
        }

        const deltaX = currentX - startX;
        const deltaY = currentY - startY;

        initialX += deltaX;
        initialY += deltaY;

        // Constrain to viewport
        const maxX = window.innerWidth - windowBox.offsetWidth;
        const maxY = window.innerHeight - windowBox.offsetHeight;
        
        initialX = Math.min(Math.max(0, initialX), maxX);
        initialY = Math.min(Math.max(0, initialY), maxY);

        windowBox.style.transform = `translate(${initialX}px, ${initialY}px)`;

        startX = currentX;
        startY = currentY;
      };

      // Add drag listeners to header only
      const header = windowBox.querySelector('.chat-header');
      if (header) {
        header.addEventListener("mousedown", dragStart, { passive: false });
        header.addEventListener("touchstart", dragStart, { passive: false });
      }
      
      document.addEventListener("mouseup", dragEnd);
      document.addEventListener("touchend", dragEnd);
      document.addEventListener("mousemove", drag, { passive: false });
      document.addEventListener("touchmove", drag, { passive: false });
      
      // No button drag - just simple click functionality
    }
  }, []);

  // Append message function
  const appendMessage = (sender, message, isUser = false) => {
    const chat = document.getElementById("chat-messages");
    const welcomeMsg = document.getElementById("welcome-message");
    if (welcomeMsg) welcomeMsg.style.display = "none";

    const msg = document.createElement("div");
    msg.className = isUser ? "user-message" : "bot-message";
    msg.innerHTML = message;
    chat.appendChild(msg);
    chat.scrollTop = chat.scrollHeight;
  };

  // Typing indicator
  const showTypingIndicator = () => {
    const chat = document.getElementById("chat-messages");
    const typing = document.createElement("div");
    typing.className = "typing-indicator";
    typing.id = "typing-indicator";
    typing.innerHTML = '<span></span><span></span><span></span>';
    chat.appendChild(typing);
    chat.scrollTop = chat.scrollHeight;
  };

  const removeTypingIndicator = () => {
    const typing = document.getElementById("typing-indicator");
    if (typing) typing.remove();
  };

  // Send message function
  const sendMessage = async () => {
    const input = document.getElementById("user-input");
    const userMsg = input.value.trim();
    if (!userMsg) return;

    appendMessage("You", userMsg, true);
    input.value = "";
    const sendButton = document.getElementById("send-button");
    sendButton.style.opacity = '0.3';
    sendButton.style.pointerEvents = 'none';
    showTypingIndicator();

    try {
      const webhookUrl = "https://console.opendream.in/webhook/5354ef92-537c-41be-b207-d810d2920c8c";
      const sid = window.__SAHARA_SID__;
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-session-id": sid },
        body: JSON.stringify({ message: userMsg, sessionId: sid })
      });

      const newSid = res.headers.get("x-session-id");
      if (newSid && newSid !== sid) { 
        localStorage.setItem("sahara_sid", newSid); 
        window.__SAHARA_SID__ = newSid; 
      }

      const data = await res.json().catch(() => ({}));
      const reply = data.response || "I'm here to help with bookings, pricing, timelines, and report downloads. How can I assist?";
      removeTypingIndicator();
      appendMessage("Sahara Groundwater", reply, false);
    } catch (e) {
      removeTypingIndicator();
      appendMessage("Sahara Groundwater", "Sorry, I'm having connection issues. Please try again, or email contact@saharagroundwater.com.", false);
    }
  };

  // Quick message helper
  const quickMessage = (message) => {
    const userInput = document.getElementById("user-input");
    const sendButton = document.getElementById("send-button");
    userInput.value = message;
    sendButton.style.opacity = '1';
    sendButton.style.pointerEvents = 'auto';
    sendMessage();
  };

  // Make functions globally available
  window.sendMessage = sendMessage;
  window.quickMessage = quickMessage;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
      {/* Login Modal */}
      {showLoginForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {isRegistering ? 'Create Account' : 'Welcome Back'}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {isRegistering ? 'Join Sahara Groundwater for AI-powered analysis' : 'Sign in to continue'}
                  </p>
                </div>
                <button 
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                  onClick={() => {
                    setShowLoginForm(false);
                    setIsRegistering(false);
                    setLoginForm({ email: '', password: '', name: '' });
                  }}
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Form */}
            <div className="px-6 py-6">
              <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-5">
                {isRegistering && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={loginForm.name}
                      onChange={(e) => setLoginForm({...loginForm, name: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter your password"
                    required
                    minLength={6}
                  />
                  {isRegistering && (
                    <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters</p>
                  )}
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all font-semibold shadow-lg"
                >
                  {isRegistering ? 'Create Account' : 'Sign In'}
                </button>
              </form>

              {/* Toggle between login/register */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  {isRegistering ? (
                    <>Already have an account? <button type="button" onClick={() => setIsRegistering(false)} className="text-blue-600 hover:text-blue-700 font-semibold">Sign in here</button></>
                  ) : (
                    <>Don't have an account? <button type="button" onClick={() => setIsRegistering(true)} className="text-blue-600 hover:text-blue-700 font-semibold">Create one here</button></>
                  )}
                </p>
              </div>

              {/* Benefits for new users */}
              {isRegistering && (
                <div className="mt-6 bg-blue-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-blue-900 mb-2">What you get:</h3>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li className="flex items-center">
                      <span className="text-blue-600 mr-2">✓</span>
                      Save your analysis history
                    </li>
                    <li className="flex items-center">
                      <span className="text-blue-600 mr-2">✓</span>
                      Access to premium features
                    </li>
                    <li className="flex items-center">
                      <span className="text-blue-600 mr-2">✓</span>
                      Priority support
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Subscription Modal */}
      {subscriptionRequired && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Subscription Required</h2>
              <button 
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setSubscriptionRequired(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-gray-600">{subscriptionData?.reason}</p>
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2">Monthly Subscription</h3>
                <div className="text-2xl font-bold text-blue-600 mb-3">₹{subscriptionData?.price}/month</div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Unlimited analysis</li>
                  <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Priority support</li>
                  <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Advanced features</li>
                </ul>
                <button 
                  className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={initiateRazorpayPayment}
                >
                  Subscribe Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20 sm:h-20">
            <a href="https://saharagroundwater.com/" className="flex items-center space-x-2">
              <img 
                src="https://saharagroundwater.com/wp-content/uploads/2022/02/cropped-logo.png" 
                alt="Sahara Groundwater Kerala - Professional groundwater survey analysis and borewell drilling services"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg object-contain"
                width="40"
                height="40"
                loading="eager"
              />
              <span className="text-xl font-bold text-gray-900">
                Sahara Groundwater
              </span>
            </a>

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
              {/* User Status */}
              {user ? (
                <div className="flex items-center space-x-2">
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">
                      {user.subscription_status === 'active' ? 'Premium User' : 'Free User'}
                    </div>
                    <div className="text-gray-500">
                      {user.subscription_status === 'active' 
                        ? 'Unlimited analysis' 
                        : `${user.analysis_count || 0}/${user.daily_limit || 1} today`
                      }
                    </div>
                  </div>
                  <button
                    onClick={() => setUser(null)}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowLoginForm(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Login
                </button>
              )}

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
              
              {/* Mobile User Section */}
              <div className="border-t border-gray-200 pt-4">
                {user ? (
                  <div className="space-y-3">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-sm">
                            {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 text-sm">
                            {user.name || user.email.split('@')[0]}
                          </div>
                          <div className="text-xs text-gray-500">
                            {user.subscription_status === 'active' ? 'Premium User' : 'Free User'}
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-gray-600">
                        {user.subscription_status === 'active' 
                          ? 'Unlimited analysis' 
                          : `${user.analysis_count || 0}/${user.daily_limit || 1} analysis today`
                        }
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setUser(null);
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        setShowLoginForm(true);
                        setIsMenuOpen(false);
                      }}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Login / Sign Up
                    </button>
                    <div className="text-xs text-gray-500 text-center">
                      Create an account to save your analysis history
                    </div>
                  </div>
                )}
              </div>
              
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors w-full"
              >
                <span>{isDarkMode ? '☀️' : '🌙'}</span>
                <span>Toggle Dark Mode</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8" itemScope itemType="https://schema.org/Service">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent animate-gradient block mb-2">
                AI-Powered Groundwater
              </span>
              <span className="text-gray-900 dark:text-white block">Survey Analysis</span>
              </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed" itemProp="description">
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16" role="main" aria-label="Groundwater Survey Analysis Tool">
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
                      Supports PDF, PNG, JPG up to 25MB. Analyzes survey reports and PQWT contour maps for drilling point detection.
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

            {/* PQWT Drilling Points Section - Only show if PQWT map detected */}
            {analysisResult.isPQWTMap && analysisResult.drillingPoints && analysisResult.drillingPoints.length > 0 && (
              <div className="rounded-3xl p-8 border border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-2xl"></div>
                <div className="relative">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mr-4">
                      <span className="text-2xl">🎯</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-[#1A202C]">
                        PQWT Drilling Points
                      </h3>
                      <p className="text-[#64748B] font-medium">AI-Identified Optimal X-Axis Locations</p>
                    </div>
                  </div>

                  {/* X-Axis Analysis Summary */}
                  {analysisResult.xAxisAnalysis && (
                    <div className="mb-6 p-4 bg-white rounded-2xl border border-blue-100">
                      <h4 className="text-lg font-bold text-[#1A202C] mb-3 flex items-center">
                        <span className="text-xl mr-2">📊</span>
                        X-Axis Analysis Summary
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-3 bg-green-50 rounded-xl border border-green-200">
                          <p className="text-sm font-medium text-green-800 mb-1">Optimal Points</p>
                          <p className="font-bold text-green-900">{analysisResult.xAxisAnalysis.optimalPoints}</p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                          <p className="text-sm font-medium text-blue-800 mb-1">Available Points</p>
                          <p className="font-bold text-blue-900">{analysisResult.xAxisAnalysis.availablePoints}</p>
                        </div>
                        <div className="p-3 bg-red-50 rounded-xl border border-red-200">
                          <p className="text-sm font-medium text-red-800 mb-1">Avoid Points</p>
                          <p className="font-bold text-red-900">{analysisResult.xAxisAnalysis.avoidPoints || 'None'}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-3 italic">
                        Analysis Method: {analysisResult.xAxisAnalysis.analysisMethod}
                      </p>
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    {analysisResult.drillingPoints.map((point, index) => (
                      <div key={index} className={`p-4 bg-white rounded-2xl border-2 ${
                        point.priority === 'Primary' ? 'border-green-300 bg-green-50' : 
                        point.priority === 'Secondary' ? 'border-yellow-300 bg-yellow-50' : 
                        'border-gray-200'
                      }`}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <span className="text-2xl mr-3">📍</span>
                            <div>
                              <p className="text-sm font-medium text-[#64748B]">
                                {point.priority === 'Primary' ? '⭐ PRIMARY' : 
                                 point.priority === 'Secondary' ? '🔸 SECONDARY' : 
                                 '📍 ALTERNATIVE'} Drilling Point {index + 1}
                              </p>
                              <p className="font-bold text-[#1A202C] text-xl">
                                X-Axis: {point.x} | Depth: {point.y}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                              point.confidence === 'High' ? 'bg-green-100 text-green-800' :
                              point.confidence === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {point.confidence} Confidence
                            </div>
                            {point.priority && (
                              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                point.priority === 'Primary' ? 'bg-green-200 text-green-900' :
                                point.priority === 'Secondary' ? 'bg-yellow-200 text-yellow-900' :
                                'bg-gray-200 text-gray-700'
                              }`}>
                                {point.priority}
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-blue-600 font-medium bg-blue-50 p-2 rounded-lg">
                          💡 {point.reason}
                        </p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 p-4 bg-blue-100 rounded-2xl">
                    <p className="text-sm text-blue-800 font-medium">
                      💡 <strong>Enhanced PQWT Analysis:</strong> The AI has analyzed the contour map's color intensity patterns across all X-axis coordinates. 
                      Dark blue zones indicate the highest water potential, while the analysis prioritizes X-axis points with the largest, darkest blue areas for maximum drilling success probability.
                    </p>
                  </div>
                </div>
              </div>
            )}

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
      
      {/* Sahara Groundwater AI Chatbot */}
      <div id="sahara-chatbot" style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 2147483647,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }}>
        {/* Accessible SEO text (screen-reader only, keeps UI clean) */}
        <div className="sr-only" aria-hidden="false">
          <h2>Sahara Groundwater – Groundwater Survey & Borewell Detection in Kerala</h2>
          <p>Chatbot to help with booking groundwater survey, borewell site selection, openwell assessment, pricing, refund policy, and report downloads. Booking link: https://saharagroundwater.com/booking</p>
        </div>

        {/* Chat Toggle Button with Pulse Animation */}
        <div id="chat-toggle" aria-label="Open Sahara Groundwater chat" title="Chat with Sahara Groundwater" style={{
          background: 'linear-gradient(135deg, #8058F8 0%, #3E1F64 100%)',
          color: 'white',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(128, 88, 248, 0.4)',
          transition: 'all 0.3s ease',
          position: 'relative',
          animation: 'pulse 2s infinite',
          padding: '12px'
        }} onMouseOver={(e) => e.target.style.transform = 'scale(1.1)'} onMouseOut={(e) => e.target.style.transform = 'scale(1)'}>
          <img src="https://saharagroundwater.com/wp-content/uploads/2025/08/illpxmckwd.png" 
               alt="Chat with Sahara Groundwater" 
               style={{width: '100%', height: '100%', objectFit: 'contain', filter: 'brightness(0) invert(1)'}}
               aria-hidden="true" />
          <div style={{position: 'absolute', top: '5px', right: '5px', width: '12px', height: '12px', background: '#FF4757', borderRadius: '50%', border: '2px solid white'}}></div>
        </div>

        {/* Chat Window */}
        <div id="chat-window" role="dialog" aria-label="Sahara Groundwater chat window" style={{
          display: 'none',
          width: '380px',
          height: '600px',
          background: '#FAFBFD',
          borderRadius: '20px',
          boxShadow: '0 10px 40px rgba(62, 31, 100, 0.15)',
          marginBottom: '15px',
          overflow: 'hidden',
          flexDirection: 'column',
          animation: 'slideUp 0.3s ease',
          position: 'fixed',
          bottom: '80px',
          right: '20px',
          zIndex: 2147483646,
          transition: 'transform 0.1s ease-out',
          userSelect: 'none'
        }}>
          {/* Header */}
          <div className="chat-header" style={{
            background: 'linear-gradient(135deg, #8058F8 0%, #3E1F64 100%)',
            color: 'white',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 10px rgba(128, 88, 248, 0.2)',
            cursor: 'move',
            userSelect: 'none',
            position: 'relative'
          }}>
            {/* Drag indicator */}
            <div style={{
              position: 'absolute',
              top: '8px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '30px',
              height: '4px',
              background: 'rgba(255, 255, 255, 0.3)',
              borderRadius: '2px'
            }}></div>
            <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
              <div style={{width: '40px', height: '40px', background: 'white', borderRadius: '50%', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <img src="https://saharagroundwater.com/wp-content/uploads/2022/02/cropped-logo.png" style={{width: '100%', height: '100%', objectFit: 'contain'}} alt="Sahara Groundwater logo" />
              </div>
              <div>
                <div style={{fontWeight: '600', fontSize: '16px'}}>Sahara Ai Assistant</div>
                <div style={{fontSize: '12px', opacity: '0.9', display: 'flex', alignItems: 'center', gap: '4px'}}>
                  <span style={{width: '8px', height: '8px', background: '#4ADE80', borderRadius: '50%', display: 'inline-block'}} aria-hidden="true"></span>
                  Online now
                </div>
              </div>
            </div>
            <div style={{display: 'flex', gap: '8px'}}>
              {/* Minimize button */}
              <button aria-label="Minimize chat" onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const windowBox = document.getElementById('chat-window');
                const toggle = document.getElementById('chat-toggle');
                if (windowBox && toggle) {
                  windowBox.style.display = 'none';
                  toggle.style.transform = 'scale(0.95)';
                  toggle.style.boxShadow = '0 2px 10px rgba(128, 88, 248, 0.6)';
                }
              }} style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                padding: '4px',
                transition: 'opacity 0.2s'
              }} onMouseOver={(e) => e.target.style.opacity = '0.7'} onMouseOut={(e) => e.target.style.opacity = '1'}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
              
              {/* Close button */}
              <button aria-label="Close chat" onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const windowBox = document.getElementById('chat-window');
                const toggle = document.getElementById('chat-toggle');
                if (windowBox && toggle) {
                  windowBox.style.display = 'none';
                  toggle.style.transform = 'scale(1)';
                  toggle.style.boxShadow = '0 4px 20px rgba(128, 88, 248, 0.4)';
                }
              }} style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                padding: '4px',
                transition: 'opacity 0.2s'
              }} onMouseOver={(e) => e.target.style.opacity = '0.7'} onMouseOut={(e) => e.target.style.opacity = '1'}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>

          {/* Welcome Message */}
          <div id="welcome-message" style={{
            background: 'linear-gradient(135deg, rgba(128, 88, 248, 0.1) 0%, rgba(62, 31, 100, 0.05) 100%)',
            padding: '15px',
            margin: '10px',
            borderRadius: '12px',
            borderLeft: '3px solid #8058F8'
          }}>
            <div style={{fontWeight: '600', color: '#332357', marginBottom: '5px'}}>Welcome to Sahara Groundwater! 💧</div>
            <div style={{color: '#666', fontSize: '14px'}}>
              Kerala's trusted <strong>groundwater survey</strong> team for <strong>borewell</strong> & <strong>openwell</strong> detection.
              Ask about pricing, booking steps, timelines, or download your report.
            </div>
          </div>

          {/* Chat Messages */}
          <div id="chat-messages" style={{flex: 1, padding: '15px', overflowY: 'auto', scrollBehavior: 'smooth'}}></div>

          {/* Quick Actions */}
          <div style={{padding: '10px 15px', display: 'flex', gap: '8px', overflowX: 'auto', borderTop: '1px solid rgba(128, 88, 248, 0.1)'}}>
            <button onClick={() => quickMessage('I want to book a groundwater survey')} style={{background: 'white', border: '1px solid #8058F8', color: '#8058F8', padding: '8px 12px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s'}} onMouseOver={(e) => {e.target.style.background = '#8058F8'; e.target.style.color = 'white'}} onMouseOut={(e) => {e.target.style.background = 'white'; e.target.style.color = '#8058F8'}}>🗓️ Booking</button>
            <button onClick={() => quickMessage('What is the price of your survey?')} style={{background: 'white', border: '1px solid #8058F8', color: '#8058F8', padding: '8px 12px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s'}} onMouseOver={(e) => {e.target.style.background = '#8058F8'; e.target.style.color = 'white'}} onMouseOut={(e) => {e.target.style.background = 'white'; e.target.style.color = '#8058F8'}}>💰 Pricing</button>
            <button onClick={() => quickMessage('Download my report')} style={{background: 'white', border: '1px solid #8058F8', color: '#8058F8', padding: '8px 12px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s'}} onMouseOver={(e) => {e.target.style.background = '#8058F8'; e.target.style.color = 'white'}} onMouseOut={(e) => {e.target.style.background = 'white'; e.target.style.color = '#8058F8'}}>⬇️ Download Report</button>
          </div>

          {/* Input */}
          <div style={{padding: '12px 15px 15px 15px', background: 'white', borderTop: '1px solid #E5E7EB'}}>
            <div id="input-container" style={{display: 'flex', alignItems: 'center', background: '#FFFFFF', border: '1.5px solid #E5E7EB', borderRadius: '24px', padding: '2px', transition: 'all 0.2s ease', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'}}>
              <input id="user-input" type="text" placeholder="Message Sahara Groundwater..." aria-label="Message input" style={{flex: 1, padding: '11px 12px', border: 'none', background: 'transparent', outline: 'none', fontSize: '15px', color: '#1F2937', fontWeight: '400', letterSpacing: '0.01em'}} onKeyPress={(e) => {if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }}} />
              <button id="send-button" aria-label="Send message" onClick={sendMessage} style={{background: '#8058F8', border: 'none', color: 'white', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '3px', transition: 'all 0.2s ease', opacity: '0.3', pointerEvents: 'none'}}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"></path></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer id="contact" className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <a href="https://saharagroundwater.com/" className="flex items-center space-x-2 mb-4">
                <img
                  src="https://saharagroundwater.com/wp-content/uploads/2022/02/cropped-logo.png"
                  alt="Sahara Groundwater Logo"
                  className="w-8 h-8 rounded-lg object-contain"
                />
                <span className="text-xl font-bold text-gray-900">
                  Sahara Groundwater
                </span>
              </a>
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
                  <span className="text-gray-600 dark:text-gray-300">contact@saharagroundwater.com</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              © 2025 Sahara Groundwater Kerala. All rights reserved. | 
              <span className="ml-2">Professional groundwater survey analysis and borewell drilling services in Kerala</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
