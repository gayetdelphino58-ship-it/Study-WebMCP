"use strict";

/*
=========================================================
 STUDY webMCP
 Assistant d'étude intelligent

 VERSION : WebMCP + Application complète

 Fonctionnalités :
 - Ajouter un cours
 - Modifier un cours
 - Supprimer un cours
 - Rechercher un cours
 - Filtrer par matière
 - Sauvegarder dans localStorage
 - Restaurer automatiquement les cours
 - Statistiques
 - Progression
 - Plan d'étude
 - Quiz
 - WebMCP pour permettre à un agent IA
   d'interagir avec l'application
=========================================================
*/


/* ======================================================
   STOCKAGE
====================================================== */

const COURSES_KEY = "studyCourses";
const SESSIONS_KEY = "studySessions";
const QUIZZES_KEY = "studyQuizzes";


/* ======================================================
   DONNÉES
====================================================== */

let courses = [];
let studySessions = [];
let quizzes = [];


/* ======================================================
   INITIALISATION
====================================================== */

document.addEventListener("DOMContentLoaded", function () {

    loadData();

    initializeApplication();

    setupWebMCP();

});


/* ======================================================
   CHARGEMENT DES DONNÉES
====================================================== */

function loadData() {

    try {

        const savedCourses = localStorage.getItem(COURSES_KEY);

        const savedSessions = localStorage.getItem(SESSIONS_KEY);

        const savedQuizzes = localStorage.getItem(QUIZZES_KEY);


        courses = savedCourses
            ? JSON.parse(savedCourses)
            : [];

        studySessions = savedSessions
            ? JSON.parse(savedSessions)
            : [];

        quizzes = savedQuizzes
            ? JSON.parse(savedQuizzes)
            : [];


        if (!Array.isArray(courses)) {
            courses = [];
        }

        if (!Array.isArray(studySessions)) {
            studySessions = [];
        }

        if (!Array.isArray(quizzes)) {
            quizzes = [];
        }

    } catch (error) {

        console.error(
            "Erreur lors du chargement des données :",
            error
        );

        courses = [];
        studySessions = [];
        quizzes = [];
    }
}


/* ======================================================
   SAUVEGARDE
====================================================== */

function saveCourses() {

    localStorage.setItem(
        COURSES_KEY,
        JSON.stringify(courses)
    );
}


function saveSessions() {

    localStorage.setItem(
        SESSIONS_KEY,
        JSON.stringify(studySessions)
    );
}


function saveQuizzes() {

    localStorage.setItem(
        QUIZZES_KEY,
        JSON.stringify(quizzes)
    );
}


/* ======================================================
   INITIALISATION DE L'APPLICATION
====================================================== */

function initializeApplication() {

    setupCourseForm();

    setupModal();

    renderCourses();

    updateStatistics();

    generateStudyPlan();

    renderProgress();

}


/* ======================================================
   MODALE
====================================================== */

function setupModal() {

    const closeModalBtn =
        document.getElementById("closeModalBtn");

    const cancelCourseBtn =
        document.getElementById("cancelCourseBtn");


    if (closeModalBtn) {

        closeModalBtn.addEventListener(
            "click",
            closeCourseModal
        );
    }


    if (cancelCourseBtn) {

        cancelCourseBtn.addEventListener(
            "click",
            closeCourseModal
        );
    }
}


function openCourseModal(course = null) {

    const modal =
        document.getElementById("courseModal");

    const form =
        document.getElementById("courseForm");

    const modalTitle =
        document.getElementById("modalTitle");


    if (!modal) return;


    if (form) {
        form.reset();
    }


    if (course) {

        if (modalTitle) {
            modalTitle.textContent =
                "Modifier le cours";
        }

        setInputValue("courseId", course.id);
        setInputValue("courseTitle", course.title);
        setInputValue("courseSubject", course.subject);
        setInputValue("courseLevel", course.level);
        setInputValue(
            "courseDescription",
            course.description
        );
        setInputValue(
            "courseExamDate",
            course.examDate
        );

    } else {

        if (modalTitle) {
            modalTitle.textContent =
                "Ajouter un cours";
        }

        setInputValue("courseId", "");

    }


    modal.style.display = "flex";
}


