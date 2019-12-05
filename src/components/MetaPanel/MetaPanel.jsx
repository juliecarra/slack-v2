import React, { Component } from "react";
import {
  Segment,
  Accordion,
  Header,
  Icon,
  Image,
  List
} from "semantic-ui-react";
class MetaPanel extends Component {
  constructor(props) {
    super(props);

    this.state = {
      channel: this.props.currentChannel,
      privateChannel: this.props.isPrivateChannel,
      activeIndex: 0
    };
  }

  setActiveIndex = (e, titleProps) => {
    const { index } = titleProps;
    const { activeIndex } = this.state;
    const newIndex = activeIndex === index ? -1 : index;
    this.setState({ activeIndex: newIndex });
  };

  formatCount = num => (num > 1 || num === 0 ? `${num} posts` : `${num} post`);

  displayTopPosters = posts =>
    Object.entries(posts)
      .sort((a, b) => b[1] - a[1])
      .map(([key, val], i) => (
        <List.Item key={i}>
          <Image avatar src={val.avatar} />
          <List.Content>
            <List.Header as="a">{key}</List.Header>
            <List.Description>{this.formatCount(val.count)}</List.Description>
          </List.Content>
        </List.Item>
      ))
      .slice(0, 3);

  render() {
    const { activeIndex, privateChannel, channel } = this.state;
    const { userPosts } = this.props;
    if (!channel) return null;
    //console.log(channel);

    return (
      <div>
        {!privateChannel && (
          <Segment>
            <Header as="h3" attached="top">
              About this channel
            </Header>
            <Accordion styled attached="true">
              <Accordion.Title
                active={activeIndex === 0}
                index={0}
                onClick={this.setActiveIndex}
              >
                <Icon name="dropdown" />
                <Icon name="info" /> Informations about the channel
              </Accordion.Title>
              <Accordion.Content active={activeIndex === 0}>
                Name <br />#{channel.name}
              </Accordion.Content>
              {channel.purpose && (
                <Accordion.Content active={activeIndex === 0}>
                  Purpose <br />
                  {channel.purpose}
                </Accordion.Content>
              )}
              <Accordion.Content active={activeIndex === 0}>
                Created <br />
                created by {channel.createdBy.name}
              </Accordion.Content>

              <Accordion.Title
                active={activeIndex === 1}
                index={1}
                onClick={this.setActiveIndex}
              >
                <Icon name="dropdown" />
                <Icon name="user circle" /> Top Posters
              </Accordion.Title>
              <Accordion.Content active={activeIndex === 1}>
                <List>{userPosts && this.displayTopPosters(userPosts)}</List>
              </Accordion.Content>
            </Accordion>
          </Segment>
        )}
      </div>
    );
  }
}

export default MetaPanel;
