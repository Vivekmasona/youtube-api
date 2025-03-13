const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();

async function fetchMetadata(url) {
    try {
        const { data } = await axios.get(url, { headers: { "User-Agent": "Mozilla/5.0" } });
        const $ = cheerio.load(data);

        // Extract metadata fields
        let metadata = {
            title: $("meta[property='og:title']").attr("content") || $("title").text() || "No Title Found",
            description: $("meta[property='og:description']").attr("content") || $("meta[name='description']").attr("content") || "No Description Found",
            thumbnail: $("meta[property='og:image']").attr("content") || $("link[rel='image_src']").attr("href") || "No Thumbnail Found",
            video: $("meta[property='og:video']").attr("content") || $("meta[name='twitter:player']").attr("content") || null,
            favicon: $("link[rel='icon']").attr("href") || $("link[rel='shortcut icon']").attr("href") || "No Favicon Found",
            keywords: $("meta[name='keywords']").attr("content") || "No Keywords Found",
            site_name: $("meta[property='og:site_name']").attr("content") || "Unknown Site",
            author: $("meta[name='author']").attr("content") || $("meta[property='article:author']").attr("content") || "Unknown Author",
            publish_date: $("meta[property='article:published_time']").attr("content") || $("meta[name='date']").attr("content") || "Unknown Date",
            url: url
        };

        // Extract JSON-LD metadata if available
        let jsonLdData = $("script[type='application/ld+json']").html();
        if (jsonLdData) {
            try {
                metadata.json_ld = JSON.parse(jsonLdData);
            } catch (err) {
                metadata.json_ld = "Invalid JSON-LD";
            }
        } else {
            metadata.json_ld = "No JSON-LD Metadata Found";
        }

        return metadata;
    } catch (error) {
        return { error: "Invalid URL or Cannot Fetch Metadata" };
    }
}

app.get("/fetch", async (req, res) => {
    let url = req.query.url;
    if (!url) return res.status(400).json({ error: "URL is required" });

    let metadata = await fetchMetadata(url);
    res.json(metadata);
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