function closeCourseModal() {

    const modal =
        document.getElementById("courseModal");

    if (modal) {
        modal.style.display = "none";
    }
}


function setInputValue(id, value) {

    const element =
        document.getElementById(id);

    if (element) {
        element.value = value || "";
    }
}


/* ======================================================
   FORMULAIRE COURS
====================================================== */

function setupCourseForm() {

    const form =
        document.getElementById("courseForm");


    if (!form) return;


    form.addEventListener("submit", function (event) {

        event.preventDefault();

        const id =
            document.getElementById("courseId")?.value.trim();

        const title =
            document.getElementById("courseTitle")?.value.trim();

        const subject =
            document.getElementById("courseSubject")?.value.trim();

        const level =
            document.getElementById("courseLevel")?.value.trim();

        const description =
            document.getElementById("courseDescription")?.value.trim();

        const examDate =
            document.getElementById("courseExamDate")?.value;


        if (!title || !subject) {

            alert(
                "Veuillez renseigner au minimum le titre et la matière."
            );

            return;
        }


        if (id) {

            const index =
                courses.findIndex(
                    course => String(course.id) === String(id)
                );


            if (index !== -1) {

                courses[index] = {

                    ...courses[index],

                    title,
                    subject,
                    level,
                    description,
                    examDate

                };
            }

        } else {

            const newCourse = {

                id: Date.now().toString(),

                title,

                subject,

                level,

                description,

                examDate,

                progress: 0,

                createdAt:
                    new Date().toISOString()

            };


            courses.push(newCourse);
        }


        saveCourses();

        renderCourses();

        updateStatistics();

        generateStudyPlan();

        renderProgress();

        closeCourseModal();

    });
}


/* ======================================================
   AJOUTER UN COURS
====================================================== */

function addCourse(title, subject, level, description, examDate) {

    title =
        String(title || "").trim();

    subject =
        String(subject || "").trim();

    level =
        String(level || "").trim();

    description =
        String(description || "").trim();

    examDate =
        String(examDate || "").trim();


    if (!title) {
        throw new Error(
            "Le titre du cours est obligatoire."
        );
    }


    if (!subject) {
        throw new Error(
            "La matière du cours est obligatoire."
        );
    }


    const newCourse = {

        id: Date.now().toString(),

        title,

        subject,

        level,

        description,

        examDate,

        progress: 0,

        createdAt:
            new Date().toISOString()

    };


    courses.push(newCourse);

    saveCourses();

    renderCourses();

    updateStatistics();

    generateStudyPlan();

    renderProgress();


    return newCourse;
}


/* ======================================================
   MODIFICATION
====================================================== */

function editCourse(id) {

    const course =
        courses.find(
            item => String(item.id) === String(id)
        );


    if (!course) return;


    openCourseModal(course);
}


/* ======================================================
   SUPPRESSION
====================================================== */

function deleteCourse(id) {

    const course =
        courses.find(
            item => String(item.id) === String(id)
        );


    if (!course) return;


    const confirmation =
        confirm(
            `Voulez-vous supprimer "${course.title}" ?`
        );


    if (!confirmation) return;


    courses =
        courses.filter(
            item => String(item.id) !== String(id)
        );


    saveCourses();

    renderCourses();

    updateStatistics();

    generateStudyPlan();

    renderProgress();
}


/* ======================================================
   AFFICHAGE DES COURS
====================================================== */

