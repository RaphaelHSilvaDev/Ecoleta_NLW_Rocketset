import React, { useEffect, useState } from 'react';
import Constants from 'expo-constants';
import { Feather as Icon } from '@expo/vector-icons';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import MapView, { Marker} from 'react-native-maps';
import { SvgUri } from 'react-native-svg';
import Emoji from 'react-native-emoji';
import api from '../services/api';
import * as Location from 'expo-location';

interface Item{
    id: number,
    title: string,
    image_url: string
}

interface Point{
  id: number,
  Image: string,
  image_url: string,
  name: string,
  latitude: number,
  longitude: number,
}

interface Params{
  selectedUf: string,
  selectedCity: string
}


const Points = () => {
    const navigation = useNavigation();
    const rout = useRoute();
    const [items, setItems] = useState<Item[]>([]);
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [initilPosition, setInitialPosition] = useState<[number, number]>([0, 0]);
    const [points, setPoints] = useState<Point[]>([]);
    const routParams = rout.params as Params;

    useEffect(() =>{
        api.get('items').then(response => {
            setItems(response.data);
        })
    },[]);

    useEffect(() => {
      async function loadPosition(){
        const { status } = await Location.requestPermissionsAsync();

        if(status !== "granted"){
          Alert.alert('Oooops...', 'Precisamos de sua localização para mostrar os pontos!');
          return;
        }

        const location = await Location.getCurrentPositionAsync();

        const {latitude, longitude } = await location.coords;

        setInitialPosition([
          latitude,
          longitude
        ])
      }
      loadPosition();
    },[])

    useEffect(() => {
      api.get('points',{
      params:{
        city: routParams.selectedCity,
        uf: routParams.selectedUf,
        items: selectedItems
      }}).then(response => {
        setPoints(response.data);
      })
    },[selectedItems])

    function handleSelectItem(id: number){
      const alreadySelected = selectedItems.findIndex(item => item === id);

      if(alreadySelected >= 0){
        const filterItems = selectedItems.filter(item => item !== id);
        setSelectedItems(filterItems);
      }else{
        setSelectedItems([...selectedItems, id]);
      }
    }

    function handleBackToHome(){
        navigation.goBack();
    }

    function handNavigatorToDetail(id: number){
        navigation.navigate('Detail', {point_id: id});
    }

    return (
    <>
    <View style={styles.container}>
        <TouchableOpacity onPress={handleBackToHome}>
            <Icon name="arrow-left" size={20} color="#34cb79"/>
        </TouchableOpacity>
        <Text style={styles.title}><Emoji name="smiley" style={{fontSize: 20}}/> Bem vindo.</Text>
        <Text style={styles.description}>Encontre no mapa um ponto de coleta!</Text>
        <View style={styles.mapContainer}>
           {initilPosition[0] !== 0 && (
              <MapView style={styles.map}
              loadingEnabled={initilPosition[0] === 0}
              initialRegion={{
                  latitude: initilPosition[0],
                  longitude: initilPosition[1],
                  latitudeDelta: 0.014,
                  longitudeDelta: 0.014
              }}
              >
              {points.map(item =>(
                <Marker 
                  key = {String(item.id)}
                  style={styles.mapMarker} 
                  coordinate={{
                  latitude: item.latitude,
                  longitude: item.longitude
                  }}
                  onPress={() => handNavigatorToDetail(item.id)}
                  >
                      <View style={styles.mapMarkerContainer}>
                          <Image style={styles.mapMarkerImage} source={{ uri: item.image_url }}/>
                          <Text style={styles.mapMarkerTitle}>{item.name}</Text>
                      </View>
                </Marker>
              ))}
          </MapView>
           )}
        </View>
    </View>
    <View style={styles.itemsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingHorizontal: 20}}>
            {items.map(item =>(
                <TouchableOpacity 
                key={String(item.id)} 
                activeOpacity={0.6} 
                style={[
                  styles.item,
                  selectedItems.includes(item.id) ? styles.selectedItem : {}
                ]} 
                onPress={() => handleSelectItem(item.id)}
                >
                <SvgUri width={42} height={42} uri={item.image_url} />
            <Text style={styles.itemTitle}>{item.title}</Text>
            </TouchableOpacity>
            ))}
        </ScrollView>
    </View>
    </>
    );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 32,
      paddingTop: 20 + Constants.statusBarHeight,
    },
  
    title: {
      fontSize: 20,
      fontFamily: 'Ubuntu_700Bold',
      marginTop: 24,
    },
  
    description: {
      color: '#6C6C80',
      fontSize: 16,
      marginTop: 4,
      fontFamily: 'Roboto_400Regular',
    },
  
    mapContainer: {
      flex: 1,
      width: '100%',
      borderRadius: 10,
      overflow: 'hidden',
      marginTop: 16,
    },
  
    map: {
      width: '100%',
      height: '100%',
    },
  
    mapMarker: {
      width: 90,
      height: 80, 
    },
  
    mapMarkerContainer: {
      width: 90,
      height: 70,
      backgroundColor: '#34CB79',
      flexDirection: 'column',
      borderRadius: 8,
      overflow: 'hidden',
      alignItems: 'center'
    },
  
    mapMarkerImage: {
      width: 90,
      height: 45,
      resizeMode: 'cover',
    },
  
    mapMarkerTitle: {
      flex: 1,
      fontFamily: 'Roboto_400Regular',
      color: '#FFF',
      fontSize: 12,
      lineHeight: 23,
    },
  
    itemsContainer: {
      flexDirection: 'row',
      marginTop: 16,
      marginBottom: 32,
    },
  
    item: {
      backgroundColor: '#fff',
      borderWidth: 2,
      borderColor: '#eee',
      height: 120,
      width: 120,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingTop: 20,
      paddingBottom: 16,
      marginRight: 8,
      alignItems: 'center',
      justifyContent: 'space-between',
  
      textAlign: 'center',
    },
  
    selectedItem: {
      borderColor: '#34CB79',
      borderWidth: 2,
    },
  
    itemTitle: {
      fontFamily: 'Roboto_400Regular',
      textAlign: 'center',
      fontSize: 13,
    },
  });

export default Points;