import { Form, message } from "antd";
import React, {useState} from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../../../apicalls/users";
import { HideLoading, ShowLoading } from "../../../redux/loaderSlice";

function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [disabledButton, setDisabledButton] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPassword = (password) => {
    const numberRegex = /\d/;
    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>_\-+=\/\\[\];'~ ]/;
    return numberRegex.test(password) && specialCharRegex.test(password);
  };

  const onFinish = async (values) => {
    const { name, email, password, confirmPassword } = values;

    if (!validateEmail(email)) {
      message.error("Please enter a valid email address.");
      return;
    }

    if (!isValidPassword(password)) {
      message.error("Password must contain at least one number and one special character.");
      return;
    }

    if (password !== confirmPassword) {
      message.error("Passwords do not match.", {
        autoClose: 3000,
        position: "top-center",
      });
      return;
    }

    setDisabledButton(true);

    try {
      dispatch(ShowLoading());
      const response = await registerUser(values);

      dispatch(HideLoading());
      if (response.success) {
        message.success(response.message);
        navigate("/login");
      } else {
        message.error(response.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    } finally {
      setDisabledButton(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen w-screen bg-primary">
      <div className="card w-400 p-3 bg-white">
        <div className="flex flex-col">
          <h1 className="text-2xl">
            QUIZ - REGISTER<i class="ri-user-add-line"></i>
          </h1>
          <div className="divider"></div>
          <Form layout="vertical" className="mt-2" onFinish={onFinish}>
            <Form.Item name="name" label="Name"
             rules={[
              { required: true, message: "Please input your Name!" },
            ]}>

              <input type="text" />
            </Form.Item>

            <Form.Item
              name="dob"
              label="Date of Birth"
            >
              <input type="date" max={new Date().toISOString().split("T")[0]}/>
            </Form.Item>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Please input your email!" },
              ]}
            >
              <input type="text" />
            </Form.Item>
            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: "Please input your password!" },
                () => ({
                  validator(_, value) {
                    if (!value || isValidPassword(value)) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error(
                        "Password must contain at least one number and one special character."
                      )
                    );
                  },
                }),
              ]}
            >
            <input type="password" />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Confirm Password"
              dependencies={["password"]}
              rules={[
                {
                  required: true,
                  message: "Please confirm your password!",
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("The two passwords do not match!")
                    );
                  },
                }),
              ]}
            >
            <input type="password" />
            </Form.Item>

            <div className="flex flex-col gap-2">
              <button
                type="submit"
                className="primary-contained-btn mt-2 w-100"
              >
                Register
              </button>
              <Link to="/login">Already a member? Login</Link>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}

export default Register;
