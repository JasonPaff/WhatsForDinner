const apiKey = "88d877514e7d458aac097379c5a5ed83";
const urlRecipe = "https://api.spoonacular.com/recipes/";
//fields
const divRecipes = document.getElementById("divRecipes");
const txtIngredient = document.getElementById("txtAddIngredient");
const maxUsed = document.getElementById("maxUsed");
const minMissed = document.getElementById("minMissed");
const divImg = document.getElementById("divImg");
const gitHubLogo = document.getElementById("gitHubLogo");
const Body = document.getElementById("Body");

//buttons
const btnAddIngredient = document.getElementById("btnAddIngredient");
const btnFindRecipe = document.getElementById("btnFindRecipes");
const ulIngredients = document.getElementById("ulIngredients");
const ingredientContainer = document.querySelector("#ingredientContainer");
// const divRecipes = document.querySelector("#divRecipes");
const btnCookAtHome = document.getElementById("btnCookAtHome");
const btnDineOut = document.getElementById("btnDineOut");
const sldFilterRange = document.getElementById("rngFilter");
const lblRangeFilter = document.getElementById("lblRangeFilter");
//variables
const ingredientsArr = [];
const lettersOnly = /^[a-zA-Z]/g;

// modal variables
const modalContent = document.querySelector("#modalContent");
const fullRecipeContainer = document.querySelector("#fullRecipeContainer");
const closeModal = document.querySelector("#closeModal");

// event listener to close recipe card
closeModal.addEventListener("click", function () {
  fullRecipeContainer.style.display = "none";
});

// When the modal is shown, we want a fixed body
document.body.style.position = "fixed";
document.body.style.top = `-${window.scrollY}px`;

// When the modal is hidden, we want to remain at the top of the scroll position
const scrollY = document.body.style.top;
document.body.style.position = "";
document.body.style.top = "";
window.scrollTo(0, parseInt(scrollY || "0") * -1);

/*
 example GET for find by ingredients
 https://api.spoonacular.com/recipes/findByIngredients?ingredients=apples,+flour,+sugar&number=2
 separate ingredients by commas and plus sign ',+'
 separate parameters with a '&' e.g. ingredients= and number=
 gets 5 basic recipes that includes the ingredients chicken, cheese and cord
 use recipe id from the recipe to get the detailed recipe information
*/

// Fetching Ingredient ID
async function getRecipeIDs(ingredients, number) {
  let url = `${urlRecipe}findByIngredients?apiKey=${apiKey}&ingredients=${ingredients}&ignorePantry=true${getSortingString()}&number=${number}`;
  console.log("ids url" + url);
  const response = await fetch(url);
  console.log("response= " + response);
  // return (recipeIDs = await response.json());
  return await response.json();
}

// Fetching Recipes of ID
async function getRecipeFromID(recipeID) {
  let url = `${urlRecipe}${recipeID}/information?apiKey=${apiKey}`;
  console.log(`Recipe from id link is: ${url}`);
  const response = await fetch(url);
  // return (recipes = await response.json());
  return await response.json();
}

// Displaying Full recipe in separate div (need to make it as a Modal)
async function displayFullRecipe(id) {
  let fullRecipeObj = await getRecipeFromID(id);
  //TEST

  let allIngredientsList = fullRecipeObj.extendedIngredients.map((e) => {
    return `<li class="recipeIngredientsList">${e.original}</li>`;
  });
  let instructions = fullRecipeObj.instructions;
  if (instructions == null) instructions = " ";
  modalContent.innerHTML = `
    <h2>${fullRecipeObj.title}</h2>
    <img id="imgModal" src="${fullRecipeObj.image}" style="float: right" alt="${fullRecipeObj}"/>
    <ul style="display: inline-block;">${allIngredientsList.join("")}</ul>
    <p class="readyInMinutes">Cook Time: ${fullRecipeObj.readyInMinutes} </p>
    <p class='instructions'>${instructions}</p>
    <button id="accordion">Chef's Summary</button>
    <div id="panel">
      <p class='summary'>${fullRecipeObj.summary}</p>
    </div>
  `;
  console.log(fullRecipeObj);
  fullRecipeContainer.style.display = "flex"; // modal code
  const accBtn = document.getElementById("accordion");
  accBtn.addEventListener("click", () => {
    if (document.getElementById("panel").style.display === "block") {
      document.getElementById("panel").style.display = "none";
    } else {
      document.getElementById("panel").style.display = "block";
    }
  });
}
// Display Title and Picture of ID Recipe
function displayRecipesFromSearch(recipes) {
  console.log("logging recipes search");
  console.log(recipes);
  divRecipes.innerHTML = "";
  recipes.forEach((recipe) => {
    let recipeContainer = `
        <ul class="listOfTitles">
            <li><img src=${recipe.image} alt='image of '${recipe.title}/></li>
            <li class="itemTitle">${recipe.title}</li>
            
            <li class="itemUsed">${recipe.usedIngredientCount} used ingredients</li>
            <li class="itemMissing">${recipe.missedIngredientCount} missing ingredients</li>
            <li class="itemLikes">${recipe.likes} likes</li>
            <button id="btnDisplayRecipe" onclick = "displayFullRecipe('${recipe.id}')">Show More</button>
        </ul>
        `;
    divRecipes.insertAdjacentHTML("beforeend", recipeContainer);
  });
}

