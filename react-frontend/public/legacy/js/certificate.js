//=====================================================
// CERTIFICATE
// MOCK API + REACT VERSION
//=====================================================

import {
    getData,
    getById,
    queryData,
    getSession,
    clearSessions
} from "./api.js";


let student = null;

let course = null;

let progressRecord = null;

let enrollment = null;

let courseKey = null;


//=====================================================
// INITIALIZE CERTIFICATE
//=====================================================

async function initializeCertificate() {

    try {

        //=================================================
        // SESSION
        //=================================================

        const session =
            await getSession();


        if (
            !session ||
            session.role !== "student"
        ) {

            window.location.replace(
                "/login"
            );

            return;
        }


        //=================================================
        // STUDENT
        //=================================================

        student =
            await getById(
                "students",
                session.userId
            );


        if (
            !student ||
            student.active === false
        ) {

            await clearSessions();


            window.location.replace(
                "/login"
            );

            return;
        }


        //=================================================
        // APP STATE
        //=================================================

        const appState =
            await getById(
                "appState",
                "current"
            );


        courseKey =
            appState
                ? appState.selectedCourseKey
                : null;


        if (!courseKey) {

            alert(
                "No course selected."
            );


            window.location.replace(
                "/my-courses"
            );

            return;
        }


        //=================================================
        // COURSE
        //=================================================

        course =
            await findCourse(
                courseKey
            );


        if (!course) {

            alert(
                "Course not found."
            );


            window.location.replace(
                "/my-courses"
            );

            return;
        }


        courseKey =
            course.courseKey ||
            course.key ||
            course.id ||
            courseKey;


        //=================================================
        // PROGRESS
        //=================================================

        const progressData =
            await queryData(
                "progress",
                {
                    studentEmail:
                        student.email
                }
            );


        //=================================================
// FIND LATEST / COMPLETED PROGRESS
//=================================================

const matchingProgress =
    Array.isArray(progressData)
        ? progressData.filter(
            item =>
                sameCourse(item)
        )
        : [];


console.log(
    "All matching progress records:",
    matchingProgress
);


// Prefer a completed record first.
// If there are multiple records, use the newest one.

progressRecord =
    matchingProgress
        .sort(
            (a, b) => {

                // Completed record gets priority

                const aCompleted =
                    a.completed === true ||
                    Number(
                        a.percentage || 0
                    ) >= 100;

                const bCompleted =
                    b.completed === true ||
                    Number(
                        b.percentage || 0
                    ) >= 100;


                if (
                    aCompleted &&
                    !bCompleted
                ) {

                    return -1;
                }


                if (
                    bCompleted &&
                    !aCompleted
                ) {

                    return 1;
                }


                // Otherwise newest record first

                const aDate =
                    new Date(
                        a.updatedAt ||
                        a.completedAt ||
                        a.startedAt ||
                        0
                    ).getTime();


                const bDate =
                    new Date(
                        b.updatedAt ||
                        b.completedAt ||
                        b.startedAt ||
                        0
                    ).getTime();


                return bDate - aDate;
            }
        )[0] || null;


console.log(
    "Selected progress record:",
    progressRecord
);

        //=================================================
        // ENROLLMENT
        //=================================================

        const enrollmentData =
            await queryData(
                "enrollments",
                {
                    studentEmail:
                        student.email
                }
            );


        enrollment =
            Array.isArray(enrollmentData)
                ? enrollmentData.find(
                    item =>
                        sameCourse(
                            item
                        )
                )
                : null;


       //=================================================
// VERIFY COMPLETION
//=================================================

const completedVideos =
    Array.isArray(
        progressRecord?.completedVideos
    )
        ? progressRecord.completedVideos
        : [];


const totalVideos =
    Array.isArray(course.videos)
        ? course.videos.length
        : Number(
            progressRecord?.totalVideos || 0
        );


const allVideosCompleted =
    totalVideos > 0 &&
    completedVideos.length >=
        totalVideos;


const completed =
    Boolean(
        progressRecord &&
        (
            progressRecord.completed === true

            ||

            Number(
                progressRecord.percentage || 0
            ) >= 100

            ||

            allVideosCompleted
        )
    );


console.log(
    "CERTIFICATE COMPLETION CHECK",
    {
        progressRecord,
        completedVideos,
        completedCount:
            completedVideos.length,
        totalVideos,
        percentage:
            progressRecord?.percentage,
        completedFlag:
            progressRecord?.completed,
        allVideosCompleted,
        certificateAllowed:
            completed
    }
);


if (!completed) {

    console.error(
        "Certificate blocked because progress is incomplete.",
        progressRecord
    );

    alert(
        "Complete the course before viewing the certificate."
    );

    window.location.replace(
        "/my-courses"
    );

    return;
}


        //=================================================
        // RENDER
        //=================================================

        renderCertificate();


        initializeCertificateButtons();

    }

    catch (error) {

        console.error(
            "Certificate Error:",
            error
        );


        alert(
            "Unable to load certificate."
        );
    }
}


