import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Image,
    Linking
} from 'react-native';
import ModalHeader from "../../components/ModalHeaderNavigationBar/modalHeaderNavigationBar";
import styles from "./style";
import MapView, { PROVIDER_GOOGLE, Marker } from "react-native-maps";
import HeaderImageScrollView, { TriggeringView } from 'react-native-image-header-scroll-view';
import Icon from "react-native-vector-icons/FontAwesome";
import * as Animatable from 'react-native-animatable';
import TouchableScale from "react-native-touchable-scale";
import { f, auth, storage, database } from "../../config/firebaseConfig";
export default class Post extends Component {

    constructor(props) {
        super(props);
        this.state = {
            latitude: null,
            longitude: null,
            region: null,
            showNavTitle: false,
            liked: false,
            post: [],
            loaded: false,
            id: null
        }
        this.mapRef = null;
    }
    componentDidMount = async () => {
        var params = this.props.navigation.state.params;
        console.log(params)
        if (params) {

            var that = this;
            let userId = f.auth().currentUser.uid;
            console.log(params.id)
            database.ref('posts').child(params.id).on('value', (function (snapshot) {
                const exist = (snapshot.val() != null);
                console.log(exist)
                if (exist) {
                    var data = snapshot.val();
                    console.log(data)
                    let region = {
                        latitude: data.longitude,
                        longitude: data.longitude,
                        latitudeDelta: 0.00922 * 1.5,
                        longitudeDelta: 0.00421 * 1.5
                    }
                    that.setState({
                        region: region,
                        image: data.image,
                        description: data.description,
                        animal: data.animalType,
                        longitude: data.longitude,
                        latitude: data.latitude,
                        loaded: true,
                    })
                    that.mapView.animateToRegion(region, 1000);
                    var postArray = that.state.post
                    database.ref('users').child(data.userId).once('value').then(function (snapshot) {
                        const exsists = (snapshot.val() != null);
                        if (exsists) {
                            var data = snapshot.val();
                            that.setState({
                                avatar: data.dp,
                                name: data.first_name + " " + data.last_name,
                                loaded: true,
                                region: region
                            })
                        }

                    })
                }

                console.log("inside pot " + that.state.post);

            }), function (errorObject) {
                console.log("The read failed: " + errorObject.code);
            });
        }
        // this.watchID = navigator.geolocation.getCurrentPosition((position) => {
        //     // Create the object to update this.state.mapRegion through the onRegionChange function           
        //     let region = {
        //         latitude: position.coords.latitude,
        //         longitude: position.coords.longitude,
        //         latitudeDelta: 0.00922 * 1.5,
        //         longitudeDelta: 0.00421 * 1.5
        //     }
        //     this.setState({
        //         region: region,                
        //     })

        // }, (error) => console.log(error));
        // this.check();
        // this.mapView.animateToRegion(this.state.region, 1000);
    }

