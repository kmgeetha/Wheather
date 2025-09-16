import {
    Alert,
    FlatList,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import React, { useEffect, useState } from "react";
import * as Location from "expo-location";

const openWeatherKey = "b246e289e69dabf11c635e07891e91e5"; // your API key

const Weather = () => {
    const [weather, setWeather] = useState(null);
    const [forecast, setForecast] = useState(null);
    const [refresh, setRefresh] = useState(false);
    const [city, setCity] = useState(""); // search input
    const [suggestions, setSuggestions] = useState([]); // city suggestions
    const [lastLocation, setLastLocation] = useState(null);

    const loadWeather = async (lat, lon) => {
        try {
            setRefresh(true);
            let latitude;
            let longitude;

            if (lat && lon) {
                latitude = lat;
                longitude = lon;
            } else {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== "granted") {
                    Alert.alert("Permission denied", "Enable location access to fetch weather");
                    setRefresh(false);
                    return;
                }
                let location = await Location.getCurrentPositionAsync({ enableHighAccuracy: true });
                latitude = location.coords.latitude;
                longitude = location.coords.longitude;
            }

            setLastLocation({ lat: latitude, lon: longitude });

            // ✅ Current Weather
            const currentRes = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?units=metric&lat=${latitude}&lon=${longitude}&appid=${openWeatherKey}`
            );
            const currentData = await currentRes.json();

            // ✅ Forecast
            const forecastRes = await fetch(
                `https://api.openweathermap.org/data/2.5/forecast?units=metric&lat=${latitude}&lon=${longitude}&appid=${openWeatherKey}`
            );
            const forecastData = await forecastRes.json();

            if (!currentRes.ok) {
                Alert.alert("Error", currentData.message || "Failed to load weather");
            } else {
                setWeather(currentData);
            }

            if (!forecastRes.ok) {
                Alert.alert("Error", forecastData.message || "Failed to load forecast");
            } else {
                setForecast(forecastData);
            }
        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Failed to load weather");
        } finally {
            setRefresh(false);
        }
    };

    // ✅ Fetch city suggestions as user types
    const fetchSuggestions = async (query) => {
        if (query.length < 2) {
            setSuggestions([]);
            return;
        }
        try {
            const res = await fetch(
                `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${openWeatherKey}`
            );
            const data = await res.json();
            setSuggestions(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        loadWeather(); // load device location on start
    }, []);


    const getWeatherImage = (condition) => {
        if (condition.includes("cloud")) return require("../assets/cloudy.jpeg");
        if (condition.includes("rain")) return require("../assets/rainy.jpeg");
        if (condition.includes("sun") || condition.includes("clear")) return require("../assets/sunny.png");
        if (condition.includes("snow")) return require("../assets/snow.png");
        if (condition.includes("storm") || condition.includes("thunder")) return require("../assets/strom.jpeg");
        return require("../assets/default.jpeg");
    };
    if (!weather || !forecast) {
        return (
            <View style={styles.loading}>
                <Text>Loading weather...</Text>
            </View>
        );
    }

    const current = weather.weather[0];

    return (
        <View style={styles.container}>
            {/* ✅ Search Input */}
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Enter city name"
                    value={city}
                    onChangeText={(text) => {
                        setCity(text);
                        fetchSuggestions(text);
                    }}
                />
            </View>

            {/* ✅ Suggestions Dropdown */}
            {suggestions.length > 0 && (
                <FlatList
                    data={suggestions}
                    keyExtractor={(item, index) => index.toString()}
                    style={styles.suggestionList}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.suggestionItem}
                            onPress={() => {
                                setCity(`${item.name}, ${item.country}`);
                                setSuggestions([]);
                                loadWeather(item.lat, item.lon); // fetch weather for selected city
                            }}
                        >
                            <Text>{item.name}, {item.state ? item.state + ", " : ""}{item.country}</Text>
                        </TouchableOpacity>
                    )}
                />
            )}

            <ScrollView
                refreshControl={
                    <RefreshControl
                        refreshing={refresh}
                        onRefresh={() =>
                            lastLocation ? loadWeather(lastLocation.lat, lastLocation.lon) : loadWeather()
                        }
                    />
                }
                style={{ marginTop: 10 }}
            >
                {/* ✅ Current Weather */}
                <Text style={styles.title}>Current Weather</Text>
                <Image
                    source={getWeatherImage(current.description.toLowerCase())}
                    style={{ width: 120, height: 120, alignSelf: "center" }}
                />
                <Text style={{ textAlign: "center" }}>{current.description}</Text>
                <Text style={{ textAlign: "center" }}>Temperature: {weather.main.temp}°C</Text>

                {/* ✅ Forecast */}
                <Text style={[styles.title, { marginTop: 20 }]}>5 Day Forecast</Text>
                {forecast.list.slice(0, 5).map((item, index) => (
                    <View key={index} style={styles.forecastItem}>
                        <Text>{new Date(item.dt * 1000).toLocaleString()}</Text>

                        <Text>{item.weather[0].description}</Text>
                        <Text>{item.main.temp}°C</Text>
                        <View style={{alignSelf:'flex-end'}} >
                            <Image
                                source={getWeatherImage(item.weather[0].description.toLowerCase())}
                                style={{ width: 50, height: 50 }}
                            />
                        </View>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

export default Weather;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#ECDBBA", padding: 10 },
    loading: { flex: 1, justifyContent: "center", alignItems: "center" },
    title: { textAlign: "center", fontSize: 20, fontWeight: "bold", color: "#333" },
    searchContainer: { marginTop: 40, marginBottom: 10 },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 8,
        backgroundColor: "#fff",
    },
    suggestionList: {
        backgroundColor: "#fff",
        borderRadius: 8,
        maxHeight: 150,
        marginBottom: 10,
    },
    suggestionItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    forecastItem: {
        marginVertical: 8,
        padding: 10,
        backgroundColor: "#fff",
        borderRadius: 8,
        elevation: 2,
    },
});
