# Recenzie API Pre Discord Bot

Tento súbor obsahuje informácie pre tvoj Discord bot na nahrávanie recenzií.

## Endpoint pre nahrávanie recenzií

**URL:** `https://your-supabase-url.supabase.co/rest/v1/reviews`
**Metóda:** POST
**Headers:**
- `Content-Type: application/json`
- `apikey: your-supabase-anon-key`
- `Authorization: Bearer your-supabase-anon-key`

## Formát dát pre POST request:

```json
{
    "customer_name": "Meno zákazníka",
    "rating": 5,
    "review_text": "Text recenzie od zákazníka",
    "discord_user_id": "123456789012345678",
    "discord_username": "username#1234",
    "is_approved": false
}
```

## Požadované polia:
- `customer_name` (string, povinné) - Meno zákazníka
- `rating` (integer, 1-5, povinné) - Hodnotenie od 1 do 5 hviezdičiek  
- `review_text` (string, povinné) - Text recenzie
- `discord_user_id` (string, voliteľné) - Discord ID užívateľa
- `discord_username` (string, voliteľné) - Discord username
- `is_approved` (boolean, default: false) - Či je recenzia schválená

## Supabase nastavenia:

1. Vytvor tabuľku pomocou SQL kódu z `database_reviews.sql`
2. Nastav RLS (Row Level Security) policies ako je v SQL súbore
3. Použi anon key pre prístup z Discord bota

## Príklad JavaScript kódu pre Discord bot:

```javascript
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';

async function addReview(customerName, rating, reviewText, discordUserId, discordUsername) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/reviews`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
            customer_name: customerName,
            rating: rating,
            review_text: reviewText,
            discord_user_id: discordUserId,
            discord_username: discordUsername,
            is_approved: false // Recenzie idú na schválenie
        })
    });

    if (response.ok) {
        console.log('Recenzia úspešne pridaná!');
        return true;
    } else {
        console.error('Chyba pri pridávaní recenzie:', await response.text());
        return false;
    }
}
```

## Discord bot command príklad:

```javascript
// Slash command pre pridanie recenzie
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    
    if (interaction.commandName === 'recenzia') {
        const customerName = interaction.options.getString('meno');
        const rating = interaction.options.getInteger('hodnotenie');
        const reviewText = interaction.options.getString('text');
        
        const success = await addReview(
            customerName,
            rating,
            reviewText,
            interaction.user.id,
            interaction.user.tag
        );
        
        if (success) {
            await interaction.reply('✅ Recenzia bola úspešne pridaná a čaká na schválenie!');
        } else {
            await interaction.reply('❌ Chyba pri pridávaní recenzie. Skús to znova.');
        }
    }
});
```

## Validácia údajov v Discord bote:

- Skontroluj, že rating je medzi 1-5
- Skontroluj minimálnu a maximálnu dĺžku textu recenzie
- Skontroluj, že meno zákazníka nie je prázdne
- Môžeš pridať cooldown pre užívateľov

## Schvaľovanie recenzií:

Všetky recenzie pridané cez Discord bot idú na schválenie (`is_approved: false`). 
Admin ich môže schváliť cez CMS na stránke `/cms.html` v sekcii "Recenzie".
Iba schválené recenzie sa zobrazia na webstránke.