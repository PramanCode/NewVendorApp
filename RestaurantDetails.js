import React, { Component } from "react";
import {
  AppRegistry,
  SectionList,
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  Modal
} from "react-native";
//import makeConnection from './Connection';
import { StackNavigator } from "react-navigation";
import Toast from "react-native-simple-toast";
import firebase from "firebase";
import Alert from "Alert";
import { Constants, Location, Permissions } from "expo";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

const homePlace = {
  description: "Home",
  geometry: { location: { lat: 48.8152937, lng: 2.4597668 } }
};
const workPlace = {
  description: "Work",
  geometry: { location: { lat: 48.8496818, lng: 2.2940881 } }
};

export default class RestaurantDetails extends Component {

  constructor(props) {
    super(props);
    this.state = {
      restaurantName: "",
      restaurantAddress: "",
      restaurantEmail: "",
      restaurantContactNo: "",
      searchModalVisible: false
    };

    this.addressLatitude = 0;
    this.addressLongitude = 0;
    this.checkRestaurantDetails = this.checkRestaurantDetails.bind(this);
    this.sendRestaurantDetails = this.sendRestaurantDetails.bind(this);
    this.renderSearchModal = this.renderSearchModal.bind(this);
    this.sendLocationAlert = this.sendLocationAlert.bind(this);
    this.getLocationAsync = this.getLocationAsync.bind(this);

    console.log("RestaurantDetails console"+this.props.navigation.getParam("userKey"));

    if (this.props.navigation.getParam("restaurantKey")) {
      console.log("checking" + this.props.navigation.getParam("restaurantKey"));

      //var yes = async ()=>{return firebase.database().ref("/Restaurants/"+this.props.navigation.getParam("restaurantKey")).once("value")}

      this.fetchRestaurantDetails()
        .then(snapshot => {
          console.log("here 2");
          this.setState({
            restaurantName: snapshot.val()["Restaurant Name"],
            restaurantAddress: snapshot.val()["Address"],
            restaurantEmail: snapshot.val()["Email"],
            restaurantContactNo: snapshot.val()["Contact No"],
            searchModalVisible: false
          });

          console.log("checking" + snapshot.val()["Email"]);
        })
        .catch(error => console.log("checking" + error));
    } else {
      console.log("here");
    }
  }

  async fetchRestaurantDetails() {
    console.log("fetch Item Arr");
    return firebase
      .database()
      .ref("/Restaurants/" + this.props.navigation.getParam("restaurantKey"))
      .once("value");
  }

  checkRestaurantDetails() {
    if (this.state.restaurantName == "") {
      Toast.show("Restaurant name cannot be empty");
      return;
    }
    if (this.state.restaurantEmail.length == "") {
      Toast.show("Email cannot be empty");
      return;
    }
    var emailFormat = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
    if (emailFormat.test(this.state.restaurantEmail) == false) {
      Toast.show("Email format should be correct");
      return;
    }
    if (this.state.restaurantAddress == "") {
      Toast.show("Adress cannot be empty");
      return;
    }
    if (this.state.restaurantContactNo.length < 9) {
      Toast.show("Contact No. is not valid");
      return;
    }
    this.sendRestaurantDetails();
  }
  renderSearchModal() {
    const GooglePlacesInput = () => {
      return (
        <GooglePlacesAutocomplete
          placeholder="Search"
          minLength={2} // minimum length of text to search
          autoFocus={true}
          // Can be left out for default return key https://facebook.github.io/react-native/docs/textinput.html#returnkeytype
          listViewDisplayed="auto" // true/false/undefined
          fetchDetails={true}
          renderDescription={row => row.description} // custom description render
          onPress={(data, details = null) => {
            // 'details' is provided when fetchDetails = true
            this.setState({
              restaurantAddress: data.description,
              searchModalVisible: false
            });
            console.log(JSON.stringify(details.geometry.location));
            this.addressLatitude = details.geometry.location.lat;
            this.addressLongitude = details.geometry.location.lng;
            //console.log(details);
          }}
          getDefaultValue={() => {
            return ""; // text input default value
          }}
          query={{
            // available options: https://developers.google.com/places/web-service/autocomplete
            //AIzaSyC2l9cnyic79pMnidRRDk7mOQjZhRnz0jE
            //AIzaSyDy1CBCpnXU5vqPq6U524QDMULrSrYqxzI
            key: "AIzaSyC2l9cnyic79pMnidRRDk7mOQjZhRnz0jE",
            language: "en", // language of the results
            types: "address" // default: 'geocode'
          }}
          styles={{
            description: {
              fontWeight: "bold"
            },
            predefinedPlacesDescription: {
              color: "#1faadb"
            }
          }}
        />
      );
    };
    return <GooglePlacesInput />;
  }

