from fastapi import FastAPI, Request, Form
from fastapi.templating import Jinja2Templates
import requests

app = FastAPI()

templates = Jinja2Templates(directory="templates")


def fetch_weather_data(city_name):
    base_url = "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/"
    include_params = "fcst,obs,histfcst,stats,days,hours,current,alerts"
    api_key = "LDWJ3Y9LQ5XP8QSEVZGWBL8W2"
    options = "beta"
    content_type = "json"

    full_url = (f"{base_url}{city_name}?include={include_params}&key={api_key}&options={options}"
                f"&contentType={content_type}")

    response = requests.get(full_url)
    if response.status_code == 200:
        data = response.json()
        return data_to_json(data)
    else:
        return None


def data_to_json(data):
    if 'days' in data:
        peak_values = {
            'tempmax': {'name': None, 'value': None, 'time': None},
            'tempmin': {'name': None, 'value': None, 'time': None},
            'temp': {'name': None, 'value': None, 'time': None},
            'feelslikemax': {'name': None, 'value': None, 'time': None},
            'feelslikemin': {'name': None, 'value': None, 'time': None},
            'feelslike': {'name': None, 'value': None, 'time': None},
            'dew': {'name': None, 'value': None, 'time': None},
            'humidity': {'name': None, 'value': None, 'time': None},
            'precip': {'name': None, 'value': None, 'time': None},
            'precipprob': {'name': None, 'value': None, 'time': None},
            'precipcover': {'name': None, 'value': None, 'time': None}
        }

        for day in data['days']:
            for key in ['tempmax', 'tempmin', 'temp', 'feelslikemax', 'feelslikemin', 'feelslike', 'dew']:
                current_value = day.get(key)
                if current_value is not None and (
                        peak_values[key]['value'] is None or round((5 / 9) * (current_value - 32), 1) >
                        peak_values[key]['value']):
                    peak_values[key]['value'] = current_value
                    peak_values[key]['name'] = f"{key.capitalize().replace('temp', 'Temperature')} (Celsius)"
                    peak_values[key]['value'] = round((5 / 9) * (current_value - 32), 1)
                    peak_values[key]['time'] = day['datetime']

        for day in data['days']:
            for key in ['humidity', 'precip', 'precipprob', 'precipcover']:
                current_value = day.get(key)
                if current_value is not None and (
                        peak_values[key]['value'] is None or current_value > peak_values[key]['value']):
                    peak_values[key]['value'] = current_value
                    peak_values[key]['name'] = {
                        'humidity': "Humidity Level (%)",
                        'precip': "Precipitation Level (mm)",
                        'precipprob': "Precipitation Chance (%)",
                        'precipcover': "Precipitation Coverage (%)"
                    }[key]
                    peak_values[key]['time'] = day['datetime']

        return [value for key, value in peak_values.items()]
    else:
        return None


def get_city_data(city_name):
    maxData = fetch_weather_data(city_name)
    api_url = 'https://api.api-ninjas.com/v1/city?name={}'.format(city_name)
    response = requests.get(api_url, headers={'X-Api-Key': 'AD7Mv+uOrnC9eLbJigu6ww==YbvJV13TaI2Z2Fqy'})
    if response.status_code == requests.codes.ok:
        data = response.json()
        if data and isinstance(data, list) and data[0]:
            population = data[0].get('population', 'Population data not available')
            country = data[0].get('country', 'Country data not available')
            latitude = data[0].get('latitude', 'Latitude data not available')
            longitude = data[0].get('longitude', 'Longitude data not available')
            return population, country, latitude, longitude, maxData
        else:
            return 'City data not found', 'City data not found', 'N/A', 'N/A', None
    else:
        return 'Error: Failed to retrieve city data', 'Error: Failed to retrieve city data', 'N/A', 'N/A', None


@app.get('/')
async def home(request: Request):
    return templates.TemplateResponse("home.html", {"request": request, "name": "City Information"})


@app.post('/')
async def process_form(request: Request, city_name: str = Form(...)):
    population, country, latitude, longitude, maxData = get_city_data(city_name)
    return templates.TemplateResponse("home.html", {"request": request, "city_name": city_name,
                                                    "population": population, "country": country, "latitude": latitude,
                                                    "longitude": longitude, "maxData": maxData or []})
