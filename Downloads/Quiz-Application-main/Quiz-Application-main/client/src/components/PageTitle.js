import React, { useState, useEffect } from 'react';
import styles from "./PageTitle.module.css";
import { getUserInfo } from '../apicalls/users';

import { auth, db } from "./firebase.js";
import { collection, getDocs } from "firebase/firestore";

function PageTitle({title}) {
  const [user, setUser] = useState();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchData = async () => {
    try {
      if (currentUser) {
        const querySnapshot = await getDocs(collection(db, "Users"));
        querySnapshot.forEach((doc) => {
          if (doc.id === currentUser.uid) {
            setUser(doc.data());
          }
        });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  return (
       <div className={styles.mainDiv}>
        <hr />
        <div className={styles.innerDiv}>
        <h1>{title}</h1>
        <div style={{display:"grid"}}> Hi {user?.name}
        <span>User Role: {user?.role === "admin" ? "Admin" : "User"}</span></div>
        </div>
        <hr/>
    </div>
  )
}

export default PageTitle