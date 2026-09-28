import Navbar
    from "./Navbar";

import Footer
    from "./Footer";


function PageShell({
    children,
    variant = "student"
}) {

    let footerVariant =
        "standard";


    if (
        variant === "admin" ||
        variant === "adminnone"
    ) {

        footerVariant =
            "admin";
    }


    if (
        variant === "student3"
    ) {

        footerVariant =
            "learn";
    }


    return (

        <div
            className="page-shell"
            style={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column"
            }}
        >

            <Navbar
                variant={variant}
            />


            <div
                className="page-shell-content"
                style={{
                    flex: "1 0 auto"
                }}
            >

                {children}

            </div>


            <div
                style={{
                    flexShrink: 0
                }}
            >

                <Footer
                    variant={footerVariant}
                />

            </div>

        </div>
    );
}


export default PageShell;