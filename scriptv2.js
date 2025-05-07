// Initialize GSAP and ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// DOM Elements
const modal = document.getElementById('paymentModal');
const closeModalBtn = document.querySelector('.close-modal');
const selectedCourseSpan = document.querySelector('.modal-subtitle span');
const copyBtn = document.getElementById('copyBtn');
const accountNumber = document.getElementById('accountNumber');
const payNowBtn = document.getElementById('payNowBtn');
const priceInput = document.getElementById('price');
const phoneInput = document.getElementById('phoneNumber');
const notificationsContainer = document.getElementById('notifications');
// استخدام مفوض الأحداث للدورات (اختيار الحاوي الأب للدورات)
const coursesGrid = document.querySelector('.courses-grid');

// Array of Random Names
const randomNames = [
    "أحمد محمود", "محمد عالي", "سيدي مخطار", "ام كلثوم", "محمود الحسن",
    "احمد مشظوف", "ول سيدي عالي", "عبد الناصر", "جمال", " فاضل",
    "علي", "عمر", "حسن", "مخطار السالم", "لمين"
];

// Course Names
const courseNames = [ 
    "7D الرياضيات", "7D العلوم", "7D الكيمياء", "7D الفيزياء"
];

// Countdown Timer
const countdownTimer = () => {
    const now = new Date().getTime();
    
    // Set the end date to 7 days from when the page is first loaded
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);
    
    // Get the stored end date from local storage or set a new one
    let storedEndDate = localStorage.getItem('eidOfferEndDate');
    if (!storedEndDate) {
        storedEndDate = endDate.getTime();
        localStorage.setItem('eidOfferEndDate', storedEndDate);
    }
    
    // Calculate the remaining time
    const distance = parseInt(storedEndDate) - now;
    
    // Time calculations
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    // Display the countdown in both the hero section and fixed countdown
    document.getElementById('days').textContent = days < 10 ? `0${days}` : days;
    document.getElementById('hours').textContent = hours < 10 ? `0${hours}` : hours;
    document.getElementById('minutes').textContent = minutes < 10 ? `0${minutes}` : minutes;
    document.getElementById('seconds').textContent = seconds < 10 ? `0${seconds}` : seconds;
    
    // Update fixed countdown timer elements as well
    if (document.getElementById('fixed-days')) {
        document.getElementById('fixed-days').textContent = days < 10 ? `0${days}` : days;
        document.getElementById('fixed-hours').textContent = hours < 10 ? `0${hours}` : hours;
        document.getElementById('fixed-minutes').textContent = minutes < 10 ? `0${minutes}` : minutes;
        document.getElementById('fixed-seconds').textContent = seconds < 10 ? `0${seconds}` : seconds;
    }
    
    // If the countdown is finished, display "EXPIRED"
    if (distance < 0) {
        clearInterval(countdownInterval);
        document.getElementById('countdown').innerHTML = "<p>العرض انتهى!</p>";
        
        // Update fixed countdown also
        if (document.querySelector('.fixed-countdown')) {
            document.querySelectorAll('.timer-unit').forEach(unit => {
                unit.classList.add('expired');
            });
            document.querySelector('.countdown-label').textContent = "العرض انتهى!";
        }
    }
};

// Initialize countdown timer and update every second
countdownTimer();
const countdownInterval = setInterval(countdownTimer, 1000);

// Modal Functionality - replaced with Event Delegation pattern
// بدلاً من إضافة مستمعي أحداث لكل زر، نضيف مستمع للعنصر الأب
document.addEventListener('click', function(event) {
    // التحقق فيما إذا كان العنصر المنقور عليه هو زر الشراء أو أحد أبنائه
    const buyButton = event.target.closest('.buy-button');
    
    if (buyButton) {
        const courseName = buyButton.getAttribute('data-course');
        const courseCard = buyButton.closest('.course-card');
        const originalPrice = courseCard.querySelector('.old-price').textContent;
        
        selectedCourseSpan.textContent = courseName;
        document.getElementById('originalPrice').textContent = originalPrice;
        
        // Set minimum price to match the new price (discounted price)
        const newPrice = courseCard.querySelector('.new-price').textContent;
        priceInput.setAttribute('min', newPrice);
        // priceInput.value = newPrice;
        
        // Clear any previous validation errors
        clearErrors();
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
    }
});

closeModalBtn.addEventListener('click', () => {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto'; // Enable scrolling again
});

// Close modal when clicking outside the modal content
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
});

// Copy account number to clipboard
copyBtn.addEventListener('click', () => {
    const tempTextArea = document.createElement('textarea');
    tempTextArea.value = accountNumber.textContent;
    document.body.appendChild(tempTextArea);
    tempTextArea.select();
    document.execCommand('copy');
    document.body.removeChild(tempTextArea);
    
    // Change button text temporarily
    const originalText = copyBtn.innerHTML;
    copyBtn.innerHTML = '<i class="fas fa-check"></i> تم النسخ';
    setTimeout(() => {
        copyBtn.innerHTML = originalText;
    }, 2000);
});

