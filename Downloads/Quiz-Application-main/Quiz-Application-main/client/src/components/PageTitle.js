import React from 'react'

function PageTitle({title, user}) {
  return (
       <div className="mt-2" style={{padding:"3vh"}}>
        <div className="divider"></div>
        <div style={{display:"flex", justifyContent:"space-between"}}>
        <h1 className="text-center">{title}</h1>
        <div style={{display:"grid", fontSize:"2vh"}}>{user}
        <span>User Role: Admin</span></div>
        </div>
        <hr/>
    </div>
  )
}

export default PageTitle