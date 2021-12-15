const APIkeyGetCoordinates = '5fe5501f8b224c32bf83be111a8c839a';
const APIkeyGetWeather = '932eba860af942187c533f1e16deb26f';

const timer = 60000;
let state = localStorage.state ? JSON.parse(localStorage.state) : { coordinates: {}, weather: {} };

let nightMode = false;

let input = document.querySelector('.input');
let selector = document.querySelector('.dropdown');
let submitButton = document.querySelector('.submit-button');
let resultWrap = document.querySelector('.result-wrap');
let root = document.getElementById('root');
let header = document.getElementById('header');

let timeoutRenders = [];

function dayHandler(unix_timestamp, timezone) {
    let date = new Date(unix_timestamp * 1000);
    let dateData = {
        date: date.toLocaleString('en-GB', { timeZone: timezone, weekday: 'long' }),
        time: date.toLocaleString('en-GB', { timeZone: timezone, hour: '2-digit', minute: '2-digit' }),
    };
    return dateData;
}
function weatherIconHandler(id) {
    if (id === 800) {
        return './images/sun.svg';
    } else if (id >= 801 && 804 >= id) {
        if (id === 801 || id === 802) {
            return './images/cloudy.svg';
        }
        if (id === 803 || id === 804) {
            return './images/clouds.svg';
        }
    } else if (id >= 600 && 622 >= id) {
        return './images/snow.svg';
    } else {
        return './images/rain.svg';
    }
}
function render(data, numberOfDays) {
    if (data.current.weather[0].icon.includes('n')) {
        if (!nightMode) {
            nightMode = root.classList.toggle('night-mode');
            header.classList.toggle('night-mode');
            resultWrap.classList.toggle('night-mode');
        }
    } else {
        if (nightMode) {
            nightMode = root.classList.toggle('night-mode');
            header.classList.toggle('night-mode');
            resultWrap.classList.toggle('night-mode');
        }
    }
    resultWrap.textContent = '';
    for (let i = 0; i < timeoutRenders.length; i++) {
        clearTimeout(timeoutRenders[i]);
    }
    timeoutRenders = [];
    for (let i = 0; i < parseInt(numberOfDays); i++) {
        if (nightMode) {
            timeoutRenders.push(
                setTimeout(() => {
                    resultWrap.insertAdjacentHTML(
                        'beforeend',
                        `<div class="result">
                <h2>${dayHandler(data.daily[i].dt, data.timezone).date}</h2>
                <img class="night-mode" src="${weatherIconHandler(data.daily[i].weather[0].id)}" alt="Weather Picture" />
            </div>`
                    );
                }, 1000 * i)
            );
        } else {
            timeoutRenders.push(
                setTimeout(() => {
                    resultWrap.insertAdjacentHTML(
                        'beforeend',
                        `<div class="result">
                <h2>${dayHandler(data.daily[i].dt, data.timezone).date}</h2>
                <img id="image" src="${weatherIconHandler(data.daily[i].weather[0].id)}" alt="Weather Picture" />
            </div>`
                    );
                }, 1000 * i)
            );
        }
    }
}

async function getWeather(lat, lng, APIkey) {
    fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lng}&exclude=minutely,hourly&units=metric&appid=${APIkey}`)
        .then((response) => response.json())
        .then((data) => {
            state.weather[input.value.toLowerCase()] = data;
            state.weather[input.value.toLowerCase()].timeout = new Date().getTime() + timer;
            localStorage['state'] = JSON.stringify(state);
            render(data, selector.value);
        })
        .catch((error) => window.alert(error));
}
async function getCoordinates(city, APIkey) {
    fetch(`https://api.opencagedata.com/geocode/v1/json?q=${city}&key=${APIkey}&no_annotations=1&limit=1`)
        .then((response) => response.json())
        .then((data) => {
            if (data.results.length === 0) {
                window.alert(`We cannot find the city ${input.value} :(`);
                input.value = '';
            } else {
                state.coordinates[input.value.toLowerCase()] = data;
                localStorage['state'] = JSON.stringify(state);
                getWeather(data.results[0].geometry.lat, data.results[0].geometry.lng, APIkeyGetWeather);
            }
        })
        .catch((error) => window.alert(error));
}

function submitHandler(event) {
    if (event.key === 'Enter' || this === submitButton) {
        if (input.value) {
            if (state.coordinates[input.value.toLowerCase()]) {
                if (state.weather[input.value.toLowerCase()] && state.weather[input.value.toLowerCase()].timeout > new Date().getTime()) {
                    render(state.weather[input.value.toLowerCase()], selector.value);
                } else {
                    getWeather(state.coordinates[input.value.toLowerCase()].results[0].geometry.lat, state.coordinates[input.value.toLowerCase()].results[0].geometry.lng, APIkeyGetWeather);
                }
            } else {
                getCoordinates(input.value, APIkeyGetCoordinates);
            }
        } else {
            resultWrap.textContent = '';
            this.value = '';
            window.alert('Enter the city name, please');
        }
    }
}

input.addEventListener('keypress', submitHandler);
submitButton.addEventListener('click', submitHandler);
