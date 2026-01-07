import { useNavigate } from "react-router-dom"

export default function Cta({flex = 'row'}) {
    const navigate = useNavigate();
    return (
        <div className={`flex flex-${flex} md:space-x-3 md:space-y-0 space-y-5 *:cursor-pointer justify-center items-center`}>
            <button
                onClick={() => navigate('/login')}
                className="w-fit sm:w-auto px-5 py-1.5 bg-primary text-white text-base rounded-lg hover:opacity-90 font-medium transition shadow-lg hover:shadow-xl"
            >
                Login
            </button>
            <button
                onClick={() => navigate('/signup')}
                className="w-fit sm:w-auto px-5 py-1.5 bg-white border-2 border-primary text-primary text-base rounded-lg hover:bg-primary/10 font-medium transition"
            >
                Sign Up
            </button>
        </div>
    )
}