import React, { useEffect, useState } from 'react';
import Constants from 'expo-constants';
import { View, ImageBackground, Text, Image, StyleSheet, Alert, TouchableOpacity, ActivityIndicator, SafeAreaView, ScrollView  } from 'react-native';
import Modal from 'react-native-modal';
import { Feather as Icon } from '@expo/vector-icons'
import { RectButton } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

interface IBGEUFResponse{
  sigla: string;
  nome: string;
}

interface IBGECityResponse{
  nome: string;
}


const Home = () => {
  
  const [UfModal, setUfModalVisible] = useState(false);
  const [CityModal, setCityModalVisible] = useState(false);
  const [timeUf, SetTimeUf] = useState(false);
  const [timeCity, SetTimeCity] = useState(false);
  const openUFList = () => {
    setUfModalVisible(!UfModal); 
    SetTimeUf(false);
  };
  
  if(UfModal){
      setTimeout(() => {
        SetTimeUf(true)
      }, 800);
  }

  const openCityList = () => {
    setCityModalVisible(!CityModal);
    SetTimeCity(false);
  };

  if(CityModal){
    setTimeout(() => {
      SetTimeCity(true)
    }, 800);
  }

    const navigation = useNavigation();
    const [ufs, setUfs] = useState<IBGEUFResponse[]>([]);
    const [selectedUf, setSelectedUf] = useState('');
    const [cities, setCities] = useState<IBGECityResponse[]>([]);
    const [selectedCity, setSelectedCity] = useState('');

    useEffect(() => {
      axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome').then(response =>{
          setUfs(response.data);
      });
  }, []);

  useEffect(() => {
    if(selectedUf === '0'){
        return;
    }
    axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`).then(response =>{      
        setCities(response.data);
    });
},[selectedUf]);

    function handleNavigationToPoint(){
        navigation.navigate('Points', {
          selectedUf,
          selectedCity
        });
    }

    function ufSelected(uf: string){
      setSelectedUf(uf);
      setUfModalVisible(!UfModal);
    }

    function citySelected(city: string){
      setSelectedCity(city);
      setCityModalVisible(!CityModal);
    }

    function loading(){
      
    }

    return (
        <ImageBackground 
        source={require('../../assets/home-background.png')} 
        style={styles.container}
        imageStyle={{width: 274, height: 368}}
        >
            <View style={styles.main}>
                <Image source={require('../../assets/logo.png')} />
                <Text style={styles.title}>O seu marketplace de coleta de resíduos!</Text>
                <Text style={styles.description}>Ajudamos pessoas a encontrarem pontos de coletas de forma eficiente.</Text>
            </View>

            <View style={styles.footer}>

                <TouchableOpacity style={styles.select}onPress={openUFList}><Text style={styles.selectText}>Estado: </Text><Text style={{fontSize: 18, fontFamily: "Ubuntu_700Bold"}}>{selectedUf}</Text></TouchableOpacity>
                <View style={styles.modelView}>
                  <Modal isVisible={UfModal} style={{width: "100%", margin: -0,}} backdropColor='#000'>
                  <View style={styles.modal}>
                  <TouchableOpacity onPress={openUFList}><Text style={styles.exitText}>Fechar</Text></TouchableOpacity>
                  {timeUf !== false && (
                  <ScrollView style={styles.Scroll} contentContainerStyle={{overflow: "scroll"}}>
                    <View style={{alignItems: "center", marginTop: 10, width: "100%", height: "100%"}}>
                      {ufs.map(uf => (
                        <TouchableOpacity style={{width: "100%", alignItems: "center"}} key={uf.sigla} onPress={() => ufSelected(uf.sigla)}><Text style={{fontSize: 16}}>{uf.nome}</Text></TouchableOpacity>
                      ))}
                </View>
                </ScrollView>
                )}
                {timeUf !== true && (
                    <View style={{alignItems: "center", justifyContent: "center", paddingBottom: 100, width: "100%", height: "100%"}}>
                      <ActivityIndicator size="large" color="#258e54"/>
                    </View>
                )}
                </View>
              </Modal>
              </View>

                <TouchableOpacity style={styles.select}onPress={openCityList}><Text style={styles.selectText}>Cidade: </Text><Text style={{fontSize: 18, fontFamily: "Ubuntu_700Bold"}}>{selectedCity}</Text></TouchableOpacity>
                <View style={styles.modelView}>
                  <Modal isVisible={CityModal} style={{width: "100%", margin: -0,}} backdropColor='#000'>
                  <View style={styles.modal}>
                  <TouchableOpacity onPress={openCityList}><Text style={styles.exitText}>Fechar</Text></TouchableOpacity>
                  {timeCity !== false &&(
                  <ScrollView style={styles.Scroll} contentContainerStyle={{overflow: "scroll"}}>
                    <View style={{alignItems: "center", marginTop: 10, width: "100%", height: "100%"}}>
                      {cities.map(city => (
                        <TouchableOpacity style={{width: "100%", alignItems: "center"}} key={city.nome} onPress={() => citySelected(city.nome)}><Text style={{fontSize: 16}}>{city.nome}</Text></TouchableOpacity>
                      ))}
                </View>
                </ScrollView>
                )}
                {timeCity !== true &&(
                  <View style={{alignItems: "center", justifyContent: "center", paddingBottom: 100, width: "100%", height: "100%"}}>
                  <ActivityIndicator size="large" color="#258e54"/>
                </View>
                )}
                </View>
              </Modal>
              </View>

              <RectButton style={styles.button} onPress={handleNavigationToPoint}>
                  <View style={styles.buttonIcon}>
                      <Text>
                          <Icon name="arrow-right" color="#fff" size={24}/>
                      </Text>
                  </View>
                  <Text style={styles.buttonText}>
                      Entrar
                  </Text>
              </RectButton>
            </View>
        </ImageBackground>
    )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
  },

  header:{
    flex: 1,
    marginBottom: 130,
  },

  main: {
    flex: 1,
    justifyContent: "center",
    paddingTop: 32 + Constants.statusBarHeight
  },

  title: {
    color: "#322153",
    fontSize: 32,
    fontFamily: "Ubuntu_700Bold",
    maxWidth: 260,
    marginTop: 64,
  },

  description: {
    color: "#6C6C80",
    fontSize: 16,
    marginTop: 16,
    fontFamily: "Roboto_400Regular",
    maxWidth: 260,
    lineHeight: 24,
  },

  footer: {
    paddingTop: 24,
  },

  select:{
    height: 60,
    borderRadius: 10,
    marginBottom: 8
  },

  selectText:{
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "Ubuntu_700Bold",
    color: "#258e54",
  },

  modelView:{
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: "#fff",
  },

  modal: {
    flex: 1,
    height: 20,
    backgroundColor: "#fff",
    marginTop: 450,
    borderRadius: 10,
  },

  Scroll:{
    marginBottom: 30,
  },

  exitText:{
    alignSelf: "flex-end",
    color: "#258e54",
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "Ubuntu_700Bold",
    marginRight: 10,
    marginTop: 10,
  },

  button: {
    backgroundColor: "#34CB79",
    height: 60,
    flexDirection: "row",
    borderRadius: 10,
    overflow: "hidden",
    alignItems: "center",
    marginTop: 8,
  },

  buttonIcon: {
    height: 60,
    width: 60,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    flex: 1,
    justifyContent: "center",
    textAlign: "center",
    color: "#FFF",
    fontFamily: "Roboto_500Medium",
    fontSize: 16,
  },
});

export default Home;