import React from 'react';
import axios from 'axios';
import { Link, Route, Redirect, Switch } from 'react-router-dom';
import triggerCheckins from '../helpers/triggerCheckins';
import Cookies from 'universal-cookie';
import HomePage from './HomePage';
import Login from './Login';
import SignUp from './SignUp';
import LandingPage from './LandingPage.jsx';

const cookies = new Cookies();

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      loggedIn: false,
      name: '',
      profileObj: {},
      tokenId: '',
      signIn: false,
      messages: [],
      progress: 0,
      admin: false,
    };

    this.responseGoogle = this.responseGoogle.bind(this);
    this.homePage = this.homePage.bind(this);
    this.checkCookies = this.checkCookies.bind(this);
    this.logout = this.logout.bind(this);
    this.responseGoogle = this.responseGoogle.bind(this);
    this.onClickSignUpSmoker = this.onClickSignUpSmoker.bind(this);
    this.signUp = this.signUp.bind(this);
    this.landingPage = this.landingPage.bind(this);
  }

  componentDidMount() {
    this.checkCookies();
  }

  onClickSignUpSmoker(user) {
    const userInfo = Object.assign(user, this.state.profileObj);
    axios.post('/signup', userInfo)
      .then((response) => {
        if (response) {
          // redirect to home page
          this.setState({ loggedIn: true });
        } else {
          console.log('ERROR WITH SIGN UP');
        }
      });
  }

  logout() {
    this.setState({
      loggedIn: false,
      name: '',
      profileObj: {},
      tokenId: '',
      signIn: false,
      messages: [],
      progress: 0,
      admin: false,
    });
  }

  responseGoogle(googleResponse) {
    cookies.set('dbd-session-cookie', googleResponse.tokenId);
    axios.post('/login', googleResponse.profileObj)
      .then((response) => {
        this.setState({
          profileObj: googleResponse.profileObj,
          tokenId: googleResponse.tokenId,
        });
        if (response.data === false) {
          this.setState({ signIn: true });
        } else {
          this.setState({
            // update progress, messages, etc
            messages: response.data.messages,
            progress: response.data.progress,
            admin: response.data.admin,
            loggedIn: true,
          });
        }
      });
  }

  checkCookies() {
    if (cookies.get('dbd-session-cookie')) {
      axios.get('/verifyAuth')
        .then((response) => {
          console.log('Response in verify Auth client', response);
          if (response.data !== false) {
            console.log('DATA BACK HOME', response.data);
            this.setState({
              // update progress, messages, etc
              profileObj: response.data,
              name: response.data.name,
              progress: response.data.progress,
              messages: response.data.messages,
              admin: response.data.admin,
              loggedIn: true,
              signIn: false,
            });
          }
        });
    }
  }

  homePage() {
    return (
      <HomePage
        messages={this.state.messages}
        userState={this.state}
        cookies={cookies}
        logout={this.logout}
      />
    );
  }
  signUp() {
    return (
      <SignUp createUser={this.onClickSignUpSmoker} />
    );
  }

  landingPage() {
    return (
      <LandingPage responseGoogle={this.responseGoogle} />
    );
  }

  render() {
    if (this.state.loggedIn && this.state.admin) {
      return (
        <div>
          <button style={{ backgroundColor: 'green' }} onClick={triggerCheckins}>
            Send check-in messages to users
          </button>
          <Switch>
            <Route exact path="/home" render={this.homePage} />
            <Redirect to="/home" />
          </Switch>
        </div>
      );
    } else if (this.state.loggedIn) {
      return (
        <div>
          <Switch>
            <Route exact path="/home" render={this.homePage} />
            <Redirect to="/home" />
          </Switch>
        </div>
      );
    } else if (this.state.signIn) {
      console.log('SEND TO SIGNUP');
      return (
        <div>
          <Switch>
            <Route exact path="/signup" render={this.signUp} />
            <Redirect to="/signup" />
          </Switch>
        </div>
      );
    }
    return (
      <div>
        <div className='btn-right' >
          <nav>
            <Login buttonText='Login Using Google' responseGoogle={this.responseGoogle} />
          </nav>
        </div>
        <div>
          <Switch>
            <Route exact path="/landing" render={this.landingPage} />
            <Redirect to="/landing" />
          </Switch>
        </div>
      </div>
    );
  }
}


export default App;
