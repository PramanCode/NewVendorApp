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
import firebase from "firebase";
export default class Login extends Component {
	static navigationOptions = {title: "Login"};
	constructor(props) {
	    super(props);
	    this.state = { email: "", password: "", isLoading: false };
	    this.checkLoginCredentials = this.checkLoginCredentials.bind(this);
	    this.userKey;
	  }
  	async checkLoginCredentials() {
	    var user = firebase.auth().currentUser;
	    this.setState({ isLoading: true });
	    //console.log("here + " + user.uid.toString());
	    try {
				try {
					const user_1 = await firebase
						.auth()
						.signInWithEmailAndPassword(this.state.email, this.state.password);
					console.log("here 2");
					var restaurantKey_1;
					if (user_1) {
						console.log(user_1.user.uid);
						this.userKey = user_1.user.uid;
						console.log("Login : user key" + this.userKey);
						var restaurantKey;
						restaurantKey_1 = await firebase
							.database()
							.ref("/users/" + this.userKey + "/restaurantKey")
							.once("value")
							.then(function (snapshot) {
								restaurantKey = snapshot.val();
								console.log("login : restaurantKey key inside" + restaurantKey);
								return restaurantKey;
							});
					}
					else {
						console.log("login doesn't exists");
					}
			
					console.log("restaurantKey on login" + restaurantKey_1);
					if (restaurantKey_1 == "") {
						console.log("usery key on login" + this.userKey);
						this.props.navigation.navigate("Details", { userKey: this.userKey });
					}
					else {
						if (restaurantKey_1 == "" || restaurantKey_1 == null) {
							this.props.navigation.navigate("Details", { "userKey": this.userKey });
						}
						else {
							this.props.navigation.navigate("Items", {
								restaurantKey: restaurantKey_1
							});
						}
					}
				}
				catch (error) {
					// Handle Errors here.
					var errorCode = error.code;
					var errorMessage = error.message;
					alert("Invalid Credentials");
					this.setState({ isLoading: false });
					console.log(error);
				}
			}
			catch (error_1) {
				console.log(error_1);
			}
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
