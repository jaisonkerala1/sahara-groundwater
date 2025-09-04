<?php
/*
Plugin Name: Sahara Groundwater Subscription
Description: Handles user subscriptions and analysis limits for groundwater analysis
Version: 1.0
Author: Sahara Groundwater
*/

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Add admin menu
add_action('admin_menu', 'sahara_subscription_menu');

function sahara_subscription_menu() {
    add_options_page(
        'Sahara Subscription',
        'Sahara Subscription',
        'manage_options',
        'sahara-subscription',
        'sahara_subscription_page'
    );
}

// Admin page
function sahara_subscription_page() {
    ?>
    <div class="wrap">
        <h1>Sahara Groundwater Subscription</h1>
        <p>Manage user subscriptions and analysis limits</p>
        
        <h2>Subscription Settings</h2>
        <form method="post" action="options.php">
            <?php settings_fields('sahara_subscription_settings'); ?>
            <table class="form-table">
                <tr>
                    <th scope="row">Monthly Price (₹)</th>
                    <td><input type="number" name="sahara_monthly_price" value="<?php echo get_option('sahara_monthly_price', 100); ?>" /></td>
                </tr>
                <tr>
                    <th scope="row">Free Daily Limit</th>
                    <td><input type="number" name="sahara_daily_limit" value="<?php echo get_option('sahara_daily_limit', 1); ?>" /></td>
                </tr>
                <tr>
                    <th scope="row">Razorpay Key ID</th>
                    <td><input type="text" name="sahara_razorpay_key" value="<?php echo get_option('sahara_razorpay_key', ''); ?>" placeholder="rzp_test_..." /></td>
                </tr>
                <tr>
                    <th scope="row">Razorpay Key Secret</th>
                    <td><input type="password" name="sahara_razorpay_secret" value="<?php echo get_option('sahara_razorpay_secret', ''); ?>" placeholder="Your secret key" /></td>
                </tr>
            </table>
            <?php submit_button(); ?>
        </form>
        
        <h2>User Subscriptions</h2>
        <table class="wp-list-table widefat fixed striped">
            <thead>
                <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Subscription Status</th>
                    <th>Today's Analysis</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <?php
                $users = get_users();
                foreach ($users as $user) {
                    $subscription_status = get_user_meta($user->ID, 'subscription_status', true);
                    $today = date('Y-m-d');
                    $analysis_count = get_user_meta($user->ID, 'daily_analysis_' . $today, true);
                    ?>
                    <tr>
                        <td><?php echo $user->display_name; ?></td>
                        <td><?php echo $user->user_email; ?></td>
                        <td><?php echo $subscription_status ?: 'Free'; ?></td>
                        <td><?php echo $analysis_count ?: 0; ?></td>
                        <td>
                            <a href="?page=sahara-subscription&action=toggle&user_id=<?php echo $user->ID; ?>">
                                <?php echo $subscription_status === 'active' ? 'Deactivate' : 'Activate'; ?>
                            </a>
                        </td>
                    </tr>
                    <?php
                }
                ?>
            </tbody>
        </table>
    </div>
    <?php
}

// Register settings
add_action('admin_init', 'sahara_subscription_settings');

function sahara_subscription_settings() {
    register_setting('sahara_subscription_settings', 'sahara_monthly_price');
    register_setting('sahara_subscription_settings', 'sahara_daily_limit');
    register_setting('sahara_subscription_settings', 'sahara_razorpay_key');
    register_setting('sahara_subscription_settings', 'sahara_razorpay_secret');
}

// Handle subscription toggle
add_action('admin_init', 'sahara_handle_subscription_toggle');

function sahara_handle_subscription_toggle() {
    if (isset($_GET['page']) && $_GET['page'] === 'sahara-subscription' && isset($_GET['action']) && $_GET['action'] === 'toggle') {
        $user_id = intval($_GET['user_id']);
        $current_status = get_user_meta($user_id, 'subscription_status', true);
        $new_status = $current_status === 'active' ? '' : 'active';
        update_user_meta($user_id, 'subscription_status', $new_status);
        wp_redirect(admin_url('options-general.php?page=sahara-subscription'));
        exit;
    }
}

// API endpoints
add_action('rest_api_init', 'sahara_register_api_routes');

