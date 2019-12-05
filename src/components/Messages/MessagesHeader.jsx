import React, { Component } from "react";
import { Header, Segment, Input, Icon } from "semantic-ui-react";

class MessagesHeader extends Component {
  render() {
    const {
      channelName,
      numUniqueUsers,
      handleSearchChange,
      searchLoading,
      isPrivateChannel,
      handleStar,
      isChannelStarred
    } = this.props;

    return (
      <Segment clearing>
        <Header fluid="true" as="h2" floated="left" style={{ marginBottom: 0 }}>
          <span>
            {channelName}
            <br />
            {!isPrivateChannel && (
              <Icon
                onClick={handleStar}
                name={isChannelStarred ? "star" : "star outline"}
                color={isChannelStarred ? "yellow" : "grey"}
                style={{ fontSize: "15px" }}
              />
            )}
            {!isPrivateChannel && (
              <span style={{ color: "grey", fontSize: "1.14285714rem" }}>
                |
              </span>
            )}{" "}
            <Icon
              name="user outline"
              color="grey"
              style={{ fontSize: "15px" }}
            />
            <span style={{ color: "grey", fontSize: "1.14285714rem" }}>
              {numUniqueUsers}
            </span>
          </span>
        </Header>

        {/* Channel Search Input */}
        <Header floated="right">
          <Input
            loading={searchLoading}
            onChange={handleSearchChange}
            size="mini"
            icon="search"
            name="searchTerm"
            placeholder="Search Messages"
          />
        </Header>
      </Segment>
    );
  }
}

export default MessagesHeader;
