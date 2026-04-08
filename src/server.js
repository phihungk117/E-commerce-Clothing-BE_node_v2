const app = require('./app');
const config = require('./config/config');

const PORT = config.port;

app.listen(PORT, () => {
    console.log(`Server is running in ${config.env} mode on port ${PORT}`);
    if (!config.google.client_id) {
        console.warn('[auth] GOOGLE_CLIENT_ID is not set — POST /api/v1/auth/google will return 503');
    }
});
