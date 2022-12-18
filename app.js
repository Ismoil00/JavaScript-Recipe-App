/******************* Recipe App ********************/
// || M O D E L:
//DOM connections:
const randomImage = document.getElementById("randomImage");
const randomFoodName = document.getElementById("randomFoodName");
const heartIcon = document.getElementById("heartIcon");
const favoriteCategory = document.getElementById("favoriteMeal");
const nextRecipe = document.getElementById("nextRecipe");
const clearFavorites = document.getElementById("clearFavorites");
const searchInput = document.getElementById("searchInput");
const moreInfoSection = document.getElementById("moreInfoSection");
const mainRecipeSection = document.getElementById("mainRecipeSection");
const body = document.getElementsByTagName("body")[0];
const windowWidth = window.innerWidth;

//Useful Variables:
let tempRandMealImg = "";
let tempRandMealName = "";
let tempRandMealId = "";
let prevSearchState = false;
let prevSearchText = "";

let saveFavMeals = [];
let savedIDs = JSON.parse(localStorage.getItem("mealData"));
if (savedIDs) {
  saveFavMeals = savedIDs;
  renderFavoriteMeals();
}

//Rendering favorite meals from the storage:
function renderFavoriteMeals() {
  favoriteCategory.innerHTML = null;
  if (saveFavMeals.length > 0) {
    clearFavorites.style.display = "block";
  } else {
    clearFavorites.style.display = "none";
  }
  for (let a = 0; a < saveFavMeals.length; a++) {
    favoriteMealDisplay(
      saveFavMeals[a].id,
      saveFavMeals[a].thumbnail,
      saveFavMeals[a].mealName
    );
  }
}

//Deleting favorite meals:
function deleteFavoriteMeal(id) {
  let deletedOnes = {};
  let undeletedOnes = [];
  saveFavMeals.forEach((meal) => {
    if (meal.id !== id) {
      undeletedOnes.push(meal);
    } else if (meal.id === id) {
      deletedOnes = meal;
    }
  });
  saveFavMeals = undeletedOnes;
  saveMealIDs();
  renderFavoriteMeals();
  if (undeletedOnes.length === 0 || deletedOnes.id === tempRandMealId) {
    heartIcon.style.color = "";
    return;
  }
}

//Searching Meals by given name:
async function searchMealByName(name) {
  const url = await fetch(
    `https://www.themealdb.com/api/json/v1/1/search.php?s=${name}`
  );
  const response = await url.json();
  const data = response.meals;
  if (data === null) {
    moreInfoSection.style.display = "block";
    mainRecipeSection.style.display = "none";
    moreInfoSection.innerHTML = `<div id="turnOffMoreInfo" onclick="fadeFavMoreInfo()">x</div>`;
    moreInfoSection.innerHTML += `<div class="searchErr"><p>Meal was not found!</p><p>Please, make sure you have <u>type correct meal name</u> or <u>search another meal!</u></p></div>`;
  } else {
    displaySearchMeals(data);
  }
  console.log(data);
}

//Fetching Random Meal from API:
async function randomRecipeFetch() {
  const url = await fetch("https://www.themealdb.com/api/json/v1/1/random.php");
  const response = await url.json();
  return response.meals[0];
}

//heart button click function:
function heartBtnClick() {
  for (let i = 0; i < saveFavMeals.length; i++) {
    if (saveFavMeals[i].id === tempRandMealId) {
      heartIcon.style.color = "";
      let undeletedOnes = saveFavMeals.filter((each) => {
        if (each.id !== tempRandMealId) {
          return true;
        }
      });
      saveFavMeals = undeletedOnes;
      saveMealIDs();
      renderFavoriteMeals();
      return;
    }
  }
  saveFavMeals.push({
    id: tempRandMealId,
    thumbnail: tempRandMealImg,
    mealName: tempRandMealName,
  });
  saveMealIDs();
  renderFavoriteMeals();
  heartIcon.style.color = "red";
}

//Getting more information about Meals:
async function getMoreInfo(id) {
  const url = await fetch(
    `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
  );
  const response = await url.json();
  const data = response.meals[0];
  showMoreInfo(data);
}

//Getting more information about Searched Meals:
async function getMoreSearchedInfo(id) {
  const url = await fetch(
    `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
  );
  const response = await url.json();
  const data = response.meals[0];
  prevSearchState = true;
  showMoreInfo(data);
}

