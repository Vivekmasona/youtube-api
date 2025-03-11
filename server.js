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
        <title>VFY Custom Player</title>
        <script src="https://www.youtube.com/iframe_api"></script>
        <style> 
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; background: black; color: white; text-align: center; }
            
            #player-container { 
                position: relative; width: 80%; max-width: 700px; margin: auto; 
                background: #000; border-radius: 10px; overflow: hidden; margin-top: 20px;
            }
            
            #player { width: 100%; aspect-ratio: 16/9; }
            
            /* Watermark */
            .watermark { 
                position: absolute; top: 10px; right: 10px; background: rgba(255, 0, 0, 0.7); 
                padding: 5px 10px; font-size: 14px; font-weight: bold; border-radius: 5px;
            }

            /* Controls */
            .controls { 
                display: flex; justify-content: space-between; align-items: center; 
                padding: 10px; background: rgba(0,0,0,0.7); 
            }
            
            .btn { 
                background: red; color: white; padding: 8px 15px; border: none; 
                font-size: 16px; cursor: pointer; border-radius: 5px;
            }
            
            .btn:hover { background: darkred; }

            /* Seek Bar */
            .seek-bar { width: 100%; cursor: pointer; }

        </style>
    </head>
    <body>

        <h2>VFY Custom Player</h2>

        <div id="player-container">
            <div id="player"></div>
            <div class="watermark">VFY</div>
        </div>

        <!-- Controls -->
        <div class="controls">
            <button class="btn" id="playPause">▶️ Play</button>
            <input type="range" id="seekBar" class="seek-bar" min="0" max="100" value="0">
            <button class="btn" id="muteToggle">🔊 Mute</button>
            <button class="btn" id="fullscreen">⛶ Fullscreen</button>
        </div>

        <script>
            let player;
            function onYouTubeIframeAPIReady() {
                player = new YT.Player('player', {
                    videoId: '${videoId}', 
                    playerVars: { autoplay: 1, loop: 1, controls: 0, playsinline: 1 },
                    events: { 'onReady': onPlayerReady, 'onStateChange': updateSeekBar }
                });
            }

            function onPlayerReady(event) {
                player.mute(); // Start muted
                player.playVideo();
                setTimeout(() => player.unMute(), 1000); // Auto-unmute after 1s
            }

            function updateSeekBar() {
                setInterval(() => {
                    if (player && player.getDuration) {
                        let current = player.getCurrentTime();
                        let total = player.getDuration();
                        document.getElementById("seekBar").value = (current / total) * 100;
                    }
                }, 1000);
            }

            document.getElementById("playPause").addEventListener("click", () => {
                if (player.getPlayerState() === 1) { 
                    player.pauseVideo();
                    document.getElementById("playPause").innerText = "▶️ Play";
                } else {
                    player.playVideo();
                    document.getElementById("playPause").innerText = "⏸️ Pause";
                }
            });

            document.getElementById("muteToggle").addEventListener("click", () => {
                if (player.isMuted()) {
                    player.unMute();
                    document.getElementById("muteToggle").innerText = "🔊 Mute";
                } else {
                    player.mute();
                    document.getElementById("muteToggle").innerText = "🔇 Unmute";
                }
            });

            document.getElementById("fullscreen").addEventListener("click", () => {
                let container = document.getElementById("player-container");
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else {
                    container.requestFullscreen();
                }
            });

            document.getElementById("seekBar").addEventListener("input", (e) => {
                let newTime = (e.target.value / 100) * player.getDuration();
                player.seekTo(newTime);
            });

        </script>

    </body>
    </html>
    `;
    
    res.send(page);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
