/**
 * XYBERCLAN Survey - Frontend Client Logic
 */

// Replace this URL with your deployed Google Apps Script Web App URL!
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwYOUR_SCRIPT_ID_HERE/exec";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("surveyForm");
  const mainContent = document.getElementById("mainContent");
  const successMessage = document.getElementById("successMessage");
  const submitBtn = document.getElementById("submitBtn");
  
  // Custom Autre inputs
  const challengeOtherCheckbox = document.getElementById("challengeOtherCheckbox");
  const challengeOtherText = document.getElementById("challengeOtherText");
  const automationOtherCheckbox = document.getElementById("automationOtherCheckbox");
  const automationOtherText = document.getElementById("automationOtherText");

  // Star Rating elements
  const starsContainer = document.getElementById("starsContainer");
  const starButtons = starsContainer.querySelectorAll(".star-btn");
  const cybersecurityInput = document.getElementById("cybersecurity");
  const starsLegend = document.getElementById("starsLegend");

  // Progress Bar elements
  const progressBar = document.getElementById("progressBar");
  const progressPercentText = document.getElementById("progressPercent");

  let currentCybersecurityRating = 0;

  // --- Checkbox and Radio styling state sync ---
  // Apply "checked" class to choice labels dynamically
  function syncChoicesStates() {
    const choiceInputs = document.querySelectorAll(".choice-input");
    choiceInputs.forEach(input => {
      const label = input.closest(".choice-label");
      if (!label) return;
      
      if (input.checked) {
        label.classList.add("checked");
      } else {
        label.classList.remove("checked");
      }
    });
  }

  // Monitor all document changes to update checked classes
  document.addEventListener("change", (e) => {
    if (e.target.classList.contains("choice-input")) {
      // If it's a radio input, sync all radios in the same group first
      if (e.target.type === "radio") {
        const name = e.target.name;
        document.querySelectorAll(`input[name="${name}"]`).forEach(radio => {
          const lbl = radio.closest(".choice-label");
          if (lbl) lbl.classList.remove("checked");
        });
      }
      
      // Sync the changed input
      syncChoicesStates();
      
      // Update progress bar
      updateProgress();
    }
  });

  // Initial sync
  syncChoicesStates();

  // --- Show/Hide "Autre" text fields ---
  challengeOtherCheckbox.addEventListener("change", () => {
    if (challengeOtherCheckbox.checked) {
      challengeOtherText.style.display = "block";
      challengeOtherText.focus();
    } else {
      challengeOtherText.style.display = "none";
      challengeOtherText.value = "";
    }
  });

  automationOtherCheckbox.addEventListener("change", () => {
    if (automationOtherCheckbox.checked) {
      automationOtherText.style.display = "block";
      automationOtherText.focus();
    } else {
      automationOtherText.style.display = "none";
      automationOtherText.value = "";
    }
  });

  // --- Star Rating interaction ---
  const ratingTexts = {
    1: "1/5 - Très faible (Aucune mesure ou protection)",
    2: "2/5 - Faible (Quelques mesures basiques uniquement)",
    3: "3/5 - Moyen (Pare-feu, antivirus et sensibilisation de base)",
    4: "4/5 - Bon (Politique de sécurité structurée, sauvegardes régulières)",
    5: "5/5 - Excellent (Protection proactive, audits réguliers et plans d'incident)"
  };

  starButtons.forEach(btn => {
    const val = parseInt(btn.getAttribute("data-value"), 10);
    
    // Mouse hover events
    btn.addEventListener("mouseenter", () => {
      highlightStars(val, "hovered");
    });
    
    // Mouse click event
    btn.addEventListener("click", () => {
      currentCybersecurityRating = val;
      cybersecurityInput.value = val;
      highlightStars(val, "active");
      starsLegend.textContent = ratingTexts[val] || `${val}/5`;
      starsLegend.style.color = "var(--secondary)";
      starsLegend.style.fontWeight = "600";
      
      // Update progress
      updateProgress();
    });
  });

  starsContainer.addEventListener("mouseleave", () => {
    // Clear hover classes
    starButtons.forEach(btn => btn.classList.remove("hovered"));
    // Restore active classes to match current selection
    highlightStars(currentCybersecurityRating, "active");
  });

  function highlightStars(ratingValue, className) {
    starButtons.forEach(btn => {
      const btnVal = parseInt(btn.getAttribute("data-value"), 10);
      if (btnVal <= ratingValue) {
        btn.classList.add(className);
      } else {
        btn.classList.remove(className);
      }
    });
  }

  // --- Form Progress Calculation ---
  // We define 10 points that contribute to the progress bar completion
  function updateProgress() {
    let completedPoints = 0;
    const totalPoints = 10;

    // 1. Nom entreprise
    if (document.getElementById("company").value.trim().length > 0) completedPoints++;
    
    // 2. Fonction du répondant
    if (document.getElementById("position").value.trim().length > 0) completedPoints++;
    
    // 3. Secteur
    if (document.getElementById("sector").value !== "") completedPoints++;
    
    // 4. Taille entreprise
    if (document.getElementById("size").value !== "") completedPoints++;
    
    // 5. Défis (au moins une checkbox)
    const challengesChecked = document.querySelectorAll('input[name="challenges"]:checked');
    if (challengesChecked.length > 0) completedPoints++;
    
    // 6. Note de cybersécurité
    if (currentCybersecurityRating > 0) completedPoints++;
    
    // 7. Usage IA
    const aiUsageChecked = document.querySelector('input[name="aiUsage"]:checked');
    if (aiUsageChecked) completedPoints++;
    
    // 8. Tâches d'automatisation (au moins une checkbox)
    const automationTasksChecked = document.querySelectorAll('input[name="automationTasks"]:checked');
    if (automationTasksChecked.length > 0) completedPoints++;
    
    // 9. Intérêts formation (au moins une checkbox)
    const trainingInterestsChecked = document.querySelectorAll('input[name="trainingInterests"]:checked');
    if (trainingInterestsChecked.length > 0) completedPoints++;
    
    // 10. Contact (nom et email remplis pour la relance)
    const contactName = document.getElementById("name").value.trim();
    const contactEmail = document.getElementById("email").value.trim();
    if (contactName.length > 0 || contactEmail.length > 0) completedPoints++;

    // Calculate percentage
    const percent = Math.round((completedPoints / totalPoints) * 100);
    progressBar.style.width = `${percent}%`;
    progressPercentText.textContent = `${percent}%`;
  }

  // Listen to keyups on text inputs to update progress bar dynamically
  const textInputs = ["company", "position", "name", "email"];
  textInputs.forEach(id => {
    document.getElementById(id).addEventListener("input", updateProgress);
  });
  
  const selectInputs = ["sector", "size"];
  selectInputs.forEach(id => {
    document.getElementById(id).addEventListener("change", updateProgress);
  });

  // --- Form Submission ---
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // 1. Client-side Validation check
    const requiredFields = [
      { id: "company", label: "Nom de l'entreprise" },
      { id: "position", label: "Votre fonction" },
      { id: "sector", label: "Secteur d'activité" },
      { id: "size", label: "Taille de l'entreprise" }
    ];

    let firstErrorField = null;

    // Check simple text/select required inputs
    for (const field of requiredFields) {
      const el = document.getElementById(field.id);
      if (!el.value || el.value.trim() === "") {
        el.style.borderColor = "#EF4444";
        if (!firstErrorField) firstErrorField = el;
      } else {
        el.style.borderColor = "";
      }
    }

    // Check cybersecurity rating (required)
    if (currentCybersecurityRating === 0) {
      starsLegend.style.color = "#EF4444";
      starsLegend.textContent = "Veuillez évaluer votre niveau de cybersécurité.";
      starsLegend.style.fontWeight = "bold";
      if (!firstErrorField) firstErrorField = starsContainer;
    }

    // Check AI usage radio buttons group (required)
    const aiUsageChecked = document.querySelector('input[name="aiUsage"]:checked');
    if (!aiUsageChecked) {
      const radioLabels = document.querySelectorAll(".radio-label");
      radioLabels.forEach(lbl => lbl.style.borderColor = "#EF4444");
      if (!firstErrorField) firstErrorField = radioLabels[0];
    } else {
      document.querySelectorAll(".radio-label").forEach(lbl => lbl.style.borderColor = "");
    }

    // If validation fails, scroll to the first element and stop
    if (firstErrorField) {
      firstErrorField.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => {
        if (typeof firstErrorField.focus === "function") {
          firstErrorField.focus();
        }
      }, 500);
      return;
    }

    // Verify email format if entered
    const emailVal = document.getElementById("email").value.trim();
    if (emailVal.length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailVal)) {
        const emailInput = document.getElementById("email");
        emailInput.style.borderColor = "#EF4444";
        emailInput.scrollIntoView({ behavior: "smooth", block: "center" });
        emailInput.focus();
        alert("Veuillez saisir une adresse email professionnelle valide.");
        return;
      }
    }

    // 2. Gather values from checkboxes and input fields
    // Challenges
    const challengesList = [];
    document.querySelectorAll('input[name="challenges"]:checked').forEach(cb => {
      if (cb.value === "Autre") {
        const val = challengeOtherText.value.trim();
        challengesList.push(val ? `Autre: ${val}` : "Autre");
      } else {
        challengesList.push(cb.value);
      }
    });

    // Incidents
    const incidentsList = [];
    document.querySelectorAll('input[name="incidents"]:checked').forEach(cb => {
      incidentsList.push(cb.value);
    });

    // Automation Tasks
    const automationList = [];
    document.querySelectorAll('input[name="automationTasks"]:checked').forEach(cb => {
      if (cb.value === "Autre") {
        const val = automationOtherText.value.trim();
        automationList.push(val ? `Autre: ${val}` : "Autre");
      } else {
        automationList.push(cb.value);
      }
    });

    // Training interests
    const trainingList = [];
    document.querySelectorAll('input[name="trainingInterests"]:checked').forEach(cb => {
      trainingList.push(cb.value);
    });

    // Service interests
    const serviceList = [];
    document.querySelectorAll('input[name="serviceInterests"]:checked').forEach(cb => {
      serviceList.push(cb.value);
    });

    // Create the final data payload
    const payload = {
      company: document.getElementById("company").value.trim(),
      position: document.getElementById("position").value.trim(),
      sector: document.getElementById("sector").value,
      size: document.getElementById("size").value,
      challenges: challengesList.join(", "),
      incidents: incidentsList.join(", "),
      cybersecurity: currentCybersecurityRating,
      aiUsage: document.querySelector('input[name="aiUsage"]:checked').value,
      automationTasks: automationList.join(", "),
      trainingInterests: trainingList.join(", "),
      improvements: document.getElementById("improvements").value.trim(),
      obstacles: document.getElementById("obstacles").value.trim(),
      serviceInterests: serviceList.join(", "),
      name: document.getElementById("name").value.trim(),
      email: emailVal,
      phone: document.getElementById("phone").value.trim(),
      contactConsent: document.getElementById("contactConsent").checked
    };

    // 3. Set UI submitting state
    submitBtn.disabled = true;
    submitBtn.classList.add("loading");

    // 4. Send API request to Google Apps Script Web App
    try {
      // We send it using text/plain to avoid preflight CORS restrictions in Apps Script.
      const response = await fetch(SCRIPT_URL, {
        method: "POST",
        mode: "cors", // Ask browser to support cross-origin requests
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result && result.success) {
        handleSuccess();
      } else {
        throw new Error(result ? result.error : "Unknown backend response");
      }

    } catch (err) {
      console.error("Submission Error Details: ", err);
      
      // Fallback: If it's a CORS issue but we suspect the request might have gone through anyway,
      // or if it fails completely, we notify the user.
      // In many web-app configurations, the POST goes through successfully even if the browser throws a CORS read exception.
      // However, to make it completely robust, if the script fails, we check network issues.
      alert("Une erreur s'est produite lors de l'envoi de votre questionnaire.\nSi le problème persiste, veuillez contacter directement contact@xyberclan.com.");
      
      // Reset button state
      submitBtn.disabled = false;
      submitBtn.classList.remove("loading");
    }
  });

  function handleSuccess() {
    // Hide form & display beautiful success message card
    mainContent.classList.add("hidden");
    successMessage.classList.remove("hidden");
    
    // Smoothly scroll back to top of container
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }
});