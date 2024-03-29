import React, { Component } from "react";
import ItemManagerContract from "./contracts/ItemManager.json";
import getWeb3 from "./getWeb3";

import "./App.css";

class App extends Component {
  state = { cost: 0, itemName: "exampleItem1", loaded: false };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      this.web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      this.accounts = await this.web3.eth.getAccounts();

      // Get the contract instance.
      this.networkId = await this.web3.eth.net.getId();
      this.deployedNetwork = ItemManagerContract.networks[this.networkId];
      this.instance = new this.web3.eth.Contract(
        ItemManagerContract.abi,
        this.deployedNetwork && this.deployedNetwork.address
      );

      this.listenToPaymentEvent();

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ loaded: true });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  listenToPaymentEvent = () => {
    let self = this;
    this.instance.events.SupplyChainStep().on("data", async function (evt) {
      if (evt.returnValues._step == 1) {
        let item = await self.instance.methods
          .items(evt.returnValues._index)
          .call();
        console.log(item);
        alert("Item " + item._name + " was paid, deliver it now!");
      }
      console.log(evt);
    });
  };

  handleSubmit = async () => {
    const { cost, itemName } = this.state;
    console.log(itemName, cost, this.itemManager);
    let result = await this.instance.methods
      .createItem(itemName, cost)
      .send({ from: this.accounts[0] });
    console.log(result);
    alert(
      "Send " +
        cost +
        " Wei to " +
        result.events.SupplyChainStep.returnValues._address
    );
  };

  handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;
    this.setState({
      [name]: value,
    });
  };

  render() {
    if (!this.state.loaded) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return <div className="App">
      <h1>Simply Payment/Supply Chain Example!</h1>
      <h2>Items</h2>
      <h2>Add Element</h2>
      Cost: <input type="text" name="cost" value={this.state.cost} onChange={this.handleInputChange} />
      Item Name: <input type="text" name="itemName" value={this.state.itemName} onChange={this.handleInputChange} />
      <button type="button" onClick={this.handleSubmit}>Create new Item</button>
    </div>;
  }
}

export default App;