  getLocationAsync = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== "granted") {
      this.setState({
        errorMessage: "Permission to access location was denied"
      });
    }
    let location = await Location.getCurrentPositionAsync({
      enableHighAccuracy: true
    });
    this.addressLatitude = location.coords.latitude;
    this.addressLongitude = location.coords.longitude;
    console.log(location);
    console.log(this.addressLatitude + " " + this.addressLongitude);
    let addressArray = await Location.reverseGeocodeAsync({
      latitude: this.addressLatitude,
      longitude: this.addressLongitude
    });
    let address =
      addressArray[0].name +
      ", " +
      addressArray[0].street +
      ", " +
      addressArray[0].city +
      ", " +
      addressArray[0].postalCode +
      ", " +
      addressArray[0].region +
      ", " +
      addressArray[0].country;
    console.log(JSON.stringify(addressArray[0]));
    console.log(address);
    this.setState({ restaurantAddress: address });
  };
  sendRestaurantDetails() {
    var fdatabase = firebase.database();
    var restaurantKey = fdatabase.ref("Restaurants").push().key;
    fdatabase.ref("/Restaurants/" + restaurantKey).update({
      "Restaurant Name": this.state.restaurantName,
      Address: this.state.restaurantAddress,
      Email: this.state.restaurantEmail,
      "Contact No": this.state.restaurantContactNo,
      Latitude: this.addressLatitude,
      Longitude: this.addressLongitude,
      Available: true
    });
    console.log("userKey " + this.props.navigation.getParam("userKey"));
    fdatabase.ref().update({
      ["users/" +
      this.props.navigation.getParam("userKey") +
      "/restaurantKey"]: restaurantKey
    });
    alert("done");
    console.log("restaurantKey on Restaurants page: " + restaurantKey);
    this.props.navigation.navigate("Items", { restaurantKey: restaurantKey });
  }

  updateRestaurantDetails() {
    var fdatabase = firebase.database();
    var updates = {};
    updates["/Restaurants/" + this.props.navigation.getParam("restaurantKey")+"/Restaurant Name"] = this.state.restaurantName;
    updates["/Restaurants/" + this.props.navigation.getParam("restaurantKey")+"/Address"] = this.state.restaurantAddress;
    updates["/Restaurants/" + this.props.navigation.getParam("restaurantKey")+"/Email"] = this.state.restaurantEmail;
    updates["/Restaurants/" + this.props.navigation.getParam("restaurantKey")+"/Contact No"] = this.state.restaurantContactNo;
    updates["/Restaurants/" + this.props.navigation.getParam("restaurantKey")+"/Latitude"] = this.addressLatitude;
    updates["/Restaurants/" + this.props.navigation.getParam("restaurantKey")+"/Longitude"] = this.addressLongitude;
    fdatabase.ref().update(updates);
    this.props.navigation.navigate("Items", {
      restaurantKey: this.props.navigation.getParam("restaurantKey")
    });
  }

  sendLocationAlert() {
    {
      Alert.alert(
        "Enter Location",
        "Choose an option",
        [
          {
            text: "Turn On Location",
            onPress: () => {
              this.getLocationAsync();
            }
          },
          {
            text: "Enter Manually",
            onPress: () => this.setState({ searchModalVisible: true })
          }
        ],
        { cancelable: false }
      );
    }
  }
  render() {
    let SuitableButton;
    if (this.props.navigation.getParam("restaurantKey")) {
      SuitableButton = (
        <Button
          title={"Update"}
          onPress={() => this.updateRestaurantDetails()}
          color="#841584"
        />
      );
    } else {
      SuitableButton = (
        <Button
          title={"Next"}
          onPress={() => this.sendRestaurantDetails()}
          color="#841584"
        />
      );
    }
    console.log(this.state.restaurantName + " " + this.state.restaurantAddress);
    return (
      <View style={{ flex: 1, margin: 30, justifyContent: "center",backgroundColor: "rgb(242, 244, 247)"}}>
        <View style ={{ backgroundColor: "#fff" }}>
          <TextInput
            style={{ paddingBottom: 10, paddingLeft: 10 }}
            defaultValue={this.state.restaurantName}
            placeholder="Restaurant Name"
            onChangeText={RestaurantName =>
              this.setState({ restaurantName: RestaurantName })
            }
          />

          <TextInput
            style={{ paddingBottom: 10, paddingLeft: 10 }}
            defaultValue={this.state.restaurantEmail}
            placeholder="Email"
            onChangeText={RestaurantEmail =>
              this.setState({ restaurantEmail: RestaurantEmail })
            }
          />
          <TextInput
            style={{ paddingBottom: 10, paddingLeft: 10 }}
            placeholder="Address"
            defaultValue={this.state.restaurantAddress}
            onChangeText={RestaurantAdresss =>
              this.setState({ restaurantAddress: RestaurantAdresss })
            }
            onFocus={() => this.sendLocationAlert()}
          />

          <TextInput
            style={{ paddingBottom: 10, paddingLeft: 10, marginBottom: 60 }}
            keyboardType='numeric'
            defaultValue={this.state.restaurantContactNo}
            placeholder="Contact No"
            onChangeText={ContactNo =>
              this.setState({ restaurantContactNo: ContactNo })
            }
          />
          {SuitableButton}
        </View>
        <Modal
          animationType="fade"
          visible={this.state.searchModalVisible}
          onRequestClose={() => {
            alert("Modal has been closed.");
            this.setState({ searchModalVisible: false });
          }}
        >
          {this.renderSearchModal()}
        </Modal>
      </View>
    );
  }
}
