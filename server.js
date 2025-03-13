const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();

async function fetchAllLinks(url) {
    try {
        const { data } = await axios.get(url, { headers: { "User-Agent": "Mozilla/5.0" } });
        const $ = cheerio.load(data);

        let links = [];
        $("a[href]").each((i, elem) => {
            let link = $(elem).attr("href");
            if (link.startsWith("http")) {
                links.push(link);
            }
        });

        return { links };
    } catch (error) {
        return { error: "Invalid URL or Cannot Fetch Links" };
    }
}

app.get("/fetch", async (req, res) => {
    let url = req.query.url;
    if (!url) return res.status(400).json({ error: "URL is required" });

    let result = await fetchAllLinks(url);
    res.json(result);
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
