request({
	url: "../src/data/russian-cities.json",
	onSuccess: jsonData => {
		const data = JSON.parse(jsonData)
		const necessaryFields = ['city', 'geo_lat', 'geo_lon']
		const cities = data.map(el => Object.fromEntries(Object.entries(el).filter(elem => necessaryFields.includes(elem[0]))))

		const suggest = new Suggest(document.querySelector('.suggest'), {
			data: cities.map(el => el.city)
		})


		const input = document.querySelector('.suggest')
		const buttonConfirm = document.querySelector('.button-confirm')
		const findCityButton = document.querySelector('.find-my-city-button')

		input.placeholder = 'Введите город'

		const showWeatherChosenCity = event => {

			if (event.pointerType === 'mouse') event.preventDefault()

			const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5'
			const APP_ID = ''

			const chosenCity = cities.find(el => el.city.toLowerCase() === input.value.toLowerCase())

			if (!chosenCity) {
				input.placeholder = 'Город не найден'
				input.value = ''
				return
			}

			const weatherDescription = document.querySelector('.weather__description')
			const weatherTemperature = document.querySelector('.weather__temperature')
			const weatherIcon = document.querySelector('.weather__icon')


			request({
				url: `${OPENWEATHER_BASE_URL}/weather`,
				params: {
					lat: chosenCity.geo_lat,
					lon: chosenCity.geo_lon,
					appid: APP_ID
				},
				onSuccess: (jsonData) => {
					const data = JSON.parse(jsonData)
					const KELVIN = 273.15
					const weatherType = data.weather[0].main.toLowerCase()


					weatherDescription.textContent = data.weather[0].description
					weatherTemperature.textContent = Math.round(Number(data.main.temp) - KELVIN) + ' °C'

					const weatherTypes = {
						'clear': 'url("./weather_icons/clear-sky.png")',
						'cloud': 'url("./weather_icons/clouds.png")',
						'rain': 'url("./weather_icons/rain.png")',
						'storm': 'url("./weather_icons/storm.png")',
						'snow': 'url("./weather_icons/snow.png")',
					}
					const foundType = Object.keys(weatherTypes).find(key => weatherType.includes(key))
					if (foundType) {
						weatherIcon.style.backgroundImage = weatherTypes[foundType]
					} else {
						weatherIcon.style.backgroundImage = 'none'
					}
				}
			})
		}

		const findMyCity = (event) => {
			event.preventDefault()
			const onSuccess = (position) => {
				const coords = position.coords
				const {latitude, longitude} = coords
				let minRange = 100000
				let range = 0
				let nearestCity = {}

				for (let i = 0; i < cities.length; i++) {
					range = Math.pow(latitude - Number(cities[i].geo_lat), 2) + Math.pow(longitude - Number(cities[i].geo_lon), 2)
					if (range < minRange) {
						minRange = range
						nearestCity = cities[i]
					}
				}
				input.value = nearestCity.city
			}
			const onError = () => {
				throw new Error('не получилось получить данные в navigator.geolocation')
			}

			navigator.geolocation.getCurrentPosition(onSuccess, onError)
		}

		input.addEventListener('change', showWeatherChosenCity)
		buttonConfirm.addEventListener('click', showWeatherChosenCity)
		findCityButton.addEventListener('click', findMyCity)
	}
})

