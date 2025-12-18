const router = require("express").Router();
const pool = require("../db");
const authorize = require("../middleware/authorization");

// GET ALL INCIDENTS (Protected)
router.get("/", authorize, async (req, res) => {
  try {
    // We join with the users table to get the name of the person who created it
    const allIncidents = await pool.query(
      "SELECT i.*, u.name as creator_name FROM incidents i JOIN users u ON i.created_by = u.user_id ORDER BY i.created_at DESC"
    );
    res.json(allIncidents.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server Error");
  }
});

// CREATE A NEW INCIDENT (Protected)
router.post("/", authorize, async (req, res) => {
  try {
    const { title, description, severity } = req.body;

    // req.user comes from the middleware we just wrote
    const newIncident = await pool.query(
      "INSERT INTO incidents (title, description, severity, created_by) VALUES ($1, $2, $3, $4) RETURNING *",
      [title, description, severity, req.user]
    );

    res.json(newIncident.rows[0]);
    // Broadcast event named "new_incident" to all connected clients
    req.io.emit("new_incident", createdIncident);
    res.json(createdIncident);
    
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server Error");
  }
});

module.exports = router;