import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { Map, TileLayer, Marker} from 'react-leaflet';
import axios from 'axios';
import { LeafletMouseEvent } from 'leaflet';
import Dropzone from '../../components/Dropzone';

import api from '../../services/api';
import './styles.css';
import Logo from '../../assets/logo.svg';

interface Item{
    id: number;
    title: string;    
    image_url: string;
}

interface IBGEUFResponse{
    sigla: string;
}

interface IBGECityResponse{
    nome: string;
}

const CreatePoint = () => {
    const [selectedImage, setSelectedImage] = useState<File>();
    const [items, setItems] = useState<Item[]>([]);
    const [ufs, setUfs] = useState<string[]>([]);
    const [cities, setCities] = useState<string[]>([]);
    const [selectedUf, setSelectedUf] = useState('0');
    const [selectedCity, setSelectedCity] = useState('0');
    const [selectedPointMap, setSelectedPointMap] = useState<[number, number]>([0, 0]);
    const [initialPosision, setInitialPosition] = useState<[number, number]>([0, 0]);
    const [inputData, setInputData] = useState({
        name: '',
        email: '',
        whatsapp: '',
        address: '',
        number: ''
    })
    const [selectedItem, setSelectedItem] = useState<number[]>([]);
    const history = useHistory();

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            setInitialPosition([latitude, longitude]);
        })
    },[])

    useEffect(() => {
        api.get('items').then(response => {
            setItems(response.data);
        });
    },[]);

    useEffect(() => {
        axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome').then(response =>{
            const ufInitials = response.data.map(uf => uf.sigla)
            setUfs(ufInitials);
        });
    }, []);

    useEffect(() => {
        if(selectedUf === '0'){
            return;
        }
        axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`).then(response =>{
            const cityName = response.data.map(city => city.nome)
            setCities(cityName);
        });
    },[selectedUf]);

    function handleSelectUf(event: ChangeEvent<HTMLSelectElement>){
        const uf = event.target.value;
        setSelectedUf(uf);
    }

    function handleSelectCity(event: ChangeEvent<HTMLSelectElement>){
        const city = event.target.value;
        setSelectedCity(city);
    }

    function handleMapClick(event: LeafletMouseEvent){
        setSelectedPointMap([
            event.latlng.lat,
            event.latlng.lng,
        ]);
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement>){
        const {name, value} = event.target;
        setInputData({...inputData, [name]: value})
    }

    function handleSelectItem(id: number){
        const alreadySelected = selectedItem.findIndex(item => item === id);

        if(alreadySelected >= 0){
            const filterItems = selectedItem.filter(item => item !== id);
            setSelectedItem(filterItems);
        }else{
            setSelectedItem([...selectedItem, id]);
        }
    }

    async function handleSubmit(event: FormEvent){
        event.preventDefault();
        
        const { name, email, whatsapp, address, number } = inputData;
        const uf = selectedUf;
        const city = selectedCity;
        const [latitude, longitude] = selectedPointMap;
        const items = selectedItem;
        
        const data = new FormData();
        
        data.append('name', name);
        data.append('email', email);
        data.append('whatsapp', whatsapp);
        data.append('uf', uf);
        data.append('city', city);
        data.append('address', address);
        data.append('number', number);
        data.append('latitude', String(latitude));
        data.append('longitude', String(longitude));
        data.append('items', items.join(','));
        
        if(selectedImage){
            data.append('image', selectedImage);
        }
        
        await  api.post('points', data);
        history.push('/finish');
    }

    return (
        <div id="page-create-point">
            <header>
                <img src={Logo} alt="Ecoleta"/>
                <Link to="/">
                    <FiArrowLeft />
                    Voltar para Home!
                </Link>
            </header>
            <form onSubmit={handleSubmit}>
                <h1>Cadastro do <br /> ponto de coleta!</h1>

                <Dropzone onFileUploaded={setSelectedImage}/>

                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>
                    <div className="field">
                        <label htmlFor="name">Nome da Entidade</label>
                        <input 
                            type="text"
                            name="name"
                            id="name"
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="field-group">
                    <div className="field">
                        <label htmlFor="email">E-mail</label>
                        <input 
                            type="email"
                            name="email"
                            id="email"
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="field">
                        <label htmlFor="whatsapp">Whatsapp</label>
                        <input 
                            type="text"
                            name="whatsapp"
                            id="whatsapp"
                            onChange={handleInputChange}
                        />
                    </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa! </span>
                    </legend>

                    <Map center={initialPosision} zoom={15} onClick={handleMapClick}>
                        <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        <Marker position={selectedPointMap} />
                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select name="uf" id="uf" value={selectedUf} onChange={handleSelectUf}>
                                <option value="0">Seleciona uma UF</option>
                                {ufs.map(uf => (
                                <option value={uf} key={uf}>{uf}</option>
                                ))}
                            </select>
                        </div>

                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select name="city" id="city" value={selectedCity} onChange={handleSelectCity}>
                                <option value="0">Selecione uma cidade</option>
                                {cities.map(city => 
                                    <option value={city} key={city}>{city}</option>
                                )}
                            </select>
                        </div>

                    </div>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="address">Endereço</label>
                            <input 
                            type="text" 
                            name="address" 
                            id="address"
                            onChange={handleInputChange}
                            />
                        </div>

                        <div className="field">
                            <label htmlFor="number">Número</label>
                            <input 
                            type="text" 
                            name="number" 
                            id="number" 
                            onChange={handleInputChange}
                            />
                        </div>

                    </div>

                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Ítens de Coleta</h2>
                        <span>Selecione um ou mais ítens aaixo!</span>
                    </legend>

                    <ul className="items-grid">
                        {items.map(item => (
                        <li 
                        key={item.id} 
                        onClick={() => handleSelectItem(item.id)}
                        className={selectedItem.includes(item.id) ? 'selected' : ''}
                        >
                            <img src={item.image_url} alt={item.title}/>
                            <span>{item.title}</span>
                        </li>))}
                    </ul>
                </fieldset>
                <button type="submit">Cadastrar ponto de coleta</button>
            </form>
        </div>
    );
};

export default CreatePoint;