//Saving Searched Meals to Favorite Meals and Rendering them:
async function saveSearchedMeals(id) {
  const url = await fetch(
    `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
  );
  const response = await url.json();
  const data = response.meals[0];
  const mealId = data.idMeal;
  const mealName = data.strMeal;
  const mealImg = data.strMealThumb;
  let heartColor = document.getElementById(`${mealImg.slice(45)}`);
  for (let i = 0; i < saveFavMeals.length; i++) {
    if (saveFavMeals[i].id === mealId) {
      heartColor.classList.remove("heartColor");
      let undeletedOnes = saveFavMeals.filter((each) => {
        if (each.id !== mealId) {
          return true;
        }
      });
      saveFavMeals = undeletedOnes;
      saveMealIDs();
      renderFavoriteMeals();
      return;
    }
  }
  saveFavMeals.push({
    id: mealId,
    thumbnail: mealImg,
    mealName: mealName,
  });
  saveMealIDs();
  renderFavoriteMeals();
  heartColor.classList.add("heartColor");
}

//Adding Red Color to Search Heart Icons:
function heartRedColorAdd(id) {
  let heartColor = document.getElementById(`${id}`);
  for (let i = 0; i < saveFavMeals.length; i++) {
    if (saveFavMeals[i].thumbnail.slice(45) === id) {
      heartColor.classList.add("heartColor");
    }
  }
}

// || C O N T R O L L E R:
//Calling Random Meal to be Displayed:
randomRecipeDisplay();

//"Heart Button" click listener:
heartIcon.addEventListener("click", () => {
  heartBtnClick();
});

//saving ID array to LocalStorage:
function saveMealIDs() {
  localStorage.setItem("mealData", JSON.stringify(saveFavMeals));
}

//Setting interval for "Next Random Recipe":
setInterval(nextRecipeAnimation, 5000);

//"Next Recipe" button:
nextRecipe.addEventListener("click", async () => {
  await randomRecipeDisplay();
  randomMealHeartColor();
});

//Clear Favorite Meals Click Listener:
clearFavorites.addEventListener("click", () => {
  clearAllFavoriteMeals();
});

//Random Meal Image Click Listener:
randomImage.addEventListener("click", () => {
  getMoreInfo(tempRandMealId);
});

//'Serch Icon' click listener:
function searchMealBtn() {
  prevSearchText = searchInput.value;
  searchMealByName(prevSearchText);
}

// || V I E W:
//Random meal rendering:
async function randomRecipeDisplay() {
  const randomRecipeData = await randomRecipeFetch();
  const randomImg = randomRecipeData.strMealThumb;
  const randomName = randomRecipeData.strMeal;
  const randomID = randomRecipeData.idMeal;
  randomImage.src = randomImg;
  randomFoodName.textContent = randomName;
  tempRandMealImg = randomImg;
  tempRandMealName = randomName;
  tempRandMealId = randomID;
}

//Favorite meal display:
function favoriteMealDisplay(id, thumbnail, name) {
  let shortName = name.length > 15 ? `${name.slice(0, 15)}...` : name;

  favoriteCategory.innerHTML += `
    <figure id="${name}" onmouseover="showXFav(event.target.id)" onmouseleave="removeXFav(event.target.id)">
      <div id="${id}" onclick="deleteFavoriteMeal(event.target.id)">x</div>
      <img src=${thumbnail} width="100" title="click for more information" onclick="getMoreInfo(${id})"/>
      <figcaption>${shortName}</figcaption>
    </figure>`;
}

//Displaying Favorite Meals "X" delete icon:
function showXFav(id) {
  const xIcon = document.getElementById(`${id}`).querySelector("div");
  saveFavMeals.forEach((meal) => {
    if (meal.mealName === id) {
      xIcon.style.visibility = "visible";
    }
  });
}

//Removing Favorite Meals "X" delete icon:
function removeXFav(id) {
  const xIcon = document.getElementById(`${id}`).querySelector("div");
  saveFavMeals.forEach((meal) => {
    if (meal.mealName === id) {
      xIcon.style.visibility = "hidden";
    }
  });
}

//Clearing all favorite meals:
function clearAllFavoriteMeals() {
  saveFavMeals = [];
  localStorage.clear();
  heartIcon.style.color = "";
  renderFavoriteMeals();
}

//Animating "Next Recipe" LOGO:
function nextRecipeAnimation() {
  if (nextRecipe.classList.contains("spanAnimation")) {
    nextRecipe.classList.remove("spanAnimation");
  } else {
    nextRecipe.classList.add("spanAnimation");
  }
}

//Showing more information about Favorite Meals clicking on them:
function showMoreInfo(res) {
  let youTubeLink = res.strYoutube.replace("watch?v=", "embed/");
  let whatchOnYouTube = res.strYoutube;
  let mealName = res.strMeal;
  let category = res.strCategory;
  let area = res.strArea;
  let instruction = res.strInstructions;
  let sourceLink = res.strSource;
  let ingredients = [];
  let measures = [];
  let allIngredients = [];
  for (const each in res) {
    if (
      each.slice(0, 13) === "strIngredient" &&
      res[each] !== "" &&
      res[each] !== " " &&
      res[each] !== null
    ) {
      ingredients.push(res[each]);
    } else if (
      each.slice(0, 10) === "strMeasure" &&
      res[each] !== "" &&
      res[each] !== " " &&
      res[each] !== null
    ) {
      measures.push(res[each]);
    }
  }
  for (let i = 0; i < ingredients.length; i++) {
    allIngredients.push({
      ingredient: ingredients[i],
      measure: measures[i],
    });
  }

  moreInfoSection.style.display = "block";
  mainRecipeSection.style.display = "none";
  body.style.minHeight = "100vh";
  body.style.background =
    "linear-gradient(rgb(231, 252, 255), rgb(255, 255, 255))";
  body.style.backgroundRepeat = "no-repeat";

  moreInfoSection.innerHTML = `
    <div id="turnOffMoreInfo" onclick="fadeFavMoreInfo()">x</div>
    <iframe
        width="500"
        height="300"
        src="${youTubeLink}"
        title="YouTube video player"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      ></iframe>
    <a href="${whatchOnYouTube}" target="_blank">Watch it on YouTube Website!</a>
    <h2>${mealName}</h2>
    <p><span class="headSections">Category:</span> <span class="bigInfo">${category}</span></p>
    <p><span class="headSections">Area:</span> <span class="bigInfo">${area}</span></p>
    <p><span class="headSections">Ingredients:</span> 
    ${allIngredients.map(
      (each) =>
        `<span id="ingredients"> ${each.ingredient} - ${each.measure}</span>`
    )} </p>
    <p><span class="headSections">Instructions:</span> <span id="instruction">${instruction}</span></p>
    <a href="${sourceLink}" target="_blank">Learn More!</a>
  `;
}

//Cancelling 'More Information' Section:
function fadeFavMoreInfo() {
  if (!prevSearchState) {
    moreInfoSection.style.display = "none";
    moreInfoSection.innerHTML = null;
    mainRecipeSection.style.display = "flex";
    randomMealHeartColor();
  } else if (prevSearchState) {
    prevSearchText = searchInput.value;
    searchMealByName(prevSearchText);
    prevSearchState = false;
  }
}

//Displaying searched meals:
function displaySearchMeals(data) {
  moreInfoSection.style.display = "block";
  mainRecipeSection.style.display = "none";
  body.style.minHeight = "100vh";
  body.style.background =
    "linear-gradient(rgb(231, 252, 255), rgb(255, 255, 255))";
  body.style.backgroundRepeat = "no-repeat";
  moreInfoSection.innerHTML = `<div id="turnOffMoreInfo" onclick="fadeFavMoreInfo()">x</div>`;

  data.forEach((meal) => {
    let mealId = meal.idMeal;
    let mealName = meal.strMeal;
    let mealImg = meal.strMealThumb;
    let heartID = mealImg.slice(45);
    let category = meal.strCategory;
    let area = meal.strArea;
    let instruction;
    if (windowWidth < 460 && windowWidth > 350) {
      instruction =
        meal.strInstructions.length > 100
          ? `${meal.strInstructions.slice(0, 50)}...`
          : meal.strInstructionsme;
    } else if (windowWidth > 460) {
      instruction =
        meal.strInstructions.length > 100
          ? `${meal.strInstructions.slice(0, 150)}...`
          : meal.strInstructionsme;
    } else if (windowWidth <= 350) {
      instruction = "";
    }

    moreInfoSection.innerHTML += `
    <article id="mealArticle">
      <div id="searchImg">
        <img src="${mealImg}" alt="${mealName}" title="click for more information" loading="lazy" width="200" onclick="getMoreSearchedInfo(${mealId})">
      </div>
      <div id="searchInfo">
        <p>${mealName}</p>
        <p>${category}</p>
        <p>${area}</p>
        <p id="searchInst">${instruction}</p>
      </div>
      <div class="searchHeartIcon" id="${heartID}" onclick="saveSearchedMeals(${mealId})">&#10084;</div>
    </article>
    `;
    heartRedColorAdd(heartID);
  });

  if (data.length === 1) {
    const article = document.getElementById("mealArticle");
    article.style.borderBottom = "none";
  }
}

//'Random Meal' heart coloring:
function randomMealHeartColor() {
  for (let i = 0; i < saveFavMeals.length; i++) {
    if (saveFavMeals[i].id === tempRandMealId) {
      heartIcon.style.color = "red";
      return;
    } else {
      heartIcon.style.color = "";
    }
  }
  if (saveFavMeals.length === 0) {
    heartIcon.style.color = "";
  }
}
