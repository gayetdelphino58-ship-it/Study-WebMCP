```javascript
"use strict";

/*
====================================================
    STUDY webMCP
    Assistant d'étude intelligent

    ÉTAPE 2
    Gestion complète des cours

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
====================================================
*/


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

        const data =
            localStorage.getItem(STORAGE_COURSES);

        if (!data) {
            return [];
        }

        const courses =
            JSON.parse(data);

        return Array.isArray(courses)
            ? courses
            : [];

    } catch (error) {

        console.error(
            "Erreur lors de la récupération des cours :",
            error
        );

        return [];

    }

}


// ==================================================
// SAUVEGARDER LES COURS
// ==================================================

function saveCourses(courses) {

    try {

        localStorage.setItem(
            STORAGE_COURSES,
            JSON.stringify(courses)
        );

        return true;

    } catch (error) {

        console.error(
            "Erreur lors de la sauvegarde :",
            error
        );

        alert(
            "Impossible de sauvegarder les données."
        );

        return false;

    }

}


// ==================================================
// INITIALISER LES BOUTONS
// ==================================================

function initializeButtons() {

    const startStudyBtn =
        document.getElementById("startStudyBtn");

    const addCourseBtn =
        document.getElementById("addCourseBtn");

    const newCourseBtn =
        document.getElementById("newCourseBtn");

    const closeModalBtn =
        document.getElementById("closeModalBtn");

    const cancelCourseBtn =
        document.getElementById("cancelCourseBtn");

    const generatePlanBtn =
        document.getElementById("generatePlanBtn");

    const generateQuizBtn =
        document.getElementById("generateQuizBtn");


    // Commencer les études

    if (startStudyBtn) {

        startStudyBtn.addEventListener(
            "click",
            () => {

                document
                    .getElementById("courses")
                    ?.scrollIntoView({
                        behavior: "smooth"
                    });

            }
        );

    }


    // Ajouter un cours

    if (addCourseBtn) {

        addCourseBtn.addEventListener(
            "click",
            openAddCourseModal
        );

    }


    if (newCourseBtn) {

        newCourseBtn.addEventListener(
            "click",
            openAddCourseModal
        );

    }


    // Fermer le formulaire

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


    // Plan d'étude

    if (generatePlanBtn) {

        generatePlanBtn.addEventListener(
            "click",
            generateStudyPlan
        );

    }


    // Quiz

    if (generateQuizBtn) {

        generateQuizBtn.addEventListener(
            "click",
            () => {

                alert(
                    "🧠 La génération de quiz sera développée dans une prochaine étape."
                );

            }
        );

    }

}


// ==================================================
// MODAL
// ==================================================

function openAddCourseModal() {

    const modal =
        document.getElementById("courseModal");

    const form =
        document.getElementById("courseForm");

    const modalTitle =
        document.getElementById("modalTitle");


    if (!modal || !form) {
        return;
    }


    form.reset();

    document.getElementById(
        "courseId"
    ).value = "";


    modalTitle.textContent =
        "Ajouter un cours";


    modal.style.display =
        "flex";

}


function closeCourseModal() {

    const modal =
        document.getElementById("courseModal");

    if (modal) {

        modal.style.display =
            "none";

    }

}


// ==================================================
// FORMULAIRE COURS
// ==================================================

function initializeCourseForm() {

    const form =
        document.getElementById("courseForm");

    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        handleCourseSubmit
    );

}


// ==================================================
// AJOUT / MODIFICATION
// ==================================================

function handleCourseSubmit(event) {

    event.preventDefault();


    const id =
        document.getElementById(
            "courseId"
        ).value;


    const title =
        document.getElementById(
            "courseTitle"
        ).value.trim();


    const subject =
        document.getElementById(
            "courseSubject"
        ).value.trim();


    const level =
        document.getElementById(
            "courseLevel"
        ).value;


    const description =
        document.getElementById(
            "courseDescription"
        ).value.trim();


    const examDate =
        document.getElementById(
            "courseExamDate"
        ).value;


    // Validation

    if (!title) {

        alert(
            "Veuillez entrer le titre du cours."
        );

        return;

    }


    if (!subject) {

        alert(
            "Veuillez entrer la matière."
        );

        return;

    }


    if (!level) {

        alert(
            "Veuillez sélectionner le niveau."
        );

        return;

    }


    let courses =
        getCourses();


    // MODIFICATION

    if (id) {

        const index =
            courses.findIndex(
                course =>
                    course.id === id
            );


        if (index !== -1) {

            courses[index] = {

                ...courses[index],

                title,
                subject,
                level,
                description,
                examDate,

                updatedAt:
                    new Date().toISOString()

            };

        }

    }


    // NOUVEAU COURS

    else {

        const newCourse = {

            id:
                generateId(),

            title,

            subject,

            level,

            description,

            examDate,

            progress: 0,

            createdAt:
                new Date().toISOString(),

            updatedAt:
                new Date().toISOString()

        };


        courses.push(
            newCourse
        );

    }


    if (saveCourses(courses)) {

        closeCourseModal();

        loadCourses();

        updateStatistics();

        updateProgress();

        alert(
            "✅ Cours enregistré avec succès !"
        );

    }

}


// ==================================================
// IDENTIFIANT UNIQUE
// ==================================================

function generateId() {

    return (
        Date.now().toString(36) +
        Math.random()
            .toString(36)
            .substring(2, 9)
    );

}


// ==================================================
// AFFICHER LES COURS
// ==================================================

function loadCourses() {

    const courses =
        getCourses();


    const searchInput =
        document.getElementById(
            "searchCourseInput"
        );


    const filterSubject =
        document.getElementById(
            "filterSubject"
        );


    const searchTerm =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    const selectedSubject =
        filterSubject
            ? filterSubject.value
            : "";


    let filteredCourses =
        courses.filter(course => {

            const matchesSearch =

                course.title
                    .toLowerCase()
                    .includes(searchTerm)

                ||

                course.subject
                    .toLowerCase()
                    .includes(searchTerm)

                ||

                (course.description || "")
                    .toLowerCase()
                    .includes(searchTerm);


            const matchesSubject =

                !selectedSubject ||

                course.subject ===
                    selectedSubject;


            return (
                matchesSearch &&
                matchesSubject
            );

        });


    displayCourses(
        filteredCourses
    );


    updateSubjectFilter(
        courses
    );

}


// ==================================================
// AFFICHAGE DES CARTES
// ==================================================

function displayCourses(courses) {

    const container =
        document.getElementById(
            "courseList"
        );


    if (!container) {
        return;
    }


    if (courses.length === 0) {

        container.innerHTML = `

            <div
                class="empty-state"
                style="grid-column:1/-1;"
            >

                <div class="empty-icon">
                    📖
                </div>

                <h3>
                    Aucun cours trouvé
                </h3>

                <p>
                    Ajoute un cours pour commencer
                    ton apprentissage.
                </p>

                <button
                    class="primary-btn"
                    onclick="openAddCourseModal()"
                >
                    + Ajouter un cours
                </button>

            </div>

        `;

        return;

    }


    container.innerHTML =
        courses
            .map(
                createCourseCard
            )
            .join("");


    addCourseCardEvents();

}


// ==================================================
// CARTE D'UN COURS
// ==================================================

function createCourseCard(course) {

    const safeTitle =
        escapeHTML(
            course.title
        );

    const safeSubject =
        escapeHTML(
            course.subject
        );

    const safeLevel =
        escapeHTML(
            course.level
        );

    const safeDescription =
        escapeHTML(
            course.description ||
            "Aucune description."
        );


    const exam =
        course.examDate
            ? formatDate(
                course.examDate
            )
            : "Non définie";


    const progress =
        Number(
            course.progress || 0
        );


    return `

        <article
            class="stat-card course-card"
            data-course-id="${course.id}"
            style="
                text-align:left;
                position:relative;
            "
        >

            <div
                style="
                    display:flex;
                    justify-content:space-between;
                    align-items:flex-start;
                    gap:10px;
                "
            >

                <div
                    style="
                        font-size:35px;
                    "
                >
                    📚
                </div>

                <span
                    style="
                        background:#eef2ff;
                        color:#4f46e5;
                        padding:5px 9px;
                        border-radius:20px;
                        font-size:11px;
                        font-weight:bold;
                    "
                >
                    ${safeLevel}
                </span>

            </div>


            <h3
                style="
                    margin-top:15px;
                    font-size:20px;
                "
            >
                ${safeTitle}
            </h3>


            <p
                style="
                    color:#4f46e5;
                    font-weight:bold;
                    margin-top:5px;
                "
            >
                ${safeSubject}
            </p>


            <p
                style="
                    color:#64748b;
                    font-size:14px;
                    margin-top:10px;
                    min-height:45px;
                "
            >
                ${safeDescription}
            </p>


            <div
                style="
                    margin-top:18px;
                    padding-top:15px;
                    border-top:1px solid #eef2f7;
                "
            >

                <div
                    style="
                        display:flex;
                        justify-content:space-between;
                        font-size:12px;
                        margin-bottom:7px;
                    "
                >

                    <span>
                        Progression
                    </span>

                    <strong>
                        ${progress}%
                    </strong>

                </div>


                <div
                    style="
                        height:8px;
                        background:#e5e7eb;
                        border-radius:20px;
                        overflow:hidden;
                    "
                >

                    <div
                        style="
                            width:${progress}%;
                            height:100%;
                            background:#4f46e5;
                        "
                    ></div>

                </div>

            </div>


            <div
                style="
                    margin-top:15px;
                    font-size:12px;
                    color:#64748b;
                "
            >
                📅 Examen :
                <strong>
                    ${exam}
                </strong>
            </div>


            <div
                style="
                    display:flex;
                    gap:8px;
                    margin-top:18px;
                "
            >

                <button
                    class="secondary-btn edit-course-btn"
                    data-id="${course.id}"
                    style="flex:1;"
                >
                    ✏️ Modifier
                </button>

                <button
                    class="delete-course-btn"
                    data-id="${course.id}"
                    style="
                        flex:1;
                        border:none;
                        padding:10px;
                        border-radius:10px;
                        cursor:pointer;
                        background:#fee2e2;
                        color:#b91c1c;
                        font-weight:bold;
                    "
                >
                    🗑️ Supprimer
                </button>

            </div>

        </article>

    `;

}


// ==================================================
// ÉVÉNEMENTS DES CARTES
// ==================================================

function addCourseCardEvents() {

    const editButtons =
        document.querySelectorAll(
            ".edit-course-btn"
        );


    const deleteButtons =
        document.querySelectorAll(
            ".delete-course-btn"
        );


    editButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    editCourse(
                        button.dataset.id
                    );

                }
            );

        }
    );


    deleteButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    deleteCourse(
                        button.dataset.id
                    );

                }
            );

        }
    );

}


// ==================================================
// MODIFIER UN COURS
// ==================================================

function editCourse(id) {

    const courses =
        getCourses();


    const course =
        courses.find(
            item =>
                item.id === id
        );


    if (!course) {

        alert(
            "Cours introuvable."
        );

        return;

    }


    document.getElementById(
        "courseId"
    ).value =
        course.id;


    document.getElementById(
        "courseTitle"
    ).value =
        course.title;


    document.getElementById(
        "courseSubject"
    ).value =
        course.subject;


    document.getElementById(
        "courseLevel"
    ).value =
        course.level;


    document.getElementById(
        "courseDescription"
    ).value =
        course.description || "";


    document.getElementById(
        "courseExamDate"
    ).value =
        course.examDate || "";


    document.getElementById(
        "modalTitle"
    ).textContent =
        "Modifier le cours";


    document.getElementById(
        "courseModal"
    ).style.display =
        "flex";

}


// ==================================================
// SUPPRIMER UN COURS
// ==================================================

function deleteCourse(id) {

    const courses =
        getCourses();


    const course =
        courses.find(
            item =>
                item.id === id
        );


    if (!course) {
        return;
    }


    const confirmation =
        confirm(
            `Voulez-vous vraiment supprimer le cours "${course.title}" ?`
        );


    if (!confirmation) {
        return;
    }


    const updatedCourses =
        courses.filter(
            item =>
                item.id !== id
        );


    if (
        saveCourses(
            updatedCourses
        )
    ) {

        loadCourses();

        updateStatistics();

        updateProgress();

        alert(
            "🗑️ Cours supprimé."
        );

    }

}


// ==================================================
// RECHERCHE
// ==================================================

function initializeSearch() {

    const searchInput =
        document.getElementById(
            "searchCourseInput"
        );


    const filterSubject =
        document.getElementById(
            "filterSubject"
        );


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            loadCourses
        );

    }


    if (filterSubject) {

        filterSubject.addEventListener(
            "change",
            loadCourses
        );

    }

}


// ==================================================
// FILTRE DES MATIÈRES
// ==================================================

function updateSubjectFilter(
    courses
) {

    const select =
        document.getElementById(
            "filterSubject"
        );


    if (!select) {
        return;
    }


    const currentValue =
        select.value;


    const subjects =
        [
            ...new Set(
                courses
                    .map(
                        course =>
                            course.subject
                    )
                    .filter(Boolean)
            )
        ]
        .sort();


    select.innerHTML = `

        <option value="">
            Toutes les matières
        </option>

    `;


    subjects.forEach(
        subject => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                subject;

            option.textContent =
                subject;

            select.appendChild(
                option
            );

        }
    );


    if (
        subjects.includes(
            currentValue
        )
    ) {

        select.value =
            currentValue;

    }

}


// ==================================================
// STATISTIQUES
// ==================================================

function updateStatistics() {

    const courses =
        getCourses();


    const sessions =
        getStorageArray(
            STORAGE_SESSIONS
        );


    const quizzes =
        getStorageArray(
            STORAGE_QUIZZES
        );


    const courseCount =
        document.getElementById(
            "courseCount"
        );


    const studySessions =
        document.getElementById(
            "studySessions"
        );


    const quizCount =
        document.getElementById(
            "quizCount"
        );


    if (courseCount) {

        courseCount.textContent =
            courses.length;

    }


    if (studySessions) {

        studySessions.textContent =
            sessions.length;

    }


    if (quizCount) {

        quizCount.textContent =
            quizzes.length;

    }


    updateProgress();

}


// ==================================================
// RÉCUPÉRER UN TABLEAU LOCALSTORAGE
// ==================================================

function getStorageArray(
    key
) {

    try {

        const data =
            localStorage.getItem(
                key
            );


        if (!data) {
            return [];
        }


        const parsed =
            JSON.parse(data);


        return Array.isArray(parsed)
            ? parsed
            : [];

    } catch {

        return [];

    }

}


// ==================================================
// PROGRESSION
// ==================================================

function updateProgress() {

    const courses =
        getCourses();


    let progress = 0;


    if (courses.length > 0) {

        const total =
            courses.reduce(
                (
                    sum,
                    course
                ) => {

                    return (
                        sum +
                        Number(
                            course.progress || 0
                        )
                    );

                },
                0
            );


        progress =
            Math.round(
                total /
                courses.length
            );

    }


    const progressValue =
        document.getElementById(
            "progressValue"
        );


    const progressText =
        document.getElementById(
            "progressText"
        );


    const progressBar =
        document.getElementById(
            "progressBar"
        );


    if (progressValue) {

        progressValue.textContent =
            `${progress}%`;

    }


    if (progressText) {

        progressText.textContent =
            `${progress}%`;

    }


    if (progressBar) {

        progressBar.style.width =
            `${progress}%`;

    }

}


// ==================================================
// PLAN D'ÉTUDE — VERSION DE BASE
// ==================================================

function generateStudyPlan() {

    const courses =
        getCourses();


    const container =
        document.getElementById(
            "studyPlan"
        );


    if (!container) {
        return;
    }


    if (courses.length === 0) {

        alert(
            "📚 Ajoute d'abord au moins un cours."
        );

        return;

    }


    const sortedCourses =
        [...courses].sort(
            (
                a,
                b
            ) => {

                if (
                    !a.examDate
                ) {
                    return 1;
                }

                if (
                    !b.examDate
                ) {
                    return -1;
                }

                return (
                    new Date(
                        a.examDate
                    ) -
                    new Date(
                        b.examDate
                    )
                );

            }
        );


    container.innerHTML = `

        <div
            style="
                display:grid;
                gap:15px;
            "
        >

            ${sortedCourses
                .map(
                    (
                        course,
                        index
                    ) => `

                        <div
                            style="
                                background:white;
                                padding:20px;
                                border-radius:14px;
                                display:flex;
                                gap:15px;
                                align-items:center;
                                box-shadow:0 5px 20px rgba(0,0,0,0.05);
                            "
                        >

                            <div
                                style="
                                    width:45px;
                                    height:45px;
                                    border-radius:50%;
                                    background:#eef2ff;
                                    display:flex;
                                    align-items:center;
                                    justify-content:center;
                                    font-weight:bold;
                                    color:#4f46e5;
                                "
                            >
                                ${index + 1}
                            </div>


                            <div>

                                <strong>
                                    ${escapeHTML(
                                        course.title
                                    )}
                                </strong>

                                <p
                                    style="
                                        color:#64748b;
                                        font-size:13px;
                                        margin-top:3px;
                                    "
                                >
                                    ${escapeHTML(
                                        course.subject
                                    )}
                                    ${
                                        course.examDate
                                            ? ` — Examen le ${formatDate(
                                                course.examDate
                                            )}`
                                            : ""
                                    }
                                </p>

                            </div>

                        </div>

                    `
                )
                .join("")}

        </div>

    `;

}


// ==================================================
// FORMATAGE DATE
// ==================================================

function formatDate(
    dateString
) {

    if (!dateString) {
        return "Non définie";
    }


    const date =
        new Date(
            `${dateString}T00:00:00`
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return dateString;

    }


    return date.toLocaleDateString(
        "fr-FR",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );

}


// ==================================================
// PROTECTION DU HTML
// ==================================================

function escapeHTML(
    value
) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


// ==================================================
// FERMETURE DU MODAL EN CLIQUANT À L'EXTÉRIEUR
// ==================================================

window.addEventListener(
    "click",
    event => {

        const modal =
            document.getElementById(
                "courseModal"
            );


        if (
            event.target === modal
        ) {

            closeCourseModal();

        }

    }
);


// ==================================================
// EXPOSER CERTAINES FONCTIONS
// Pour les boutons générés dynamiquement
// ==================================================

window.openAddCourseModal =
    openAddCourseModal;

window.editCourse =
    editCourse;

window.deleteCourse =
    deleteCourse;

window.generateStudyPlan =
    generateStudyPlan;
```

