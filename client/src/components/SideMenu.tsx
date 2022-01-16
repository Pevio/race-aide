import React, { useState } from "react";


interface Props {
  children: React.ReactNode
}

export function SideMenu(props: Props) {
  const [sideMenuState, setSideMenuState] = useState<"NORMAL" | "EXPANDED" | "COLLAPSED">("NORMAL")

  return (
    <div className="sider">
      {props.children}
    </div>
  )
}