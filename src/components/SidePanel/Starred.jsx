import React, { Component } from "react";
import firebase from "../../firebase";
import { connect } from "react-redux";
import { setCurrentChannel, setPrivateChannel } from "../../actions";
import { Menu, Icon } from "semantic-ui-react";

class Starred extends Component {
  constructor(props) {
    super(props);

    this.state = {
      user: this.props.currentUser,
      usersRef: firebase.database().ref("users"),
      activeChannel: "",
      starredChannels: []
    };
  }

  componentDidMount() {
    if (this.state.user) {
      this.addStarredListeners(this.state.user.uid);
    }
  }

  componentWillUnmount() {
    this.removeListeners();
  }

  addStarredListeners = userId => {
    this.state.usersRef
      .child(userId)
      .child("starred")
      .on("child_added", snap => {
        //In the database,  snap.key = users/starred and  ...snapshot.val() = all informations that are in starred
        const starredChannel = { id: snap.key, ...snap.val() };
        this.setState({
          starredChannels: [...this.state.starredChannels, starredChannel]
        });
      });

    this.state.usersRef
      .child(userId)
      .child("starred")
      .on("child_removed", snap => {
        const channelToRemove = { id: snap.key, ...snap.val() };
        const filteredChannels = this.state.starredChannels.filter(channel => {
          return channel.id !== channelToRemove.id;
        });
        this.setState({ starredChannels: filteredChannels });
      });
  };

  setActiveChannel = channel => {
    this.setState({ activeChannel: channel.id });
  };

  changeChannel = channel => {
    this.setActiveChannel(channel);
    this.props.setCurrentChannel(channel);
    this.props.setPrivateChannel(false);
  };

  removeListeners = () => {
    this.state.usersRef.child(`${this.state.user.uid}/starred`).off();
  };

  render() {
    const { starredChannels, activeChannel } = this.state;

    return (
      <Menu.Menu style={{ paddingBottom: "2em" }}>
        <Menu.Item style={{ color: "grey" }}>
          <span>
            Starred ({starredChannels.length})
            <Icon name="star" style={{ float: "right" }} />
          </span>
        </Menu.Item>
        {starredChannels.length > 0 &&
          starredChannels.map(channel => (
            <Menu.Item
              key={channel.id}
              name={channel.name}
              active={channel.id === activeChannel}
              onClick={() => this.changeChannel(channel)}
              style={{ color: "grey" }}
            >
              <Icon name="hashtag" style={{ float: "left" }} />{" "}
              <span style={{ marginLeft: "2px" }}>{channel.name}</span>
            </Menu.Item>
          ))}
      </Menu.Menu>
    );
  }
}

export default connect(null, { setCurrentChannel, setPrivateChannel })(Starred);
