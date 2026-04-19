import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://dbcvislccyosmlzqyhlp.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRiY3Zpc2xjY3lvc21senF5aGxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1OTk4MzksImV4cCI6MjA5MjE3NTgzOX0.CoALYEhM5AvY2CuH8-S3aKLjQqbDyqM5AR_m0s9KXCM";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function uploadPhoto(base64DataUrl, folder = "photos") {
  const res = await fetch(base64DataUrl);
  const blob = await res.blob();
  const path = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
  const { error } = await supabase.storage.from("photos").upload(path, blob, { contentType: "image/jpeg" });
  if (error) throw error;
  const { data: { publicUrl } } = supabase.storage.from("photos").getPublicUrl(path);
  return publicUrl;
}
