import { message } from "antd";
import React, { useEffect, useState } from "react";
import { getUserInfo } from "../apicalls/users";
import { useDispatch, useSelector } from "react-redux";
import { SetUser } from "../redux/usersSlice.js";
import { useNavigate } from "react-router-dom";
import { auth, db } from "./firebase.js";
import { collection, getDocs } from "firebase/firestore";
import { HideLoading, ShowLoading } from "../redux/loaderSlice";

function ProtectedRoute({ children }) {
  const [menu, setMenu] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const userMenu = [
    {
      title: "Home",
      paths: ["/", "/user/write-exam"],
      icon: <i className="ri-home-line"></i>,
      onClick: () => navigate("/"),
    },
    {
      title: "Reports",
      paths: ["/user/reports"],
      icon: <i className="ri-bar-chart-line"></i>,
      onClick: () => navigate("/user/reports"),
    },
    {
      title: "Leaderboard",
      paths: ["/leaderboard"],
      icon: <i className="ri-heart-line"></i>,
      onClick: () => navigate("/leaderboard"),
    },
    {
      title: "Profile",
      paths: ["/profile"],
      icon: <i className="ri-user-line"></i>,
      onClick: () => navigate("/profile"),
    },
    {
      title: "Logout",
      paths: ["/logout"],
      icon: <i className="ri-logout-box-line"></i>,
      onClick: () => {
        localStorage.removeItem("token");
        navigate("/login");
      },
    },
  ];

  const adminMenu = [
    {
      title: "Home",
      paths: ["/", "/user/write-exam"],
      icon: <i className="ri-home-line"></i>,
      onClick: () => navigate("/"),
    },
    {
      title: "Quizzes",
      paths: ["/admin/exams", "/admin/exams/add"],
      icon: <i className="ri-file-list-line"></i>,
      onClick: () => navigate("/admin/exams"),
    },
    {
      title: "Leaderboard",
      paths: ["/leaderboard"],
      icon: <i className="ri-heart-line"></i>,
      onClick: () => navigate("/leaderboard"),
    },
    // {
    //   title: "Reports",
    //   paths: ["/admin/reports"],
    //   icon: <i className="ri-bar-chart-line"></i>,
    //   onClick: () => navigate("/admin/reports"),
    // },
    {
      title: "Profile",
      paths: ["/profile"],
      icon: <i className="ri-user-line"></i>,
      onClick: () => navigate("/profile"),
    },
    {
      title: "Logout",
      paths: ["/logout"],
      icon: <i className="ri-logout-box-line"></i>,
      onClick: () => {
        localStorage.removeItem("token");
        navigate("/login");
      },
    },
  ];
  useEffect(() => {
  const fetchSubjects = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "Users"));
      const userData = querySnapshot.docs;
      const menu = userData.role === "admin" ? adminMenu : userMenu;
      setMenu(menu);
    } catch (error) {
      console.error("Error fetching subjects: ", error);
    }
  };

  fetchSubjects();
}, []);
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
          const menu = doc.data().role === "admin" ? adminMenu : userMenu;
          setMenu(menu);
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

  const activeRoute = window.location.pathname;

  const getIsActiveOrNot = (paths) => {
    if (paths.includes(activeRoute)) {
      return true;
    } else {
      if (
        activeRoute.includes("/admin/exams/edit") &&
        paths.includes("/admin/exams")
      ) {
        return true;
      }
      if (
        activeRoute.includes("/user/write-exam") &&
        paths.includes("/user/write-exam")
      ) {
        return true;
      }
    }
    return false;
  };

  return (
    <div className="layout">
      <div className="flex w-full h-full h-100">
        <div className="sidebar" style={{display:"grid", gridTemplateRows:"min-content 10fr"}}>
        <div style={{fontSize:"3vh",color:"#ffffff", padding:"1vh"}}>
                  KnowledgeQuiz
                </div>
          <div className="menu">
            {menu.map((item, index) => {
              return (
                <>
               
                <div
                  className={`menu-item ${
                    getIsActiveOrNot(item.paths) && "active-menu-item"
                  }`}
                  key={index}
                  onClick={item.onClick}
                >
                  {item.icon}
                  <span>{item.title}</span>
                </div>
                </>
              );
            })}
          </div>
        </div>
        <div className="body">
          <div className="content">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default ProtectedRoute;
