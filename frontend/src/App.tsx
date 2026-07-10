import { Route, Routes } from "react-router-dom";
import RequireAuth from "./components/RequireAuth";
import Chat from "./pages/Chat";
import Documents from "./pages/Documents";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Workspaces from "./pages/Workspaces";

export default function App() {
  return (
    <Routes>
      <Route element={<RequireAuth />}>
        <Route path="/" element={<Workspaces />} />
        <Route path="/workspaces/:workspaceId" element={<Documents />} />
        <Route path="/workspaces/:workspaceId/chat" element={<Chat />} />
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}
