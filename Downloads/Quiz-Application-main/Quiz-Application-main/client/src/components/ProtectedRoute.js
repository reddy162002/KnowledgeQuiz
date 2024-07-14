import { message } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { auth, db } from "./firebase.js";
import { collection, getDocs } from "firebase/firestore";
import { HideLoading, ShowLoading } from "../redux/loaderSlice";

function ProtectedRoute({ children }) {
  const [menu, setMenu] = useState([]);
  const [activeRoute, setActiveRoute] = useState(window.location.pathname);
  const [key, setKey] = useState(new Date().getTime());
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleMenuClick = (path) => {
    setActiveRoute(path);
    setKey(new Date().getTime()); // Update key to force re-render
    navigate(path, { replace: true });
  };

  const userMenu = [
    {
      title: "Home",
      paths: ["/"],
      icon: <i className="ri-home-line"></i>,
      onClick: () => handleMenuClick("/"),
    },
    {
      title: "Reports",
      paths: ["/user/reports"],
      icon: <i className="ri-bar-chart-line"></i>,
      onClick: () => handleMenuClick("/user/reports"),
    },
    {
      title: "Leaderboard",
      paths: ["/leaderboard"],
      icon: <i className="ri-heart-line"></i>,
      onClick: () => handleMenuClick("/leaderboard"),
    },
    {
      title: "Profile",
      paths: ["/profile"],
      icon: <i className="ri-user-line"></i>,
      onClick: () => handleMenuClick("/profile"),
    },
    {
      title: "Logout",
      paths: ["/logout"],
      icon: <i className="ri-logout-box-line"></i>,
      onClick: () => {
        localStorage.removeItem("token");
        handleMenuClick("/login");
      },
    },
  ];

  const adminMenu = [
    {
      title: "Home",
      paths: ["/"],
      icon: <i className="ri-home-line"></i>,
      onClick: () => handleMenuClick("/"),
    },
    {
      title: "Quizzes",
      paths: ["/admin/exams", "/admin/exams/add"],
      icon: <i className="ri-file-list-line"></i>,
      onClick: () => handleMenuClick("/admin/exams"),
    },
    {
      title: "Leaderboard",
      paths: ["/leaderboard"],
      icon: <i className="ri-heart-line"></i>,
      onClick: () => handleMenuClick("/leaderboard"),
    },
    {
      title: "Profile",
      paths: ["/profile"],
      icon: <i className="ri-user-line"></i>,
      onClick: () => handleMenuClick("/profile"),
    },
    {
      title: "Logout",
      paths: ["/logout"],
      icon: <i className="ri-logout-box-line"></i>,
      onClick: () => {
        localStorage.removeItem("token");
        handleMenuClick("/login");
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
        <div className="sidebar" style={{ display: "grid", gridTemplateRows: "min-content 10fr" }}>
          <div style={{ fontSize: "3vh", color: "#ffffff", padding: "1vh" }}>
            KnowledgeQuiz
          </div>
          <div className="menu">
            {menu.map((item, index) => {
              return (
                <div
                  className={`menu-item ${getIsActiveOrNot(item.paths) && "active-menu-item"}`}
                  key={index}
                  onClick={item.onClick}
                >
                  {item.icon}
                  <span>{item.title}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="body">
          <div className="content" key={key}>{children}</div>
        </div>
      </div>
    </div>
  );
}

export default ProtectedRoute;
