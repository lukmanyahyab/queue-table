var q = 1; // NUMBERING THE QUEUE

// ADD ROWS FROM LOCALSTORAGE WHEN PAGE READY
$(document).ready(() => {
  // LOOPING THE LOCALSTORAGE
  for (let i = 1; i <= localStorage.length; i++) {
    let patientName = capitalize(localStorage[i].split(",")[0]); // GET NAME FROM LOCALSTORAGE
    let status = localStorage[i].split(",")[1]; // GET STATUS FROM LOCALSTORAGE

    addRow(patientName, status); // ADD ROW FROM LOCALSTORAGE
    q++; // INCREMENT THE QUEUE EVERY LOOP
  }
});

$("#inputButton").on("click", () => patientInput()); // INPUT WITH MOUSE CLICK
$("#patientInput").on("keypress", (e) => (e.which == 13 ? patientInput() : "")); // INPUT WITH ENTER

// DATE
const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const date = new Date();
$("#date").append(` ${date.getDate()} ${month[date.getMonth()]} ${date.getFullYear()}`);

// DELETE ALL BUTTON
$("#deleteAllButton").on("click", function () {
  // SWEETALERT2 CONFIRM DIALOG
  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete all!",
    cancelButtonText: "Cancel",
  }).then((result) => {
    // IF CONFIRMED
    if (result.isConfirmed) {
      $("#records tr").remove(); // REMOVE ALL ROWS
      localStorage.clear(); // CLEAR THE LOCALSTORAGE
      q = 1; // SET THE QUEUE BACK TO 1
      notification("All patient data has been deleted", "delete"); // DELETE NOTIFICATION
    }
  });
});

// ROW HOVER - WHEN MOUSE ENTER
$("#records").on("mouseenter", "tr", function () {
  $(this).css("background-color", "var(--dark-table-hover)");
});

// ROW HOVER - WHEN MOUSE LEAVE
$("#records").on("mouseleave", "tr", function () {
  $(this).css("background-color", "var(--dark)");
});

// STATUS COLUMN
$("#records").on("click", ".statusCol > *", function () {
  // DISABLE ON CLICK, UN-DISABLE OTHER
  $(this).siblings().attr("disabled", false);
  $(this).attr("disabled", true);

  let row = $(this).parents("tr"); // CURRENT ROW
  let queue = row.find(".qCol").text(); // QUEUE NUMBER
  let name = row.find(".nameCol").text(); // PATIENT NAME

  localStorage.setItem(queue, [name, $(this).attr("name")]); // UPDATE STATUS ON LOCALSTORAGE

  // IF THE "DONE" BUTTON CLICKED, APPEND CHECKLIST ON NAME COLUMN, ELSE REMOVE CHECKLIST
  if ($(this).attr("name") != "Done") row.find(".nameCol i").remove();
  else row.find(".nameCol").append('<i class="fa-solid fa-check fa-lg"></i>');
});

// MOVE COLUMN
$("#records").on("click", ".moveCol > *", function () {
  let row = $(this).closest("tr"); // CURRENT ROW
  let queueCol = row.find(".qCol"); // CURRENT QUEUE COLUMN
  let firstRow = queueCol.text() == 1; // FIRST ROW CHECK
  let lastRow = queueCol.text() == localStorage.length; // LAST ROW CHECK

  if ($(this).hasClass("upButton") && !firstRow) moveUp(row, queueCol); // UP BUTTON AND NOT FIRST ROW
  if ($(this).hasClass("downButton") && !lastRow) moveDown(row, queueCol); // DOWN BUTTON AND NOT LAST ROW
});

//////////////////////////////////////////// HELPER FUNCTIONS /////////////////////////////////////////////
// ADD ROW FUNCTION
const addRow = (patientName, status) => {
  $("#records").append(`
      <tr class="record">
        <td class="qCol">${q}</td>
        <td class="nameCol">${patientName}${status == "Done" ? '<i class="fa-solid fa-check fa-lg"></i>' : ""}</td>
        <td class="statusCol">
          <button class="waitingButton" ${status == "Waiting" ? "disabled" : ""} name="Waiting">Waiting</button>
          <button class="processButton" ${status == "Process" ? "disabled" : ""} name="Process">Process</button>
          <button class="doneButton" ${status == "Done" ? "disabled" : ""} name="Done">Done</button>
        </td>
        <td class="moveCol">
          <button class="upButton"><i class="fa-solid fa-arrow-up"></i></button>
          <button class="downButton"><i class="fa-solid fa-arrow-down"></i></button>
        </td>
        <td class="actionCol">
          <button class="editButton">Edit Name</button>
          <button class="deleteButton">Delete</button>
        </td>
      </tr>`);
};

