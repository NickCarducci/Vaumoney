import React from "react";
import "./styles.css";
import Cash from "./Cash";
import TDB from "./tokenDB";
import firebase from "./init-firebase";

export default class App extends React.Component {
  constructor(props) {
    super(props);
    let tdb = new TDB();
    this.state = {
      tdb,
      users: [],
      user: undefined,
      auth: undefined,
      transactions: []
    };
    this.doo = React.createRef();
  }
  async setPouchToken(key, method) {
    let res = await this.state.tdb[method](key);

    this.setState({
      key
    });
    //this.props.history.replace('/plan')
    //this.props.history.replace(`/plans/${res.id}`)
    return res;
  }
  componentDidMount = async () => {
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.async = true;
    script.src = "https://cdn.dwolla.com/1/dwolla.js";
    script.onload = () => {
      console.log("dwolla client loaded for auth");
    };
    document.body.appendChild(script);
    const result = await this.state.tdb.readKey();
    result &&
      Object.keys(result).length !== 0 &&
      result.constructor === Object &&
      console.log(`dwolla token ${Object.keys(result)} found`);
    result &&
      Object.keys(result).length !== 0 &&
      result.constructor === Object &&
      this.setState({ access_token: Object.keys(result) });

    firebase
      .firestore()
      .collection("users")
      .onSnapshot(querySnapshot => {
        let users = [];
        querySnapshot.docs.forEach(doc => {
          if (doc.exists) {
            let data = doc.data();
            users.push(data);
            if (querySnapshot.docs.length === users.length) {
              this.getUserInfo();
              this.setState({ users });
            }
          }
          return console.log(`${users.length} users signed up`);
        });
      });
  };
  getUserInfo = () => {
    this.setState({ stop: true });
    firebase.auth().onAuthStateChanged(async meAuth => {
      if (meAuth) {
        meAuth.getIdToken(/* forceRefresh */ true).then(async idToken => {
          firebase
            .firestore()
            .collection("users")
            .doc(meAuth.uid)
            .onSnapshot(querySnapshot => {
              if (querySnapshot.exists) {
                let b = querySnapshot.data();
                b.id = querySnapshot.id;
                firebase
                  .firestore()
                  .collection("userDatas")
                  .doc(meAuth.uid)
                  .onSnapshot(
                    async querySnapshot => {
                      if (querySnapshot.exists) {
                        var foo = querySnapshot.data();
                        foo.id = querySnapshot.id;
                        var good = { ...foo, ...b };
                        this.setState({
                          user: good,
                          auth: meAuth,
                          loaded: true,
                          loggedOut: false
                        });
                        if (
                          good.username &&
                          good.name &&
                          good.surname &&
                          good.email &&
                          good.address1 &&
                          good.city &&
                          good.state &&
                          good.ZIP &&
                          good.DOB &&
                          good.SSN &&
                          meAuth.uid
                        ) {
                          if (!good.dwollaID) {
                            console.log(
                              "user not a bankee, no dwolla customer ID"
                            );
                          } else {
                            await fetch(
                              "https://us-central1-vaumoney.cloudfunctions.net/listTransactionsVaumoney",
                              {
                                method: "POST",
                                headers: {
                                  Accept: "application/json",
                                  "content-type": "application/json"
                                },
                                body: JSON.stringify({
                                  dwollaID: good.dwollaID
                                })
                              }
                            )
                              .then(async res => await res.json())
                              .then(result => {
                                console.log(result);
                                this.setState({
                                  transactions: result
                                });
                              })
                              .catch(err => console.log(err.message));
                          }
                        }
                      } else {
                        this.setState({
                          user: b,
                          auth: meAuth,
                          loaded: true,
                          loggedOut: false
                        });
                        console.log("not a bankee");
                      }
                    },
                    e => console.log(e.message)
                  );
              }
            });
        });
      }
    });
  };
  render() {
    return (
      <div
        ref={this.doo}
        style={{
          display: "flex",
          position: "fixed",
          fontFamily: "sans-serif",
          textAlign: "center",
          height: "100vh",
          width: "100%",
          flexDirection: "column"
        }}
      >
        <div
          style={{
            padding: "0px 15px",
            display: "flex",
            position: "relative",
            backgroundColor: "rgb(140,180,150)",
            borderBottom: "1px white solid",
            height: "56px",
            alignItems: "center",
            justifyContent: "space-between",
            color: "white"
          }}
        >
          <h1 onClick={() => this.setState({ vaumoneyOpen: true })}>
            Vaumoney
          </h1>
          <div
            style={{
              display: "flex",
              position: "relative",
              width: "36px",
              borderRadius: "50px",
              height: "36px",
              border: "1px white solid",
              backgroundColor: "rgb(25,35,25)",
              alignItems: "center",
              justifyContent: "center",
              color: "white"
            }}
          >
            &#9678;
          </div>
        </div>
        <div
          style={{
            display: "flex",
            position: "relative",
            backgroundColor: "rgb(25,35,25)",
            height: "56px",
            top: "0",
            left: "0",
            alignItems: "center",
            justifyContent: "center",
            color: "white"
          }}
        >
          <h2>Sales tax</h2>
        </div>
        <div
          style={{
            display: "flex",
            position: "relative",
            backgroundColor: "rgb(100,40,140)",
            height: "calc(100% - 112px)",
            top: "0",
            left: "0",
            alignItems: "center",
            justifyContent: "center",
            color: "white"
          }}
        >
          <h2>Map</h2>
        </div>
        <Cash
          prepared={
            this.state.user &&
            this.state.user.username &&
            this.state.user.name &&
            this.state.user.surname &&
            this.state.user.email &&
            this.state.user.address1 &&
            this.state.user.city &&
            this.state.user.state &&
            this.state.user.ZIP &&
            this.state.user.DOB &&
            this.state.user.SSN &&
            this.state.auth.uid
          }
          transactions={this.state.transactions}
          users={this.state.users}
          user={this.state.user}
          auth={this.state.auth}
          access_token={this.state.access_token}
          deletePouchToken={() => this.state.tdb.deleteKeys()}
          setPouchToken={async access_token => {
            this.setState({ access_token });
            this.setPouchToken(access_token, "setKey");
          }}
          vaumoneyOpen={this.state.vaumoneyOpen}
          closeVaumoney={() => this.setState({ vaumoneyOpen: false })}
        />
      </div>
    );
  }
}
