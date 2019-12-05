import React, { Component } from "react";
import firebase from "../../firebase";
import { connect } from "react-redux";
import { setCurrentChannel, setPrivateChannel } from "../../actions";
import {
  Menu,
  Icon,
  Modal,
  Form,
  Input,
  Button,
  Label,
  Message
} from "semantic-ui-react";

class Channels extends Component {
  constructor(props) {
    super(props);

    this.state = {
      user: this.props.currentUser,
      channel: null,
      channels: [],
      activeChannel: "",
      channelName: "",
      channelPurpose: "",
      channelsRef: firebase.database().ref("channels"),
      messagesRef: firebase.database().ref("messages"),
      typingRef: firebase.database().ref("typing"),
      notifications: [],
      modal: false,
      firstLoad: true,
      loading: false,
      errors: []
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  componentDidMount() {
    this.addChannelListeners();
  }

  componentWillUnmount() {
    this.removeListeners();
  }

  handleChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handleSubmit = e => {
    let errors = [];
    let error;
    e.preventDefault();
    if (this.validateForm(this.state)) {
      this.addChannel();
    } else {
      error = { message: "Please enter a valid name" };
      this.setState({ errors: errors.concat(error) });
    }
  };

  //Check if channelName is not empty, lower than 22 characters and not to uppercase
  validateForm = ({ channelName }) => channelName && channelName.length < 22;

  //Create a channel and register informations in database
  addChannel = async () => {
    const {
      user,
      channelName,
      channelPurpose,
      channelsRef,
      errors
    } = this.state;
    const key = channelsRef.push().key; //Key for channel

    this.setState({ errors: [], loading: true }); //Clear errors
    try {
      await channelsRef.child(key).update({
        id: key,
        name: channelName,
        purpose: channelPurpose,
        createdBy: {
          name: user.displayName,
          avatar: user.photoURL
        }
      });
      this.setState({ channelName: "", channelPurpose: "", loading: false });
      this.closeModal();
      console.log("channel has been created");
    } catch (error) {
      console.log(error);
      this.setState({ errors: errors.concat(error), loading: false });
    }
  };

  //Pass all channel's informations in
  addChannelListeners = () => {
    let loadedChannels = [];
    this.state.channelsRef.on("child_added", snap => {
      loadedChannels.push(snap.val());
      this.setState({ channels: loadedChannels }, () => this.setFirstChannel());
      this.addNotificationListener(snap.key);
    });
  };

  removeListeners = () => {
    this.state.channelsRef.off();
    this.state.channels.forEach(channel => {
      this.state.messagesRef.child(channel.id).off();
    });
  };

  setFirstChannel = () => {
    const firstChannel = this.state.channels[0];
    if (this.state.firstLoad && this.state.channels.length > 0) {
      this.props.setCurrentChannel(firstChannel);
      this.setActiveChannel(firstChannel);
      this.setState({ channel: firstChannel });
    }
    this.setState({ firstLoad: false });
  };

  changeChannel = channel => {
    this.setActiveChannel(channel);
    this.state.typingRef
      .child(this.state.channel.id)
      .child(this.state.user.uid)
      .remove(); //Remove the typingRef when we change channel
    this.clearNotifications();
    this.props.setCurrentChannel(channel);
    this.props.setPrivateChannel(false); //Detect if the channel is public or private
    this.setState({ channel });
  };

  setActiveChannel = channel => {
    this.setState({ activeChannel: channel.id });
  };

  addNotificationListener = channelId => {
    this.state.messagesRef.child(channelId).on("value", snap => {
      if (this.state.channel) {
        this.handleNotifications(
          channelId,
          this.state.channel.id,
          this.state.notifications,
          snap
        );
      }
    });
  };

  handleNotifications = (channelId, currentChannelId, notifications, snap) => {
    let lastTotal = 0;

    let index = notifications.findIndex(
      notification => notification.id === channelId
    );

    if (index !== -1) {
      if (channelId !== currentChannelId) {
        //Number of notifications left
        lastTotal = notifications[index].total;

        if (snap.numChildren() - lastTotal > 0) {
          //Update count
          notifications[index].count = snap.numChildren() - lastTotal;
        }
      }
      notifications[index].lastKnownTotal = snap.numChildren();
    } else {
      notifications.push({
        id: channelId,
        //Get total of messages for a given channel
        total: snap.numChildren(),
        lastKnownTotal: snap.numChildren(),
        count: 0
      });
    }

    this.setState({ notifications });
  };

  clearNotifications = () => {
    let index = this.state.notifications.findIndex(
      notification => notification.id === this.state.channel.id
    );

    if (index !== -1) {
      let updatedNotifications = [...this.state.notifications];
      updatedNotifications[index].total = this.state.notifications[
        index
      ].lastKnownTotal;
      updatedNotifications[index].count = 0;
      this.setState({ notifications: updatedNotifications });
    }
  };

  //count is equal to the total of notifications
  //If we have notifications, we return the number
  getNotificationCount = channel => {
    let count = 0;

    this.state.notifications.forEach(notification => {
      if (notification.id === channel.id) {
        count = notification.count;
      }
    });

    if (count > 0) return count;
  };

  openModal = () => this.setState({ modal: true });

  closeModal = () => this.setState({ modal: false });

  //Display an error message
  handleErrors = errors =>
    errors.map((error, i) => (
      <p key={i} style={{ textAlign: "center" }}>
        {error.message}
      </p>
    ));

  render() {
    const { channels, activeChannel, modal, loading, errors } = this.state;
    //const color = ["#4C9689"];
    return (
      <React.Fragment>
        <Menu.Menu style={{ paddingBottom: "2em" }}>
          <Menu.Item style={{ color: "grey" }}>
            <span>Channels</span> ({channels.length}){" "}
            <Icon
              name="add"
              onClick={this.openModal}
              style={{ cursor: "pointer" }}
            />
          </Menu.Item>
          {channels.length > 0 &&
            channels.map(channel => (
              <Menu.Item
                key={channel.id}
                name={channel.name}
                active={channel.id === activeChannel}
                onClick={() => this.changeChannel(channel)}
                style={{ color: "grey" }}
              >
                {this.getNotificationCount(channel) && (
                  <Label
                    style={{
                      borderRadius: "30px",
                      backgroundColor: "#FE2554"
                    }}
                  >
                    {this.getNotificationCount(channel)}
                  </Label>
                )}
                <Icon name="hashtag" style={{ float: "left", margin: 0 }} />{" "}
                <span style={{ marginLeft: "2px" }}>{channel.name}</span>
              </Menu.Item>
            ))}
        </Menu.Menu>
        <Modal basic open={modal} onClose={this.closeModal}>
          <Modal.Header>Create a channel</Modal.Header>
          <Modal.Content>
            <Form onSubmit={this.handleSubmit}>
              <Form.Field>
                <Input
                  fluid
                  label="Name"
                  name="channelName"
                  onChange={this.handleChange}
                />
                Names must be without spaces, and shorter than 22 characters.
              </Form.Field>
              <Form.Field>
                <Input
                  fluid
                  label="Purpose (optional)"
                  name="channelPurpose"
                  onChange={this.handleChange}
                />
                What's this channel about?
              </Form.Field>
            </Form>
          </Modal.Content>
          <Modal.Actions>
            <Button
              color="green"
              inverted
              onClick={this.handleSubmit}
              className={loading ? "loading" : ""}
            >
              <Icon name="checkmark" /> Create
            </Button>
            <Button color="red" inverted onClick={this.closeModal}>
              <Icon name="remove" /> Cancel
            </Button>
          </Modal.Actions>
          <div style={{ width: "200px", marginLeft: "20px" }}>
            {errors.length > 0 && (
              <Message error>
                <h3 style={{ textAlign: "center" }}>Error</h3>
                {this.handleErrors(errors)}
              </Message>
            )}
          </div>
        </Modal>
      </React.Fragment>
    );
  }
}

export default connect(null, { setCurrentChannel, setPrivateChannel })(
  Channels
);
