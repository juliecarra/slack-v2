import React, { Component } from "react";
import { Form, Button, Message } from "semantic-ui-react";
import { Link } from "react-router-dom";
import "./SignUp.scss";
import firebase from "../../../firebase";
import md5 from "md5";

class SignUp extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username: "",
      email: "",
      password: "",
      password_check: "",
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
  checkEmailAndPassword = ({ username, email, password, password_check }) => {
    return (
      !username.length ||
      !email.length ||
      !password.length ||
      !password_check.length
    );
  };

  //Check if password is less than 6
  checkPassword = ({ password, password_check }) => {
    if (password.length < 6 || password_check < 6) return false;
    else if (password !== password_check) return false;
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

  //Display error message
  handleErrors = errors =>
    errors.map((error, i) => <p key={i}>{error.message}</p>);

  //Register with firebase
  handleSubmit = async e => {
    if (this.validateForm()) {
      try {
        e.preventDefault();
        //Clear errors
        this.setState({ errors: [], loading: true });
        const res = await firebase
          .auth()
          .createUserWithEmailAndPassword(
            this.state.email,
            this.state.password
          );
        console.log(res);
        this.setState({ loading: false });
        //Redirect user to LogIn when registered
        this.props.history.push("/LogIn");
        //Update user's username, email and profile picture when registered
        try {
          await res.user.updateProfile({
            displayName: this.state.username,
            email: this.state.email,
            photoURL: `http://gravatar.com/avatar/${md5(
              res.user.email
            )}?d=identicon` //Generate a ramdom profil picture
          });
        } catch (error) {
          this.setState({ errors: this.state.errors.concat(error) });
        }
        //Registered user to database
        try {
          await firebase
            .database()
            .ref("users")
            .child(res.user.uid) //res.user.uid refer to user's credential (uid)
            .set({
              displayName: this.state.username,
              emaill: this.state.email,
              photoURL: "/img/profile.png"
            });
          console.log("user is registered to database");
        } catch (error) {
          this.setState({ errors: this.state.errors.concat(error) });
        }
      } catch (error) {
        // console.log(error.message);
        this.setState({
          errors: this.state.errors.concat(error),
          loading: false
        });
      }
      this.setState({
        username: "",
        email: "",
        password: "",
        password_check: ""
      });
    }
  };

  render() {
    const {
      username,
      email,
      password,
      password_check,
      errors,
      loading
    } = this.state;

    return (
      <div className="SignUp">
        <div className="container">
          <br />
          <h1>Create your account</h1>
          <p>
            Enter your <strong>username</strong>, <strong>email address</strong>{" "}
            and
            <strong> password</strong>.
          </p>
          <Form onSubmit={this.handleSubmit}>
            <Form.Field>
              <input
                type="text"
                name="username"
                value={username}
                placeholder="username"
                onChange={this.handleChange}
              />
            </Form.Field>
            <Form.Field>
              <input
                type="text"
                name="email"
                value={email}
                placeholder="you@example.com"
                onChange={this.handleChange}
              />
            </Form.Field>

            <Form.Field>
              <input
                type="password"
                name="password"
                value={password}
                placeholder="password"
                onChange={this.handleChange}
              />
            </Form.Field>
            <Form.Field>
              <input
                type="password"
                name="password_check"
                value={password_check}
                placeholder="confirm your password"
                onChange={this.handleChange}
              />
            </Form.Field>

            <Button
              disabled={loading}
              className={loading ? "loading" : ""}
              style={{ backgroundColor: "#007A5A", color: "#fff" }}
            >
              Create Account
            </Button>
          </Form>
          {errors.length > 0 && (
            <Message error>
              <h3 style={{ textAlign: "center" }}>Error</h3>
              {this.handleErrors(errors)}
            </Message>
          )}
          <br />
          <p>
            Already have an account ? <Link to="/LogIn">Sign In</Link>
          </p>
        </div>
      </div>
    );
  }
}

export default SignUp;
