import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { auth } from "../../../components/firebase";
import { toast } from "react-toastify";
import SignInwithGoogle from "./signInwithGoogle";
import DynamicForm from "../../../components/DynamicForm/dynamicForm";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isDisabled, setIsDisabled] = useState(false);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsDisabled(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("User logged in Successfully", {
        position: "top-center",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } catch (error) {
      toast.error(error.message, {
        position: "top-center",
      });
    } finally {
      setIsDisabled(false);
    }
  };

  const formProps = {
    inputKeys: ["email", "password"],
    labels: {
      email: "Email Address",
      password: "Password",
    },
    inputTypes: {
      email: "text",
      password: "password",

    },
    values: {
      email: email,
      password: password,
    },
    columns: 1,
    inputWidth: 100,
    onChangeHandlers: {
      email: (value) => setEmail(value),
      password: (value) => setPassword(value),
    },
    placeholders: {
      email: "Enter email",
      password: "Enter password",
    },
    validationRules: {}, 
  };

  return (
    <div className="flex justify-center items-center h-screen w-screen bg-primary">
      <div className="card w-400 p-3 bg-white">
        <div className="flex flex-col">
          <div style={{width:"30vw"}} className="flex">
            <h1 className="text-2xl">QUIZ - LOGIN <i class="ri-login-circle-line"></i></h1>
            
          </div>
          <div className="divider"></div>
          <form onSubmit={handleSubmit}>
      <DynamicForm {...formProps}/>

      <div style={{display:"flex", justifyContent:"space-between", margin:"3vh 2vw 0vh 2vw"}}>
      <p className="forgot-password text-right">
       {/* <a style={{color:"white", textDecoration: "none"}} href="/forgotPassword"> Forgot Password? </a> */}
       <a style={{color:"white", textDecoration: "none"}} href="/register"> Not a member? Please Register</a>
      </p>
        <button className="submitButton" type="submit" disabled={isDisabled}>
                  {isDisabled ? 'Loggin In...' : 'LogIn'}
        </button>
      </div>
      <SignInwithGoogle/>
    </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
