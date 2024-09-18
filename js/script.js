  const wrapper = document.querySelector(".wrapper"), //wrapper matlab pura website part except palette and dark mode
  inputPart = document.querySelector(".input-part"),//ye sec only for 1st page auto and city 
  infoTxt = inputPart.querySelector(".info-txt"),//ye part for loading and error message
  inputField = inputPart.querySelector("input"),//city input part
  locationBtn = inputPart.querySelector("button"),//location bbutton
  weatherPart = wrapper.querySelector(".weather-part"),//ye sec city ke liye bas temp and 4 infos
  forecastSection = wrapper.querySelector(".forecast"),//ek section for pura forecast part ka
  forecastDetails = forecastSection.querySelector(".forecast-details"),//7 days detail cause hourly toh graph se dikhega
  wIcon = weatherPart.querySelector("img"),//city ke upar o image ati hai woh
  arrowBack = wrapper.querySelector("header i");//heading weather app with left arrow

  //Declaring Variables:
  let api;
  let apiKey = "b190a0605344cc4f3af08d0dd473dd25";
  // Event listener for back button
  arrowBack.addEventListener("click", () => {
  wrapper.classList.remove("active");// removes the class active from css
  clearWeatherData();
  clearPersonalizedMessage(); // Clear the personalized message
  }); 

  function clearPersonalizedMessage() {
  const messageElement = document.querySelector(".personalized-message");
  messageElement.innerText = ""; // Clear the message
  }

  // Event listeners
  inputField.addEventListener("keyup", (e) => {
  if (e.key === "Enter" && inputField.value.trim() !== "") {
    requestApi(inputField.value.trim());
  }
  });


  // Function to request weather data
  function requestApi(city) {
  api = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
  fetchData();
  }

  // Function to handle geolocation success
  function onSuccess(position) {
  const { latitude, longitude } = position.coords;
  api = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`;
  fetchData();
  }

  // Function to handle geolocation error
    function onError(error) {
      switch (error.code) {
          case error.PERMISSION_DENIED:
              infoTxt.innerText = "Location access denied. Please enter your city manually.";
              break;
          case error.POSITION_UNAVAILABLE:
              infoTxt.innerText = "Location information is unavailable. Please try again.";
              break;
          case error.TIMEOUT:
              infoTxt.innerText = "Request timed out. Please try again.";
              break;
          default:
              infoTxt.innerText = "An unknown error occurred. Please enter your city manually.";
              break;
      }
      infoTxt.classList.add("error");
      clearWeatherData();
  }


  locationBtn.addEventListener("click", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(onSuccess, onError);
  } else {
    alert("Your browser does not support geolocation API.");
  }
  });

  // Function to clear forecast data
  function clearForecast() {
  forecastDetails.innerHTML = ""; // Clear daily forecast details inside that HTML here forecastDetails
  }

  // Function to clear hourly forecast data
  function clearHourlyForecast() {
  if (weatherChart) {
    weatherChart.destroy();
  }
  }

  // Function to clear weather data
  function clearWeatherData() {
  wIcon.src = "";
  weatherPart.querySelector(".temp .numb").innerText = "";
  weatherPart.querySelector(".weather").innerText = "";
  weatherPart.querySelector(".location span").innerText = "";
  weatherPart.querySelector(".temp .numb-2").innerText = "";
  weatherPart.querySelector(".humidity span").innerText = "";
  weatherPart.querySelector(".wind span").innerText = "";
  weatherPart.querySelector(".date-time").innerText = "";
  infoTxt.innerText = "";
  forecastSection.style.display = "block"; // Ensure forecast section is visible
  clearForecast(); // Clear previous forecast data
  clearHourlyForecast(); // Clear previous hourly forecast data
  clearPersonalizedMessage(); // Clear the personalized message

  }

  // Function to get weather icon based on weather id
  function getWeatherIcon(weatherId) {
    if (weatherId === 800) {
      return "icons/clear.svg";
    } else if (weatherId >= 200 && weatherId <= 232) {
      return "icons/storm.svg";
    } else if (weatherId >= 600 && weatherId <= 622) {
      return "icons/snow.svg";
    } else if (weatherId >= 701 && weatherId <= 781) {
      return "icons/haze.svg";
    } else if (weatherId >= 801 && weatherId <= 804) {
      return "icons/cloud.svg";
    } else if ((weatherId >= 500 && weatherId <= 531) || (weatherId >= 300 && weatherId <= 321)) {
      return "icons/rain.svg";
    } else {
      return "icons/unknown.svg";
    }
  }
  // Function to display weather details
  function weatherDetails(info) {
    const { name: city, sys: { country }, weather: [{ description, id }], main: { temp, feels_like, humidity }, wind: { speed }, dt } = info;
    
    const weatherDate = new Date(dt * 1000).toLocaleString('en', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });

    wIcon.src = getWeatherIcon(id);
    weatherPart.querySelector(".temp .numb").innerText = Math.round(temp);
    weatherPart.querySelector(".weather").innerText = description;
    weatherPart.querySelector(".location span").innerText = `${city}, ${country}`;
    weatherPart.querySelector(".temp .numb-2").innerText = Math.round(feels_like);
    weatherPart.querySelector(".humidity span").innerText = `${humidity}%`;
    weatherPart.querySelector(".wind span").innerText = `${speed} m/s`;
    weatherPart.querySelector(".date-time").innerText = weatherDate;
    
    infoTxt.classList.remove("pending", "error");
    infoTxt.innerText = "";
    inputField.value = "";
    wrapper.classList.add("active");
  }
  //Setting Up Chart Context:
  const weatherChartCtx = document.getElementById("weatherChart").getContext("2d");
  let weatherChart;

  // Function to create or update weather chart
  function createWeatherChart(labels, data) {
  if (weatherChart) {
  weatherChart.destroy();
  }
    
  weatherChart = new Chart(weatherChartCtx, {
  type: "line", // Change chart type as needed (line, bar, etc.)
  data: {
    labels: labels,
    datasets: [{
      label: "Temperature (°C)",
      data: data,
      backgroundColor: "rgba(54, 162, 235, 0.6)",
      borderColor: "rgba(54, 162, 235, 1)",
      borderWidth: 1,
      fill: false
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      yAxes: [{
        ticks: {
          beginAtZero: true
        }
      }]
    }
  }
  });
  }


    // Function to update hourly forecast
    //1 x-axis hrs
    //2 y-axis temp
    //3 create arrays then we forloop for every hour 
    //4 then we put the temp and hour in the arrays and this goes for 24 times
    //5 create chart func is called 
    function updateHourlyForecast(hourlyData) {
      const labels = [];
      const data = [];

      hourlyData.forEach((hour) => {
        const { dt, temp } = hour;
        const hourOfDay = new Date(dt * 1000).toLocaleTimeString('en', { hour: 'numeric', hour12: true });
        labels.push(hourOfDay);
        data.push(temp);
      });

      createWeatherChart(labels, data); // Create or update hourly weather chart
    }
    
  // Function to update daily forecast
  function updateForecast(dailyData) {
  forecastDetails.innerHTML = ""; // Clear previous forecast details

  dailyData.forEach((day) => {// This line loops through each element (representing a day's forecast) in the dailyData array.
    const { dt, weather: [{ description, id }], temp: { max, min } } = day; //const { dt, weather: [{ description, id }], temp: { max, min } } = day;: This line extracts specific properties from each day object: dt (date), description and id (weather details), and max and min (temperature details). 
    const dayOfWeek = new Date(dt * 1000).toLocaleDateString('en', { weekday: 'long' });
    
    const forecastCard = document.createElement("div");//created a new div named dorecastCard i.e every card of every week
    forecastCard.classList.add("forecast-card");//adds class for css styling
    forecastCard.innerHTML = `
      <div class="forecast-day">${dayOfWeek}</div> 
      <img src="${getWeatherIcon(id)}" alt="Weather Icon" />
      <div class="forecast-temp">
        <span an class="max-temp">${Math.round(max)}°C</span> / 
        <span class="min-temp">${Math.round(min)}°C</span>
      </div>
      <div class="forecast-desc">${description}</div>
    `;
    forecastDetails.appendChild(forecastCard);
  });
  }



  // Function to fetch daily forecast data
  function fetchForecast(latitude, longitude) {
  const forecastApi = `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=current,minutely,hourly&units=metric&appid=${apiKey}`;

  fetch(forecastApi)
    .then((res) => res.json())
    .then((data) => {
      if (data.cod && data.cod === "404") {
        infoTxt.innerText = "Forecast data not available";
        infoTxt.classList.replace("pending", "error");
        clearForecast();
      } else {
        updateForecast(data.daily.slice(1, 8)); // Update forecast for next 7 days ,eg : tues, .., mon if today is mon
      }
    })
    .catch(() => {
      infoTxt.innerText = "Forecast data not available";
      infoTxt.classList.replace("pending", "error");
      clearForecast();
    });
  }
  // Function to fetch hourly forecast data
  function fetchHourlyForecast(latitude, longitude) {
  const hourlyForecastApi = `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=current,daily,minutely&units=metric&appid=${apiKey}`;

  fetch(hourlyForecastApi)
  .then((res) => res.json())
  .then((data) => {
    if (data.cod && data.cod === "404") {
      infoTxt.innerText = "Hourly forecast data not available";
      infoTxt.classList.replace("pending", "error");
      clearHourlyForecast();
    } else {
      //not the 24th hour is included
      //data.hourly is an array and we slice it in(0,24) and send this data 
      updateHourlyForecast(data.hourly.slice(0, 24)); // Update hourly forecast for next 24 hours
    }
  })
  .catch(() => {
    infoTxt.innerText = "Hourly forecast data not available";
    infoTxt.classList.replace("pending", "error");
    clearHourlyForecast();    
  });
  }


  // Function to fetch weather data from API
  //called after the url gets set 
  //1 we change the test to fetching we..
  //2 change classlist 
  //3 the fecth(api) gets called 
  //4 then we get the data then cal functions
  //5 1)clear the weather data 2)weather details 3)get 7 days forecast 4)hourly 5)msg 
  //6 then catch function
  function fetchData() {

  infoTxt.innerText = "Fetching weather details...";
  infoTxt.classList.add("pending");

  fetch(api)
  //when we get data it comes in raw text format so after convertingto json its get easily accessed and readable format 
    .then((res) => res.json())
    .then((result) => {//json resut is used here
      if (result.cod && result.cod === "404") {
        infoTxt.innerText = `${inputField.value} is not a valid city name`;
        infoTxt.classList.replace("pending", "error");
        clearWeatherData();
      } else {
        //weaterdetails ke time we pass the result else where we pass the coord of lat and long and also with msg
        clearWeatherData(); // Clear previous weather and forecast data
        weatherDetails(result);
        fetchForecast(result.coord.lat, result.coord.lon); // Fetch 7-day forecast
        fetchHourlyForecast(result.coord.lat, result.coord.lon); // Fetch hourly forecast
        generatePersonalizedMessage(result);
      }
    })
    //catch just handels the errors in the fetching process 
    //1 text it changes
    //2 adds classlist 
    //calls clear weather data
    .catch(() => {
      infoTxt.innerText = "Something went wrong";
      infoTxt.classList.replace("pending", "error");
      clearWeatherData();
    });
  }


  document.addEventListener("DOMContentLoaded", () => {
  const messageElement = document.querySelector(".personalized-message");
  messageElement.innerText = ""; // Set the default message
  });





  //1 we pass the weather data in this function 
  //2 them we extract temp 
  //3 then the desc
  //4 then set a variable message empty 
  //so while selecting for the message we check for desc if it includes rain , snow , clear , deizzle then it checks temp whole about if and else 
  function generatePersonalizedMessage(weatherData) {
  const temp = weatherData.main.temp;
  const description = weatherData.weather[0].description;
  let message = "";

  // Messages based on temperature and weather description
  if (description.includes("clear")) {
      if (temp < 0) {
          message = "It's a clear, chilly day. Brrr, stay warm and cozy!";
      } else if (temp < 10) {
          message = "A clear, crisp day. Don’t forget to wear a warm jacket!";
      
  } else if (temp < 20) {
  message = "Clear skies and cool temperatures. Perfect for a light jacket!";
  } else if (temp < 30) {
  message = "Clear and pleasant weather. Enjoy the sunshine and stay cool!";
  } else {
  message = "Clear and hot outside. Make sure to stay hydrated and cool off!";
  }
  } else if (description.includes("cloudy")) {
  if (temp < 0) {
  message = "It's cloudy and freezing. Bundle up warmly to stay comfortable!";
  } else if (temp < 10) {
  message = "Cloudy with a chill in the air. A warm coat will help against the cold.";
  } else if (temp < 20) {
  message = "Cloudy but cool. A sweater or light jacket will be just right.";
  } else if (temp < 30) {
  message = "Cloudy and mild. Enjoy the day with a light outfit!";
  } else {
  message = "Cloudy and hot. Stay hydrated and try to stay cool!";
  }
  } else if (description.includes("rain") || description.includes("drizzle")) {
  if (temp < 0) {
  message = "It's freezing and rainy. Stay dry and warm with waterproof gear!";
  } else if (temp < 10) {
  message = "Rainy and chilly. Wear a raincoat and stay warm.";
  } else if (temp < 20) {
  message = "Rainy and cool. A rain jacket and umbrella are recommended.";
  } else if (temp < 30) {
  message = "Rainy but mild. Dress comfortably and don’t forget your umbrella!";
  } else {
  message = "Hot and rainy. Keep cool and carry an umbrella qto stay dry!";
  }
  } else if (description.includes("snow")) {
  if (temp < 0) {
  message = "Snowy and freezing. Keep warm and enjoy the winter wonderland!";
  } else if (temp < 10) {
  message = "Snowy and cold. Dress warmly and stay safe on snowy paths.";
  } else if (temp < 20) {
  message = "Snowy but less cold. A warm coat and boots will make things more comfortable.";
  } else if (temp < 30) {
  message = "Snowy and mild. Enjoy the snow but dress warmly!";
  } else {
  message = "Snowy and warm? That’s unusual! Stay cool and enjoy the unique weather!";
  }
  } else {
  if (temp < 0) {
  message = "It's quite cold outside. Make sure to dress warmly!";
  } else if (temp < 10) { w 
  message = "It's a bit chilly. A warm coat would be a good idea.";
  } else if (temp < 20) {
  message = "The weather is pleasant today. Enjoy the day!";
  } else if (temp < 30) {
  message = "It’s getting warm. Stay hydrated and enjoy!";
  } else {
  message = "It’s quite hot out. Make sure to stay cool and drink plenty of water!";
  }
  }

  message += ` Currently, it's ${description}.`;
  document.querySelector(".personalized-message").innerText = message;
  }



  // Change Color Theme

  //0 gettheeme always executes at first 
  //1 array of colors is made 
  //2 colorbtns const made using squeryselectorall 
  //3 event listener is added to all the buttons 
  //4 when button is pressed the changetheme function gets triggered and then we change the primary color in css by changing it to this color that we pass when we call this function
  //5 so in css this primary color is set as bg color 
  //6 same case with dark color 
  getTheme(); //This function retrieves the saved theme color from local storage.

  function getTheme() {
  const theme = localStorage.getItem("theme");
  if (theme) {
    changeTheme(theme);
  }
  }
  

  var isDark = false;
  const colors = [
  "hsl(200, 20%, 60%)",
  "hsl(160, 20%, 60%)",
  "hsl(30, 30%, 70%)  "
  ];
  const colorBtns = document.querySelectorAll(".theme-color");//all spans with class theme-color
  const darkModeBtn = document.querySelector(".dark-mode-btn");

  darkModeBtn.addEventListener("click", () => {
  isDark = !isDark;
  changeTheme(isDark ? "#000" : colors[0]);// rem true and false is used here if after clicking button after changing bool its true then black else 
  });
  //again in case of darkmode as well the changetheme is called 
  
  
  function changeTheme(color) {
    document.documentElement.style.setProperty("--primary-color", color);
    saveTheme(color);//saves to local storage so the color we set last time appear 
    }
  function saveTheme(color) {
  localStorage.setItem("theme", color);
  }
 
  colorBtns.forEach((btn, index) => {
  btn.style.backgroundColor = colors[index];//till here all the colors are given bg colors by indexes using for loop 
  btn.addEventListener("click", () => {//each btn eventlistener is added so when button is clicked 
    changeTheme(btn.style.backgroundColor);//change theme function gets triggeredand the btns color is send po
  });
  });



 
