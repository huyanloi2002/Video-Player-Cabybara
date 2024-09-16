import React, { useEffect, useState } from "react";
import Hls from "hls.js";
import VideoControls from "./VideoControls";

const Video = ({ src }) => {
  const [video, setVideo] = useState();

  useEffect(() => {
    const video = document.querySelector("#video-ui");
    if (Hls.isSupported()) {
      let hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);
      setVideo(video);
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      video.addEventListener("loadedmetadata", () => {
        video.play();
      });
      setVideo(video);
    } else {
      console.error("Trình duyệt không hỗ trợ phát video HLS.");
    }
  }, [src]);
  return (
    <React.Fragment>
      <div id="container">
        <video id="video-ui">
          <source
            src="https://vip.opstream16.com/20230114/29209_df6d21ee/index.m3u8"
            type="application/x-mpegURL"
          />
        </video>
        <VideoControls video={video} />
      </div>
    </React.Fragment>
  );
};

export default Video;
