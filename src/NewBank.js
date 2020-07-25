import React from "react";
import Login from "./Login";
import firebase from "./init-firebase";
import FundingSource from "./FundingSource";

class NewBank extends React.Component {
  state = {
    fundingSources: [],
    predictions: [],
    ein: "",
    newSurname: this.props.user !== undefined ? this.props.user.surname : "",
    newName: this.props.user !== undefined ? this.props.user.name : "",
    newUsername: this.props.user !== undefined ? this.props.user.username : "",
    newEmail:
      this.props.user !== undefined && this.props.user.email
        ? this.props.user.email
        : "",
    newBirthday:
      this.props.user !== undefined && this.props.user.DOB
        ? this.props.user.DOB
        : "",
    last4:
      this.props.user !== undefined && this.props.user.SSN
        ? this.props.user.SSN
        : "",
    address1:
      this.props.user !== undefined && this.props.user.address1
        ? this.props.user.address1
        : "",
    address2:
      this.props.user !== undefined && this.props.user.address2
        ? this.props.user.address2
        : "",
    city:
      this.props.user !== undefined && this.props.user.city
        ? this.props.user.city
        : "",
    state:
      this.props.user !== undefined && this.props.user.state
        ? this.props.user.state
        : "",
    ZIP:
      this.props.user !== undefined && this.props.user.ZIP
        ? this.props.user.ZIP
        : ""
  };
  componentDidMount = async () => {
    this.props.user.dwollaID &&
      (await fetch(
        "https://us-central1-vaumoney.cloudfunctions.net/listFundingVaumoney",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "content-type": "application/json"
          },
          body: JSON.stringify({
            dwollaID: this.props.user.dwollaID
          })
        }
      )
        .then(async res => await res.json())
        .then(result => {
          console.log(result);
          this.setState({
            fundingSources: [result]
          });
        })
        .catch(err => {
          console.log(err.message);
        }));
  };
  deployNewFundingSource = async x => {
    console.log(x);
    if (!this.state.preferMicro) {
      await fetch(
        "https://us-central1-vaumoney.cloudfunctions.net/initiateIAVVaumoney",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "content-type": "application/json"
          },
          body: JSON.stringify({
            dwollaID: x
          })
        }
      )
        .then(async res => await res.json())
        .then(result => {
          console.log("!");
          console.log(result);
          /*{
            "_links":
            {
              "self":
              {
                "href": "https://api-sandbox.dwolla.com/customers/7d5d65b8-0b66-48c9-b018-cc691c4bd010/iav-token",
                  "type": "application/vnd.dwolla.v1.hal+json",
                    "resource-type": "iav-token"
              }
            },
            "token": "RLXvNpcR7QEX1frib9ZhbDMfaTAV7NPZPNl2ufnMPhvsLQYnWb"
          }*/
          if (result) {
            const script = document.createElement("script");
            script.type = "text/javascript";
            script.async = true;
            script.src = "https://cdn.dwolla.com/1/dwolla.js";
            script.onload = () => {
              window.dwolla.configure("sandbox");
              console.log("ok");
              const dwolla = window.dwolla;
              // create a token
              //client.configure("sandbox");
              dwolla.iav.start(
                result,
                {
                  backButton: true,
                  container: "iavContainer",
                  stylesheets: [
                    "https://fonts.googleapis.com/css?family=Lato&subset=latin,latin-ext"
                  ],
                  //microDeposits: "true",
                  fallbackToMicroDeposits: true
                },
                (err, res) => {
                  console.log(err);
                  if (res._links) {
                    window.alert(
                      `congrats! new funding source initiated with id: ${
                        res._links.self.href
                      }`
                    );
                    this.setState({
                      newBankplease: false
                    });
                  }
                }
              );
            };
            document.body.appendChild(script);
          } else
            return window.alert(
              "no instant verification token returned in successful response"
            );
        })
        .catch(err => {
          console.log("!");
          console.log(err.message);
        });
    } else {
      console.log("!");
      await fetch(
        "https://us-central1-vaumoney.cloudfunctions.net/verifiedFundingVaumoney",
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            //Allow: "*",
            Accept: "application/json"
          },
          body: JSON.stringify({
            dwollaID: x,
            routingNumber: this.state.routingNumber,
            accountNumber: this.state.accountNumber,
            name: this.state.uniqueName
          })
        }
      )
        .then(async res => await res.json())
        .then(async result => {
          console.log(result);
          /*var fundingSource = result.split(
          "https://api-sandbox.dwolla.com/funding-sources/"
        )[1];*/
          var fundingSource = result.id;
          await fetch(
            "https://us-central1-vaumoney.cloudfunctions.net/initiateMicroVaumoney",
            {
              method: "POST",
              headers: {
                "content-type": "application/json",
                Allow: "*",
                Accept: "application/json"
              },
              body: JSON.stringify({
                fundingSource
              })
            }
          )
            .then(async res => await res.json())
            .then(result => {
              console.log(result);
              if (result.code === 201)
                window.alert(
                  "congrats! now verify your account with two microdeposits " +
                    "to send money from this accounting and routing number!" +
                    " It usually takes 1-2 days to settle in your account."
                );
            })
            .catch(err => {
              console.log(err.message);
            });
        })
        .catch(err => {
          console.log(err.message);
        });
    }
  };
  render() {
    function intToString(value) {
      var suffixes = ["", "k", "m", "b", "t"];
      var suffixNum = Math.floor(("" + value).length / 3);
      var shortValue = parseFloat(
        (suffixNum !== 0
          ? value / Math.pow(1000, suffixNum)
          : value
        ).toPrecision(2)
      );
      if (shortValue % 1 !== 0) {
        shortValue = shortValue.toFixed(1);
      }
      return shortValue + suffixes[suffixNum];
    }
    return (
      <div
        style={
          this.props.openNewBank
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
                zIndex: "9999",
                overflowX: "hidden",
                overflowY: "auto"
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
        {!this.state.newBankplease && this.state.fundingSources.length > 0 && (
          <div
            onMouseEnter={() => this.setState({ banksbtn: true })}
            onMouseLeave={() => this.setState({ banksbtn: false })}
            style={
              this.state.banksbtn || this.props.openBanks
                ? {
                    display: "flex",
                    position: "relative",
                    justifyContent: "center",
                    zIndex: "9999",
                    marginTop: "20px",
                    borderRadius: "6px",
                    border: "1px solid",
                    width: "60px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    backgroundColor: "teal",
                    color: "white"
                  }
                : {
                    display: "flex",
                    position: "relative",
                    justifyContent: "center",
                    zIndex: "9999",
                    marginTop: "20px",
                    borderRadius: "6px",
                    border: "1px solid",
                    width: "60px",
                    left: "50%",
                    transform: "translateX(-50%)"
                  }
            }
            onClick={this.props.toggleBanks}
          >
            Banks
          </div>
        )}
        <br />
        <br />
        {this.props.openBanks &&
          this.state.fundingSources.map(x => {
            return x._embedded["funding-sources"].map(x => {
              return <FundingSource x={x} />;
            });
          })}
        {(this.props.openBanks || this.state.newBankplease) && (
          <div
            style={{
              bottom: "10px",
              zIndex: "9999",
              display: "flex",
              position: "fixed",
              fontSize: "10px",
              backgroundColor: "white",
              color: "rgb(140,160,140)"
            }}
          >
            We claim no responsibility for mistakes made by dwolla or your bank,
            only our own.&nbsp;
            {this.state.mistakes
              ? `${intToString(this.state.mistakes.length)}/`
              : `${0}/`}
            {this.state.appTransactions
              ? `${intToString(this.state.appTransactions.length)} transactions`
              : `0 transactions`}
          </div>
        )}
        <div
          style={{
            flexDirection: "column",
            display: "flex",
            position: "absolute",
            width: "100%",
            height: "min-content"
          }}
        >
          {this.props.openBanks ? (
            <div
              style={{
                color: "white",
                backgroundColor: "teal",
                fontSize: "20px",
                width: "56px",
                height: "56px",
                justifyContent: "center",
                alignItems: "center",
                display: "flex",
                border: "1px solid"
              }}
              onClick={this.props.closebanks}
            >
              {"<"}
            </div>
          ) : this.state.newBankplease ? (
            <div
              style={{
                fontSize: "20px",
                width: "56px",
                height: "56px",
                justifyContent: "center",
                alignItems: "center",
                display: "flex",
                border: "1px solid"
              }}
              onClick={() => this.setState({ newBankplease: false })}
            >
              {"<"}
            </div>
          ) : (
            <div
              style={{
                fontSize: "20px",
                width: "56px",
                height: "56px",
                justifyContent: "center",
                alignItems: "center",
                display: "flex",
                border: "1px solid"
              }}
              onClick={this.props.close}
            >
              &times;
            </div>
          )}
          {!this.state.newBankplease && !this.props.openBanks && (
            <div>
              <form
                onMouseEnter={() => this.setState({ hovering: "username" })}
                onMouseLeave={() => this.setState({ hovering: "" })}
                onSubmit={e => {
                  e.preventDefault();
                  if (
                    !this.state.usernameTaken &&
                    (this.props.user.username !== this.state.newUsername ||
                      this.props.user.name !== this.state.newName ||
                      this.props.user.surname !== this.state.newSurname)
                  ) {
                    firebase
                      .firestore()
                      .collection("users")
                      .doc(this.props.auth.uid)
                      .update({
                        surname: this.state.newSurname,
                        name: this.state.newName,
                        username: this.state.newUsername
                      });
                  } else
                    return console.log(
                      this.state.usernameTaken,
                      this.props.user.username,
                      this.state.newUsername,
                      this.props.user.name,
                      this.state.newName,
                      this.props.user.surname,
                      this.state.newSurname
                    );
                }}
                style={
                  this.state.hovering === "username"
                    ? { backgroundColor: "rgba(20,20,20,.3)" }
                    : {}
                }
              >
                <div>
                  <label>
                    {this.state.usernameTaken && "please use another"}Username
                  </label>
                  <input
                    autoComplete="off"
                    minLength="2"
                    type="text"
                    id="username"
                    placeholder="Name"
                    value={this.state.newUsername}
                    onChange={e => {
                      var query = e.target.value;
                      if (query) {
                        var therealready = this.props.users.find(
                          x =>
                            x.username === query &&
                            this.props.user.username !== x.username
                        );
                        if (therealready) {
                          this.setState({ usernameTaken: true });
                        } else if (this.state.usernameTaken) {
                          this.setState({ usernameTaken: false });
                        }
                      }

                      this.setState({ newUsername: query });
                    }}
                  />
                </div>
                <div>
                  <label>firstName</label>
                  <input
                    autoComplete="off"
                    minLength="2"
                    type="text"
                    id="firstName"
                    placeholder="Name"
                    value={this.state.newName}
                    onChange={e => this.setState({ newName: e.target.value })}
                  />
                </div>
                <div>
                  <label>lastName</label>
                  <input
                    autoComplete="off"
                    minLength="2"
                    type="text"
                    id="lastName"
                    placeholder="Surname"
                    value={this.state.newSurname}
                    onChange={e =>
                      this.setState({ newSurname: e.target.value })
                    }
                  />
                </div>
                {!this.state.usernameTaken &&
                  ((this.props.user !== undefined &&
                    (this.props.user.username !== this.state.newUsername ||
                      "" === this.state.newUsername)) ||
                    (this.props.user !== undefined &&
                      (this.props.user.name !== this.state.newName ||
                        "" === this.state.newName)) ||
                    (this.props.user !== undefined &&
                      (this.props.user.surname !== this.state.newSurname ||
                        "" === this.state.newSurname))) && (
                    <button type="submit">Save</button>
                  )}
              </form>
              {this.props.user === undefined && (
                <Login
                  pleaseClose={this.props.pleaseClose}
                  users={this.props.users}
                  user={this.props.user}
                  auth={this.props.auth}
                />
              )}
              <br />
              {this.props.user !== undefined &&
                this.props.user.username &&
                this.props.user.name &&
                this.props.user.surname &&
                this.props.user.username === this.state.newUsername &&
                this.props.user.name === this.state.newName &&
                this.props.user.surname === this.state.newSurname && (
                  <div>
                    {this.state.changePrivate ||
                    this.props.user.email === "" ||
                    this.props.user.SSN === "" ||
                    this.props.user.DOB === "" ? (
                      <form
                        onMouseEnter={() =>
                          this.setState({ hovering: "private" })
                        }
                        onMouseLeave={() => this.setState({ hovering: "" })}
                        onSubmit={e => {
                          e.preventDefault();
                          var start = { ...this.state };
                          if (
                            start.newEmail &&
                            start.newBirthday &&
                            start.last4
                          ) {
                            const goset = firebase
                              .firestore()
                              .collection("userDatas")
                              .doc(this.props.auth.uid)
                              .set({
                                email: start.newEmail,
                                DOB: start.newBirthday,
                                SSN: start.last4
                              });
                            const goupdate = firebase
                              .firestore()
                              .collection("userDatas")
                              .doc(this.props.auth.uid)
                              .set({
                                email: start.newEmail,
                                DOB: start.newBirthday,
                                SSN: start.last4
                              });
                            if (
                              this.props.user.email ||
                              this.props.user.SSN ||
                              this.props.user.DOB ||
                              this.props.user.ZIP ||
                              this.props.user.address1 ||
                              this.props.user.address2 ||
                              this.props.user.city ||
                              this.props.user.state
                            ) {
                              if (!this.props.user.confirmedEmail) {
                                firebase
                                  .auth()
                                  .sendSignInLinkToEmail(start.newEmail, {
                                    url: window.location.href,
                                    handleCodeInApp: true
                                  })
                                  .then(() => {
                                    goupdate();
                                  })
                                  .catch(err => {
                                    console.log(err.message);
                                  });
                              } else {
                                goupdate();
                              }
                            } else {
                              firebase
                                .auth()
                                .sendSignInLinkToEmail(start.newEmail, {
                                  url: window.location.href,
                                  handleCodeInApp: true
                                })
                                .then(() => {
                                  goset();
                                })
                                .catch(err => {
                                  console.log(err.message);
                                });
                            }
                            this.state.changePrivate &&
                              this.setState({ changePrivate: false });
                          } else
                            return window.alert(
                              "please enter email, date of birth & the last 4 digits of social security number to bank with us"
                            );
                        }}
                        style={
                          this.state.hovering === "private"
                            ? {
                                backgroundColor: "rgba(20,20,20,.3)",
                                paddingBottom: "10px"
                              }
                            : { paddingBottom: "10px" }
                        }
                      >
                        Private / To add bank
                        <br />
                        <div>
                          <label>email</label>
                          <input
                            autoComplete="off"
                            type="email"
                            id="email"
                            placeholder="Email"
                            value={this.state.newEmail}
                            onChange={e =>
                              this.setState({ newEmail: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <label>dateOfBirth</label>
                          <input
                            type="date"
                            id="dateOfBirth"
                            placeholder="Birthday"
                            value={this.state.newBirthday}
                            onChange={e =>
                              this.setState({ newBirthday: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <label>last 4 of ssn</label>
                          <input
                            autoComplete="off"
                            type="number"
                            id="ssn"
                            placeholder="Social security number"
                            value={this.state.last4}
                            onChange={e =>
                              this.setState({ last4: e.target.value })
                            }
                          />
                        </div>
                        <button
                          type="submit"
                          style={{
                            left: "50%",
                            top: "5px",
                            position: "relative",
                            transform: "translateX(-50%)",
                            display: "flex",
                            width: "min-content"
                          }}
                        >
                          Save
                        </button>
                      </form>
                    ) : (
                      <div
                        onClick={() => {
                          var answer = window.confirm(
                            "edit your private email, ssn or dob?"
                          );

                          if (answer) {
                            this.setState({ changePrivate: true });
                          }
                        }}
                      >
                        Locked
                        <br />
                        <div style={{ fontSize: "12px" }}>
                          ["email", "ssn", "dob"]
                        </div>
                      </div>
                    )}
                    <br />
                    <div
                      onMouseEnter={() =>
                        this.setState({ hovering: "address" })
                      }
                      onMouseLeave={() => this.setState({ hovering: "" })}
                      style={
                        this.state.hovering === "address"
                          ? { backgroundColor: "rgba(20,20,20,.3)" }
                          : {}
                      }
                    >
                      {(this.state.editAddress || !this.props.user.address1) &&
                      this.props.user.username &&
                      this.props.user.name &&
                      this.props.user.surname &&
                      this.props.user.email &&
                      this.props.user.SSN &&
                      this.props.user.DOB ? (
                        <form
                          onSubmit={async e => {
                            e.preventDefault();
                            await fetch(
                              //`https://atlas.microsoft.com/search/place_name/json?subscription-key={sxQptNsgPsKENxW6a4jyWDWpg6hOQGyP1hSOLig4MpQ}&api-version=1.0&query=${enteredValue}&typeahead={typeahead}&limit={5}&language=en-US`
                              `https://api.mapbox.com/geocoding/v5/mapbox.places/${
                                this.state.addressQuery
                              }.json?limit=2&access_token=pk.eyJ1Ijoibmlja2NhcmR1Y2NpIiwiYSI6ImNrMWhyZ3ZqajBhcm8zY3BoMnVnbW02dXQifQ.aw4gJV_fsZ1GKDjaWPxemQ`
                            )
                              .then(async response => await response.json())
                              .then(
                                body => {
                                  console.log(body.features);
                                  this.setState({ predictions: body.features });
                                },
                                err => console.log(err)
                              )
                              .catch(err => {
                                console.log(err);
                                this.setState({ place_name: "", center: [] });
                                alert(
                                  "please use a neighbor's place_name, none found"
                                );
                              });
                          }}
                        >
                          <label>address1</label>
                          <input
                            required
                            type="text"
                            id="address1"
                            placeholder="Address"
                            value={this.state.addressQuery}
                            onChange={e =>
                              this.setState({ addressQuery: e.target.value })
                            }
                          />
                          <div>
                            {this.state.predictions.length > 0 &&
                              this.state.predictions.map(x => {
                                return (
                                  <div
                                    style={{
                                      border: "1px solid",
                                      borderRadius: "3px",
                                      width: "200px",
                                      height: "min-content",
                                      margin: "10px 0px",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      display: "flex",
                                      left: "50%",
                                      position: "relative",
                                      transform: "translateX(-50%)"
                                    }}
                                    onClick={() => {
                                      const address1 = x.place_name.split(
                                        ", "
                                      )[0];
                                      const city = x.place_name
                                        .split(", ")[1]
                                        .split(", ")[0];
                                      const statefull = x.place_name.split(
                                        ", "
                                      )[2];
                                      const ZIP = statefull.substr(
                                        statefull.lastIndexOf(/[\d]+/) - 4,
                                        statefull.length
                                      );
                                      const state = [
                                        {
                                          name: "Alabama",
                                          abbreviation: "AL"
                                        },
                                        {
                                          name: "Alaska",
                                          abbreviation: "AK"
                                        },
                                        {
                                          name: "American Samoa",
                                          abbreviation: "AS"
                                        },
                                        {
                                          name: "Arizona",
                                          abbreviation: "AZ"
                                        },
                                        {
                                          name: "Arkansas",
                                          abbreviation: "AR"
                                        },
                                        {
                                          name: "California",
                                          abbreviation: "CA"
                                        },
                                        {
                                          name: "Colorado",
                                          abbreviation: "CO"
                                        },
                                        {
                                          name: "Connecticut",
                                          abbreviation: "CT"
                                        },
                                        {
                                          name: "Delaware",
                                          abbreviation: "DE"
                                        },
                                        {
                                          name: "District Of Columbia",
                                          abbreviation: "DC"
                                        },
                                        {
                                          name:
                                            "Federated States Of Micronesia",
                                          abbreviation: "FM"
                                        },
                                        {
                                          name: "Florida",
                                          abbreviation: "FL"
                                        },
                                        {
                                          name: "Georgia",
                                          abbreviation: "GA"
                                        },
                                        {
                                          name: "Guam",
                                          abbreviation: "GU"
                                        },
                                        {
                                          name: "Hawaii",
                                          abbreviation: "HI"
                                        },
                                        {
                                          name: "Idaho",
                                          abbreviation: "ID"
                                        },
                                        {
                                          name: "Illinois",
                                          abbreviation: "IL"
                                        },
                                        {
                                          name: "Indiana",
                                          abbreviation: "IN"
                                        },
                                        {
                                          name: "Iowa",
                                          abbreviation: "IA"
                                        },
                                        {
                                          name: "Kansas",
                                          abbreviation: "KS"
                                        },
                                        {
                                          name: "Kentucky",
                                          abbreviation: "KY"
                                        },
                                        {
                                          name: "Louisiana",
                                          abbreviation: "LA"
                                        },
                                        {
                                          name: "Maine",
                                          abbreviation: "ME"
                                        },
                                        {
                                          name: "Marshall Islands",
                                          abbreviation: "MH"
                                        },
                                        {
                                          name: "Maryland",
                                          abbreviation: "MD"
                                        },
                                        {
                                          name: "Massachusetts",
                                          abbreviation: "MA"
                                        },
                                        {
                                          name: "Michigan",
                                          abbreviation: "MI"
                                        },
                                        {
                                          name: "Minnesota",
                                          abbreviation: "MN"
                                        },
                                        {
                                          name: "Mississippi",
                                          abbreviation: "MS"
                                        },
                                        {
                                          name: "Missouri",
                                          abbreviation: "MO"
                                        },
                                        {
                                          name: "Montana",
                                          abbreviation: "MT"
                                        },
                                        {
                                          name: "Nebraska",
                                          abbreviation: "NE"
                                        },
                                        {
                                          name: "Nevada",
                                          abbreviation: "NV"
                                        },
                                        {
                                          name: "New Hampshire",
                                          abbreviation: "NH"
                                        },
                                        {
                                          name: "New Jersey",
                                          abbreviation: "NJ"
                                        },
                                        {
                                          name: "New Mexico",
                                          abbreviation: "NM"
                                        },
                                        {
                                          name: "New York",
                                          abbreviation: "NY"
                                        },
                                        {
                                          name: "North Carolina",
                                          abbreviation: "NC"
                                        },
                                        {
                                          name: "North Dakota",
                                          abbreviation: "ND"
                                        },
                                        {
                                          name: "Northern Mariana Islands",
                                          abbreviation: "MP"
                                        },
                                        {
                                          name: "Ohio",
                                          abbreviation: "OH"
                                        },
                                        {
                                          name: "Oklahoma",
                                          abbreviation: "OK"
                                        },
                                        {
                                          name: "Oregon",
                                          abbreviation: "OR"
                                        },
                                        {
                                          name: "Palau",
                                          abbreviation: "PW"
                                        },
                                        {
                                          name: "Pennsylvania",
                                          abbreviation: "PA"
                                        },
                                        {
                                          name: "Puerto Rico",
                                          abbreviation: "PR"
                                        },
                                        {
                                          name: "Rhode Island",
                                          abbreviation: "RI"
                                        },
                                        {
                                          name: "South Carolina",
                                          abbreviation: "SC"
                                        },
                                        {
                                          name: "South Dakota",
                                          abbreviation: "SD"
                                        },
                                        {
                                          name: "Tennessee",
                                          abbreviation: "TN"
                                        },
                                        {
                                          name: "Texas",
                                          abbreviation: "TX"
                                        },
                                        {
                                          name: "Utah",
                                          abbreviation: "UT"
                                        },
                                        {
                                          name: "Vermont",
                                          abbreviation: "VT"
                                        },
                                        {
                                          name: "Virgin Islands",
                                          abbreviation: "VI"
                                        },
                                        {
                                          name: "Virginia",
                                          abbreviation: "VA"
                                        },
                                        {
                                          name: "Washington",
                                          abbreviation: "WA"
                                        },
                                        {
                                          name: "West Virginia",
                                          abbreviation: "WV"
                                        },
                                        {
                                          name: "Wisconsin",
                                          abbreviation: "WI"
                                        },
                                        {
                                          name: "Wyoming",
                                          abbreviation: "WY"
                                        }
                                      ].find(x => statefull.includes(x.name));
                                      firebase
                                        .firestore()
                                        .collection("userDatas")
                                        .doc(this.props.auth.uid)
                                        .update({
                                          address1,
                                          address2: this.state.address2,
                                          city,
                                          state: state.abbreviation,
                                          ZIP
                                        });
                                    }}
                                  >
                                    {x.place_name}
                                  </div>
                                );
                              })}
                          </div>
                          <div
                            style={
                              this.state.address1
                                ? {
                                    border: "1px solid",
                                    borderRadius: "3px",
                                    width: "120px",
                                    height: "min-content",
                                    margin: "10px 0px",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    display: "flex",
                                    left: "50%",
                                    position: "relative",
                                    transform: "translateX(-50%)"
                                  }
                                : {
                                    borderRadius: "3px",
                                    width: "120px",
                                    height: "min-content",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    display: "flex",
                                    left: "50%",
                                    position: "relative",
                                    transform: "translateX(-50%)"
                                  }
                            }
                          >
                            {this.props.user.address1}
                            <br />
                            {this.props.user.address2}
                            <br />
                            {this.props.user.city}
                            {this.props.user.address1 && ", "}
                            {this.props.user.state}
                          </div>
                          <button
                            type="submit"
                            style={{
                              left: "50%",
                              top: "-30px",
                              position: "relative",
                              transform: "translateX(-50%)",
                              display: "flex",
                              width: "min-content"
                            }}
                          >
                            Search
                          </button>
                        </form>
                      ) : !this.state.editAddress &&
                        this.props.user.address1 ? (
                        <div
                          style={{
                            flexDirection: "column",
                            border: "1px solid",
                            borderRadius: "3px",
                            width: "120px",
                            height: "min-content",
                            alignItems: "center",
                            justifyContent: "center",
                            display: "flex",
                            left: "50%",
                            position: "relative",
                            transform: "translateX(-50%)"
                          }}
                        >
                          {this.props.user.address1}
                          <br />
                          <input
                            placeholder="optional address line"
                            style={{ width: "100%" }}
                            value={this.state.address2}
                            onChange={e =>
                              this.setState({ address2: e.target.value })
                            }
                          />
                          {this.props.user.city}
                          {this.props.user.address1 && ", "}
                          {this.props.user.state}
                        </div>
                      ) : null}
                    </div>
                  </div>
                )}
              {this.props.user.address1 && (
                <div
                  onClick={() => {
                    this.setState({
                      address1: "",
                      address2: "",
                      city: "",
                      state: ""
                    });
                    firebase
                      .firestore()
                      .collection("userDatas")
                      .doc(this.props.auth.uid)
                      .update({
                        address1: "",
                        address2: "",
                        city: "",
                        state: ""
                      });
                  }}
                  style={{
                    display: "flex",
                    position: "relative",
                    left: "-9px",
                    top: "-40px",
                    fontSize: "12px",
                    height: "56px",
                    width: "56px",
                    justifyContent: "center",
                    alignItems: "center"
                  }}
                >
                  reset
                </div>
              )}
            </div>
          )}
          {this.props.user !== undefined &&
            !this.props.openBanks &&
            this.props.user.username &&
            this.props.user.name &&
            this.props.user.surname &&
            this.props.user.username === this.state.newUsername &&
            this.props.user.name === this.state.newName &&
            this.props.user.surname === this.state.newSurname &&
            this.props.user.address1 && (
              <div
                onMouseEnter={() => this.setState({ hoverbankbutton: true })}
                onMouseLeave={() => this.setState({ hoverbankbutton: false })}
                style={
                  this.state.hoverbankbutton || this.state.newBankplease
                    ? {
                        border: "1px solid",
                        borderRadius: "3px",
                        width: "120px",
                        height: "33px",
                        top: "-40px",
                        alignItems: "center",
                        justifyContent: "center",
                        display: "flex",
                        left: "50%",
                        position: "relative",
                        transform: "translateX(-50%)"
                      }
                    : {
                        color: "white",
                        backgroundColor: "teal",
                        border: "1px solid",
                        borderRadius: "3px",
                        width: "120px",
                        height: "33px",
                        top: "-40px",
                        alignItems: "center",
                        justifyContent: "center",
                        display: "flex",
                        left: "50%",
                        position: "relative",
                        transform: "translateX(-50%)"
                      }
                }
                onClick={
                  this.state.newBankplease
                    ? () => this.setState({ newBankplease: false })
                    : this.props.user.confirmedEmail
                    ? () => this.setState({ newBankplease: true })
                    : () => {
                        firebase
                          .auth()
                          .signInWithEmailLink(
                            this.props.user.email,
                            window.location.href
                          )
                          .then(result => {
                            console.log(result);
                            firebase
                              .firestore()
                              .collection("userDatas")
                              .doc(this.props.auth.uid)
                              .update({
                                confirmedEmail: this.props.user.email
                              });
                            console.log(
                              "nice! email confirmed.. now you can add banks"
                            );
                          })
                          .catch(err => {
                            console.log(err.message);
                          });
                      }
                }
              >
                {this.state.newBankplease ? "Back" : "Add bank"}
              </div>
            )}
          {this.props.user !== undefined &&
            this.props.user.name &&
            this.props.user.surname &&
            this.props.user.name === this.state.newName &&
            this.props.user.surname === this.state.newSurname &&
            this.state.newBankplease && (
              <form
                style={{
                  flexDirection: "column",
                  top: "-40px",
                  alignItems: "center",
                  justifyContent: "center",
                  display: "flex",
                  left: "50%",
                  position: "relative",
                  transform: "translateX(-50%)"
                }}
                onSubmit={async e => {
                  e.preventDefault();
                  if (
                    this.state.routingNumber &&
                    this.state.accountNumber &&
                    this.state.uniqueName
                  ) {
                    const add = dwollaID =>
                      firebase
                        .firestore()
                        .collection("userDatas")
                        .doc(this.props.auth.uid)
                        .update({
                          dwollaID
                        });
                    if (!this.props.user.dwollaID) {
                      await fetch(
                        "https://us-central1-vaumoney.cloudfunctions.net/verifiedCustomerVaumoney",
                        {
                          method: "POST",
                          headers: {
                            "content-type": "application/json",
                            Accept: "application/json"
                          },
                          body: JSON.stringify({
                            correlationId: this.props.auth.uid,
                            firstName: this.props.user.name,
                            lastName: this.props.user.surname,
                            email: this.props.user.confirmedEmail,
                            DOB: this.props.user.DOB,
                            SSN: this.props.user.SSN,
                            address1: this.props.user.address1,
                            address2: this.props.user.address2,
                            city: this.props.user.city,
                            state: this.props.user.state,
                            ZIP: this.props.user.ZIP
                          })
                        }
                      )
                        .then(async res => await res.json())
                        .then(async result => {
                          if (result._embedded.errors[0].code === "Duplicate") {
                            console.log("email already exists with dwolla");
                            var confirmedEmail = encodeURIComponent(
                              this.props.user.confirmedEmail
                            );
                            await fetch(
                              "https://us-central1-vaumoney.cloudfunctions.net/searchCustomerVaumoney",
                              {
                                method: "POST",
                                headers: {
                                  "content-type": "application/json",
                                  Accept: "application/json"
                                },
                                body: JSON.stringify({
                                  confirmedEmail
                                })
                              }
                            )
                              .then(async res => await res.json())
                              .then(result => {
                                /*var dwollaID = result.split(
                                  "https://api-sandbox.dwolla.com/customers/"
                                )[1];*/
                                console.log(result);
                                var dwollaID =
                                  result._embedded["customers"][0].id;
                                console.log(dwollaID);
                                add(dwollaID);
                                console.log("!");
                                this.deployNewFundingSource(dwollaID);
                              })
                              .catch(err => console.log(err.message));
                          } else {
                            /*var dwollaID = result.split(
                            "https://api-sandbox.dwolla.com/customers/"
                          )[1];*/
                            var dwollaID = result._embedded["customers"][0].id;
                            console.log(dwollaID);
                            add(dwollaID);
                            console.log("!");
                            this.deployNewFundingSource(dwollaID);
                          }
                        })
                        .catch(async err => {
                          console.log(err.message);
                        });
                    } else {
                      console.log("!");
                      this.deployNewFundingSource(this.props.user.dwollaID);
                    }
                  } else
                    return window.alert(
                      "please complete the form to add the account"
                    );
                }}
              >
                <br /> Add bank
                <br />
                <div>
                  <input
                    type="text"
                    id="name"
                    placeholder="Unique name"
                    value={this.state.uniqueName}
                    onChange={e =>
                      this.setState({ uniqueName: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label>Routing number</label>
                  <input
                    type="text"
                    id="routingNumber"
                    placeholder="273222226"
                    value={this.state.routingNumber}
                    onChange={e =>
                      this.setState({ routingNumber: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label>Account number</label>
                  <input
                    type="text"
                    id="accountNumber"
                    placeholder="Account number"
                    value={this.state.accountNumber}
                    onChange={e =>
                      this.setState({ accountNumber: e.target.value })
                    }
                  />
                </div>
                <div>
                  <input type="submit" value="Add Bank" />
                </div>
              </form>
            )}
          <div id="iavContainer" />
          <br />
          {this.state.chosenBankToBiz && (
            <div
              style={{
                border: "1px solid",
                borderRadius: "3px",
                width: "120px",
                height: "33px",
                alignItems: "center",
                justifyContent: "center",
                display: "flex",
                left: "50%",
                position: "relative",
                transform: "translateX(-50%)"
              }}
              onClick={
                this.state.newBusinessplease
                  ? () => this.setState({ newBusinessplease: false })
                  : () => this.setState({ newBusinessplease: true })
              }
            >
              Add business
            </div>
          )}
          {this.props.user !== undefined &&
            this.props.user.name &&
            this.props.user.surname &&
            this.props.user.name === this.state.newName &&
            this.props.user.surname === this.state.newSurname &&
            this.state.newBusinessplease && (
              <form
                onSubmit={async e => {
                  e.preventDefault();
                  if (this.state.biztype !== "Sole Proprietorship") {
                    if (this.state.ein === "") {
                      alert(
                        "for Corporations, LLC & Partnerships, or Sole Proprietorshiops with employees, you need an ein. " +
                          " please visit irs.gov to quickly get one"
                      );
                    } else {
                      await fetch(
                        `https://cors-anywhere.herokuapp.com/https://api-sandbox.dwolla.com/token`,
                        {
                          method: "POST",
                          headers: {
                            "content-type": "application/x-www-form-urlencoded",
                            Allow: "*",
                            Accept: "application/json"
                          },
                          body: JSON.stringify({
                            access_token: this.props.access_token
                          })
                        }
                      )
                        .then(async response => await response.json())
                        .then(async body => {
                          console.log("beneficial owner resource");
                          console.log(body.verificationStatus);
                          this.setState({
                            verificationStatus: body.verificationStatus
                          });
                        })
                        .catch(err => {
                          console.log("auth");
                          console.log(err.message);
                        });
                    }
                  }
                }}
              >
                <br />
                <div>
                  <label>bizname</label>
                  <input type="number" id="ssn" placeholder="Business name" />
                </div>
                <div>
                  <label>biztype</label>
                  <select name="biztype" id="biztype">
                    {[
                      "Sole Proprietorship",
                      "Corporation",
                      "LLC",
                      "Partnership"
                    ].map(x => {
                      return <option value={x}>{x}</option>;
                    })}
                  </select>
                </div>
                {this.props.businessCodes && (
                  <div>
                    <select name="bizclass" id="bizclass">
                      {this.props.businessCodes.map(x => {
                        return <option value={x.name}>{x.name}</option>;
                      })}
                    </select>
                  </div>
                )}
                <div>
                  <label>ein</label>
                  <input
                    type="number"
                    id="ein"
                    placeholder="Employer identification #"
                  />
                </div>
              </form>
            )}
        </div>
      </div>
    );
  }
}
export default NewBank;
