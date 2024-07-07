import { Button } from "antd";
import "./stylesheets/theme.css";
import "./stylesheets/alignments.css";
import "./stylesheets/textelements.css";
import "./stylesheets/custom-components.css";
import "./stylesheets/form-elements.css";
import "./stylesheets/layout.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/common/Login";
import Register from "./pages/common/Register";
import Profile from "./pages/common/Profile/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/common/Home";
import Exams from "./pages/admin/Exams";
import AddEditExam from "./pages/admin/Exams/AddEditExam";
import { useState } from "react";
import { auth } from "./components/firebase";
import React, { useEffect } from "react";
import WriteExam from "./pages/user/WriteExam";
import UserReports from "./pages/user/UserReports";
import AdminReports from "./pages/admin/AdminReports";
import WhackAMole from "./pages/games/whackAMole";
import ConnectFourGame from "./pages/games/connect4";
import LeaderBoard from "./pages/common/LeaderBoard/LeaderBoard";

function App() {
  const [user, setUser] = useState();
  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      setUser(user);
    });
  });
  return (
    <>
      <BrowserRouter>
        <Routes>

          <Route path="/" element={user ? <ProtectedRoute>
                  <Home />
                </ProtectedRoute> : <Login />} />
        <Route
                path="/home"
                element={user ? <ProtectedRoute>
                  <Home />
                </ProtectedRoute> : <Login />}
              />

          {/* Common Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={
            <ProtectedRoute>
                <Profile />
              </ProtectedRoute>} />
          <Route path="/leaderboard" element={
            <ProtectedRoute>
                <LeaderBoard />
              </ProtectedRoute>} />

          {/* User Routes */}
          <Route
            path="/user/write-exam/:id"
            element={
              <ProtectedRoute>
                <WriteExam />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/reports"
            element={
              <ProtectedRoute>
                <UserReports />
              </ProtectedRoute>
            }
          />
          {/* Admin Routes */}
          <Route
            path="/admin/exams"
            element={
              <ProtectedRoute>
                <Exams />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/exams/add"
            element={
              <ProtectedRoute>
                <AddEditExam />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/exams/edit/:id"
            element={
              <ProtectedRoute>
                <AddEditExam />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute>
                <AdminReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/whackgame"
            element={
              <ProtectedRoute>
                <WhackAMole />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/connectFour"
            element={
              <ProtectedRoute>
                <ConnectFourGame />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
