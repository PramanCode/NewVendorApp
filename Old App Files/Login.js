import React, { Component } from "react";
import {
  AppRegistry,
  SectionList,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  TextInput,
  Button
} from "react-native";
//import makeConnection from './Connection';
import { createStackNavigator } from "react-navigation";
import * as firebase from "firebase";
export default class Login extends Component {
	static navigationOptions = {title: "Login"};
	constructor(props) {
	    super(props);
	    this.state = { email: "", password: "", isLoading: false };
	    this.checkLoginCredentials = this.checkLoginCredentials.bind(this);
	    this.userKey;
	  }
  	checkLoginCredentials() {
	    var user = firebase.auth().currentUser;
	    this.setState({ isLoading: true });
	    //console.log("here + " + user.uid.toString());
	    return firebase
	      .auth()
	      .signInWithEmailAndPassword(this.state.email, this.state.password)
	      .then(user => {
	        console.log("here 2");
	        if (user) {
	          this.userKey = user.uid;
	          console.log("Login : user key" + this.userKey);
	          var restaurantKey;
	          return firebase
	            .database()
	            .ref("/users/" + this.userKey + "/restaurantKey")
	            .once("value")
	            .then(function(snapshot) {
	              restaurantKey = snapshot.val();
	              console.log("login : restaurantKey key inside" + restaurantKey);
	              return restaurantKey;
	            });
	        } else {
	          console.log("login doesn't exists");
	        }
	      })
	      .then(restaurantKey => {
	        console.log("restaurantKey on login" + restaurantKey);
	        
	        if (restaurantKey == "") {
	        	console.log("usery key on login"+this.userKey);
	          this.props.navigation.navigate("Details", { userKey: this.userKey });
	        } else {
	          if (restaurantKey == "" || restaurantKey == null) {
	          	
	            this.props.navigation.navigate("Details", { "userKey": this.userKey });
	          } else {
	            this.props.navigation.navigate("Items", {
	              restaurantKey: restaurantKey
	            });
	          }
	        }
	      })
	      .catch((error) => {
	        // Handle Errors here.
	        var errorCode = error.code;
	        var errorMessage = error.message;
	        alert("Invalid Credentials");
	        this.setState({isLoading:false});
	        console.log(error);
	      })
	      .catch(function(error) {
	        console.log(error);
	      });
	  }
  	render() {
	    if (this.state.isLoading) {
	      return (
	        <View>
	          <ActivityIndicator />
	        </View>
	      );
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
	            onPress={e => {
	              this.checkLoginCredentials();
	            }}
	            title="Login"
	            color="#841584"
	          />
	        </View>
	        <View style={{ marginLeft: 75, marginRight: 75, marginBottom: 20 }}>
	          <Button
	            onPress={() => this.props.navigation.goBack()}
	            title="SignUp Here!"
	            color="#841584"
	            accessibilityLabel="Learn more about this purple button"
	          />
	        </View>
	      </View>
	    );
	  }
}
