const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();

app.get("/fetch", async (req, res) => {
    let url = req.query.url;
    if (!url) return res.status(400).json({ error: "URL is required" });

    try {
        const { data } = await axios.get(url, { headers: { "User-Agent": "Mozilla/5.0" } });
        const $ = cheerio.load(data);

        let links = [];
        $("a[href]").each((i, elem) => {
            let link = $(elem).attr("href");
            if (link.startsWith("http")) links.push(link);
        });

        res.json({ links });
    } catch (error) {
        res.status(500).json({ error: "Invalid URL or Cannot Fetch Links" });
    }
});

// Vercel Serverless ke liye Express export
module.exports = app;
