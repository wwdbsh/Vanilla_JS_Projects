import { API_KEY, BACKGROUND_IMAGES, GREETING_EXPR, PROVERBS_COLLECTION, WEATHER_ICONS } from "./components/Common.js";
/**********************DOM ELEMENTS**********************/
let body = null; // body
let clock = null; // clock
let greet = null; // greeting part
let innerGreet = null; // inner element of greet
let resetBtn = null; // reset button
let todoBtn = null; // todo button
let date = null; // date

// name modal
let nameModalContainer = null;
let nameModalInput = null;
let nameModalBtn = null;

// greeting based on current time
let greetText = null;

// main task
let mainTaskInputContainer = null;
let mainTaskInput = null;

// reset modal
let resetModalContainer = null;
let resetModalSubmit = null;
let resetModalCancel = null;

// weather
let weatherRegion = null;
let weatherUpper = null;

// todo
let todoContainer = null;
let pendingNav = null;
let finishedNav = null;
let pendingList = null;
let finishedList = null;
let todoInput = null;
let todoInputAddBtn = null;
/********************************************************/

// variables for todo
let pendingId = 0;
let finishedId = 0;
let pendingTodo = [];
let finishedTodo = [];

export const runScript = () => {
    body = document.getElementsByTagName("body")[0];
    clock = document.getElementById("clock");
    date = document.getElementById("date");
    greet = document.getElementById("greet");
    nameModalContainer = document.getElementById("name-modal-container");
    nameModalInput = document.getElementById("name-input");
    nameModalBtn = document.getElementById("name-submit-btn");
    resetBtn = document.getElementById("reset-btn");
    todoBtn = document.getElementById("todo-btn");
    resetModalContainer = document.getElementById("reset-modal-container");
    resetModalSubmit = document.getElementById("reset-submit");
    resetModalCancel = document.getElementById("reset-cancel");
    todoContainer = document.getElementById("todo-container");
    pendingNav = document.getElementById("pending-nav");
    finishedNav = document.getElementById("finished-nav");
    pendingList = document.getElementById("pending-list");
    finishedList = document.getElementById("finished-list");
    todoInput = document.getElementById("todo-input");
    todoInputAddBtn = document.getElementById("todo-add-btn");
    mainTaskInputContainer = document.getElementById("main-task-input-container");
    mainTaskInput = document.getElementById("main-task-input");
    weatherRegion = document.getElementById("weather-region");
    weatherUpper = document.getElementById("weather-upper");
    
    updateCurrentTime();
    generateRandomBgImage();
    checkRegisteredUser();
    addEventListeners(); // add events
    loadTodos();
    loadCoords();
};

// add events
const addEventListeners = () => {
    // reset modal events
    resetBtn.addEventListener("click", () => resetModalContainer.classList.add("show-modal")); // reset button
    resetModalCancel.addEventListener("click", () => resetModalContainer.classList.remove("show-modal")); // reset cancel
    resetModalContainer.addEventListener("click", () => resetModalContainer.classList.remove("show-modal"));
    resetModalSubmit.addEventListener("click", resetLocalStorage); // reset confirm

    // name modal events
    nameModalBtn.addEventListener("click", registerUser); // name modal btn
    nameModalInput.addEventListener("keyup", e => {if(e.keyCode === 13){registerUser()}});

    // todo events
    todoBtn.addEventListener("click", () => todoContainer.classList.toggle("show")); // todo button
    pendingNav.addEventListener("click", () => {
        pendingList.classList.add("show");
        finishedList.classList.remove("show");
        pendingNav.classList.add("fill");
        finishedNav.classList.remove("fill");
    });
    finishedNav.addEventListener("click", () => {
        pendingList.classList.remove("show");
        finishedList.classList.add("show");
        pendingNav.classList.remove("fill");
        finishedNav.classList.add("fill");
    });
    todoInput.addEventListener("keyup", e => {
        if(e.target.value && e.key === "Enter"){
            const text = e.target.value;
            e.target.value = "";
            addTodoTask("pending", text);
        }
    });
    todoInputAddBtn.addEventListener("click", () => {
        if(todoInput.value){
            const text = todoInput.value;
            todoInput.value = "";
            addTodoTask("pending", text);
        }
    });

    // main task
    mainTaskInput.addEventListener("keyup", e => {
        if(e.target.value && e.key === "Enter"){
            const task = e.target.value;
            e.target.value = "";
            mainTaskInputContainer.classList.remove("show");
            addTodoTask("pending", task);
        }
    });

    // window events
    window.addEventListener("keyup", e => {
        if(todoContainer.classList.contains("show")){ // todo box
            if(e.key === "Escape"){
                todoContainer.classList.remove("show");
            }
        }
        if(resetModalContainer.classList.contains("show-modal")){ // reset modal
            if(e.key === "Escape"){
                resetModalContainer.classList.remove("show-modal");
            }
        }
    });
};

