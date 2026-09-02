"use strict";

// ==================================================
// CONFIGURATION
// ==================================================
const STORAGE_COURSES = "studyCourses";
const STORAGE_SESSIONS = "studySessions";
const STORAGE_QUIZZES = "studyQuizzes";

// ==================================================
// INITIALISATION
// ==================================================
document.addEventListener("DOMContentLoaded", () => {
    console.log("🎓 Study webMCP démarré.");
    initializeApplication();
});

function initializeApplication() {
    initializeButtons();
    initializeCourseForm();
    initializeSearch();
    loadCourses();
    updateStatistics();
    updateProgress();
}

// ==================================================
// RÉCUPÉRER LES COURS
// ==================================================
function getCourses() {
    try {
        const data = localStorage.getItem(STORAGE_COURSES);
        if (!data) return [];
        const courses = JSON.parse(data);
        return Array.isArray(courses) ? courses : [];
    } catch (error) {
        console.error("Erreur lors de la récupération des cours :", error);
        return [];
    }
}

// ==================================================
// SAUVEGARDER LES COURS
// ==================================================
function saveCourses(courses) {
    try {
        localStorage.setItem(STORAGE_COURSES, JSON.stringify(courses));
        return true;
    } catch (error) {
        console.error("Erreur lors de la sauvegarde :", error);
        alert("Impossible de sauvegarder les données.");
        return false;
    }
}

// ==================================================
// INITIALISER LES BOUTONS
// ==================================================
function initializeButtons() {
    const startStudyBtn = document.getElementById("startStudyBtn");
    const addCourseBtn = document.getElementById("addCourseBtn");
    const newCourseBtn = document.getElementById("newCourseBtn");
    const closeModalBtn = document.getElementById("closeModalBtn");
    const cancelCourseBtn = document.getElementById("cancelCourseBtn");
    const generatePlanBtn = document.getElementById("generatePlanBtn");
    const generateQuizBtn = document.getElementById("generateQuizBtn");

    if (startStudyBtn) {
        startStudyBtn.addEventListener("click", () => {
            document.getElementById("courses")?.scrollIntoView({ behavior: "smooth" });
        });
    }
    if (addCourseBtn) addCourseBtn.addEventListener("click", openAddCourseModal);
    if (newCourseBtn) newCourseBtn.addEventListener("click", openAddCourseModal);
    if (closeModalBtn) closeModalBtn.addEventListener("click", closeCourseModal);
    if (cancelCourseBtn) cancelCourseBtn.addEventListener("click", closeCourseModal);
    if (generatePlanBtn) generatePlanBtn.addEventListener("click", generateStudyPlan);
    if (generateQuizBtn) generateQuizBtn.addEventListener("click", openQuizGenerator);
}

// ==================================================
// MODAL
// ==================================================
function openAddCourseModal() {
    const modal = document.getElementById("courseModal");
    const form = document.getElementById("courseForm");
    const modalTitle = document.getElementById("modalTitle");

    if (!modal || !form) return;
    form.reset();

    const courseId = document.getElementById("courseId");
    if (courseId) courseId.value = "";
    if (modalTitle) modalTitle.textContent = "Ajouter un cours";

    modal.style.display = "flex";
}

function closeCourseModal() {
    const modal = document.getElementById("courseModal");
    if (modal) modal.style.display = "none";
}

// ==================================================
// FORMULAIRE COURS
// ==================================================
function initializeCourseForm() {
    const form = document.getElementById("courseForm");
    if (form) form.addEventListener("submit", handleCourseSubmit);
}

// ==================================================
// AJOUT / MODIFICATION
// ==================================================
function handleCourseSubmit(event) {
    event.preventDefault();

    const id = document.getElementById("courseId")?.value || "";
    const title = document.getElementById("courseTitle")?.value.trim() || "";
    const subject = document.getElementById("courseSubject")?.value.trim() || "";
    const level = document.getElementById("courseLevel")?.value || "";
    const description = document.getElementById("courseDescription")?.value.trim() || "";
    const examDate = document.getElementById("courseExamDate")?.value || "";

    if (!title) { alert("Veuillez entrer le titre du cours."); return; }
    if (!subject) { alert("Veuillez entrer la matière."); return; }
    if (!level) { alert("Veuillez sélectionner le niveau."); return; }

    let courses = getCourses();

    if (id) {
        const index = courses.findIndex(course => course.id === id);
        if (index !== -1) {
            courses[index] = {
                ...courses[index],
                title, subject, level, description, examDate,
                updatedAt: new Date().toISOString()
            };
        }
    } else {
        const now = new Date().toISOString();
        const newCourse = {
            id: generateId(),
            title, subject, level, description, examDate,
            progress: 0,
            createdAt: now, updatedAt: now
        };
        courses.push(newCourse);
    }

    if (saveCourses(courses)) {
        closeCourseModal();
        loadCourses();
        updateStatistics();
        updateProgress();
        alert("✅ Cours enregistré avec succès !");
    }
}