function renderCourses() {

    const courseList =
        document.getElementById("courseList");


    if (!courseList) return;


    if (courses.length === 0) {

        courseList.innerHTML = `
            <div class="empty-state">
                <p>Aucun cours enregistré.</p>
            </div>
        `;

        return;
    }


    courseList.innerHTML =
        courses.map(course => {

            const progress =
                Number(course.progress || 0);


            return `

                <div class="course-card">

                    <div class="course-card-header">

                        <h3>
                            ${escapeHTML(course.title)}
                        </h3>

                    </div>


                    <p>
                        <strong>Matière :</strong>
                        ${escapeHTML(course.subject)}
                    </p>


                    ${
                        course.level
                        ? `
                            <p>
                                <strong>Niveau :</strong>
                                ${escapeHTML(course.level)}
                            </p>
                        `
                        : ""
                    }


                    ${
                        course.description
                        ? `
                            <p>
                                ${escapeHTML(course.description)}
                            </p>
                        `
                        : ""
                    }


                    ${
                        course.examDate
                        ? `
                            <p>
                                <strong>Examen :</strong>
                                ${escapeHTML(course.examDate)}
                            </p>
                        `
                        : ""
                    }


                    <div class="progress-container">

                        <div class="progress-bar">

                            <div
                                class="progress-fill"
                                style="width:${progress}%"
                            ></div>

                        </div>

                        <span>
                            ${progress}%
                        </span>

                    </div>


                    <div class="course-actions">

                        <button
                            type="button"
                            onclick="editCourse('${course.id}')"
                        >
                            Modifier
                        </button>


                        <button
                            type="button"
                            onclick="deleteCourse('${course.id}')"
                        >
                            Supprimer
                        </button>

                    </div>

                </div>
            `;

        }).join("");
}


/* ======================================================
   RECHERCHE
====================================================== */

function searchCourses() {

    const searchInput =
        document.getElementById("searchInput");


    if (!searchInput) return;


    const query =
        searchInput.value
            .toLowerCase()
            .trim();


    const courseList =
        document.getElementById("courseList");


    if (!courseList) return;


    const filteredCourses =
        courses.filter(course => {

            return (

                String(course.title || "")
                    .toLowerCase()
                    .includes(query)

                ||

                String(course.subject || "")
                    .toLowerCase()
                    .includes(query)

                ||

                String(course.description || "")
                    .toLowerCase()
                    .includes(query)

            );

        });


    if (filteredCourses.length === 0) {

        courseList.innerHTML = `
            <div class="empty-state">
                <p>Aucun cours trouvé.</p>
            </div>
        `;

        return;
    }


    courseList.innerHTML =
        filteredCourses.map(course => {

            return `

                <div class="course-card">

                    <h3>
                        ${escapeHTML(course.title)}
                    </h3>

                    <p>
                        <strong>Matière :</strong>
                        ${escapeHTML(course.subject)}
                    </p>

                    <p>
                        ${escapeHTML(
                            course.description || ""
                        )}
                    </p>

                </div>
            `;

        }).join("");
}


/* ======================================================
   FILTRE
====================================================== */

function filterCourses() {

    const filter =
        document.getElementById("subjectFilter");


    if (!filter) return;


    const value =
        filter.value.toLowerCase();


    const courseList =
        document.getElementById("courseList");


    if (!courseList) return;


    const filtered =
        value === "all"
        ? courses
        : courses.filter(
            course =>
                String(course.subject || "")
                    .toLowerCase() === value
        );


    if (filtered.length === 0) {

        courseList.innerHTML = `
            <div class="empty-state">
                <p>Aucun cours trouvé.</p>
            </div>
        `;

        return;
    }


    courseList.innerHTML =
        filtered.map(course => `

            <div class="course-card">

                <h3>
                    ${escapeHTML(course.title)}
                </h3>

                <p>
                    ${escapeHTML(course.subject)}
                </p>

                <p>
                    ${escapeHTML(
                        course.description || ""
                    )}
                </p>

            </div>

        `).join("");
}


/* ======================================================
   STATISTIQUES
====================================================== */

