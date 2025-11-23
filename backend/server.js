// Import Bun's native SQLite (built-in, no installation needed!)
import { Database } from 'bun:sqlite';

// Create/open database
const db = new Database('database.db');

// Create table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS nicknames (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nickname TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Create HTTP server
const server = Bun.serve({
  port: 3000,
  
  async fetch(req) {
    const url = new URL(req.url);
    
    // Enable CORS (so frontend can talk to backend)
    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers });
    }
    
    // Route: Save nickname
    if (url.pathname === '/save-nickname' && req.method === 'POST') {
      try {
        const body = await req.json();
        const { nickname } = body;
        
        // Validate
        if (!nickname || nickname.trim() === '') {
          return new Response(
            JSON.stringify({ error: 'Nickname is required' }),
            { status: 400, headers }
          );
        }
        
        // Insert into database
        const stmt = db.prepare('INSERT INTO nicknames (nickname) VALUES (?)');
        stmt.run(nickname.trim());
        
        return new Response(
          JSON.stringify({ 
            success: true,
            nickname: nickname.trim() 
          }),
          { status: 201, headers }
        );
        
      } catch (error) {
        console.error('Error saving nickname:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to save nickname' }),
          { status: 500, headers }
        );
      }
    }
    
    // Route: List nicknames
    if (url.pathname === '/list-nicknames' && req.method === 'GET') {
      try {
        const stmt = db.prepare('SELECT * FROM nicknames ORDER BY created_at DESC');
        const nicknames = stmt.all();
        
        return new Response(
          JSON.stringify({ nicknames }),
          { status: 200, headers }
        );
        
      } catch (error) {
        console.error('Error fetching nicknames:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch nicknames' }),
          { status: 500, headers }
        );
      }
    }
    
    // 404 for unknown routes
    return new Response(
      JSON.stringify({ error: 'Not found' }),
      { status: 404, headers }
    );
  },
});

console.log(`🚀 Server running at http://localhost:${server.port}`);