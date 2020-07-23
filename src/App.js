import React, { Component } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import Form from './components/Form';
import RestaurantCard from './components/RestaurantCard';
import RestaurantModal from './components/RestaurantModal';
import { Title } from './components/Title';
import Map from './components/Map';
import categoryList from './components/CategoryList';
import GlobalStyle from './styles/GlobalStyle';
import { theme } from './styles/mainTheme';

class App extends Component {
	state = {
		cityName: '',
		restaurants: [],
		cityCenterPosition: [52.22977, 21.01178],
		icon: '',
		selectedRestaurant: '',
		selectedRestaurantId: '',
		selectedRestaurantData: {},
	};
	getDate = () => {
		const today = new Date();
		const month = today.getMonth() + 1;
		return `${today.getFullYear()}${
			month < 10 ? `0${month}` : `${month}`
		}${today.getDate()}`;
	};
	loadData(id, city = 'Warsaw') {
		const fourSquareUrl = 'https://api.foursquare.com/v2/venues/search?';
		const parameters = {
			client_id: 'IEV0NGQ2WLUULDQ1TA0OD1UPUKZG0VTO3MYIKDN2MYHIKJ1E',
			client_secret: 'SVPZ5HDAZK0JUFDNNVQBAWODV0FNG25YGM1EL5MB4SCSKRWD',
			near: city,
			categoryId: id,
			limit: 100,
			v: this.getDate(),
		};
		fetch(fourSquareUrl + new URLSearchParams(parameters))
			.then((res) => res.json())
			.then((res) => {
				if (res.response.venues) {
					this.setState((prevState) => ({
						cityCenterPosition: [
							res.response.geocode.feature.geometry.center.lat,
							res.response.geocode.feature.geometry.center.lng,
						],
						restaurants: res.response.venues.map((el) => ({
							name: el.name,
							address: {
								street: el.location.formattedAddress[0],
								city: el.location.formattedAddress[1],
							},
							lat: el.location.lat,
							lng: el.location.lng,
							latLng: {
								lat: el.location.lat,
								lng: el.location.lng,
							},
							id: el.id,
							category:
								el === true
									? el.categories[0].name
									: '4bf58dd8d48988d110941735',
						})),
						icon: `${res.response.venues[0].categories[0].icon.prefix}64${res.response.venues[0].categories[0].icon.suffix}`,
					}));
				} else {
					alert('Write a correct city name');
				}
			});
	}
	loadSelectionData(id) {
		const fourSquareUrl = `https://api.foursquare.com/v2/venues/${id}?`;
		const parameters = {
			client_id: 'IEV0NGQ2WLUULDQ1TA0OD1UPUKZG0VTO3MYIKDN2MYHIKJ1E',
			client_secret: 'SVPZ5HDAZK0JUFDNNVQBAWODV0FNG25YGM1EL5MB4SCSKRWD',
			v: this.getDate(),
		};
		fetch(fourSquareUrl + new URLSearchParams(parameters))
			.then((res) => res.json())
			.then((res) => {
				if (res.response.venue) {
					const data = res.response.venue;
					this.setState((prevState) => ({
						selectedRestaurantData: {
							id: data.id,
							location: data.location?.address || null,
							city: data.location?.city,
							rating: data.rating || null,
							ratingSignals: data.ratingSignals || null,
							priceText: data.price?.message || null,
							price: data.price?.currency || null,
							categories: data.categories.map((category) => {
								return {
									name: category.shortName,
									icon: `${category.icon?.prefix}32${category.icon?.suffix}`,
								};
							}),
							features: data.attributes?.groups?.map((attr) => {
								const items = [];
								items.push(
									...attr.items?.map((item) => {
										return { itemValue: item.displayValue };
									})
								);
								return {
									name: attr.name,
									items: items,
								};
							}),
							description: data.description || null,
							open: data.hours?.status || null,
							contact: {
								phone: data.contact?.formattedPhone || data.contact?.phone || null,
								facebook: data.contact?.facebookUsername
									? `https://facebook.com/${data.contact.facebookUsername}`
									: null,
								url: data.url || data.shortUrl || null,
							},
							photo: data.bestPhoto
								? `${data.bestPhoto?.prefix}${data.bestPhoto?.width}x${data.bestPhoto?.height}${data.bestPhoto?.suffix}`
								: null,
						},
					}));
				} else {
					alert(
						'Your query limit has run out today... Please come back tommorow!'
					);
				}
			});
	}
	findCategoryId = (e) => {
		const categoryId = categoryList
			.filter((el) => el.name === e.target[1].value)
			.map((el) => el.id);
		return categoryId;
	};
	handleSubmit = (e) => {
		e.preventDefault();
		const inputCityName = e.target[0].value;
		const categoryId = this.findCategoryId(e);
		this.loadData(categoryId, inputCityName);
		this.setState({
			cityName: inputCityName,
		});
	};
	handleSelectRestaurant = (e) => {
		const selectedCardName = e.currentTarget.getAttribute('name');
		const selectedCardId = e.currentTarget.getAttribute('id');
		this.loadSelectionData(selectedCardId);
		this.setState({
			selectedRestaurantName: selectedCardName,
			selectedRestaurantId: selectedCardId,
		});
	};
	handleSelectMarker = (e) => {
		this.setState({
			selectedRestaurant: e.target.title,
		});
	};

	render() {
		const { cityName, 
						restaurants, 
						selectedRestaurant, 
						selectedRestaurantData, 
						cityCenterPosition, 
						icon } = this.state;
		const { handleSubmit, 
						handleSelectMarker, 
						handleSelectRestaurant } = this;
		return (
			<>
				<GlobalStyle />
				<ThemeProvider theme={theme}>
					<MainWrapper>
						<Title>
							Where do you want to go tonight in{' '}
							{cityName ? cityName : 'Warsaw'} ?
						</Title>
						<Menu>
							<Form submit={handleSubmit}></Form>
							<RestaurantCard
								restaurantData={restaurants}
								onSelectRestaurant={handleSelectRestaurant}
								selectedRestaurant={selectedRestaurant}
								icon={icon}
							></RestaurantCard>
							<RestaurantModal
								selectedRestaurantData={selectedRestaurantData}
							></RestaurantModal>
						</Menu>
						<Map
							cityCenterPosition={cityCenterPosition}
							restaurantData={restaurants}
							onSelectMarker={handleSelectMarker}
							selectedRestaurant={selectedRestaurant}
						></Map>
					</MainWrapper>
				</ThemeProvider>
			</>
		);
	}
}

const Menu = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: flex-start;
	align-content: left;
	height: 70%;
	width: 60%;
`;
const MainWrapper = styled.div`
	display: flex;
	flex-direction: column;
	flex-direction: column;
	align-content: center;
	min-width: 850px;
	margin-left: 20px;
`;
export default App;
