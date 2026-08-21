export default function Badge({ role }) {

    const styles = {
        ADMIN: "bg-blue-100 text-blue-800",
        TEACHER: "bg-indigo-100 text-indigo-800",
        STUDENT: "bg-slate-100 text-slate-700",
    };

    return (
        <span
            className={`
                inline-flex
                items-center
                px-3
                py-1
                rounded-full
                text-xs
                font-semibold
                ${styles[role] || styles.STUDENT}
            `}
        >
            {role}
        </span>
    );
}