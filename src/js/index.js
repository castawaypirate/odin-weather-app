import "../css/styles.css";
import { createClient } from "pexels";

let tempUnit;
let speedUnit;

const form = document.querySelector("form");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const loader = document.querySelector(".loader");
  const results = document.querySelector("#results");

  loader.style.display = "block";
  results.style.display = "none";

  const formData = new FormData(form);
  const formDataEntries = Object.fromEntries(formData);

  if (formDataEntries["unit"] === "us") {
    tempUnit = "&#8457;";
    speedUnit = "mph";
  } else {
    tempUnit = "&#8451;";
    speedUnit = "km/h";
  }

  try {
    const weatherResponse = await fetchWeatherData(formDataEntries);
    const pexelsResponse = await fetchPexelsPhotos(
      weatherResponse.currentConditions.icon,
    );

    const min = 0;
    const max = pexelsResponse.photos.length - 1;
    const index = Math.floor(Math.random() * (max - min + 1)) + min;
    const imageUrl = pexelsResponse.photos[index].src.original;

    await renderPexelsPhoto(imageUrl);
    renderWeatherResults(weatherResponse);

    results.style.display = "flex";
  } catch (err) {
    alert(err);
  } finally {
    loader.style.display = "none";
  }
});

async function fetchPexelsPhotos(query) {
  const client = createClient(
    "sX551YgIYvZu0mEAsTtaV9zQopqBOaCETR2S7Af2xTBluNBSlkltmM14",
  );

  const orientation = "landscape";
  const size = "large";

  let response = await client.photos.search({
    query,
    per_page: 15,
    orientation,
    size,
  });

  if (!response) {
    const errorMessage = await response.text();
    throw new Error(`Error: ${response.status} - ${errorMessage}`);
  }

  return response;
}

async function renderPexelsPhoto(url) {
  const img = new Image();

  img.src = url;

  try {
    await img.decode();

    const body = document.querySelector(".container");
    body.style.backgroundImage = `url(${url})`;
  } catch (err) {
    throw new Error("Background image failed to load.");
  }
  // return new Promise((resolve, reject) => {
  //   const img = new Image();
  //
  //   img.onload = () => {
  //     img.decode();
  //     const body = document.querySelector(".container");
  //     body.style.backgroundImage = `url(${url})`;
  //     body.style.backgroundPositionY = "";
  //     resolve();
  //   };
  //
  //   img.onerror = () => {
  //     reject(new Error("Background image failed to load."));
  //   };
  //
  //   img.src = url;
  // });
}

async function fetchWeatherData(formData) {
  let response = await fetch(
    `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${formData["location"]}/today?unitGroup=${formData["unit"]}&key=2SZ556KBLKVW9QKTKUZ5R6NDS&contentType=json`,
  );
  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(`Error: ${response.status} - ${errorMessage}`);
  }

  let data = await response.json();
  return data;
}

function renderWeatherResults(data) {
  const currentConditions = data.currentConditions;

  const results = document.querySelector("#results");
  results.innerHTML = "";

  const conditionsDiv = document.createElement("div");
  const conditions = document.createElement("h2");
  conditions.textContent = currentConditions.conditions;
  const details = document.createElement("span");
  details.textContent = data.days[0].description;
  conditionsDiv.appendChild(conditions);
  conditionsDiv.appendChild(details);
  conditionsDiv.classList.add("conditions");

  const location = document.createElement("h3");
  location.textContent = data.address;
  location.classList.add("location");

  const iconDiv = document.createElement("div");
  iconDiv.classList.add("icon");
  const iconValue = currentConditions.icon;
  const svgIcon = icons[`${iconValue}`];
  iconDiv.innerHTML = svgIcon;

  const temperatureDiv = document.createElement("div");
  const temperature = document.createElement("h3");
  temperature.textContent = currentConditions.temp;
  const unitSpan = document.createElement("span");
  unitSpan.innerHTML = tempUnit;
  temperatureDiv.appendChild(temperature);
  temperatureDiv.appendChild(unitSpan);
  temperatureDiv.classList.add("temperature");

  const statsDiv = document.createElement("div");
  const stats = document.createElement("span");
  stats.innerHTML =
    "Feels Like: " +
    currentConditions.feelslike +
    " " +
    tempUnit +
    " | Humidity: " +
    currentConditions.humidity +
    "% | Wind: " +
    currentConditions.windspeed +
    " " +
    speedUnit +
    " | Rain Chance: " +
    currentConditions.precipprob +
    "%";
  statsDiv.appendChild(stats);
  statsDiv.classList.add("stats");

  results.classList.add("results");

  results.appendChild(conditionsDiv);
  results.appendChild(location);
  results.appendChild(iconDiv);
  results.appendChild(temperatureDiv);
  results.appendChild(statsDiv);
}

