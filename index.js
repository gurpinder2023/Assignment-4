const setup = async () => {


  const difficultyTimes = {
    easy: 20,     // Set the time for the "easy" difficulty level (in seconds)
    medium: 30,   // Set the time for the "medium" difficulty level (in seconds)
    hard: 45      // Set the time for the "hard" difficulty level (in seconds)
  };



  let isPowerUpAvailable = false;

  const startButton = document.getElementById("start");
  const difficultydiv = document.getElementById("difficulty");
  let difficultyLevel;
  const gameContainer = document.querySelector("#game_grid");
  let numpairs;
  const clickContainer = document.querySelector("#total_clicks");
  const matchContainer = document.querySelector("#match");
  const unmatchContainer = document.querySelector("#unmatch");
  const totalPairContainer = document.querySelector("#total_pair");
  const timeContainer = document.querySelector("#timer");
  const powerupBtn = document.querySelector("#powerup");

  let timerInterval = null;
  let isTimerRunning = false;
  let firstpokecard = undefined;
  let secondpokecard = undefined;
  let ispokecardClickable = true;
  let matchNum = 0;
  let unmatchNum = 0;
  let numClicks = 0;
  let seconds = 0;

  //click on start button to show the pokecards.
  startButton.addEventListener("click", async () => {
    const checkbox = difficultydiv.querySelector("input[type='radio']:checked");

    if (checkbox) {
      difficultyLevel = checkbox.value;
      switch (difficultyLevel) {
        case "easy":
          numpairs = 4;
          break;
        case "medium":
          numpairs = 8;
          break;
        case "hard":
          numpairs = 12;
          break;
      }
      //filling the container to show the pokecard in div and then images for front and back image
      gameContainer.innerHTML = "";

      for (let i = 0; i < numpairs * 2; i++) {
        const pokecard = document.createElement("div");
        pokecard.classList.add("pokecard");
        const frontFace = document.createElement("img");
        frontFace.classList.add("front_face");
        frontFace.id = `img${i + 1}`;
        frontFace.src = "";
        const backFace = document.createElement("img");
        backFace.classList.add("back_face");
        backFace.src = "back.webp";
        pokecard.appendChild(frontFace);
        pokecard.appendChild(backFace);
        gameContainer.appendChild(pokecard);
      }


      //fetching images of random pokemon from pokeapi
      const response = await fetch(
        "https://pokeapi.co/api/v2/pokemon?limit=810"
      );

      const data = await response.json();
      randomPokemonImageUrls = [];
      for (let i = 0; i < numpairs; i++) {
        const randomPok = data.results[Math.floor(Math.random() * data.results.length)];
        const randomPokurl = await fetch(randomPok.url);
        const randomPokData = await randomPokurl.json();
        const randomImageUrl = randomPokData.sprites.other['official-artwork'].front_default;
        randomPokemonImageUrls.push(randomImageUrl);
      }

      function getRandomIndex() {
        return Math.floor(Math.random() * (numpairs * 2));
      }

      const filledpokecardIndex = [];
      for (let j = 0; j < numpairs; j++) {
        let index1 = getRandomIndex();

        while (filledpokecardIndex.includes(index1)) {
          index1 = getRandomIndex();
        }
        filledpokecardIndex.push(index1);

        let index2 = getRandomIndex();
        while (filledpokecardIndex.includes(index2) || index2 === index1) {
          index2 = getRandomIndex();
        }
        filledpokecardIndex.push(index2);
        gameContainer.children[index1].children[0].src = randomPokemonImageUrls[j];
        gameContainer.children[index2].children[0].src = randomPokemonImageUrls[j];
      }


      //setting number of clicks.
      numClicks = 0;
      clickContainer.innerHTML = `Number of clicks : ${numClicks}`;

      //setting matched pair
      matchNum = 0;
      matchContainer.innerHTML = `Number of matched pairs : ${matchNum}`;

      //setting total number of pairs 
      totalPairContainer.innerHTML = `Total number of pairs :  ${numpairs}`;

      //unmatched pairs
      unmatchNum = numpairs;
      unmatchContainer.innerHTML = `Number of unmatched pairs : ${unmatchNum}`;

      //setting timer
      clearInterval(timerInterval);
      seconds = 0;
      timeContainer.innerHTML = `Time: ${seconds} seconds`;

      // Set the time based on the difficulty level
      const timeInSeconds = difficultyTimes[difficultyLevel];
      setTimer(timeInSeconds);


      // Reset the pokecards
      $(".pokecard").removeClass("flip");
      $(".pokecard").off("click");
      isTimerRunning = false;
      firstpokecard = undefined;
      secondpokecard = undefined;
      ispokecardClickable = true;
    }
  });

  function startTimer() {
    isTimerRunning = true;
    timerInterval = setInterval(() => {
      seconds--;
      timeContainer.innerHTML = `Time: ${seconds} seconds left`;

      if (seconds === 0) {
        stopTimer();
      } else if (seconds === 15) {
        isPowerUpAvailable = true;
        alert("Power-Up available! Click OK to activate it.");
        activatePowerUp();
      }
    }, 1000);
  }


  function setTimer(timeInSeconds) {
    seconds = timeInSeconds;
    timeContainer.innerHTML = `Time: ${seconds} seconds`;
  }


  function stopTimer() {
    clearInterval(timerInterval);

    if (matchNum !== numpairs) {
      setTimeout(() => {
        alert("You lose! Game over.");
      }, 1000);
    } else {
      setTimeout(() => {
        alert("Congratulations! You won!");
      }, 1000);
    }
  }



  //resetting the game using reset button
  const resetButton = document.querySelector("#reset");
  resetButton.addEventListener("click", () => {
    clearInterval(timerInterval);
    seconds = 0;
    timeContainer.innerHTML = `Time: ${seconds} seconds`;

    // Reset the number of clicks
    numClicks = 0;
    clickContainer.innerHTML = `Number of clicks: ${numClicks}`;

    // Reset the number of matched pairs
    matchNum = 0;
    matchContainer.innerHTML = `Number of matched pairs: ${matchNum}`;

    // Reset the number of unmatched pairs
    unmatchNum = numpairs;
    unmatchContainer.innerHTML = `Numeber of unmatched pairs: ${unmatchNum}`;


    // Reset the pokecards
    $(".pokecard").removeClass("flip");
    $(".pokecard").on("click");
  });



  //power up 
  function activatePowerUp() {
    if (isPowerUpAvailable) {
      $(".pokecard").each(function () {
        const pokecard = $(this);
        if (!pokecard.hasClass("matched")) {
          pokecard.addClass("flip");
          setTimeout(() => {
            pokecard.removeClass("flip");
          }, 1500);
        }
      });

      isPowerUpAvailable = false; // Disable the power-up after it has been used
    }
  }




  //Flipping the pokecards.
  $("#game_grid").on("click", ".pokecard", function () {
    if (!isTimerRunning) {
      startTimer();
    }
    if (!ispokecardClickable || $(this).hasClass("matched")) return;
    numClicks += 1;
    clickContainer.innerHTML = `Number of Clicks: ${numClicks}`;
    $(this).toggleClass("flip");

    const clickedFrontFace = $(this).find(".front_face")[0];

    if (!firstpokecard) {
      firstpokecard = clickedFrontFace;
    } else {
      secondpokecard = clickedFrontFace;

      if (firstpokecard === secondpokecard) {
        firstpokecard = undefined;
        secondpokecard = undefined;
        return; // Exit the function without making the pokecard unclickable
      }

      if (firstpokecard.src === secondpokecard.src) {
        matchNum += 1;
        unmatchNum -= 1;
        matchContainer.innerHTML = `Number of matched pairs: ${matchNum}`;
        unmatchContainer.innerHTML = `Number of unmatched pairs: ${unmatchNum}`;
        $(`#${firstpokecard.id}`).parent().addClass("matched");
        $(`#${secondpokecard.id}`).parent().addClass("matched");
        firstpokecard = undefined;
        secondpokecard = undefined;
      } else {
        ispokecardClickable = false;
        setTimeout(() => {
          $(`#${firstpokecard.id}`).parent().toggleClass("flip");
          $(`#${secondpokecard.id}`).parent().toggleClass("flip");
          firstpokecard = undefined;
          secondpokecard = undefined;
          ispokecardClickable = true;
        }, 1000);
      }

      if (matchNum === numpairs) {
        stopTimer();
      }
    }
  });

};






$(document).ready(setup);


$(document).ready(function () {
  // Dark mode button click event handler
  $("#darkModeButton").click(function () {
    $("body").toggleClass("dark-mode");
  });
});
