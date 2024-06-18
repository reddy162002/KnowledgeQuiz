import React from "react";
import "./card.css";
import "../../index.css";

const StudentCard = ({
  height,
  width,
  children,
  borderStyle,
  backgroundColor,
  shadow,
}) => {
  const getBorderStyle = () => {
    switch (borderStyle) {
      case "dotted":
        return "2px dotted #CA8A04";
      case "normal":
        return "1px solid #CBD5E1";
      case "selected":
        return "1px solid #16A34A";
      case "normalselected":
        return "1px solid #ccc4ec";
      default:
        return "none";
    }
  };

  const cardStyle = {
    height: height,
    width: width,
    border: getBorderStyle(),
    padding: "1vh",
    backgroundColor: backgroundColor ? backgroundColor : "white"
  };

  return (
    <div className="studentCard" style={cardStyle}>
      {children}
    </div>
  );
};

export default StudentCard;