function updateStatistics() {

    const totalCourses =
        courses.length;


    const completedCourses =
        courses.filter(
            course =>
                Number(course.progress || 0) >= 100
        ).length;


    const averageProgress =
        totalCourses === 0

        ? 0

        : Math.round(
            courses.reduce(
                (sum, course) =>
                    sum +
                    Number(course.progress || 0),
                0
            ) / totalCourses
        );


    updateElement(
        "totalCourses",
        totalCourses
    );

    updateElement(
        "completedCourses",
        completedCourses
    );

    updateElement(
        "averageProgress",
        `${averageProgress}%`
    );

}


/* ======================================================
   PLAN D'ÉTUDE
====================================================== */

function generateStudyPlan() {

    const studyPlan =
        document.getElementById("studyPlan");


    if (!studyPlan) {

        return getStudyPlanData();
    }


    const plan =
        getStudyPlanData();


    if (plan.length === 0) {

        studyPlan.innerHTML = `
            <div class="empty-state">
                <p>
                    Aucun cours avec une date d'examen.
                </p>
            </div>
        `;

        return plan;
    }


    studyPlan.innerHTML =
        plan.map(course => `

            <div class="study-plan-item">

                <h3>
                    ${escapeHTML(course.title)}
                </h3>

                <p>
                    ${escapeHTML(course.subject)}
                </p>

                <p>
                    Examen :
                    ${escapeHTML(course.examDate)}
                </p>

            </div>

        `).join("");


    return plan;
}


function getStudyPlanData() {

    return [...courses]

        .filter(
            course => course.examDate
        )

        .sort(
            (a, b) =>
                new Date(a.examDate) -
                new Date(b.examDate)
        );
}


/* ======================================================
   PROGRESSION
====================================================== */

function renderProgress() {

    const progressSection =
        document.getElementById("progressSection");


    if (!progressSection) return;


    const total =
        courses.length;


    const average =
        total === 0

        ? 0

        : Math.round(
            courses.reduce(
                (sum, course) =>
                    sum +
                    Number(course.progress || 0),
                0
            ) / total
        );


    progressSection.innerHTML = `

        <div class="progress-summary">

            <h3>
                Progression générale
            </h3>

            <div class="progress-bar">

                <div
                    class="progress-fill"
                    style="width:${average}%"
                ></div>

            </div>

            <p>
                ${average}% terminé
            </p>

        </div>

    `;
}


/* ======================================================
   QUIZ
====================================================== */

function openQuizGenerator() {

    const quizContainer =
        document.getElementById("quizContainer");


    if (!quizContainer) return;


    if (courses.length === 0) {

        quizContainer.innerHTML = `

            <div class="empty-state">

                <p>
                    Ajoutez d'abord un cours
                    pour générer un quiz.
                </p>

            </div>
        `;

        return;
    }


    quizContainer.innerHTML = `

        <div class="quiz-generator">

            <h3>
                Générateur de quiz
            </h3>

            <p>
                Choisissez un cours :
            </p>

            <select id="quizCourseSelect">

                ${courses.map(course => `

                    <option value="${course.id}">

                        ${escapeHTML(course.title)}

                    </option>

                `).join("")}

            </select>


            <button
                type="button"
                onclick="generateQuiz()"
            >
                Générer le quiz
            </button>

        </div>
    `;
}


function generateQuiz() {

    const select =
        document.getElementById(
            "quizCourseSelect"
        );


    if (!select) return;


    const course =
        courses.find(
            item =>
                String(item.id) ===
                String(select.value)
        );


    if (!course) return;


    const questions =
        generateQuizQuestions(course);


    const quiz = {

        id: Date.now().toString(),

        courseId: course.id,

        courseTitle: course.title,

        questions,

        score: null,

        createdAt:
            new Date().toISOString()

    };


    quizzes.push(quiz);

    saveQuizzes();

    displayQuiz(quiz);
}


function generateQuizQuestions(course) {

    const questions = [

        {
            question:
                `Quel est le thème principal du cours "${course.title}" ?`,

            options: [

                course.subject,

                "Aucune réponse",

                "Un autre sujet",

                "Sujet inconnu"

            ],

            answer: 0
        },

        {
            question:
                "Quel élément faut-il retenir de ce cours ?",

            options: [

                course.description ||
                "Les notions principales",

                "Rien",

                "Un sujet différent",

                "Une information inconnue"

            ],

            answer: 0
        }

    ];


    return questions;
}