//=====================================================
// FIND COURSE
//=====================================================

async function findCourse(
    key
) {

    try {

        const directCourse =
            await getById(
                "courses",
                key
            );


        if (directCourse) {

            return directCourse;
        }

    }

    catch (error) {

        // Continue with collection search.
    }


    const courseData =
        await getData(
            "courses"
        );


    if (
        !Array.isArray(courseData)
    ) {

        return null;
    }


    const normalized =
        String(key)
            .trim()
            .toLowerCase();


    return courseData.find(
        item => {

            const values = [

                item.id,

                item.key,

                item.courseKey,

                item.title

            ];


            return values.some(
                value =>
                    value !== undefined &&
                    value !== null &&
                    String(value)
                        .trim()
                        .toLowerCase() ===
                    normalized
            );
        }
    ) || null;
}


//=====================================================
// SAME COURSE
//=====================================================

function sameCourse(item) {

    if (!item || !course) {

        return false;
    }


    // 1. Prefer database course ID

    if (
        item.courseId !== undefined &&
        item.courseId !== null &&
        course.id !== undefined &&
        course.id !== null
    ) {

        if (
            String(item.courseId) ===
            String(course.id)
        ) {

            return true;
        }
    }


    // 2. Compare course key

    const itemKey =
        item.courseKey ||
        item.key;


    const selectedKey =
        course.courseKey ||
        course.key ||
        courseKey;


    if (
        itemKey &&
        selectedKey &&
        String(itemKey)
            .trim()
            .toLowerCase() ===
        String(selectedKey)
            .trim()
            .toLowerCase()
    ) {

        return true;
    }


    // 3. Title only as final fallback

    const itemTitle =
        item.courseTitle ||
        item.course ||
        item.title;


    if (
        itemTitle &&
        course.title &&
        String(itemTitle)
            .trim()
            .toLowerCase() ===
        String(course.title)
            .trim()
            .toLowerCase()
    ) {

        return true;
    }


    return false;
}


//=====================================================
// RENDER CERTIFICATE
//=====================================================

function renderCertificate() {

    const studentName =
        student.studentName ||
        student.name ||
        student.email ||
        "Student";


    const courseName =
        course.title ||
        "Course";


    const completionDate =
        getCompletionDate();


    const certificateId =
        generateCertificateId();


    //=================================================
    // STUDENT NAME
    //=================================================

    setText(
        "studentName",
        studentName
    );


    setText(
        "certificateStudentName",
        studentName
    );


    setText(
        "name",
        studentName
    );


    //=================================================
    // COURSE NAME
    //=================================================

    setText(
        "courseName",
        courseName
    );


    setText(
        "certificateCourseName",
        courseName
    );


    setText(
        "courseTitle",
        courseName
    );


    //=================================================
    // DATE
    //=================================================

    setText(
        "completionDate",
        completionDate
    );


    setText(
        "certificateDate",
        completionDate
    );


    setText(
        "date",
        completionDate
    );


    //=================================================
    // CERTIFICATE ID
    //=================================================

    setText(
        "certificateId",
        certificateId
    );


    setText(
        "certificateNumber",
        certificateId
    );


    //=================================================
    // INSTRUCTOR
    //=================================================

    setText(
        "instructorName",
        course.instructor ||
        "Course Instructor"
    );


    setText(
        "instructor",
        course.instructor ||
        "Course Instructor"
    );


    //=================================================
    // DOCUMENT TITLE
    //=================================================

    document.title =
        `Certificate - ${courseName}`;
}


