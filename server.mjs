import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const apiKey = process.env.API_KEY;

app.use(cors());
app.use(express.static('public'));

app.get('/weather', async (req, res) => {
    const {
        cityName,
        units
    } = req.query;
    if (!cityName) {
        return res.status(400).json({
            error: 'City name is required'
        });
    }

    try {
        const geolocationUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${apiKey}`;
        const geoResponse = await fetch(geolocationUrl);
        const geoData = await geoResponse.json();
        if (geoData.length === 0) {
            return res.status(404).json({ error: 'City not found' });
        }
        const {
            lat,
            lon
        } = geoData[0];

        const apiUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly&appid=${apiKey}&units=${units}`;
        const weatherResponse = await fetch(apiUrl);
        const weatherData = await weatherResponse.json();

        res.json(weatherData);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        res.status(500).json({
            error: 'Error fetching weather data'
        });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});