export const formatTime = (time, offHour) => {
  let hour = Math.floor(time / 3600);
  let minute = Math.floor((time / 60) % 60);
  let second = Math.floor(time % 60);

  hour = hour < 10 ? `0${hour}` : hour;
  minute = minute < 10 ? `0${minute}` : minute;
  second = second < 10 ? `0${second}` : second;

  if (hour === "00" && offHour) {
    return `${minute}:${second}`;
  }
  return `${hour}:${minute}:${second}`;
};
