import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser'
import { createClient } from '@supabase/supabase-js'
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(cookieParser());


const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

// Middleware for protected routes
const authenticate = async (req, res, next) => {
  const token = req.cookies.access_token || req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  const { data: user, error } = await supabase.auth.getUser(token)
  if (error || !user) return res.status(401).json({ error: 'Unauthorized' })

  req.user = user
  next()
}

// Signup
app.post('/register', async (req, res) => {
  const { email, password } = req.body
  await supabase.auth.signUp({ email, password })
  // returns nothing
})

// Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body
  console.log(email, password);
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return res.status(400).json({ error: error.message, success: false })
    console.log(data, error)

  // Set token in httpOnly cookie for security
  res.cookie('access_token', data.session.access_token, { httpOnly: true, secure: true, sameSite: 'strict' })
  return res.json({ message: 'Login successful', success: true, id: data.user.id })
})



// Example protected route
app.get('/profile', authenticate, (req, res) => {
  res.json({ email: req.user.email })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`port ${PORT}`);
}); 