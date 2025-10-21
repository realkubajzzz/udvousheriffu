require('dotenv').config();
const { Client, GatewayIntentBits, Partials, REST, Routes, SlashCommandBuilder } = require('discord.js');
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID; // optional for guild commands registration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE; // MUST be kept secret

if (!DISCORD_TOKEN || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
  console.error('Missing required env vars. See .env.example');
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
  auth: { persistSession: false }
});

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent], partials: [Partials.Channel] });

async function uploadUrlToBucket(url, destFilename) {
  // download the file to buffer
  const res = await axios.get(url, { responseType: 'arraybuffer' });
  const buffer = Buffer.from(res.data);

  const { data, error } = await supabaseAdmin.storage
    .from('gallery')
    .upload(destFilename, buffer, { upsert: false, contentType: res.headers['content-type'] || 'application/octet-stream' });

  if (error) throw error;
  // return public URL (assuming bucket has public policy) or signed URL
  const { data: publicUrl } = supabaseAdmin.storage.from('gallery').getPublicUrl(destFilename);
  return publicUrl.publicUrl;
}

async function insertGalleryRow({ url, filename, caption, uploader }) {
  const { data, error } = await supabaseAdmin
    .from('gallery')
    .insert([{ url, filename, caption, uploader }]);
  if (error) throw error;
  return data;
}

async function setSiteStatus(isOpen, by) {
  const { data, error } = await supabaseAdmin
    .from('site_status')
    .upsert([{ id: 1, is_open: isOpen, updated_by: by }], { onConflict: 'id' });
  if (error) throw error;
  return data;
}

client.once('ready', () => {
  console.log('Discord bot ready as', client.user.tag);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const { commandName } = interaction;
  try {
    if (commandName === 'open') {
      await interaction.deferReply({ ephemeral: true });
      await setSiteStatus(true, interaction.user.tag);
      await interaction.editReply('Stránka byla nastavena na OPEN.');
    } else if (commandName === 'close') {
      await interaction.deferReply({ ephemeral: true });
      await setSiteStatus(false, interaction.user.tag);
      await interaction.editReply('Stránka byla nastavena na CLOSED.');
    } else if (commandName === 'post') {
      await interaction.deferReply();
      const attachmentUrl = interaction.options.getString('url');
      const caption = interaction.options.getString('caption') || null;

      // if url not provided, look for attachments in the original message reference (not available here) or the interaction's channel recent messages
      let finalUrl = attachmentUrl;
      if (!finalUrl) {
        // try to fetch the most recent message in the channel with attachments
        const messages = await interaction.channel.messages.fetch({ limit: 10 });
        const msgWithAttachment = messages.find(m => m.attachments && m.attachments.size > 0 && m.author.id === interaction.user.id);
        if (msgWithAttachment) {
          finalUrl = msgWithAttachment.attachments.first().url;
        }
      }

      if (!finalUrl) {
        await interaction.editReply('Žádný obrázek nebyl nalezen. Pošli přílohu nebo použij parametr url.');
        return;
      }

      const ext = path.extname(new URL(finalUrl).pathname) || '.png';
      const filename = `gallery/${Date.now()}_${Math.random().toString(36).slice(2,8)}${ext}`;
      const publicUrl = await uploadUrlToBucket(finalUrl, filename);
      await insertGalleryRow({ url: publicUrl, filename, caption, uploader: interaction.user.tag });
      await interaction.editReply({ content: 'Obrázek nahrán a přidán do galerie.', files: [] });
    }
  } catch (err) {
    console.error('interaction error', err);
    if (interaction.deferred || interaction.replied) {
      try { await interaction.editReply('Došlo k chybě při zpracování příkazu.'); } catch(e){}
    } else {
      try { await interaction.reply({ content: 'Došlo k chybě při zpracování příkazu.', ephemeral: true }); } catch(e){}
    }
  }
});

async function registerCommands(guildId) {
  const commands = [
    new SlashCommandBuilder().setName('post').setDescription('Přidej obrázek do galerie').addStringOption(opt => opt.setName('url').setDescription('Public URL obrázku (volitelné)')).addStringOption(opt => opt.setName('caption').setDescription('Krátký popis')), 
    new SlashCommandBuilder().setName('open').setDescription('Nastaví stránku jako otevřenou'),
    new SlashCommandBuilder().setName('close').setDescription('Nastaví stránku jako zavřenou')
  ].map(c => c.toJSON());

  const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);
  if (guildId) {
    await rest.put(Routes.applicationGuildCommands(DISCORD_CLIENT_ID, guildId), { body: commands });
    console.log('Registered guild commands for', guildId);
  } else {
    await rest.put(Routes.applicationCommands(DISCORD_CLIENT_ID), { body: commands });
    console.log('Registered global commands');
  }
}

// optional: register commands automatically if env var provided
if (process.env.REGISTER_GUILD_ID && process.env.DISCORD_CLIENT_ID) {
  registerCommands(process.env.REGISTER_GUILD_ID).catch(console.error);
} else if (process.env.DISCORD_CLIENT_ID) {
  registerCommands().catch(console.error);
}

client.login(DISCORD_TOKEN);
