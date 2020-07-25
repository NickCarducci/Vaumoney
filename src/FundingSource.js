import React from "react";
import dayjs from "dayjs";

class FundingSource extends React.Component {
  state = { newName: this.props.x.name };
  render() {
    function renderDate(date) {
      let d = dayjs(date);
      return d.format("MMMM D YYYY");
    }
    return (
      <form
        key={this.props.x.id}
        style={{ zIndex: "9999" }}
        onSubmit={async e => {
          e.preventDefault();
          if (this.props.x.name !== this.state.newName) {
            await fetch(
              "https://us-central1-vaumoney.cloudfunctions.net/editFundingVaumoney",
              {
                method: "POST",
                headers: {
                  "content-type": "application/json",
                  Allow: "*",
                  Accept: "application/json"
                },
                body: JSON.stringify({
                  name: this.state.newName
                })
              }
            )
              .then(async res => await res.json())
              .then(result => {
                console.log(result);
              })
              .catch(err => console.log(err.message));
          }
          this.setState({ closeEdit: false });
        }}
      >
        {this.state.closeEdit && (
          <button
            style={{ display: "flex" }}
            onClick={() =>
              this.setState({ closeEdit: true, newName: this.props.x.name })
            }
          >
            Cancel
          </button>
        )}
        {this.state.closeEdit ? (
          <div style={{ display: "flex" }}>
            <input
              className="input"
              required
              placeholder="name"
              value={this.state.newName}
              onChange={e => this.setState({ newName: e.target.value })}
            />
            {this.props.x.name !== this.state.newName && (
              <button type="submit">Save</button>
            )}
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              position: "relative",
              justifyContent: "flex-start",
              alignItems: "flex-end"
            }}
          >
            <div
              onClick={async () => {
                var answer = window.confirm("check balance?");
                if (answer) {
                  await fetch(
                    "https://us-central1-vaumoney.cloudfunctions.net/getBalanceVaumoney",
                    {
                      method: "POST",
                      headers: {
                        Accept: "application/json",
                        "content-type": "application/json"
                      },
                      body: JSON.stringify({
                        FundingSource: this.props.x.id
                      })
                    }
                  )
                    .then(async res => await res.json())
                    .then(result => {
                      console.log(result);
                      this.setState({ [this.props.x.id]: result });
                    })
                    .catch(err => console.log(err.message));
                }
              }}
              onMouseEnter={() => this.setState({ arrow: this.props.x.id })}
              onMouseLeave={() => this.setState({ arrow: false })}
              style={
                this.state.arrow === this.props.x.id
                  ? {
                      display: "flex",
                      position: "relative",
                      justifyContent: "center",
                      alignItems: "center",
                      zIndex: "9999",
                      height: "22px",
                      borderRadius: "6px",
                      border: "1px solid",
                      width: "40px",
                      fontSize: "12px",
                      transform: "rotate(180deg)"
                    }
                  : {
                      display: "flex",
                      position: "relative",
                      justifyContent: "center",
                      alignItems: "center",
                      zIndex: "9999",
                      height: "22px",
                      borderRadius: "6px",
                      border: "1px solid",
                      width: "40px",
                      backgroundColor: "teal",
                      color: "white",
                      fontSize: "12px",
                      transform: "rotate(180deg)"
                    }
              }
            >
              ^
            </div>
            &nbsp;{this.props.x.name}&nbsp;
            <div
              onClick={() => this.setState({ closeEdit: true })}
              style={{
                display: "flex",
                position: "relative",
                justifyContent: "center",
                alignItems: "center",
                zIndex: "9999",
                height: "22px",
                borderRadius: "6px",
                border: "1px solid",
                width: "40px",
                backgroundColor: "teal",
                color: "white",
                fontSize: "12px"
              }}
            >
              EDIT
            </div>
          </div>
        )}
        <div
          style={{
            flexDirection: "column",
            display: "flex",
            position: "relative",
            width: "min-content",
            marginLeft: "4px"
          }}
        >
          <div
            style={{
              height: "min-content",
              display: "flex",
              position: "relative",
              alignItems: "center"
            }}
          >
            <div
              onMouseEnter={() => this.setState({ info: "status" })}
              onMouseLeave={() => this.setState({ info: false })}
              style={
                this.state.info === "status"
                  ? {
                      fontSize: "10px",
                      height: "min-content",
                      alignItems: "center",
                      display: "flex",
                      border: "1px solid",
                      position: "relative",
                      width: "max-content",
                      borderRadius: "3px",
                      padding: "0px 3px"
                    }
                  : {
                      fontSize: "10px",
                      height: "min-content",
                      alignItems: "center",
                      display: "flex",
                      border: "1px solid",
                      position: "relative",
                      width: "max-content",
                      color: "rgb(140,160,140)",
                      borderRadius: "3px",
                      padding: "0px 3px"
                    }
              }
            >
              .{this.props.x.status}/{this.props.x.name}/
              {this.props.x.channels.map((x, i) => (i === 0 ? x : `&${x}`))}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              position: "relative",
              alignItems: "center"
            }}
          >
            <div
              onMouseEnter={() => this.setState({ info: "type" })}
              onMouseLeave={() => this.setState({ info: false })}
              style={
                this.state.info === "type"
                  ? {
                      fontSize: "10px",
                      height: "min-content",
                      alignItems: "center",
                      display: "flex",
                      border: "1px solid",
                      position: "relative",
                      width: "max-content",
                      borderRadius: "3px",
                      padding: "0px 3px"
                    }
                  : {
                      fontSize: "10px",
                      height: "min-content",
                      alignItems: "center",
                      display: "flex",
                      border: "1px solid",
                      position: "relative",
                      width: "max-content",
                      color: "rgb(140,160,140)",
                      borderRadius: "3px",
                      padding: "0px 3px"
                    }
              }
            >
              .{this.props.x.type}/{this.props.x.bankName}
            </div>
          </div>
        </div>
        <div
          style={{
            marginLeft: "4px",
            display: "flex",
            position: "relative",
            alignItems: "center"
          }}
        >
          <div
            onMouseEnter={() => this.setState({ info: "linked" })}
            onMouseLeave={() => this.setState({ info: false })}
            style={
              this.state.info === "linked"
                ? {
                    fontSize: "10px",
                    height: "min-content",
                    alignItems: "center",
                    display: "flex",
                    border: "1px solid",
                    position: "relative",
                    width: "max-content",
                    borderRadius: "3px",
                    padding: "0px 3px"
                  }
                : {
                    fontSize: "10px",
                    height: "min-content",
                    alignItems: "center",
                    display: "flex",
                    border: "1px solid",
                    position: "relative",
                    width: "max-content",
                    color: "rgb(140,160,140)",
                    borderRadius: "3px",
                    padding: "0px 3px"
                  }
            }
          >
            .linked/
            {renderDate(this.props.x.created)}
          </div>
        </div>
        <div
          style={{
            marginLeft: "4px",
            display: "flex",
            position: "relative",
            alignItems: "center"
          }}
        >
          <div
            onMouseEnter={() => this.setState({ info: "linked" })}
            onMouseLeave={() => this.setState({ info: false })}
            style={
              this.state.info === "linked"
                ? {
                    fontSize: "10px",
                    height: "min-content",
                    alignItems: "center",
                    display: "flex",
                    border: "1px solid",
                    position: "relative",
                    width: "max-content",
                    borderRadius: "3px",
                    padding: "0px 3px"
                  }
                : {
                    fontSize: "10px",
                    height: "min-content",
                    alignItems: "center",
                    display: "flex",
                    border: "1px solid",
                    position: "relative",
                    width: "max-content",
                    color: "rgb(140,160,140)",
                    borderRadius: "3px",
                    padding: "0px 3px"
                  }
            }
          >
            .balance/
            {this.state[this.props.x.id]}
          </div>
        </div>
        {this.state.closeEdit && (
          <div
            style={{ fontSize: "20px", border: "1px solid black" }}
            onClick={async () => {
              var answer = window.confirm(
                "are you sure you'd like to delete this funding source?"
              );
              if (answer)
                await fetch(
                  "https://us-central1-vaumoney.cloudfunctions.net/listTransationsVaumoney",
                  {
                    method: "POST",
                    headers: {
                      "content-type": "application/json",
                      Allow: "*",
                      Accept: "application/json"
                    },
                    body: JSON.stringify({
                      removed: true
                    })
                  }
                )
                  .then(async res => await res.json())
                  .then(async result => {
                    console.log(result);
                    var thereisone = result.find(x => x.status === "pending");
                    if (!thereisone) {
                      var answer = window.confirm(
                        `proceed with deletion of the funding source: ${
                          this.state.newName
                        }`
                      );
                      if (answer) {
                        await fetch(
                          "https://us-central1-vaumoney.cloudfunctions.net/deleteFundingVaumoney",
                          {
                            method: "POST",
                            headers: {
                              "content-type": "application/json",
                              Allow: "*",
                              Accept: "application/json"
                            },
                            body: JSON.stringify({
                              removed: true
                            })
                          }
                        )
                          .then(async res => await res.json())
                          .then(async result => {
                            console.log(result);
                          });
                      }
                    } else {
                      window.alert(
                        "transactions are still being processed. please wait a few more moments" +
                          " to try deleting this bank account's connection again"
                      );
                    }
                  });
            }}
          >
            delete
          </div>
        )}
      </form>
    );
  }
}
export default FundingSource;
