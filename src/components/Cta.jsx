import { useNavigate } from "react-router-dom"

export default function Cta({ flex = 'row' }) {

    const navigate = useNavigate();
    return (<div className={`flex flex-${flex} space-x-3`}>
        <button
            onClick={() => navigate('/login')}
            className="px-6 py-2 text-primary border-primary border-2 hover:text-primary hover:bg-white rounded-lg font-medium transition"
        >
            Login
        </button>
        <div className="flex flex-col mt-2 md:mt-0 justify-between items-center">

            <button
                onClick={() => navigate('/signup')}
                className="px-6 py-2 w-fit bg-primary text-white rounded-lg hover:opacity-90 font-medium transition"
            >
                Sign Up
            </button>
        </div>

    </div>)
}