function MainPage() {
    return (

        <div className="outer-container h-screen bg-blue-200 text-red-400 flex justify-center items-center">
            
            <div className="bg-black h-5/6 w-5/6 md:w-4/6">
                <div className="search-container w-full h-20 bg-red-400 flex justify-center items-center">
                    <input className="h-10 text-lg w-full" type="text" />
                </div>
            </div>
        </div>
    );

}

export default MainPage