# Jogo de Cartas

Esse repositório contém o backend do projeto de um jogo de cartas que combina estilos dos jogos Hearthstone e YuGiOh!

O projeto está sendo desenvolvido inteiramente em [streams](twitch.tv/gedes), para fins de estudos e interação com os viewers. 

As principais ferramentas utilizadas para desenvolver a parte do servidor que está contida nesse repositório foram: NodeJS, Express e Socket.io.

Sinta-se à vontade para abrir uma issue ou uma pull request.


## Começando

Essas instruções são para você ter uma cópia do projeto rodando no seu computador.

### Pré requisitos

O que você precisa ter instalado para rodar o projeto.

```
node.js
yarn ou npm
```

### Instalação

Passos para rodar o projeto no seu computador.

Clonar o repositório.

```
git clone https://github.com/gabrielguedest/card-game-server.git
```

Instalar dependências. _Utilize o comando relacionado ao seu gerenciador de dependências._

```
yarn
npm install
```

Executar a aplicação.

```
yarn start
npm run start
```

### Escutando alterações

Para executar a aplicação escutando e atualizando assim que houver alguma alteração.

```
yarn start:watch
npm run start:watch
```


### Funcionalidades Futuras

Estão listadas abaixo algumas funcionalidades que devem ser adicionadas no jogo, algumas funcionalidades são idéias dos viewers da [stream](twitch.tv/gedes).

___A ordem da lista não está associada com a ordem em que a funcionalidade será desenvolvida.___

* Deck personalizado
* Feedback de ações (Mostrar ataque, mostrar a compra de cartas)
* Efeitos de cartas
* Cemitério (Enviar carta quando morrer em um ataque)
* Esquema de vida de cartas igual hearthstone
