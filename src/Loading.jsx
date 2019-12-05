import React from "react";
import { Link } from "react-router-dom";
import { Dimmer } from "semantic-ui-react";
import "./Loading.scss";

const Loading = () => (
  <Dimmer active style={{ backgroundColor: "#fff" }}>
    <Link to="/Loading">
      <div class="wp">
        <div class="rot"></div>
        <div class="tor"></div>
      </div>
      <h1>Loading...</h1>
    </Link>
  </Dimmer>
);

export default Loading;
