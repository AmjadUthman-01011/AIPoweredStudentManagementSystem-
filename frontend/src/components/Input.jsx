export default function Input({
    label,
    className = "",
    ...props
}) {
    return (
        <div className="space-y-2">

            {label && (
                <label className="block text-sm font-semibold text-slate-700">
                    {label}
                </label>
            )}

            <input
                className={`
                    w-full
                    h-10
                    px-3
                    rounded-lg
                    border
                    border-slate-200
                    bg-white
                    text-sm
                    text-slate-900
                    outline-none

                    placeholder:text-slate-400

                    focus:border-secondary
                    focus:ring-2
                    focus:ring-secondary/20

                    transition-all

                    ${className}
                `}
                {...props}
            />

        </div>
    );
}