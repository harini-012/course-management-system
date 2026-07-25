// ===============================
// GET STUDENT + COURSE
// ===============================

const student =
JSON.parse(localStorage.getItem("loggedInStudent"));

if (!student) {
    window.location.href = "login.html";
}

const studentKey = student.email;

const urlParams = new URLSearchParams(window.location.search);
const courseTitle = urlParams.get("course") || "Course";

// Confirm the student actually completed this course before issuing one
const isCompleted =
    localStorage.getItem(studentKey + "_" + courseTitle + "_completed") === "true";

if (!isCompleted) {
    alert("You need to complete this course before viewing its certificate.");
    window.location.href = "my_courses.html";
}

// Use today's date unless a completion date was already stored
const completionDateKey = studentKey + "_" + courseTitle + "_completedDate";

let completionDate = localStorage.getItem(completionDateKey);

if (!completionDate) {
    completionDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });
    localStorage.setItem(completionDateKey, completionDate);
}

const studentName =
    student.name || student.fullName || student.email.split("@")[0];

// ===============================
// DRAW CERTIFICATE ON CANVAS
// ===============================

const canvas = document.getElementById("certificateCanvas");
const ctx = canvas.getContext("2d");

const W = canvas.width;
const H = canvas.height;

function drawCertificate() {

    // Background
    ctx.fillStyle = "#FDF6E3";
    ctx.fillRect(0, 0, W, H);

    // Outer border
    ctx.strokeStyle = "#1E3A8A";
    ctx.lineWidth = 10;
    ctx.strokeRect(25, 25, W - 50, H - 50);

    // Inner gold border
    ctx.strokeStyle = "#C9A227";
    ctx.lineWidth = 3;
    ctx.strokeRect(45, 45, W - 90, H - 90);

    // Header
    ctx.fillStyle = "#1E3A8A";
    ctx.font = "bold 26px Georgia, serif";
    ctx.textAlign = "center";
    ctx.fillText("CourseMS", W / 2, 110);

    ctx.fillStyle = "#0F172A";
    ctx.font = "bold 52px Georgia, serif";
    ctx.fillText("Certificate of Completion", W / 2, 200);

    ctx.strokeStyle = "#C9A227";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 180, 225);
    ctx.lineTo(W / 2 + 180, 225);
    ctx.stroke();

    // Subtitle
    ctx.font = "20px Arial";
    ctx.fillStyle = "#334155";
    ctx.fillText("This certificate is proudly presented to", W / 2, 300);

    // Student name
    ctx.font = "italic bold 46px Georgia, serif";
    ctx.fillStyle = "#1E3A8A";
    ctx.fillText(studentName, W / 2, 375);

    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 250, 395);
    ctx.lineTo(W / 2 + 250, 395);
    ctx.stroke();

    // Course line
    ctx.font = "20px Arial";
    ctx.fillStyle = "#334155";
    ctx.fillText("for successfully completing the course", W / 2, 445);

    ctx.font = "bold 34px Georgia, serif";
    ctx.fillStyle = "#0F172A";
    ctx.fillText(courseTitle, W / 2, 500);

    // Date
    ctx.font = "18px Arial";
    ctx.fillStyle = "#475569";
    ctx.fillText("Completed on " + completionDate, W / 2, 560);

    // Signature area
    ctx.textAlign = "left";
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.moveTo(160, 730);
    ctx.lineTo(420, 730);
    ctx.stroke();
    ctx.font = "16px Arial";
    ctx.fillText("Course Instructor", 160, 755);

    ctx.beginPath();
    ctx.moveTo(W - 420, 730);
    ctx.lineTo(W - 160, 730);
    ctx.stroke();
    ctx.textAlign = "right";
    ctx.fillText("Date Issued", W - 160, 755);

    // Seal
    ctx.textAlign = "center";
    ctx.beginPath();
    ctx.arc(W / 2, 700, 45, 0, Math.PI * 2);
    ctx.fillStyle = "#C9A227";
    ctx.fill();
    ctx.fillStyle = "#0F172A";
    ctx.font = "bold 13px Arial";
    ctx.fillText("VERIFIED", W / 2, 695);
    ctx.fillText("COURSEMS", W / 2, 710);

}

drawCertificate();

// ===============================
// DOWNLOAD AS IMAGE
// ===============================

document.getElementById("downloadBtn").addEventListener("click", function () {

    const link = document.createElement("a");
    link.download = courseTitle.replace(/\s+/g, "_") + "_Certificate.png";
    link.href = canvas.toDataURL("image/png");
    link.click();

});

// ===============================
// PRINT
// ===============================

document.getElementById("printBtn").addEventListener("click", function () {

    window.print();

});

// ===============================
// BACK
// ===============================

document.getElementById("backBtn").addEventListener("click", function () {

    window.location.href = "my_courses.html";

});

function logout() {

    localStorage.removeItem("loggedInStudent");

    alert("Logged Out Successfully.");

    window.location.href = "login.html";

}
document.getElementById("logoutBtn").addEventListener("click", logout);