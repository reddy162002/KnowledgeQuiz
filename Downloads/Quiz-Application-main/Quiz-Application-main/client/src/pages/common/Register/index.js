import React, { useState } from "react";
import { auth, db } from "../../../components/firebase";
import { setDoc, doc } from "firebase/firestore";
import { toast } from "react-toastify";
import { createUserWithEmailAndPassword } from "firebase/auth";
import "./index.css";
import DynamicForm from "../../../components/DynamicForm/dynamicForm";

function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [dob, setDob] = useState("");
  const [isDisabled, setIsDisabled] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsDisabled(true); 
    try {
      if (confirmPassword !== password) {
        setIsDisabled(false); 
        toast.error("Passwords do not match", { position: "top-center" });
        return;
      }
      await createUserWithEmailAndPassword(auth, email, password);
      const user = auth.currentUser;
      if (user) {
        await setDoc(doc(db, "Users", user.uid), {
          email: user.email,
          firstName: firstName,
          lastName: lastName,
          dateOfBirth: dob,
          photo: ""
        });
      }

      toast.success("User Registered Successfully!!", {
        position: "top-center",
      });
      
      setTimeout(() => {
        window.location.href = "/login";
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
    inputKeys: ["firstName", "lastName", "dob", "email", "password", "confirmPassword"],
    labels: {
      firstName: "First Name",
      lastName: "Last Name",
      dob: "Date of Birth",
      email: "Email Address",
      password: "Password",
      confirmPassword: "Confirm Password",
    },
    inputTypes: {
      firstName: "text",
      lastName: "text",
      dob: "date",
      email: "text",
      password: "password",
      confirmPassword: "password",
    },
    values: {
      firstName: firstName,
      lastName: lastName,
      dob: dob,
      email: email,
      password: password,
      confirmPassword: confirmPassword,
    },
    columns: 1,
    inputWidth: 100,
    onChangeHandlers: {
      firstName: (value) => setFirstName(value),
      lastName: (value) => setLastName(value),
      dob: (value) => setDob(value),
      email: (value) => setEmail(value),
      password: (value) => setPassword(value),
      confirmPassword: (value) => setConfirmPassword(value),
    },
    placeholders: {
      firstName: "Enter your First Name",
      lastName: "Enter your Last Name",
      dob: "Enter your Date of Birth",
      email: "Enter your Email",
      password: "Enter Password",
      confirmPassword: "Confirm Password",
    },
    validationRules: {},
  };

  return (
    <div className="flex justify-center items-center h-screen w-screen bg-primary">
      <div className="card w-400 p-3 bg-white">
        <div style={{width:"30vw"}} className="flex flex-col">
          <h1 className="text-2xl">
            QUIZ - REGISTER <i className="ri-user-add-line"></i>
          </h1>
          <div className="divider"></div>
          <form onSubmit={handleRegister}>
            <DynamicForm {...formProps} />
            <div style={{ display: "flex", gap:"2vw", margin: "3vh 2vw 0vh 2vw" }}>
              <p className="forgot-password text-right">
                Already registered? Then <a style={{ color: "white", fontWeight: "900", textDecoration: "none" }} href="/login">Login</a>
              </p>
              <button className="submitButton" type="submit" disabled={isDisabled}>
                {isDisabled ? 'Signing Up...' : 'Sign Up'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