function displayQuiz(quiz) {

    const quizContainer =
        document.getElementById(
            "quizContainer"
        );


    if (!quizContainer) return;


    quizContainer.innerHTML = `

        <div class="quiz">

            <h3>
                Quiz : ${escapeHTML(
                    quiz.courseTitle
                )}
            </h3>


            <form id="quizForm">

                ${quiz.questions.map(
                    (question, index) => `

                    <div class="quiz-question">

                        <p>
                            <strong>
                                ${index + 1}.
                                ${escapeHTML(
                                    question.question
                                )}
                            </strong>
                        </p>


                        ${question.options.map(
                            (option, optionIndex) => `

                            <label>

                                <input
                                    type="radio"
                                    name="question-${index}"
                                    value="${optionIndex}"
                                >

                                ${escapeHTML(option)}

                            </label>

                        `).join("")}

                    </div>

                `
                ).join("")}


                <button type="submit">

                    Corriger le quiz

                </button>

            </form>

            <div id="quizResult"></div>

        </div>
    `;


    const form =
        document.getElementById(
            "quizForm"
        );


    if (form) {

        form.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();

                calculateQuizResult(
                    quiz
                );

            }
        );
    }
}


function calculateQuizResult(quiz) {

    let score = 0;


    quiz.questions.forEach(
        (question, index) => {

            const selected =
                document.querySelector(
                    `input[name="question-${index}"]:checked`
                );


            if (
                selected &&
                Number(selected.value) ===
                Number(question.answer)
            ) {

                score++;

            }

        }
    );


    const percentage =
        quiz.questions.length === 0

        ? 0

        : Math.round(
            (score / quiz.questions.length) *
            100
        );


    quiz.score = percentage;

    saveQuizzes();


    const result =
        document.getElementById(
            "quizResult"
        );


    if (result) {

        result.innerHTML = `

            <div class="quiz-result">

                <h3>
                    Résultat
                </h3>

                <p>
                    Score :
                    <strong>
                        ${score}/${quiz.questions.length}
                    </strong>
                </p>

                <p>
                    ${percentage}%
                </p>

            </div>
        `;
    }
}


/* ======================================================
   WEBMCP
====================================================== */

/*
   Cette partie permet à un agent IA compatible
   WebMCP d'utiliser certaines fonctions du site.

   IMPORTANT :
   - aucune clé API n'est nécessaire ici
   - aucune clé secrète ne doit être placée dans ce fichier
   - l'IA utilise les outils exposés par la page
*/


let webMCPInitialized = false;