function sahara_register_api_routes() {
    register_rest_route('sahara/v1', '/check-access/(?P<user_id>\d+)', array(
        'methods' => 'GET',
        'callback' => 'sahara_check_user_access',
        'permission_callback' => '__return_true'
    ));
    
    register_rest_route('sahara/v1', '/track-analysis', array(
        'methods' => 'POST',
        'callback' => 'sahara_track_analysis',
        'permission_callback' => '__return_true'
    ));
    
    // User registration endpoint
    register_rest_route('sahara/v1', '/register', array(
        'methods' => 'POST',
        'callback' => 'sahara_register_user',
        'permission_callback' => '__return_true'
    ));
    
    // User login endpoint
    register_rest_route('sahara/v1', '/login', array(
        'methods' => 'POST',
        'callback' => 'sahara_login_user',
        'permission_callback' => '__return_true'
    ));
    
    // Payment verification endpoint
    register_rest_route('sahara/v1', '/verify-payment', array(
        'methods' => 'POST',
        'callback' => 'sahara_verify_payment',
        'permission_callback' => '__return_true'
    ));
}

// Check user access
function sahara_check_user_access($request) {
    $user_id = $request['user_id'];
    $subscription_status = get_user_meta($user_id, 'subscription_status', true);
    $today = date('Y-m-d');
    $analysis_count = get_user_meta($user_id, 'daily_analysis_' . $today, true);
    $daily_limit = get_option('sahara_daily_limit', 1);
    
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
        'monthly_price' => get_option('sahara_monthly_price', 100)
    );
}

// Track analysis usage
function sahara_track_analysis($request) {
    $user_id = $request['user_id'];
    $today = date('Y-m-d');
    $current_count = get_user_meta($user_id, 'daily_analysis_' . $today, true);
    update_user_meta($user_id, 'daily_analysis_' . $today, $current_count + 1);
    
    return array('success' => true, 'new_count' => $current_count + 1);
}

// User registration
function sahara_register_user($request) {
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
    $access_data = sahara_check_user_access(array('user_id' => $user_id));
    
    return array(
        'success' => true,
        'user_id' => $user_id,
        'email' => $email,
        'name' => $name ?: $email,
        'access' => $access_data
    );
}

// User login
function sahara_login_user($request) {
    $params = $request->get_json_params();
    $email = sanitize_email($params['email']);
    $password = $params['password'];
    
    // Authenticate user
    $user = wp_authenticate($email, $password);
    
    if (is_wp_error($user)) {
        return new WP_Error('login_failed', 'Invalid email or password', array('status' => 401));
    }
    
    // Get user access data
    $access_data = sahara_check_user_access(array('user_id' => $user->ID));
    
    return array(
        'success' => true,
        'user_id' => $user->ID,
        'email' => $user->user_email,
        'name' => $user->display_name,
        'access' => $access_data
    );
}

// Payment verification
function sahara_verify_payment($request) {
    $params = $request->get_json_params();
    $user_id = intval($params['user_id']);
    $payment_id = sanitize_text_field($params['payment_id']);
    $order_id = sanitize_text_field($params['order_id']);
    $signature = sanitize_text_field($params['signature']);
    
    // Verify Razorpay signature
    $razorpay_key = get_option('sahara_razorpay_key');
    $razorpay_secret = get_option('sahara_razorpay_secret');
    
    if (!$razorpay_key || !$razorpay_secret) {
        return new WP_Error('config_error', 'Razorpay not configured', array('status' => 500));
    }
    
    // Verify signature
    $generated_signature = hash_hmac('sha256', $order_id . '|' . $payment_id, $razorpay_secret);
    
    if ($generated_signature !== $signature) {
        return new WP_Error('invalid_signature', 'Invalid payment signature', array('status' => 400));
    }
    
    // Activate subscription
    update_user_meta($user_id, 'subscription_status', 'active');
    update_user_meta($user_id, 'subscription_start_date', date('Y-m-d'));
    update_user_meta($user_id, 'payment_id', $payment_id);
    
    return array(
        'success' => true,
        'message' => 'Subscription activated successfully'
    );
}

// Add subscription status to user profile
add_action('show_user_profile', 'sahara_user_profile_fields');
add_action('edit_user_profile', 'sahara_user_profile_fields');

function sahara_user_profile_fields($user) {
    $subscription_status = get_user_meta($user->ID, 'subscription_status', true);
    ?>
    <h3>Sahara Groundwater Subscription</h3>
    <table class="form-table">
        <tr>
            <th><label for="subscription_status">Subscription Status</label></th>
            <td>
                <select name="subscription_status" id="subscription_status">
                    <option value="" <?php selected($subscription_status, ''); ?>>Free</option>
                    <option value="active" <?php selected($subscription_status, 'active'); ?>>Active</option>
                </select>
            </td>
        </tr>
    </table>
    <?php
}

// Save subscription status
add_action('personal_options_update', 'sahara_save_user_profile_fields');
add_action('edit_user_profile_update', 'sahara_save_user_profile_fields');

function sahara_save_user_profile_fields($user_id) {
    if (current_user_can('edit_user', $user_id)) {
        update_user_meta($user_id, 'subscription_status', $_POST['subscription_status']);
    }
}
