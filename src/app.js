// check the time of the day and the current day for the weather
var apiKey = '00004f55356d12e74828c3dd32afeb45'
const baseURL = 'https://api.openweathermap.org/data/2.5/'

navigator.geolocation.getCurrentPosition((position) => {
  const userLong = position.coords.longitude;
  const userLat = position.coords.latitude;
  getCurrentWeather(userLat, userLong).then((currCondition) => {
    postCurrentWeatherEle(currCondition);
  })

  getWeatherFiveDays(userLat, userLong)
    .then((rawData) => {
      return transformForecastData(rawData)
    })
    .then(forecast => postForecast(forecast))
},
  (error) => console.log(error));

async function getCurrentWeather(lat, lon) {
  const currentWeatherURL = `${baseURL}weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
  const request = await fetch(currentWeatherURL);
  const response = await request.json();

  return {
    icon: response.weather[0].icon,
    temp: Math.floor(response.main.temp),
    condition: response.weather[0].description
  };
};

function transformForecastData(rawData) {
  const forecasts = [];
  // transform the rawData into a 5 day forecast object
  // const { days, icon, condition, highTemp, lowTemp } = day
  rawData.list.forEach((snapshot) => {
    // do we need to create an object or is there one already
    // use the dt_txt to create a date object
    // check the array to see if an object with that day exists
    const snapshotDate = new Date(snapshot.dt_txt);
    const dailyForecast = forecasts.find((element) => {
      return element.date.getDay() === snapshotDate.getDay();
    })

    if (dailyForecast !== undefined) {
      // check high and low
      dailyForecast.highTemp = Math.round(Math.max(dailyForecast.highTemp, snapshot.main.temp_max));
      dailyForecast.lowTemp = Math.round(Math.min(dailyForecast.lowTemp, snapshot.main.temp_min));

      if (snapshotDate.getHours() === 15) {
        dailyForecast.icon = snapshot.weather[0].icon;
        dailyForecast.condition = snapshot.weather[0].description;
      }
    } else {
      forecasts.push({
        date: snapshotDate,
        highTemp: snapshot.main.temp_max,
        lowTemp: snapshot.main.temp_min,
        icon: snapshot.weather[0].icon,
        condition: snapshot.weather[0].description
      })
    }

    // is the high temp for the snapshot higher than the existing high temp
    // is the low temp for the snapshot lower than the existing low temp
    // how to determine the condition for the day
    // Which days to display
  })

  const currentDate = new Date();

  if (currentDategetHours() < 12) {
    forecasts.pop();
  } else {
    forecasts.shift();
  }

  return forecasts;
}

async function getWeatherFiveDays(lat, lon) {
  const fiveDayWeatherURL = `${baseURL}forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
  const request = await fetch(fiveDayWeatherURL);
  const response = await request.json();
  return response;
}

function postCurrentWeatherEle(currentCondition) {
  const { icon, temp, condition } = currentCondition;
  const currConditionContainer = document.querySelector('.current-conditions')
  currConditionContainer.textContent = ''
  currConditionContainer.insertAdjacentHTML(
    'beforeend',
    `
    <h2>Current Conditions</h2>
    <img src="http://openweathermap.org/img/wn/${icon}@2x.png">
    <div class="current">
      <div class="temp">${temp}℃</div>
      <div class="condition">${condition}</div>
    </div>
  `
  )
}

function postForecast(forecast) {
  const element = document.querySelector('.forecast')
  element.textContent = ''
  forecast.forEach((day) => {
    const { days, icon, condition, highTemp, lowTemp } = day
    element.insertAdjacentHTML(
      'beforeend',
      `
        <div class="day">
          <h3>${dayjs(days).format('dddd')}</h3>
          <img src="http://openweathermap.org/img/wn/${icon}@2x.png" />
          <div class="description">${condition}</div>
          <div class="temp">
            <span class="high">${highTemp}℃</span>/<span class="low">${lowTemp}℃</span>
          </div>
        </div>
      `
    )
  })
}

// function formatDate(date) {
//   const rawDate = new Date(date);
//   const day = rawDate.getDate();
//   return day;
// }


