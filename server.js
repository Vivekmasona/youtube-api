const express = require("express");
const app = express();

app.get("/watch", (req, res) => {
    const videoId = req.query.id;  // YouTube Video ID
    if (!videoId) return res.send("Video ID required!");

    const page = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Background YouTube Play</title>
        <script src="https://www.youtube.com/iframe_api"></script>
        <style> body { text-align: center; font-family: Arial; } </style>
    </head>
    <body>

        <h2>Background YouTube Play</h2>
        <div id="player"></div>

        <script>
            let player;
            function onYouTubeIframeAPIReady() {
                player = new YT.Player('player', {
                    height: '0', width: '0',
                    videoId: '${videoId}', 
                    playerVars: { autoplay: 1, loop: 1, playsinline: 1 },
                    events: { 'onReady': onPlayerReady }
                });
            }
            function onPlayerReady(event) {
                event.target.playVideo();
                detectBackground();
            }
            function detectBackground() {
                setInterval(() => {
                    if (document.hidden) {
                        console.log("Background Detected! Auto Resume.");
                        player.playVideo();
                    }
                }, 1000);
            }
        </script>

    </body>
    </html>
    `;
    
    res.send(page);
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
