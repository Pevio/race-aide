import React from "react";
import { useLocation } from "react-router";
import { Link } from "react-router-dom";
import siteIcon from "../res/icon.png";

interface Props {
  children: React.ReactNode;
}

export function HomePageWrapper(props: Props) {
  const location = useLocation();

  const getSideMenuItem = (text: string, to: string, hr: boolean = true) => {
    return (
      <>
        <div style={{ display: "flex" }}>
          <div
            className={`sider-bar ${location.pathname === to ? "sider-bar-active" : ""}`}
          />
          <Link to={to} className="highlight-button sider-link">
            {text}
          </Link>
        </div>
        {hr && <hr />}
      </>
    );
  };
  return (
    <>
      <div className="header" style={{ display: "flex" }}>
        <img
          src={siteIcon}
          style={{ height: 100, width: 100, marginLeft: 50 }}
          alt=""
        />
        <p
          style={{
            fontSize: 48,
            marginLeft: 32,
            marginTop: 12,
          }}
        >
          Race Aide
        </p>
      </div>
      <div className="sider">
        {getSideMenuItem("Upcoming Races", "/")}
        {getSideMenuItem("Create Race", "/createrace")}
        {getSideMenuItem("About", "/about", false)}
      </div>
      <div className="page">{props.children}</div>
    </>
  );
}
