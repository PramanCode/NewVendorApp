import React, { Component } from "react";
import {
  AppRegistry,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  Button,
  View,
  TouchableOpacity,
  Picker,
  Modal,
  TouchableHighlight,
  TouchableWithoutFeedback,
  Switch,
  NativeModules, 
  findNodeHandle 
} from "react-native";
//import makeConnection from './Connection';
import { StackNavigator } from "react-navigation";
import HeaderButtons from "react-navigation-header-buttons";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import Alert from "Alert";
import firebase from "firebase";

const UIManager = NativeModules.UIManager;

export default class ItemsList extends Component {

  onMenuPressed = (labels) => {
    const { onPress } = this.props;

    UIManager.showPopupMenu(
      findNodeHandle(this.menu),
      labels,
      () => {},
      (result, index) => {
        if (onPress) {
          onPress({ action: 'menu', result, index });
        }
      },
    );
  };

  static navigationOptions = ({ navigation }) => {
    const { labels } = ["Edit","Create","Sign Out"];
    return {
      headerRight: (
        <View>
          <MaterialIcons
            name="more-vert"
            onPress={() => this.onMenuPressed(labels)}
            style={{ marginRight: 10, color: 'white' }}
            size={30}
          />
          {/* <HeaderButtons
            IconComponent={Ionicons}
            OverflowIcon={<MaterialIcons name="more-vert" size={23} />}
            iconSize={23}
            color="blue"
          >
            <HeaderButtons.Item
              title="Edit Restaurant"
              show="never"
              onPress={() =>
                navigation.navigate("Details", {
                  restaurantKey: navigation.getParam("restaurantKey")
                })
              }
            />
            <HeaderButtons.Item
              title="Create Category"
              onPress={() => navigation.state.params.categoryModalHandler()}
            />
            <HeaderButtons.Item
              title="Sign Out"
              onPress={() => navigation.state.params.signOutHandler()}
              show="never"
            />
            <HeaderButtons.Item
              title="Toggle Restaurant"
              onPress={() => navigation.state.params.toggleRestaurant()}
              show="never"
            />
          </HeaderButtons> */}
        </View>
      )
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      categoryModalVisible: false,
      categoryOptionsModalVisible: false,
      updateCategoryModalVisible: false,
      deleteCategoryModalVisible: false,
      itemModalVisible: false,
      categoryArr: []
    };
    this.categoryName = "";
    this.categoryKey = "";
    this.fetchCategoryArr = this.fetchCategoryArr.bind(this);
    this.renderCategoryModal = this.renderCategoryModal.bind(this);
    this.addCategory = this.addCategory.bind(this);
    this.categoryModalHandler = this.categoryModalHandler.bind(this);
   
    this.categoryDetailPage = this.categoryDetailPage.bind(this);
    this.categoryOptionsModalHandler = this.categoryOptionsModalHandler.bind(
      this
    );
    this.renderCategoryOptionsModal = this.renderCategoryOptionsModal.bind(
      this
    );
    this.renderUpdateCategoryModal = this.renderUpdateCategoryModal.bind(this);
    this.renderDeleteCategoryModal = this.renderDeleteCategoryModal.bind(this);
    this.updateCategoryModalHandler = this.updateCategoryModalHandler.bind(
      this
    );
    this.deleteCategoryModalHandler = this.deleteCategoryModalHandler.bind(
      this
    );
    this.updateCategoryName = this.updateCategoryName.bind(this);
    this.deleteCategory = this.deleteCategory.bind(this);
    this.toggleCategory = this.toggleCategory.bind(this);
    this.toggleRestaurant = this.toggleRestaurant.bind(this);
    this.props.navigation.setParams({
      
      signOutHandler: this.signOutHandler.bind(this),
      toggleRestaurant: this.toggleRestaurant.bind(this),
      categoryModalHandler: this.categoryModalHandler.bind(this)
    });
    this.restaurantKey = this.props.navigation.getParam("restaurantKey");
    this.fetchCategoryArr().then(catArr => {
      this.setState({ categoryArr: catArr });
    });
  }

  signOutHandler() {
    firebase
      .auth()
      .signOut()
      .then(() => {
        this.props.navigation.navigate("Login");
      });
  }

  async toggleRestaurant() {
    await firebase
      .database()
      .ref("/Restaurants/" + this.restaurantKey + "/Available")
      .once("value")
      .then(snapshot => {
        firebase
          .database()
          .ref()
          .update({
            ["/Restaurants/" +
            this.restaurantKey +
            "/Available"]: !snapshot.val()
          })
          .then(() => {
            if (snapshot.val() == true) {
              Alert.alert(
                "Restaurant availability status",
                "Restaurant has been turned off",
                [{ text: "OK", onPress: () => console.log("OK Pressed") }],
                { cancelable: false }
              );
            } else {
              Alert.alert(
                "Restaurant availability status",
                "Restaurant has been turned on",
                [{ text: "OK", onPress: () => console.log("OK Pressed") }],
                { cancelable: false }
              );
            }
          });
      });
  }

