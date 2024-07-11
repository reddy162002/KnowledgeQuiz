import React, { useEffect, useState } from "react";
import { auth, db } from "../../../components/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import DynamicForm from "../../../components/DynamicForm/dynamicForm";
import { toast } from "react-toastify";
import PageTitle from "../../../components/PageTitle";

function Profile() {
  const [userDetails, setUserDetails] = useState(null);
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [photo, setPhoto] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [role, setRole] = useState("");
  const [isDisabled, setIsDisabled] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      auth.onAuthStateChanged(async (user) => {
        if (user) {
          const docRef = doc(db, "Users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setUserDetails(userData);
            setFname(userData.firstName || "");
            setLname(userData.lastName || "");
            setEmail(userData.email || ""); 
            setPhoto(userData.photo || ""); 
            setDob(userData.dateOfBirth || ""); 
            setRole(userData.role || ""); 
          } else {
            console.log("No such document!");
          }
        } else {
          console.log("User is not logged in");
        }
      });
    };

    fetchUserData();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsDisabled(true);
    try {
      const user = auth.currentUser;
      if (user) {
        await setDoc(doc(db, "Users", user.uid), {
          email, 
          firstName: fname,
          lastName: lname,
          photo, 
          dateOfBirth: dob,
          role,
        });
        toast.success("User's profile details updated successfully", {
          position: "top-center",
        });
      }
    } catch (error) {
      toast.error("Something went wrong while updating User's profile details. Try again after some time.", {
        position: "top-center",
      });
    } finally {
      setIsDisabled(false); 
    }
  };
  
  const formProps = {
    inputKeys: ["firstName", "lastName", "email", "dob"],
    labels: {
      firstName: "First Name",
      lastName: "Last Name",
      email: "Email Address",
      dob: "Date Of Birth"
    },
    inputTypes: {
      firstName: "text",
      lastName: "text",
      email: "textDisabled",
      dob: "date",
    },
    values: {
      firstName: fname,
      lastName: lname,
      email,
      dob,
    },
    columns: 1,
    inputWidth: 100,
    onChangeHandlers: {
      firstName: (value) => setFname(value),
      lastName: (value) => setLname(value),
      dob: (value) => setDob(value),
    },
    placeholders: {
      firstName: "Enter First Name",
      lastName: "Enter Last Name",
    },
    validationRules: {},
  };

  return (
    <div>
      <PageTitle title="Profile" />
      <div style={{ gridTemplateRows: "min-content", margin:"0vh 8vw" }}>
        {/* <div style={{ border: "2px solid #633172", padding: "5vh", width: "80%" }}> */}
          {userDetails ? (
            <>
              <form onSubmit={handleUpdate}>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  {photo && <img src={photo} width={"10%"} style={{ borderRadius: "50%" }} />}
                </div>
                <DynamicForm {...formProps} />
                <div style={{ display: "flex", justifyContent: "space-between", margin: "3vh 2vw 0vh 1.2vw" }}>
                  <button className="submitButton" type="submit" disabled={isDisabled}>
                    {isDisabled ? 'Updating ...' : 'Update Profile'}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <p>Loading... Please Wait a Moment</p>
          )}
        </div>
      </div>
    // </div>
  );
}

export default Profile;
