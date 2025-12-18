import io from "socket.io-client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, CheckCircle, Clock, Plus, LogOut } from "lucide-react";

const Dashboard = () => {
  const [incidents, setIncidents] = useState([]);
  const [newIncident, setNewIncident] = useState({ title: "", description: "", severity: "low" });
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  // Load Incidents on Page Start
  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/"); // Kick user out if no token
          return;
        }

        const res = await axios.get("http://localhost:5001/incidents", {
          headers: { token: token },
        });
        setIncidents(res.data);
      } catch (err) {
        console.error(err);
        if (err.response?.status === 403) navigate("/");
      }
    };

    fetchIncidents();
  }, [navigate]);

  // Real-time Listener
  useEffect(() => {
    // Connect to backend
    const socket = io("http://localhost:5001");

    // Listen for "new_incident" event
    socket.on("new_incident", (incident) => {
      // Update state by adding new incident to the TOP of the list
      setIncidents((prev) => [incident, ...prev]);
    });

    // Cleanup when leaving page
    return () => {
      socket.disconnect();
    };
  }, []);

  // Handle Creating New Incident
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("http://localhost:5001/incidents", newIncident, {
        headers: { token: token },
      });
      
      setIncidents([res.data, ...incidents]); // Add new item to top of list
      setShowForm(false); // Close form
      setNewIncident({ title: "", description: "", severity: "low" }); // Reset form
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // Helper for Severity Colors
  const getSeverityColor = (severity) => {
    switch (severity) {
      case "critical": return "bg-red-500";
      case "medium": return "bg-yellow-500";
      default: return "bg-blue-500";
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <AlertTriangle className="text-red-500" /> IncidentFlow
        </h1>
        <button onClick={handleLogout} className="flex items-center gap-2 text-gray-400 hover:text-white">
          <LogOut size={20} /> Logout
        </button>
      </div>

      {/* Action Bar */}
      <div className="mb-8">
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded font-bold flex items-center gap-2"
        >
          <Plus size={20} /> Report New Incident
        </button>
      </div>

      {/* Create Form (Hidden by default) */}
      {showForm && (
        <div className="bg-gray-800 p-6 rounded-lg mb-8 border border-gray-700">
          <h3 className="text-xl font-bold mb-4">New Incident Details</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              className="w-full bg-gray-700 p-2 rounded text-white"
              placeholder="Title (e.g., Database Connection Failed)"
              value={newIncident.title}
              onChange={(e) => setNewIncident({ ...newIncident, title: e.target.value })}
              required
            />
            <textarea
              className="w-full bg-gray-700 p-2 rounded text-white h-24"
              placeholder="Describe the issue..."
              value={newIncident.description}
              onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
            />
            <select
              className="w-full bg-gray-700 p-2 rounded text-white"
              value={newIncident.severity}
              onChange={(e) => setNewIncident({ ...newIncident, severity: e.target.value })}
            >
              <option value="low">Low Severity</option>
              <option value="medium">Medium Severity</option>
              <option value="critical">Critical Severity</option>
            </select>
            <button type="submit" className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-bold">
              Submit Report
            </button>
          </form>
        </div>
      )}

      {/* Incident List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {incidents.map((incident) => (
          <div key={incident.incident_id} className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <span className={`${getSeverityColor(incident.severity)} px-2 py-1 rounded text-xs font-bold uppercase`}>
                {incident.severity}
              </span>
              <span className="text-gray-400 text-sm flex items-center gap-1">
                <Clock size={14} /> {new Date(incident.created_at).toLocaleDateString()}
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
        ))}
      </div>
    </div>
  );
};

export default Dashboard;