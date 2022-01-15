import { useLocation } from "react-router-dom";
import MainRouter from "./pages/MainRouter";
import { HomePageWrapper } from "./pages/HomePageWrapper";
import { RacePageWrapper } from "./pages/RacePageWrapper";

export default function LayoutProvider() {
  const location = useLocation()

  if (!location?.pathname) return null
  const parts = location?.pathname?.split("/")

  if (!parts[1] || ["races", "about", "createrace"].includes(parts[1].toLowerCase())) return <HomePageWrapper><MainRouter /></HomePageWrapper>

  return <RacePageWrapper>
    <MainRouter />
  </RacePageWrapper>

}
