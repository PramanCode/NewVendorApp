import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  Button,
  View,
  TouchableWithoutFeedback,
  Modal,
  Switch
} from "react-native";
import { StackNavigator } from "react-navigation";
import * as firebase from "firebase";
import HeaderButtons from "react-navigation-header-buttons";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
export default class ItemsDetailsPage extends Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerRight: (
        <View>
          <HeaderButtons
            IconComponent={Ionicons}
            OverflowIcon={<MaterialIcons name="more-vert" size={23} />}
            iconSize={23}
            color="blue"
          >
            <HeaderButtons.Item
              title="Add Food Item"
              onPress={() => navigation.state.params.itemModalHandler(true)}
              show="never"
            />
            <HeaderButtons.Item
              title="Sign Out"
              onPress={() => navigation.state.params.signOutHandler()}
              show="never"
            />
          </HeaderButtons>
        </View>
      )
    };
  };

  constructor(props) {
    super(props);
    this.itemKey;
    this.itemIndex = null;
    this.restaurantKey = this.props.navigation.getParam("restaurantKey");
    this.categoryKey = this.props.navigation.getParam("categoryKey");
    this.categoryName = this.props.navigation.getParam("categoryName");
    console.log(
      "constructor item ItemsDetailsPage" +
        this.restaurantKey +
        this.categoryKey
    );
    this.state = {
      itemModalVisible: false,
      editItemModalVisible: false,
      itemArr: [],
      itemName: "",
      itemPrice: ""
    };
    this.fetchItemArr = this.fetchItemArr.bind(this);
    this.renderItemModal = this.renderItemModal.bind(this);
    this.itemModalHandler = this.itemModalHandler.bind(this);
    this.addFoodItem = this.addFoodItem.bind(this);
    this.signOutHandler = this.signOutHandler.bind(this);
    this.updateFoodItem = this.updateFoodItem.bind(this);
    this.toggleItem = this.toggleItem.bind(this);
    this.deleteFoodItem = this.deleteFoodItem.bind(this);
    this.fetchItemArr().then(itemArrState => {
      this.setState({ itemArr: itemArrState });
    });
    this.props.navigation.setParams({
      itemModalHandler: this.itemModalHandler.bind(this),
      signOutHandler: this.signOutHandler.bind(this)
    });
  }

  async fetchItemArr() {
    console.log("fetch Item Arr" + this.restaurantKey);
    return firebase
      .database()
      .ref(
        "/Restaurants/" +
          this.restaurantKey +
          "/Categories/" +
          this.categoryKey +
          "/FoodItems"
      )
      .once("value")
      .then(function(snapshot) {
        var itemArr = [];
        if (snapshot.val() != null) {
          Object.keys(snapshot.val()).forEach(function(key) {
            let element = snapshot.val()[key];
            element.itemKey = key;
            itemArr.push(element);
          });
        }
        return itemArr;
      })
      .catch(error => console.log(error));
  }

  renderItemModal(value) {
    let SuitableButton, DeleteButton;
    console.log("item index: " + this.itemIndex);
    let currentItemName = "";
    let curerntItemPrice = "";
    console.log("renderItemModal itemIndex : " + this.itemIndex);
    console.log(
      "restaurantKey renderItemModal ItemsDetailsPage" + this.restaurantKey
    );
    if (value) {
      SuitableButton = (
        <Button title={"Add Item"} onPress={e => this.addFoodItem(e)} />
      );
    } else {
      SuitableButton = (
        <Button title={"Update Item"} onPress={e => this.updateFoodItem(e)} />
      );
      DeleteButton = (
        <Button title={"Delete Item"} onPress={e => this.deleteFoodItem(e)} />
      );
      if (this.itemIndex != null && !value && this.state.editItemModalVisible) {
        console.log(this.state.itemArr[this.itemIndex]);
        currentItemName = this.state.itemArr[this.itemIndex].itemName;
        curerntItemPrice = this.state.itemArr[this.itemIndex].itemPrice;
      }
    }

    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <View
          style={{
            flexDirection: "column",
            width:200,
            height:300,
            paddingBottom:70,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 4,
            borderColor: "#888",
            borderRadius: 10,
            backgroundColor: "#fff"
          }}
        >
          <TextInput
            style={{ backgroundColor: "transparent",marginTop:70,width:150,paddingBottom:10,marginBottom:10,paddingLeft:5}}
            defaultValue={currentItemName}
            placeholder ="Enter Item Name"
            onChangeText={itemName => {
              this.setState({ itemName: itemName });
            }}
          />
          <TextInput
            style={{ backgroundColor: "transparent",width:150,paddingBottom:10,marginBottom:10,paddingLeft:5}}
            defaultValue={curerntItemPrice}
            placeholder = "Enter Price"
            onChangeText={itemPrice => {
              this.setState({ itemPrice: itemPrice });
            }}
          />
          <View style = {{marginBottom:10}}>
          {SuitableButton}
          </View>
          <View style = {{marginBottom:10}}>
          {DeleteButton}
          </View>
          <Button
            title="Cancel"
            onPress={e => {
              e.preventDefault();
              this.setState({
                editItemModalVisible: false,
                itemModalVisible:false
              });
            }}
          />
          </View>
      </View>
    );
  }

  addFoodItem(e) {
    e.preventDefault(e);

    //create a key in the database for the new item under
    /*restaurantKey = this.props.navigation.getParam("restaurantKey");
    categoryKey = this.props.navigation.getParam("categoryKey");*/
    console.log("restaurantKey food item" + this.restaurantKey);
    this.itemKey = firebase
      .database()
      .ref(
        "/Restaurants/" +
          this.restaurantKey +
          "/Categories/" +
          this.categoryKey +
          "/FoodItems"
      )
      .push().key;
    console.log(" food item key generrated" + this.itemKey.toString());

    //restaurant key under which category is to be created

    //add item details that needed to be added in firebase
    var updates = {};
    updates[
      "/Restaurants/" +
        this.restaurantKey +
        "/Categories/" +
        this.categoryKey +
        "/FoodItems/" +
        this.itemKey +
        "/itemName"
    ] = this.state.itemName;
    updates[
      "/Restaurants/" +
        this.restaurantKey +
        "/Categories/" +
        this.categoryKey +
        "/FoodItems/" +
        this.itemKey +
        "/itemPrice"
    ] = this.state.itemPrice;
    updates[
      "/Restaurants/" +
        this.restaurantKey +
        "/Categories/" +
        this.categoryKey +
        "/FoodItems/" +
        this.itemKey +
        "/itemAvailable"
    ] = true;

    //send updates to firebase
    firebase
      .database()
      .ref()
      .update(updates);

    //add item to local array that will be displayed
    this.state.itemArr.push({
      itemKey: this.itemKey,
      itemName: this.state.itemName,
      itemPrice: "0",
      itemAvailable: true
    });

    //re-render the component with newly added item
    this.setState({ itemModalVisible: false, itemArr: this.state.itemArr });
  }

  updateFoodItem(e) {
    e.preventDefault();
    var updates = {};
    updates[
      "/Restaurants/" +
        this.restaurantKey +
        "/Categories/" +
        this.categoryKey +
        "/FoodItems/" +
        this.itemKey +
        "/itemName"
    ] = this.state.itemName;
    updates[
      "/Restaurants/" +
        this.restaurantKey +
        "/Categories/" +
        this.categoryKey +
        "/FoodItems/" +
        this.itemKey +
        "/itemPrice"
    ] = this.state.itemPrice;
    let itemArrState = this.state.itemArr;
    console.log("item index real: " + this.itemIndex);
    itemArrState[this.itemIndex].itemName = this.state.itemName;
    itemArrState[this.itemIndex].itemPrice = this.state.itemPrice;
    //send updates to firebase
    firebase
      .database()
      .ref()
      .update(updates)
      .then(() => {
        this.setState({ editItemModalVisible: false, itemArr: itemArrState });
      })
      .catch(error => {
        console.log(error);
        alert("it cant be done");
        this.setState({ editItemModalVisible: false });
      });
  }

  deleteFoodItem(e) {
    console.log(
      "came to delete restaurantKey " +
        this.restaurantKey +
        " categoryKey " +
        this.categoryKey +
        " itemKey " +
        this.itemKey
    );

    firebase
      .database()
      .ref(
        "/Restaurants/" +
          this.restaurantKey +
          "/Categories/" +
          this.categoryKey +
          "/FoodItems/" +
          this.itemKey
      )
      .remove()
      .then(() => {
        this.fetchItemArr()
          .then(updatedItemArr => {
            this.setState({
              editItemModalVisible: !this.state.editItemModalVisible,
              itemArr: updatedItemArr
            });
          })
          .catch(error => console.log(error));
      })
      .catch(error => console.log(error));
  }

  itemModalHandler(value) {
    //e.preventDefault();
    if (value) {
      console.log("called");
      this.setState({ itemModalVisible: true});
    } else {
      console.log("called");
      this.setState({ editItemModalVisible: !this.state.editItemModalVisible });
    }
  }

  toggleItem(i) {
    //a.categoryAvailable=!a.categoryAvailable;
    let itemArrState = this.state.itemArr;
    //console.log(this.state.itemArr[i].toString());
    itemArrState[i].itemAvailable = !this.state.itemArr[i].itemAvailable;
    firebase
      .database()
      .ref(
        "/Restaurants/" +
          this.restaurantKey +
          "/Categories/" +
          this.categoryKey +
          "/FoodItems/" +
          itemArrState[i].itemKey
      )
      .update({ itemAvailable: itemArrState[i].itemAvailable })
      .then(() => {
        this.setState({ itemArr: itemArrState });
      })
      .catch(error => console.log(error));
    console.log(
      "key and category while rendering " +
        this.state.itemArr[i].itemName +
        " " +
        itemArrState[i].itemAvailable
    );
  }

  signOutHandler() {
    firebase
      .auth()
      .signOut()
      .then(() => {
        this.props.navigation.navigate("Login");
      });
  }

  render() {
    console.log("inside render restaurantKey " + this.restaurantKey);
    var itemListArr = this.state.itemArr.map((a, i) => {
      console.log(
        "key and category while rendering+" + a.itemKey + " " + a.itemName
      );
      return (
        <View
          key={a.itemKey}
          style={{ borderBottomWidth: 2, borderBottomColor: "#ededed" }}
        >
          <View>
            <TouchableWithoutFeedback
              onLongPress={e => {
                this.itemIndex = i;
                this.itemKey = a.itemKey;
                this.itemModalHandler(false);
              }}
            >
              <View
                style={{
                  backgroundColor: "#c9c9c5",
                  height: 40,
                  flexDirection: "row"
                }}
              >
                <Text
                  style={{
                    textAlign: "left",
                    justifyContent: "center",
                    flex: 1
                  }}
                >
                  {a.itemName}
                </Text>
                <Switch
                  onValueChange={() => this.toggleItem(i)}
                  value={this.state.itemArr[i].itemAvailable}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </View>
      );
    });
    return (
      <View>
        {itemListArr}
        <Modal
          animationType="fade"
          transparent={true}
          visible={this.state.itemModalVisible}
          onRequestClose={() => {
            alert("Modal has been closed.");
          }}
        >
          {this.renderItemModal(true)}
        </Modal>
        <Modal
          animationType="fade"
          transparent={true}
          visible={this.state.editItemModalVisible}
          onRequestClose={() => {
            alert("Modal has been closed.");
          }}
        >
          {this.renderItemModal(false)}
        </Modal>
      </View>
    );
  }
}
