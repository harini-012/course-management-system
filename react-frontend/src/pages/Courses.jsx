import PageShell from "../components/PageShell";
import PageCss from "../components/PageCss";
import LegacyScript from "../components/LegacyScript";

import CourseCard from "../components/CourseCard";


function Courses() {

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
                    />


                    <h2>
                        Available Courses
                    </h2>


                    <div
                        className="cards"
                        id="courseContainer"
                    >

                        <CourseCard
                            image="https://cdn-icons-png.flaticon.com/512/5968/5968350.png"
                            alt="Python"
                            title="Python Programming"
                            description="Learn Python from beginner to advanced level."
                            courseKey="python"
                        />


                        <CourseCard
                            image="https://cdn-icons-png.flaticon.com/512/1006/1006363.png"
                            alt="Web Development"
                            title="Web Development"
                            description="Create modern websites using HTML, CSS and JavaScript."
                            courseKey="web"
                        />


                        <CourseCard
                            image="https://cdn-icons-png.flaticon.com/512/226/226777.png"
                            alt="Java Programming"
                            title="Java Programming"
                            description="Master Java and object-oriented programming."
                            courseKey="java"
                        />


                        <CourseCard
                            image="https://cdn-icons-png.flaticon.com/512/4248/4248443.png"
                            alt="Database Management"
                            title="Database Management"
                            description="Learn SQL and MySQL database concepts."
                            courseKey="database"
                        />


                        <CourseCard
                            image="https://cdn-icons-png.flaticon.com/512/2103/2103633.png"
                            alt="Machine Learning"
                            title="Machine Learning"
                            description="Introduction to AI and predictive models."
                            courseKey="machinelearning"
                        />


                        <CourseCard
                            image="https://cdn-icons-png.flaticon.com/512/3064/3064197.png"
                            alt="Cyber Security"
                            title="Cyber Security"
                            description="Protect systems against cyber threats."
                            courseKey="cybersecurity"
                        />


                        <CourseCard
                            image="https://cdn-icons-png.flaticon.com/512/4712/4712027.png"
                            alt="Artificial Intelligence"
                            title="Artificial Intelligence"
                            description="Learn the fundamentals of intelligent systems and AI applications."
                            courseKey="artificialintelligence"
                        />


                        <CourseCard
                            image="https://cdn-icons-png.flaticon.com/512/4144/4144513.png"
                            alt="Cloud Computing"
                            title="Cloud Computing"
                            description="Learn cloud technologies and deploy scalable applications."
                            courseKey="cloudcomputing"
                        />


                        <CourseCard
                            image="https://cdn-icons-png.flaticon.com/512/888/888879.png"
                            alt="Mobile App Development"
                            title="Mobile App Development"
                            description="Build Android applications with modern user interfaces."
                            courseKey="mobiledevelopment"
                        />


                        <CourseCard
                            image="https://cdn-icons-png.flaticon.com/512/2721/2721297.png"
                            alt="DevOps"
                            title="DevOps"
                            description="Master modern software deployment and automation tools."
                            courseKey="devops"
                        />

                    </div>

                </section>

            </PageShell>


            <LegacyScript
                src="/legacy/js/courses.js"
            />

        </>

    );

}


export default Courses;