// load coordinate
const loadCoords = () => {
    const loadedCoords = localStorage.getItem("coords");
    if(loadedCoords === null){
        askForCoords();
    }else{
        const parsedCoords = JSON.parse(loadedCoords);
        getWeather(parsedCoords.latitude, parsedCoords.longitude);
    }
};

const saveCoords = coordsObj => {
    localStorage.setItem("coords", JSON.stringify(coordsObj));
};

const getWeather = async (lat, lng) => {
    const data = await (await fetch(`http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${API_KEY}&units=metric`)).json();
    const temp = data.main.temp;
    const region = data.name;
    const code = data.weather[0].icon.substr(0, 2);
    // const country = data.sys.country;
    // const weather = data.weather[0].main;
    // const windDeg = data.wind.deg;
    // const windSpeed = data.wind.speed;
    weatherUpper.innerHTML = "";
    const icon = document.createElement("i");
    icon.className = WEATHER_ICONS[code];
    icon.id = "weather-icon";
    weatherUpper.appendChild(icon);

    const temperature = document.createElement("span");
    temperature.className = "weather-temp";
    temperature.id = "weather-temp";
    temperature.innerText = Math.floor(temp) + 'º';
    weatherUpper.appendChild(temperature);

    weatherRegion.innerText = region.toLowerCase();
    // console.log(data);
};

const handleGeoSuccess = position => {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    const coordsObj = {
        latitude,
        longitude,
    };
    saveCoords(coordsObj);
    getWeather(latitude, longitude);
};

const handleGeoError = () => {
    console.log("Can't access geo location");
};

// ask coordinates
const askForCoords = () => {
    navigator.geolocation.getCurrentPosition(handleGeoSuccess, handleGeoError);
};

// load todo list
const loadTodos = () => {
    const loadedPending = localStorage.getItem("pending");
    const loadedFinished = localStorage.getItem("finished");
    localStorage.removeItem("pending");
    localStorage.removeItem("finished");
    if(loadedPending !== null){
        const parsedPending = JSON.parse(loadedPending);
        parsedPending.forEach(todo => {
            addTodoTask("pending", todo.text);
            pendingId = Math.max(pendingId, parseInt(todo.id, 10));
        });
    }
    if(loadedFinished !== null){
        const parsedFinished = JSON.parse(loadedFinished);
        parsedFinished.forEach(todo => {
            addTodoTask("finished", todo.text);
            finishedId = Math.max(finishedId, parseInt(todo.id, 10));
        });
    }
};

// save todo tasks into local storage
const saveTodos = type => {
    if(type === "pending"){
        localStorage.setItem(type, JSON.stringify(pendingTodo));
    }else{
        localStorage.setItem(type, JSON.stringify(finishedTodo));
    }
};

// add a todo task
const addTodoTask = (type, text) => {
    const item = document.createElement("li");
    let newId = null;
    if(type === "finished"){
      newId = finishedId + 1;
      finishedId++;
    }else{
      newId = pendingId + 1;
      pendingId++;
    }
    item.id = newId;
  
    const textBox = document.createElement("span");
    textBox.innerText = text + " ";
    item.appendChild(textBox);
  
    const delBtn = document.createElement("i");
    delBtn.className = "fa fa-times";
    item.appendChild(delBtn);
  
    const subBtn = document.createElement("i");
    type === "pending" ? (subBtn.className = "fa fa-check") : (subBtn.className = "fa fa-refresh");
    item.appendChild(subBtn);
  
    delBtn.addEventListener("click", e => {
        const li = e.target.parentNode;
        li.classList.add("deleted");
        setTimeout(() => deleteItem(e), 1000);
    });
    subBtn.addEventListener("click", move);
  
    const todoObj = {
      text:text,
      id:newId
    };
    if(type === "finished"){
      finishedTodo.push(todoObj);
      finishedList.childNodes[0].appendChild(item);
    }else{
      pendingTodo.push(todoObj);
      pendingList.childNodes[0].appendChild(item);
    }
    saveTodos(type);
    return item;
  };

