import React, { useEffect, useRef, useState } from "react";
import "../styles/VideoControls.css";
import { formatTime } from "../utils/formatTIme";
import { FaPlay, FaPause } from "react-icons/fa";
import { VscScreenFull } from "react-icons/vsc";
import { MdShutterSpeed } from "react-icons/md";
import { PiPictureInPictureBold } from "react-icons/pi";
import {
  TbPlayerTrackNextFilled,
  TbPlayerTrackPrevFilled,
} from "react-icons/tb";
import {
  IoVolumeMediumSharp,
  IoVolumeMuteSharp,
  IoCaretForward,
  IoCaretBack,
} from "react-icons/io5";

const VideoControls = ({ video }) => {
  const [volume, setVolume] = useState(0.5);
  const [speed, setSpeed] = useState("1");
  const [isOpenSpeed, setIsOpenSpeed] = useState(false);

  const [isMuted, setIsMuted] = useState(false);
  const [timeDuration, setTimeDuration] = useState(0);
  const [timeCurrent, setTimeCurrent] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressLoadPercent, setProgressLoadPercent] = useState(0);
  const [actionTIme, setActionTime] = useState("");
      
  //Sự kiện sự kiên play/pause
  const handlePlay = () => {
    video.paused ? video.play() : video.pause();
  };

  //Sự kiện volume (âm thanh)
  const handleVolume = (e) => {
    setVolume(parseFloat(e.target.value) / 10);
    video.volume = parseFloat(e.target.value) / 10;
  };

  //Sự kiện xử lý khi click volume (muted)
  const handleMutedVolume = (e) => {
    e.stopPropagation()
    if(volume <=0){
      setVolume(0.5)
      video.volume = 0.5
    }else{
      setVolume(0)
      video.volume = 0
    }
  }
  

  //Sự kiện fullscreen
  const handleFullScreen = () => {
    const container = document.getElementById("container");
    container.requestFullscreen();
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  //Sự kiện tốc độ video
  const handleChooseSpeedRate = (speed) => {
    setSpeed(speed);
    video.playbackRate = speed;
  };

  //Sự kiện xử lý hình trong hình
  const handlePictureInPicture = () => {
    video.requestPictureInPicture();
    if (document.pictureInPictureElement) {
      document.exitPictureInPicture();
    }
  };

  //Sự kiện xử lý back/ forward 10s
  const handlePrev10s = () => {
    video.currentTime -= 10;
    setActionTime("back");
  };
  const handleNext10s = () => {
    video.currentTime += 10;
    setActionTime("forward");
  };

  //Xử lý sự kiện pausing
  const timerRef = useRef(null);
  useEffect(() => {
    const videoControls = document.getElementById("video-controls");
    video?.addEventListener("pause", () => {
      videoControls.style.display = "block";
    });
  }, [video]);

  //Xử lý khi volume change thi sẽ set lại isMuted (UI volume)
  useEffect(()=>{
    if(video){
      video.addEventListener("volumechange",()=>{
        if(video.volume <= 0){
          setIsMuted(true)
        }else{
          setIsMuted(false)
        }
      })
    }
  },[video, isMuted])
  

  //Xử lý sự kiện playing
  useEffect(() => {
    const videoControls = document.getElementById("video-controls");
    video?.addEventListener("play", () => {
      const handleHiddenControls = () => {
        if (video.paused) return;
        timerRef.current = setTimeout(() => {
          videoControls.style.display = "none";
        }, 3000);
      };
      handleHiddenControls();

      video?.addEventListener("mousemove", () => {
        videoControls.style.display = "block";
        clearTimeout(timerRef.current);
        handleHiddenControls();
      });
    });
  }, [video, timerRef]);


  //Xử lý sự kiện seeking khi chỉnh vị trí time
  useEffect(() => {
    const loading = document.getElementById("loading");

    video?.addEventListener("seeked", () => {
      loading.style.display = "none";
    });
    video?.addEventListener("seeking", () => {
      loading.style.display = "block";
    });
  }, [video]);

  //Thêm text curent time, over time cho timeline
  useEffect(() => {
    const videoTimeLine = document.getElementById("video-timeline");
    const textTimeCurrent = document.querySelector(".text-time-current");
    const textTimeOver = document.querySelector(".text-time-over");

    const handleMouseOver = (e) => {
      const timeLineWidth = e.target.clientWidth;
      const timeHover = (e.offsetX / timeLineWidth) * video?.duration;

      textTimeCurrent.style.display = "block";
      textTimeCurrent.style.right = `-${textTimeCurrent.clientWidth / 2}px`;

      textTimeOver.style.display = "block";
      textTimeOver.style.left = `${e.offsetX - textTimeOver.clientWidth / 2}px`;

      textTimeOver.innerText = formatTime(timeHover);
    };

    const handleMouseOut = () => {
      textTimeCurrent.style.display = "none";
      textTimeOver.style.display = "none";
    };

    videoTimeLine.addEventListener("mousemove", handleMouseOver);

    videoTimeLine.addEventListener("mouseout", handleMouseOut);

    return () => {
      videoTimeLine.removeEventListener("mousemove", handleMouseOver);
      videoTimeLine.removeEventListener("mouseout", handleMouseOut);
    };
  }, [video]);

  //Xử lý sự kiện khi load xong video
  useEffect(() => {
    video?.addEventListener("loadeddata", () => {
      setTimeDuration(formatTime(video.duration));
      setTimeCurrent(formatTime(video.currentTime));
      
    });
  }, [video]);

  //Xử lý sự kiên khi mousemove trong progress bar
  useEffect(() => {
    const videoTimeLine = document.getElementById("video-timeline");
    if (video) {
      const dragProgressBar = (e) => {
        const { clientWidth } = e.target;
        const timeLine = e.offsetX;
        setProgressPercent(`${timeLine}px`);
        video.currentTime = (timeLine / clientWidth) * video?.duration;
      };

      videoTimeLine.addEventListener("mousedown", () => {
        videoTimeLine.addEventListener("mousemove", dragProgressBar);
      });
      videoTimeLine.addEventListener("mouseup", () => {
        videoTimeLine.removeEventListener("mousemove", dragProgressBar);
      });
    }

    return () => {};
  }, [video]);

  //Sự kiện xử lý click timeline progress bar
  useEffect(() => {
    const videoTimeLine = document.getElementById("video-timeline");

    if (video) {
      videoTimeLine.addEventListener("click", (e) => {
        const { clientWidth } = e.target;
        const timeLine = e.offsetX;

        video.currentTime = (timeLine / clientWidth) * video?.duration;
      });
    }
  }, [video]);

  useEffect(() => {
    //Sự kiên  xử lý thanh progress chính ở vị trí hiện tại
    video?.addEventListener("timeupdate", () => {
      const progressPrecent = `${(video.currentTime / video.duration) * 100}%`;
      setProgressPercent(progressPrecent);

      setTimeCurrent(formatTime(video.currentTime));
    });

    //Sự kiên  xử lý thanh progress load tải dữ liệu video tải sẵn và sẵn sàng được phát mà không cần tải dữ liệu (lưu vào bộ nhớ đệm buffered)
    video?.addEventListener("progress", () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const duration = video.duration;
        const bufferedPercent = `${(bufferedEnd / duration) * 100}%`;
        setProgressLoadPercent(bufferedPercent);
      }
    });
  }, [video]);

  //Sự kiện xử lý khi back va forward time (UI back, forward)
  useEffect(() => {
    const thumbTimeBackward = document.getElementById("thumb-time-backward");
    const thumbTimeForward = document.getElementById("thumb-time-forward");

    let timer;

    let handleCloseThumb = (element)=>{
      if(element){
        timer = setTimeout(() => {
          element.style.display = "none";
          clearTimeout(timer);
          setActionTime("");
        }, 500);
      }
    }

    if (actionTIme === "back") {
      thumbTimeBackward.style.display = "block";
      handleCloseThumb(thumbTimeBackward)
    } else if (actionTIme === "forward") {
      thumbTimeForward.style.display = "block";
      handleCloseThumb(thumbTimeForward)
    }
  }, [actionTIme]);

  //Sử xứ phần keydown event cho video
  useEffect(() => {
    const handlePlay = (e) => {
      if (e.keyCode === 32) video.paused ? video.play() : video.pause();
    };

    const handlePrev = (e) => {
      if (e.keyCode === 37) {
        video.currentTime -= 10;
        setActionTime("back");
      }
    };

    const handleNext = (e) => {
      if (e.keyCode === 39) {
        video.currentTime += 10;
        setActionTime("forward");
      }
    };

    const handleMuted = (e) => {
      if (e.keyCode === 77) {
        if (volume > 0) {
          setVolume(0);
          video.volume = 0;
        } else {
          setVolume(0.5);
          video.volume = 0.5;
        }
      }
    };

    window.addEventListener("keydown", handlePlay);
    window.addEventListener("keydown", handlePrev);
    window.addEventListener("keydown", handleNext);
    window.addEventListener("keydown", handleMuted);

    return () => {
      window.removeEventListener("keydown", handlePlay);
      window.removeEventListener("keydown", handlePrev);
      window.removeEventListener("keydown", handleNext);
      window.removeEventListener("keydown", handleMuted);
    };
  }, [video, volume]);

  //Data
  const dataSpeedRate = [
    {name: "0.25x",value:"0.25"},
    {name: "0.5x",value:"0.5"},
    {name: "0.75x",value:"0.75"},
    {name: "Chuẩn",value:"1"},
    {name: "1.25x",value:"1.25"},
    {name: "1.5x",value:"1.5"},
    {name: "1.75x",value:"1.75"},
    {name: "2x",value:"2"},
  ];


  return (
    <React.Fragment>
      <div id="video-handle">
        <div id="thumb-time-backward">
          <IoCaretBack id="back-1" />
          <IoCaretBack id="back-2" />
          <IoCaretBack id="back-3" />
        </div>
        <div id="loading"></div>
        <div id="thumb-time-forward">
          <IoCaretForward id="forward-1" />
          <IoCaretForward id="forward-2" />
          <IoCaretForward id="forward-3" />
        </div>
      </div>
      <div id="video-controls" className="show-controls">
        <div id="video-timeline">
          <div id="progress-area">
            <div id="loading-progress" style={{ width: progressPercent }}>
              <div className="text-time-current">
                {formatTime(video?.currentTime, true)}
              </div>
              <div className="text-time-over"></div>
            </div>
            <div
              id="loading-progress-load"
              style={{ width: progressLoadPercent }}
            ></div>
          </div>
        </div>
        <div id="controls-content">
          <div id="volume">
            <span id="content-volume">
            <button id="btn-volume" onClick={handleMutedVolume}>
              {!isMuted ? <IoVolumeMediumSharp /> : <IoVolumeMuteSharp />}
            </button>
           <input
              id="input-volume"
              type="range"
              min="0"
              max="10"
              value={volume * 10}
              onChange={(e) => handleVolume(e)}
            />
           </span>
             <span id="duration">{`${timeCurrent}/${timeDuration}`}</span>
          </div>
          <div id="action">
            <button onClick={handlePrev10s}>
              <TbPlayerTrackPrevFilled />
            </button>
            <button onClick={(e) => handlePlay(e)} id="btn-action-video">
              {video?.paused ? <FaPlay /> : <FaPause />}
            </button>
            <button onClick={handleNext10s}>
              <TbPlayerTrackNextFilled />
            </button>
          </div>
          <div id="other">
            <button onClick={() => setIsOpenSpeed(!isOpenSpeed)} id="btn-speed">
              <MdShutterSpeed />
              {isOpenSpeed && (
                <ul className="menu-speed">
                  {dataSpeedRate.map((item, index) => (
                    <li
                      key={index}
                      onClick={() => handleChooseSpeedRate(item.value)}
                      className={`${item.value === speed && "active"}`}
                    >
                      {item.name}
                    </li>
                  ))}
                </ul>
              )}
            </button>
            <button onClick={handlePictureInPicture}>
              <PiPictureInPictureBold />
            </button>
            <button onClick={handleFullScreen}>
              <VscScreenFull />
            </button>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default VideoControls;
