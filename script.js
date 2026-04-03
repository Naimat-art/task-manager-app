// ================= STATE =================
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let groups = JSON.parse(localStorage.getItem("groups")) || [];

let currentFilter = "all";
let currentGroup = "All";

// ================= SELECTORS =================
const input = document.getElementById("task-input");
const addTaskBtn = document.getElementById("add-task-btn");
const searchInput = document.getElementById("search-task");
const groupList = document.getElementById("group-list");
const clearBtn = document.getElementById("clear-completed");

// ================= EVENT LISTENERS =================
addTaskBtn.addEventListener("click", addTask);

input.addEventListener("keypress", function(e){
  if(e.key === "Enter") addTask();
});

// ADD GROUP
document.querySelector(".groupMain").addEventListener("click", function(){
  const name = prompt("Enter group name:");
  if(!name) return;

  groups.push(name);
  saveGroups();
  renderGroups();
});

// GROUP CLICK
groupList.addEventListener("click", function(e){

  // 👉 DELETE GROUP
  const deleteBtn = e.target.closest(".delete-group-btn");
  if(deleteBtn){

    const groupName = deleteBtn.dataset.group;

    const confirmDelete = confirm(`Delete group "${groupName}"?`);

    if(!confirmDelete) return;

    deleteGroup(groupName);
    return;
  }

  // 👉 SELECT GROUP
  const selectedGroup = e.target.dataset.group;
  if(!selectedGroup) return;

  currentGroup = selectedGroup;

  document.querySelectorAll(".group-item").forEach(el => {
    el.classList.remove("active-group");
  });

  document.getElementById("allTask").classList.remove("active-group");

  e.target.classList.add("active-group");

  applyFilter();

});

// SEARCH
searchInput.addEventListener("input", function(){
  const text = searchInput.value.toLowerCase();
  const filtered = tasks.filter(t => t.title.toLowerCase().includes(text));
  renderTasks(filtered);
});

// TASK ACTIONS
document.getElementById("task-container").addEventListener("click", function(e){

  const deleteBtn = e.target.closest("button");
  if(deleteBtn){
    deleteTask(Number(deleteBtn.dataset.id));
    return;
  }

  if(e.target.classList.contains("task-check")){
    toggleComplete(Number(e.target.dataset.id));
  }

});

// CLEAR COMPLETED
clearBtn.addEventListener("click", clearCompletedTasks);

// ================= CORE FUNCTIONS =================

function addTask(){

  const title = input.value.trim();
  if(!title) return;

  const dueDateInput = document.getElementById("due-date");
  const dueDate = dueDateInput.value;

  const newTask = {
    id: Date.now(),
    title,
    completed: false,
    group: currentGroup === "All" ? null : currentGroup,
    dueDate: dueDate || null
  };

  tasks.push(newTask);

  saveTasks();
  renderGroups();
  applyFilter();
  updateCounters();

  input.value = "";
  dueDateInput.value = "";   // clear date
}

function deleteTask(id){
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderGroups();
  applyFilter();
  updateCounters();
}

function toggleComplete(id){
  tasks = tasks.map(t =>
    t.id === id ? {...t, completed: !t.completed} : t
  );

  saveTasks();
  renderGroups();
  applyFilter();
  updateCounters();
}

function clearCompletedTasks(){
  tasks = tasks.filter(t => !t.completed);
  saveTasks();
  renderGroups();
  applyFilter();
  updateCounters();
}

function deleteGroup(groupName){

  groups = groups.filter(g => g !== groupName);

  tasks = tasks.map(task => {
    if(task.group === groupName){
      return { ...task, group: null };
    }
    return task;
  });

  saveGroups();
  saveTasks();

  // reset view
  currentGroup = "All";

  renderGroups();
  applyFilter();
  updateCounters();
}

// ================= RENDER =================

