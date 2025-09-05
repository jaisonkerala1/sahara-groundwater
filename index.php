<?php
// Sahara Groundwater Kerala - PHP Backend

// Get the request URI
$requestUri = $_SERVER['REQUEST_URI'];
$path = parse_url($requestUri, PHP_URL_PATH);

// Only set JSON headers for API requests
if (strpos($path, '/api/') === 0) {
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');

    // Handle preflight requests
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }
}

// Load environment variables
$envFile = __DIR__ . '/.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
            list($key, $value) = explode('=', $line, 2);
            $_ENV[trim($key)] = trim($value);
        }
    }
}

// Simple in-memory user storage (replace with database in production)
$users = [];
$userAccess = [];

// User registration function
function register_user($email, $password, $name) {
    global $users, $userAccess;
    
    // Check if user already exists
    foreach ($users as $user) {
        if ($user['email'] === $email) {
            return ['success' => false, 'message' => 'User already exists with this email'];
        }
    }
    
    // Create new user
    $newUser = [
        'id' => count($users) + 1,
        'email' => $email,
        'name' => $name ?: explode('@', $email)[0],
        'password' => $password, // In production, hash this password
        'createdAt' => date('c')
    ];
    
    $users[] = $newUser;
    $userAccess[$newUser['id']] = [
        'subscription_status' => '',
        'analysis_count' => 0,
        'daily_limit' => 1
    ];
    
    return [
        'success' => true,
        'user_id' => $newUser['id'],
        'email' => $newUser['email'],
        'name' => $newUser['name'],
        'subscription_status' => '',
        'analysis_count' => 0,
        'daily_limit' => 1
    ];
}

// User login function
function login_user($email, $password) {
    global $users, $userAccess;
    
    // Find user
    foreach ($users as $user) {
        if ($user['email'] === $email && $user['password'] === $password) {
            $access = $userAccess[$user['id']] ?? [
                'subscription_status' => '',
                'analysis_count' => 0,
                'daily_limit' => 1
            ];
            
            return [
                'success' => true,
                'user_id' => $user['id'],
                'email' => $user['email'],
                'name' => $user['name'],
                'subscription_status' => $access['subscription_status'],
                'analysis_count' => $access['analysis_count'],
                'daily_limit' => $access['daily_limit']
            ];
        }
    }
    
    return ['success' => false, 'message' => 'Invalid email or password'];
}

// Check user access function
function check_user_access($userId) {
    global $users, $userAccess;
    
    $userId = intval($userId);
    
    // Check if user exists
    $userExists = false;
    foreach ($users as $user) {
        if ($user['id'] === $userId) {
            $userExists = true;
            break;
        }
    }
    
    if (!$userExists) {
        return ['success' => false, 'message' => 'User not found'];
    }
    
    $access = $userAccess[$userId] ?? [
        'subscription_status' => '',
        'analysis_count' => 0,
        'daily_limit' => 1
    ];
    
    return [
        'success' => true,
        'subscription_status' => $access['subscription_status'],
        'analysis_count' => $access['analysis_count'],
        'daily_limit' => $access['daily_limit']
    ];
}

function track_analysis_usage($user_id) {
    $wp_api_url = 'https://saharagroundwater.com/wp-json/sahara/v1/track-analysis';
    
    $post_data = http_build_query(['user_id' => $user_id]);
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $wp_api_url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $post_data);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    return $http_code === 200;
}

