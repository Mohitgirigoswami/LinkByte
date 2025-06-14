import Login from "./Login";
import Register from "./Register";
import { useEffect, useState , useRef } from "react";
const Auth = () => {
    // const [isMob,setisMob] = useState(window.innerWidth < 768);
    const [loginTransition, setLoginTransition] = useState("translate-x-0");
    const [registerTransition, setRegisterTransition] = useState("-translate-x-full");

    if (localStorage.getItem('jwtToken')) {
        window.location.href = "/home";
    }

    const handleSwitch = () => {
        const temp = loginTransition;
        setLoginTransition(registerTransition);
        setRegisterTransition(temp);
    }

    const verifyemail = () => {
        return }
    // const handleResize = () => {
    //     setisMob(window.innerWidth < 768);
    // };
    // useEffect(() => {
    //     window.addEventListener("resize", handleResize);
    //     return () => {
    //         window.removeEventListener("resize", handleResize);
    //     };
    // }, []);

    // if (isMob){
    //     return (
    //         <div  className="overflow-clip relative flex justify-center items-center min-h-screen bg-gray-800">
    //             <Login handleSwitch={handleSwitch} Classplus={loginTransition + " absolute top-0 left-0 w-full h-full transition-transform duration-1000 ease-in-out"}/>
    //             <Register handleSwitch={handleSwitch} Classplus={ registerTransition + " absolute top-0 left-0 w-full h-full transition-transform duration-1000 ease-in-out"}/>
    //         </div>
    //     )
    // } 
    return (
            <div  className="overflow-clip relative flex justify-center items-center min-h-screen bg-gray-800">
                <Login handleSwitch={handleSwitch} Classplus={loginTransition + " absolute top-0 left-0 w-full h-full transition-transform duration-1000 ease-in-out"}/>
                <Register handleSwitch={handleSwitch} Classplus={ registerTransition + " absolute top-0 left-0 w-full h-full transition-transform duration-1000 ease-in-out"}/>
            </div>
        )
    
}
export default Auth;