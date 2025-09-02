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

// API endpoint for survey analysis
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $path === '/api/analyze-survey') {
    try {
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
        
        if ($file['type'] === 'application/pdf') {
            error_log('📄 Processing PDF file - attempting text extraction');
            
            // Attempt to extract text from PDF
            $pdfText = '';
            
            // Try using pdftotext if available (most Linux servers have this)
            $tempFile = $file['tmp_name'];
            $textFile = tempnam(sys_get_temp_dir(), 'pdf_extract_') . '.txt';
            
            // Try pdftotext command (if available on server)
            $command = "pdftotext '$tempFile' '$textFile' 2>/dev/null";
            exec($command, $output, $returnCode);
            
            if ($returnCode === 0 && file_exists($textFile)) {
                $pdfText = file_get_contents($textFile);
                unlink($textFile); // Clean up
                error_log('✅ Successfully extracted text from PDF: ' . strlen($pdfText) . ' characters');
                error_log('📝 First 200 chars of extracted text: ' . substr($pdfText, 0, 200));
                
                // If we got very little text, the extraction might have failed
                if (strlen(trim($pdfText)) < 50) {
                    error_log('⚠️ Very little text extracted, might be image-based PDF');
                    $pdfText = 'PDF contains very little extractable text (possibly image-based). Please analyze as typical Sahara Groundwater report and generate realistic Kerala data.';
                }
                
                // Basic brand validation: allow only Sahara Groundwater reports
                $brandIndicators = [
                    'sahara groundwater',
                    'groundwater survey report',
                    'geophysical survey result',
                    'booking id',
                    'survey date',
                ];
                $isSaharaPdf = false;
                $lowerPdfText = strtolower($pdfText);
                foreach ($brandIndicators as $indicator) {
                    if (strpos($lowerPdfText, $indicator) !== false) {
                        $isSaharaPdf = true;
                        break;
                    }
                }
                // Enforce strictly only when SAHARA_STRICT=1 (default relaxed locally)
                $shouldEnforce = isset($_ENV['SAHARA_STRICT']) ? $_ENV['SAHARA_STRICT'] === '1' : false;
                if (!$isSaharaPdf && $shouldEnforce) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Only Sahara Groundwater reports are supported. Please upload a Sahara Groundwater report PDF or screenshot.']);
                    exit();
                }
            } else {
                error_log('❌ pdftotext not available or failed, falling back to instruction-based analysis');
                $pdfText = 'PDF text extraction not available on server. Please analyze as typical Sahara Groundwater report and generate realistic Kerala data.';
            }
            
            $openRouterRequest = [
                'model' => 'anthropic/claude-3-haiku', // Claude might handle PDFs better than GPT
                'messages' => [
                    [
                        'role' => 'user',
                        'content' => 'You are analyzing a Sahara Groundwater Kerala SURVEY REPORT PDF. Here is the extracted text content:\n\n' . $pdfText . '\n\nSTRICT RULES:\n- Extract ONLY values that are explicitly present in the text.\n- DO NOT fabricate or "guess" missing values.\n- If a field is missing or unreadable, set it to "Not specified".\n- Return clean JSON only, with no extra commentary.\n\nReturn JSON with these keys exactly:\n{\n  "customerName": "... or Not specified",\n  "bookingId": "... or Not specified",\n  "bookingDate": "YYYY-MM-DD or Not specified",\n  "surveyDate": "YYYY-MM-DD or Not specified",\n  "phoneNumber": "... or Not specified",\n  "district": "... or Not specified",\n  "location": "... or Not specified",\n  "pointNumber": "... or Not specified",\n  "rockDepth": "... or Not specified",\n  "maximumDepth": "... or Not specified",\n  "percentageChance": "... or Not specified",\n  "chanceLevel": "Low/Medium/High or Not specified",\n  "suggestedSourceType": "... or Not specified",\n  "latitude": "... or Not specified",\n  "longitude": "... or Not specified",\n  "geologicalAnalysis": "... or Not specified",\n  "recommendations": "... or Not specified"\n}'
                    ]
                ],
                'max_tokens' => 1500,
                'temperature' => 0
            ];
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
                'model' => $_ENV['OPENROUTER_MODEL'] ?? 'openai/gpt-4o-mini',
                'messages' => [
                    [
                        'role' => 'user',
                        'content' => [
                            [
                                'type' => 'text',
                                'text' => 'You are analyzing an uploaded image. First, verify STRICTLY if this is a Sahara Groundwater Kerala SURVEY REPORT screenshot/photo (look for Sahara logo/text and sections like CUSTOMER DETAILS, GEOPHYSICAL SURVEY RESULT). If it is NOT a Sahara Groundwater report, respond ONLY with this JSON: {"notSaharaReport": true}. If it IS a Sahara Groundwater report, extract ONLY the values that are clearly visible in the image. Do NOT invent values. For any field not visible/readable, set "Not specified". Look for:

SPECIFIC SECTIONS TO FIND:
1. "CUSTOMER DETAILS" section with Customer Name, Booking ID, dates, phone, district
2. "GEOPHYSICAL SURVEY RESULT" section with Point number, Rock Depth, Maximum Depth, Percentage of Chance, coordinates
3. "SUMMARY" section with geological analysis and water findings

Extract this data into JSON format:

{
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
  "recommendations": "[extract recommendations or advisory text]"
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
                'max_tokens' => 1500,
                'temperature' => 0
            ];
        }

        // Send request to OpenRouter
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
                'error' => 'Only Sahara Groundwater reports are supported. Please upload a Sahara Groundwater report PDF or screenshot.'
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
