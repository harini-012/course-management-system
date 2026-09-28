import { useEffect } from "react";


export default function LegacyScript({
    src
}) {

    useEffect(() => {

        if (!src) {
            return;
        }


        /*
         * IMPORTANT
         *
         * React Router does not reload the browser when
         * navigating between pages.
         *
         * ES module scripts with the same URL may already
         * be evaluated/cached.
         *
         * Adding a unique query value makes the page's
         * legacy module execute every time the React page
         * is mounted.
         */

        const uniqueSrc =
            `${src}?pageLoad=${Date.now()}`;


        const script =
            document.createElement(
                "script"
            );


        script.src =
            uniqueSrc;


        script.type =
            "module";


        script.async =
            false;


        script.setAttribute(
            "data-legacy-script",
            src
        );


        script.onload = () => {

            console.log(
                `Loaded: ${src}`
            );
        };


        script.onerror = error => {

            console.error(
                `Unable to load legacy script: ${src}`,
                error
            );
        };


        document.body.appendChild(
            script
        );


        return () => {

            if (
                script &&
                script.parentNode
            ) {

                script.parentNode.removeChild(
                    script
                );
            }


            /*
             * Remove old page-specific global handlers.
             * The next page script will recreate the
             * handlers that it needs.
             */

            const remainingScripts =
                document.querySelectorAll(
                    `script[data-legacy-script="${src}"]`
                );


            remainingScripts.forEach(
                oldScript => {

                    if (
                        oldScript !== script
                    ) {
                        oldScript.remove();
                    }
                }
            );
        };

    }, [src]);


    return null;
}