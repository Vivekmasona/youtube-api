const express = require("express");
const app = express();

app.get("/watch", (req, res) => {
    const videoId = req.query.id;
    if (!videoId) return res.send("Video ID required!");

    const page = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Background YouTube Play</title>
        <script src="https://www.youtube.com/iframe_api"></script>
        <style> 
            body { text-align: center; font-family: Arial; } 
            .hidden-video { width: 1px; height: 1px; opacity: 0; position: absolute; } 
        </style>
    </head>
    <body>

        <div id="player" class="hidden-video"></div>

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
                player.mute(); // Start muted to allow autoplay
                player.playVideo();
                setTimeout(() => player.unMute(), 1000); // Auto unmute after 1 second
                handleBackgroundPlayback();
            }

            function handleBackgroundPlayback() {
                document.addEventListener("visibilitychange", () => {
                    if (document.hidden) {
                        console.log("🔒 Display Locked, Preparing Auto Play...");
                        setTimeout(() => {
                            console.log("▶️ Auto Resume After Lock");
                            player.playVideo();
                        }, 1500);
                    }
                });
            }
        </script>

    </body>
    </html>
    `;
    
    res.send(page);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
