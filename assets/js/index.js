//Geo => "http://api.openweathermap.org/geo/1.0/direct?q={city name},{state code},{country code}&limit={limit}&appid={API key}"
//Weather => "https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API key}"
let locationEl = document.querySelector("#location");
let forecastEl = document.querySelector("#forecast");
let inputEl = document.querySelector("#search-input");
let switchEl = document.querySelector(".switch");
let submitBtnEl = document.querySelector("#search-btn");
let locationSearchParentEl = document.querySelector(".location-search");

let holdWeatherData;
let holdForecastData;
var stateName;

let savedSearches = 0;
let useMetric = false;

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
    var geoURL = "https://api.openweathermap.org/geo/1.0/direct?q=" + searchParams.cityName + "&limit=" + searchParams.limitOption + searchParams.appID;

    fetch(geoURL , {
        method: 'GET',
    }).then(function(response) {
        return response.json();
    }).then(function(data) {
        stateName = data[0].state;
    
        //Build a url with geo data and fetch weather data with it
        var weatherURL = "https://api.openweathermap.org/data/2.5/weather?lat=" + data[0].lat + "&lon=" + data[0].lon
                    + "&appid=2ae577f7e190ce26668a9bb40cfee04d";
    
        fetch(weatherURL, {
            method: 'GET',
        }).then(function(response) {
            return response.json();
        }).then(function(data) {
            //Daily forecast data
            console.log(data);
            holdWeatherData = data;
            GenerateDayForecast(data, stateName);
        });
    
        var forecastURL = "https://api.openweathermap.org/data/2.5/forecast?lat=" + data[0].lat + "&lon=" + data[0].lon
        + "&appid=2ae577f7e190ce26668a9bb40cfee04d";
    
        fetch(forecastURL, {
            method: 'GET',
        }).then(function(response) {
            return response.json();
        }).then(function(data) {
            //5 day 3 hour forecast data
            holdForecastData = data.list;
            GenerateFiveDayForecast(data.list);
            //ConvertUnix(data.list[0].dt);
        });
    });
}

const GenerateDayForecast = (weatherData, state) => {
    //Check for existing data and remove
    var check = document.querySelector(".dataDiv");
    if(check) { check.remove(); }

    var divEl = document.createElement("div");
    var headEl = document.createElement("h2");
    var spanEl = document.createElement("span");

    var listParent = document.createElement("ul");
    var tempEl = document.createElement("li");
    var windEl = document.createElement("li");
    var windDirectionEl = document.createElement("li");
    var humidityEl = document.createElement("li");
    var pressureEl = document.createElement("li");
    var cloudEl = document.createElement("li");

    divEl.classList.add("dataDiv");
    spanEl.classList.add("material-symbols-outlined");
    if(state === undefined) {
        headEl.textContent = searchParams.cityName + " (" + ConvertUnix(weatherData.dt) +") ";
    } else {
        headEl.textContent = searchParams.cityName + ", " + state + " (" + ConvertUnix(weatherData.dt) +") ";
    }

    if(weatherData.clouds.all < 25) {
        spanEl.textContent = "clear_day";
    } else if(weatherData.clouds.all >= 25 && weatherData.clouds.all < 50) {
        //partly clouds
        spanEl.textContent = "partly_cloudy_day";
    }  else if(weatherData.clouds.all > 50) {
        //very cloudy
        spanEl.textContent = "cloud";
    }
    
    if(useMetric) {
        tempEl.textContent = "Temp: " + ConvertKtoC(weatherData.main.temp) + "°C";
        windEl.textContent = "Wind Speed: " + Math.floor(weatherData.wind.speed * 16)/10 + " KPH";
    } else {
        tempEl.textContent = "Temp: " + ConvertKtoF(weatherData.main.temp) + "°F";
        windEl.textContent = "Wind Speed: " + Math.floor(weatherData.wind.speed * 10)/10 + " MPH";
    }
    
    cloudEl.textContent = "Cloud Cover: " + weatherData.clouds.all + "% ";
    
    windDirectionEl.textContent = "Wind Direction: " + ConvertWindDirection(weatherData.wind.deg);
    humidityEl.textContent = "Humidity: " + weatherData.main.humidity + "%";
    pressureEl.textContent = "Pressure: " + (weatherData.main.pressure/1000) + " bar";

    divEl.append(headEl);
    divEl.append(listParent);
    headEl.append(spanEl);
    listParent.append(cloudEl);
    listParent.append(tempEl);
    listParent.append(windEl);
    listParent.append(windDirectionEl);
    listParent.append(humidityEl);
    listParent.append(pressureEl);

    locationEl.append(divEl);
    StorePreviousSearch();
}

