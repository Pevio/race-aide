import React, { useState, useEffect } from "react";
import { ReactComponent as OpenMenu } from "../res/burgerIcon.svg";
import { ReactComponent as CloseMenu } from "../res/xIcon.svg";

interface Props {
  children: React.ReactNode
  page?: React.ReactNode
}

export function SideMenu(props: Props) {
  type SideMenuStates = "NORMAL" | "EXPANDED" | "COLLAPSED"
  const getNewSideMenuCollapse = (): boolean => {
    return document.documentElement.clientWidth < 1000
  }
  const [sideMenuState, setSideMenuState] = useState<SideMenuStates>(getNewSideMenuCollapse() ? "COLLAPSED" : "NORMAL")

  useEffect(() => {
    const listener = () => {
      const smallScreen = getNewSideMenuCollapse();
      if (smallScreen && sideMenuState === "NORMAL") setSideMenuState("COLLAPSED")
      if (!smallScreen && sideMenuState !== "NORMAL") setSideMenuState("NORMAL")
    }

    window.addEventListener("resize", listener)
    return () => {
      window.removeEventListener("resize", listener)
    }
  })

  const getSiderContent = (): {content: React.ReactNode, width: number} => {
    switch (sideMenuState) {
      case "NORMAL":
        return {content: props.children, width: 180}
      case "COLLAPSED":
        return {
          content: <button className="highlight-button" style={{marginLeft: -4}} onClick={() => {
            setSideMenuState("EXPANDED")
          }}>
            <OpenMenu width={32} height={32} />
          </button>, width: 36
        };
      case "EXPANDED":
        return {
          content: <>
            <div style={{marginBottom: 24}}>
              <button className="highlight-button" onClick={() => {
                setSideMenuState("COLLAPSED")
              }}>
                <CloseMenu width={32} height={32} />
              </button>
            </div>
            {props.children}
          </>, width: 180
        };
    }
  }
  const {content, width} = getSiderContent()

  return (
    <>
      <div className="sider" style={{width}}>
        {content}
      </div>
      {props.page &&
        <div className="page" style={{marginLeft: width + 32}}>
          {props.page}
        </div>
      }
    </>
  )
}