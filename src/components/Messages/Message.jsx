import React, { Component } from "react";
import { Comment, Image } from "semantic-ui-react";
import moment from "moment";

class Message extends Component {
  isOwnMessage = (message, user) => {
    return message.user.id === user.uid ? "message__self" : "";
  };

  isImage = message => {
    return (
      message.hasOwnProperty("image") && !message.hasOwnProperty("content")
    );
  };

  render() {
    const timeFromNow = timestamp =>
      moment(timestamp).format("MMM Do, YYYY h:mm a");
    const { user, message } = this.props;
    return (
      <Comment>
        <Comment.Avatar src={message.user.avatar} />
        <Comment.Content className={this.isOwnMessage(message, user)}>
          <Comment.Author as="a">{message.user.name}</Comment.Author>
          <Comment.Metadata>{timeFromNow(message.timestamp)}</Comment.Metadata>
          {this.isImage(message) ? (
            <Image src={message.image} />
          ) : (
            <Comment.Text>{message.content}</Comment.Text>
          )}
        </Comment.Content>
      </Comment>
    );
  }
}

export default Message;
