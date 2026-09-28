import {
    useEffect
} from "react";


function PageCss({
    href
}) {

    useEffect(
        () => {

            if (!href) {

                return;
            }


            const existing =
                document.querySelector(
                    `link[data-page-css="${href}"]`
                );


            if (existing) {

                return;
            }


            const link =
                document.createElement(
                    "link"
                );


            link.rel =
                "stylesheet";


            link.href =
                href;


            link.setAttribute(
                "data-page-css",
                href
            );


            document.head.appendChild(
                link
            );


            return () => {

                if (
                    link.parentNode
                ) {

                    link.parentNode
                        .removeChild(
                            link
                        );
                }
            };

        },
        [href]
    );


    return null;
}


export default PageCss;