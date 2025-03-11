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
            .mute-btn { 
                position: fixed; bottom: 20px; right: 20px; 
                background: red; color: white; border: none; padding: 10px 20px; 
                cursor: pointer; font-size: 16px; border-radius: 5px;
            }
        </style>
    </head>
    <body>

        <h2>Background YouTube Play</h2>
        <div id="player"></div>
        <button class="mute-btn" id="muteToggle">🔇 Mute</button>

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
                player.mute(); // Mute first to allow autoplay
                player.playVideo();
                setTimeout(() => {
                    player.unMute(); // Unmute automatically after 1 sec
                    updateMuteButton();
                }, 1000);
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

            function updateMuteButton() {
                document.getElementById("muteToggle").innerText = player.isMuted() ? "🔇 Mute" : "🔊 Unmute";
            }

            document.getElementById("muteToggle").addEventListener("click", () => {
                if (player.isMuted()) {
                    player.unMute();
                } else {
                    player.mute();
                }
                updateMuteButton();
            });
        </script>

    </body>
    </html>
    `;
    
    res.send(page);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
