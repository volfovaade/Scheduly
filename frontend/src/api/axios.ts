// configuration of backend connection
// port from docker-compose

import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://localhost:8081/api',
})

export default instance;