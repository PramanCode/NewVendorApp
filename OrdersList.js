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
    findNodeHandle,
    FlatList
} from "react-native";
import firebase from "firebase";


export default class OrdersList extends React.Component {

    constructor(props) {
        super(props);
        this.fetchOrders = this.fetchOrders.bind(this);
        this.restaurantKey = this.props.navigation.getParam('restaurantKey');
        this.state = {
            ordersArray: []
        }
    }

    componentDidMount() {
        this.fetchOrders();
    }

    fetchOrders() {
        console.log('fetching order');
        var ordersArray = [];
        firebase.database().ref("/Restaurants/" +
            this.restaurantKey + "/Orders/").once("value")
            .then(snapshot => {
                snapshot.forEach((element) => {
                    var order = [];
                    element.forEach((item) => {
                        var newItem = new Map();
                        newItem.set('itemName', item.val()['itemName']);
                        newItem.set('itemPrice', item.val()['itemPrice']);
                        newItem.set('itemQuantity', item.val()['itemQuantity']);
                        order.push(newItem);
                    });
                    ordersArray.push(order);
                });
                console.log(ordersArray);
                this.setState({ ordersArray: ordersArray });
            })
            .catch(err => console.log('err: ' + err));
    }

    render() {

        return (
            <View>
                <Text>Order Summary</Text>
                <FlatList
                    data={this.state.ordersArray}
                    renderItem={(orderObj) => {
                        //var order = item;
                        return (
                            <View>
                                <FlatList
                                    data={orderObj.item}
                                    renderItem={(itemObj) => {
                                        var foodItem = itemObj.item;
                                        return (
                                            <View style={{ flexDirection: 'row' }}>
                                                <Text style={{ margin: 10 }}>{foodItem.get('itemName')}</Text>
                                                <Text style={{ margin: 10 }}>{foodItem.get('itemPrice')}</Text>
                                                <Text style={{ margin: 10 }}>X</Text>
                                                <Text style={{ margin: 10 }}>{foodItem.get('itemQuantity')}</Text>
                                                <Text style={{ margin: 10 }}>{parseInt(foodItem.get('itemPrice')) * foodItem.get('itemQuantity')}</Text>
                                            </View>
                                        )
                                    }}
                                    keyExtractor={(itemObj, index) => index.toString()}
                                />
                            </View>
                        );
                    }}
                    keyExtractor={(orderObj, index) => index.toString()}
                />
            </View>
        );
    }
}