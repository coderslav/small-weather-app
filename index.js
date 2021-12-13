const APIkeyGetCoordinates = '5fe5501f8b224c32bf83be111a8c839a';
const APIkeyGetWeather = '932eba860af942187c533f1e16deb26f';

let input = document.querySelector('.input');
let selector = document.querySelector('.dropdown');
let submitButton = document.querySelector('.submit-button');
let resultWrap = document.querySelector('.result-wrap');

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

function submitHandler(event) {
    if (event.key === 'Enter' || this === submitButton) {
        if (input.value) {
            resultWrap.textContent = '';
            fetch(`https://api.opencagedata.com/geocode/v1/json?q=${input.value}&key=${APIkeyGetCoordinates}&no_annotations=1&limit=1`)
                .then((response) => response.json())
                .then((data) => {
                    if (data.results.length === 0) {
                        window.alert(`We cannot find the city ${input.value} :(`);
                        console.log('Here');
                        input.value = '';
                    } else {
                        fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${data.results[0].geometry.lat}&lon=${data.results[0].geometry.lng}&exclude=minutely,hourly,current&units=metric&appid=${APIkeyGetWeather}`)
                            .then((response) => response.json())
                            .then((data) => {
                                for (let i = 0; i < parseInt(selector.value); i++) {
                                    resultWrap.insertAdjacentHTML(
                                        'beforeend',
                                        `<div class="result">
                                            <h2>${dayHandler(data.daily[i].dt, data.timezone).date}</h2>
                                            <img src="${weatherIconHandler(data.daily[i].weather[0].id)}" alt="Weather Picture" />
                                        </div>`
                                    );
                                }
                            })
                            .catch((error) => window.alert(error));
                    }
                })
                .catch((error) => window.alert(error));
        } else {
            this.value = '';
            window.alert('Enter the city name, please');
        }
    }
}

input.addEventListener('keypress', submitHandler);
submitButton.addEventListener('click', submitHandler);
