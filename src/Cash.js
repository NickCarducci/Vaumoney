import React from "react";
import firebase from "./init-firebase";
import calicon from "./calicon.png";
import Operating from "./Operating";
import CashHeader from "./CashHeader";
import NewBank from "./NewBank";
import Login from "./Login";
import ListedTransactions from "./ListedTransactions";
class Cash extends React.Component {
  constructor(props) {
    super(props);
    this.state = { balance: 0, openListedTransations: false, userQuery: "" };
    this.stinker = React.createRef();
  }
  componentDidMount = () => {
    if (this.state.loading) {
      clearInterval(this.loading);
      this.loading = setInterval(() =>
        this.state.phase
          ? this.setState({
              phase: false
            })
          : this.setState({
              phase: true
            })
      );
    } else {
      clearInterval(this.loading);
    }
  };
  componentWillUnmount = () => {
    clearInterval(this.loading);
  };
  getDwollaToken = async () => {
    this.setState({ loading: true });
    const client_id = "OrFxbaqmtJzKhZVlWAM58yc4GZkXKYHFtLwpm5DG426IREJffi";
    const client_secret = "PutLuNs2sksYmOiSdwldnUcjCPlD2UgQX7PCzhALbBTrZOmgId";
    const scopes = "Send Funding Transactions ManageCustomers";
    //https://cors-anywhere.herokuapp.com/
    await fetch(
      `https://cors-anywhere.herokuapp.com/https://api-sandbox.dwolla.com/token`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded"
          //Authorization: `Basic Base64(${client_id}:${client_secret})`
        },
        body: `grant_type=client_credentials&client_id=${client_id}&client_secret=${client_secret}` //&scopes=${scopes}
      }
    )
      .then(async response => await response.json())
      .then(async body => {
        console.log("auth");
        console.log(body);
        this.props.setPouchToken(body.access_token);
        this.getBizCodes(body.access_token);
        this.setState({ loading: false });
      })
      .catch(err => {
        console.log("auth error");
        console.log(err.message);
        if (err.message !== "Failed to fetch") this.props.deletePouchToken();
        this.setState({ loading: false });
      });
  };
  getBizCodes = async token => {
    this.setState({ loading: true });
    console.log(token);
    await fetch(
      "https://cors-anywhere.herokuapp.com/https://api-sandbox.dwolla.com/business-classifications",
      {
        headers: {
          "content-type": "application/json",
          Accept: "application/vnd.dwolla.v1.hal+json",
          Authorization: `Bearer ${token}`
        }
      }
    )
      .then(async res => await res.json())
      .then(result => {
        console.log("biz codes");
        console.log(result);
        this.setState({ businessCodes: result });
        this.setState({ loading: false });
        if (
          ["ExpiredAccessToken", "InvalidAccessToken"].includes(result.code) //"InvalidCredentials"
        ) {
          this.props.deletePouchToken();
          this.getDwollaToken();
        }
      })
      .catch(err => {
        console.log("biz codes error");
        console.log(err.message);
        if (err.code === "ExpiredAccessToken") {
          this.props.deletePouchToken();
          this.getDwollaToken();
        }
        this.setState({ loading: false });
      });
  };
  addBank = async () => {
    this.setState({ openNewBank: true, openBanks: false });
    if (
      this.props.user !== undefined &&
      this.props.user.username &&
      this.props.user.name &&
      this.props.user.surname
    ) {
      if (!this.props.access_token) {
        console.log("no token -- fetching...");
        this.getDwollaToken();
      } else {
        !this.state.businessCodes && console.log("reusing token.");
        !this.state.businessCodes && this.getBizCodes(this.props.access_token);
      }
    } else {
      window.alert("please sign up to transfer");
    }
  };
  render() {
    return (
      <div
        onScroll={e => {
          if (
            this.stinker.current.scrollTop <= 224 &&
            this.state.showtimeheader
          ) {
            this.setState({ showtimeheader: false });
          } else if (
            this.stinker.current.scrollTop > 224 &&
            !this.state.showtimeheader
          ) {
            this.setState({ showtimeheader: true });
          }
        }}
        style={
          this.props.vaumoneyOpen
            ? {
                display: "flex",
                position: "fixed",
                backgroundColor: "white",
                height: "100%",
                width: "100%",
                top: "0",
                left: "0",
                color: "rgb(25,35,25)",
                zIndex: "1",
                transition: ".3s ease-in",
                flexDirection: "column"
              }
            : {
                display: "flex",
                position: "fixed",
                backgroundColor: "white",
                height: "100%",
                width: "0%",
                top: "0",
                left: "0",
                color: "white",
                opacity: "0",
                zIndex: "-1",
                transition: ".3s ease-out",
                flexDirection: "column"
              }
        }
      >
        <div
          onClick={
            this.state.revenueShow || this.state.expenseShow
              ? () => this.setState({ revenueShow: false, expenseShow: false })
              : this.props.closeVaumoney
          }
          style={{
            margin: "10px",
            display: "flex",
            position: "fixed",
            width: "36px",
            top: "0",
            left: "0",
            borderRadius: "50px",
            height: "36px",
            border: "1px rgb(25,35,25) solid",
            backgroundColor: "white",
            alignItems: "center",
            justifyContent: "center",
            color: "rgb(25,35,25)",
            zIndex: "3"
          }}
        >
          {"<"}
        </div>
        <form
          onSubmit={async e => {
            e.preventDefault();
            await fetch(
              "https://us-central1-vaumoney.cloudfunctions.net/searchCustomersVaumoney",
              {
                method: "POST",
                headers: {
                  "content-type": "application/json",
                  Allow: "*",
                  Accept: "application/json"
                },
                body: JSON.stringify({
                  userQuery: this.state.userQuery
                })
              }
            )
              .then(async res => await res.json())
              .then(async result => {
                this.setState({ predictions: result });
              })
              .catch(err => console.log(err.message));
          }}
          style={{
            display: "flex",
            position: "fixed",
            backgroundColor: "rgb(200,200,200)",
            borderBottom: "1px white solid",
            height: "56px",
            width: "100%",
            top: "0px",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            zIndex: "1",
            transform: "translateY(0%)"
          }}
        >
          <input
            placeholder={`username ${
              this.props.prepared ? "or routing number" : "search"
            }`}
            style={{
              height: "33px",
              width: "calc(100% - 112px)",
              fontSize: "15px"
            }}
            value={this.state.userQuery}
            onChange={e => {
              var query = e.target.value;
              /*if (/[\d]+/.test(query)) {
                this.setState({ askIfRouting: true });
              }*/
              this.setState({ userQuery: query });
            }}
          />
          <img
            onClick={async () => {
              var answer = window.confirm("Are you sure you want to log out?");
              if (answer) {
                await firebase
                  .auth()
                  .setPersistence(firebase.auth.Auth.Persistence.SESSION);
                firebase
                  .auth()
                  .signOut()
                  .then(() => {
                    console.log("logged out");
                    window.location.reload();
                  })
                  .catch(err => {
                    console.log(err);
                  });
              }
            }}
            src={calicon}
            style={{
              display: "flex",
              position: "absolute",
              right: "0px",
              margin: "10px",
              width: "36px",
              top: "0px",
              height: "36px",
              backgroundColor: "rgb(25,35,25)",
              alignItems: "center",
              justifyContent: "center",
              zIndex: "1",
              color: "white"
            }}
            alt="error"
          />
        </form>
        <div
          style={{
            display: "flex",
            position: "fixed",
            backgroundColor: "white",
            bottom: "112px",
            width: "100%",
            top: "56px",
            left: "0",
            color: "rgb(25,35,25)",
            zIndex: "1",
            transition: ".3s ease-in",
            flexDirection: "column",
            overflowY: "auto",
            overflowX: "hidden"
          }}
        >
          {this.state.askIfRouting && (
            <div>
              <input
                placeholder="account number"
                onChange={e => this.setState({ accountNumber: e.target.value })}
              />
            </div>
          )}
          {this.props.users.map(x => {
            if (x.username.includes(this.state.userQuery)) {
              return <div>{x.username}</div>;
            } else return null;
          })}
        </div>
        <div
          ref={this.stinker}
          style={
            !this.props.vaumoneyOpen || this.state.userQuery
              ? {
                  display: "flex",
                  position: "fixed",
                  backgroundColor: "white",
                  bottom: "56px",
                  width: "0%",
                  top: "56px",
                  left: "0",
                  color: "white",
                  opacity: "0",
                  zIndex: "-1",
                  transition: ".3s ease-out",
                  flexDirection: "column",
                  overflowY: "auto",
                  overflowX: "hidden"
                }
              : (this.stinker.current && this.stinker.current.scrollTop) >
                  224 ||
                this.state.expenseShow ||
                this.state.revenueShow
              ? {
                  display: "flex",
                  position: "fixed",
                  backgroundColor: "white",
                  bottom: "56px",
                  width: "100%",
                  top: "0",
                  left: "0",
                  color: "rgb(25,35,25)",
                  zIndex: "1",
                  transition: ".3s ease-in",
                  flexDirection: "column",
                  overflowY: "auto",
                  overflowX: "hidden"
                }
              : {
                  display: "flex",
                  position: "fixed",
                  backgroundColor: "white",
                  bottom: "56px",
                  width: "100%",
                  top: "56px",
                  left: "0",
                  color: "rgb(25,35,25)",
                  zIndex: "1",
                  transition: ".3s ease-in",
                  flexDirection: "column",
                  overflowY: "auto",
                  overflowX: "hidden"
                }
          }
        >
          <div
            style={
              this.state.showtimeheader ||
              (this.state.expenseShow || this.state.revenueShow)
                ? {
                    display: "flex",
                    position: "fixed",
                    backgroundColor: "rgb(25,35,25)",
                    borderBottom: "1px white solid",
                    top: "0px",
                    height: "56px",
                    width: "100%",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    zIndex: "2"
                  }
                : {
                    display: "flex",
                    position: "fixed",
                    backgroundColor: "rgb(25,35,25)",
                    borderBottom: "1px white solid",
                    top: "-56px",
                    height: "56px",
                    width: "100%",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    zIndex: "2"
                  }
            }
          >
            <h2>
              this year
              {(this.state.revenueShow || this.state.expenseShow) &&
                `'s ${this.state.expenseShow ? "expenses" : ""}${
                  this.state.revenueShow ? "revenue" : ""
                }`}
            </h2>
            <div
              style={{
                display: "flex",
                position: "absolute",
                right: "20px",
                width: "36px",
                height: "36px",
                backgroundColor: "rgb(25,35,25)",
                alignItems: "center",
                justifyContent: "center",
                color: "white"
              }}
            >
              \/
            </div>
          </div>
          <div
            style={{
              display: "flex",
              position: "absolute",
              backgroundColor: "white",
              height: "min-content",
              width: "100%",
              top: "0",
              left: "0",
              color: "rgb(25,35,25)",
              zIndex: "1",
              transition: ".3s ease-in",
              flexDirection: "column"
            }}
          >
            <CashHeader
              openBanks={this.state.openBanks}
              transactions={this.props.transactions}
              openListedTransations={() => {
                this.setState({ openListedTransations: true });
              }}
              openboth={() => {
                this.setState({ openBanks: true, openNewBank: true });
              }}
              load={this.addBank}
              revenueShow={this.state.revenueShow}
              expenseShow={this.state.expenseShow}
              balance={this.state.balance}
            />

            <Operating
              scrolled={this.stinker.current && this.stinker.current.scrollTop}
              showtimeheader={this.state.showtimeheader}
              revenueShow={this.state.revenueShow}
              expenseShow={this.state.expenseShow}
              openRev={() =>
                this.setState({ revenueShow: true, expenseShow: false })
              }
              openExp={() =>
                this.setState({ expenseShow: true, revenueShow: false })
              }
            />
          </div>
        </div>
        <div
          style={
            this.state.revenueShow || this.state.expenseShow
              ? { display: "none" }
              : {
                  flexDirection: "column",
                  display: "flex",
                  position: "fixed",
                  backgroundColor: "rgb(25,35,25)",
                  width: "100%",
                  height: "56px",
                  bottom: "0",
                  left: "0",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  zIndex: "20"
                }
          }
        >
          <div
            onMouseEnter={() => this.setState({ footerhighlight: "cards" })}
            onMouseLeave={() => this.setState({ footerhighlight: false })}
            style={
              this.state.footerhighlight === "cards"
                ? {
                    display: "flex",
                    position: "relative",
                    backgroundColor: "rgb(0,155,200)",
                    borderBottom: "1px white solid",
                    height: "56px",
                    width: "100%",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "rgb(100,225,255)"
                  }
                : {
                    display: "flex",
                    position: "relative",
                    backgroundColor: "rgb(0,15,20)",
                    borderBottom: "1px white solid",
                    height: "56px",
                    width: "100%",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "rgb(100,225,255)"
                  }
            }
          >
            <h3>Get / Renew Card</h3>
          </div>
        </div>
        <div
          onClick={() =>
            this.setState({ openNewBank: false, openListedTransations: false })
          }
          style={
            this.state.openNewBank || this.state.openListedTransations
              ? {
                  backgroundColor: "rgba(20,20,20,.6)",
                  width: "calc(100% - 200px)",
                  height: "100%",
                  display: "flex",
                  position: "fixed",
                  right: "0px",
                  zIndex: "1"
                }
              : {
                  backgroundColor: "rgba(20,20,20,.6)",
                  width: "calc(100% - 200px)",
                  height: "100%",
                  display: "flex",
                  position: "fixed",
                  right: "0px",
                  zIndex: "0"
                }
          }
        >
          {this.state.loading && (
            <div
              style={
                this.state.phase
                  ? {
                      display: "flex",
                      top: "40%",
                      width: "24px",
                      height: "24px",
                      margin: "8px",
                      borderRadius: "50%",
                      background: "rgb(200,200,190)",
                      animation:
                        "lds-circle 2.4s cubic-bezier(0, 0.2, 0.8, 1) infinite",
                      marginBottom: "75px",
                      transition: "top 2.4s ease-in-out"
                    }
                  : {
                      display: "flex",
                      top: "60%",
                      width: "24px",
                      height: "24px",
                      margin: "8px",
                      borderRadius: "50%",
                      background: "rgb(200,200,190)",
                      animation:
                        "lds-circle 2.4s cubic-bezier(0, 0.2, 0.8, 1) infinite",
                      marginBottom: "75px",
                      transition: "top 2.4s ease-in-out"
                    }
              }
            />
          )}
        </div>
        {this.props.user !== undefined && (
          <NewBank
            closebanks={() => this.setState({ openBanks: false })}
            openBanks={this.state.openBanks}
            toggleBanks={
              this.state.openBanks
                ? () =>
                    this.setState({
                      openBanks: false
                    })
                : () =>
                    this.setState({
                      openBanks: true
                    })
            }
            getDwollaToken={this.getDwollaToken}
            dwollaLoadedUser={this.props.dwollaLoadedUser}
            users={this.props.users}
            user={this.props.user}
            auth={this.props.auth}
            businessCodes={this.state.businessCodes}
            access_token={this.state.access_token}
            close={() => this.setState({ openNewBank: false })}
            openNewBank={this.state.openNewBank}
          />
        )}
        {this.props.user !== undefined && (
          <ListedTransactions
            openListedTransations={this.state.openListedTransations}
            auth={this.props.auth}
            transactions={this.props.transactions}
            access_token={this.props.access_token}
          />
        )}
        {this.props.user === undefined && (
          <div
            style={
              this.state.openNewBank
                ? {
                    flexDirection: "column",
                    display: "flex",
                    position: "fixed",
                    width: "50%",
                    maxWidth: "100vw",
                    minWidth: "200px",
                    height: "100%",
                    transform: "translateX(0%)",
                    transition: ".3s ease-out",
                    backgroundColor: "white",
                    opacity: "1",
                    zIndex: "9999"
                  }
                : {
                    flexDirection: "column",
                    display: "flex",
                    position: "fixed",
                    width: "50%",
                    height: "100%",
                    transform: "translateX(100%)",
                    transition: ".3s ease-out",
                    backgroundColor: "white",
                    opacity: "0"
                  }
            }
          >
            <Login
              pleaseClose={() => this.setState({ openNewBank: false })}
              users={this.props.users}
              user={this.props.user}
              auth={this.props.auth}
            />
          </div>
        )}
      </div>
    );
  }
}
export default Cash;
