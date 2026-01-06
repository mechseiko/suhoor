export default function Container({ children }) {
    return (
        <div className="max-w-7xl mx-auto px-[15px] lg:px-[40px] py-[5px]">
            {children}
        </div>
    );
}