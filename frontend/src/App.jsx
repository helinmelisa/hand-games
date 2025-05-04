import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import Profile from "./pages/Profile";
import SimonSays from "./games/SimonSays";
import BallGame from "./games/BallGame";
import ShapeTracing from "./games/ShapeTracing";
import MemoryMatch from "./games/MemoryMatch";
import SwipeChallenge from "./games/SwipeChallenge";
import QuickReaction from "./games/QuickReaction";

function App() {
    return (
        <>
            <Router>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/ball-game" element={<BallGame />} />
                    <Route path="/simon-says" element={<SimonSays />} />
                    <Route path="/shape-tracing" element={<ShapeTracing />} />
                    <Route path="/memory-match" element={<MemoryMatch />} />
                    <Route path="/swipe-challenge" element={<SwipeChallenge />} />
                    <Route path="/quick-reaction" element={<QuickReaction />} />
                </Routes>
            </Router>

            <ToastContainer position="top-right" autoClose={3000} />
        </>
    );
}

export default App;