const GenerateFiveDayForecast = (weatherData) => {
    //Check for existing data and remove
    var check = document.querySelector(".forecast-parent-div");
    if(check) { check.remove(); }

    var parentDivEl = document.createElement("div");
    var forecastDivEl = document.createElement("div");
    var titleEl = document.createElement("h2");
    var breakLineEl = document.createElement("hr");
    var segmentDivEl;

    parentDivEl.classList.add("forecast-parent-div");
    forecastDivEl.classList.add("forecast-container");
    breakLineEl.classList.add("horizontal-rule");
    titleEl.textContent = "Five Day Forecast - 3 Hour Segments";

    parentDivEl.append(titleEl);
    parentDivEl.append(breakLineEl);
    parentDivEl.append(forecastDivEl);

    for(let i = 0; i < weatherData.length; i++) {
        segmentDivEl = document.createElement("div");
        segmentDivEl.classList.add("forecast-segment-div");

        var dateTimeEl = document.createElement("h2");
        var listParentEl = document.createElement("ul");
        var tempEl = document.createElement("li");
        var windEl = document.createElement("li");
        var humidityEl = document.createElement("li");
        var pressureEl = document.createElement("li");
        var cloudEl = document.createElement("li");
        var spanEl = document.createElement("span");

        spanEl.classList.add("material-symbols-outlined");
        dateTimeEl.textContent = ConvertUnix(weatherData[i].dt);
        cloudEl.textContent = "Cloud Cover: " + weatherData[i].clouds.all + "%";
        humidityEl.textContent = "Humidity: " + weatherData[i].main.humidity + "%";
        pressureEl.textContent = "Pressure: " + (weatherData[i].main.pressure/1000) + " bar";

        if(weatherData[i].clouds.all < 25) {
            spanEl.textContent = "clear_day";
        } else if(weatherData[i].clouds.all >= 25 && weatherData[i].clouds.all < 50) {
            //partly clouds
            spanEl.textContent = "partly_cloudy_day";
        }  else if(weatherData[i].clouds.all > 50) {
            //very cloudy
            spanEl.textContent = "cloud";
        }

        if(useMetric) {
            tempEl.textContent = "Temp: " + ConvertKtoC(weatherData[i].main.temp) + "°C";
            windEl.textContent = "Wind Speed: " + Math.floor(weatherData[i].wind.speed * 16)/10 + " KPH";
        } else {
            tempEl.textContent = "Temp: " + ConvertKtoF(weatherData[i].main.temp) + "°F";
            windEl.textContent = "Wind Speed: " + Math.floor(weatherData[i].wind.speed * 10)/10 + " MPH";
        }

        cloudEl.append(spanEl);
        listParentEl.append(cloudEl);
        listParentEl.append(tempEl);
        listParentEl.append(windEl);
        listParentEl.append(humidityEl);
        listParentEl.append(pressureEl);

        segmentDivEl.append(dateTimeEl);
        segmentDivEl.append(listParentEl);
        forecastDivEl.append(segmentDivEl);
    }
    
    forecastEl.append(parentDivEl);
}

const GenerateLocalStorageList = () => {
    savedSearches = localStorage.length;
    var maxSearches = 7;

    for(let i = 0; i < localStorage.length; i++) {
        if(i > maxSearches) { return; }
        AddSearchToStorageList(i);
    }
}

const AddSearchToStorageList = (input) => {
    var val = localStorage.getItem(input);
    var btnEl = document.createElement("btn");
    var removeBtnEl = document.createElement("btn");
    var spanEl = document.createElement("span");
    var textEl = document.createElement("h2");

    btnEl.classList.add("local-storage-btn");
    spanEl.classList.add("material-symbols-outlined");
    removeBtnEl.classList.add("remove-storage-btn");
    removeBtnEl.setAttribute("data-list-index", input);
    textEl.textContent = val;
    spanEl.textContent = "cancel";

    btnEl.append(textEl);
    btnEl.append(removeBtnEl);
    removeBtnEl.append(spanEl);
    locationSearchParentEl.append(btnEl);

    btnEl.addEventListener("click", function() {
        searchParams.cityName = textEl.textContent;
        FetchData();
    });

    removeBtnEl.addEventListener("click", function(event) {
        RemoveFromStorage(this.getAttribute("data-list-index"));
        event.stopPropagation();
        this.parentElement.remove();
    });
}

const StorePreviousSearch = () => {
    for(let i = 0; i < localStorage.length; i++) {
        if(localStorage.getItem(i) == searchParams.cityName) {
            return;
        }
    }
    localStorage.setItem(savedSearches, searchParams.cityName);
    AddSearchToStorageList(savedSearches);
    savedSearches++;
}

const RemoveFromStorage = (index) => {
    var localLength = localStorage.length;

    //Move everything in storage up one index
    if(index < localLength) {
        for(let i = index; i < localLength; i++) {
            var holdVal = localStorage.getItem(i);
            if(i > 0) { localStorage.setItem(i-1, holdVal); }
            localStorage.removeItem(i);
        }
    }

    savedSearches = localStorage.length;
}

const ConvertWindDirection = (windDir) => {
    var build = "";
    if(windDir <= 45 ) {
        //FROM north TO south
        build += "S";
    } else if(windDir > 45 && windDir <= 135) {
        //FROM east
        build += "W";
    } else if(windDir > 135 && windDir <= 225) {
        //FROM south
        build += "N";
    } else if(windDir > 225 && windDir <= 315) {
        //FROM west
        build += "E";
    } else {
        //315-360 FROM north
        build += "S";
    }
    return build;
}

//Data converts Kelvin => Celsius  &&  Kelvin => Fahrenheit
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

    var formatDate = " " + monthsOfYear[month] + "/" + day + "/" + year;
    var formatTime = hours + ":" + minutes + " " + state + " ";
    return formatTime + formatDate;
}

//Make sure switch always starts OFF
switchEl.checked = false;
GenerateLocalStorageList();
submitBtnEl.addEventListener("click", function(event) {
    HandleUserInput();
});
inputEl.addEventListener("keypress", function(key) {
    if(key.key == "Enter") {
        HandleUserInput();
    }
});
switchEl.addEventListener("change", function() {
    useMetric = !useMetric;
    GenerateDayForecast(holdWeatherData, stateName);
    GenerateFiveDayForecast(holdForecastData);
});