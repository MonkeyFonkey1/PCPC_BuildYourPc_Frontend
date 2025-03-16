import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomeScreen from "../screens/HomeScreen/HomeScreen";
import ManualBuildScreen from "../screens/ManualBuild/ManualBuildScreen";
import AutoBuildScreen from "../screens/AutoBuild/AutoBuildScreen";
import SessionBuildsScreen from "../screens/SessionBuilds/SessionBuildsScreen";
import SummaryScreen from "../screens/SummaryScreen/SummaryScreen";

function Navigation() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomeScreen />} />
                <Route path="/build" element={<ManualBuildScreen />} />
                <Route path="/auto-build" element={<AutoBuildScreen />} />
                <Route path="/session-builds" element={<SessionBuildsScreen />} />
                <Route path="/summary" element={<SummaryScreen />} />
            </Routes>
        </Router>
    );
}

export default Navigation;
