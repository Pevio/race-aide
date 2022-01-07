import { useLocation } from "react-router";
import { Link } from "react-router-dom";

interface Props {
  children: React.ReactElement;
}

export function HomePageWrapper(props: Props) {
  const location = useLocation()

  const getSideMenuItem = (text: string, to: string, hr: boolean = true) => {
    return (
      <>
        <div style={{display: "flex"}}>
          <div style={{width: 10, height: 40, backgroundColor: location.pathname === to ? "red" : "transparent"}}/>
          <Link to={to} className="sider-link">
            {text}
          </Link>
        </div>
        {hr && <hr />}
      </>
    )
  }
  return (
    <>
      <div className="header">
        <p style={{
          fontSize: 36, marginLeft: 50, paddingTop: 20
        }}>
          Race Aide
        </p>
      </div>
      <div className="sider">
        {getSideMenuItem("Upcoming Races", "/")}
        {getSideMenuItem("Create Race", "/createrace")}
        {getSideMenuItem("About", "/about", false)}
      </div>
      <div className="page-home">
        {props.children}
      </div>
      
    </>
  )
}