// ==================================================
// IDENTIFIANT UNIQUE
// ==================================================
function generateId() {
    return (Date.now().toString(36) + Math.random().toString(36).substring(2, 9));
}

// ==================================================
// AFFICHER LES COURS
// ==================================================
function loadCourses() {
    const courses = getCourses();
    const searchInput = document.getElementById("searchCourseInput");
    const filterSubject = document.getElementById("filterSubject");

    const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : "";
    const selectedSubject = filterSubject ? filterSubject.value : "";

    const filteredCourses = courses.filter(course => {
        const title = String(course.title || "").toLowerCase();
        const subject = String(course.subject || "").toLowerCase();
        const description = String(course.description || "").toLowerCase();

        const matchesSearch = title.includes(searchTerm) || subject.includes(searchTerm) || description.includes(searchTerm);
        const matchesSubject = !selectedSubject || course.subject === selectedSubject;

        return matchesSearch && matchesSubject;
    });

    displayCourses(filteredCourses);
    updateSubjectFilter(courses);
}

// ==================================================
// AFFICHAGE DES CARTES
// ==================================================
function displayCourses(courses) {
    const container = document.getElementById("courseList");
    if (!container) return;

    if (courses.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column:1/-1;">
                <div class="empty-icon">📖</div>
                <h3>Aucun cours trouvé</h3>
                <p>Ajoute un cours pour commencer ton apprentissage.</p>
                <button class="primary-btn" type="button" onclick="openAddCourseModal()">+ Ajouter un cours</button>
            </div>
        `;
        return;
    }

    container.innerHTML = courses.map(createCourseCard).join("");
    addCourseCardEvents();
}

// ==================================================
// CARTE D'UN COURS
// ==================================================
function createCourseCard(course) {
    const safeTitle = escapeHTML(course.title);
    const safeSubject = escapeHTML(course.subject);
    const safeLevel = escapeHTML(course.level);
    const safeDescription = escapeHTML(course.description || "Aucune description.");
    const exam = course.examDate ? formatDate(course.examDate) : "Non définie";
    const progress = Math.max(0, Math.min(100, Number(course.progress || 0)));
    const safeId = escapeHTML(course.id);

    return `
        <article class="stat-card course-card" data-course-id="${safeId}" style="text-align:left; position:relative;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px;">
                <div style="font-size:35px;">📚</div>
                <span style="background:#eef2ff; color:#4f46e5; padding:5px 9px; border-radius:20px; font-size:11px; font-weight:bold;">${safeLevel}</span>
            </div>
            <h3 style="margin-top:15px; font-size:20px;">${safeTitle}</h3>
            <p style="color:#4f46e5; font-weight:bold; margin-top:5px;">${safeSubject}</p>
            <p style="color:#64748b; font-size:14px; margin-top:10px; min-height:45px;">${safeDescription}</p>
            <div style="margin-top:18px; padding-top:15px; border-top:1px solid #eef2f7;">
                <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:7px;">
                    <span>Progression</span>
                    <strong>${progress}%</strong>
                </div>
                <div style="height:8px; background:#e5e7eb; border-radius:20px; overflow:hidden;">
                    <div style="width:${progress}%; height:100%; background:#4f46e5;"></div>
                </div>
            </div>
            <div style="margin-top:15px; font-size:12px; color:#64748b;">📅 Examen : <strong>${exam}</strong></div>
            <div style="display:flex; gap:8px; margin-top:18px;">
                <button class="secondary-btn edit-course-btn" data-id="${safeId}" type="button" style="flex:1;">✏️ Modifier</button>
                <button class="delete-course-btn" data-id="${safeId}" type="button" style="flex:1; border:none; padding:10px; border-radius:10px; cursor:pointer; background:#fee2e2; color:#b91c1c; font-weight:bold;">🗑️ Supprimer</button>
            </div>
        </article>
    `;
}

// ==================================================
// ÉVÉNEMENTS DES CARTES
// ==================================================
function addCourseCardEvents() {
    const editButtons = document.querySelectorAll(".edit-course-btn");
    const deleteButtons = document.querySelectorAll(".delete-course-btn");

    editButtons.forEach(button => {
        button.addEventListener("click", () => editCourse(button.dataset.id));
    });

    deleteButtons.forEach(button => {
        button.addEventListener("click", () => deleteCourse(button.dataset.id));
    });
}

// ==================================================
// MODIFIER UN COURS
// ==================================================
function editCourse(id) {
    const courses = getCourses();
    const course = courses.find(item => item.id === id);
    if (!course) { alert("Cours introuvable."); return; }

    document.getElementById("courseId").value = course.id;
    document.getElementById("courseTitle").value = course.title;
    document.getElementById("courseSubject").value = course.subject;
    document.getElementById("courseLevel").value = course.level;
    document.getElementById("courseDescription").value = course.description || "";
    document.getElementById("courseExamDate").value = course.examDate || "";
    document.getElementById("modalTitle").textContent = "Modifier le cours";
    document.getElementById("courseModal").style.display = "flex";
}

// ==================================================
// SUPPRIMER UN COURS
// ==================================================
function deleteCourse(id) {
    const courses = getCourses();
    const course = courses.find(item => item.id === id);
    if (!course) return;

    if (!confirm(`Voulez-vous vraiment supprimer le cours "${course.title}" ?`)) return;

    const updatedCourses = courses.filter(item => item.id !== id);
    if (saveCourses(updatedCourses)) {
        loadCourses();
        updateStatistics();
        updateProgress();
        alert("🗑️ Cours supprimé.");
    }
}

// ==================================================
// RECHERCHE
// ==================================================
function initializeSearch() {
    const searchInput = document.getElementById("searchCourseInput");
    const filterSubject = document.getElementById("filterSubject");

    if (searchInput) searchInput.addEventListener("input", loadCourses);
    if (filterSubject) filterSubject.addEventListener("change", loadCourses);
}

// ==================================================
// FILTRE DES MATIÈRES
// ==================================================
function updateSubjectFilter(courses) {
    const select = document.getElementById("filterSubject");
    if (!select) return;

    const currentValue = select.value;
    const subjects = [...new Set(courses.map(course => course.subject).filter(Boolean))].sort((a, b) => a.localeCompare(b, "fr"));

    select.innerHTML = `<option value="">Toutes les matières</option>`;
    subjects.forEach(subject => {
        const option = document.createElement("option");
        option.value = subject;
        option.textContent = subject;
        select.appendChild(option);
    });

    if (subjects.includes(currentValue)) select.value = currentValue;
}

// ==================================================
// STATISTIQUES
// ==================================================
function updateStatistics() {
    const courses = getCourses();
    const sessions = getStorageArray(STORAGE_SESSIONS);
    const quizzes = getStorageArray(STORAGE_QUIZZES);

    const courseCount = document.getElementById("courseCount");
    const studySessions = document.getElementById("studySessions");
    const quizCount = document.getElementById("quizCount");

    if (courseCount) courseCount.textContent = courses.length;
    if (studySessions) studySessions.textContent = sessions.length;
    if (quizCount) quizCount.textContent = quizzes.length;

    updateProgress();
}

// ==================================================
// LOCALSTORAGE TABLEAU
// ==================================================
function getStorageArray(key) {
    try {
        const data = localStorage.getItem(key);
        if (!data) return [];
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error(`Erreur localStorage (${key}) :`, error);
        return [];
    }
}

// ==================================================
// PROGRESSION
// ==================================================
function updateProgress() {
    const courses = getCourses();
    let progress = 0;

    if (courses.length > 0) {
        const total = courses.reduce((sum, course) => {
            return sum + Math.max(0, Math.min(100, Number(course.progress || 0)));
        }, 0);
        progress = Math.round(total / courses.length);
    }

    const progressValue = document.getElementById("progressValue");
    const progressText = document.getElementById("progressText");
    const progressBar = document.getElementById("progressBar");

    if (progressValue) progressValue.textContent = `${progress}%`;
    if (progressText) progressText.textContent = `${progress}%`;
    if (progressBar) progressBar.style.width = `${progress}%`;
}

// ==================================================
// PLAN D'ÉTUDE
// ==================================================
function generateStudyPlan() {
    const courses = getCourses();
    const container = document.getElementById("studyPlan");
    if (!container) return;

    if (courses.length === 0) {
        alert("📚 Ajoute d'abord au moins un cours.");
        return;
    }

    const sortedCourses = [...courses].sort((a, b) => {
        if (!a.examDate) return 1;
        if (!b.examDate) return -1;
        return new Date(a.examDate) - new Date(b.examDate);
    });

    container.innerHTML = `
        <div style="display:grid; gap:15px;">
            ${sortedCourses.map((course, index) => `
                <div style="background:white; padding:20px; border-radius:14px; display:flex; gap:15px; align-items:center; box-shadow:0 5px 20px rgba(0,0,0,0.05);">
                    <div style="width:45px; height:45px; flex-shrink:0; border-radius:50%; background:#eef2ff; display:flex; align-items:center; justify-content:center; font-weight:bold; color:#4f46e5;">
                        ${index + 1}
                    </div>
                    <div>
                        <strong>${escapeHTML(course.title)}</strong>
                        <p style="color:#64748b; font-size:13px; margin-top:3px;">
                            ${escapeHTML(course.subject)}
                            ${course.examDate ? ` — Examen le ${formatDate(course.examDate)}` : ""}
                        </p>
                    </div>
                </div>
            `).join("")}
        </div>
    `;
}

// ==================================================
// QUIZ — OUVRIR LE GÉNÉRATEUR
// ==================================================
function openQuizGenerator() {
    const courses = getCourses();
    const container = document.getElementById("quizContainer");
    if (!container) return;

    if (courses.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📚</div>
                <h3>Aucun cours disponible</h3>
                <p>Ajoute d'abord un cours pour créer un quiz.</p>
                <button class="primary-btn" type="button" onclick="openAddCourseModal()" style="margin-top:15px;">+ Ajouter un cours</button>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div style="background:white; padding:30px; border-radius:18px; box-shadow:0 8px 30px rgba(0,0,0,0.06);">
            <h3 style="margin-bottom:10px;">🧠 Créer un quiz</h3>
            <p style="color:#64748b; margin-bottom:20px;">Sélectionne le cours sur lequel tu veux être évalué.</p>
            <select id="quizCourseSelect" style="width:100%; padding:13px; border:1px solid #dbe1ea; border-radius:10px; background:white; margin-bottom:15px;">
                <option value="">Sélectionner un cours</option>
                ${courses.map(course => `<option value="${escapeHTML(course.id)}">${escapeHTML(course.title)} — ${escapeHTML(course.subject)}</option>`).join("")}
            </select>
            <div style="display:flex; gap:10px; flex-wrap:wrap;">
                <button id="startQuizBtn" class="primary-btn" type="button">🚀 Commencer le quiz</button>
                <button id="cancelQuizBtn" class="secondary-btn" type="button">Annuler</button>
            </div>
        </div>
    `;

    const startQuizBtn = document.getElementById("startQuizBtn");
    const cancelQuizBtn = document.getElementById("cancelQuizBtn");

    if (startQuizBtn) startQuizBtn.addEventListener("click", startQuiz);
    if (cancelQuizBtn) cancelQuizBtn.addEventListener("click", resetQuizContainer);
}

// ==================================================
// RÉINITIALISER LE QUIZ
// ==================================================
function resetQuizContainer() {
    const container = document.getElementById("quizContainer");
    if (!container) return;
    container.innerHTML = `
        <div class="empty-state">
            <div class="empty-icon">🧠</div>
            <h3>Teste tes connaissances</h3>
            <p>Clique sur « Générer un quiz » pour commencer.</p>
        </div>
    `;
}

// ==================================================
// DÉMARRER LE QUIZ
// ==================================================
function startQuiz() {
    const select = document.getElementById("quizCourseSelect");
    if (!select || !select.value) { alert("⚠️ Sélectionne d'abord un cours."); return; }

    const courses = getCourses();
    const course = courses.find(item => item.id === select.value);
    if (!course) { alert("❌ Cours introuvable."); return; }

    const questions = generateQuizQuestions(course);
    displayQuiz(course, questions);
}

// ==================================================
// GÉNÉRER LES QUESTIONS
// ==================================================
function generateQuizQuestions(course) {
    const questions = [];

    questions.push({
        question: "Quel est le titre du cours étudié ?",
        answers: [course.title, course.subject, "Aucun titre", "Cours général"],
        correct: 0
    });

    questions.push({
        question: "À quelle matière appartient ce cours ?",
        answers: [course.subject, "Mathématiques", "Informatique", "Histoire"],
        correct: 0
    });

    if (course.level) {
        questions.push({
            question: "Quel est le niveau indiqué pour ce cours ?",
            answers: [course.level, "Débutant", "Intermédiaire", "Avancé"],
            correct: 0
        });
    }

    if (course.examDate) {
        questions.push({
            question: "Une date d'examen est-elle définie pour ce cours ?",
            answers: ["Oui", "Non", "Je ne sais pas", "Aucune information"],
            correct: 0
        });
    }

    const description = String(course.description || "").trim();
    if (description) {
        const words = description.split(/\s+/).map(word => word.replace(/[.,;:!?()[\]{}"']/g, "")).filter(word => word.length > 4);
        const uniqueWords = [...new Set(words)];
        if (uniqueWords.length > 0) {
            const word = uniqueWords[0];
            questions.push({
                question: `Le contenu du cours contient notamment le terme « ${word} ». Lequel est présent dans le contenu ?`,
                answers: [word, "Inconnu", "Sans rapport", "Aucune réponse"],
                correct: 0
            });
        }
    }

    return questions.slice(0, 5);
}

// ==================================================
// AFFICHER LE QUIZ
// ==================================================
function displayQuiz(course, questions) {
    const container = document.getElementById("quizContainer");
    if (!container) return;

    container.innerHTML = `
        <div style="background:white; padding:30px; border-radius:18px; box-shadow:0 8px 30px rgba(0,0,0,0.06);">
            <div style="display:flex; justify-content:space-between; gap:15px; flex-wrap:wrap; margin-bottom:25px;">
                <div>
                    <p style="color:#4f46e5; font-size:12px; font-weight:bold;">🧠 QUIZ</p>
                    <h3>${escapeHTML(course.title)}</h3>
                </div>
                <span style="background:#eef2ff; color:#4f46e5; padding:7px 12px; border-radius:20px; font-weight:bold; font-size:13px;">${questions.length} questions</span>
            </div>
            <form id="quizForm">
                ${questions.map((question, index) => `
                    <div style="padding:20px; border:1px solid #e5e7eb; border-radius:14px; margin-bottom:18px;">
                        <h4 style="margin-bottom:15px;">${index + 1}. ${escapeHTML(question.question)}</h4>
                        ${question.answers.map((answer, answerIndex) => `
                            <label style="display:block; padding:11px; margin-bottom:8px; border:1px solid #e5e7eb; border-radius:10px; cursor:pointer;">
                                <input type="radio" name="question-${index}" value="${answerIndex}">
                                ${escapeHTML(answer)}
                            </label>
                        `).join("")}
                    </div>
                `).join("")}
                <button type="submit" class="primary-btn">✅ Terminer le quiz</button>
            </form>
        </div>
    `;

    const form = document.getElementById("quizForm");
    if (form) {
        form.addEventListener("submit", event => {
            event.preventDefault();
            calculateQuizResult(course, questions, form);
        });
    }
}

// ==================================================
// CALCUL DU SCORE
// ==================================================
function calculateQuizResult(course, questions, form) {
    let score = 0;
    questions.forEach((question, index) => {
        const selected = form.querySelector(`input[name="question-${index}"]:checked`);
        if (selected && Number(selected.value) === question.correct) {
            score++;
        }
    });

    const percentage = Math.round((score / questions.length) * 100);
    saveQuizResult(course, score, questions.length, percentage);
    displayQuizResult(course, score, questions.length, percentage);
    updateStatistics();
}

// ==================================================
// SAUVEGARDER LE RÉSULTAT
// ==================================================
function saveQuizResult(course, score, total, percentage) {
    const quizzes = getStorageArray(STORAGE_QUIZZES);
    quizzes.push({
        id: generateId(),
        courseId: course.id,
        courseTitle: course.title,
        score, total, percentage,
        date: new Date().toISOString()
    });
    try {
        localStorage.setItem(STORAGE_QUIZZES, JSON.stringify(quizzes));
    } catch (error) {
        console.error("Erreur lors de l'enregistrement du quiz :", error);
    }
}

// ==================================================
// AFFICHER LE RÉSULTAT
// ==================================================
function displayQuizResult(course, score, total, percentage) {
    const container = document.getElementById("quizContainer");
    if (!container) return;

    let message = "📚 Continue tes révisions !";
    if (percentage >= 80) message = "🎉 Excellent travail !";
    else if (percentage >= 60) message = "👏 Très bon travail !";
    else if (percentage >= 40) message = "📖 Encore un petit effort !";

    container.innerHTML = `
        <div class="empty-state" style="border:2px solid #c7d2fe;">
            <div style="font-size:60px; margin-bottom:15px;">🧠</div>
            <h3>${message}</h3>
            <p style="font-size:20px; font-weight:bold; color:#4f46e5; margin-top:10px;">${score} / ${total}</p>
            <p>Score : ${percentage}%</p>
            <div style="margin-top:20px; height:12px; background:#e5e7eb; border-radius:20px; overflow:hidden;">
                <div style="width:${percentage}%; height:100%; background:#4f46e5;"></div>
            </div>
            <div style="display:flex; justify-content:center; gap:10px; flex-wrap:wrap; margin-top:25px;">
                <button class="primary-btn" type="button" onclick="openQuizGenerator()">🔄 Refaire un quiz</button>
                <button class="secondary-btn" type="button" onclick="resetQuizContainer()">Fermer</button>
            </div>
        </div>
    `;
}

// ==================================================
// FORMATAGE DATE
// ==================================================
function formatDate(dateString) {
    if (!dateString) return "Non définie";
    const date = new Date(`${dateString}T00:00:00`);
    if (Number.isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

// ==================================================
// PROTECTION HTML
// ==================================================
function escapeHTML(value) {
    return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

// ==================================================
// FERMETURE DU MODAL
// ==================================================
window.addEventListener("click", event => {
    const modal = document.getElementById("courseModal");
    if (event.target === modal) closeCourseModal();
});

// ==================================================
// EXPOSER LES FONCTIONS
// ==================================================
window.openAddCourseModal = openAddCourseModal;
window.editCourse = editCourse;
window.deleteCourse = deleteCourse;
window.generateStudyPlan = generateStudyPlan;
window.openQuizGenerator = openQuizGenerator;
window.resetQuizContainer = resetQuizContainer;

// ==================================================
// 🤖 INTÉGRATION WEBMCP (POUR L'AGENT IA)
// ==================================================
function setupWebMCP() {
    if (typeof window.webmcp !== 'undefined' && typeof window.webmcp.registerTool === 'function') {
        console.log("🍏 WebMCP Activé : Outils enregistrés pour l'agent IA.");

        window.webmcp.registerTool({
            name: "get_courses",
            description: "Récupère la liste de tous les cours actuels de l'étudiant.",
            parameters: { type: "object", properties: {} },
            execute: async () => {
                return { success: true, courses: getCourses() };
            }
        });

        window.webmcp.registerTool({
            name: "add_course",
            description: "Ajoute automatiquement un nouveau cours au programme.",
            parameters: {
                type: "object",
                properties: {
                    title: { type: "string" },
                    subject: { type: "string" },
                    level: { type: "string", description: "Débutant, Intermédiaire, Avancé" },
                    description: { type: "string" }
                },
                required: ["title", "subject", "level"]
            },
            execute: async (args) => {
                const courses = getCourses();
                const newCourse = {
                    id: generateId(),
                    title: args.title, subject: args.subject, level: args.level, description: args.description || "",
                    examDate: "", progress: 0,
                    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
                };
                courses.push(newCourse);
                saveCourses(courses);
                loadCourses();
                updateStatistics();
                return { success: true, message: `Le cours '${args.title}' a été ajouté.` };
            }
        });

        window.webmcp.registerTool({
            name: "generate_study_plan",
            description: "Génère et affiche le plan d'étude.",
            parameters: { type: "object", properties: {} },
            execute: async () => {
                generateStudyPlan();
                return { success: true, message: "Le plan d'étude a été généré." };
            }
        });

        window.webmcp.registerTool({
            name: "open_quiz_interface",
            description: "Ouvre l'interface de quiz.",
            parameters: { type: "object", properties: {} },
            execute: async () => {
                openQuizGenerator();
                return { success: true, message: "L'interface du quiz est ouverte." };
            }
        });
    }
}
setTimeout(setupWebMCP, 500);
