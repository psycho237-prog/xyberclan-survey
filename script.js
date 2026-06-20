document.addEventListener('DOMContentLoaded', () => {
    // --- Language Switcher ---
    const btnFr = document.getElementById('btn-fr');
    const btnEn = document.getElementById('btn-en');
    
    if (btnFr && btnEn) {
        btnFr.addEventListener('click', () => {
            btnFr.classList.add('active');
            btnEn.classList.remove('active');
            if (window.applyTranslations) window.applyTranslations('fr');
        });
        btnEn.addEventListener('click', () => {
            btnEn.classList.add('active');
            btnFr.classList.remove('active');
            if (window.applyTranslations) window.applyTranslations('en');
        });
    }

    // --- Elements ---
    const startSurveyBtn = document.getElementById('startSurveyBtn');
    const presentationSection = document.querySelector('.presentation');
    const surveySection = document.getElementById('surveySection');

    const formSteps = document.querySelectorAll('.form-step');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const submitBtn = document.getElementById('submitBtn');
    const progressBar = document.getElementById('progressBar');

    const surveyForm = document.getElementById('surveyForm');
    const successMessage = document.getElementById('successMessage');

    let currentStep = 0;
    const totalSteps = formSteps.length;

    // --- Replace this URL with your Google Apps Script Web App URL ---
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxxO-XT0bSZPbszsvb9SP5cHUewC7nRUrta2HT2aI4Uh37EtPQfZ69Tzc4_VibQlHNv4Q/exec';

    // --- Presentation to Survey Transition ---
    startSurveyBtn.addEventListener('click', () => {
        presentationSection.classList.add('hidden');
        surveySection.classList.remove('hidden');
        updateForm();
    });

    // --- Form Navigation ---
    nextBtn.addEventListener('click', () => {
        if (validateStep(currentStep)) {
            currentStep++;
            updateForm();
            window.scrollTo({ top: surveySection.offsetTop - 20, behavior: 'smooth' });
        }
    });

    prevBtn.addEventListener('click', () => {
        currentStep--;
        updateForm();
        window.scrollTo({ top: surveySection.offsetTop - 20, behavior: 'smooth' });
    });

    function updateForm() {
        // Show/Hide steps
        formSteps.forEach((step, index) => {
            if (index === currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });

        // Update Progress Bar
        const progress = ((currentStep + 1) / totalSteps) * 100;
        progressBar.style.width = `${progress}%`;

        // Update Buttons
        if (currentStep === 0) {
            prevBtn.classList.add('hidden');
        } else {
            prevBtn.classList.remove('hidden');
        }

        if (currentStep === totalSteps - 1) {
            nextBtn.classList.add('hidden');
            submitBtn.classList.remove('hidden');
        } else {
            nextBtn.classList.remove('hidden');
            submitBtn.classList.add('hidden');
        }
    }

    // --- Simple Validation ---
    function validateStep(stepIndex) {
        const currentStepEl = formSteps[stepIndex];
        const requiredInputs = currentStepEl.querySelectorAll('input[required], select[required], textarea[required]');

        let isValid = true;

        requiredInputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                input.style.borderColor = 'var(--error-color)';
                // Simple animation to draw attention
                input.animate([
                    { transform: 'translateX(0)' },
                    { transform: 'translateX(-5px)' },
                    { transform: 'translateX(5px)' },
                    { transform: 'translateX(0)' }
                ], { duration: 300 });
            } else {
                input.style.borderColor = 'var(--border-color)';
            }
        });

        return isValid;
    }

    // Remove error styling on input
    document.querySelectorAll('input, select, textarea').forEach(el => {
        el.addEventListener('input', function () {
            if (this.hasAttribute('required') && this.value.trim()) {
                this.style.borderColor = 'var(--border-color)';
            }
        });
    });

    // --- Form Submission ---
    surveyForm.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!validateStep(currentStep)) return;

        // Visual feedback
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi en cours...';

        // Collect Data
        const formData = new FormData(surveyForm);
        const data = {};

        // Handle multiple values (checkboxes) correctly
        for (let [key, value] of formData.entries()) {
            if (data[key]) {
                if (!Array.isArray(data[key])) {
                    data[key] = [data[key]];
                }
                data[key].push(value);
            } else {
                data[key] = value;
            }
        }

        // Convert array values to comma-separated strings for Google Sheets
        Object.keys(data).forEach(key => {
            if (Array.isArray(data[key])) {
                data[key] = data[key].join(', ');
            }
        });

        // Send to Google Apps Script
        fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // Important for Google Apps Script to avoid CORS issues
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(() => {
                // Because of 'no-cors', we won't get a proper response object, 
                // but the 'then' block will execute if the network request succeeds.
                showSuccess();
            })
            .catch(error => {
                console.error('Erreur lors de l\'envoi:', error);
                // Even on error, we might want to show success if it's a CORS false-negative,
                // but for safety let's revert the button
                alert('Une erreur est survenue lors de l\'envoi. Veuillez réessayer.');
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Envoyer mes réponses';
            });
    });

    function showSuccess() {
        surveyForm.classList.add('hidden');
        document.querySelector('.progress-bar-container').classList.add('hidden');
        successMessage.classList.remove('hidden');
        window.scrollTo({ top: surveySection.offsetTop - 20, behavior: 'smooth' });
    }
});
