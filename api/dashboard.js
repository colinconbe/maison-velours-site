// Vercel Serverless Function : centralise réservations, contacts (Supabase) et trafic (Clarity)
// Variables d'environnement requises (à définir sur Vercel) :
//   SUPABASE_SERVICE_ROLE_KEY  -> clé "service_role" du projet Supabase
//   CLARITY_API_TOKEN          -> token API Microsoft Clarity (Data Export)
//   ADMIN_PASSWORD             -> mot de passe pour accéder au dashboard

const SUPABASE_URL = "https://nfcubuejtqxouraynxbt.supabase.co";

export default async function handler(req, res) {
  const password = req.headers["x-admin-password"];
  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    res.status(401).json({ error: "Mot de passe incorrect." });
    return;
  }

  const days = Math.min(Math.max(parseInt(req.query.days || "3", 10), 1), 3);
  const sinceDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const result = { bookings: [], contacts: [], clarity: null, errors: [] };

  // --- Supabase : réservations ---
  try {
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/booking_submissions?select=*&created_at=gte.${sinceDate}&order=created_at.desc`,
      {
        headers: {
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
      }
    );
    if (r.ok) {
      result.bookings = await r.json();
    } else {
      result.errors.push("Supabase (réservations): " + r.status);
    }
  } catch (e) {
    result.errors.push("Supabase (réservations): " + e.message);
  }

  // --- Supabase : contacts ---
  try {
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/contact_submissions?select=*&created_at=gte.${sinceDate}&order=created_at.desc`,
      {
        headers: {
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
      }
    );
    if (r.ok) {
      result.contacts = await r.json();
    } else {
      result.errors.push("Supabase (contacts): " + r.status);
    }
  } catch (e) {
    result.errors.push("Supabase (contacts): " + e.message);
  }

  // --- Microsoft Clarity : trafic & pages populaires ---
  try {
    const r = await fetch(
      `https://www.clarity.ms/export-data/api/v1/project-live-insights?numOfDays=${days}&dimension1=URL`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CLARITY_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (r.ok) {
      result.clarity = await r.json();
    } else {
      result.errors.push("Clarity: " + r.status + " (limite: 10 requêtes/jour max)");
    }
  } catch (e) {
    result.errors.push("Clarity: " + e.message);
  }

  res.status(200).json(result);
}
