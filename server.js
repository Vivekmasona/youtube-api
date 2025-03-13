const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const puppeteer = require("puppeteer-core");
const chromium = require("chrome-aws-lambda");

const app = express();

async function fetchMetadata(url) {
    try {
        const { data } = await axios.get(url, { headers: { "User-Agent": "Mozilla/5.0" } });
        const $ = cheerio.load(data);

        let metadata = {
            title: $("meta[property='og:title']").attr("content") || $("title").text() || "No Title Found",
            description: $("meta[property='og:description']").attr("content") || $("meta[name='description']").attr("content") || "No Description Found",
            thumbnail: $("meta[property='og:image']").attr("content") || "No Thumbnail Found",
            url: url
        };

        return metadata;
    } catch (error) {
        return { error: "Invalid URL or Cannot Fetch Metadata" };
    }
}

async function fetchVideoPlayback(url) {
    let browser = null;
    try {
        browser = await puppeteer.launch({
            args: chromium.args,
            executablePath: await chromium.executablePath,
            headless: true
        });

        const page = await browser.newPage();
        await page.goto(url, { waitUntil: "networkidle2" });

        // Extract video source URL
        const videoUrl = await page.evaluate(() => {
            const videoTag = document.querySelector("video source") || document.querySelector("video");
            return videoTag ? videoTag.src : null;
        });

        return videoUrl || "No Video Playback URL Found";
    } catch (error) {
        return "Error fetching playback URL";
    } finally {
        if (browser) await browser.close();
    }
}

app.get("/fetch", async (req, res) => {
    let url = req.query.url;
    if (!url) return res.status(400).json({ error: "URL is required" });

    let metadata = await fetchMetadata(url);
    let playbackUrl = await fetchVideoPlayback(url);

    res.json({ ...metadata, playbackUrl });
});

// Vercel requires this for serverless deployment
module.exports = app;
