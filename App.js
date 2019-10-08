import React from 'react';
import { StyleSheet, Text, View, AsyncStorage, ActivityIndicator } from 'react-native';
import {createStackNavigator} from "react-navigation-stack";
import {createSwitchNavigator, createAppContainer } from "react-navigation";
import firebase from "firebase";
//We have to import all files that are gonna use in this file for navigation.
import SignUp from "./SignUp";
import Login from "./Login";
import RestaurantDetails from "./RestaurantDetails";
import ItemsList from "./ItemsList";
import ItemsDetailsPage from "./ItemsDetailsPage";
import OrdersList from "./OrdersList";

//Entry Stack for logging  in old and new user. After entry stack, switch navigation happens and you can't go back. Except through buttons and drawers.

const configFirebase = {
  apiKey: "AIzaSyC1fag_6lj8p4Y40uheN59_MerglW6ubGA",
  authDomain: "majorproject-abd0f",
  databaseURL: "https://majorproject-abd0f.firebaseio.com/",
  storageBucket: "gs://majorproject-abd0f.appspot.com/"
};

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const EntryStack = createStackNavigator(
  {
    SignUp: {
      screen: SignUp
    },
    Login: {
      screen: Login
    }
  },
  {
    initialRouteName: "SignUp"
  }
);

//Restaurant Stack for already logged in user.
const ItemsStack = createStackNavigator(
  {
    Items: {
      screen: ItemsList
    },
    ItemsDetails: {
      screen: ItemsDetailsPage
    },
    OrdersList:{
      screen: OrdersList
    }
  },
  {
    initialRouteName: "Items"
  }
);



//RootStack to create switch navigation for all three stacks.
const RootStack = createSwitchNavigator(
    {
      App: ItemsStack,
      Auth: EntryStack,
      Details: {
        screen: RestaurantDetails,
      }
    },
    {
      initialRouteName: "Auth"
    }
  );

const AppContainer = createAppContainer(RootStack);

export default class App extends React.Component {

  constructor(props) {
    super(props);
    this.openAppropriateScreen = this.openAppropriateScreen.bind(this);
    this.state = { taskCompleted: false, loginState: false };
    var res = firebase.initializeApp(configFirebase);
    console.log(res);
    var user;
}

async openAppropriateScreen() {
    //promises to set the expected first screen by returning the loginState of a user
    var loginState = false;
    user = firebase.auth().currentUser;
    if (user != null) {
      loginState = true;
    }
    //if condition to check whether user is coming first time or not
    //setting user state to false as he didn't signed up yet
    const setItem = await AsyncStorage.setItem(
      "@loginState:key",
      loginState.toString()
    );
    return loginState;
}

  render() {

    if (!this.state.taskCompleted) {
      this.openAppropriateScreen().then(loginState => {
        //loginState has been fetched and now we will re-render the component by resetting states
        this.setState({ taskCompleted: true, loginState: loginState });
      });
      return (
        <View style={{ justifyContent: "center", flex: 1 }}>
          <ActivityIndicator />
        </View>
      );
    } else {
      if (this.state.loginState) {
        userKey = user.uid;
        restaurantKey = firebase
          .database()
          .ref("/users/" + userKey + "/restaurantKey")
          .once("value")
          .then(function (snapshot) {
            restaurantKey = snapshot.val();
            console.log("login : restaurantKey key inside" + restaurantKey);
            return restaurantKey;
          });
        const Items = ItemsStack;
        return <Items restaurantKey={restaurantKey} />;
      }
      
      return <AppContainer />;

      return (
        <View style={styles.container}>
          <Text>Open up App.js to start working on your app!</Text>
        </View>
      );
    }
  }
}