    check = () => {


    }
    clickEventListener() {
        // Alert.alert("Success", "Product has beed added to cart")
        const { navigate } = this.props.navigation;
        navigate('Comment')
    }
    openMap = () => {
        var url = "https://www.google.com/maps/dir/?api=1&travelmode=driving&dir_action=navigate&destination=5.95492,80.554956"
        Linking.canOpenURL(url).then(supported => {
            if (!supported) {
                console.log('Can\'t handle url: ' + url);
            } else {
                return Linking.openURL(url);
            }
        }).catch(err => console.error('An error occurred', err));
    }
    navBar = () => {
        this.navTitleView.fadeInUp(200)
        this.setState({
            showNavTitle: true
        })
    }
    render() {
        return (
            <View style={styles.container}>
                <HeaderImageScrollView
                    maxHeight={200}
                    minHeight={50}
                    headerImage={{ uri: this.state.image }}
                    fadeOutForeground
                    style={{ marginBottom: 10 }}
                    // renderHeader={() => <Image source={require("../../images/dog.jpg")} style={styles.image} />}
                    // renderForeground={() => (
                    //     <View style={styles.titleContainer}>
                    //         <Text style={styles.imageTitle}>Dog</Text>
                    //     </View>
                    // )}

                    renderFixedForeground={() => (
                        <Animatable.View
                            style={{ height: 'auto', width: "100%" }}
                            ref={navTitleView => {
                                this.navTitleView = navTitleView;
                            }}
                        >
                            {this.state.showNavTitle == true ? (
                                <ModalHeader title="Post" onPress={() => this.props.navigation.goBack()} />
                            ) : (
                                    <TouchableOpacity>

                                    </TouchableOpacity>
                                )}

                        </Animatable.View>
                    )}
                >

                    <TriggeringView
                        onHide={() => this.navBar()}
                        onDisplay={() => this.navTitleView.fadeOut(200)}
                    >
                    </TriggeringView>
                    <View style={styles.topView}>
                        <View style={styles.informationArea}>
                            <Text style={styles.name}>{this.state.animal}</Text>
                            <Text style={styles.description}>
                                {this.state.description}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.topView}>

                        <MapView
                            style={styles.mapContainer}
                            provider={PROVIDER_GOOGLE}
                            initialRegion={{
                                latitude: this.state.latitude,
                                longitude: this.state.longitude,
                                latitudeDelta: 0.00922 * 1.5,
                                longitudeDelta: 0.00421 * 1.5,
                            }}
                            showsUserLocation={true}
                            loadingEnabled={true}
                            zoomControlEnabled={true}
                            showsMyLocationButton={true}
                            scrollEnabled={false}
                            ref={ref => { this.mapView = ref }}
                        >

                            {this.state.latitude != null && this.state.latitude != null ? (
                                <Marker
                                    coordinate={{
                                        latitude: this.state.latitude,
                                        longitude: this.state.longitude,
                                        latitudeDelta: 0.00922 * 1.5,
                                        longitudeDelta: 0.00421 * 1.5,
                                    }}
                                    title={"Here is the Animal"}

                                />

                            ) : (
                                    <View></View>
                                )}

                        </MapView>



                        <TouchableScale onPress={() => this.openMap()}
                            style={{
                                position: 'absolute',//use absolute position to show button on top of the map
                                top: '70%', //for center align
                                right: 5,
                                alignSelf: 'flex-end', //for align to right                                                               
                                width: 'auto',
                                borderRadius: 15,
                                paddingHorizontal: 10,
                                paddingVertical: 10,
                                backgroundColor: '#192f6a',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'row'
                            }}
                        >
                            <Icon name="compass" size={24} color={'#fff'} style={{ alignSelf: 'center' }} />
                            <Text style={{ color: '#fff', fontSize: 14, marginLeft: 2 }}> Get Direction</Text>
                        </TouchableScale>


                    </View>

                    <View style={styles.profile}>
                        <Image style={styles.avatar}
                            source={{ uri: this.state.avatar }} />

                        <Text style={styles.profileName}>
                            {this.state.name}
                        </Text>
                        <Text style={{ marginLeft: 20 }}>
                            5 hours ago
                         </Text>
                    </View>
                    <View style={styles.row}>
                        <View
                            style={styles.likeCommentArea}
                        >

                            {this.state.liked == false ? (
                                <TouchableOpacity style={[styles.row, { alignItems: 'flex-end' }]}>
                                    <Icon name="thumbs-up" size={24} />
                                </TouchableOpacity>
                            ) : (
                                    <TouchableOpacity style={[styles.row, { alignItems: 'flex-end' }]} >
                                        <Icon name="thumbs-up" size={24} color={COLOR_PRIMARY} />
                                    </TouchableOpacity>
                                )}


                        </View>

                        <View
                            style={styles.likeCommentArea}
                        >
                            <TouchableOpacity style={[styles.row, { alignItems: 'flex-start' }]} onPress={() => this.clickEventListener()}>
                                <Icon name="comment" size={24} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    {/* <View style={styles.starContainer}>
                        <Image style={styles.star} source={{ uri: "https://img.icons8.com/color/40/000000/star.png" }} />
                        <Image style={styles.star} source={{ uri: "https://img.icons8.com/color/40/000000/star.png" }} />
                        <Image style={styles.star} source={{ uri: "https://img.icons8.com/color/40/000000/star.png" }} />
                        <Image style={styles.star} source={{ uri: "https://img.icons8.com/color/40/000000/star.png" }} />
                        <Image style={styles.star} source={{ uri: "https://img.icons8.com/color/40/000000/star.png" }} />
                    </View>
                    <View style={styles.contentColors}>
                        <TouchableOpacity style={[styles.btnColor, { backgroundColor: "#00BFFF" }]}></TouchableOpacity>
                        <TouchableOpacity style={[styles.btnColor, { backgroundColor: "#FF1493" }]}></TouchableOpacity>
                        <TouchableOpacity style={[styles.btnColor, { backgroundColor: "#00CED1" }]}></TouchableOpacity>
                        <TouchableOpacity style={[styles.btnColor, { backgroundColor: "#228B22" }]}></TouchableOpacity>
                        <TouchableOpacity style={[styles.btnColor, { backgroundColor: "#20B2AA" }]}></TouchableOpacity>
                        <TouchableOpacity style={[styles.btnColor, { backgroundColor: "#FF4500" }]}></TouchableOpacity>
                    </View>
                    <View style={styles.contentSize}>
                        <TouchableOpacity style={styles.btnSize}><Text>S</Text></TouchableOpacity>
                        <TouchableOpacity style={styles.btnSize}><Text>M</Text></TouchableOpacity>
                        <TouchableOpacity style={styles.btnSize}><Text>L</Text></TouchableOpacity>
                        <TouchableOpacity style={styles.btnSize}><Text>XL</Text></TouchableOpacity>
                    </View> */}
                    <View style={styles.separator}></View>
                    <View style={styles.addToCarContainer}>
                        <TouchableOpacity style={styles.shareButton} onPress={() => this.clickEventListener()}>
                            <Text style={styles.shareButtonText}>I Will Handle</Text>
                        </TouchableOpacity>
                    </View>

                </HeaderImageScrollView>
                {/* <ModalHeader title="Post" onPress={() => this.props.navigation.goBack()} />
                <ScrollView style={styles.scroll}>
                    
                </ScrollView> */}
            </View>
        );
    }
}