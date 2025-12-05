import { useNavigate } from "react-router-dom"

export default function Cta({ flex = 'row' }) {

    const navigate = useNavigate();
    return (<div className={`flex flex-${flex} space-x-3`}>
        <button
            onClick={() => navigate('/login')}
            className="px-6 py-2 text-blue-600 hover:text-blue-700 hover:bg-white rounded-lg font-medium transition"
        >
            Login
        </button>
        <div className="flex flex-col mt-2 md:mt-0 justify-between items-center">

            <button
            onClick={() => navigate('/signup')}
            className="px-6 py-2 w-fit bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
        >
            Sign Up
        </button>
        </div>
        
    </div>)
}