// move function (pending => finished, finished => pending)
const move = e => {
    const li = e.target.parentNode;
    const text = li.children[0].innerText;
    const ul = li.parentNode;
    const parent = ul.parentNode;
    if(parent.id === "pending-list"){
        li.classList.add("move-to-finished");
        addTodoTask("finished", text);
    }else{
        li.classList.add("move-to-pending");
        addTodoTask("pending", text);
    }
    setTimeout(()=> deleteItem(e), 1200);
};
  
// delete function
const deleteItem = e => {
    const li = e.target.parentNode;
    const ul = li.parentNode;
    const parent = ul.parentNode;
    ul.removeChild(li);
    const cleanTodos = list => list.filter(todo => todo.id !== parseInt(li.id, 10));
    if(parent.id === "pending-list"){
        pendingTodo = cleanTodos(pendingTodo, li);
        saveTodos("pending");
    }else{
        finishedTodo = cleanTodos(finishedTodo, li);
        saveTodos("finished");
    }
};

// reset local storage
const resetLocalStorage = () => {
    localStorage.clear();
    innerGreet.innerText = "";
    pendingList.childNodes[0].innerHTML = "";
    finishedList.childNodes[0].innerHTML = "";
    resetBtn.classList.remove("show");
    todoBtn.classList.remove("show");
    todoContainer.classList.remove("show");
    resetModalContainer.classList.remove("show-modal");
    nameModalContainer.classList.add("show-modal");
};

// check if a user is registered
const checkRegisteredUser = () => {
    const user = localStorage.getItem("reg-user");
    if(user){
        nameModalContainer.classList.remove("show-modal");
        greet.innerHTML = `<div class="inner-greet" id="inner-greet">${greetText}${user}</div>`
        innerGreet = document.getElementById("inner-greet");
        innerGreet.addEventListener("mouseover", () => innerGreet.innerText = PROVERBS_COLLECTION[Math.floor(Math.random()*PROVERBS_COLLECTION.length)]);
        innerGreet.addEventListener("mouseleave", () => innerGreet.innerText = greetText + user);
        resetBtn.classList.add("show");
        todoBtn.classList.add("show");
    }else{
        nameModalContainer.classList.add("show-modal");
    }
};

// register an user
const registerUser = () => {
    const name = nameModalInput.value;
    nameModalInput.value = "";
    if(name){
        localStorage.setItem("reg-user", name);
        nameModalContainer.classList.remove("show-modal");
        greet.innerHTML = `<div class="inner-greet" id="inner-greet">${greetText}${name}</div>`
        innerGreet = document.getElementById("inner-greet");
        innerGreet.addEventListener("mouseover", () => innerGreet.innerText = PROVERBS_COLLECTION[Math.floor(Math.random()*PROVERBS_COLLECTION.length)]);
        innerGreet.addEventListener("mouseleave", () => innerGreet.innerText = greetText + name);
        resetBtn.classList.add("show");
        todoBtn.classList.add("show");
    }
};

// get a random background image
const generateRandomBgImage = () => {
    const bgImage = BACKGROUND_IMAGES[Math.floor(Math.random()*BACKGROUND_IMAGES.length)];
    body.style.backgroundImage = `url(./src/img/${bgImage})`;
};

// update current time 
const updateCurrentTime = () => {
    const currentTime = new Date();
    const h = currentTime.getHours();
    const m = currentTime.getMinutes();
    const s = currentTime.getSeconds();
    const dateString = currentTime.toDateString().split(" ");
    clock.innerText = `${h < 10 ? "0" + h : h}:${m < 10 ? "0" + m : m}:${s < 10 ? "0"+s : s}`;
    date.innerText = `${dateString[1].toUpperCase()} ${dateString[2]}, ${dateString[3]}`;
    if(h >= 6 && h < 12){
        greetText = GREETING_EXPR[0];
    }else if(h >= 12 && h < 18){
        greetText = GREETING_EXPR[1];
    }else if(h >= 18 && h < 21){
        greetText = GREETING_EXPR[2];
    }else{
        greetText = GREETING_EXPR[3];
    }
};

// perform updateCurrentTime func every second
setInterval(() => {
    updateCurrentTime();
}, 1000);

setInterval(() => {
    getWeather();
}, 60000*30);