//=====================================================
// COMPLETION DATE
//=====================================================

function getCompletionDate() {

    const possibleDate =

        enrollment
            ?.completionDate

        ||

        progressRecord
            ?.completedAt

        ||

        progressRecord
            ?.updatedAt;


    if (!possibleDate) {

        return new Date()
            .toLocaleDateString(
                "en-US",
                {
                    day:
                        "numeric",

                    month:
                        "long",

                    year:
                        "numeric"
                }
            );
    }


    const parsed =
        new Date(
            possibleDate
        );


    if (
        Number.isNaN(
            parsed.getTime()
        )
    ) {

        return possibleDate;
    }


    return parsed
        .toLocaleDateString(
            "en-US",
            {
                day:
                    "numeric",

                month:
                    "long",

                year:
                    "numeric"
            }
        );
}


//=====================================================
// CERTIFICATE ID
//=====================================================

function generateCertificateId() {

    const studentPart =
        String(
            student.studentId ||
            student.id ||
            "STUDENT"
        )
            .replace(
                /[^a-zA-Z0-9]/g,
                ""
            )
            .toUpperCase();


    const coursePart =
        String(
            course.courseKey ||
            course.key ||
            course.id ||
            "COURSE"
        )
            .replace(
                /[^a-zA-Z0-9]/g,
                ""
            )
            .toUpperCase();


    const year =
        new Date()
            .getFullYear();


    return (
        `CMS-${studentPart}-${coursePart}-${year}`
    );
}


//=====================================================
// PRINT CERTIFICATE
//=====================================================

function printCertificate() {

    window.print();
}


//=====================================================
// DOWNLOAD CERTIFICATE
//=====================================================

function downloadCertificate() {

    /*
     * Browser print dialog allows:
     *
     * Destination → Save as PDF
     *
     * This avoids adding another PDF library.
     */

    window.print();
}


//=====================================================
// BACK TO MY COURSES
//=====================================================

function backToMyCourses() {

    window.location.href =
        "/my-courses";
}


//=====================================================
// GO TO DASHBOARD
//=====================================================

function goToDashboard() {

    window.location.href =
        "/student-dashboard";
}


//=====================================================
// INITIALIZE BUTTONS
//=====================================================

function initializeCertificateButtons() {

    bindButton(
        "printBtn",
        printCertificate
    );


    bindButton(
        "downloadBtn",
        downloadCertificate
    );


    bindButton(
        "backBtn",
        backToMyCourses
    );


    bindButton(
        "dashboardBtn",
        goToDashboard
    );


    bindButton(
        "logoutBtn",
        logout
    );
}


//=====================================================
// BIND BUTTON
//=====================================================

function bindButton(
    id,
    handler
) {

    const button =
        document.getElementById(
            id
        );


    if (
        !button ||
        button.dataset.initialized ===
            "true"
    ) {

        return;
    }


    button.dataset.initialized =
        "true";


    button.addEventListener(
        "click",
        handler
    );
}


//=====================================================
// LOGOUT
//=====================================================

async function logout() {

    try {

        await clearSessions();

    }

    catch (error) {

        console.error(
            "Logout Error:",
            error
        );
    }


    alert(
        "Logged Out Successfully."
    );


    window.location.replace(
        "/login"
    );
}


//=====================================================
// HELPER
//=====================================================

function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.textContent =
            value;
    }
}


//=====================================================
// REACT-SAFE INITIALIZATION
//=====================================================

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeCertificate,
        {
            once: true
        }
    );

}

else {

    initializeCertificate();
}


//=====================================================
// GLOBAL FUNCTIONS
//=====================================================

window.printCertificate =
    printCertificate;

window.downloadCertificate =
    downloadCertificate;

window.backToMyCourses =
    backToMyCourses;

window.goToDashboard =
    goToDashboard;

window.logout =
    logout;