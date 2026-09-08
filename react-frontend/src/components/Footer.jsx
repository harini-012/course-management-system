function Footer({
    variant = "standard"
}) {

    if (variant === "admin") {

        return (

            <footer
                style={{
                    marginTop: "40px",
                    padding: "25px",
                    textAlign: "center",
                    color: "white",
                    background:
                        "rgba(255,255,255,.08)",
                    backdropFilter:
                        "blur(8px)"
                }}
            >

                <p>
                    © 2026 Student Course Management System | Administrator Panel
                </p>

            </footer>

        );

    }


    if (variant === "learn") {

        return (

            <footer>

                <p>
                    © 2026 Student Course Management System | Learn • Practice • Grow
                </p>

            </footer>

        );

    }


    return (

        <footer>

            <p>
                © 2026 Student Course Management System
            </p>

        </footer>

    );

}


export default Footer;