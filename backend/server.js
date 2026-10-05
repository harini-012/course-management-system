const express = require("express");
const cors = require("cors");

const app = express();

const PORT = 3001;

// Existing JSON Server mock API
const MOCK_API_URL = "http://localhost:5000";


// =====================================================
// MIDDLEWARE
// =====================================================

app.use(cors());

app.use(express.json());


// =====================================================
// ALLOWED MOCK API RESOURCES
// =====================================================

const allowedResources = [
    "students",
    "admins",
    "courses",
    "enrollments",
    "progress",
    "sessions",
    "appState",
    "draftCourses"
];


// =====================================================
// CHECK RESOURCE
// =====================================================

function isValidResource(resource) {
    return allowedResources.includes(resource);
}


// =====================================================
// HOME ROUTE
// =====================================================

app.get("/", (req, res) => {

    res.json({
        application:
            "Student Course Management System",
        backend:
            "Node.js + Express.js",
        mockApi:
            "JSON Server",
        status:
            "running"
    });

});


// =====================================================
// GET ALL / QUERY
// =====================================================

app.get(
    "/api/:resource",
    async (req, res) => {

        try {

            const { resource } = req.params;

            if (!isValidResource(resource)) {

                return res.status(404).json({
                    message:
                        "Resource not found"
                });

            }


            const queryString =
                new URLSearchParams(
                    req.query
                ).toString();


            let url =
                `${MOCK_API_URL}/${resource}`;


            if (queryString) {
                url += `?${queryString}`;
            }


            const response =
                await fetch(url);


            const data =
                await response.json();


            return res
                .status(response.status)
                .json(data);

        }

        catch (error) {

            console.error(
                "GET Error:",
                error
            );


            return res.status(500).json({
                message:
                    "Unable to retrieve data"
            });

        }

    }
);


// =====================================================
// GET BY ID
// =====================================================

app.get(
    "/api/:resource/:id",
    async (req, res) => {

        try {

            const {
                resource,
                id
            } = req.params;


            if (!isValidResource(resource)) {

                return res.status(404).json({
                    message:
                        "Resource not found"
                });

            }


            const response =
                await fetch(
                    `${MOCK_API_URL}/${resource}/${encodeURIComponent(id)}`
                );


            if (response.status === 404) {

                return res.status(404).json({
                    message:
                        "Record not found"
                });

            }


            const data =
                await response.json();


            return res
                .status(response.status)
                .json(data);

        }

        catch (error) {

            console.error(
                "GET BY ID Error:",
                error
            );


            return res.status(500).json({
                message:
                    "Unable to retrieve record"
            });

        }

    }
);


// =====================================================
// POST
// =====================================================

app.post(
    "/api/:resource",
    async (req, res) => {

        try {

            const { resource } = req.params;


            if (!isValidResource(resource)) {

                return res.status(404).json({
                    message:
                        "Resource not found"
                });

            }


            const response =
                await fetch(
                    `${MOCK_API_URL}/${resource}`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                req.body
                            )
                    }
                );


            const data =
                await response.json();


            return res
                .status(response.status)
                .json(data);

        }

        catch (error) {

            console.error(
                "POST Error:",
                error
            );


            return res.status(500).json({
                message:
                    "Unable to create record"
            });

        }

    }
);


// =====================================================
// PUT
// =====================================================

app.put(
    "/api/:resource/:id",
    async (req, res) => {

        try {

            const {
                resource,
                id
            } = req.params;


            if (!isValidResource(resource)) {

                return res.status(404).json({
                    message:
                        "Resource not found"
                });

            }


            const response =
                await fetch(
                    `${MOCK_API_URL}/${resource}/${encodeURIComponent(id)}`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                req.body
                            )
                    }
                );


            const data =
                await response.json();


            return res
                .status(response.status)
                .json(data);

        }

        catch (error) {

            console.error(
                "PUT Error:",
                error
            );


            return res.status(500).json({
                message:
                    "Unable to update record"
            });

        }

    }
);


// =====================================================
// PATCH
// =====================================================

app.patch(
    "/api/:resource/:id",
    async (req, res) => {

        try {

            const {
                resource,
                id
            } = req.params;


            if (!isValidResource(resource)) {

                return res.status(404).json({
                    message:
                        "Resource not found"
                });

            }


            const response =
                await fetch(
                    `${MOCK_API_URL}/${resource}/${encodeURIComponent(id)}`,
                    {
                        method: "PATCH",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                req.body
                            )
                    }
                );


            const data =
                await response.json();


            return res
                .status(response.status)
                .json(data);

        }

        catch (error) {

            console.error(
                "PATCH Error:",
                error
            );


            return res.status(500).json({
                message:
                    "Unable to update record"
            });

        }

    }
);


// =====================================================
// DELETE
// =====================================================

app.delete(
    "/api/:resource/:id",
    async (req, res) => {

        try {

            const {
                resource,
                id
            } = req.params;


            if (!isValidResource(resource)) {

                return res.status(404).json({
                    message:
                        "Resource not found"
                });

            }


            const response =
                await fetch(
                    `${MOCK_API_URL}/${resource}/${encodeURIComponent(id)}`,
                    {
                        method:
                            "DELETE"
                    }
                );


            if (!response.ok) {

                return res.status(
                    response.status
                ).json({
                    success: false,
                    message:
                        "Unable to delete record"
                });

            }


            return res.status(200).json({
                success: true,
                message:
                    "Record deleted successfully"
            });

        }

        catch (error) {

            console.error(
                "DELETE Error:",
                error
            );


            return res.status(500).json({
                success: false,
                message:
                    "Unable to delete record"
            });

        }

    }
);


// =====================================================
// START EXPRESS SERVER
// =====================================================

app.listen(
    PORT,
    () => {

        console.log(
            "======================================"
        );

        console.log(
            "Student Course Management System"
        );

        console.log(
            `Express API: http://localhost:${PORT}`
        );

        console.log(
            `Mock API: ${MOCK_API_URL}`
        );

        console.log(
            "======================================"
        );

    }
);