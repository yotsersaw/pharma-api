// Файл: /api/saveProductPage.js

// Эта строка указывает Vercel, что это серверная функция
export const config = {
    runtime: 'nodejs',
};

export default async function handler(req, res) {
    // 1. Проверяем, что запрос правильный
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Only POST requests allowed' });
    }
    
    // 2. Добавляем заголовки для CORS, чтобы твой фронтенд мог общаться с этим API
    res.setHeader('Access-Control-Allow-Origin', '*'); // В продакшене лучше указать твой домен
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const { name, slug, htmlBody } = req.body;
        
        // --- ЗАМЕНИ ЭТИ ДАННЫЕ НА СВОИ ---
        const repoOwner = "yotsersaw";          // Твой ник на GitHub
        const repoName = "medilux-aura";        // Название репозитория с ФРОНТЕНДОМ
        // ------------------------------------

        const githubToken = process.env.GITHUB_TOKEN;

        if (!githubToken) {
            return res.status(500).json({ error: 'GitHub Token не настроен на Vercel' });
        }

        const path = `public/products/${slug}.html`;
        const url = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${path}`;

        const seoHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Buy ${name} Online | Medilux Pharmacy</title>
            <meta name="description" content="Order ${name} online safely. FDA approved. Fast USA delivery.">
            <script type="application/ld+json">
            {
                "@context": "https://schema.org",
                "@type": "Product",
                "name": "${name}",
                "brand": { "@type": "Brand", "name": "Medilux Pharmacy" },
                "description": "Buy ${name} online safely. FDA approved."
            }
            </script>
        </head>
        <body>
            <main>${htmlBody}</main>
        </body>
        </html>`;
        
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${githubToken}`,
                'Accept': 'application/vnd.github.v3+json',
            },
            body: JSON.stringify({
                message: `feat: Add product page for ${name}`,
                content: Buffer.from(seoHtml, 'utf8').toString('base64'),
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`GitHub API error: ${errorData.message}`);
        }

        return res.status(200).json({ success: true });

    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
}
