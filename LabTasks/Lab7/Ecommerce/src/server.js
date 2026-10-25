import { createStore } from './services/store.js';
import { createApp } from './app.js';

const port = Number(process.env.PORT || 3000);
const server = createApp(createStore());
server.listen(port, '127.0.0.1', () => console.log(`ShopEase: http://localhost:${port}`));
