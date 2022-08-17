let db; // global db
const firstNameInput = document.getElementById("firstName");
const lastNameInput = document.getElementById("lasttName");
const form = document.querySelector(".new-contact");
const list = document.querySelector("ul");

window.onload = () => {
  let request = window.indexedDB.open("contacts", 1);

  request.onerror = () => {
    alert("DataBase Failed to Open!");
  };

  request.onsuccess = () => {
    db = request.result;
    displayData();
  };

  // schema
  request.onupgradeneeded = (e) => {
    let db = e.target.result;

    let objectStore = db.createObjectStore("contacts", {
      keyPath: "id",
      autoIncrement: true, // auto set id value
    });
    objectStore.createIndex("firstName", "firstName", { unique: false });
    objectStore.createIndex("lastName", "lastName", { unique: false });
  };
};

function addData(e) {
  e.preventDefault();
  let newItem = {
    firstName: firstNameInput.value,
    lastName: lastNameInput.value,
  };

  let transaction = db.transaction(["contacts"], "readwrite"); // global db
  let request = transaction.objectStore("contacts").add(newItem);

  request.onsuccess = () => {
    firstNameInput.value = "";
    lastNameInput.value = "";
    firstNameInput.focus();
  };

  transaction.oncomplete = () => {
    displayData();
  };

  transaction.onerror = () => {
    alert("Error!");
  };
}
form.addEventListener("submit", addData);

function displayData() {
  while (list.firstChild) {
    list.removeChild(list.firstChild);
  }

  let objectStore = db.transaction("contacts").objectStore("contacts");
  objectStore.openCursor().onsuccess = (e) => {
    let cursor = e.target.result;

    if (cursor) {
      let listItem = document.createElement("li");
      let first = document.createElement("p");
      let last = document.createElement("p");
      let deleteButton = document.createElement("button");

      first.textContent = cursor.value.firstName;
      last.textContent = cursor.value.lastName;
      deleteButton.textContent = "Delete";
      deleteButton.addEventListener("click", deleteObjet);

      listItem.appendChild(first);
      listItem.appendChild(last);
      listItem.appendChild(deleteButton);

      list.appendChild(listItem);

      listItem.setAttribute("data-contact-id", cursor.value.id);
      cursor.continue();
    } else {
      if (!list.firstChild) {
        let listItem = document.createElement("li");
        listItem.textContent = "There is nothing to show!";
        list.appendChild(listItem);
      }
    }
  };
}

function deleteObjet(e) {
  let contactId = Number(
    e.target.parentElement.getAttribute("data-contact-id")
  );

  let transaction = db.transaction(["contacts"], "readwrite");
  transaction.objectStore("contacts").delete(contactId);

  transaction.oncomplete = () => {
    list.removeChild(e.target.parentElement);
    displayData();
  };
}
