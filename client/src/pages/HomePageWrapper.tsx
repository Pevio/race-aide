import React from "react";
import { useLocation } from "react-router";
import { Link } from "react-router-dom";
import { SideMenu } from "../components/SideMenu";
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
            className={`sider-bar ${
              location.pathname === to ? "sider-bar-active" : ""
            }`}
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
      <div className="header" style={{ paddingTop: 10 }}>
        <img src={siteIcon} style={{ height: 100, width: 100 }} alt="" />
        <p
          style={{
            fontSize: 52,
            marginLeft: 32,
            marginTop: 16,
          }}
        >
          Race Aide
        </p>
      </div>
      <SideMenu page={props.children}>
        {getSideMenuItem("Upcoming Races", "/")}
        {getSideMenuItem("Create Race", "/createrace")}
        {getSideMenuItem("About", "/about", false)}
      </SideMenu>
    </>
  );
}
