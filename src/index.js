import React, { Component } from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./components/App.jsx";
import "semantic-ui-css/semantic.css";
import firebase from "./firebase";
import * as serviceWorker from "./serviceWorker";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  withRouter
} from "react-router-dom";
import { connect } from "react-redux";
import { createStore } from "redux";
import { Provider } from "react-redux";
import { setUser, clearUser } from "./actions";
import { composeWithDevTools } from "redux-devtools-extension";
import reducers from "./reducers";
import Home from "./components/pages/Home";
import LogIn from "./components/pages/Authentication/Login.jsx";
import SignUp from "./components/pages/Authentication/SignUp.jsx";
import Loading from "./Loading";

class Root extends Component {
  componentDidMount() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        //console.log(user);
        this.props.setUser(user);
        this.props.history.push("/Chat");
      } else {
        this.props.history.push("/");
        this.props.clearUser();
      }
    });
  }

  render() {
    return this.props.isLoading ? (
      <Loading />
    ) : (
      <Switch>
        <Route exact path="/" component={Home} />
        <Route exact path="/Loading" component={Loading} />
        <Route exact path="/LogIn" component={LogIn} />
        <Route exatc path="/SignUp" component={SignUp} />
        <Route exact path="/Chat" component={App} />
        <Route render={() => <h1>404</h1>} />
      </Switch>
    );
  }
}

const mapStateFromProps = state => ({
  isLoading: state.user.isLoading
});

const RootWithAuthentication = withRouter(
  connect(mapStateFromProps, { setUser, clearUser })(Root)
);

ReactDOM.render(
  <Provider store={createStore(reducers, composeWithDevTools())}>
    <Router>
      <RootWithAuthentication />
    </Router>
  </Provider>,
  document.getElementById("root")
);

// export default connect(mapStateFromProps, { setUser, clearUser })(Root);
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
