<?php
/*
Simple API endpoints for Sahara Groundwater
Add this to your WordPress functions.php or create as a separate file
*/

// Add API endpoints
add_action('rest_api_init', 'sahara_simple_api_routes');

function sahara_simple_api_routes() {
    // Check user access
    register_rest_route('sahara/v1', '/check-access/(?P<user_id>\d+)', array(
        'methods' => 'GET',
        'callback' => 'sahara_check_user_access_simple',
        'permission_callback' => '__return_true'
    ));
    
    // User registration
    register_rest_route('sahara/v1', '/register', array(
        'methods' => 'POST',
        'callback' => 'sahara_register_user_simple',
        'permission_callback' => '__return_true'
    ));
    
    // User login
    register_rest_route('sahara/v1', '/login', array(
        'methods' => 'POST',
        'callback' => 'sahara_login_user_simple',
        'permission_callback' => '__return_true'
    ));
    
    // Track analysis
    register_rest_route('sahara/v1', '/track-analysis', array(
        'methods' => 'POST',
        'callback' => 'sahara_track_analysis_simple',
        'permission_callback' => '__return_true'
    ));
}

// Check user access
function sahara_check_user_access_simple($request) {
    $user_id = $request['user_id'];
    $subscription_status = get_user_meta($user_id, 'subscription_status', true);
    $today = date('Y-m-d');
    $analysis_count = get_user_meta($user_id, 'daily_analysis_' . $today, true);
    $daily_limit = 1; // Free users get 1 analysis per day
    
    $has_access = false;
    $reason = '';
    
    if ($subscription_status === 'active') {
        $has_access = true;
        $reason = 'Active subscription';
    } elseif ($analysis_count < $daily_limit) {
        $has_access = true;
        $reason = 'Free daily limit available';
    } else {
        $has_access = false;
        $reason = 'Daily limit reached';
    }
    
    return array(
        'has_access' => $has_access,
        'reason' => $reason,
        'subscription_status' => $subscription_status,
        'analysis_count' => intval($analysis_count),
        'daily_limit' => $daily_limit,
        'monthly_price' => 100
    );
}

// User registration
function sahara_register_user_simple($request) {
    $params = $request->get_json_params();
    $email = sanitize_email($params['email']);
    $password = $params['password'];
    $name = sanitize_text_field($params['name']);
    
    // Check if user already exists
    if (email_exists($email)) {
        return new WP_Error('user_exists', 'User already exists with this email', array('status' => 400));
    }
    
    // Create user
    $user_id = wp_create_user($email, $password, $email);
    
    if (is_wp_error($user_id)) {
        return new WP_Error('registration_failed', $user_id->get_error_message(), array('status' => 400));
    }
    
    // Update user display name
    wp_update_user(array(
        'ID' => $user_id,
        'display_name' => $name ?: $email
    ));
    
    // Get user access data
    $access_data = sahara_check_user_access_simple(array('user_id' => $user_id));
    
    return array(
        'success' => true,
        'user_id' => $user_id,
        'email' => $email,
        'name' => $name ?: $email,
        'access' => $access_data
    );
}

// User login
function sahara_login_user_simple($request) {
    $params = $request->get_json_params();
    $email = sanitize_email($params['email']);
    $password = $params['password'];
    
    // Authenticate user
    $user = wp_authenticate($email, $password);
    
    if (is_wp_error($user)) {
        return new WP_Error('login_failed', 'Invalid email or password', array('status' => 401));
    }
    
    // Get user access data
    $access_data = sahara_check_user_access_simple(array('user_id' => $user->ID));
    
    return array(
        'success' => true,
        'user_id' => $user->ID,
        'email' => $user->user_email,
        'name' => $user->display_name,
        'access' => $access_data
    );
}

// Track analysis usage
function sahara_track_analysis_simple($request) {
    $params = $request->get_json_params();
    $user_id = $params['user_id'];
    $today = date('Y-m-d');
    $current_count = get_user_meta($user_id, 'daily_analysis_' . $today, true);
    update_user_meta($user_id, 'daily_analysis_' . $today, $current_count + 1);
    
    return array('success' => true, 'new_count' => $current_count + 1);
}
?>