async function setupWebMCP() {

    if (webMCPInitialized) {
        return;
    }


    const modelContext =
        document.modelContext ||
        navigator.modelContext;


    if (
        !modelContext ||
        typeof modelContext.registerTool !== "function"
    ) {

        console.log(
            "WebMCP n'est pas disponible dans ce navigateur."
        );

        return;
    }


    try {

        /*
        ===============================================
        OUTIL 1 : LIRE LES COURS
        ===============================================
        */

        await modelContext.registerTool({

            name: "get_courses",

            description:
                "Retourne tous les cours actuellement enregistrés dans Study webMCP.",

            inputSchema: {

                type: "object",

                properties: {}

            },

            annotations: {

                readOnlyHint: true

            },

            execute: async function () {

                return getCoursesForAI();

            }

        });


        /*
        ===============================================
        OUTIL 2 : AJOUTER UN COURS
        ===============================================
        */

        await modelContext.registerTool({

            name: "add_course",

            description:
                "Ajoute un nouveau cours dans le tableau de bord Study webMCP.",

            inputSchema: {

                type: "object",

                properties: {

                    title: {

                        type: "string",

                        description:
                            "Titre du cours."

                    },

                    subject: {

                        type: "string",

                        description:
                            "Matière ou domaine du cours."

                    },

                    level: {

                        type: "string",

                        description:
                            "Niveau d'étude du cours."

                    },

                    description: {

                        type: "string",

                        description:
                            "Description du cours."

                    },

                    examDate: {

                        type: "string",

                        description:
                            "Date de l'examen au format YYYY-MM-DD."

                    }

                },

                required: [

                    "title",

                    "subject"

                ]

            },

            annotations: {

                readOnlyHint: false

            },

            execute: async function (args) {

                return addCourseForAI(args);

            }

        });


        /*
        ===============================================
        OUTIL 3 : PLAN D'ÉTUDE
        ===============================================
        */

        await modelContext.registerTool({

            name: "generate_study_plan",

            description:
                "Retourne le plan d'étude basé sur les dates d'examen des cours.",

            inputSchema: {

                type: "object",

                properties: {}

            },

            annotations: {

                readOnlyHint: true

            },

            execute: async function () {

                return getStudyPlanData();

            }

        });


        /*
        ===============================================
        OUTIL 4 : OUVRIR LE QUIZ
        ===============================================
        */

        await modelContext.registerTool({

            name: "open_quiz_interface",

            description:
                "Ouvre l'interface de génération de quiz de Study webMCP.",

            inputSchema: {

                type: "object",

                properties: {}

            },

            annotations: {

                readOnlyHint: false

            },

            execute: async function () {

                openQuizGenerator();


                return {

                    success: true,

                    message:
                        "L'interface de génération de quiz a été ouverte."

                };

            }

        });


        webMCPInitialized = true;


        console.log(
            "Study webMCP : outils IA enregistrés avec succès."
        );


        if (
            typeof modelContext.getTools ===
            "function"
        ) {

            const tools =
                await modelContext.getTools();

            console.log(
                "Outils WebMCP disponibles :",
                tools
            );
        }


    } catch (error) {

        console.error(
            "Erreur WebMCP :",
            error
        );

    }

}


/* ======================================================
   DONNÉES POUR L'IA
====================================================== */

function getCoursesForAI() {

    return courses.map(course => ({

        id: course.id,

        title: course.title,

        subject: course.subject,

        level: course.level || "",

        description:
            course.description || "",

        examDate:
            course.examDate || "",

        progress:
            Number(course.progress || 0),

        createdAt:
            course.createdAt || ""

    }));
}


/* ======================================================
   AJOUT D'UN COURS PAR L'IA
====================================================== */

function addCourseForAI(args) {

    if (!args || typeof args !== "object") {

        return {

            success: false,

            message:
                "Les informations du cours sont invalides."

        };
    }


    try {

        const course = addCourse(

            args.title,

            args.subject,

            args.level,

            args.description,

            args.examDate

        );


        return {

            success: true,

            message:
                `Le cours "${course.title}" a été ajouté avec succès.`,

            course

        };

    } catch (error) {

        return {

            success: false,

            message:
                error.message

        };

    }

}


/* ======================================================
   UTILITAIRES
====================================================== */

function updateElement(id, value) {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent =
            value;

    }

}


function escapeHTML(value) {

    return String(value ?? "")

        .replaceAll("&", "&amp;")

        .replaceAll("<", "&lt;")

        .replaceAll(">", "&gt;")

        .replaceAll('"', "&quot;")

        .replaceAll("'", "&#039;");
}


/* ======================================================
   EXPORTS POUR WEBMCP / AUTRES SCRIPTS
====================================================== */

window.getCoursesForAI =
    getCoursesForAI;


window.addCourseForAI =
    addCourseForAI;


window.generateStudyPlan =
    generateStudyPlan;


window.openQuizGenerator =
    openQuizGenerator;


window.addCourse =
    addCourse;


window.editCourse =
    editCourse;


window.deleteCourse =
    deleteCourse;


window.searchCourses =
    searchCourses;


window.filterCourses =
    filterCourses;


window.renderCourses =
    renderCourses;
