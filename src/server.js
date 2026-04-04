const app = require('./app');
const config = require('./config/config');

const PORT = config.port;

app.listen(PORT, () => {
    console.log(`Server is running in ${config.env} mode on port ${PORT}`);
});
