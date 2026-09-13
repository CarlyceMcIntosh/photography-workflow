import dotenv from "dotenv";
dotenv.config();

import express from "express"; //backend framework
import cors from "cors"; //lets you call your backend API from a different domain
import { supabase } from "./lib/supabase.js"; //database/auth client

import projectRoutes from "./routes/project.js"; //API project router

const app = express(); //create express app

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Test Supabase connection
app.get("/db-test", async (_req, res) => {
  try {
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }
    
    res.json({ 
      status: "connected", 
      message: "Database connection successful",
      profileCount: count 
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ 
      status: "error", 
      message: error instanceof Error ? error.message : JSON.stringify(error)
    });
  }
});

// Mount project routes at /api/projects
app.use("/api/projects", projectRoutes);

const PORT = process.env.PORT || 3001;

// Export app for testing
export { app };

// Only start server if not imported (i.e., running directly)
if (import.meta.url === `file://${process.argv[1]}`) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}