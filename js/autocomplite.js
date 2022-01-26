const autoCompleteBox = document.getElementById("autoCompleteBox");

const autoIngredient = async (searchIngredient, inp) => {
  const res = await fetch(`https://api.spoonacular.com/food/ingredients/autocomplete?apiKey=${apiKey}&query=${searchIngredient}&number=20`);
  const ingredientsArr = await res.json();

  let listItems = ingredientsArr.map((e) => {
    let item = `<p class='autoItem'>${e.name}</p>`;
    return item;
  });

  //  select from drop down on click
  //TODO hide if Input or drop is not in focus
  autoCompleteBox.innerHTML = listItems.join("");
  autoCompleteBox.addEventListener("click", (e) => {
    txtIngredient.value = e.target.innerHTML;
  });

  // TODO: select with arrow keys + enter
  txtIngredient.addEventListener("keydown", (e) => {
    x = document.getElementById("autoCompleteBox");
  });
};

txtIngredient.addEventListener("input", (e) => {
  autoCompleteBox.style.display = "block";
  autoIngredient(txtIngredient.value);
  if (txtIngredient.value == "") {
    autoCompleteBox.style.display = "none";
    autoCompleteBox.innerHTML = "";
  }
  // if (e.target !== document.activeElement) console.log("NONE");
  // console.log(document.activeElement);
  // console.log(e.target);
});
