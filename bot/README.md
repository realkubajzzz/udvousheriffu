Discord bot for "U Dvou Sheriffů"

What this bot does
- Accepts slash command `/post` to publish an image to the website gallery. It can take a public URL or find a recent attachment from the same user in the channel.
- Accepts `/open` and `/close` to set the site's open/closed status.

Security model
- The bot runs server-side and uses the Supabase service_role key. This key must never be embedded in client-side code or shared.

Setup
1. Create a Supabase project and add a storage bucket named `gallery`.
2. Create the DB tables (see `schema.sql`).
3. Create a Discord bot application and add it to your guild. Copy its token and client id.
4. Create a `.env` file from `.env.example` and fill values.
5. Run `npm install` then `npm start`.

Registering commands
- Optionally set `REGISTER_GUILD_ID` to your test server id to register commands quickly while developing. Otherwise, commands are registered globally (may take up to an hour to appear).

Notes
- This scaffold uploads files to the `gallery` storage bucket and inserts a row into the `gallery` table with the public URL. If you want moderation, change the `insertGalleryRow` behavior to set `approved=false` and only show approved rows on the site.
