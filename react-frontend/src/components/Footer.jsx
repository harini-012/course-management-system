function Footer({
    variant = "standard"
}) {

    // =============================================
    // ADMIN FOOTER
    // =============================================

    if (
        variant === "admin"
    ) {

        return (

            <footer
                style={{
                    width: "100%",
                    marginTop: "40px",
                    padding: "22px 25px",
                    textAlign: "center",
                    color: "#ffffff",
                    background: "#1e3a8a",
                    borderTop: "1px solid #1d4ed8",
                    boxShadow:
                        "0 -2px 10px rgba(15, 23, 42, 0.08)"
                }}
            >

                <p
                    style={{
                        margin: 0,
                        color: "#ffffff",
                        fontSize: "14px",
                        fontWeight: "500"
                    }}
                >
                    © 2026 Student Course Management System | Administrator Panel
                </p>

            </footer>
        );
    }


    // =============================================
    // START COURSE / LEARNING FOOTER
    // =============================================

    if (
        variant === "learn"
    ) {

        return (

            <footer
                style={{
                    width: "100%",
                    marginTop: "0",
                    padding: "22px 25px",
                    textAlign: "center",
                    background: "#1e3a8a",
                    color: "#ffffff"
                }}
            >

                <p
                    style={{
                        margin: 0,
                        color: "#ffffff",
                        fontSize: "14px",
                        fontWeight: "500"
                    }}
                >
                    © 2026 Student Course Management System | Learn • Practice • Grow
                </p>

            </footer>
        );
    }


    // =============================================
    // STANDARD STUDENT FOOTER
    // =============================================

    return (

        <footer
            style={{
                width: "100%",
                marginTop: "40px",
                padding: "22px 25px",
                textAlign: "center",
                background: "#1e3a8a",
                color: "#ffffff"
            }}
        >

            <p
                style={{
                    margin: 0,
                    color: "#ffffff",
                    fontSize: "14px",
                    fontWeight: "500"
                }}
            >
                © 2026 Student Course Management System
            </p>

        </footer>
    );
}


export default Footer;