import React from "react";
import firebase from "./init-firebase";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
//import Slider from "react-input-slider";
import "./Login.css";

//import SignupConfirm from "./SignupConfirm";
const initialState = {
  uid: "",
  phone: "",
  lastAttemptedPhone: "",
  password: "",
  username: "",
  name: "",
  id: "",
  tickets: [],
  events: [],
  clubs: [],
  jobs: [],
  housing: [],
  shops: [],
  restaurants: [],
  bars: [],
  services: [],
  proposals: [],
  authError: "",
  textedCode: "",
  alertExistingUser: false,
  noUserPleaseSignUp: null,
  recaptchaGood: false,
  showrecaptcha: false,
  recaptchaResponse: "",
  normalFinish: false,
  loading: false,
  working: true,
  above13: false,
  volume: 0,
  time: 0,
  playing: false,
  closeContinue: false,
  goSignupConfirm: false,
  watchingSignupVideo: false
};
class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      uid: "",
      phone: this.props.auth && this.props.auth.uid,
      lastAttemptedPhone: "",
      username: this.props.user && this.props.user.username,
      name: this.props.user && this.props.user.name,
      id: this.props.user && this.props.user.id,
      tickets: [],
      events: [],
      clubs: [],
      jobs: [],
      housing: [],
      shops: [],
      restaurants: [],
      bars: [],
      services: [],
      proposals: [],
      authError: "",
      textedCode: "",
      alertExistingUser: false,
      noUserPleaseSignUp: null,
      recaptchaGood: false,
      showrecaptcha: false,
      recaptchaResponse: "",
      normalFinish: false,
      loading: false,
      working: true,
      above13: false,
      volume: 0,
      time: 0,
      playing: false,
      closeContinue: false,
      goSignupConfirm: false,
      watchingSignupVideo: false,
      stopSubmit: false,
      user: this.props.user
    };
    this.menuGrabber = React.createRef();
    this.recaptcha = React.createRef();
  }

  /*requestTextCodeBox = e => {
    e.preventDefault();
    this.props.signIn(this.state);
  };*/

  changeTime = y => {
    this.refs.vidRef.currentTime = y;
    this.setState({ time: y });

    /*if(this.state.time !== this.refs.vidRef.currentTime){
      this.setState({ time: this.refs.vidRef.currentTime });
    }*/
  };
  playContinue = () => {
    this.setState({ closeContinue: true });
    this.playVideo();
  };
  playVideo() {
    this.refs.vidRef.play();
    this.setState({ playing: true });
  }
  pauseVideo = () => {
    // Pause as well
    this.refs.vidRef.pause();
    this.setState({ playing: false });
  };
  handleChange = (e, users) => {
    if (e.target.id === "phone") {
      this.setState({
        [e.target.id]: "+1" + e.target.value
      });
    } else if (e.target.id === "username") {
      if (e.which !== 32) {
        const enteredUsername = e.target.value.toLowerCase();
        const usernames = [];
        users && users.map(user => usernames.push(user.name.toLowerCase()));
        if (usernames.includes(enteredUsername)) {
          this.setState({ newUserPlease: true });
        } else {
          this.setState({
            [e.target.id]: enteredUsername
          });
        }
      }
    } else {
      this.setState({
        [e.target.id]: e.target.value
      });
    }
  };
  componentDidUpdate = prevProps => {
    if (this.props.user !== undefined && this.props.user !== prevProps.user) {
      this.setState({
        username: this.props.user.username,
        name: this.props.user.name
      });
    }
  };
  confirmCode = async () => {
    //console.log(this.state.textedCode);
    window.confirmationResult
      .confirm(this.state.textedCode)
      .then(async result => {
        var user = result.user;
        //console.log(user);
        console.log("NormalFinish");
        console.log(user);
        console.log(this.state.user);
        const start = this.state;
        console.log(user.uid);
        var gee = this.props.users.find(x => x.id === user.uid);
        if (gee) {
          //const foo = doc.data();
          console.log("user profile exists");
          this.props.pleaseClose();
        } else {
          console.log("No such document! Adding to firestore...");
          clearTimeout(this.close);
          this.close = setTimeout(() => {
            firebase
              .firestore()
              .collection("users")
              .doc(user.uid)
              .set({
                username: start.username,
                name: start.name,
                surname: start.surname
              })
              .catch(err => {
                console.log(err);
              });
            this.props.pleaseClose();
          }, 100);
        }
      })
      .catch(err => {
        this.setState({ authError: err });
        console.log(err);
      });
  };
  /*UNSAFE_componentWillUpdate = () => { 
if(this.state.Seastioid !== ""){
  this.props.signUp(this.state)
  this.props.goSignupConfirmed();
}
  }*/
  //SignIn && SignUp
  requestTextCodeBox = () => {
    //if (this.state.appVerifier === "") return this.stopSubmit;
    //this.setState({ loading: true });
    console.log(this.state.textedCode);
    //const firestore = getFirestore();
    console.log("ok");
    this.setState({ lastAttemptedPhone: this.state.phone });
    firebase
      .auth()
      .signInWithPhoneNumber(this.state.phone, this.state.appVerifier)
      .then(confirmationResult => {
        console.log(confirmationResult);
        window.confirmationResult = confirmationResult;
        console.log("yo");
      })
      .catch(err => {
        console.log(err);
        this.setState({
          loading: false,
          noUserPleaseSignUp: null,
          showrecaptcha: false,
          recaptchaGood: false,
          authError: err.message
        });
      });
  };
  componentDidMount = () => {
    //this.firebase = firebase
    /*if (!this.props.loginOpenstate) {
      this.props.loginOpen();
    }
    this.menuGrabber.current.addEventListener("gestureend", e => {
      e.preventDefault();
      console.log("touched");
      if (e.scale < 1) {
        this.props.menuOpener();
      }
    });*/
    this.refs.vidRef &&
      this.refs.vidRef.addEventListener("volumechange", event => {
        this.setState({ volume: event });
      });
    this.refs.vidRef &&
      this.refs.vidRef.addEventListener("timeupdate", e => {
        const time = e.target.currentTime;
        const timecut = time.toString().substr(0, time.toString().length - 5);
        this.setState({
          time: timecut,
          duration: e.target.duration
        });
      });
    if (this.props.menuOpen) {
      this.props.closeMenu();
    }
    //console.log("ok");
    //console.log(this.props.userLoaded);
    window.recaptchaVerifier =
      this.state.working &&
      new firebase.auth.RecaptchaVerifier(this.recaptcha.current, {
        size: "normal",
        callback: response => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
          // ...
          //console.log(response);
          //const jsonresponse = await response.toString()
          //this.setState({ recaptchaResponse: response });
          this.setState({
            lastAttemptedPhone: this.state.phone,
            recaptchaGood: true,
            showrecaptcha: false
          });
          this.requestTextCodeBox();
          return response;
        },
        "expired-callback": err => {
          // Response expired. Ask user to solve reCAPTCHA again.
          // ...
          this.setState({ showrecaptcha: false, recaptchaGood: false });
          console.log(err);
          return err;
        }
      });

    const appVerifier = window.recaptchaVerifier;
    appVerifier.render();
    if (this.state.appVerifier !== appVerifier) {
      this.setState({ appVerifier });
    }
  };

  checkPhoneTaken = e => {
    e.preventDefault();
    const usphone = this.state.phone;
    this.setState({ authError: "", loading: true, working: true }, async () => {
      await fetch(
        "https://us-central1-vaumoney.cloudfunctions.net/doesUserPhoneExistVaumoney",
        {
          method: "POST",
          //credentials: "include",
          headers: {
            "Content-Type": "Application/JSON",
            "Access-Control-Request-Method": "POST"
          },
          body: JSON.stringify({ usphone: usphone }),
          maxAge: 3600
          //"mode": "cors",
        }
      )
        .then(async response => await response.text())
        .then(body => {
          if (this.state.noUserPleaseSignUp) {
            //console.log(body);
            console.log("Successfully fetched user data, signup:", body);
            if (body === this.state.phone) {
              this.setState({
                showrecaptcha: true,
                noUserPleaseSignUp: false,
                loading: false
              });
              console.log("user exists, please sign in");
            }
          } else if (!this.state.noUserPleaseSignUp) {
            console.log(body);
            console.log("Successfully fetched user data, login:", body);
            if (body === this.state.phone) {
              //this.setState({ noUserPleaseSignUp: null });
              this.setState({
                showrecaptcha: true,
                noUserPleaseSignUp: false,
                loading: false
              });
              console.log("user exists, here's the recaptcha");
            }
          }
        })
        .catch(err => {
          if (this.state.noUserPleaseSignUp) {
            console.log("No user phone!");
            //this.setState({ noUserPleaseSignUp: null });
            console.log("no user exists, here's the recaptcha");
            this.setState({
              showrecaptcha: true,
              noUserPleaseSignUp: true,
              loading: false
            });
          } else if (!this.state.noUserPleaseSignUp) {
            console.log("No user phone!");
            console.log("no user exists, please sign up");
            console.log(err);
            this.setState({
              showrecaptcha: false,
              noUserPleaseSignUp: true,
              loading: false
            });
          }
        });
    });
  };

  stopSubmit(e) {
    e.preventDefault();
    return false;
  }
  handleOptionChange = e => {
    if (e.target.id === "above") {
      this.setState({
        above13: e.target.value
      });
    }
    if (e.target.id === "below") {
      this.setState({
        above13: !e.target.value
      });
    }
  };
  //
  render() {
    //console.log(this.props.auth.uid);
    //console.log(this.state.noUserPleaseSignUp);
    let backdrop;
    //console.log(this.props.meData)
    //console.log(this.props.history.length);
    const { users } = this.props;

    /*let { from } = this.props.location.state || {
      from: { pathname: "/" }
    };if (
      this.props.auth &&
      this.props.auth.uid &&
      this.props.user !== undefined
    ) {
      this.props.from(from);
      return <Redirect to={from} />;
    }*/
    var existingUsernames = [];
    users &&
      users.length > 0 &&
      users.map(number => existingUsernames.push(number.username));

    if (existingUsernames.includes(this.state.username)) {
      //console.log("finishSignUp");
      if (!this.state.stopSubmit) {
        setTimeout(this.setState({ stopSubmit: true }), 500);
      }
    } else {
      if (this.state.stopSubmit) {
        this.setState({ stopSubmit: false });
      }
    }
    //console.log(this.props.user)
    return (
      <div /*ref={this.menuGrabber} */ style={{ zIndex: "9999", top: "0px" }}>
        <div
          style={
            this.state.closeWarnCaptcha
              ? {
                  display: "flex",
                  position: "absolute",
                  width: "99%",
                  height: "100%",
                  zIndex: "9999",
                  transform: "translateX(-100%)",
                  backgroundColor: "rgba(250,250,250,0)",
                  transition: ".3s linear",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "30px"
                }
              : {
                  display: "flex",
                  position: "fixed",
                  width: "100%",
                  height: "100%",
                  zIndex: "9999",
                  top: "0px",
                  transform: "translateX(0%)",
                  backgroundColor: "rgba(250,250,250,1)",
                  transition: ".3s linear",
                  flexDirection: "column",
                  alignItems: "center",
                  overflow: "auto"
                }
          }
        >
          <div
            onClick={() => this.setState({ closeWarnCaptcha: true })}
            style={{
              display: "flex",
              position: "absolute",
              left: "20px",
              top: "20px",
              color: "black"
            }}
          >
            Fine
          </div>
          <div
            onClick={this.props.pleaseClose}
            style={{
              display: "flex",
              position: "absolute",
              right: "20px",
              top: "20px",
              color: "black"
            }}
          >
            Go back
          </div>
          <div
            style={{
              display: "flex",
              position: "absolute",
              width: "80%",
              maxWidth: "600px",
              height: "min-content",
              zIndex: "9999",
              transform: "translateX(0%)",
              backgroundColor: "rgba(250,250,250,1)",
              transition: ".3s linear",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              margin: "60px 0px"
            }}
          >
            reCAPTCHA is a free service from Google that helps protect this
            web-app from spam and abuse by keeping automated software out
            <br />
            <br />
            It does this by collecting personal information about users to
            determine if they're humans and not spam bots
            <br />
            <br />
            "This ... [cookie & screenshot] information ... no longer reflects
            or references an individually-identifiable user," but informs
            marketing partners of your profile and trends for third-party users
            on Google's brand of products
            <br />
            <br />
            go ahead read their{" "}
            <a href="https://policies.google.com/privacy/google-partners">
              privacy policy
            </a>
          </div>
        </div>
        <div className="login">
          <img
            className="alternative"
            src="https://www.dl.dropboxusercontent.com/s/9ctrgn3angb8zz4/Screen%20Shot%202019-10-02%20at%2011.30.21%20AM.png?dl=1"
            alt="error"
          />
          <video
            ref="vidRef"
            id="background-video"
            loop
            autoPlay
            playsInline
            muted
          >
            <source
              src="https://www.dl.dropboxusercontent.com/s/eqdqu6op7pa2wmg/My%20Movie%2015.mp4?dl=1"
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>
          <div className="absolutethem">
            <div onClick={this.props.pleaseClose} className="plusrightexit">
              &times;
            </div>
            <form
              onSubmit={e =>
                !this.state.showrecaptcha &&
                !this.state.authError &&
                !this.state.newUserPlease
                  ? this.checkPhoneTaken(e)
                  : this.stopSubmit(e)
              }
              className="form1"
            >
              <div className="loginsentence">
                You must log in to view{" "}
                {
                  //from.pathname
                }
                <br />
                standard rates apply
              </div>
              {this.state.noUserPleaseSignUp !== true ? (
                <div className="loginwarning">
                  <br />
                  Firebase Database (Firestore) data is encrypted in transit, it
                  is stored on encrypted disks on the servers, and may be stored
                  in your browser's cache. So, use it on a private device. This
                  is a Beta Test App. I may delete your firestore account.
                  <br />
                  <br />
                  Sim card security depends on your Internet Service Provider's
                  identification process and some identity theft happens.
                </div>
              ) : null}
              <div>
                {this.state.authError ? this.state.authError.toString() : null}
                {this.state.noUserPleaseSignUp === null
                  ? null
                  : this.state.noUserPleaseSignUp
                  ? "no user exists, use recaptcha to get firebase.auth() text"
                  : "user exists, use recaptcha to get firebase.auth() text"}
              </div>
              <br />
              {this.state.noUserPleaseSignUp && !this.state.authError ? (
                <label
                  required
                  onChange={event => this.handleOptionChange(event)}
                >
                  No&nbsp;{" "}
                  <input
                    onClick={() => {
                      this.setState({ above13: false });
                    }}
                    type="checkbox"
                    value="below"
                    checked={this.state.above13 === false}
                    onChange={this.handleOptionChange}
                  />
                  &nbsp; are you 13 or older?
                  <br />
                  ■-■¬(≖_≖ )&nbsp;{" "}
                  <input
                    onClick={() => {
                      this.setState({ above13: true });
                    }}
                    type="checkbox"
                    value="above"
                    checked={this.state.above13 === true}
                    onChange={this.handleOptionChange}
                  />
                  &nbsp; Yes
                </label>
              ) : null}
              <div>
                <label htmlFor="phone" className="spaceforphone">
                  Phone{" "}
                </label>
                {/*<input
                required
                type="tel"
                id="phone"
                onChange={this.state.authError ? null : this.handleChange}
              />
                className={this.state.authError ? "input-fielddark" : "input-field"}*/}
                <PhoneInput
                  country="US"
                  required
                  placeholder="Enter phone number"
                  value={this.state.phone}
                  onChange={value => this.setState({ phone: value })}
                  type="tel"
                  //countrySelectComponent={CustomCountrySelect}
                />
                <div onClick={() => this.setState(initialState)}>&#8634;</div>
                {this.state.noUserPleaseSignUp && !this.state.authError ? (
                  <div>
                    {this.state.above13 === false ? (
                      <div>
                        <label htmlFor="email">Parent email </label>
                        <input
                          required
                          className="input-field"
                          type="email"
                          id="parentEmail"
                          value={this.state.parentEmail}
                          onChange={this.handleChange}
                          minlength="3"
                          maxlength="60"
                        />
                      </div>
                    ) : null}
                    <div>
                      {this.state.stopSubmit ? <div>Username taken</div> : null}
                      <label htmlFor="username">Username </label>
                      <input
                        required
                        className="input-field"
                        type="username"
                        id="username"
                        value={this.state.username}
                        onChange={this.handleChange}
                        minlength="3"
                        maxlength="30"
                      />
                    </div>
                    <div>
                      <label htmlFor="name">Name </label>
                      <input
                        required
                        className="input-field"
                        type="name"
                        id="name"
                        value={this.state.name}
                        onChange={this.handleChange}
                        minlength="3"
                        maxlength="30"
                      />
                    </div>
                    <div>
                      <label htmlFor="name">Surname </label>
                      <input
                        required
                        className="input-field"
                        type="surname"
                        id="surname"
                        value={this.state.surname}
                        onChange={this.handleChange}
                        minlength="3"
                        maxlength="30"
                      />
                    </div>
                  </div>
                ) : null}

                {this.state.loading ? (
                  <img
                    src="https://www.dl.dropboxusercontent.com/s/le41i6li4svaz0q/802%20%282%29.gif?dl=0"
                    alt="error"
                  />
                ) : !this.state.showrecaptcha &&
                  !this.state.authError &&
                  this.state.phone !== this.state.lastAttemptedPhone ? (
                  <div className="loginsignup">
                    <button type="submit" className="loginbtn">
                      {this.state.noUserPleaseSignUp ? "Sign Up" : "Log in"}
                    </button>
                    {/*<div
                      onClick={this.props.pleaseClose}
                      className="loginbtn"
                      style={{ color: "black" }}
                    >
                      back
                    </div>*/}
                  </div>
                ) : null}
              </div>
            </form>

            <div
              ref={this.recaptcha}
              className={
                this.state.showrecaptcha ? "showrecaptcha" : "hiderecaptcha"
              }
            />
            {this.state.recaptchaGood && this.state.authError === "" ? (
              <form
                className="showphonecodeform"
                onSubmit={e => {
                  e.preventDefault();
                  console.log("ya");
                  this.confirmCode(e);
                }}
              >
                <input
                  className="phonecodeinput"
                  placeholder="Verification Code"
                  id="textedCode"
                  onChange={this.handleChange}
                />
                <button className="showphonecodeformbtn" type="submit">
                  Confirm
                </button>
              </form>
            ) : null}

            <button className="previewbtn" onClick={this.props.pleaseClose}>
              Back
            </button>
          </div>
        </div>
        {backdrop}
      </div>
    );
  }
}

export default Login;
