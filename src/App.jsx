import React from "react";
import Video from "./components/Video";
import "./styles/Video.css";

const App = ({ link }) => {
  return (
    <React.Fragment>
      <Video src={link} />
    </React.Fragment>
  );
};

export default App;
