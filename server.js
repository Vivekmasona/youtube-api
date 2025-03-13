const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();

async function fetchMetadata(url) {
    try {
        const { data } = await axios.get(url, { headers: { "User-Agent": "Mozilla/5.0" } });
        const $ = cheerio.load(data);

        let metadata = {
            title: $("meta[property='og:title']").attr("content") || $("title").text() || "No Title Found",
            description: $("meta[property='og:description']").attr("content") || $("meta[name='description']").attr("content") || "No Description Found",
            thumbnail: $("meta[property='og:image']").attr("content") || "No Thumbnail Found",
            url: url,
            videoplayback: $("video source").attr("src") || $("video").attr("src") || $("a[href*='videoplayback?expire']").attr("href") || "No Video URL Found"
        };

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
