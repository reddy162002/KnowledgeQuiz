import React, { useState, useEffect } from 'react';
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
       <div className="mt-2" style={{padding:"3vh"}}>
        <div className="divider"></div>
        <div style={{display:"flex", justifyContent:"space-between"}}>
        <h1 className="text-center">{title}</h1>
        <div style={{display:"grid", fontSize:"2vh"}}> Hi {user?.name}
        <span>User Role: {user?.isAdmin ? "Admin" : "User"}</span></div>
        </div>
        <hr/>
    </div>
  )
}

export default PageTitle