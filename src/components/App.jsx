import React, { Component } from "react";
import { Grid } from "semantic-ui-react";
import { connect } from "react-redux";
import ColorPanel from "./ColorPanel/ColorPanel.jsx";
import SidePanel from "./SidePanel/SidePanel.jsx";
import Messages from "./Messages/Messages.jsx";
import MetaPanel from "./MetaPanel/MetaPanel.jsx";

//Chat page
class App extends Component {
  render() {
    const {
      currentUser,
      currentChannel,
      isPrivateChannel,
      userPosts,
      sidebarTheme
    } = this.props;
    return (
      <Grid columns="equal" style={{ backgroundColor: "#fff" }}>
        <ColorPanel
          key={currentUser && currentUser.name}
          currentUser={currentUser}
        />
        <SidePanel
          key={currentUser && currentUser.uid}
          currentUser={currentUser}
          sidebarTheme={sidebarTheme}
        />

        <Grid.Column style={{ marginLeft: 340 }}>
          <Messages
            key={currentChannel && currentChannel.id}
            currentChannel={currentChannel}
            currentUser={currentUser}
            isPrivateChannel={isPrivateChannel}
          />
        </Grid.Column>
        <Grid.Column width={4}>
          <MetaPanel
            key={currentChannel && currentChannel.name}
            userPosts={userPosts}
            currentChannel={currentChannel}
            isPrivateChannel={isPrivateChannel}
          />
        </Grid.Column>
      </Grid>
    );
  }
}

const mapStateToProps = state => ({
  currentUser: state.user.currentUser,
  currentChannel: state.channel.currentChannel,
  isPrivateChannel: state.channel.isPrivateChannel,
  userPosts: state.channel.userPosts,
  sidebarTheme: state.theme.sidebarTheme
});

export default connect(mapStateToProps)(App);
