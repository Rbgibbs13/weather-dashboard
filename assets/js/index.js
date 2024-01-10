//Geo => "http://api.openweathermap.org/geo/1.0/direct?q={city name},{state code},{country code}&limit={limit}&appid={API key}"
//Weather => "https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API key}"
let locationEl = document.querySelector("#location");
let forecastEl = document.querySelector("#forecast");
let inputEl = document.querySelector("#search-input");
let submitBtnEl = document.querySelector("#search-btn");

let savedSearches = 0;

let monthsOfYear = {
    0: "January",
    1: "February",
    2: "March",
    3: "April",
    4: "May",
    5: "June",
    6: "July",
    7: "August",
    8: "September",
    9: "October",
    10: "November",
    11: "December",
}

let searchParams = {
    cityName: "Orinda",
    limitOption: 1,
    appID: "&appid=2ae577f7e190ce26668a9bb40cfee04d",
};

//fetch the geolocation data from city
const FetchData = () => {
    var geoURL = "http://api.openweathermap.org/geo/1.0/direct?q=" + searchParams.cityName + "&limit=" + searchParams.limitOption + searchParams.appID;

    fetch(geoURL , {
        method: 'GET',
    }).then(function(response) {
        return response.json();
    }).then(function(data) {
        console.log(data[0]);
    
        //Build a url with geo data and fetch weather data with it
        var weatherURL = "https://api.openweathermap.org/data/2.5/weather?lat=" + data[0].lat + "&lon=" + data[0].lon
                    + "&appid=2ae577f7e190ce26668a9bb40cfee04d";
    
        fetch(weatherURL, {
            method: 'GET',
        }).then(function(response) {
            return response.json();
        }).then(function(data) {
            //Daily forecast data
            GenerateDayForecast(data);
        });
    
        var forecastURL = "https://api.openweathermap.org/data/2.5/forecast?lat=" + data[0].lat + "&lon=" + data[0].lon
        + "&appid=2ae577f7e190ce26668a9bb40cfee04d";
    
        fetch(forecastURL, {
            method: 'GET',
        }).then(function(response) {
            return response.json();
        }).then(function(data) {
            //5 day 3 hour forecast data
            console.log(data.list[0].dt_txt);
            ConvertUnix(data.list[0].dt);
        });
    });
}

const GenerateDayForecast = (weatherData) => {
    console.log(weatherData);

    var divEl = document.createElement("div");
    var headEl = document.createElement("h2");
    var spanEl = document.createElement("span");

    var listParent = document.createElement("ul");
    var tempEl = document.createElement("li");
    var windEl = document.createElement("li");
    var humidityEl = document.createElement("li");
    var pressureEl = document.createElement("li");
    var cloudEl = document.createElement("li");

    divEl.classList.add("dataDiv");
    spanEl.classList.add("material-symbols-outlined");
    headEl.textContent = searchParams.cityName + " (" + ConvertUnix(weatherData.dt) +") ";

    if(weatherData.clouds.all < 25) {
        spanEl.textContent = "clear_day";
    } else if(weatherData.clouds.all >= 25 && weatherData.clouds.all < 50) {
        //partly clouds
        spanEl.textContent = "partly_cloudy_day";
    }  else if(weatherData.clouds.all > 50) {
        //very cloudy
        spanEl.textContent = "cloud";
        console.log("VERY CLOUDY");
    }
    
    cloudEl.textContent = "Cloud Cover: " + weatherData.clouds.all + "% ";
    tempEl.textContent = "Temp: " + ConvertKtoF(weatherData.main.temp) + "°F";
    windEl.textContent = "Wind: " + Math.floor(weatherData.wind.speed * 22.37)/10 + " MPH";
    humidityEl.textContent = "Humidity: " + weatherData.main.humidity + "%";
    pressureEl.textContent = "Pressure: " + (weatherData.main.pressure/1000) + " bar";

    divEl.append(headEl);
    divEl.append(listParent);
    cloudEl.append(spanEl);
    listParent.append(tempEl);
    listParent.append(windEl);
    listParent.append(humidityEl);
    listParent.append(pressureEl);
    listParent.append(cloudEl);

    locationEl.append(divEl);
    StorePreviousSearch();
}

const GenerateFiveDayForecast = (weatherData) => {

}

const StorePreviousSearch = () => {
    localStorage.setItem(savedSearches, searchParams.cityName);
    savedSearches++;
}

const ConvertKtoC = (kelvin) => {
    var celsius = Math.floor((kelvin - 273.15)*10)/10;
    return celsius;
}

const ConvertKtoF = (kelvin) => {
    var fahrenheit = ((kelvin -273.15) * 1.8) + 32;
    fahrenheit = Math.floor(fahrenheit*10)/10;
    return fahrenheit;
}

const HandleUserInput = () => {
    //Clean up input value
    var sanitize = inputEl.value;
    var split = sanitize.slice(1);
    sanitize = sanitize[0].toUpperCase() + split;
    searchParams.cityName = sanitize;
    FetchData();
}

const ConvertUnix = (unixTime) => {
    //https://stackoverflow.com/questions/847185/convert-a-unix-timestamp-to-time-in-javascript
    //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
    //Convert the unix time to usable date time format
    //better than the date time provided in the fetch data because I can customize the formatting how I want
    
    var date = new Date(unixTime * 1000);
    var year = date.getFullYear();
    var month = date.getMonth();
    var day = date.getDate();
    var hours = date.getHours();
    var minutes = date.getMinutes();
    //var seconds = date.getSeconds();
    var state = "AM";

    if(hours > 12) {
        state = "PM";
        hours -= 12;
    }

    if(minutes < 10) {
        minutes = "0" + minutes;
    }

    console.log(date.getMonth());
    var formatDate = " " + monthsOfYear[month] + "/" + day + "/" + year;
    var formatTime = hours + ":" + minutes + " " + state + " ";
    return formatTime + formatDate;
}

submitBtnEl.addEventListener("click", function(event) {
    HandleUserInput();
});