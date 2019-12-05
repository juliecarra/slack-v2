import React, { Component } from "react";
import uuidv4 from "uuid/v4";
import firebase from "../../firebase";
import { Segment, Button, Input } from "semantic-ui-react";

import FileModal from "./FileModal.jsx";
import ProgressBar from "./ProgressBar.jsx";

import { Picker, emojiIndex } from "emoji-mart";
import "emoji-mart/css/emoji-mart.css";

class MessageForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      storageRef: firebase.storage().ref(),
      typingRef: firebase.database().ref("typing"),
      uploadTask: null,
      uploadState: "",
      percentUploaded: 0,
      message: "",
      channel: this.props.currentChannel,
      user: this.props.currentUser,
      loading: false,
      errors: [],
      modal: false,
      emojiPicker: false
    };
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  componentWillUnmount() {
    const { uploadTask } = this.state;
    if (uploadTask !== null) {
      this.setState({ uploadTask: null });
    }
  }

  openModal = () => this.setState({ modal: true });

  closeModal = () => this.setState({ modal: false });

  handleChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  createMessage = (fileUrl = null) => {
    const message = {
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      user: {
        id: this.state.user.uid,
        name: this.state.user.displayName,
        avatar: this.state.user.photoURL
      }
    };
    if (fileUrl !== null) {
      message["image"] = fileUrl;
    } else {
      message["content"] = this.state.message;
    }
    return message;
  };

  sendMessage = async () => {
    const { getMessagesRef } = this.props; //To create a message in the database, we need getMessagesRef()
    const { message, channel, typingRef, user } = this.state;
    let error;
    try {
      if (message) {
        this.setState({ loading: true });
        //To know in which channel we are adding the message, we need its id
        await getMessagesRef()
          .child(channel.id)
          .push()
          .set(this.createMessage());

        this.setState({ errors: [], loading: false, message: "" });
        typingRef
          .child(channel.id)
          .child(user.uid)
          .remove();
      } else {
        error = { message: "Add a message" };
        this.setState({ errors: this.state.errors.concat(error) });
      }
    } catch (error) {
      console.log(error);
      this.setState({ errors: this.state.errors.concat(error) });
    }
  };

  //Get a different path if the message is in a public or private channel
  getPath = () => {
    if (!this.props.isPrivateChannel) {
      return `chat/public/${this.state.channel.id}`;
    } else {
      return `chat/private/${this.state.channel.id}`;
    }
  };

  uploadFile = (file, metadata) => {
    const pathToUpload = this.state.channel.id;
    const ref = this.props.getMessagesRef();
    const filePath = `${this.getPath()}/${uuidv4()}.jpg`;

    this.setState(
      {
        uploadState: "uploading",
        uploadTask: this.state.storageRef.child(filePath).put(file, metadata)
      },
      () => {
        this.state.uploadTask.on(
          "state_changed",
          snap => {
            const percentUploaded = Math.round(
              (snap.bytesTransferred / snap.totalBytes) * 100
            );
            this.setState({ percentUploaded });
          },
          err => {
            console.error(err);
            this.setState({
              errors: this.state.errors.concat(err),
              uploadState: "error",
              uploadTask: null
            });
          },
          () => {
            this.state.uploadTask.snapshot.ref
              .getDownloadURL()
              .then(downloadUrl => {
                this.sendFileMessage(downloadUrl, ref, pathToUpload);
              })
              .catch(err => {
                console.error(err);
                this.setState({
                  errors: this.state.errors.concat(err),
                  uploadState: "error",
                  uploadTask: null
                });
              });
          }
        );
      }
    );
  };

  sendFileMessage = async (fileUrl, ref, pathToUpload) => {
    try {
      await ref
        .child(pathToUpload)
        .push()
        .set(this.createMessage(fileUrl));
      this.setState({ uploadState: "done" });
    } catch (error) {
      console.log(error);
      this.setState({
        errors: this.state.errors.concat(error)
      });
    }
  };

  //Typing
  handleKeyDown = e => {
    const { message, typingRef, channel, user } = this.state;
    if (e.keyCode === 13) {
      this.sendMessage();
    }
    if (message) {
      typingRef
        .child(channel.id)
        .child(user.uid)
        .set(user.displayName);
    } else {
      typingRef
        .child(channel.id)
        .child(user.uid)
        .remove();
    }
  };

  //Emoji
  handleTogglePicker = () => {
    this.setState({ emojiPicker: !this.state.emojiPicker });
  };

  handleAddEmoji = emoji => {
    const oldMessage = this.state.message;
    const newMessage = this.colonToUnicode(`${oldMessage} ${emoji.colons}`);
    this.setState({ message: newMessage, emojiPicker: false });
    setTimeout(() => this.messageInputRef.focus(), 0);
  };

  colonToUnicode = message => {
    return message.replace(/:[A-Za-z0-9_+-]+:/g, x => {
      x = x.replace(/:/g, "");
      let emoji = emojiIndex.emojis[x];
      if (typeof emoji !== "undefined") {
        let unicode = emoji.native;
        if (typeof unicode !== "undefined") {
          return unicode;
        }
      }
      x = ":" + x + ":";
      return x;
    });
  };
  render() {
    const {
      errors,
      message,

      modal,
      uploadState,
      percentUploaded,
      emojiPicker
    } = this.state;

    return (
      <Segment className="messages__form">
        {emojiPicker && (
          <Picker
            set="apple"
            className="emojipicker"
            title="Pick your emoji"
            emoji="point_up"
            onSelect={this.handleAddEmoji}
          />
        )}
        <Input
          fluid
          name="message"
          value={message}
          style={{ marginBottom: "0.7em" }}
          label={
            <Button
              icon={emojiPicker ? "close" : "add"}
              content={emojiPicker ? "Close" : null}
              onClick={this.handleTogglePicker}
            />
          }
          labelPosition="left"
          placeholder="Write your message"
          onChange={this.handleChange}
          className={
            errors.some(error => error.message.includes("message"))
              ? "error"
              : ""
          }
          onKeyDown={this.handleKeyDown}
          ref={node => (this.messageInputRef = node)}
        />
        <Button.Group icon widths="2">
          {/* <Button
            onClick={this.sendMessage}
            style={{ border: "1px solid grey" }}
            content="Add Message"
            labelPosition="left"
            icon="edit"
            disabled={loading}
          /> */}
          <Button
            style={{ border: "1px solid grey" }}
            content="Upload Media"
            labelPosition="right"
            icon="cloud upload"
            disabled={uploadState === "uploading"}
            onClick={this.openModal}
          />

          <FileModal
            modal={modal}
            closeModal={this.closeModal}
            uploadFile={this.uploadFile}
          />
        </Button.Group>
        <ProgressBar
          uploadState={uploadState}
          percentUploaded={percentUploaded}
        />
      </Segment>
    );
  }
}

export default MessageForm;
