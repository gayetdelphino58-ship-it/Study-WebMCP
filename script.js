"use strict";

/*
    STUDY webMCP
    Version 1.0
    Étape 1 : structure de base
*/


// ===============================
// INITIALISATION
// ===============================

document.addEventListener("DOMContentLoaded", () => {

    console.log("Study webMCP est démarré.");

    initializeButtons();
    updateStatistics();

});


// ===============================
// BOUTONS
// ===============================

function initializeButtons() {

    const startStudyBtn =
        document.getElementById("startStudyBtn");

    const addCourseBtn =
        document.getElementById("addCourseBtn");

    const newCourseBtn =
        document.getElementById("newCourseBtn");

    const emptyAddCourseBtn =
        document.getElementById("emptyAddCourseBtn");

    const generatePlanBtn =
        document.getElementById("generatePlanBtn");

    const generateQuizBtn =
        document.getElementById("generateQuizBtn");


    // Commencer les études
    if (startStudyBtn) {

        startStudyBtn.addEventListener("click", () => {

            document
                .getElementById("courses")
                ?.scrollIntoView({
                    behavior: "smooth"
                });

        });

    }


    // Ajouter un cours
    const courseButtons = [
        addCourseBtn,
        newCourseBtn,
        emptyAddCourseBtn
    ];

    courseButtons.forEach(button => {

        if (button) {

            button.addEventListener("click", () => {

                alert(
                    "La fonction d'ajout de cours sera disponible à l'étape suivante."
                );

            });

        }

    });


    // Générer un plan
    if (generatePlanBtn) {

        generatePlanBtn.addEventListener("click", () => {

            alert(
                "La génération automatique du plan sera ajoutée prochainement."
            );

        });

    }


    // Générer un quiz
    if (generateQuizBtn) {

        generateQuizBtn.addEventListener("click", () => {

            alert(
                "La génération de quiz sera ajoutée prochainement."
            );

        });

    }

}


// ===============================
// STATISTIQUES
// ===============================

function updateStatistics() {

    const courses =
        JSON.parse(
            localStorage.getItem("studyCourses") || "[]"
        );

    const sessions =
        JSON.parse(
            localStorage.getItem("studySessions") || "[]"
        );

    const quizzes =
        JSON.parse(
            localStorage.getItem("studyQuizzes") || "[]"
        );


    const courseCount =
        document.getElementById("courseCount");

    const studySessions =
        document.getElementById("studySessions");

    const quizCount =
        document.getElementById("quizCount");

    const progressValue =
        document.getElementById("progressValue");

    const progressText =
        document.getElementById("progressText");


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


    const progress =
        calculateProgress(
            courses,
            sessions,
            quizzes
        );


    if (progressValue) {

        progressValue.textContent =
            `${progress}%`;

    }


    if (progressText) {

        progressText.textContent =
            `${progress}%`;

    }


    const progressBar =
        document.getElementById("progressBar");

    if (progressBar) {

        progressBar.style.width =
            `${progress}%`;

    }

}


// ===============================
// CALCUL DE PROGRESSION
// ===============================

function calculateProgress(
    courses,
    sessions,
    quizzes
) {

    if (
        courses.length === 0 &&
        sessions.length === 0 &&
        quizzes.length === 0
    ) {

        return 0;

    }


    let progress = 0;


    if (courses.length > 0) {

        progress += 30;

    }


    if (sessions.length > 0) {

        progress += 30;

    }


    if (quizzes.length > 0) {

        progress += 40;

    }


    return Math.min(progress, 100);

}
