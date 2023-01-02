$(document).ready(function () {

     //Saving the user's input into a variable and call the function that displays the weather info
    $('#search-button').click(function (event) {
        event.preventDefault();

        var cityName = $('#search-input').val().trim()
        
        storeCityToLocalStorage(cityName);

        // var cityNames
        // //Getting cities Array from local storage
        // var cities = localStorage.getItem('cities');
        // //Checking to see if the cities array contains data
        // if(cities === null){
        //     //This block is called only when the cities array is empty (first time when the application is used)
        //     cityNames = [];
        // }else {
        //     //This is called if cities array from the local storage is not empty.
        //     cityNames = JSON.parse(localStorage.getItem('cities'));
        // }
        // //Adding city name to the cityNames array we got from the local storage.
        // cityNames.push(cityName);
        // //Putting the cityNames array back into the local storage after stringifying it.
        // localStorage.setItem('cities', JSON.stringify(cityNames));
        // console.log(localStorage.getItem('cities'));
        displayCityWeather(cityName);
        populateHistoryBtnContainer();
    })

    function getCitiesArrayFromLocalStorage(){
        var cities = localStorage.getItem("cities")
        if (cities === null){
            localStorage.setItem("cities", JSON.stringify([]))
        }
        return JSON.parse(localStorage.getItem("cities"))   
    }
    
    function storeCityToLocalStorage(cityName) {
        var cities = getCitiesArrayFromLocalStorage()
        cities.push(cityName)
        localStorage.setItem("cities", JSON.stringify(cities)); 
    }
    
    function populateHistoryBtnContainer(){
        var city = JSON.parse(localStorage.getItem("cities"))
        //citiesSearchHistory.forEach(city => {
            createSearchHistoryBtn(city)
        //}); 
        
    }
   
    function createSearchHistoryBtn(city){
         var buttonEl = $('<button>').addClass('btn btn-secondary search-button btn-block').text(city);
        $('#history').prepend(buttonEl)
        buttonEl.click(function(event){
            displayCityWeather(city);
        });
    }


    //Displays both the current weather and 5 day weather forecast
    function displayCityWeather(cityName) {
        var APIkey = '52d558d3ab565a0485f70b38fab6c332'
        var queryURL = "http://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&appid=" + APIkey;


        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function (response) {
            displayCityCurrentWeather(cityName, response);
            return { lon: response.coord.lon, lat: response.coord.lat }

        }).then(function ({ lon, lat }) {
            var queryURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${APIkey}`;

            $.ajax({
                url: queryURL,
                method: "GET"
            }).then(function (response) {
                displayFiveDayForecast(response);
            });
        });
    }

    //Displays the current weather conditions
    function displayCityCurrentWeather(cityName, data) {
        $('#today').empty();
        $('#today').append(createCurrentWeatherCard(cityName, data));
    }
    //Displays the weather forecast for 5 days
    function displayFiveDayForecast(data) {
        $('#forecast').empty();
        $('#forecast-title').removeClass('invisible')

        //Appends the different days weather by looping through the time stamps
        //With the 3-hour step APIdata a day has 8 time stamps,
        //We iterate at the 8th time stamp through the 40 timestamps count
        for (var i = 7; i < data.cnt; i += 8) {
            $('#forecast').append(createForecastCard(data.list[i]));
        }
    }
    //This creates the current weather card
    function createCurrentWeatherCard(cityName, weatherData) {

        function createTitleElement(cityName, weatherData) {
            var date = formatDate(weatherData.dt);
            var iconURL = getWeatherIconURL(weatherData.weather[0].icon);

            var iconEl = $('<img>').attr('src', iconURL)
            var titleEl = $('<h4>').addClass('card-title')
            var imageSpanEl = $('<span>').html(iconEl)

            return titleEl.text(cityName + ' ' + date).append(imageSpanEl)
        }

        var cardEl = $('<div>').addClass('card mr-2').css({ 'width': '62rem' })
        var cardBody = $('<div>').addClass('card-body')

        var titleEl = createTitleElement(cityName, weatherData)
        const { tempEl, windEl, humidityEl } = createWeatherStatsElements(weatherData)

        cardBody.append(titleEl, tempEl, windEl, humidityEl);
        cardEl.append(cardBody);

        return cardEl;
    }
    //builds up the forecast card used by the 5 days forecast
    function createForecastCard(weatherData) {
        var date = formatDate(weatherData.dt);
        var iconURL = getWeatherIconURL(weatherData.weather[0].icon)

        var cardEl = $('<div>').addClass('card mr-2').css({ 'width': '12rem' })
        var cardBody = $('<div>').addClass('card-body').css({ 'color': 'white', 'background-color': '#001A53' })
        var dateEl = $('<h5>').addClass('card-title').text(date)
        var iconEl = $('<img>').attr('src', iconURL)
        const { tempEl, windEl, humidityEl } = createWeatherStatsElements(weatherData)

        cardBody.append(dateEl, iconEl, tempEl, windEl, humidityEl);
        cardEl.append(cardBody);

        return cardEl;
    }
    //Creates element that hold the weather statistics
    function createWeatherStatsElements(weatherData) {
        var tempCelsius = convertTempToCelsius(weatherData.main.temp)
        var humidity = weatherData.main.humidity
        var windSpeedKPH = convertWindSpeedToKPH(weatherData.wind.speed)

        var tempEl = $('<p>').addClass('card-text').text('Temp: ' + tempCelsius + ' °C')
        var windEl = $('<p>').addClass('card-text').text('Wind: ' + windSpeedKPH + ' KPH')
        var humidityEl = $('<p>').addClass('card-text').text('Humidity: ' + humidity + '%')

        return {
            tempEl: tempEl,
            windEl: windEl,
            humidityEl: humidityEl
        }
    }
    //Changing time from unix format to date month and year
    function formatDate(unixTime) {
        return moment.unix(unixTime).format("DD/M/YYYY");
    }
    // Returns the URL for weather icon
    function getWeatherIconURL(iconText) {
        return 'https://openweathermap.org/img/w/' + iconText + '.png';
    }
    //Converts wind speed from MPH to KPH
    function convertWindSpeedToKPH(speed) {
        return Number(speed * 3.6).toFixed(2)
    }
    //Converts temperature from Kelvin to Celsius
    function convertTempToCelsius(tempKelvin) {
        return Number(tempKelvin - 273.15).toFixed(2);
    }


    //find out how to extract icon from json data//okay
    /*
    ----displayFiveDayForecast(lat, log)----
        // When you receive an array of 5-day forecast

        forecastDays = response.list

        
        for (let day in forecastDays){
        var item = createForecastDayItem(day)
        forecastDaysContainer.append(item)
        }


    createForecastDayItem(forecastDayData)
    var temp = ...
    var humidity = ..
    var speed = ...
    var date

    var containerCard = ...
    var date = $(..).text(formatDate(..))
    var iconEl = $("<img>).attr("src", getWeatherIconURL(icon-text))
    var tempEl = $("div").text("Temp " + temp + "C" )
    ...
    ...

    return containerCard(date, icon, temp, wind..)


    formatDate()
        return moment(..).

    getWeatherIconURL(icon-text)
        return -icon url -> https://openweathermap.org/img/w/+ icon-text +.png

    $("<img>).attr("src" getWeatherIconURL(icon-text))

    When user enters city:
    - goto the geo api that takes city and return lat & lon
    - call displayCurrentWeatherForecast(lat, lon)
    - call displayFiveDayForecast(lat, lon)

    displayCurrentWeatherForecast(lat, lon)
        queryURL -> https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API key}

    displayFiveDayForecast(lat, lon)
        queryURL -> api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={API key}

    displaySearchHistory(cityArray // from localStorage)

    if cities.length == 0:
            * display empty search history container
    else {
        for(let city of cities){ //["Paris", "London"]
            var cityBtn = createCityButton()
            searchContainer.append(cityBtn)
        }
    }

    search()
    * send ajax request to api with a query-url containing city
    * inside event listener ->
        shift -> at front [] <- push at the back

        1. localStorage -> []
        2. perfom a search of some city's weather e.g London
        3. push 'city' to localStorage -- ['London']
        4. call dispalySearchHistory
            * create city button and attach listener to it which which calls the api using "city's name"
                inside listener function
                *$(this).val() <button value="London">London</Button>
                *$(this).attr("data-city") <button data-city="London">London</Button>
                *$(this).data("city") <button data-city="London">London</Button>

        5. Another search e.g Paris
            repeat 3 ( if you want Paris at front use shiftarray method instead of push)
            repeat 4
            ["Paris", "London"]


    */
})
