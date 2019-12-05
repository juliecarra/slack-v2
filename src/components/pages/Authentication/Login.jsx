import React, { Component } from "react";
import { Form, Button, Message } from "semantic-ui-react";
import firebase from "../../../firebase";
import "./LogIn.scss";

class LogIn extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: "",
      password: "",
      errors: [],
      loading: false
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  //Check if  email and password are empty
  checkEmailAndPassword = ({ email, password }) => {
    return !email.length || !password.length;
  };

  //Check if password is less than 6
  checkPassword = ({ password }) => {
    if (password.length < 6) return false;
    else return true;
  };

  //Check if the form is valid
  validateForm = () => {
    let errors = [];
    let error;
    if (this.checkEmailAndPassword(this.state)) {
      error = { message: "Please fill in all fields" };
      this.setState({ errors: errors.concat(error) });
      //console.log(errors);
      return false;
    } else if (!this.checkPassword(this.state)) {
      error = { message: "Please enter a valid password" };
      this.setState({ errors: errors.concat(error) });
    } else return true;
  };

  //LogIn with firebase
  handleSubmit = async e => {
    if (this.validateForm()) {
      try {
        e.preventDefault();
        this.setState({ errors: [], loading: true });
        const res = await firebase
          .auth()
          .signInWithEmailAndPassword(this.state.email, this.state.password);
        console.log(res);
        console.log("user is logged in");
        //When user is loggedIn he is redirected to Chat
        this.props.history.push("/Chat");
      } catch (error) {
        console.log(error.message);
        this.setState({
          errors: this.state.errors.concat(error),
          loading: false
        });
      }
      this.setState({ email: "", password: "" });
    }
  };

  //Display error message
  handleErrors = errors =>
    errors.map((error, i) => <p key={i}>{error.message}</p>);

  render() {
    const { email, password, errors, loading } = this.state;
    return (
      <div className="LogIn">
        <div className="container">
          <br />
          <div className="form">
            <h1>Sign in</h1>
            <p>
              Enter your <strong>email address</strong> and
              <strong> password</strong>.
            </p>
            <Form onSubmit={this.handleSubmit}>
              <Form.Field>
                <input
                  type="text"
                  name="email"
                  value={email}
                  placeholder="you@example.com"
                  onChange={this.handleChange}
                />
              </Form.Field>
              <br />
              <Form.Field>
                <input
                  type="password"
                  name="password"
                  value={password}
                  placeholder="password"
                  onChange={this.handleChange}
                />
              </Form.Field>
              <br />
              <Button
                style={{ backgroundColor: "#007A5A", color: "#fff" }}
                disabled={loading}
                className={loading ? "loading" : ""}
              >
                Sign in
              </Button>
            </Form>
            {errors.length > 0 && (
              <Message error>
                <h3 style={{ textAlign: "center" }}>Error</h3>
                {this.handleErrors(errors)}
              </Message>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default LogIn;
