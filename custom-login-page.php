<?php
/*
Template Name: Custom Login Page
*/

get_header(); ?>

<div class="login-page-container" style="min-height: 80vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px;">
    <div class="login-card" style="background: white; padding: 40px; border-radius: 15px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); max-width: 400px; width: 100%;">
        
        <!-- Logo -->
        <div class="text-center mb-4">
            <img src="<?php echo get_template_directory_uri(); ?>/logo.png" alt="Sahara Groundwater" style="height: 60px; margin-bottom: 20px;">
            <h2 style="color: #333; margin-bottom: 10px;">Welcome to Sahara Groundwater</h2>
            <p style="color: #666; font-size: 14px;">AI-Powered Survey Analysis</p>
        </div>

        <!-- Login Form -->
        <div id="loginForm">
            <form id="loginFormElement" style="margin-bottom: 20px;">
                <div class="form-group" style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 5px; color: #333; font-weight: 500;">Email Address</label>
                    <input type="email" id="loginEmail" required style="width: 100%; padding: 12px; border: 2px solid #e1e5e9; border-radius: 8px; font-size: 16px; transition: border-color 0.3s;">
                </div>
                
                <div class="form-group" style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 5px; color: #333; font-weight: 500;">Password</label>
                    <input type="password" id="loginPassword" required style="width: 100%; padding: 12px; border: 2px solid #e1e5e9; border-radius: 8px; font-size: 16px; transition: border-color 0.3s;">
                </div>
                
                <button type="submit" style="width: 100%; background: #3B82F6; color: white; padding: 12px; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; transition: background 0.3s;">
                    Sign In
                </button>
            </form>
            
            <div class="text-center">
                <p style="color: #666; font-size: 14px; margin-bottom: 15px;">Don't have an account?</p>
                <button onclick="showRegisterForm()" style="background: none; border: 2px solid #3B82F6; color: #3B82F6; padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.3s;">
                    Create Account
                </button>
            </div>
        </div>

        <!-- Register Form -->
        <div id="registerForm" style="display: none;">
            <form id="registerFormElement" style="margin-bottom: 20px;">
                <div class="form-group" style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 5px; color: #333; font-weight: 500;">Full Name</label>
                    <input type="text" id="registerName" required style="width: 100%; padding: 12px; border: 2px solid #e1e5e9; border-radius: 8px; font-size: 16px; transition: border-color 0.3s;">
                </div>
                
                <div class="form-group" style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 5px; color: #333; font-weight: 500;">Email Address</label>
                    <input type="email" id="registerEmail" required style="width: 100%; padding: 12px; border: 2px solid #e1e5e9; border-radius: 8px; font-size: 16px; transition: border-color 0.3s;">
                </div>
                
                <div class="form-group" style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 5px; color: #333; font-weight: 500;">Password</label>
                    <input type="password" id="registerPassword" required style="width: 100%; padding: 12px; border: 2px solid #e1e5e9; border-radius: 8px; font-size: 16px; transition: border-color 0.3s;">
                </div>
                
                <button type="submit" style="width: 100%; background: #10B981; color: white; padding: 12px; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; transition: background 0.3s;">
                    Create Account
                </button>
            </form>
            
            <div class="text-center">
                <p style="color: #666; font-size: 14px; margin-bottom: 15px;">Already have an account?</p>
                <button onclick="showLoginForm()" style="background: none; border: 2px solid #10B981; color: #10B981; padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.3s;">
                    Sign In
                </button>
            </div>
        </div>

        <!-- Success Message -->
        <div id="successMessage" style="display: none; background: #D1FAE5; color: #065F46; padding: 15px; border-radius: 8px; margin-top: 20px; text-align: center;">
            <p style="margin: 0; font-weight: 600;">Account created successfully!</p>
            <p style="margin: 5px 0 0 0; font-size: 14px;">You can now use the same credentials on our analysis tool.</p>
        </div>

        <!-- Error Message -->
        <div id="errorMessage" style="display: none; background: #FEE2E2; color: #DC2626; padding: 15px; border-radius: 8px; margin-top: 20px; text-align: center;">
            <p style="margin: 0; font-weight: 600;" id="errorText">An error occurred. Please try again.</p>
        </div>

        <!-- Analysis Tool Link -->
        <div class="text-center mt-4" style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e1e5e9;">
            <p style="color: #666; font-size: 14px; margin-bottom: 10px;">Ready to analyze your survey?</p>
            <a href="https://report.saharagroundwater.com" style="background: #8B5CF6; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block; transition: background 0.3s;">
                Go to Analysis Tool
            </a>
        </div>
    </div>
</div>

<script>
// Form switching
function showLoginForm() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('successMessage').style.display = 'none';
    document.getElementById('errorMessage').style.display = 'none';
}

function showRegisterForm() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
    document.getElementById('successMessage').style.display = 'none';
    document.getElementById('errorMessage').style.display = 'none';
}

// Show error message
function showError(message) {
    document.getElementById('errorText').textContent = message;
    document.getElementById('errorMessage').style.display = 'block';
    document.getElementById('successMessage').style.display = 'none';
}

// Show success message
function showSuccess() {
    document.getElementById('successMessage').style.display = 'block';
    document.getElementById('errorMessage').style.display = 'none';
}

// Login form submission
document.getElementById('loginFormElement').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch('<?php echo home_url(); ?>/wp-json/sahara/v1/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            // Redirect to analysis tool with user info
            const userInfo = {
                id: data.user_id,
                email: data.email,
                name: data.name,
                subscription_status: data.access ? data.access.subscription_status : '',
                analysis_count: data.access ? data.access.analysis_count : 0,
                daily_limit: data.access ? data.access.daily_limit : 1
            };
            
            console.log('Storing user info:', userInfo);
            
            // Store user info in localStorage for the analysis tool
            localStorage.setItem('sahara_user', JSON.stringify(userInfo));
            
            // Redirect to analysis tool
            window.location.href = 'https://report.saharagroundwater.com';
        } else {
            console.error('Login error:', data);
            showError(data.message || 'Login failed. Please check your credentials.');
        }
    } catch (error) {
        showError('Login failed. Please try again.');
    }
});

// Register form submission
document.getElementById('registerFormElement').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    
    try {
        const response = await fetch('<?php echo home_url(); ?>/wp-json/sahara/v1/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: name,
                email: email,
                password: password
            })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            showSuccess();
            // Auto-login after successful registration
            setTimeout(() => {
                document.getElementById('loginEmail').value = email;
                document.getElementById('loginPassword').value = password;
                document.getElementById('loginFormElement').dispatchEvent(new Event('submit'));
            }, 2000);
        } else {
            showError(data.message || 'Registration failed. Please try again.');
        }
    } catch (error) {
        showError('Registration failed. Please try again.');
    }
});

// Add hover effects
document.querySelectorAll('button').forEach(button => {
    button.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    });
    
    button.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = 'none';
    });
});

// Add focus effects to inputs
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('focus', function() {
        this.style.borderColor = '#3B82F6';
    });
    
    input.addEventListener('blur', function() {
        this.style.borderColor = '#e1e5e9';
    });
});
</script>

<?php get_footer(); ?>