const icons = {
  snow: `<svg xmlns="http://www.w3.org/2000/svg" height="72px" viewBox="0 -960 960 960" width="72px" fill="#1f1f1f"><path d="M224.5-214.5Q210-229 210-250t14.5-35.5Q239-300 260-300t35.5 14.5Q310-271 310-250t-14.5 35.5Q281-200 260-200t-35.5-14.5Zm120 120Q330-109 330-130t14.5-35.5Q359-180 380-180t35.5 14.5Q430-151 430-130t-14.5 35.5Q401-80 380-80t-35.5-14.5Zm120-120Q450-229 450-250t14.5-35.5Q479-300 500-300t35.5 14.5Q550-271 550-250t-14.5 35.5Q521-200 500-200t-35.5-14.5Zm240 0Q690-229 690-250t14.5-35.5Q719-300 740-300t35.5 14.5Q790-271 790-250t-14.5 35.5Q761-200 740-200t-35.5-14.5Zm-120 120Q570-109 570-130t14.5-35.5Q599-180 620-180t35.5 14.5Q670-151 670-130t-14.5 35.5Q641-80 620-80t-35.5-14.5ZM300-360q-91 0-155.5-64.5T80-580q0-83 55-145t136-73q32-57 87.5-89.5T480-920q90 0 156.5 57.5T717-719q69 6 116 57t47 122q0 75-52.5 127.5T700-360H300Zm0-80h400q42 0 71-29t29-71q0-42-29-71t-71-29h-60v-40q0-66-47-113t-113-47q-48 0-87.5 26T333-744l-10 24h-25q-57 2-97.5 42.5T160-580q0 58 41 99t99 41Zm180-100Z"/></svg>`,
  rain: `<svg xmlns="http://www.w3.org/2000/svg" height="72px" viewBox="0 -960 960 960" width="72px" fill="#1f1f1f"><path d="M558-84q-15 8-30.5 2.5T504-102l-60-120q-8-15-2.5-30.5T462-276q15-8 30.5-2.5T516-258l60 120q8 15 2.5 30.5T558-84Zm240 0q-15 8-30.5 2.5T744-102l-60-120q-8-15-2.5-30.5T702-276q15-8 30.5-2.5T756-258l60 120q8 15 2.5 30.5T798-84Zm-480 0q-15 8-30.5 2.5T264-102l-60-120q-8-15-2.5-30.5T222-276q15-8 30.5-2.5T276-258l60 120q8 15 2.5 30.5T318-84Zm-18-236q-91 0-155.5-64.5T80-540q0-83 55-145t136-73q32-57 87.5-89.5T480-880q90 0 156.5 57.5T717-679q69 6 116 57t47 122q0 75-52.5 127.5T700-320H300Zm0-80h400q42 0 71-29t29-71q0-42-29-71t-71-29h-60v-40q0-66-47-113t-113-47q-48 0-87.5 26T333-704l-10 24h-25q-57 2-97.5 42.5T160-540q0 58 41 99t99 41Zm180-200Z"/></svg>`,
  fog: `<svg xmlns="http://www.w3.org/2000/svg" height="72px" viewBox="0 -960 960 960" width="72px" fill="#1f1f1f"><path d="M720-200q-17 0-28.5-11.5T680-240q0-17 11.5-28.5T720-280q17 0 28.5 11.5T760-240q0 17-11.5 28.5T720-200ZM280-80q-17 0-28.5-11.5T240-120q0-17 11.5-28.5T280-160q17 0 28.5 11.5T320-120q0 17-11.5 28.5T280-80Zm-40-120q-17 0-28.5-11.5T200-240q0-17 11.5-28.5T240-280h360q17 0 28.5 11.5T640-240q0 17-11.5 28.5T600-200H240ZM400-80q-17 0-28.5-11.5T360-120q0-17 11.5-28.5T400-160h280q17 0 28.5 11.5T720-120q0 17-11.5 28.5T680-80H400ZM300-320q-91 0-155.5-64.5T80-540q0-83 55-145t136-73q32-57 87.5-89.5T480-880q90 0 156.5 57.5T717-679q69 6 116 57t47 122q0 75-52.5 127.5T700-320H300Zm0-80h400q42 0 71-29t29-71q0-42-29-71t-71-29h-60v-40q0-66-47-113t-113-47q-48 0-87.5 26T333-704l-10 24h-25q-57 2-97.5 42.5T160-540q0 58 41 99t99 41Zm180-200Z"/></svg>`,
  wind: `<svg xmlns="http://www.w3.org/2000/svg" height="72px" viewBox="0 -960 960 960" width="72px" fill="#1f1f1f"><path d="M460-160q-50 0-85-35t-35-85h80q0 17 11.5 28.5T460-240q17 0 28.5-11.5T500-280q0-17-11.5-28.5T460-320H80v-80h380q50 0 85 35t35 85q0 50-35 85t-85 35ZM80-560v-80h540q26 0 43-17t17-43q0-26-17-43t-43-17q-26 0-43 17t-17 43h-80q0-59 40.5-99.5T620-840q59 0 99.5 40.5T760-700q0 59-40.5 99.5T620-560H80Zm660 320v-80q26 0 43-17t17-43q0-26-17-43t-43-17H80v-80h660q59 0 99.5 40.5T880-380q0 59-40.5 99.5T740-240Z"/></svg>`,
  cloudy: `<svg xmlns="http://www.w3.org/2000/svg" height="72px" viewBox="0 -960 960 960" width="72px" fill="#1f1f1f"><path d="M260-160q-91 0-155.5-63T40-377q0-78 47-139t123-78q25-92 100-149t170-57q117 0 198.5 81.5T760-520q69 8 114.5 59.5T920-340q0 75-52.5 127.5T740-160H260Zm0-80h480q42 0 71-29t29-71q0-42-29-71t-71-29h-60v-80q0-83-58.5-141.5T480-720q-83 0-141.5 58.5T280-520h-20q-58 0-99 41t-41 99q0 58 41 99t99 41Zm220-240Z"/></svg>`,
  "partly-cloudy-day": `<svg xmlns="http://www.w3.org/2000/svg" height="72px" viewBox="0 -960 960 960" width="72px" fill="#1f1f1f"><path d="M440-760v-160h80v160h-80Zm266 110-56-56 113-114 56 57-113 113Zm54 210v-80h160v80H760Zm3 299L650-254l56-56 114 112-57 57ZM254-650 141-763l57-57 112 114-56 56Zm-14 450h180q25 0 42.5-17.5T480-260q0-25-17-42.5T421-320h-51l-20-48q-14-33-44-52.5T240-440q-50 0-85 35t-35 85q0 50 35 85t85 35Zm0 80q-83 0-141.5-58.5T40-320q0-83 58.5-141.5T240-520q60 0 109.5 32.5T423-400q58 0 97.5 43T560-254q-2 57-42.5 95.5T420-120H240Zm320-134q-5-20-10-39t-10-39q45-19 72.5-59t27.5-89q0-66-47-113t-113-47q-60 0-105 39t-53 99q-20-5-41-9t-41-9q14-88 82.5-144T480-720q100 0 170 70t70 170q0 77-44 138.5T560-254Zm-79-226Z"/></svg>`,
  "partly-cloudy-night": `<svg xmlns="http://www.w3.org/2000/svg" height="72px" viewBox="0 -960 960 960" width="72px" fill="#1f1f1f"><path d="M504-465Zm20 385H420l20-12.5q20-12.5 43.5-28t43.5-28l20-12.5q81-6 149.5-49T805-325q-86-8-163-43.5T504-465q-61-61-97-138t-43-163q-77 43-120.5 118.5T200-484v12l-12 5.5q-12 5.5-26.5 11.5T135-443.5l-12 5.5q-2-11-2.5-23t-.5-23q0-146 93-257.5T450-880q-18 99 11 193.5T561-521q71 71 165.5 100T920-410q-26 144-138 237T524-80Zm-284-80h180q25 0 42.5-17.5T480-220q0-25-17-42.5T422-280h-52l-20-48q-14-33-44-52.5T240-400q-50 0-85 34.5T120-280q0 50 35 85t85 35Zm0 80q-83 0-141.5-58.5T40-280q0-83 58.5-141.5T240-480q60 0 109.5 32.5T423-360q57 2 97 42.5t40 97.5q0 58-41 99t-99 41H240Z"/></svg>`,
  "clear-day": `<svg xmlns="http://www.w3.org/2000/svg" height="72px" viewBox="0 -960 960 960" width="72px" fill="#1f1f1f"><path d="M440-760v-160h80v160h-80Zm266 110-55-55 112-115 56 57-113 113Zm54 210v-80h160v80H760ZM440-40v-160h80v160h-80ZM254-652 140-763l57-56 113 113-56 54Zm508 512L651-255l54-54 114 110-57 59ZM40-440v-80h160v80H40Zm157 300-56-57 112-112 29 27 29 28-114 114Zm113-170q-70-70-70-170t70-170q70-70 170-70t170 70q70 70 70 170t-70 170q-70 70-170 70t-170-70Zm283-57q47-47 47-113t-47-113q-47-47-113-47t-113 47q-47 47-47 113t47 113q47 47 113 47t113-47ZM480-480Z"/></svg>`,
  "clear-night": `<svg xmlns="http://www.w3.org/2000/svg" height="72px" viewBox="0 -960 960 960" width="72px" fill="#1f1f1f"><path d="M484-80q-84 0-157.5-32t-128-86.5Q144-253 112-326.5T80-484q0-146 93-257.5T410-880q-18 99 11 193.5T521-521q71 71 165.5 100T880-410q-26 144-138 237T484-80Zm0-80q88 0 163-44t118-121q-86-8-163-43.5T464-465q-61-61-97-138t-43-163q-77 43-120.5 118.5T160-484q0 135 94.5 229.5T484-160Zm-20-305Z"/></svg>`,
};
