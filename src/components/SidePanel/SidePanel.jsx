import React, { Component } from "react";
import { Menu } from "semantic-ui-react";
import UserPanel from "./UserPanel.jsx";
import Channels from "./Channels.jsx";
import DirectMessages from "./DirectMessages.jsx";
import Starred from "./Starred.jsx";

class SidePanel extends Component {
  render() {
    const { currentUser, sidebarTheme } = this.props;
    return (
      <Menu
        fixed="left"
        size="large"
        vertical
        style={{
          backgroundColor: sidebarTheme,
          fontSize: "1.2rem"
        }}
      >
        <UserPanel currentUser={currentUser} />
        <Starred currentUser={currentUser} />
        <Channels currentUser={currentUser} />
        <DirectMessages currentUser={currentUser} />
      </Menu>
    );
  }
}

export default SidePanel;