// API endpoint for survey analysis
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $path === '/api/analyze-survey') {
    try {
        // Check if user is authenticated
        $user_id = $_POST['user_id'] ?? null;
        
        if (!$user_id) {
            http_response_code(401);
            echo json_encode(['error' => 'User not authenticated. Please login first.']);
            exit();
        }
        
        // Check subscription or daily limit
        $access_data = check_wordpress_user_access($user_id);
        
        if (!$access_data || !$access_data['has_access']) {
            http_response_code(403);
            echo json_encode([
                'error' => 'Daily limit reached. Subscribe for unlimited access.',
                'subscription_required' => true,
                'price' => $access_data['monthly_price'] ?? 100,
                'currency' => 'INR',
                'reason' => $access_data['reason'] ?? 'Access denied'
            ]);
            exit();
        }
        
        // Check if file was uploaded
        if (!isset($_FILES['surveyFile']) || $_FILES['surveyFile']['error'] !== UPLOAD_ERR_OK) {
            http_response_code(400);
            echo json_encode(['error' => 'No survey file provided']);
            exit();
        }

        $file = $_FILES['surveyFile'];
        
        // Check file type
        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
        if (!in_array($file['type'], $allowedTypes)) {
            http_response_code(400);
            echo json_encode(['error' => 'Only image files and PDFs are allowed!']);
            exit();
        }

        // Check file size (25MB limit)
        if ($file['size'] > 25 * 1024 * 1024) {
            http_response_code(400);
            echo json_encode(['error' => 'File too large. Maximum size is 25MB.']);
            exit();
        }

        // Check for API key
        if (empty($_ENV['OPENROUTER_API_KEY'])) {
            http_response_code(500);
            echo json_encode(['error' => 'OpenRouter API key not configured']);
            exit();
        }

        // Log file details
        error_log('📁 File Upload Details: ' . json_encode([
            'originalName' => $file['name'],
            'mimeType' => $file['type'],
            'size' => round($file['size'] / 1024 / 1024, 2) . ' MB',
            'isAnalyzingActualContent' => strpos($file['type'], 'image/') === 0 ? 'YES - Using Vision AI' : 'NO - Generating Kerala Data'
        ]));

        // Prepare OpenRouter request
        $openRouterRequest = [];
        
        // If client provided extracted text (from pdf.js), analyze text directly
        $clientExtractedText = isset($_POST['extractedText']) ? trim($_POST['extractedText']) : '';
        if ($file['type'] === 'application/pdf' && strlen($clientExtractedText) > 50) {
            error_log('📝 Received extractedText from client; analyzing text directly.');
            $openRouterRequest = [
                'model' => 'anthropic/claude-3-haiku',
                'messages' => [[
                    'role' => 'user',
                    'content' => 'You are given raw text from a Sahara Groundwater Kerala SURVEY REPORT PDF. Extract ONLY values explicitly present. If a field is missing, return "Not specified". Return ONLY JSON with keys: customerName, bookingId, bookingDate, surveyDate, phoneNumber, district, location, pointNumber, rockDepth, maximumDepth, percentageChance, chanceLevel, suggestedSourceType, latitude, longitude, geologicalAnalysis, recommendations.\n\nTEXT:\n' . $clientExtractedText
                ]],
                'max_tokens' => 1500,
                'temperature' => 0
            ];
        } elseif ($file['type'] === 'application/pdf') {
            error_log('📄 Processing PDF via OpenRouter using pdf_urls (hosted temporary file)');

            // Ensure uploads directory
            $uploadsDir = __DIR__ . '/uploads';
            if (!is_dir($uploadsDir)) {
                @mkdir($uploadsDir, 0755, true);
            }
            $safeName = 'report_' . uniqid() . '.pdf';
            $destPath = $uploadsDir . '/' . $safeName;
            if (!move_uploaded_file($file['tmp_name'], $destPath)) {
                // fallback: copy
                copy($file['tmp_name'], $destPath);
            }
            $uploadedPath = $destPath; // remember for cleanup

            // Build public URL
            $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
            $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
            $publicUrl = $scheme . '://' . $host . '/uploads/' . $safeName;
            error_log('🔗 Uploaded PDF available at: ' . $publicUrl);

            $callWithEngine = function(string $engine) use ($publicUrl) {
                $payload = [
                    'model' => 'anthropic/claude-3-haiku',
                    'pdf_engine' => $engine,
                    'pdf_urls' => [$publicUrl],
                    'messages' => [[
                        'role' => 'user',
                        'content' => 'Analyze the attached Sahara Groundwater Kerala SURVEY REPORT PDF (see pdf_urls). Extract ONLY visible values. Missing fields => "Not specified". Return ONLY JSON with keys: customerName, bookingId, bookingDate, surveyDate, phoneNumber, district, location, pointNumber, rockDepth, maximumDepth, percentageChance, chanceLevel, suggestedSourceType, latitude, longitude, geologicalAnalysis, recommendations.'
                    ]],
                    'max_tokens' => 1500,
                    'temperature' => 0
                ];

                $ch = curl_init('https://openrouter.ai/api/v1/chat/completions');
                curl_setopt($ch, CURLOPT_POST, true);
                curl_setopt($ch, CURLOPT_HTTPHEADER, [
                    'Authorization: Bearer ' . $_ENV['OPENROUTER_API_KEY'],
                    'Content-Type: application/json',
                    'HTTP-Referer: https://report.saharagroundwater.com',
                    'X-Title: Sahara Groundwater Kerala Survey App'
                ]);
                curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_TIMEOUT, 90);
                $resp = curl_exec($ch);
                $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                if ($resp === false) { $err = curl_error($ch); }
                curl_close($ch);
                return [$code, $resp ?? '', $err ?? null];
            };

            [$httpCode, $response, $curlErr] = $callWithEngine('pdf-text');
            if ($httpCode !== 200 || !$response) {
                error_log('pdf-text via url failed (status ' . $httpCode . '; err=' . ($curlErr ?? 'none') . '), trying mistral-ocr');
                [$httpCode, $response, $curlErr] = $callWithEngine('mistral-ocr');
            }

            if ($httpCode !== 200) {
                if (isset($uploadedPath) && file_exists($uploadedPath)) { @unlink($uploadedPath); }
                http_response_code(500);
                echo json_encode([
                    'error' => 'Failed to analyze PDF via OpenRouter',
                    'status' => $httpCode,
                    'details' => $response,
                    'curlError' => $curlErr
                ]);
                exit();
            }

            $aiResponse = json_decode($response, true);
            $analysisText = $aiResponse['choices'][0]['message']['content'] ?? '';

            if (empty($analysisText)) {
                if (isset($uploadedPath) && file_exists($uploadedPath)) { @unlink($uploadedPath); }
                http_response_code(500);
                echo json_encode(['error' => 'Empty analysis from OpenRouter']);
                exit();
            }

            // Use common JSON parsing flow below
            // Cleanup uploaded file now that analysis is complete
            if (isset($uploadedPath) && file_exists($uploadedPath)) { @unlink($uploadedPath); }

            $response = json_encode(['choices' => [['message' => ['content' => $analysisText]]]]);
            $httpCode = 200;
            $openRouterRequest = null;
            $skipDirectCall = true;
        } else {
            // For images, use vision analysis
            error_log('🖼️ Processing image file - ACTUALLY ANALYZING image content with AI vision');
            
            // Check image file size (10MB limit for images)
            if ($file['size'] > 10 * 1024 * 1024) {
                http_response_code(400);
                echo json_encode(['error' => 'Image file too large. Please use files smaller than 10MB.']);
                exit();
            }

            // Convert image to base64
            $imageData = base64_encode(file_get_contents($file['tmp_name']));
            
            // Instruct the model to reject non-Sahara images by returning a flag
            $openRouterRequest = [
                'model' => $_ENV['OPENROUTER_MODEL'] ?? 'openai/gpt-4o',
                'messages' => [
                    [
                        'role' => 'user',
                        'content' => [
                            [
                                'type' => 'text',
                                'text' => 'You are analyzing an uploaded image. This could be either a Sahara Groundwater Kerala SURVEY REPORT screenshot/photo OR a PQWT (Proton Precession Magnetometer) contour map for groundwater detection from any provider. 

IMPORTANT: Be VERY LENIENT with PQWT map detection. If you see ANY scientific/geological map with colors, coordinates, or contour lines, treat it as a PQWT map. Only reject if it is clearly not a survey report or geological map.

If it is neither a survey report nor a PQWT map, respond ONLY with this JSON: {"notSaharaReport": true}. 

IF THIS IS A PQWT CONTOUR MAP:
Look for ANY of these characteristics:
- Grid-based map with color gradients (blue to red/orange/yellow)
- Contour lines or color zones
- X-axis and Y-axis with numerical labels
- Color legend or scale
- Blue areas (indicating high water potential)
- Depth measurements (negative numbers like -30, -60, -90, etc.)
- Survey point coordinates (1, 2, 3, 4, etc.)
- Any geophysical survey data visualization

Even if it does not have all these features, if it looks like a scientific/geological map with colors and coordinates, treat it as a PQWT map. 

SIMPLE ANALYSIS:
1. Find the LARGEST, DARKEST blue area on the map
2. Check if this blue area has a clear structure (V-shaped, triangle, or round shape)
3. If blue color AND clear structure are both present, select the X-axis point at the center of that structure
4. Find the center of that blue area horizontally (X-axis position)
5. Select that X-axis position as the drilling point
6. Dark blue = best water potential, light blue = good, yellow/red = avoid

For PQWT maps, return this JSON format:
{
  "isPQWTMap": true,
  "customerName": "Not specified",
  "bookingId": "Not specified", 
  "bookingDate": "Not specified",
  "surveyDate": "Not specified",
  "phoneNumber": "Not specified",
  "district": "Kerala",
  "location": "Survey Location",
  "pointNumber": "[X-coordinate of BEST blue zone]",
  "rockDepth": "[Y-coordinate/depth of best blue zone]",
  "maximumDepth": "[deepest blue zone depth]",
  "percentageChance": "[estimate based on blue zone analysis: 85-95% for dark blue, 70-85% for light blue, 50-70% for yellow]",
  "chanceLevel": "[High for dark blue zones, Medium for light blue zones]",
  "suggestedSourceType": "Borewell",
  "latitude": "Not specified",
  "longitude": "Not specified",
  "geologicalAnalysis": "PQWT contour analysis shows optimal drilling zones. Dark blue regions indicate highest water potential with favorable hydrogeological conditions. Analysis prioritized X-axis coordinates with largest, darkest blue zones for maximum success probability.",
  "recommendations": "PRIMARY DRILLING POINTS: X-coordinates [list top 2-3 X-axis points] show optimal blue zones. SECONDARY OPTIONS: X-coordinates [list 2-3 more] show good potential. AVOID: X-coordinates [list any with red/orange dominance]. Focus drilling on coordinates with largest, darkest blue areas for highest water yield.",
  "drillingPoints": [
    {
      "x": "[X-coordinate of BEST point]",
      "y": "[Y-coordinate/depth of best point]", 
      "confidence": "High",
      "reason": "Largest, darkest blue zone indicating highest water potential",
      "priority": "Primary"
    },
    {
      "x": "[X-coordinate of SECOND best point]",
      "y": "[Y-coordinate/depth of second best point]", 
      "confidence": "High",
      "reason": "Large blue zone with excellent water potential",
      "priority": "Primary"
    },
    {
      "x": "[X-coordinate of THIRD best point]",
      "y": "[Y-coordinate/depth of third best point]", 
      "confidence": "Medium",
      "reason": "Good blue zone with favorable conditions",
      "priority": "Secondary"
    }
  ],
  "xAxisAnalysis": {
    "availablePoints": "[list all visible X-axis coordinates like 1,2,3,4,5]",
    "optimalPoints": "[list top 3 X-axis coordinates with best blue zones]",
    "avoidPoints": "[list X-axis coordinates with poor color zones]",
    "analysisMethod": "Color intensity analysis prioritizing dark blue zones over largest areas"
  }
}

IF THIS IS A STANDARD REPORT:
Look for standard sections and extract data as usual:

{
  "isPQWTMap": false,
  "customerName": "[actual name from Customer Name field]",
  "bookingId": "[actual ID from Booking ID field]", 
  "bookingDate": "[actual date from Booking Date field]",
  "surveyDate": "[actual date from Survey Date field]",
  "phoneNumber": "[actual phone from Phone Number field]",
  "district": "[actual district from District field]",
  "location": "[actual location from City/Location field]",
  "pointNumber": "[actual point from Point number field]",
  "rockDepth": "[actual depth from Rock Depth field]",
  "maximumDepth": "[actual depth from Maximum Depth field]",
  "percentageChance": "[actual percentage from Percentage of Chance field]",
  "chanceLevel": "[Low/Medium/High based on percentage]",
  "suggestedSourceType": "[actual type from Suggested Type of Source field]",
  "latitude": "[actual latitude coordinate]",
  "longitude": "[actual longitude coordinate]",
  "geologicalAnalysis": "[extract the geological analysis text from SUMMARY section]",
  "recommendations": "[extract recommendations or advisory text]",
  "drillingPoints": []
}

IMPORTANT: Only extract REAL data visible in the image. If any field is not visible, use "Not specified". Return ONLY valid JSON with no additional text.'
                            ],
                            [
                                'type' => 'image_url',
                                'image_url' => [
                                    'url' => 'data:' . $file['type'] . ';base64,' . $imageData
                                ]
                            ]
                        ]
                    ]
                ],
                'max_tokens' => 2000,
                'temperature' => 0
            ];
        }

        if (!isset($skipDirectCall)) {
            // Send JSON request to OpenRouter (image or text path)
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, 'https://openrouter.ai/api/v1/chat/completions');
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($openRouterRequest));
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Authorization: Bearer ' . $_ENV['OPENROUTER_API_KEY'],
                'Content-Type: application/json',
                'HTTP-Referer: https://report.saharagroundwater.com',
                'X-Title: Sahara Groundwater Kerala Survey App'
            ]);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 40);

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
        }

        error_log('OpenRouter response status: ' . $httpCode);

        if ($httpCode !== 200) {
            error_log('OpenRouter API error: ' . $response);
            http_response_code(500);
            echo json_encode([
                'error' => 'Failed to analyze survey report with AI service',
                'details' => $response,
                'status' => $httpCode
            ]);
            exit();
        }

        $aiResponse = json_decode($response, true);
        $analysisText = $aiResponse['choices'][0]['message']['content'] ?? '';

        error_log('🤖 AI Response Length: ' . strlen($analysisText) . ' characters');
        error_log('🤖 AI Response Preview: ' . substr($analysisText, 0, 200) . '...');

        if (empty($analysisText)) {
            http_response_code(500);
            echo json_encode([
                'error' => 'No survey analysis received from AI service',
                'aiResponse' => $aiResponse
            ]);
            exit();
        }

        // Try to parse the JSON response with better error handling
        $parsedAnalysis = null;
        
        // First, try to find JSON in the response
        if (preg_match('/\{[\s\S]*\}/', $analysisText, $matches)) {
            $jsonText = $matches[0];
        } else {
            $jsonText = $analysisText;
        }
        
        // Clean up the JSON text
        $jsonText = trim($jsonText);
        $jsonText = preg_replace('/^[^{]*/', '', $jsonText); // Remove text before {
        $jsonText = preg_replace('/[^}]*$/', '', $jsonText); // Remove text after }
        
        // Try to parse
        $parsedAnalysis = json_decode($jsonText, true);
        // If the model indicated it is not a Sahara report, reject
        if (is_array($parsedAnalysis) && isset($parsedAnalysis['notSaharaReport']) && $parsedAnalysis['notSaharaReport'] === true) {
            http_response_code(400);
            echo json_encode([
                'error' => 'Please upload a groundwater survey report (PDF or image) or a PQWT contour map for analysis.'
            ]);
            exit();
        }
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            error_log('Failed to parse AI response: ' . json_last_error_msg());
            error_log('Raw AI response: ' . $analysisText);
            error_log('Cleaned JSON: ' . $jsonText);
            
            // Return a fallback response with the raw data
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'surveyAnalysis' => [
                    'error' => 'AI response format issue',
                    'rawResponse' => $analysisText,
                    'customerName' => 'Analysis in progress',
                    'bookingId' => 'N/A',
                    'district' => 'Kerala',
                    'location' => 'Survey Location',
                    'percentageChance' => '75%',
                    'chanceLevel' => 'Good',
                    'geologicalAnalysis' => 'AI analysis completed but formatting needs adjustment',
                    'recommendations' => 'Please contact support for detailed analysis'
                ],
                'timestamp' => date('c')
            ]);
            exit();
        }

        // Track analysis usage
        track_analysis_usage($user_id);
        
        echo json_encode([
            'success' => true,
            'surveyAnalysis' => $parsedAnalysis,
            'timestamp' => date('c')
        ]);

    } catch (Exception $e) {
        error_log('Server error: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'error' => 'Internal server error',
            'message' => $e->getMessage()
        ]);
    }
    exit();
}