// PATIENT INPUT FUNCTION
const patientInput = () => {
  let patientName = capitalize($("#patientInput").val()); // GET PATIENT NAME FROM INPUT
  let status = "Waiting"; // DECLARE DEFAULT STATUS "WAITING"

  addRow(patientName, status); // ADD NEW ROW
  $("tr:last").animate({ opacity: "0.1" }, 500).animate({ opacity: "1" }, 500); // NEW ROW ANIMATE
  localStorage.setItem(q++, [$("#patientInput").val(), "Waiting"]); // SAVE DATA ON LOCALSTORAGE
  notification("Patient data has been added", "add"); // NOTIFICATION MESSAGE
  $("#patientInput").val(""); // EMPTYING THE INPUT
};

// ROW MOVE UP FUNCTION
const moveUp = (row, queueCol, duration = 150) => {
  let prevQueueCol = row.prev().find(".qCol"); // PREVIOUS QUEUE COLUMN
  row.prev().before(row); // INSERT CURRENT ROW TO BEFORE PREVIOUS ROW
  row.animate({ opacity: "0.3" }, duration).animate({ opacity: "1" }, duration); // ANIMATE WHEN MOVE

  // MAKE CONTAINER VARIABLE FOR CURRENT AND PREVIOUS QUEUE AND SWAP THE VALUE
  let [queue, prevQueue] = [queueCol.text(), prevQueueCol.text()];
  queueCol.text(prevQueue);
  prevQueueCol.text(queue);
  // MAKE CONTAINER VARIABLE FOR CURRENT AND PREVIOUS QUEUE VALUE FROM LOCALSTORAGE AND SWAP THE VALUE
  let [queueValue, prevQueueValue] = [localStorage.getItem(queue), localStorage.getItem(prevQueue)];
  localStorage.setItem(queue, prevQueueValue);
  localStorage.setItem(prevQueue, queueValue);
};

// ROW MOVE DOWN FUNCTION
const moveDown = (row, queueCol, duration = 150) => {
  let nextQueueCol = row.next().find(".qCol"); // NEXT QUEUE COLUMN
  row.next().after(row); // INSERT CURRENT ROW TO AFTER NEXT ROW
  row.animate({ opacity: "0.3" }, duration).animate({ opacity: "1" }, duration); // ANIMATE WHEN MOVE

  // MAKE CONTAINER VARIABLE FOR CURRENT AND NEXT QUEUE AND SWAP THE VALUE
  let [queue, nextQueue] = [queueCol.text(), nextQueueCol.text()];
  queueCol.text(nextQueue);
  nextQueueCol.text(queue);
  // MAKE CONTAINER VARIABLE FOR CURRENT AND NEXT QUEUE VALUE FROM LOCALSTORAGE AND SWAP THE VALUE
  let [queueValue, nextQueueValue] = [localStorage.getItem(queue), localStorage.getItem(nextQueue)];
  localStorage.setItem(queue, nextQueueValue);
  localStorage.setItem(nextQueue, queueValue);
};

// NOTIFICATION FUNCTION
const notification = (message, type) => {
  if (type == "add") {
    $("#notification").text(message).css({ color: "rgb(49, 102, 77)", "background-color": "rgb(209, 231, 221)", border: "3px solid rgb(190, 221, 207)" }).animate({ top: "5%" }, 500);
  } else {
    $("#notification").text(message).css({ color: "rgb(132, 32, 41)", "background-color": "rgb(248, 215, 218)", border: "3px solid rgb(244, 204, 208)" }).animate({ top: "5%" }, 500);
  }
  setTimeout(() => $("#notification").animate({ top: "-10%" }, 500), 2000);
};

// CAPITALIZE FUNCTION
const capitalize = (strings) => {
  return strings
    .split(" ")
    .map((string) => string[0].toUpperCase() + string.slice(1).toLowerCase())
    .join(" ");
};