  //renders the category modal page
  renderCategoryModal() {
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
            height:200,
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
            placeholder="Category Name"
            onChangeText={category => {
              this.categoryName = category;
            }}
          />
          <Button title={"Add Category"} onPress={e => this.addCategory(e)}  />
          <View style={{margin:10}}>
            <Button title ={"Cancel"} onPress={e => this.setState({categoryModalVisible:false})}/>
          </View>
        </View>
      </View>
    );
  }
  //add category to the category array
  addCategory(e) {
    e.preventDefault();
    console.log("categoryName " + this.categoryName);
    var fdatabase = firebase.database();
    this.categoryKey = fdatabase
      .ref("/Restaurants/" + this.restaurantKey + "/Categories")
      .push().key;
    //restaurant key under which category is to be created
    this.restaurantKey = this.props.navigation.getParam("restaurantKey");
    console.log("restaurantKey" + this.restaurantKey);
    //category get created under that restaurant in firebase
    var updates = {};
    updates[
      "/Restaurants/" +
        this.restaurantKey +
        "/Categories/" +
        this.categoryKey +
        "/categoryName"
    ] = this.categoryName;
    updates[
      "/Restaurants/" +
        this.restaurantKey +
        "/Categories/" +
        this.categoryKey +
        "/categoryAvailable"
    ] = true;
    fdatabase.ref().update(updates);
    //create category object
    this.state.categoryArr.push({
      categoryKey: this.categoryKey,
      categoryName: this.categoryName,
      categoryAvailable: true
    });
    console.log("categoryKey:" + this.categoryKey);
    this.setState({
      categoryModalVisible: false,
      categoryArr: this.state.categoryArr,
    });
  }
  //set the visibility of category modal page
  categoryModalHandler(e) {
    //e.preventDefault();
    this.setState({
      categoryModalVisible: true
    });
  }
  //set the visibility of the entity type selection modal
  
  //renders the entity type selection modal
  /**/
  

  //check for updated data being sent to firebase as aa promise.
  categoryDetailPage(e, categoryKey, categoryName) {
    e.preventDefault();
    //restaurantKey = this.props.navigation.getParam("restaurantKey");
    this.props.navigation.navigate("ItemsDetails", {
      restaurantKey: this.restaurantKey,
      categoryKey: categoryKey,
      categoryName: categoryName
    });
  }

  //Toggle category availability
  toggleCategory(i) {
    //a.categoryAvailable=!a.categoryAvailable;
    let catArrState = this.state.categoryArr;
    catArrState[i].categoryAvailable = !this.state.categoryArr[i]
      .categoryAvailable;
    firebase
      .database()
      .ref(
        "/Restaurants/" +
          this.props.navigation.getParam("restaurantKey") +
          "/Categories/" +
          catArrState[i].categoryKey
      )
      .update({ categoryAvailable: catArrState[i].categoryAvailable })
      .then(() => this.setState({ categoryArr: catArrState }))
      .catch(error => console.log(error));
    console.log(
      "key and category while rendering " +
        this.state.categoryArr[i].categoryName +
        " " +
        catArrState[i].categoryAvailable
    );
  }

  async fetchCategoryArr() {
    console.log("restaurantKey fetch" + this.restaurantKey);
    return firebase
      .database()
      .ref("/Restaurants/" + this.restaurantKey + "/Categories")
      .once("value")
      .then(function(snapshot) {
        var catArr = [];
        /*Object.keys(snapshot.val()).forEach(function(key){
                catArr.push(key);
                console.log(key.categoryName);
              })*/
        if (snapshot.val() == null) {
          return [];
        }
        Object.keys(snapshot.val()).forEach(function(key) {
          let element = snapshot.val()[key];
          element.categoryKey = key;
          catArr.push(element);
        });
        console.log("catArr length " + catArr.length);
        catArr.forEach(function(a) {
          console.log(JSON.stringify(a));
        });
        return catArr;
      });
  }

  categoryOptionsModalHandler(e, categoryName, categoryKey) {
    this.categoryName = categoryName;
    this.categoryKey = categoryKey;
    //e.preventDefault();
    this.setState({
      categoryOptionsModalVisible: !this.state.categoryOptionsModalVisible
    });
  }

  updateCategoryModalHandler(e) {
    //e.preventDefault();
    this.setState({
      updateCategoryModalVisible: !this.state.updateCategoryModalVisible
    });
  }

  deleteCategoryModalHandler(e) {
    //e.preventDefault();
    this.setState({
      deleteCategoryModalVisible: !this.state.deleteCategoryModalVisible,
      categoryOptionsModalVisible: false
    });
  }

  renderCategoryOptionsModal() {
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
            height:200,
            paddingBottom:70,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 4,
            borderColor: "#888",
            borderRadius: 10,
            backgroundColor: "#fff"
          }}
        >
          <TouchableOpacity onPress={e => this.updateCategoryModalHandler(e)} >
            <View><Text>Update Category Name</Text></View>
          </TouchableOpacity>

          <TouchableOpacity onPress={e => this.deleteCategoryModalHandler(e)}>
            <Text>Delete Category</Text>
          </TouchableOpacity>
          
          <View style={{margin:10}}>
            <Button title ={"Cancel"} onPress={e => this.setState({categoryOptionsModalVisible:false})}/>
          </View>
        </View>
      </View>
    );
  }

  updateCategoryName(prevName) {
    firebase
      .database()
      .ref(
        "/Restaurants/" + this.restaurantKey + "/Categories/" + this.categoryKey
      )
      .update({ categoryName: this.categoryName })
      .then(() => {
        this.fetchCategoryArr().then(catArr => {
          this.setState({
            categoryArr: catArr,
            categoryOptionsModalVisible: false,
            updateCategoryModalVisible: false
          });
        });
      })
      .catch(error => {
        console.log(error);
        this.categoryName = prevName;
        this.updateCategoryModalHandler();
      });
  }

  deleteCategory() {
    firebase
      .database()
      .ref(
        "/Restaurants/" + this.restaurantKey + "/Categories/" + this.categoryKey
      )
      .remove()
      .then(e => {
        this.deleteCategoryModalHandler(e);
        this.fetchCategoryArr().then(catArr => {
          this.setState({
            categoryArr: catArr,
            categoryOptionsModalVisible: false,
            updateCategoryModalVisible: false
          });
        });
      })
      .catch(error => {
        console.log(error);
        alert("fail");
        this.deleteCategoryModalHandler();
      });
  }

  renderUpdateCategoryModal() {
    let currentCategoryName = this.categoryName;
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
            height:200,
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
            defaultValue={this.categoryName}
            onChangeText={category => {
              this.categoryName = category;
            }}
          />
          <Button title={"Update Category"}
            onPress={() => {
              this.updateCategoryName(currentCategoryName);
              this.setState({categoryOptionsModalVisible:false})
            }}  />
          <View style={{margin:10}}>
            <Button title ={"Cancel"} onPress={e => this.setState({updateCategoryModalVisible:false,categoryOptionsModalVisible:false})}/>
          </View>
        </View>
      </View>
      
    );
  }

  renderDeleteCategoryModal() {
    
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
            height:200,
            paddingBottom:70,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 4,
            borderColor: "#888",
            borderRadius: 10,
            backgroundColor: "#fff"
          }}
        >
          <Text>Are You Sure</Text>
          <View style={{marginTop:20}}>
          <Button
            title="Delete"
            onPress={e => {
              this.deleteCategory();
            }}
          />
          </View>
          <View style={{marginTop:20}}>
          <Button
            title="Cancel"
            onPress={e => this.deleteCategoryModalHandler()}
          />
          </View>
        </View>
      </View>
    );
  }

  render() {
    console.log("Array length" + this.state.categoryArr.length);

    var Arr = this.state.categoryArr.map((a, i) => {
      return (
        <View
          key={a.categoryKey}
          style={{ borderBottomWidth: 2, borderBottomColor: "#ededed" }}
        >
          <View>
            <TouchableWithoutFeedback
              onPress={e => {
                this.categoryDetailPage(e, a.categoryKey, a.categoryName);
              }}
              onLongPress={e => {
                this.categoryOptionsModalHandler(
                  e,
                  a.categoryName,
                  a.categoryKey
                );
              }}
              disabled={!a.categoryAvailable}
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
                  {a.categoryName}
                </Text>
                <Switch
                  onValueChange={() => this.toggleCategory(i)}
                  value={this.state.categoryArr[i].categoryAvailable}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </View>
      );
    });

    return (
      <View>
        {Arr}
        

        <Modal
          animationType="fade"
          transparent={true}
          visible={this.state.categoryModalVisible}
          onRequestClose={e => {
            this.categoryModalHandler(e);
          }}
        >
          {this.renderCategoryModal()}
        </Modal>
        <Modal
          animationType="fade"
          transparent={true}
          visible={this.state.categoryOptionsModalVisible}
          onRequestClose={e => {
            this.categoryOptionsModalHandler(e);
          }}
        >
          {this.renderCategoryOptionsModal()}
        </Modal>
        <Modal
          animationType="fade"
          transparent={true}
          visible={this.state.updateCategoryModalVisible}
          onRequestClose={e => {
            this.updateCategoryModalHandler(e);
          }}
        >
          {this.renderUpdateCategoryModal()}
        </Modal>
        <Modal
          animationType="fade"
          transparent={true}
          visible={this.state.deleteCategoryModalVisible}
          onRequestClose={e => {
            this.deleteCategoryModalHandler(e);
          }}
        >
          {this.renderDeleteCategoryModal()}
        </Modal>
      </View>
    );
  }
}
