import React from "react";
import { NavLink } from "react-router-dom";
import "./Home.scss";
import { Button } from "semantic-ui-react";

const Home = () => {
  return (
    <div className="Home">
      <div className="navbar">
        <img src="/img/logo.png" alt="" style={{ width: "150px" }} />
        <Button style={{ backgroundColor: " #4a154b" }}>
          <NavLink exact activeClassName="item" to="/SignUp">
            Create an account
          </NavLink>
        </Button>
      </div>
      <div id="icon__container">
        <div className="icons">
          <img
            src="https://www.stickpng.com/assets/images/5847faf6cef1014c0b5e48cd.png"
            alt=""
            width="20px"
          />
        </div>
        <div className="icons">
          <img
            src="https://www.searchpng.com/wp-content/uploads/2019/02/Dropbox-PNG-Icon-715x715.png"
            alt=""
            width="20px"
          />
        </div>
        <div className="icons">
          <img
            src="https://lh3.googleusercontent.com/1DqxbUca62LmV1ehZirHGWYBef9Jrtl3DhZ4m6YBnWCUX-XNr3lcnYKb31R-7ukpKAw"
            alt=""
            width="20px"
          />
        </div>
        <div className="icons">
          <img
            src="https://media.productive.io/uploads/2019/07/asasasasa.png"
            alt=""
            width="20px"
          />
        </div>
        <div className="icons">
          <img src="/img/zendesk.png" alt="" width="30px" />
        </div>
        <div className="icons">
          <img
            src="https://cdn2.hubspot.net/hubfs/3911439/jira-app-logo-1.png"
            alt=""
            width="20px"
          />
        </div>
        <div className="icons">
          <img
            src="https://dwglogo.com/wp-content/uploads/2015/12/HubSpot-Symbol.png"
            alt=""
            width="70px"
          />
        </div>

        <div className="icons">
          <img src="/img/icon1.png" alt="" width="17px" />
        </div>
        <div className="icons">
          <img src="/img/icon2.png" alt="" width="17px" />
        </div>
        <div className="icons">
          <img src="/img/icon3.png" alt="" width="20px" />
        </div>
        <div className="icons">
          <img src="/img/icon4.png" alt="" width="20px" />
        </div>
        <div className="icons">
          <img src="/img/github.png" alt="" width="20px" />
        </div>
        <div className="icons">
          <img src="/img/giphy.png" alt="" width="25px" />
        </div>
        <div className="icons">
          <img src="/img/trello.jpg" alt="" width="25px" />
        </div>
        <div className="icons">
          <img src="/img/inVision.svg" alt="" width="20px" />
        </div>
        <div className="icons">
          <img src="/img/twitter.png" alt="" width="27px" />
        </div>
        <div className="icons">
          <img
            src="https://www.freepnglogos.com/uploads/logo-gmail-png/logo-gmail-png-gmail-icon-download-png-and-vector-1.png"
            alt=""
            width="20px"
          />
        </div>
        <div className="icons">
          <img src="/img/loom.png" alt="" width="20px" />
        </div>
      </div>

      <div className="landing">
        <h1 className="heading">
          Whatever work you do, <br /> you can do it in Slack
        </h1>
        <p className="paragraph">
          Slack gives your team the power and alignment you need to do your best
          work.
        </p>
        <span>
          Already using Slack?{" "}
          <NavLink exact activeClassName="item" to="/LogIn">
            Sign In
          </NavLink>
        </span>
      </div>
    </div>
  );
};

export default Home;