function renderTasks(data = tasks){

  const container = document.getElementById("task-container");
  container.innerHTML = "";

  data.forEach(task => {

    const div = document.createElement("div");
    div.classList.add("task-item");

    if(task.completed) div.classList.add("completed-task");

    div.innerHTML = `
  <div class="left-part">
    <input type="checkbox" class="task-check"
      data-id="${task.id}" ${task.completed ? "checked" : ""} />

    <span>${task.title}</span>

    ${task.group ? `<span class="task-group">${task.group}</span>` : ""}

    ${task.dueDate ? `<span class="task-date">${task.dueDate}</span>` : ""}
  </div>

  <button data-id="${task.id}">
    <i class="fa-solid fa-trash"></i>
  </button>
`;

    container.appendChild(div);
  });
}

function renderGroups(){

  groupList.innerHTML = "";

  groups.forEach(group => {

    const count = tasks.filter(t => t.group === group).length;

    const div = document.createElement("div");
    div.classList.add("group-item");
    div.dataset.group = group;

    div.innerHTML = `
      <span>${group}</span>
      <span class="group-count">${count}</span>
      <button class="delete-group-btn" data-group="${group}">
        <i class="fa-solid fa-trash"></i>
      </button>
    `;

    groupList.appendChild(div);
  });
}

// ================= FILTER =================

function applyFilter(){

  let filtered = tasks;

  // 👉 Status filter first
  if(currentFilter === "active"){
    filtered = filtered.filter(t => !t.completed);
  }
  else if(currentFilter === "completed"){
    filtered = filtered.filter(t => t.completed);
  }

  if(currentFilter !== "all" && currentGroup !== "All"){
    filtered = filtered.filter(t => t.group === currentGroup);
  }
  else if(currentFilter === "today"){
  const today = new Date().toISOString().split("T")[0];
  filtered = filtered.filter(t => t.dueDate === today);
}

  renderTasks(filtered);
  updateHeaderTitle();
}
const filterBtn = document.querySelector(".Main1-filter");
const filterOptions = document.getElementById("filter-options");

filterBtn.addEventListener("click", function(e){
  e.stopPropagation();
  filterOptions.classList.toggle("hidden");

  currentGroup = "All";
  if(selected === "all"){
  currentGroup = "All";

  document.querySelectorAll(".group-item").forEach(el=>{
    el.classList.remove("active-group");
  });

  document.getElementById("allTask").classList.add("active-group");
}
});

filterOptions.addEventListener("click", function(e){

  const option = e.target.closest("[data-filter]");
  if(!option) return;

  const selected = option.dataset.filter;

  console.log("Selected filter:", selected);

  currentFilter = selected;

  applyFilter();

  filterOptions.classList.add("hidden");

});

document.addEventListener("click", function(e){
  if(!filterBtn.contains(e.target) && !filterOptions.contains(e.target)){
    filterOptions.classList.add("hidden");
  }
});

function updateHeaderTitle(){

  const titleEl = document.getElementById("Main1-task");
  if(!titleEl) return;

  let title = "All Tasks";

  if(currentGroup !== "All"){
    title = currentGroup;
  }

  if(currentFilter === "completed"){
    title += " (Completed)";
  }
  else if(currentFilter === "active"){
    title += " (Active)";
  }

  titleEl.textContent = title;

}

groupList.addEventListener("click", function(e){

  const selectedGroup = e.target.dataset.group;
  if(!selectedGroup) return;

  currentGroup = selectedGroup;

  document.querySelectorAll(".group-item").forEach(el => {
    el.classList.remove("active-group");
  });

  document.getElementById("allTask").classList.remove("active-group");

  // add active to clicked group
  e.target.classList.add("active-group");

  applyFilter();

});

// ================= STORAGE =================

function saveTasks(){
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function saveGroups(){
  localStorage.setItem("groups", JSON.stringify(groups));
}

// ================= COUNTERS =================

function updateCounters(){

  const allEl = document.getElementById("p2");
  const todayEl = document.getElementById("dated-count");

  if(!allEl || !todayEl) return;

  const today = new Date().toISOString().split("T")[0];

const todayTasks = tasks.filter(t => t.dueDate === today);

  allEl.textContent = tasks.length;
  todayEl.textContent = todayTasks.length;

  if(clearBtn){
    clearBtn.style.display = tasks.some(t => t.completed)
      ? "inline-block"
      : "none";
  }
}

// ================= INIT =================

document.getElementById("allTask").classList.add("active-group");
renderGroups();
applyFilter();
updateCounters();
updateHeaderTitle();