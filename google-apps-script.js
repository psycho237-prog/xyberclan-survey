// Script pour Google Sheets (Google Apps Script)
// 1. Ouvrez un nouveau Google Sheet.
// 2. Allez dans Extensions > Apps Script.
// 3. Collez ce code en remplaçant le contenu de Code.gs.
// 4. Cliquez sur Déployer > Nouvelle ligne de déploiement.
// 5. Choisissez "Application Web".
// 6. Accès: "Tous ceux qui ont le lien".
// 7. Copiez l'URL générée et collez-la dans le fichier script.js (GOOGLE_SCRIPT_URL).

const SHEET_NAME = "Réponses"; // Nom de la feuille de calcul

function setup() {
  const doc = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = doc.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = doc.insertSheet(SHEET_NAME);
  }
  
  // En-têtes (Assurez-vous qu'ils correspondent aux 'name' du HTML)
  const headers = [
    "Date",
    "Nom de l'entreprise",
    "Secteur d'activité",
    "Taille de l'entreprise",
    "Fonction",
    "Défis rencontrés",
    "Priorités",
    "Incidents Cybersécurité",
    "Maturité Sécurité",
    "Utilisation IA",
    "Outils IA",
    "Processus à automatiser",
    "Besoins en formation",
    "Lacunes compétences",
    "Suggestions",
    "Intérêt Services XYBERCLAN",
    "Nom contact",
    "Email contact",
    "Téléphone",
    "Consentement"
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
}

function doPost(e) {
  try {
    const doc = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = doc.getSheetByName(SHEET_NAME);
    
    // Si la feuille n'existe pas, on tente de la créer (bien que setup() devrait le faire)
    if (!sheet) {
      sheet = doc.insertSheet(SHEET_NAME);
    }
    
    // Parse les données JSON reçues (mode 'no-cors' envoie souvent du texte simple qu'il faut parser)
    let data;
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else {
      data = e.parameter;
    }

    const timestamp = new Date();
    
    // Création de la ligne dans le même ordre que les en-têtes
    const row = [
      timestamp,
      data.companyName || "",
      data.industry || "",
      data.companySize || "",
      data.role || "",
      data.challenges || "",
      data.priorities || "",
      data.cyberIncidents || "",
      data.securityMaturity || "",
      data.aiUsage || "",
      data.aiTools || "",
      data.processesToAutomate || "",
      data.trainingNeeds || "",
      data.skillGaps || "",
      data.suggestions || "",
      data.xyberclanServices || "",
      data.contactName || "",
      data.contactEmail || "",
      data.contactPhone || "",
      data.consent === "on" || data.consent === true ? "Oui" : "Non"
    ];
    
    sheet.appendRow(row);
    
    return ContentService
      .createTextOutput(JSON.stringify({ "result": "success", "row": sheet.getLastRow() }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch(error) {
    return ContentService
      .createTextOutput(JSON.stringify({ "result": "error", "error": error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Optionnel: Gérer les requêtes GET pour tester si l'URL fonctionne
function doGet(e) {
  return ContentService.createTextOutput("Le Web App Google Apps Script fonctionne !");
}
