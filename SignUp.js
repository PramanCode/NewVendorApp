import React, { Component } from "react";
import {
  AppRegistry,
  SectionList,
  StyleSheet,
  TextInput,
  Text,
  Button,
  View,
  Linking,
  event,
  AsyncStorage,
  ActivityIndicator
} from "react-native";
import * as firebase from "firebase";
import Toast from "react-native-simple-toast";
import { AuthSession } from "expo";
import { StackNavigator, SwitchNavigator } from "react-navigation";
//Firebase configuration needed to connect to firebase
const FB_APP_ID = "672636582940821";
var configFirebase = {
  apiKey: "AIzaSyC1fag_6lj8p4Y40uheN59_MerglW6ubGA",
  authDomain: "majorproject-abd0f.firebaseapp.com",
  databaseURL: "https://majorproject-abd0f.firebaseio.com",
  projectId: "majorproject-abd0f",
  storageBucket: "majorproject-abd0f.appspot.com",
  messagingSenderId: "624422366265"
};
export default class SignUp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      isLoading: false
    };
    this.makeConnection = this.makeConnection.bind(this);
    this.checkSignUpForm = this.checkSignUpForm.bind(this);
    this._handlePressAsync = this._handlePressAsync.bind(this);
    this.loginWithFacebook = this.loginWithFacebook.bind(this);
    //connecting to firebase
  }
  static navigationOptions = {title: "SignUp"};
  makeConnection() {
    var firebaseDatabase = firebase.database();
    //setting authorisation login state on firebase
    this.setState({ isLoading: true });
    firebase
      .auth()
      .setPersistence(firebase.auth.Auth.Persistence.LOCAL)
      .then(() => {
        //after setting authorisation it will create user auth credentials and returns the promise
        firebase
          .auth()
          .createUserWithEmailAndPassword(this.state.email, this.state.password)
          .then(async () => {
            //after user creation we set its local login state to true
            try {
              await AsyncStorage.setItem("@loginState:key", "true");
            } catch (error) {
              // Error saving data
            }
          })
          .then(() => {
            //after setting local login state it will send user details to users database and subsequently navigates to app
            var user = firebase.auth().currentUser;
            var userKey = user.uid;
            //var userKey = firebaseDatabase.ref("users").push().key;
            console.log("user key :" + userKey);
            firebaseDatabase.ref("users/").update({
              [userKey]: {
                FirstName: this.state.firstName,
                LastName: this.state.lastName,
                Email: this.state.email,
                Password: this.state.password,
                User: "Vendor",
                restaurantKey: ""
              }
            });
            return userKey;
          })
          .then(userKey =>
            this.props.navigation.navigate("Details", { userKey: userKey })
          )
          .catch(error => console.log(error))
          .catch(error => console.log(error));
      })
      .catch(error => {
        console.log(error);
      })
      .catch(error => {
        // Firebase connection error
        alert("Email id already exists");
        this.setState({ isLoading: false });
      });
  }
  checkSignUpForm() {
    if (this.state.firstName == "") {
      Toast.show("First Name Cannot Be Empty");
      return;
    }
    if (this.state.lastName == "") {
      Toast.show("Last Name Cannot Be Empty");
      return;
    }
    if (this.state.email.length == 0) {
      Toast.show("Email cannot be empty");
      return;
    }
    var emailFormat = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
    if (emailFormat.test(this.state.email) == false) {
      Toast.show("Email format should be correct");
      return;
    }
    if (this.state.password.length < 6) {
      Toast.show("Password length should be atleast 6 characters");
      return;
    }
    this.makeConnection();
  }

  _handlePressAsync = async () => {
    let redirectUrl = AuthSession.getRedirectUrl();

    // You need to add this url to your authorized redirect urls on your Facebook app
    console.log({ redirectUrl });

    // NOTICE: Please do not actually request the token on the client (see:
    // response_type=token in the authUrl), it is not secure. Request a code
    // instead, and use this flow:
    // https://developers.facebook.com/docs/facebook-login/manually-build-a-login-flow/#confirm
    // The code here is simplified for the sake of demonstration. If you are
    // just prototyping then you don't need to concern yourself with this and
    // can copy this example, but be aware that this is not safe in production.

    let result = await AuthSession.startAsync({
      authUrl:'https://www.facebook.com/v2.8/dialog/oauth?response_type=token'+'&client_id=${1979415675426131}'+'&redirect_uri=${encodeURIComponent("https://majorproject-abd0f.firebaseapp.com/__/auth/handler")}'});

    if (result.type !== "success") {
      alert("Uh oh, something went wrong");
      return;
    }

    let accessToken = result.params.access_token;
    let userInfoResponse = await fetch(
      `https://graph.facebook.com/me?access_token=${accessToken}&fields=id,name,picture.type(large)`
    );
    const userInfo = await userInfoResponse.json();
    this.setState({ userInfo });
  };

  async loginWithFacebook() {
    //ENTER YOUR APP ID
    const { type, token } = await Expo.Facebook.logInWithReadPermissionsAsync(
      "1979415675426131",
      { permissions: ["public_profile"] }
    );

    if (type == "success") {
      // var userinfo = firebase.auth.fetchSignInMethodsForEmail();
      //console.log(userInfoResponse.json().email);
      const credential = firebase.auth.FacebookAuthProvider.credential(token);
      console.log(credential);
      var userKey = await firebase
        .auth()
        .signInWithCredential(credential)
        .then(() => {
          //after setting local login state it will send user details to users database and subsequently navigates to app

          let user = firebase.auth().currentUser;
          let userKey = user.uid;
          return userKey;
        })
        .catch(error => {
          console.log(error);
        });

      let userInfoResponse = await fetch(
        `https://graph.facebook.com/me?access_token=${token}&fields=id,first_name,last_name,email`
      );
      const userInfo = await userInfoResponse.json().then(userInfo => {
        firebase
          .auth()
          .fetchSignInMethodsForEmail(userInfo.email)
          .then(userStatus => {
            if (userStatus[0] == null) {
              //console.log("user key6"+userKey);
              firebase
                .database()
                .ref("users/")
                .update({
                  [userKey]: {
                    FirstName: userInfo.first_name,
                    LastName: userInfo.last_name,
                    Email: userInfo.email,
                    Password: "123456",
                    User: "Vendor"
                  }
                });
              this.props.navigation.navigate("Details", { userKey: userKey });
            } else {
              console.log(userKey);
              firebase
                .database()
                .ref("/users/" + userKey + "/restaurantKey")
                .once("value")
                .then(function(snapshot) {
                  console.log(
                    "snapshot value" + JSON.stringify(snapshot.val())
                  );
                  console.log(
                    "login : restaurantKey key inside" + snapshot.val()
                  );
                  console.log();
                  var restaurantKey = snapshot.val();
                  if (restaurantKey == "") {
                    console.log("is null");
                    return 0;
                  } else {
                    console.log("not null");
                    return restaurantKey;
                  }
                })
                .then(restaurantKey => {
                  if (restaurantKey == 0 || restaurantKey == null) {
                    console.log("final check null" + userKey);
                    this.props.navigation.navigate("Details", {
                      userKey: userKey
                    });
                  } else {
                    console.log("final check" + restaurantKey);
                    this.props.navigation.navigate("Items", {
                      restaurantKey: restaurantKey
                    });
                  }
                })
                .catch(error => console.log(error));
            }
          })

          .catch(error => console.log(error));
      });
      //var userKey = firebaseDatabase.ref("users").push().key;
    } else {
      console.log("its an error");
    }
  }

  render() {
    //SignUp Form Starts Here
    if (this.state.isLoading) {
      return <ActivityIndicator />;
    }
    return (
      <View style={{ flex: 1, marginBottom: 50 }}>
        <View
          style={{
            flex: 1,
            margin: 30,
            backgroundColor: "#fff",
            justifyContent: "center"
          }}
        >
          <TextInput
            style={{ paddingBottom: 10, paddingLeft: 10 }}
            placeholder="First Name"
            value={this.state.firstName}
            onChangeText={FirstName => this.setState({ firstName: FirstName })}
          />

          <TextInput
            style={{ paddingBottom: 10, paddingLeft: 10 }}
            placeholder="Last Name"
            onChangeText={LastName => this.setState({ lastName: LastName })}
          />

          <TextInput
            style={{ paddingBottom: 10, paddingLeft: 10 }}
            placeholder="Email"
            onChangeText={Email => this.setState({ email: Email })}
          />

          <TextInput
            style={{ paddingBottom: 10, paddingLeft: 10, marginBottom: 60 }}
            secureTextEntry={true}
            ref={this.passwordTextInput}
            placeholder="Password"
            onChangeText={pass => this.setState({ password: pass })}
          />

          <Button
            onPress={() => this.checkSignUpForm()}
            title="SignUp"
            color="#841584"
          />
          <Button
            title="FB SignUp/Login"
            onPress={() => this.loginWithFacebook()}
          />
        </View>
        <View style={{ marginLeft: 75, marginRight: 75, marginBottom: 20 }}>
          <Button
            onPress={() => this.props.navigation.navigate("Login")}
            title="Login Here!"
            color="#841584"
            accessibilityLabel="Learn more about this purple button"
          />
        </View>
      </View>
    );
  }
}
