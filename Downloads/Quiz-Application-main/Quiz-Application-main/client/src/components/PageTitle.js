import React, { useState, useEffect } from 'react';
import styles from "./PageTitle.module.css";
import { getUserInfo } from '../apicalls/users';

function PageTitle({title}) {
  const [user, setUser] = useState();
  const getUserData = async () => {
    try {
      const response = await getUserInfo();
      setUser(response.data);
      } catch (error) {
    }
  };
  useEffect(() => {
      getUserData();
  }, []);

  return (
       <div className={styles.mainDiv}>
        <hr />
        <div className={styles.innerDiv}>
        <h1>{title}</h1>
        <div style={{display:"grid"}}> Hi {user?.name}
        <span>User Role: {user?.isAdmin ? "Admin" : "User"}</span></div>
        </div>
        <hr/>
    </div>
  )
}

export default PageTitle