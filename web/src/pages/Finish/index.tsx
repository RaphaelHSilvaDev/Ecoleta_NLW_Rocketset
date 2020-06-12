import React from 'react';
import {Link, useHistory} from 'react-router-dom';
import Logo from '../../assets/logo.svg';
import './styles.css';

const Finish = () =>{
    
    const link = useHistory();

    function handleSubmit(){
        link.push('/');
    }
    
    return (
        <div id="page-finish">
            <header>
                <img src={Logo} alt="Ecoleta"/>
            </header>

            <form onSubmit={handleSubmit}>
                        <h1>Finalização</h1>
            <fieldset>
                    <legend>
                        <h2>O cadastro foi efetuado com sucesso!</h2>
                    </legend>
            </fieldset>
                <button>Continuar</button>
            </form>
        </div>
    );
}

export default Finish;