// User registration endpoint
if ($path === '/api/register' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $email = $input['email'] ?? '';
    $password = $input['password'] ?? '';
    $name = $input['name'] ?? '';
    
    if (empty($email) || empty($password)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Email and password are required']);
        exit();
    }
    
    $result = register_user($email, $password, $name);
    echo json_encode($result);
    exit();
}

// User login endpoint
if ($path === '/api/login' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $email = $input['email'] ?? '';
    $password = $input['password'] ?? '';
    
    if (empty($email) || empty($password)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Email and password are required']);
        exit();
    }
    
    $result = login_user($email, $password);
    echo json_encode($result);
    exit();
}

// Check user access endpoint
if (preg_match('/^\/api\/check-access\/(\d+)$/', $path, $matches) && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $userId = $matches[1];
    $result = check_user_access($userId);
    echo json_encode($result);
    exit();
}

// Payment verification endpoint
if ($path === '/api/verify-payment' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $userId = $input['user_id'] ?? 0;
    $paymentId = $input['payment_id'] ?? '';
    
    if (empty($userId) || empty($paymentId)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'User ID and payment ID are required']);
        exit();
    }
    
    // In production, verify the Razorpay signature here
    // For now, we'll just simulate successful payment
    global $userAccess;
    if (isset($userAccess[$userId])) {
        $userAccess[$userId]['subscription_status'] = 'active';
    }
    
    echo json_encode(['success' => true, 'message' => 'Payment verified successfully']);
    exit();
}

// Health check endpoint
if ($path === '/api/health') {
    echo json_encode([
        'status' => 'OK',
        'timestamp' => date('c')
    ]);
    exit();
}

// Serve the React app for all other requests
// If it's a file request (has extension), serve it directly
if (pathinfo($path, PATHINFO_EXTENSION)) {
    $filePath = __DIR__ . $path;
    if (file_exists($filePath)) {
        $mimeType = mime_content_type($filePath);
        header('Content-Type: ' . $mimeType);
        readfile($filePath);
        exit();
    }
}

// For all other requests, serve index.html
$indexPath = __DIR__ . '/index.html';
if (file_exists($indexPath)) {
    header('Content-Type: text/html');
    readfile($indexPath);
} else {
    http_response_code(404);
    echo 'File not found';
}
?>
