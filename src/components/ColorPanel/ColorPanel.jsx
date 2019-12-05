import React, { Component } from "react";
import { Sidebar, Menu, Divider, Button, Modal, Icon } from "semantic-ui-react";
import { GithubPicker } from "react-color";
import firebase from "firebase";
import "./ColorPanel.scss";
import { connect } from "react-redux";
import { setUserThemes } from "../../actions";

class ColorPanel extends Component {
  constructor(props) {
    super(props);

    this.state = {
      modal: false,
      sidebarTheme: "",
      loadedSidebarTheme: [],
      usersRef: firebase.database().ref("users"),
      user: this.props.currentUser
    };
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  openModal = () => this.setState({ modal: true });

  closeModal = () => this.setState({ modal: false });

  componentDidMount() {
    if (this.state.user) {
      this.addSidebarThemelListeners(this.state.user.uid);
    }
  }

  componentWillUnmount() {
    this.removeSidebarThemelListeners();
  }

  handleChangeSidebarTheme = color => {
    this.setState({ sidebarTheme: color.hex });
  };

  //Make sure we have a color  value
  handleSaveSidebarTheme = () => {
    const { sidebarTheme } = this.state;
    if (sidebarTheme) {
      this.addSidebarTheme(sidebarTheme);
    }
  };

  addSidebarTheme = async sidebarTheme => {
    const {
      user,

      usersRef
    } = this.state;

    try {
      await usersRef
        .child(`${user.uid}/theme`)
        .push()
        .update({
          sidebarTheme
        });

      this.closeModal();
      console.log("sidebar theme has been created");
    } catch (error) {
      console.log(error);
    }
  };

  addSidebarThemelListeners = () => {
    const { usersRef, user } = this.state;
    let loadedSidebarTheme = [];
    usersRef.child(`${user.uid}/theme`).on("child_added", snap => {
      loadedSidebarTheme.unshift(snap.val());
      this.setState({ loadedSidebarTheme });
    });
  };

  displaySidebarTheme = themes =>
    themes.length > 0 &&
    themes.map((theme, i) => (
      <React.Fragment key={i}>
        <Divider />

        <div className="color__container">
          <div
            className="color__square"
            style={{ backgroundColor: theme.sidebarTheme }}
            onClick={() => this.props.setUserThemes(theme.sidebarTheme)}
          ></div>
        </div>
      </React.Fragment>
    ));

  removeSidebarThemelListeners = () => {
    const { usersRef, user } = this.state;
    usersRef.child(`${user.uid}/theme`).off();
  };
  render() {
    const { modal, sidebarTheme, loadedSidebarTheme } = this.state;
    return (
      <Sidebar
        as={Menu}
        icon="labeled"
        inverted
        vertical
        visible
        width="very thin"
      >
        <Divider />
        <Button icon="add" size="small" color="blue" onClick={this.openModal} />
        {this.displaySidebarTheme(loadedSidebarTheme)}
        <Modal basic open={modal} onClose={this.closeModal}>
          <Modal.Header>Sidebar Theme</Modal.Header>
          <Modal.Description>
            Customize the look of your workspace
          </Modal.Description>
          <Modal.Content>
            <GithubPicker
              color={sidebarTheme}
              onChange={this.handleChangeSidebarTheme}
            />
          </Modal.Content>
          <Modal.Actions>
            <Button
              color="green"
              inverted
              onClick={this.handleSaveSidebarTheme}
            >
              <Icon name="checkmark" /> Save
            </Button>
            <Button color="red" inverted onClick={this.closeModal}>
              <Icon name="remove" /> Cancel
            </Button>
          </Modal.Actions>
        </Modal>
      </Sidebar>
    );
  }
}

export default connect(null, { setUserThemes })(ColorPanel);
