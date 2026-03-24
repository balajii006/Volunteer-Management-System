// This file has been removed - tasks are now assigned by admins and displayed on dashboard
// Redirect to dashboard if someone tries to access this route
import { useEffect } from "react";
import { useNavigate } from "react-router";

export default function TasksRedirect() {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate("/", { replace: true });
  }, [navigate]);
  
  return null;
}
