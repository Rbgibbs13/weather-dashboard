//Geo => "http://api.openweathermap.org/geo/1.0/direct?q={city name},{state code},{country code}&limit={limit}&appid={API key}"
//Weather => "https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API key}"
var dataPass;
var cityName = "London";
let limitOption = 3;
const appID = "&appid=2ae577f7e190ce26668a9bb40cfee04d";

var geoURL = "http://api.openweathermap.org/geo/1.0/direct?q=" + cityName + "&limit=" + limitOption + appID;

fetch(geoURL , {
    method: 'GET',
}).then(function(response) {
    return response.json();
}).then(function(data) {
    console.log(data[0]);
    dataPass = data[0];

    var weatherURL = "https://api.openweathermap.org/data/2.5/weather?lat=" + dataPass.lat + "&lon=" + dataPass.lon
                + "&appid=2ae577f7e190ce26668a9bb40cfee04d";

    fetch(weatherURL, {
        method: 'GET',
    }).then(function(response) {
        return response.json();
    }).then(function(data) {
        console.log(data.main.temp);
    });
});