// Pay Now Button
payNowBtn.addEventListener('click', () => {
    const price = priceInput.value;
    const phone = phoneInput.value;
    const course = selectedCourseSpan.textContent;
    document.querySelector("#priceError").style = `filter: blur(0px);`;
    // Reset previous errors
    clearErrors();
    
    // Validate inputs
    let isValid = true;
    
    if (!price || price < parseInt(priceInput.getAttribute('min'))) {
        showError(priceInput, priceError, `يجب أن يكون المبلغ ${priceInput.getAttribute('min')} أوقية على الأقل`);
        isValid = false;
    }
    
    if (!phone) {
        showError(phoneInput, phoneError, 'يرجى إدخال رقم الهاتف الذي تم الدفع منه');
        isValid = false;
    } else if (!isValidPhoneNumber(phone)) {
        showError(phoneInput, phoneError, 'يرجى إدخال رقم هاتف صحيح');
        isValid = false;
    }
    
    if (!isValid) {
        return;
    }
    
    // Store order data in localStorage
    const orderData = {
        course: course,
        price: price,
        phone: phone,
        timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('orderData', JSON.stringify(orderData));
    
    // Close modal
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    
    // Redirect to thank you page
    
    let sn = document.querySelector('.send');
    const data = JSON.parse(localStorage.getItem('orderData'));
    const courseName = data.course;
    const coursePrice = data.price;
    const userPhone = data.phone;
     document.querySelector('.cours').value = courseName;
     document.querySelector('.mony').value = coursePrice;
     document.querySelector('.phone').value = userPhone;
     sn.click();  

    function senddatatosheet(){
     window.location.href = 'https://raayeg.net/thank-you/';  
    }
    setTimeout(senddatatosheet, 1000);
     // 

});

// Form validation helper functions
const priceError = document.getElementById('priceError');
const phoneError = document.getElementById('phoneError');

function showError(inputElement, errorElement, message) {
    inputElement.classList.add('error');
    errorElement.textContent = message;
    errorElement.classList.add('active');
}

function clearErrors() {
    // Clear all error states
    const inputs = [priceInput, phoneInput];
    const errorElements = [priceError, phoneError];
    
    inputs.forEach(input => input.classList.remove('error'));
    errorElements.forEach(error => {
        error.textContent = '';
        error.classList.remove('active');
    });
}

function isValidPhoneNumber(phoneNumber) {
    // Simple validation - you can make this more specific for Mauritanian phone numbers
    return /^\d{8,12}$/.test(phoneNumber.replace(/\s/g, ''));
}

// Add input event listeners for real-time validation
priceInput.addEventListener('input', function() {
    const minPrice = parseInt(this.getAttribute('min'));
    
    if (this.value < minPrice) {
        showError(this, priceError, `يجب أن يكون المبلغ ${minPrice} أوقية على الأقل`);
    } else {
        priceInput.classList.remove('error');
        priceError.textContent = '';
        priceError.classList.remove('active');
    }
});

phoneInput.addEventListener('input', function() {
    if (this.value.trim() === '') {
        showError(this, phoneError, 'يرجى إدخال رقم الهاتف الذي تم الدفع منه');
    } else if (!isValidPhoneNumber(this.value)) {
        showError(this, phoneError, 'يرجى إدخال رقم هاتف صحيح');
    } else {
        phoneInput.classList.remove('error');
        phoneError.textContent = '';
        phoneError.classList.remove('active');
    }
});

// Random Notification Function
const createRandomNotification = () => {
    const randomName = randomNames[Math.floor(Math.random() * randomNames.length)];
    const randomCourse = courseNames[Math.floor(Math.random() * courseNames.length)];
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    
    // Create notification content
    notification.innerHTML = `
        <div class="notification-icon">
            <i class="fas fa-shopping-cart"></i>
        </div>
        <div class="notification-content">
            <div class="notification-title">${randomName}</div>
            <div class="notification-message">اشترى للتو دورة ${randomCourse}</div>
        </div>
    `;
    
    // Add notification to container
    notificationsContainer.appendChild(notification);
    
    // Remove notification after animation completes (6s = 5s display + 1s fade)
    setTimeout(() => {
        notification.remove();
    }, 6000);
};

// Show a notification every 5-15 seconds
const showRandomNotifications = () => {
    const minTime = 5000; // 5 seconds
    const maxTime = 15000; // 15 seconds
    
    // Create first notification after a random delay
    const timeout = Math.floor(Math.random() * (maxTime - minTime + 1)) + minTime;
    
    setTimeout(() => {
        createRandomNotification();
        showRandomNotifications(); // Schedule the next notification
    }, timeout);
};

// Initialize ScrollTrigger Animations
const initAnimations = () => {
    // Animate courses on scroll
    gsap.utils.toArray('.course-card').forEach((card, i) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top bottom-=100',
                toggleActions: 'play none none none'
            },
            y: 100,
            opacity: 0,
            duration: 0.8,
            delay: i * 0.1
        });
    });
    
    // Animate features
    gsap.utils.toArray('.feature-card').forEach((card, i) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top bottom-=100',
                toggleActions: 'play none none none'
            },
            y: 50,
            opacity: 0,
            duration: 0.6,
            delay: i * 0.1
        });
    });
    
    // Animate testimonials
    gsap.utils.toArray('.testimonial-card').forEach((card, i) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top bottom-=100',
                toggleActions: 'play none none none'
            },
            x: i % 2 === 0 ? -50 : 50,
            opacity: 0,
            duration: 0.7,
            delay: i * 0.1
        });
    });
    
    // Animate hero section
    gsap.from('.hero-content', {
        opacity: 0,
        y: 50,
        duration: 1,
        delay: 0.2
    });
    
    gsap.from('.sheep-3d-container', {
        opacity: 0,
        x: 50,
        duration: 1,
        delay: 0.5
    });
};

// Initialize Animations and Notifications
document.addEventListener('DOMContentLoaded', () => {
    initAnimations();
    
    // Start random notifications after 3 seconds
    setTimeout(() => {
        showRandomNotifications();
    }, 3000);
});

// Reveal elements on scroll (fallback for browsers without GSAP)
const reveal = () => {
    const reveals = document.querySelectorAll('.reveal');
    
    reveals.forEach(element => {
        const windowHeight = window.innerHeight;
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < windowHeight - elementVisible) {
            element.classList.add('active');
        }
    });
};

window.addEventListener('scroll', reveal);
reveal(); // Initial check 
