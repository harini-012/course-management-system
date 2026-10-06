import {
    useEffect,
    useMemo,
    useState
} from "react";

import PageShell
    from "../components/PageShell";

import PageCss
    from "../components/PageCss";

import CourseCard
    from "../components/CourseCard";


const API_URL =
    "http://localhost:3001/api";


export default function Courses() {

    const [
        courses,
        setCourses
    ] = useState([]);


    const [
        loading,
        setLoading
    ] = useState(true);


    const [
        error,
        setError
    ] = useState("");


    const [
        search,
        setSearch
    ] = useState("");


    //=================================================
    // LOAD COURSES
    //=================================================

    useEffect(
        () => {

            let cancelled =
                false;


            async function loadCourses() {

                try {

                    setLoading(
                        true
                    );


                    setError(
                        ""
                    );


                    const response =
                        await fetch(
                            `${API_URL}/courses`
                        );


                    if (!response.ok) {

                        throw new Error(
                            "Unable to load courses."
                        );
                    }


                    const data =
                        await response.json();


                    if (!cancelled) {

                        setCourses(
                            Array.isArray(data)
                                ? data
                                : []
                        );
                    }

                }

                catch (error) {

                    console.error(
                        "Course Loading Error:",
                        error
                    );


                    if (!cancelled) {

                        setCourses(
                            []
                        );


                        setError(
                            "Unable to load courses. Please try again."
                        );
                    }

                }

                finally {

                    if (!cancelled) {

                        setLoading(
                            false
                        );
                    }
                }
            }


            loadCourses();


            return () => {

                cancelled =
                    true;
            };

        },
        []
    );


    //=================================================
    // SEARCH
    //=================================================

    const filteredCourses =
        useMemo(
            () => {

                const value =
                    search
                        .trim()
                        .toLowerCase();


                if (!value) {

                    return courses;
                }


                return courses.filter(
                    course => {

                        const searchableText =
                            [
                                course.title,
                                course.overview,
                                course.description,
                                course.instructor,
                                course.level,
                                course.mode
                            ]
                                .filter(Boolean)
                                .join(" ")
                                .toLowerCase();


                        return searchableText.includes(
                            value
                        );
                    }
                );

            },
            [
                courses,
                search
            ]
        );


    return (

        <>

            <PageCss
                href="/css/courses.css"
            />


            <PageShell
                variant="student"
            >

                <section
                    className="features"
                    id="courseList"
                >

                    <input
                        type="text"
                        id="searchCourse"
                        placeholder="Search Courses..."
                        value={search}
                        onChange={
                            event =>
                                setSearch(
                                    event.target.value
                                )
                        }
                    />


                    <h2>
                        Available Courses
                    </h2>


                    <div
                        className="cards"
                        id="courseContainer"
                    >

                        {loading && (

                            <p>
                                Loading Courses...
                            </p>

                        )}


                        {!loading &&
                            error && (

                            <p>
                                {error}
                            </p>

                        )}


                        {!loading &&
                            !error &&
                            filteredCourses.length === 0 && (

                            <p>
                                No Courses Available.
                            </p>

                        )}


                        {!loading &&
                            !error &&
                            filteredCourses.map(
                                course => {

                                    const courseKey =
                                        course.courseKey ||
                                        course.key ||
                                        course.id;


                                    return (

                                        <CourseCard
                                            key={courseKey}

                                            image={
                                                course.image ||
                                                "https://cdn-icons-png.flaticon.com/512/2103/2103633.png"
                                            }

                                            alt={
                                                course.title
                                            }

                                            title={
                                                course.title
                                            }

                                            description={
                                                course.overview ||
                                                course.description ||
                                                ""
                                            }

                                            courseKey={
                                                courseKey
                                            }
                                        />

                                    );
                                }
                            )}

                    </div>

                </section>

            </PageShell>

        </>
    );
}