// Display list of ingredients
function displayIngredient(ingredient) {
  if (!ingredient.match(lettersOnly)) {
    console.log("matching - false");
    txtIngredient.className = txtIngredient.className + " error";
    return;
  }
  txtIngredient.classList.remove("error");
  console.log("matching true");
  let newIngredientLi = `
    <li class="liIngredient" id="${removeSpaces(ingredient)}">
        ${ingredient}
        <span class="removeItem" onclick = "removeIngredient('${ingredient}')" >&times;</span>
    </li>`;

  ingredientsArr.push(removeSpaces(ingredient));
  ulIngredients.insertAdjacentHTML("beforeend", newIngredientLi);
}

//removing item from ingredients list
function removeIngredient(item) {
  console.log(`removed: ${item}`);
  ulIngredients.removeChild(document.getElementById(`${removeSpaces(item)}`));
  let i = ingredientsArr.indexOf(item);
  ingredientsArr.splice(i, 1);
  console.log(ingredientsArr);
}

// grabs input from text box
function getInputIngredient() {
  let ingredient = txtIngredient.value;
  console.log("input= " + ingredient);
  txtIngredient.value = "";
  return ingredient;
}

// converting arr of Ingredients to string
function stringToSearch() {
  console.log("ingredientsArr: " + ingredientsArr.join(",+"));
  return ingredientsArr.join(",+");
}

// trim and replace spaces in input of more than 1 word
function removeSpaces(val) {
  let noSpaces = val.trim(); //extra step if space needed to be replaced (not just removed)
  return noSpaces.split(" ").join("+");
}

// Ingredients Input on Click
btnAddIngredient.addEventListener("click", () => {
  displayIngredient(getInputIngredient());
  autoCompleteBox.style.display = "none";
  console.log(ingredientsArr);
});

// Ingredients Input on Enter Key
txtIngredient.addEventListener("keyup", function (event) {
  if (event.key === "Enter") {
    btnAddIngredient.click();
  }
});

//Search recipes with given ingredients
btnFindRecipe.addEventListener("click", async () => {
  if (ingredientsArr.length === 0) {
    console.log("empty");
    return;
  }
  divImg.style.display = "none";
  let number = sldFilterRange.value;
  console.log("sending number = " + number);
  let recipes = await getRecipeIDs(stringToSearch(), number);
  if (recipes !== "") {
    console.log("recipes=" + recipes);
    divRecipes.style.display = "flex";
    displayRecipesFromSearch(recipes);

    // modal code
    const btnDisplayRecipe = document.getElementsByClassName("btnDisplayRecipe");
    for (let element of btnDisplayRecipe) {
      console.log("THIS THING RIGHT HERE", element);
      element.addEventListener("click", ({ target }) => displayFullRecipe(target.value));
    }
  } else {
    console.log("empty arr");
  }
});

// Cook at home shows ingredient div ( hides main button div )
btnCookAtHome.addEventListener("click", () => {
  //   let divButton = document.getElementById("divButtons");
  //   divButton.style.display = "none";
  let divIngredients = document.getElementById("divIngredients");
  divIngredients.style.display = "block";
  let divDineOut = document.getElementById("divDineOutMain");
  divDineOut.style.display = "none";

  divRecipes.style.display = "flex";
});

btnDineOut.addEventListener("click", () => {
  let divButton = document.getElementById("divIngredients");
  divButton.style.display = "none";
  let divDineOut = document.getElementById("divDineOutMain");
  divDineOut.style.display = "block";
  waitToCreateMap = false; // changing wait on dineOut.js so map can now init
  divImg.style.display = "none";
  divRecipes.style.display = "none";
  gitHubLogo.style.display = "none";
  searchResults = [];
  initMap();
});

// update label with slider value for number of recipes to return in search
sldFilterRange.addEventListener("input", function () {
  lblRangeFilter.innerHTML = this.value;
  console.log(this.value);
});

function getSortingString() {
  let sortString = maxUsed.checked || minMissed.checked ? "&ranking=" : "";
  if (maxUsed.checked) {
    sortString += "1";
  } else if (minMissed.checked) {
    sortString += "2";
  }
  console.log(sortString);
  return sortString;
}

//TEST random
function randomPic() {
  let images = [];
  let i = 0;
  images[0] = "meal1.jpg";
  images[1] = "meal2.jpg";
  images[2] = "meal3.jpg";
  images[3] = "meal4.jpg";
  images[4] = "meal5.jpg";
  images[5] = "meal6.jpg";
  i = Math.floor(Math.random() * images.length);
  return images[i];
}

divImg.innerHTML = ` <img id="imgLogo" src="images/${randomPic()}" alt='food image' />`;
