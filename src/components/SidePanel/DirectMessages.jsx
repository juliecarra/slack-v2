import React, { Component } from "react";
import firebase from "../../firebase";
import { connect } from "react-redux";
import { setCurrentChannel, setPrivateChannel } from "../../actions";
import { Menu, Icon } from "semantic-ui-react";

class DirectMessages extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeChannel: "",
      user: this.props.currentUser,
      users: [],
      usersRef: firebase.database().ref("users"),
      connectedRef: firebase.database().ref(".info/connected"),
      presenceRef: firebase.database().ref("presence")
    };
  }

  componentDidMount() {
    if (this.state.user) {
      this.addUserListeners(this.state.user.uid);
    }
  }

  componentWillUnmount() {
    this.removeListeners();
  }

  addUserListeners = async currentUserUid => {
    const { usersRef, presenceRef, connectedRef } = this.state;
    let loadedUsers = [];
    try {
      await usersRef.on("child_added", snapshot => {
        if (currentUserUid !== snapshot.key) {
          let user = snapshot.val();
          user["uid"] = snapshot.key;
          user["status"] = "offline";
          loadedUsers.push(user);
          console.log(loadedUsers);
          this.setState({ users: loadedUsers });
        }
      });

      //Informations about user's status
      //If the user is connected, we pass the user's uuid
      await connectedRef.on("value", snapshot => {
        if (snapshot.val() === true) {
          const ref = presenceRef.child(currentUserUid);
          ref.set(true);
          ref.onDisconnect().remove(error => {
            if (error !== null) {
              console.log("error");
            }
          });
        }
      });
      //Add status to user
      await presenceRef.on("child_added", snapshot => {
        if (currentUserUid !== snapshot.key) {
          this.addStatusToUser(snapshot.key);
        }
      });

      presenceRef.on("child_removed", snapshot => {
        if (currentUserUid !== snapshot.key) {
          this.addStatusToUser(snapshot.key, false);
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  addStatusToUser = (userId, connected = true) => {
    const updatedUsers = this.state.users.reduce((acc, user) => {
      if (user.uid === userId) {
        user["status"] = `${connected ? "online" : "offline"}`;
      }
      return acc.concat(user);
    }, []);
    this.setState({ users: updatedUsers });
  };

  isUserOnline = user => user.status === "online";

  changeChannel = user => {
    const channelId = this.getChannelId(user.uid);
    const channelData = {
      id: channelId,
      name: user.displayName
    };
    this.props.setCurrentChannel(channelData);
    this.props.setPrivateChannel(true);
    this.setActiveChannel(user.uid);
  };

  getChannelId = userId => {
    const currentUserId = this.state.user.uid;
    return userId < currentUserId
      ? `${userId}/${currentUserId}`
      : `${currentUserId}/${userId}`;
  };

  //Retrieve active channel thanks to user uid
  setActiveChannel = userId => {
    this.setState({ activeChannel: userId });
  };

  removeListeners = () => {
    this.state.usersRef.off();
    this.state.presenceRef.off();
    this.state.connectedRef.off();
  };

  render() {
    const { users, activeChannel } = this.state;

    return (
      <Menu.Menu style={{ paddingBottom: "2em" }}>
        <Menu.Item style={{ color: "grey" }}>
          <span>Direct Messages</span> ({users.length}) <Icon name="add" />
        </Menu.Item>
        {users.map(user => (
          <Menu.Item
            key={user.uid}
            active={user.uid === activeChannel}
            onClick={() => this.changeChannel(user)}
            style={{
              fontStle: "italic",
              color: "grey",
              marginLeft: "-6px"
            }}
          >
            {this.isUserOnline(user) ? (
              <Icon
                name="circle"
                color="green"
                title="online"
                style={{
                  float: "left",
                  fontSize: "10px",
                  marginTop: "2px",
                  marginLeft: "7px",
                  paddingRight: "14px"
                }}
              />
            ) : (
              <Icon
                name="circle outline"
                title="offline"
                style={{
                  float: "left",
                  fontSize: "10px",
                  marginTop: "2px",
                  marginLeft: "7px",
                  paddingRight: "14px"
                }}
              />
            )}

            {user.displayName}
          </Menu.Item>
        ))}
      </Menu.Menu>
    );
  }
}

export default connect(null, { setCurrentChannel, setPrivateChannel })(
  DirectMessages
);
