import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Clock, Plus, LogOut } from "lucide-react";
import io from "socket.io-client";

// REPLACE THIS WITH YOUR ACTUAL RENDER BACKEND URL
// Example: "https://incident-api-xv23.onrender.com"
const API_BASE_URL = "https://incident-api-9ps8.onrender.com"; 

const Dashboard = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newIncident, setNewIncident] = useState({ title: "", description: "", severity: "low" });
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/");
          return;
        }

        const res = await axios.get(`${API_BASE_URL}/incidents`, {
          headers: { token: token },
        });

        // SAFETY CHECK: Ensure we actually got an array
        if (Array.isArray(res.data)) {
          setIncidents(res.data);
        } else {
          console.error("API did not return an array:", res.data);
          setIncidents([]); // Fallback to empty list to prevent crash
        }
      } catch (err) {
        console.error("Fetch Error:", err);
        setError("Failed to load incidents. Check console for details.");
        if (err.response?.status === 403) navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchIncidents();
  }, [navigate]);

  useEffect(() => {
    const socket = io(API_BASE_URL);
    socket.on("new_incident", (incident) => {
      setIncidents((prev) => [incident, ...prev]);
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API_BASE_URL}/incidents`, newIncident, {
        headers: { token: token },
      });
      // The socket will update the list, so we don't strictly need to do it here,
      // but it's good practice to keep the UI snappy:
      setIncidents((prev) => [res.data, ...prev]);
      setShowForm(false);
      setNewIncident({ title: "", description: "", severity: "low" });
    } catch (err) {
      console.error(err);
      alert("Failed to report incident");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "critical": return "bg-red-500";
      case "medium": return "bg-yellow-500";
      default: return "bg-blue-500";
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen bg-gray-900 text-red-500 flex items-center justify-center">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <AlertTriangle className="text-red-500" /> IncidentFlow
        </h1>
        <button onClick={handleLogout} className="flex items-center gap-2 text-gray-400 hover:text-white">
          <LogOut size={20} /> Logout
        </button>
      </div>

      <div className="mb-8">
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded font-bold flex items-center gap-2"
        >
          <Plus size={20} /> Report New Incident
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-800 p-6 rounded-lg mb-8 border border-gray-700">
          <h3 className="text-xl font-bold mb-4">New Incident Details</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              className="w-full bg-gray-700 p-2 rounded text-white"
              placeholder="Title"
              value={newIncident.title}
              onChange={(e) => setNewIncident({ ...newIncident, title: e.target.value })}
              required
            />
            <textarea
              className="w-full bg-gray-700 p-2 rounded text-white h-24"
              placeholder="Description"
              value={newIncident.description}
              onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
            />
            <select
              className="w-full bg-gray-700 p-2 rounded text-white"
              value={newIncident.severity}
              onChange={(e) => setNewIncident({ ...newIncident, severity: e.target.value })}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="critical">Critical</option>
            </select>
            <button type="submit" className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-bold">
              Submit
            </button>
          </form>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {incidents.length === 0 ? (
           <p className="text-gray-500">No incidents reported yet.</p>
        ) : (
          incidents.map((incident) => (
            <div key={incident.incident_id} className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg">
              <div className="flex justify-between items-start mb-4">
                <span className={`${getSeverityColor(incident.severity)} px-2 py-1 rounded text-xs font-bold uppercase`}>
                  {incident.severity}
                </span>
                <span className="text-gray-400 text-sm flex items-center gap-1">
                  <Clock size={14} /> {incident.created_at ? new Date(incident.created_at).toLocaleDateString() : "Date N/A"}
                </span>
              </div>
              <h3 className="text-xl font-bold mb-2">{incident.title}</h3>
              <p className="text-gray-400 mb-4">{incident.description}</p>
              <div className="flex items-center justify-between text-sm text-gray-500 border-t border-gray-700 pt-4">
                <span className="flex items-center gap-1">
                  Reporter: {incident.creator_name || "Unknown"}
                </span>
                <span className="uppercase font-semibold tracking-wider">
                  {incident.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;