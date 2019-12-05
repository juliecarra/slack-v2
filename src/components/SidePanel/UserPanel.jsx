import React, { Component } from "react";
import firebase from "../../firebase";
import {
  Grid,
  Header,
  Icon,
  Dropdown,
  Image,
  Modal,
  Button,
  Input
} from "semantic-ui-react";

import AvatarEditor from "react-avatar-editor";
class UserPanel extends Component {
  constructor(props) {
    super(props);

    this.state = {
      user: this.props.currentUser,
      users: [],
      modal: false,
      previewImage: "",
      croppedImage: "",
      blob: "",
      storageRef: firebase.storage().ref(),
      userRef: firebase.auth().currentUser,
      usersRef: firebase.database().ref("users"),
      metadata: {
        contentType: "image/jpeg"
      }
    };
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  openModal = () => this.setState({ modal: true });

  closeModal = () => this.setState({ modal: false });

  dropdownOptions = () => [
    {
      key: "user",
      text: (
        <span>
          Signed in as{" "}
          <strong>{this.state.user && this.state.user.displayName}</strong>
        </span>
      ),
      disabled: true
    },
    {
      key: "avatar",
      text: (
        <span onClick={this.openModal}>
          <Image
            spaced="right"
            avatar
            src={this.state.user && this.state.user.photoURL}
          />
          Change Your Avatar
        </span>
      )
    },
    {
      key: "signout",
      text: (
        <span onClick={this.handleSignOut}>
          Sign Out <Icon name="sign out alternate" style={{ float: "right" }} />
        </span>
      )
    }
  ];

  componentDidMount() {
    const { user } = this.state;
    if (user) {
      this.addUser(user.uid);
    }
  }

  handleSignOut = async () => {
    try {
      const res = await firebase.auth().signOut();
      console.log(res);
      console.log("user is signed out");
    } catch (error) {
      console.log(error);
    }
  };

  addUser = async currentUserUid => {
    let loadedUsers = [];
    try {
      await firebase
        .database()
        .ref("users")
        .on("child_added", snapshot => {
          if (currentUserUid === snapshot.key) {
            let user = snapshot.val();
            user["uid"] = snapshot.key;
            user["status"] = "online";
            loadedUsers.push(user);
            console.log(loadedUsers);
            this.setState({ users: loadedUsers });
          }
        });
      //To have informations about the user's status
      //If the user is connected, we pass the user's uuid
      await firebase
        .database()
        .ref(".info/connected")
        .on("value", snapshot => {
          if (snapshot.val() === true) {
            const ref = firebase
              .database()
              .ref("presence")
              .child(currentUserUid);
            ref.set(true);
            ref.onDisconnect().remove(error => {
              if (error !== null) {
                console.log("error");
              }
            });
          }
        });
      //Add status to user
      firebase
        .database()
        .ref("presence")
        .on("child_added", snapshot => {
          if (currentUserUid === snapshot.key) {
            this.addStatusToUser(snapshot.key);
          }
        });
      firebase
        .database()
        .ref("presence")
        .on("child_removed", snapshot => {
          if (currentUserUid === snapshot.key) {
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

  //Add image
  handleChange = e => {
    const file = e.target.files[0];
    const reader = new FileReader();
    if (file) {
      reader.readAsDataURL(file);
      reader.addEventListener("load", () => {
        this.setState({ previewImage: reader.result });
      });
    }
  };

  handleCropImage = () => {
    if (this.avatarEditor) {
      this.avatarEditor.getImageScaledToCanvas().toBlob(blob => {
        let imageUrl = URL.createObjectURL(blob);
        this.setState({
          croppedImage: imageUrl,
          blob
        });
      });
    }
  };

  uploadCroppedImage = () => {
    const { storageRef, userRef, blob, metadata } = this.state;

    storageRef
      .child(`pictures/user/${userRef.uid}`)
      .put(blob, metadata)
      .then(snap => {
        snap.ref.getDownloadURL().then(downloadURL => {
          this.setState({ uploadedCroppedImage: downloadURL }, () =>
            this.changeProfilePicture()
          );
        });
      });
  };

  changeProfilePicture = async () => {
    try {
      await this.state.userRef.updateProfile({
        photoURL: this.state.uploadedCroppedImage
      });
      console.log("profile picture updated");
      this.closeModal();

      try {
        await this.state.usersRef
          .child(this.state.user.uid)
          .update({ avatar: this.state.uploadedCroppedImage });
        console.log("profile picture updated");
      } catch (error) {
        console.log(error);
      }
    } catch (error) {
      console.log(error);
    }
  };
  render() {
    const { users, modal, previewImage, croppedImage } = this.state;

    return (
      <Grid>
        <Grid.Column>
          <Grid.Row style={{ padding: "1.2rem", margin: 0 }}>
            <Header inverted floated="left" as="h2">
              <Dropdown
                trigger={
                  <span>
                    {" "}
                    <Icon name="slack" />
                    Slack
                  </span>
                }
                options={this.dropdownOptions()}
              />
            </Header>
          </Grid.Row>
          <br />
          <h4 style={{ padding: "1.2rem", margin: 0 }}>
            {users.map(user => (
              <div
                key={user.uid}
                onClick={() => console.log(user)}
                style={{
                  opacity: 0.7,

                  color: "grey"
                }}
              >
                {this.isUserOnline(user) ? (
                  <Icon
                    name="circle"
                    color="green"
                    title="online"
                    style={{ fontSize: "10px" }}
                  />
                ) : (
                  <Icon name="circle outline" />
                )}
                {user.displayName}
              </div>
            ))}
          </h4>

          <Modal basic open={modal} onClose={this.closeModal}>
            <Modal.Header>Change your profile picture </Modal.Header>
            <Modal.Content>
              <Input
                fluid
                type="file"
                label="New profile picture"
                name="previewImage"
                onChange={this.handleChange}
              />
              <Grid centered stackable columns={2}>
                <Grid.Row centered>
                  <Grid.Column className="ui center aligned grid">
                    {previewImage && (
                      <AvatarEditor
                        ref={node => (this.avatarEditor = node)}
                        image={previewImage}
                        width={120}
                        height={120}
                        border={50}
                        scale={1.2}
                      />
                    )}
                  </Grid.Column>
                  <Grid.Column>
                    {croppedImage && (
                      <Image
                        style={{ margin: "3.5em auto" }}
                        width={100}
                        height={100}
                        src={croppedImage}
                      />
                    )}
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </Modal.Content>
            <Modal.Actions>
              {croppedImage && (
                <Button
                  color="green"
                  inverted
                  onClick={this.uploadCroppedImage}
                >
                  <Icon name="save" /> Change
                </Button>
              )}
              <Button color="yellow" inverted onClick={this.handleCropImage}>
                <Icon name="image" /> Preview
              </Button>
              <Button color="red" inverted onClick={this.closeModal}>
                <Icon name="remove" /> Cancel
              </Button>
            </Modal.Actions>
          </Modal>
        </Grid.Column>
      </Grid>
    );
  }
}

export default UserPanel;
