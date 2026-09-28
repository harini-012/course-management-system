import {
    Link
} from "react-router-dom";


function CourseCard({
    image,
    alt,
    title,
    description,
    courseKey
}) {

    const safeCourseKey =
        courseKey
            ? encodeURIComponent(
                courseKey
            )
            : "";


    return (

        <div className="card">

            {image && (

                <img
                    src={image}
                    alt={
                        alt ||
                        title ||
                        "Course"
                    }
                />

            )}


            <h3>
                {title}
            </h3>


            <p>
                {description}
            </p>


            {safeCourseKey ? (

                <Link
                    className="btn viewCourseBtn"
                    to={`/courses/${safeCourseKey}`}
                    data-course={courseKey}
                >
                    View Details
                </Link>

            ) : (

                <button
                    type="button"
                    className="btn viewCourseBtn"
                    disabled
                >
                    View Details
                </button>

            )}

        </div>
    );
}


export default CourseCard;