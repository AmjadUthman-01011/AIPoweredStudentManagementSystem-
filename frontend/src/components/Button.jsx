export default function Button({
    children,
    variant = "primary",
    className = "",
    ...props
}) {
    const variants = {
        primary: `
            bg-primary-container
            text-white
            hover:bg-primary
        `,

        secondary: `
            border
            border-slate-200
            text-secondary
            hover:bg-indigo-50
        `,

        ghost: `
            text-slate-600
            hover:bg-slate-100
        `,
    };

    return (
        <button
            className={`
                inline-flex
                items-center
                justify-center
                h-10
                px-4
                rounded-lg
                font-semibold
                text-sm
                transition-colors
                duration-200
                ${variants[variant]}
                ${className}
            `}
            {...props}
        >
            {children}
        </button>
    );
}