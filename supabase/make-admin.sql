-- Run AFTER you have created your admin user in Supabase (Authentication > Users > Add user).
-- Replace the email below with that user's email, then run this in the SQL Editor.
insert into public.admins (user_id, email)
select id, email from auth.users where email = 'YOUR-ADMIN-EMAIL@example.com'
on conflict (user_id) do nothing;
