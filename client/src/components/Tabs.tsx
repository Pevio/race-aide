import React, { CSSProperties } from "react";

interface Tab {
  title: string;
  key: string;
  tabStyle?: CSSProperties
}
interface Props {
  tabs: Tab[]
  style?: CSSProperties
  activeTab: string | number;
  onClickTab: (tabKey: string, tabIndex: number) => void;
}

export function Tabs(props: Props) {

  return (
    <div style={{...props.style, display: "flex", marginBottom: 32 }}>
      {props.tabs.map((tab: Tab, index: number) => (
        <button
          key={tab.key}
          style={tab.tabStyle}
          className={`tab ${props.activeTab === index || props.activeTab === tab.key ? "tab-active" : "tab-inactive"}`}
          onClick={() => props.onClickTab(tab.key, index)}
        >
          {tab.title}
        </button>
      ))}
    </div>
  )
}